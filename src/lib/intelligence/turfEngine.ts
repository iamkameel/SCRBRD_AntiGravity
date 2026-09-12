/**
 * SCRBRD Turf Management & Facility Booking Engine
 * ================================================
 * Pure logic for the school-wide grounds view: turf health scoring, booking
 * conflict detection, fixture↔booking reconciliation, pitch-prep countdowns,
 * wear-balanced pitch allocation and week-grid helpers.
 *
 * No I/O — facilityEngineService loads data, FacilityCommandCenter renders.
 */

import type { Field } from '@/types/firestore';
import type { GroundStatusLog, MaintenanceTask } from '@/types/schema_v4';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type BookingType = 'Match' | 'Practice' | 'Maintenance' | 'Event';
export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled';

/** Bookings from both stores (fields/{id}/bookings and facility_bookings) normalised to one shape. */
export interface UnifiedBooking {
    id: string;
    fieldId: string;
    date: string;        // YYYY-MM-DD (local)
    startTime: string;   // HH:mm
    endTime: string;     // HH:mm
    title: string;
    type: BookingType;
    status: BookingStatus;
    organizer?: string;
    source: 'field' | 'facility' | 'fixture';
    fixtureId?: string;
}

export interface FixtureSlot {
    matchId: string;
    fieldId: string | null;
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    homeTeamId?: string;
    format?: string;
}

export interface TurfFactor {
    key: string;
    label: string;
    score: number;   // 0-100
    weight: number;  // fraction of total
    note: string;
}

export interface TurfHealth {
    fieldId: string;
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    label: string;
    factors: TurfFactor[];
    risks: string[];
    latestLog: GroundStatusLog | null;
    daysSinceLog: number | null;
    bookingsLast7: number;
}

export interface BookingConflict {
    id: string;
    fieldId: string;
    date: string;
    kind: 'OVERLAP' | 'MAINTENANCE_DURING_MATCH' | 'DOUBLE_MATCH';
    a: UnifiedBooking;
    b: UnifiedBooking;
    overlapMinutes: number;
    severity: 'HIGH' | 'MEDIUM';
}

export interface PrepTask {
    key: string;
    label: string;
    taskType: MaintenanceTask['taskType'];
    offsetDays: number;      // days before the fixture
    dueDate: string;         // YYYY-MM-DD
    status: 'DONE' | 'DUE_TODAY' | 'OVERDUE' | 'UPCOMING';
}

export interface PrepSchedule {
    fixture: FixtureSlot;
    fieldId: string;
    tasks: PrepTask[];
    completion: number;      // 0-100
    overdueCount: number;
}

