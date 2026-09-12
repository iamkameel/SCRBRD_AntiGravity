/**
 * Loads everything the Facility Command Center needs for one school and
 * normalises the two booking stores into UnifiedBooking.
 *
 *   fields                      → grounds owned by the school
 *   ground_status_logs          → latest inspections (both log shapes)
 *   fields/{id}/bookings        → per-field bookings (fieldBookingActions)
 *   facility_bookings           → cross-field bookings (facilityService)
 *   maintenance_tasks           → open + recently completed work
 *   matches                     → upcoming fixtures on these fields, and the
 *                                 school's home fixtures still without a field
 *
 * Falls back to a demo dataset when the school has no fields on record.
 */

import { collection, doc, getDocs, where, documentId, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { fetchCollection } from '@/lib/firestore';
import type { Field, Match, Team, School } from '@/types/firestore';
import type { GroundStatusLog, MaintenanceTask } from '@/types/schema_v4';
import { toDateKey, minutesToTime, timeToMinutes, addDays, type UnifiedBooking, type FixtureSlot } from '@/lib/intelligence/turfEngine';

export interface FacilitySnapshot {
    schoolId: string;
    fields: Field[];
    logsByField: Record<string, GroundStatusLog[]>; // newest first
    bookings: UnifiedBooking[];
    maintenance: MaintenanceTask[];
    fixtures: FixtureSlot[];          // have a fieldId in this school
    unallocatedFixtures: FixtureSlot[]; // school home fixtures with no field
    source: 'live' | 'fallback';
    generatedAt: string;
}

const IN_LIMIT = 30;
function chunk<T>(arr: T[], size = IN_LIMIT): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}
async function fetchWhereIn<T>(col: string, field: string, ids: string[]): Promise<T[]> {
    const u = Array.from(new Set(ids.filter(Boolean)));
    if (!u.length) return [];
    return (await Promise.all(chunk(u).map(c => fetchCollection<T>(col, [where(field, 'in', c)])))).flat();
}

function toDate(v: unknown): Date | null {
    if (!v) return null;
    if (v instanceof Date) return v;
    if (v instanceof Timestamp) return v.toDate();
    if (typeof v === 'object' && v && typeof (v as any).toDate === 'function') return (v as any).toDate();
    const d = new Date(v as string);
    return isNaN(d.getTime()) ? null : d;
}

function normaliseLog(raw: any): GroundStatusLog {
    const at = toDate(raw.loggedAt) ?? new Date(0);
    return {
        id: raw.id,
        fieldId: raw.fieldId,
        fixtureId: raw.fixtureId,
        conditionStatus: raw.conditionStatus ?? 'Fair',
        pitchReadiness: Number(raw.pitchReadiness ?? 60),
        outfieldReadiness: Number(raw.outfieldReadiness ?? 60),
        equipmentReadiness: typeof raw.equipmentReadiness === 'boolean' ? (raw.equipmentReadiness ? 100 : 40) : Number(raw.equipmentReadiness ?? 80),
        moistureLevel: raw.moistureLevel !== undefined ? Number(raw.moistureLevel) : undefined,
        grassCover: raw.grassCover !== undefined ? Number(raw.grassCover) : undefined,
        notes: raw.notes,
        loggedByPersonId: raw.loggedByPersonId ?? raw.loggedBy ?? 'unknown',
        loggedAt: at.toISOString(),
    };
}

function normaliseFieldBooking(fieldId: string, raw: any): UnifiedBooking | null {
    const d = toDate(raw.date);
    if (!d) return null;
    return {
        id: `fb:${fieldId}:${raw.id}`,
        fieldId,
        date: toDateKey(d),
        startTime: raw.startTime ?? '08:00',
        endTime: raw.endTime ?? '12:00',
        title: raw.title ?? 'Booking',
        type: raw.type ?? 'Event',
        status: raw.status ?? 'Confirmed',
        organizer: raw.organizer,
        source: 'field',
        fixtureId: raw.fixtureId ?? raw.relatedEntityId,
    };
}

function normaliseFacilityBooking(raw: any): UnifiedBooking | null {
    const s = toDate(raw.startTime), e = toDate(raw.endTime);
    if (!s || !e) return null;
    const pad = (n: number) => String(n).padStart(2, '0');
    return {
        id: `fc:${raw.id}`,
        fieldId: raw.fieldId,
        date: toDateKey(s),
        startTime: `${pad(s.getHours())}:${pad(s.getMinutes())}`,
        endTime: `${pad(e.getHours())}:${pad(e.getMinutes())}`,
        title: raw.purpose ?? 'Facility booking',
        type: raw.relatedEntityType === 'fixture' ? 'Match' : raw.relatedEntityType === 'training' ? 'Practice' : 'Event',
        status: raw.status ?? 'Confirmed',
        source: 'facility',
        fixtureId: raw.relatedEntityType === 'fixture' ? raw.relatedEntityId : undefined,
    };
}

function fixtureDurationMin(m: Match): number {
    const t = (m.matchType ?? '').toString();
    if (/T10/i.test(t)) return 120;
    if (/T20/i.test(t)) return 210;
    if (/2-day|Test/i.test(t)) return 8 * 60;
    if (m.overs && m.overs <= 20) return 210;
    return 7 * 60; // 50-over school day
}

function toFixtureSlot(m: Match, title: string): FixtureSlot | null {
    const d = toDate(m.matchDate);
    if (!d) return null;
    const start = d.getHours() * 60 + d.getMinutes() || 9 * 60;
    return {
        matchId: m.id,
        fieldId: m.fieldId ?? null,
        date: toDateKey(d),
        startTime: minutesToTime(start),
        endTime: minutesToTime(Math.min(23 * 60 + 59, start + fixtureDurationMin(m))),
        title,
        homeTeamId: m.homeTeamId,
        format: m.matchType,
    };
}

function isUpcoming(m: Match, todayKey: string, horizonDays: number): boolean {
    if (m.state === 'COMPLETED' || m.state === 'CANCELLED' || m.status === 'completed' || m.status === 'cancelled') return false;
    const d = toDate(m.matchDate);
    if (!d) return false;
    const k = toDateKey(d);
    return k >= todayKey && k <= addDays(todayKey, horizonDays);
}

// ─────────────────────────────────────────────────────────────────────────────