export interface AllocationRecommendation {
    fixture: FixtureSlot;
    recommendedFieldId: string | null;
    reason: string;
    alternatives: { fieldId: string; score: number; reason: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Date / time helpers
// ─────────────────────────────────────────────────────────────────────────────

export function timeToMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(min: number): string {
    const m = Math.max(0, Math.round(min));
    return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function toDateKey(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function addDays(key: string, days: number): string {
    const [y, m, d] = key.split('-').map(Number);
    const dt = new Date(y, m - 1, d + days);
    return toDateKey(dt);
}

export function daysBetween(a: string, b: string): number {
    const [ay, am, ad] = a.split('-').map(Number);
    const [by, bm, bd] = b.split('-').map(Number);
    return Math.round((new Date(by, bm - 1, bd).getTime() - new Date(ay, am - 1, ad).getTime()) / 86_400_000);
}

/** Monday-start week containing `key`. */
export function weekOf(key: string): string[] {
    const [y, m, d] = key.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    const dow = (dt.getDay() + 6) % 7; // Mon=0
    const monday = addDays(key, -dow);
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

export function overlapMinutes(aStart: string, aEnd: string, bStart: string, bEnd: string): number {
    const s = Math.max(timeToMinutes(aStart), timeToMinutes(bStart));
    const e = Math.min(timeToMinutes(aEnd), timeToMinutes(bEnd));
    return Math.max(0, e - s);
}

// ─────────────────────────────────────────────────────────────────────────────
// Turf health
// ─────────────────────────────────────────────────────────────────────────────

const CONDITION_SCORE: Record<GroundStatusLog['conditionStatus'], number> = {
    Excellent: 100, Good: 85, Fair: 65, Poor: 40, Unplayable: 0,
};

function moistureScore(pct: number | undefined): { score: number; note: string } {
    if (pct === undefined || pct === null) return { score: 70, note: 'No moisture reading' };
    if (pct >= 12 && pct <= 22) return { score: 100, note: `${pct}% — in the 12–22% window` };
    const dist = pct < 12 ? 12 - pct : pct - 22;
    return { score: Math.max(0, 100 - dist * 5), note: pct < 12 ? `${pct}% — drying out, irrigate` : `${pct}% — saturated, hold rolling` };
}

function freshnessScore(days: number | null): { score: number; note: string } {
    if (days === null) return { score: 25, note: 'No ground log on record' };
    if (days <= 1) return { score: 100, note: 'Logged today' };
    if (days <= 3) return { score: 85, note: `Logged ${days} days ago` };
    if (days <= 7) return { score: 60, note: `Logged ${days} days ago — re-inspect` };
    return { score: 30, note: `Log is ${days} days old — stale` };
}

function wearScore(bookingsLast7: number): { score: number; note: string } {
    if (bookingsLast7 <= 2) return { score: 100, note: `${bookingsLast7} sessions in 7 days` };
    if (bookingsLast7 === 3) return { score: 85, note: '3 sessions in 7 days' };
    if (bookingsLast7 === 4) return { score: 70, note: '4 sessions in 7 days — heavy' };
    return { score: 50, note: `${bookingsLast7} sessions in 7 days — rest needed` };
}

export function gradeFor(score: number): TurfHealth['grade'] {
    return score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 65 ? 'C' : score >= 50 ? 'D' : 'F';
}

export function computeTurfHealth(
    field: Pick<Field, 'id' | 'name' | 'surfaceConditionRating'>,
    logsDesc: GroundStatusLog[],
    bookingsLast7: number,
    todayKey: string
): TurfHealth {
    const latest = logsDesc[0] ?? null;
    const daysSinceLog = latest ? Math.max(0, daysBetween(String(latest.loggedAt).slice(0, 10), todayKey)) : null;

    const cond = latest ? CONDITION_SCORE[latest.conditionStatus] ?? 65 : (field.surfaceConditionRating ? field.surfaceConditionRating * 20 : 60);
    const moisture = moistureScore(latest?.moistureLevel);
    const fresh = freshnessScore(daysSinceLog);
    const wear = wearScore(bookingsLast7);

    const factors: TurfFactor[] = [
        { key: 'condition', label: 'Surface condition', score: cond, weight: 0.30, note: latest ? latest.conditionStatus : 'From field rating' },
        { key: 'pitch', label: 'Pitch readiness', score: latest?.pitchReadiness ?? 60, weight: 0.20, note: latest ? `${latest.pitchReadiness}% logged` : 'Assumed 60%' },
        { key: 'outfield', label: 'Outfield readiness', score: latest?.outfieldReadiness ?? 60, weight: 0.15, note: latest ? `${latest.outfieldReadiness}% logged` : 'Assumed 60%' },
        { key: 'grass', label: 'Grass cover', score: latest?.grassCover ?? 75, weight: 0.05, note: latest?.grassCover !== undefined ? `${latest.grassCover}% cover` : 'No reading' },
        { key: 'moisture', label: 'Moisture', score: moisture.score, weight: 0.10, note: moisture.note },
        { key: 'freshness', label: 'Inspection freshness', score: fresh.score, weight: 0.10, note: fresh.note },
        { key: 'wear', label: 'Wear load', score: wear.score, weight: 0.10, note: wear.note },
    ];

    const score = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0));
    const grade = gradeFor(score);

    const risks: string[] = [];
    if (!latest) risks.push('No ground status log — inspect before allocating fixtures');
    if (latest?.conditionStatus === 'Unplayable') risks.push('Marked unplayable');
    if (latest?.conditionStatus === 'Poor') risks.push('Surface rated poor');
    if (daysSinceLog !== null && daysSinceLog > 7) risks.push('Inspection overdue');
    if (moisture.score < 60) risks.push(moisture.note);
    if (bookingsLast7 >= 5) risks.push('Over-used this week — schedule rest');
    if ((latest?.equipmentReadiness ?? 100) < 60) risks.push('Equipment readiness below 60%');

    const label = grade === 'A' ? 'Match ready' : grade === 'B' ? 'Good' : grade === 'C' ? 'Playable — monitor' : grade === 'D' ? 'Marginal' : 'Not fit for play';

    return { fieldId: field.id, score, grade, label, factors, risks, latestLog: latest, daysSinceLog, bookingsLast7 };
}

// ─────────────────────────────────────────────────────────────────────────────
// Booking conflicts & fixture reconciliation
// ─────────────────────────────────────────────────────────────────────────────

export function detectBookingConflicts(bookings: UnifiedBooking[]): BookingConflict[] {
    const active = bookings.filter(b => b.status !== 'Cancelled');
    const byKey = new Map<string, UnifiedBooking[]>();
    active.forEach(b => {
        const k = `${b.fieldId}|${b.date}`;
        byKey.set(k, [...(byKey.get(k) ?? []), b]);
    });

    const out: BookingConflict[] = [];
    for (const list of byKey.values()) {
        const sorted = [...list].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
        for (let i = 0; i < sorted.length; i++) {
            for (let j = i + 1; j < sorted.length; j++) {
                const a = sorted[i], b = sorted[j];
                const ov = overlapMinutes(a.startTime, a.endTime, b.startTime, b.endTime);
                if (ov <= 0) continue;
                const matchCount = [a, b].filter(x => x.type === 'Match').length;
                const hasMaint = a.type === 'Maintenance' || b.type === 'Maintenance';
                const kind: BookingConflict['kind'] = matchCount === 2 ? 'DOUBLE_MATCH' : matchCount === 1 && hasMaint ? 'MAINTENANCE_DURING_MATCH' : 'OVERLAP';
                out.push({
                    id: `${a.id}~${b.id}`,
                    fieldId: a.fieldId,
                    date: a.date,
                    kind,
                    a, b,
                    overlapMinutes: ov,
                    severity: kind === 'OVERLAP' && matchCount === 0 ? 'MEDIUM' : 'HIGH',
                });
            }
        }
    }
    return out.sort((x, y) => x.date.localeCompare(y.date) || timeToMinutes(x.a.startTime) - timeToMinutes(y.a.startTime));
}

/** Fixtures that have a field but no Match booking covering their window. */
export function findUnbookedFixtures(fixtures: FixtureSlot[], bookings: UnifiedBooking[]): FixtureSlot[] {
    return fixtures.filter(f => {
        if (!f.fieldId) return false;
        return !bookings.some(b =>
            b.fieldId === f.fieldId && b.date === f.date && b.status !== 'Cancelled' &&
            (b.fixtureId === f.matchId || (b.type === 'Match' && overlapMinutes(b.startTime, b.endTime, f.startTime, f.endTime) > 0))
        );
    });
}

/** Turn a fixture into the booking that would reserve its window. */
export function bookingForFixture(f: FixtureSlot, fieldId = f.fieldId): Omit<UnifiedBooking, 'id'> | null {
    if (!fieldId) return null;
    return {
        fieldId, date: f.date, startTime: f.startTime, endTime: f.endTime,
        title: f.title, type: 'Match', status: 'Confirmed', organizer: 'Fixtures', source: 'fixture', fixtureId: f.matchId,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pitch preparation countdown
// ─────────────────────────────────────────────────────────────────────────────

export const PREP_TEMPLATE: Array<Pick<PrepTask, 'key' | 'label' | 'taskType' | 'offsetDays'>> = [
    { key: 'fertilise', label: 'Fertilise & top-dress square', taskType: 'Fertilizing', offsetDays: 10 },
    { key: 'mow-7', label: 'Outfield & square mow to 12 mm', taskType: 'Mowing', offsetDays: 7 },
    { key: 'water', label: 'Deep-water pitch, then dry-down', taskType: 'Watering', offsetDays: 5 },
    { key: 'roll', label: 'Heavy roller sessions (2 × 45 min)', taskType: 'Rolling', offsetDays: 3 },
    { key: 'mow-2', label: 'Final pitch mow & brush', taskType: 'Mowing', offsetDays: 2 },
    { key: 'mark', label: 'Crease, boundary & 30-yard marking', taskType: 'Marking', offsetDays: 1 },
    { key: 'covers', label: 'Covers on, sightscreens set, stumps bored', taskType: 'Other', offsetDays: 0 },
];

/** Synthetic surfaces skip the agronomy steps. */
function templateFor(pitchType?: string | null) {
    const synthetic = /astro|artificial|synthetic|matting|concrete|indoor/i.test(pitchType ?? '');
    return synthetic ? PREP_TEMPLATE.filter(t => ['mark', 'covers'].includes(t.key)) : PREP_TEMPLATE;
}

export function buildPrepSchedule(
    fixture: FixtureSlot,
    field: Pick<Field, 'id' | 'pitchType'>,
    completedTasks: MaintenanceTask[],
    todayKey: string
): PrepSchedule {
    const tasks: PrepTask[] = templateFor(field.pitchType).map(t => {
        const dueDate = addDays(fixture.date, -t.offsetDays);
        const windowStart = addDays(dueDate, -2);
        const done = completedTasks.some(m =>
            m.fieldId === field.id && m.status === 'COMPLETED' && m.taskType === t.taskType &&
            String(m.completedAt ?? m.updatedAt ?? '').slice(0, 10) >= windowStart &&
            String(m.completedAt ?? m.updatedAt ?? '').slice(0, 10) <= fixture.date
        );
        const delta = daysBetween(todayKey, dueDate);
        const status: PrepTask['status'] = done ? 'DONE' : delta < 0 ? 'OVERDUE' : delta === 0 ? 'DUE_TODAY' : 'UPCOMING';
        return { ...t, dueDate, status };
    });
    const doneCount = tasks.filter(t => t.status === 'DONE').length;
    return {
        fixture, fieldId: field.id, tasks,
        completion: tasks.length ? Math.round((doneCount / tasks.length) * 100) : 100,
        overdueCount: tasks.filter(t => t.status === 'OVERDUE').length,
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Wear-balanced pitch allocation
// ─────────────────────────────────────────────────────────────────────────────

export interface AllocationOptions {
    maxMatchesPerFieldPerWeek?: number;   // default 3
    minRestDaysBetweenMatches?: number;   // default 1
}

export function recommendPitchAllocation(
    fixtures: FixtureSlot[],
    fields: Array<Pick<Field, 'id' | 'name' | 'fieldSize' | 'floodlights'>>,
    health: Record<string, TurfHealth>,
    bookings: UnifiedBooking[],
    opts: AllocationOptions = {}
): AllocationRecommendation[] {
    const maxPerWeek = opts.maxMatchesPerFieldPerWeek ?? 3;
    const rest = opts.minRestDaysBetweenMatches ?? 1;
    const working = [...bookings.filter(b => b.status !== 'Cancelled')];
    const out: AllocationRecommendation[] = [];

    const sorted = [...fixtures].sort((a, b) => a.date.localeCompare(b.date) || timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    for (const f of sorted) {
        const week = new Set(weekOf(f.date));
        const candidates = fields.map(fld => {
            const h = health[fld.id];
            const reasons: string[] = [];
            let score = h?.score ?? 50;

            if (h && (h.grade === 'F' || h.latestLog?.conditionStatus === 'Unplayable')) return { fieldId: fld.id, score: -1, reason: 'Not fit for play' };

            const clash = working.some(b => b.fieldId === fld.id && b.date === f.date && overlapMinutes(b.startTime, b.endTime, f.startTime, f.endTime) > 0);
            if (clash) return { fieldId: fld.id, score: -1, reason: 'Already booked in that window' };

            const matchesThisWeek = working.filter(b => b.fieldId === fld.id && b.type === 'Match' && week.has(b.date)).length;
            if (matchesThisWeek >= maxPerWeek) return { fieldId: fld.id, score: -1, reason: `Already hosting ${matchesThisWeek} matches this week` };
            score -= matchesThisWeek * 8;
            if (matchesThisWeek) reasons.push(`${matchesThisWeek} match${matchesThisWeek > 1 ? 'es' : ''} this week`);

            const tooClose = working.some(b => b.fieldId === fld.id && b.type === 'Match' && Math.abs(daysBetween(b.date, f.date)) < rest && b.date !== f.date);
            if (tooClose) { score -= 15; reasons.push('match within rest window'); }

            if (fld.fieldSize === 'Training Area') { score -= 40; reasons.push('training area'); }
            if (timeToMinutes(f.endTime) > 18 * 60 && !fld.floodlights) { score -= 25; reasons.push('no floodlights for late finish'); }

            reasons.unshift(`turf ${h?.score ?? '?'} (${h?.grade ?? '-'})`);
            return { fieldId: fld.id, score, reason: reasons.join(' · ') };
        }).sort((a, b) => b.score - a.score);

        const best = candidates.find(c => c.score >= 0) ?? null;
        if (best) {
            // Reserve it so later fixtures see the load.
            working.push({ id: `tmp-${f.matchId}`, fieldId: best.fieldId, date: f.date, startTime: f.startTime, endTime: f.endTime, title: f.title, type: 'Match', status: 'Pending', source: 'fixture', fixtureId: f.matchId });
        }
        out.push({
            fixture: f,
            recommendedFieldId: best?.fieldId ?? null,
            reason: best ? best.reason : 'No field available — every ground is booked, over-used or unfit',
            alternatives: candidates.filter(c => c.fieldId !== best?.fieldId).slice(0, 3),
        });
    }
    return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Week grid helpers
// ─────────────────────────────────────────────────────────────────────────────

export function bookingsLast7Days(bookings: UnifiedBooking[], fieldId: string, todayKey: string): number {
    const from = addDays(todayKey, -7);
    return bookings.filter(b => b.fieldId === fieldId && b.status !== 'Cancelled' && b.date > from && b.date <= todayKey).length;
}

export function weekLoad(bookings: UnifiedBooking[], fieldId: string, days: string[]): { count: number; hours: number } {
    const set = new Set(days);
    const mine = bookings.filter(b => b.fieldId === fieldId && b.status !== 'Cancelled' && set.has(b.date));
    const hours = mine.reduce((s, b) => s + Math.max(0, timeToMinutes(b.endTime) - timeToMinutes(b.startTime)) / 60, 0);
    return { count: mine.length, hours: Math.round(hours * 10) / 10 };
}