export const facilityEngineService = {
    async listSchools(): Promise<Pick<School, 'id' | 'name' | 'contactEmail'>[]> {
        const s = await fetchCollection<School>('schools');
        return s.map(x => ({ id: x.id, name: x.name, contactEmail: x.contactEmail })).sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    },

    async loadSnapshot(schoolId: string, horizonDays = 14): Promise<FacilitySnapshot> {
        const todayKey = toDateKey(new Date());
        try {
            let fields = await fetchCollection<Field>('fields', [where('schoolId', '==', schoolId)]);
            if (!fields.length) return buildFallbackSnapshot(schoolId);
            fields = fields.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            const fieldIds = fields.map(f => f.id);

            const [logsRaw, facilityRaw, perFieldRaw, maintenance, matchesOnFields, teams] = await Promise.all([
                fetchWhereIn<any>('ground_status_logs', 'fieldId', fieldIds),
                fetchWhereIn<any>('facility_bookings', 'fieldId', fieldIds),
                Promise.all(fieldIds.map(async id => {
                    try {
                        const snap = await getDocs(collection(db, 'fields', id, 'bookings'));
                        return snap.docs.map(d => normaliseFieldBooking(id, { id: d.id, ...d.data() })).filter(Boolean) as UnifiedBooking[];
                    } catch { return [] as UnifiedBooking[]; }
                })),
                fetchWhereIn<MaintenanceTask>('maintenance_tasks', 'fieldId', fieldIds),
                fetchWhereIn<Match>('matches', 'fieldId', fieldIds),
                fetchCollection<Team>('teams', [where('schoolId', '==', schoolId)]),
            ]);

            const logsByField: Record<string, GroundStatusLog[]> = {};
            logsRaw.map(normaliseLog).forEach(l => { (logsByField[l.fieldId] ??= []).push(l); });
            Object.values(logsByField).forEach(list => list.sort((a, b) => b.loggedAt.localeCompare(a.loggedAt)));

            const bookings = [...perFieldRaw.flat(), ...facilityRaw.map(normaliseFacilityBooking).filter(Boolean) as UnifiedBooking[]];

            // Fixtures: on our fields (any school) + our home fixtures without a field.
            const teamIds = teams.map(t => t.id);
            const teamName = new Map(teams.map(t => [t.id, t.name]));
            const homeNoField = teamIds.length
                ? (await fetchWhereIn<Match>('matches', 'homeTeamId', teamIds)).filter(m => !m.fieldId)
                : [];
            const titleOf = (m: Match) => `${teamName.get(m.homeTeamId) ?? m.homeTeamName ?? 'Home'} v ${teamName.get(m.awayTeamId) ?? m.awayTeamName ?? 'Away'}`;

            const fixtures = matchesOnFields.filter(m => isUpcoming(m, todayKey, horizonDays)).map(m => toFixtureSlot(m, titleOf(m))).filter(Boolean) as FixtureSlot[];
            const unallocatedFixtures = homeNoField.filter(m => isUpcoming(m, todayKey, horizonDays)).map(m => toFixtureSlot(m, titleOf(m))).filter(Boolean) as FixtureSlot[];

            return {
                schoolId, fields, logsByField, bookings, maintenance, fixtures, unallocatedFixtures,
                source: 'live', generatedAt: new Date().toISOString(),
            };
        } catch (err) {
            console.warn('[facilityEngineService] snapshot failed, using fallback:', err);
            return buildFallbackSnapshot(schoolId);
        }
    },

    /** Point a fixture at a field (the booking itself goes through createBookingAction). */
    async assignFixtureToField(matchId: string, fieldId: string): Promise<void> {
        await updateDoc(doc(db, 'matches', matchId), { fieldId, updatedAt: serverTimestamp() });
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Demo dataset
// ─────────────────────────────────────────────────────────────────────────────

export function buildFallbackSnapshot(schoolId: string): FacilitySnapshot {
    const today = toDateKey(new Date());
    const d = (n: number) => addDays(today, n);
    const now = new Date().toISOString();

    const fields: Field[] = [
        { id: 'demo-main', name: 'Main Oval (A-Field)', schoolId, pitchType: 'Natural Turf', fieldSize: 'Full Size', floodlights: true, capacity: 2500, pitchCount: 4, surfaceConditionRating: 5 } as Field,
        { id: 'demo-b', name: 'B-Oval', schoolId, pitchType: 'Natural Turf', fieldSize: 'Full Size', floodlights: false, capacity: 600, pitchCount: 2, surfaceConditionRating: 3 } as Field,
        { id: 'demo-astro', name: 'Astro Nets & Junior Field', schoolId, pitchType: 'Artificial Astro-Turf', fieldSize: 'Youth', floodlights: true, capacity: 200, pitchCount: 1, surfaceConditionRating: 4 } as Field,
        { id: 'demo-c', name: 'C-Field (Lower)', schoolId, pitchType: 'Natural Turf', fieldSize: 'Youth', floodlights: false, capacity: 150, pitchCount: 1, surfaceConditionRating: 2 } as Field,
    ];

    const logsByField: Record<string, GroundStatusLog[]> = {
        'demo-main': [{ id: 'l1', fieldId: 'demo-main', conditionStatus: 'Excellent', pitchReadiness: 94, outfieldReadiness: 90, equipmentReadiness: 95, moistureLevel: 15, grassCover: 96, loggedByPersonId: 'gk', loggedAt: `${today}T06:15:00.000Z`, notes: 'Pitch 4 rolled, covers off at 06:00.' }],
        'demo-b': [{ id: 'l2', fieldId: 'demo-b', conditionStatus: 'Fair', pitchReadiness: 68, outfieldReadiness: 72, equipmentReadiness: 80, moistureLevel: 27, grassCover: 78, loggedByPersonId: 'gk', loggedAt: `${d(-2)}T07:00:00.000Z`, notes: 'Wet square after overnight rain.' }],
        'demo-astro': [{ id: 'l3', fieldId: 'demo-astro', conditionStatus: 'Good', pitchReadiness: 90, outfieldReadiness: 88, equipmentReadiness: 70, moistureLevel: 5, grassCover: 100, loggedByPersonId: 'gk', loggedAt: `${d(-1)}T16:00:00.000Z` }],
        'demo-c': [{ id: 'l4', fieldId: 'demo-c', conditionStatus: 'Poor', pitchReadiness: 40, outfieldReadiness: 55, equipmentReadiness: 60, moistureLevel: 9, grassCover: 60, loggedByPersonId: 'gk', loggedAt: `${d(-9)}T08:00:00.000Z`, notes: 'Bare patches at the northern end.' }],
    };

    const b = (id: string, fieldId: string, date: string, startTime: string, endTime: string, title: string, type: UnifiedBooking['type'], extra: Partial<UnifiedBooking> = {}): UnifiedBooking =>
        ({ id, fieldId, date, startTime, endTime, title, type, status: 'Confirmed', source: 'field', ...extra });

    const bookings: UnifiedBooking[] = [
        b('bk1', 'demo-main', d(0), '09:00', '16:00', '1st XI v KES', 'Match', { fixtureId: 'demo-m1', organizer: 'Fixtures' }),
        b('bk2', 'demo-main', d(-3), '15:00', '17:30', '1st XI nets & fielding', 'Practice', { organizer: 'M. van Buuren' }),
        b('bk3', 'demo-main', d(-5), '15:00', '17:00', '2nd XI practice', 'Practice'),
        b('bk4', 'demo-main', d(2), '07:00', '10:00', 'Square renovation — verti-drain', 'Maintenance', { organizer: 'Grounds' }),
        b('bk5', 'demo-main', d(2), '09:00', '13:00', 'Old Boys T20', 'Event', { organizer: 'Alumni office' }),           // ← clashes with maintenance
        b('bk6', 'demo-b', d(0), '09:30', '16:30', '2nd XI v Jeppe', 'Match', { fixtureId: 'demo-m2' }),
        b('bk7', 'demo-b', d(-1), '15:00', '17:00', 'U15A practice', 'Practice'),
        b('bk8', 'demo-b', d(-4), '15:00', '17:00', 'U15B practice', 'Practice'),
        b('bk9', 'demo-b', d(-6), '15:00', '17:00', 'U14A practice', 'Practice'),
        b('bk10', 'demo-b', d(-2), '15:00', '17:00', 'U14B practice', 'Practice'),
        b('bk11', 'demo-astro', d(1), '14:00', '16:00', 'Junior coaching clinic', 'Event', { organizer: 'S. Adams' }),
        b('bk12', 'demo-astro', d(1), '15:00', '17:00', 'U13 practice', 'Practice'),                                    // ← overlap
        b('bk13', 'demo-astro', d(3), '08:00', '12:00', 'Carpet clean & infill top-up', 'Maintenance'),
    ];

    const maintenance: MaintenanceTask[] = [
        { id: 'mt1', fieldId: 'demo-b', title: 'Aerate & sand square after rain', taskType: 'Other', priority: 'High', dueDate: d(1), status: 'PENDING', createdAt: now, updatedAt: now },
        { id: 'mt2', fieldId: 'demo-c', title: 'Re-seed bare patches (north end)', taskType: 'Repair', priority: 'Urgent', dueDate: d(-2), status: 'IN_PROGRESS', createdAt: now, updatedAt: now },
        { id: 'mt3', fieldId: 'demo-main', title: 'Heavy roll pitch 4', taskType: 'Rolling', priority: 'High', dueDate: d(-1), status: 'COMPLETED', completedAt: `${d(-1)}T09:30:00.000Z`, createdAt: now, updatedAt: now },
        { id: 'mt4', fieldId: 'demo-main', title: 'Mark creases & boundary', taskType: 'Marking', priority: 'Medium', dueDate: d(0), status: 'COMPLETED', completedAt: `${d(0)}T06:00:00.000Z`, createdAt: now, updatedAt: now },
        { id: 'mt5', fieldId: 'demo-astro', title: 'Replace torn net panel (bay 2)', taskType: 'Repair', priority: 'Medium', dueDate: d(4), status: 'PENDING', createdAt: now, updatedAt: now },
        { id: 'mt6', fieldId: 'demo-main', title: 'Irrigation controller firmware', taskType: 'Other', priority: 'Low', dueDate: d(9), status: 'PENDING', createdAt: now, updatedAt: now },
    ];

    const fixtures: FixtureSlot[] = [
        { matchId: 'demo-m1', fieldId: 'demo-main', date: d(0), startTime: '09:00', endTime: '16:00', title: '1st XI v KES', format: '50-over' },
        { matchId: 'demo-m2', fieldId: 'demo-b', date: d(0), startTime: '09:30', endTime: '16:30', title: '2nd XI v Jeppe', format: '50-over' },
        { matchId: 'demo-m3', fieldId: 'demo-main', date: d(7), startTime: '09:00', endTime: '16:00', title: '1st XI v St John’s', format: '50-over' }, // ← no booking yet
        { matchId: 'demo-m4', fieldId: 'demo-astro', date: d(4), startTime: '14:00', endTime: '17:30', title: 'U13A v Pridwin', format: 'T20' },     // ← no booking yet
    ];

    const unallocatedFixtures: FixtureSlot[] = [
        { matchId: 'demo-m5', fieldId: null, date: d(7), startTime: '09:30', endTime: '16:30', title: 'U15A v Hilton', format: '50-over' },
        { matchId: 'demo-m6', fieldId: null, date: d(7), startTime: '14:00', endTime: '17:30', title: 'U14A v Bishops', format: 'T20' },
        { matchId: 'demo-m7', fieldId: null, date: d(8), startTime: '15:00', endTime: '18:30', title: '2nd XI v Parktown (T20, lights)', format: 'T20' },
    ];

    return { schoolId, fields, logsByField, bookings, maintenance, fixtures, unallocatedFixtures, source: 'fallback', generatedAt: now };
}

export { timeToMinutes };
