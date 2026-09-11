/**
 * SCRBRD Sports Director Executive Service
 * ========================================
 * Aggregates school-wide operational readiness for the Director Command Dashboard.
 *
 * Sources (all client-side Firestore, read-only unless noted):
 *   teams                     → squads belonging to the school
 *   matches                   → next fixture per squad, teamSelection, officials, results
 *   fixture_readiness_checks  → canonical per-fixture readiness layers (pre-match workflow)
 *   player_availability       → availability responses per fixture
 *   ground_status_logs        → latest pitch/outfield readiness per field (facilityService)
 *   transport_trips           → trips booked against fixtures (transportService)
 *   medical_incidents         → active injury / rehab restrictions (medicalService)
 *   people / coaches / umpires / scorers → name + contact resolution for staff
 *
 * Writes: matches.teamSelection.{side}.confirmedAt/By (squad approval),
 *         fixture_readiness_checks.squadReady, staff_broadcasts, audit_logs.
 *
 * When a school has no teams on record the MOCK_* dataset below is returned
 * with `source: 'fallback'` so the dashboard still renders (same pattern as the
 * Data Connect fallback registries in src/services/*).
 */

import {
    collection,
    doc,
    documentId,
    getDocs,
    query,
    where,
    updateDoc,
    addDoc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { fetchCollection } from '@/lib/firestore';
import type { Team, Match, Person, School, Field, Division } from '@/types/firestore';
import type { FixtureReadinessCheck, PlayerAvailability } from '@/types/schema_v4';
import { transportService, TransportTrip } from '@/lib/services/transportService';
import { facilityService, GroundReadinessLog } from '@/lib/services/facilityService';
import { medicalService, MedicalIncident } from '@/lib/services/medicalService';
import { recordAuditLog } from '@/lib/services/auditService';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SquadStatus = 'APPROVED' | 'PENDING_CONFIRMATION' | 'DRAFT';
export type GroundStatus = 'CLEARED' | 'PREP_IN_PROGRESS' | 'HOST_MANAGED' | 'UNASSIGNED';
export type TransportStatus = 'BOARDED' | 'BOOKED' | 'NOT_REQUIRED' | 'UNASSIGNED';

export interface TeamReadinessTelemetry {
    id: string;
    teamId: string;
    matchId: string;
    side: 'home' | 'away';
    teamName: string;
    division: string;
    opponent: string;
    fixtureDate: string;
    venue: string;
    squadStatus: SquadStatus;
    availabilityRate: number; // 0-100%
    groundStatus: GroundStatus;
    transportStatus: TransportStatus;
    staffAssigned: {
        headCoach: string;
        scorer: string;
        umpire: string;
    };
    medicalClearance: boolean;
    overallReadinessScore: number; // 0-100%
}

export interface StaffDutyAssignment {
    id: string;
    name: string;
    role: 'Head Coach' | 'Assistant Coach' | 'Scorer' | 'Umpire' | 'Groundskeeper' | 'Medical Officer';
    teamAssigned: string;
    contact: string;
    status: 'ON_DUTY' | 'STANDBY' | 'UNASSIGNED';
}

export interface WorkloadRiskAlert {
    id: string;
    playerId: string;
    playerName: string;
    teamName: string;
    role: string;
    riskType: 'BOWLING_OVERLOAD' | 'CONSECUTIVE_MATCHES' | 'INJURY_REHAB';
    details: string;
    currentWorkload: string;
    recommendedLimit: string;
    severity: 'HIGH' | 'MODERATE' | 'LOW';
}

export interface SchoolExecutiveMetrics {
    schoolName: string;
    season: string;
    totalActiveSquads: number;
    overallWinRate: number;
    seasonRecord: { wins: number; losses: number; draws: number };
    crossFixtureReadiness: number;
    clearedFixtures: number;
    totalFixtures: number;
    activeWorkloadAlerts: number;
    pendingApprovalsCount: number;
    totalPlayersRegistered: number;
}

export interface DirectorSnapshot {
    schoolId: string;
    metrics: SchoolExecutiveMetrics;
    readinessGrid: TeamReadinessTelemetry[];
    staffRoster: StaffDutyAssignment[];
    workloadAlerts: WorkloadRiskAlert[];
    source: 'live' | 'fallback';
    generatedAt: string;
}

export interface StaffBroadcastResult {
    recipientCount: number;
    outstandingItems: string[];
    broadcastId: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback dataset (used when a school has no teams on record)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_EXECUTIVE_METRICS: SchoolExecutiveMetrics = {
    schoolName: 'St Stithians College',
    season: '2025/26 Summer Season',
    totalActiveSquads: 6,
    overallWinRate: 78.5,
    seasonRecord: { wins: 28, losses: 7, draws: 1 },
    crossFixtureReadiness: 94,
    clearedFixtures: 5,
    totalFixtures: 6,
    activeWorkloadAlerts: 2,
    pendingApprovalsCount: 2,
    totalPlayersRegistered: 142,
};

export const MOCK_TEAM_READINESS_GRID: TeamReadinessTelemetry[] = [
    {
        id: 'tr-1', teamId: 'mock-team-1', matchId: 'mock-match-1', side: 'home',
        teamName: '1st XI Squad', division: 'Premier League',
        opponent: 'King Edward VII School (KES)', fixtureDate: 'Saturday, 09:00', venue: 'Main Oval (Turf 1)',
        squadStatus: 'APPROVED', availabilityRate: 100, groundStatus: 'CLEARED', transportStatus: 'NOT_REQUIRED',
        staffAssigned: { headCoach: 'Mark van Buuren', scorer: 'Dave Miller', umpire: 'Craig Evans' },
        medicalClearance: true, overallReadinessScore: 98,
    },
    {
        id: 'tr-2', teamId: 'mock-team-2', matchId: 'mock-match-2', side: 'home',
        teamName: '2nd XI Squad', division: 'Reserve League A',
        opponent: 'Jeppe High School for Boys', fixtureDate: 'Saturday, 09:30', venue: 'Oval 2 (Turf 2)',
        squadStatus: 'APPROVED', availabilityRate: 92, groundStatus: 'CLEARED', transportStatus: 'NOT_REQUIRED',
        staffAssigned: { headCoach: 'Peter Jacobs', scorer: 'Sarah Jenkins', umpire: 'Gary Bennett' },
        medicalClearance: true, overallReadinessScore: 94,
    },
    {
        id: 'tr-3', teamId: 'mock-team-3', matchId: 'mock-match-3', side: 'away',
        teamName: 'U15A Squad', division: 'Junior Premier A',
        opponent: 'Hilton College', fixtureDate: 'Saturday, 08:30', venue: 'Hilton Oval (Away)',
        squadStatus: 'PENDING_CONFIRMATION', availabilityRate: 85, groundStatus: 'HOST_MANAGED', transportStatus: 'BOARDED',
        staffAssigned: { headCoach: 'Grant Campbell', scorer: 'Mark Smith', umpire: 'Unassigned' },
        medicalClearance: false, overallReadinessScore: 82,
    },
    {
        id: 'tr-4', teamId: 'mock-team-4', matchId: 'mock-match-4', side: 'home',
        teamName: 'U15B Squad', division: 'Junior Division B',
        opponent: 'St John’s College', fixtureDate: 'Saturday, 10:00', venue: 'Oval 3 (Artificial)',
        squadStatus: 'APPROVED', availabilityRate: 100, groundStatus: 'PREP_IN_PROGRESS', transportStatus: 'NOT_REQUIRED',
        staffAssigned: { headCoach: 'James Wright', scorer: 'Tanya Ross', umpire: 'John Peters' },
        medicalClearance: true, overallReadinessScore: 90,
    },
    {
        id: 'tr-5', teamId: 'mock-team-5', matchId: 'mock-match-5', side: 'away',
        teamName: 'U14A Squad', division: 'Under 14 League A',
        opponent: 'Bishops Diocesan College', fixtureDate: 'Saturday, 09:00', venue: 'Dower Oval (Away)',
        squadStatus: 'PENDING_CONFIRMATION', availabilityRate: 91, groundStatus: 'HOST_MANAGED', transportStatus: 'BOOKED',
        staffAssigned: { headCoach: 'Sean Adams', scorer: 'Unassigned', umpire: 'Mike Davis' },
        medicalClearance: true, overallReadinessScore: 86,
    },
    {
        id: 'tr-6', teamId: 'mock-team-6', matchId: 'mock-match-6', side: 'home',
        teamName: 'U14B Squad', division: 'Under 14 League B',
        opponent: 'Pretoria Boys High', fixtureDate: 'Saturday, 11:00', venue: 'Junior Field 2',
        squadStatus: 'APPROVED', availabilityRate: 100, groundStatus: 'CLEARED', transportStatus: 'NOT_REQUIRED',
        staffAssigned: { headCoach: 'David Marais', scorer: 'Paul Botha', umpire: 'David Marais' },
        medicalClearance: true, overallReadinessScore: 95,
    },
];

export const MOCK_STAFF_ASSIGNMENTS: StaffDutyAssignment[] = [
    { id: 'st-1', name: 'Mark van Buuren', role: 'Head Coach', teamAssigned: '1st XI Squad', contact: '+27 82 451 9921', status: 'ON_DUTY' },
    { id: 'st-2', name: 'Grant Campbell', role: 'Head Coach', teamAssigned: 'U15A Squad', contact: '+27 83 112 4099', status: 'ON_DUTY' },
    { id: 'st-3', name: 'Dave Miller', role: 'Scorer', teamAssigned: '1st XI Squad', contact: '+27 71 884 1022', status: 'ON_DUTY' },
    { id: 'st-4', name: 'Thabo Ndlovu', role: 'Groundskeeper', teamAssigned: 'Main Oval (Turf 1)', contact: '+27 84 902 3311', status: 'ON_DUTY' },
    { id: 'st-5', name: 'Dr. Rebecca Vance', role: 'Medical Officer', teamAssigned: 'School-wide', contact: '+27 82 990 4112', status: 'STANDBY' },
];

export const MOCK_WORKLOAD_ALERTS: WorkloadRiskAlert[] = [
    {
        id: 'wk-1', playerId: 'p-101', playerName: 'Jaxon Reed', teamName: '1st XI Squad', role: 'Fast Bowler',
        riskType: 'BOWLING_OVERLOAD',
        details: 'Bowled 28 overs across 3 days. Approaching CSA U19 weekly maximum (30 overs).',
        currentWorkload: '28 overs / week', recommendedLimit: 'Max 6 overs on Saturday', severity: 'HIGH',
    },
    {
        id: 'wk-2', playerId: 'p-104', playerName: 'Ethan Miller', teamName: 'U15A Squad', role: 'Seam Bowler',
        riskType: 'INJURY_REHAB',
        details: 'Returning from lower back strain. Cleared for 4-over maximum spell.',
        currentWorkload: '4 overs max', recommendedLimit: 'Strict 4-over cap', severity: 'MODERATE',
    },
];

export function buildFallbackSnapshot(schoolId: string, schoolName?: string): DirectorSnapshot {
    return {
        schoolId,
        metrics: { ...MOCK_EXECUTIVE_METRICS, schoolName: schoolName || MOCK_EXECUTIVE_METRICS.schoolName },
        readinessGrid: MOCK_TEAM_READINESS_GRID,
        staffRoster: MOCK_STAFF_ASSIGNMENTS,
        workloadAlerts: MOCK_WORKLOAD_ALERTS,
        source: 'fallback',
        generatedAt: new Date().toISOString(),
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const IN_LIMIT = 30; // Firestore `in` operator cap

function chunk<T>(arr: T[], size = IN_LIMIT): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

/** Fetch docs by id across the `in` cap. Missing collections resolve to []. */
async function fetchByIds<T>(collectionName: string, ids: string[]): Promise<T[]> {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    if (unique.length === 0) return [];
    const results = await Promise.all(
        chunk(unique).map(c => fetchCollection<T>(collectionName, [where(documentId(), 'in', c)]))
    );
    return results.flat();
}

/** Fetch docs where `field` is in ids, across the `in` cap. */
async function fetchWhereIn<T>(collectionName: string, field: string, ids: string[]): Promise<T[]> {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    if (unique.length === 0) return [];
    const results = await Promise.all(
        chunk(unique).map(c => fetchCollection<T>(collectionName, [where(field, 'in', c)]))
    );
    return results.flat();
}

function toDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value instanceof Timestamp) return value.toDate();
    if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as any).toDate === 'function') {
        return (value as any).toDate();
    }
    if (typeof value === 'string' || typeof value === 'number') {
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
}

function formatFixtureDate(value: unknown): string {
    const d = toDate(value);
    if (!d) return 'TBC';
    const day = d.toLocaleDateString('en-ZA', { weekday: 'long' });
    const time = d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day}, ${time}`;
}

function personName(p?: Partial<Person> | null): string | null {
    if (!p) return null;
    if (p.displayName) return p.displayName;
    const full = [p.firstName, p.lastName].filter(Boolean).join(' ').trim();
    return full || null;
}

function personContact(p?: Partial<Person> & { phoneNumber?: string } | null): string {
    if (!p) return '—';
    return p.phone || p.phoneNumber || p.email || '—';
}

function isCompleted(m: Match): boolean {
    return m.state === 'COMPLETED' || m.status === 'completed';
}

function isVoided(m: Match): boolean {
    return m.state === 'CANCELLED' || m.state === 'POSTPONED' || m.status === 'cancelled' || m.status === 'postponed';
}

function currentSeasonLabel(now = new Date()): string {
    // SA school cricket summer season straddles the calendar year (Sep → Mar).
    const y = now.getFullYear();
    const startsThisYear = now.getMonth() >= 8; // Sep onwards
    const a = startsThisYear ? y : y - 1;
    return `${a}/${String(a + 1).slice(-2)} Summer Season`;
}

function isJuniorLabel(label: string): boolean {
    return /\bU-?1[0-6]\b/i.test(label);
}

/**
 * Resolve a set of person ids to lightweight records. Looks in `people` first,
 * then the legacy role collections so older fixtures still resolve.
 */
async function resolvePeople(ids: string[]): Promise<Map<string, Partial<Person> & { phoneNumber?: string }>> {
    const map = new Map<string, Partial<Person> & { phoneNumber?: string }>();
    const unique = Array.from(new Set(ids.filter(Boolean)));
    if (unique.length === 0) return map;

    const people = await fetchByIds<Person>('people', unique);
    people.forEach(p => map.set(p.id, p));

    const missing = unique.filter(id => !map.has(id));
    if (missing.length === 0) return map;

    const [coaches, umpires, scorers] = await Promise.all([
        fetchByIds<any>('coaches', missing),
        fetchByIds<any>('umpires', missing),
        fetchByIds<any>('scorers', missing),
    ]);
    [...coaches, ...umpires, ...scorers].forEach(p => { if (!map.has(p.id)) map.set(p.id, p); });
    return map;
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoring
// ─────────────────────────────────────────────────────────────────────────────

const WEIGHTS = { selection: 25, availability: 15, ground: 20, transport: 15, staff: 15, medical: 10 } as const;

function scoreRow(row: Omit<TeamReadinessTelemetry, 'overallReadinessScore'>): number {
    let score = 0;

    score += row.squadStatus === 'APPROVED' ? WEIGHTS.selection
        : row.squadStatus === 'PENDING_CONFIRMATION' ? WEIGHTS.selection * 0.6 : 0;

    score += WEIGHTS.availability * (Math.min(100, Math.max(0, row.availabilityRate)) / 100);

    score += row.groundStatus === 'CLEARED' || row.groundStatus === 'HOST_MANAGED' ? WEIGHTS.ground
        : row.groundStatus === 'PREP_IN_PROGRESS' ? WEIGHTS.ground * 0.6 : 0;

    score += row.transportStatus === 'UNASSIGNED' ? 0 : WEIGHTS.transport;

    const staffed = [row.staffAssigned.headCoach, row.staffAssigned.scorer, row.staffAssigned.umpire]
        .filter(s => s && s !== 'Unassigned').length;
    score += (WEIGHTS.staff / 3) * staffed;

    score += row.medicalClearance ? WEIGHTS.medical : 0;

    return Math.round(score);
}

// ─────────────────────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────────────────────

export const sportsDirectorService = {
    /** Schools available for the header selector. */
    async listSchools(): Promise<Pick<School, 'id' | 'name' | 'abbreviation' | 'contactEmail'>[]> {
        const schools = await fetchCollection<School>('schools');
        return schools
            .map(s => ({ id: s.id, name: s.name, abbreviation: s.abbreviation, contactEmail: s.contactEmail }))
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    },

    /**
     * Build the full executive snapshot for a school.
     * Never throws — degrades to the fallback dataset on error or empty data.
     */
    async getExecutiveSnapshot(schoolId: string, schoolName?: string): Promise<DirectorSnapshot> {
        try {
            const teams = await fetchCollection<Team>('teams', [where('schoolId', '==', schoolId)]);
            if (teams.length === 0) return buildFallbackSnapshot(schoolId, schoolName);

            const teamIds = teams.map(t => t.id);
            const teamById = new Map(teams.map(t => [t.id, t]));

            // ── Matches involving any of the school's squads ──
            const [homeMatches, awayMatches] = await Promise.all([
                fetchWhereIn<Match>('matches', 'homeTeamId', teamIds),
                fetchWhereIn<Match>('matches', 'awayTeamId', teamIds),
            ]);
            const matchById = new Map<string, Match>();
            [...homeMatches, ...awayMatches].forEach(m => matchById.set(m.id, m));
            const matches = Array.from(matchById.values());

            const now = Date.now();
            const graceMs = 6 * 60 * 60 * 1000; // keep today's earlier fixtures on the board
            const completed = matches.filter(isCompleted);
            const upcoming = matches
                .filter(m => !isCompleted(m) && !isVoided(m))
                .filter(m => {
                    const d = toDate(m.matchDate);
                    return !d || d.getTime() >= now - graceMs;
                })
                .sort((a, b) => (toDate(a.matchDate)?.getTime() ?? Infinity) - (toDate(b.matchDate)?.getTime() ?? Infinity));

            // Next fixture per squad
            const nextByTeam = new Map<string, { match: Match; side: 'home' | 'away' }>();
            for (const m of upcoming) {
                if (teamById.has(m.homeTeamId) && !nextByTeam.has(m.homeTeamId)) nextByTeam.set(m.homeTeamId, { match: m, side: 'home' });
                if (teamById.has(m.awayTeamId) && !nextByTeam.has(m.awayTeamId)) nextByTeam.set(m.awayTeamId, { match: m, side: 'away' });
            }
            const boardMatches = Array.from(new Set(Array.from(nextByTeam.values()).map(v => v.match)));
            const boardMatchIds = boardMatches.map(m => m.id);

            // ── Enrichment (all independent) ──
            const opponentIds = boardMatches.flatMap(m => [m.homeTeamId, m.awayTeamId]).filter(id => !teamById.has(id));
            const fieldIds = Array.from(new Set(boardMatches.map(m => m.fieldId).filter(Boolean) as string[]));
            const divisionIds = Array.from(new Set(teams.map(t => t.divisionId).filter(Boolean) as string[]));

            const [readinessChecks, availability, trips, opponents, fields, divisions, incidents, schoolPeople, groundLogs] = await Promise.all([
                fetchWhereIn<FixtureReadinessCheck>('fixture_readiness_checks', 'fixtureId', boardMatchIds),
                fetchWhereIn<PlayerAvailability>('player_availability', 'fixtureId', boardMatchIds),
                // transportService caps each call at 10 ids — fan out and flatten
                Promise.all(chunk(boardMatchIds, 10).map(c => transportService.getTripsByFixtures(c).catch(() => [] as TransportTrip[])))
                    .then(lists => lists.flat()),
                fetchByIds<Team>('teams', opponentIds),
                fetchByIds<Field>('fields', fieldIds),
                fetchByIds<Division>('divisions', divisionIds),
                medicalService.getIncidents().catch(() => [] as MedicalIncident[]),
                fetchCollection<Person>('people', [where('schoolId', '==', schoolId)]),
                Promise.all(fieldIds.map(async fid => {
                    try { return [fid, await facilityService.getLatestReadinessLog(fid)] as const; }
                    catch { return [fid, null] as const; }
                })),
            ]);

            const readinessByFixture = new Map(readinessChecks.map(r => [r.fixtureId, r]));
            const availabilityByFixture = new Map<string, PlayerAvailability[]>();
            availability.forEach(a => {
                const list = availabilityByFixture.get(a.fixtureId) ?? [];
                list.push(a);
                availabilityByFixture.set(a.fixtureId, list);
            });
            const tripsByFixture = new Map<string, TransportTrip[]>();
            trips.forEach(t => {
                if (!t.fixtureId) return;
                const list = tripsByFixture.get(t.fixtureId) ?? [];
                list.push(t);
                tripsByFixture.set(t.fixtureId, list);
            });
            const opponentById = new Map(opponents.map(t => [t.id, t]));
            const fieldById = new Map(fields.map(f => [f.id, f]));
            const divisionById = new Map(divisions.map(d => [d.id, d]));
            const groundLogByField = new Map<string, GroundReadinessLog | null>(groundLogs);

            // ── People resolution (officials, coaches, selected XIs, incident subjects) ──
            const personIds = new Set<string>();
            teams.forEach(t => (t.coachIds ?? []).forEach(id => personIds.add(id)));
            teams.forEach(t => { if (t.defaultScorerId) personIds.add(t.defaultScorerId); });
            boardMatches.forEach(m => {
                if (m.umpire1Id) personIds.add(m.umpire1Id);
                if (m.umpire2Id) personIds.add(m.umpire2Id);
                if (m.scorerId) personIds.add(m.scorerId);
            });
            const peopleById = await resolvePeople(Array.from(personIds));
            schoolPeople.forEach(p => { if (!peopleById.has(p.id)) peopleById.set(p.id, p); });

            const nameOf = (id?: string | null) => (id ? personName(peopleById.get(id)) : null);

            // Active (non-cleared) incidents keyed by person
            const activeIncidentsByPerson = new Map<string, MedicalIncident[]>();
            incidents.filter(i => i.status !== 'Cleared').forEach(i => {
                const list = activeIncidentsByPerson.get(i.personId) ?? [];
                list.push(i);
                activeIncidentsByPerson.set(i.personId, list);
            });

            // ── Readiness rows ──
            const readinessGrid: TeamReadinessTelemetry[] = [];
            const squadMembership = new Map<string, string>(); // personId → teamName (from selected XI)

            for (const team of teams) {
                const next = nextByTeam.get(team.id);
                if (!next) continue;
                const { match, side } = next;
                const check = readinessByFixture.get(match.id);
                const selection = match.teamSelection?.[side];
                const squadIds = [...(selection?.playingXI ?? []), ...(selection?.reserves ?? [])];
                squadIds.forEach(pid => squadMembership.set(pid, team.name));

                // Selection
                let squadStatus: SquadStatus = 'DRAFT';
                if (selection?.confirmedAt || check?.squadReady) squadStatus = 'APPROVED';
                else if ((selection?.playingXI?.length ?? 0) >= 11) squadStatus = 'PENDING_CONFIRMATION';

                // Availability
                const responses = (availabilityByFixture.get(match.id) ?? []).filter(a => a.availabilityStatus !== 'Unknown');
                const relevant = squadIds.length ? responses.filter(a => squadIds.includes(a.personId)) : responses;
                const denominator = squadIds.length || 13;
                const availabilityRate = Math.min(100, Math.round((relevant.length / denominator) * 100));

                // Ground
                let groundStatus: GroundStatus;
                if (check?.facilitiesReady) groundStatus = 'CLEARED';
                else if (side === 'away') groundStatus = 'HOST_MANAGED';
                else {
                    const log = match.fieldId ? groundLogByField.get(match.fieldId) : null;
                    if (log && (log.conditionStatus === 'Excellent' || log.conditionStatus === 'Good') && log.pitchReadiness >= 75) groundStatus = 'CLEARED';
                    else if (log) groundStatus = 'PREP_IN_PROGRESS';
                    else groundStatus = 'UNASSIGNED';
                }

                // Transport
                let transportStatus: TransportStatus;
                if (side === 'home') transportStatus = 'NOT_REQUIRED';
                else {
                    const fixtureTrips = (tripsByFixture.get(match.id) ?? []).filter(t => t.status !== 'Cancelled');
                    const moving = fixtureTrips.some(t => ['IN TRANSIT', 'In Transit', 'ARRIVED', 'Completed'].includes(t.status));
                    if (moving) transportStatus = 'BOARDED';
                    else if (fixtureTrips.length > 0 || check?.transportReady) transportStatus = 'BOOKED';
                    else transportStatus = 'UNASSIGNED';
                }

                // Staff
                const headCoach = nameOf(team.coachIds?.[0]) ?? 'Unassigned';
                const scorer = nameOf(match.scorerId) ?? nameOf(team.defaultScorerId) ?? match.scorer ?? (check?.officialsReady ? 'Confirmed' : 'Unassigned');
                const umpire = nameOf(match.umpire1Id) ?? match.umpires?.[0] ?? (check?.officialsReady ? 'Confirmed' : 'Unassigned');

                // Medical
                const xi = selection?.playingXI ?? [];
                const blocked = xi.some(pid => (activeIncidentsByPerson.get(pid) ?? []).some(i => i.severity === 'High' || i.severity === 'Critical'));
                const medicalClearance = check?.medicalChecked ? true : !blocked;

                // Presentation
                const opponentId = side === 'home' ? match.awayTeamId : match.homeTeamId;
                const opponent = opponentById.get(opponentId)?.name
                    ?? (side === 'home' ? match.awayTeamName : match.homeTeamName)
                    ?? 'TBC';
                const field = match.fieldId ? fieldById.get(match.fieldId) : undefined;
                const venue = field?.name ?? match.location ?? match.venue ?? (side === 'away' ? 'Away' : 'Home');
                const division = (team.divisionId && divisionById.get(team.divisionId)?.name) || match.division || team.suffix || '—';

                const partial = {
                    id: `${team.id}:${match.id}`,
                    teamId: team.id,
                    matchId: match.id,
                    side,
                    teamName: team.name,
                    division,
                    opponent,
                    fixtureDate: formatFixtureDate(match.matchDate),
                    venue: side === 'away' && !venue.toLowerCase().includes('away') ? `${venue} (Away)` : venue,
                    squadStatus,
                    availabilityRate,
                    groundStatus,
                    transportStatus,
                    staffAssigned: { headCoach, scorer, umpire },
                    medicalClearance,
                };
                readinessGrid.push({ ...partial, overallReadinessScore: scoreRow(partial) });
            }
            readinessGrid.sort((a, b) => a.teamName.localeCompare(b.teamName));

            // ── Staff roster (dedup by person) ──
            const staffRoster: StaffDutyAssignment[] = [];
            const seenStaff = new Set<string>();
            const pushStaff = (id: string | undefined, role: StaffDutyAssignment['role'], teamAssigned: string, status: StaffDutyAssignment['status'] = 'ON_DUTY') => {
                if (!id || seenStaff.has(`${id}:${role}`)) return;
                const p = peopleById.get(id);
                const name = personName(p);
                if (!name) return;
                seenStaff.add(`${id}:${role}`);
                staffRoster.push({ id: `${id}:${role}`, name, role, teamAssigned, contact: personContact(p), status });
            };
            for (const team of teams) {
                const next = nextByTeam.get(team.id);
                (team.coachIds ?? []).forEach((cid, idx) => pushStaff(cid, idx === 0 ? 'Head Coach' : 'Assistant Coach', team.name, next ? 'ON_DUTY' : 'STANDBY'));
                if (next) {
                    pushStaff(next.match.scorerId ?? team.defaultScorerId, 'Scorer', team.name);
                    pushStaff(next.match.umpire1Id, 'Umpire', team.name);
                    pushStaff(next.match.umpire2Id, 'Umpire', team.name);
                }
            }
            for (const p of schoolPeople) {
                const role = (p.primaryRole || p.role || '').toLowerCase();
                if (p.groundskeeperProfile || role.includes('ground')) pushStaff(p.id, 'Groundskeeper', 'Grounds', 'ON_DUTY');
                if (p.medicalProfile || role.includes('medic') || role.includes('physio')) pushStaff(p.id, 'Medical Officer', 'School-wide', 'STANDBY');
            }

            // ── Workload & medical watchlist ──
            const workloadAlerts: WorkloadRiskAlert[] = [];
            const schoolPersonIds = new Set([...schoolPeople.map(p => p.id), ...squadMembership.keys()]);

            for (const [pid, list] of activeIncidentsByPerson) {
                if (!schoolPersonIds.has(pid)) continue;
                const worst = list.reduce((a, b) => (severityRank(b.severity) > severityRank(a.severity) ? b : a));
                const p = peopleById.get(pid);
                const severity: WorkloadRiskAlert['severity'] =
                    worst.severity === 'Critical' || worst.severity === 'High' ? 'HIGH' : worst.severity === 'Medium' ? 'MODERATE' : 'LOW';
                workloadAlerts.push({
                    id: `inj-${pid}`,
                    playerId: pid,
                    playerName: personName(p) ?? worst.personName ?? 'Unknown player',
                    teamName: squadMembership.get(pid) ?? 'Squad',
                    role: p?.playingRole ?? p?.primaryRole ?? 'Player',
                    riskType: 'INJURY_REHAB',
                    details: `${worst.type}: ${worst.description} (${worst.status})`,
                    currentWorkload: worst.status === 'Rehab' ? 'Rehab protocol' : 'Restricted',
                    recommendedLimit: severity === 'HIGH' ? 'Medical clearance required before selection' : 'Reduced load — monitor spell length',
                    severity,
                });
            }

            // Consecutive matches: same player in ≥3 XIs over the trailing 7 days (cross-age-group doubling up)
            const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
            const recentXiCounts = new Map<string, number>();
            for (const m of completed) {
                const d = toDate(m.matchDate);
                if (!d || d.getTime() < weekAgo) continue;
                (['home', 'away'] as const).forEach(s => {
                    const tid = s === 'home' ? m.homeTeamId : m.awayTeamId;
                    if (!teamById.has(tid)) return;
                    (m.teamSelection?.[s]?.playingXI ?? []).forEach(pid => recentXiCounts.set(pid, (recentXiCounts.get(pid) ?? 0) + 1));
                });
            }
            const overloadedIds = Array.from(recentXiCounts.entries()).filter(([, n]) => n >= 3).map(([pid]) => pid);
            if (overloadedIds.length) {
                const extra = await resolvePeople(overloadedIds.filter(id => !peopleById.has(id)));
                extra.forEach((v, k) => peopleById.set(k, v));
                for (const pid of overloadedIds) {
                    if (workloadAlerts.some(a => a.playerId === pid)) continue;
                    const n = recentXiCounts.get(pid) ?? 0;
                    const p = peopleById.get(pid);
                    workloadAlerts.push({
                        id: `cons-${pid}`,
                        playerId: pid,
                        playerName: personName(p) ?? 'Unknown player',
                        teamName: squadMembership.get(pid) ?? 'Multiple squads',
                        role: p?.playingRole ?? 'Player',
                        riskType: 'CONSECUTIVE_MATCHES',
                        details: `Selected in ${n} playing XIs in the last 7 days.`,
                        currentWorkload: `${n} matches / 7 days`,
                        recommendedLimit: 'Max 2 matches per rolling week',
                        severity: n >= 4 ? 'HIGH' : 'MODERATE',
                    });
                }
            }
            workloadAlerts.sort((a, b) => alertRank(b.severity) - alertRank(a.severity));

            // ── Executive metrics ──
            let wins = 0, losses = 0, draws = 0;
            for (const m of completed) {
                const winnerId = (m as any).winnerId as string | undefined;
                const resultText = String(m.result ?? '').toLowerCase();
                if (winnerId && teamById.has(winnerId)) wins++;
                else if (winnerId) losses++;
                else if (/draw|tie|no result|abandon/.test(resultText)) draws++;
            }
            const played = wins + losses + draws;
            const overallWinRate = played ? Math.round((wins / played) * 1000) / 10 : 0;

            const registeredPlayers = new Set<string>();
            schoolPeople.forEach(p => { if (p.playerProfile || p.playingRole || (p.primaryRole || p.role || '').toLowerCase() === 'player') registeredPlayers.add(p.id); });
            squadMembership.forEach((_, pid) => registeredPlayers.add(pid));

            const clearedFixtures = readinessGrid.filter(r => r.overallReadinessScore >= 85).length;
            const crossFixtureReadiness = readinessGrid.length
                ? Math.round(readinessGrid.reduce((s, r) => s + r.overallReadinessScore, 0) / readinessGrid.length)
                : 0;

            const metrics: SchoolExecutiveMetrics = {
                schoolName: schoolName || 'School',
                season: currentSeasonLabel(),
                totalActiveSquads: teams.length,
                overallWinRate,
                seasonRecord: { wins, losses, draws },
                crossFixtureReadiness,
                clearedFixtures,
                totalFixtures: readinessGrid.length,
                activeWorkloadAlerts: workloadAlerts.length,
                pendingApprovalsCount: readinessGrid.filter(r => r.squadStatus !== 'APPROVED').length,
                totalPlayersRegistered: registeredPlayers.size,
            };

            return {
                schoolId,
                metrics,
                readinessGrid,
                staffRoster,
                workloadAlerts,
                source: 'live',
                generatedAt: new Date().toISOString(),
            };
        } catch (error) {
            console.warn('[sportsDirectorService] snapshot failed, using fallback dataset:', error);
            return buildFallbackSnapshot(schoolId, schoolName);
        }
    },

    /**
     * Approve (lock) or revoke a squad selection for one side of a match.
     * Mirrors what saveTeamSelectionAction writes, and flips the canonical
     * readiness layer so the pre-match board agrees with the director view.
     */
    async setSquadApproval(params: {
        matchId: string;
        side: 'home' | 'away';
        approved: boolean;
        schoolId: string;
        actorId: string;
        actorName: string;
        teamName: string;
    }): Promise<void> {
        const { matchId, side, approved, schoolId, actorId, actorName, teamName } = params;
        const nowIso = new Date().toISOString();

        await updateDoc(doc(db, 'matches', matchId), {
            [`teamSelection.${side}.confirmedAt`]: approved ? nowIso : null,
            [`teamSelection.${side}.confirmedBy`]: approved ? actorName : null,
            updatedAt: serverTimestamp(),
        });

        // Upsert the readiness layer (client-side equivalent of updateReadinessLayerAction)
        const checksRef = collection(db, 'fixture_readiness_checks');
        const snap = await getDocs(query(checksRef, where('fixtureId', '==', matchId)));
        if (snap.empty) {
            await addDoc(checksRef, {
                fixtureId: matchId,
                squadReady: approved,
                transportReady: false,
                facilitiesReady: false,
                officialsReady: false,
                medicalChecked: false,
                equipmentReady: false,
                overallStatus: 'Pending',
                updatedAt: nowIso,
            });
        } else {
            await updateDoc(snap.docs[0].ref, { squadReady: approved, updatedAt: nowIso });
        }

        await recordAuditLog({
            actorId,
            actorName,
            actionType: approved ? 'SQUAD_CONFIRMED' : 'READINESS_OVERRIDE',
            entityType: 'match',
            entityId: matchId,
            schoolId,
            description: approved
                ? `Director approved ${teamName} selection for match ${matchId}`
                : `Director revoked ${teamName} selection approval for match ${matchId}`,
        });
    },

    /**
     * Compile every outstanding readiness item into one staff prompt and log it.
     * Returns what was sent so the UI can report recipient count.
     */
    async broadcastStaffPrompt(params: {
        schoolId: string;
        actorId: string;
        actorName: string;
        snapshot: DirectorSnapshot;
    }): Promise<StaffBroadcastResult> {
        const { schoolId, actorId, actorName, snapshot } = params;
        const outstandingItems: string[] = [];

        for (const row of snapshot.readinessGrid) {
            if (row.squadStatus !== 'APPROVED') outstandingItems.push(`${row.teamName}: squad selection ${row.squadStatus === 'DRAFT' ? 'not started' : 'awaiting sign-off'}`);
            if (row.staffAssigned.umpire === 'Unassigned') outstandingItems.push(`${row.teamName}: umpire unassigned`);
            if (row.staffAssigned.scorer === 'Unassigned') outstandingItems.push(`${row.teamName}: scorer unassigned`);
            if (row.staffAssigned.headCoach === 'Unassigned') outstandingItems.push(`${row.teamName}: no head coach on record`);
            if (row.transportStatus === 'UNASSIGNED') outstandingItems.push(`${row.teamName}: away transport not booked`);
            if (row.groundStatus === 'UNASSIGNED') outstandingItems.push(`${row.teamName}: no ground readiness log for ${row.venue}`);
            if (row.availabilityRate < 80) outstandingItems.push(`${row.teamName}: only ${row.availabilityRate}% availability responses`);
            if (!row.medicalClearance) outstandingItems.push(`${row.teamName}: XI includes a player without medical clearance`);
        }

        const recipients = snapshot.staffRoster.map(s => ({ id: s.id, name: s.name, role: s.role, contact: s.contact }));
        const message = outstandingItems.length
            ? `Director readiness prompt — ${outstandingItems.length} item(s) outstanding before the weekend:\n• ${outstandingItems.join('\n• ')}`
            : 'Director readiness prompt — all squads cleared. Thank you, no action required.';

        let broadcastId = `local-${Date.now()}`;
        try {
            const ref = await addDoc(collection(db, 'staff_broadcasts'), {
                schoolId,
                sentBy: { id: actorId, name: actorName },
                message,
                outstandingItems,
                recipients,
                recipientCount: recipients.length,
                snapshotSource: snapshot.source,
                sentAt: serverTimestamp(),
                createdAt: serverTimestamp(),
            });
            broadcastId = ref.id;
        } catch (err) {
            console.warn('[sportsDirectorService] staff_broadcasts write failed, continuing with audit only:', err);
        }

        await recordAuditLog({
            actorId,
            actorName,
            actionType: 'LOGISTICS_UPDATE',
            entityType: 'school',
            entityId: schoolId,
            schoolId,
            description: `Staff readiness prompt broadcast to ${recipients.length} staff (${outstandingItems.length} outstanding items)`,
            afterState: { broadcastId, outstandingItems },
        });

        return { recipientCount: recipients.length, outstandingItems, broadcastId };
    },

    /** Printable executive briefing (opened in a new window by the dashboard). */
    buildBriefingHtml(snapshot: DirectorSnapshot): string {
        const { metrics, readinessGrid, staffRoster, workloadAlerts } = snapshot;
        const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
        const generated = new Date(snapshot.generatedAt).toLocaleString('en-ZA');
        const label = (v: string) => esc(v.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase()));

        return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${esc(metrics.schoolName)} — Director Briefing</title>
<style>
  body{font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111;margin:32px;font-size:12px}
  h1{font-size:22px;margin:0 0 2px}h2{font-size:14px;margin:24px 0 8px;text-transform:uppercase;letter-spacing:.08em;border-bottom:2px solid #111;padding-bottom:4px}
  .meta{color:#666;margin-bottom:16px}
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
  .kpi{border:1px solid #ddd;border-radius:8px;padding:10px}.kpi b{display:block;font-size:20px}.kpi span{color:#666;font-size:10px;text-transform:uppercase;letter-spacing:.06em}
  table{width:100%;border-collapse:collapse}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid #e5e5e5;vertical-align:top}th{background:#f4f4f4;font-size:10px;text-transform:uppercase;letter-spacing:.05em}
  .ok{color:#15803d;font-weight:600}.warn{color:#b45309;font-weight:600}.bad{color:#b91c1c;font-weight:600}
  .footer{margin-top:28px;color:#888;font-size:10px}.no-print{margin-top:24px}
  @media print{.no-print{display:none}body{margin:12mm}}
</style></head><body>
<h1>${esc(metrics.schoolName)} — Director Command Briefing</h1>
<div class="meta">${esc(metrics.season)} · Generated ${esc(generated)} · Data: ${snapshot.source === 'live' ? 'live telemetry' : 'demonstration dataset'}</div>

<div class="kpis">
  <div class="kpi"><span>Active squads</span><b>${metrics.totalActiveSquads}</b>${metrics.totalPlayersRegistered} registered athletes</div>
  <div class="kpi"><span>Win rate</span><b>${metrics.overallWinRate}%</b>${metrics.seasonRecord.wins}W · ${metrics.seasonRecord.losses}L · ${metrics.seasonRecord.draws}D</div>
  <div class="kpi"><span>Weekend readiness</span><b>${metrics.crossFixtureReadiness}%</b>${metrics.clearedFixtures} of ${metrics.totalFixtures} fixtures cleared</div>
  <div class="kpi"><span>Workload risks</span><b>${metrics.activeWorkloadAlerts}</b>${metrics.pendingApprovalsCount} approvals pending</div>
</div>

<h2>Squad readiness matrix</h2>
<table><thead><tr><th>Squad</th><th>Fixture</th><th>Selection</th><th>Avail.</th><th>Ground</th><th>Transport</th><th>Coach / Scorer / Umpire</th><th>Medical</th><th>Score</th></tr></thead><tbody>
${readinessGrid.map(r => `<tr>
  <td><b>${esc(r.teamName)}</b><br><small>${esc(r.division)}</small></td>
  <td>vs ${esc(r.opponent)}<br><small>${esc(r.fixtureDate)} · ${esc(r.venue)}</small></td>
  <td class="${r.squadStatus === 'APPROVED' ? 'ok' : 'warn'}">${label(r.squadStatus)}</td>
  <td>${r.availabilityRate}%</td>
  <td class="${r.groundStatus === 'CLEARED' || r.groundStatus === 'HOST_MANAGED' ? 'ok' : r.groundStatus === 'PREP_IN_PROGRESS' ? 'warn' : 'bad'}">${label(r.groundStatus)}</td>
  <td class="${r.transportStatus === 'UNASSIGNED' ? 'bad' : 'ok'}">${label(r.transportStatus)}</td>
  <td>${esc(r.staffAssigned.headCoach)} / ${esc(r.staffAssigned.scorer)} / ${esc(r.staffAssigned.umpire)}</td>
  <td class="${r.medicalClearance ? 'ok' : 'bad'}">${r.medicalClearance ? 'Cleared' : 'Flagged'}</td>
  <td><b>${r.overallReadinessScore}%</b></td>
</tr>`).join('') || '<tr><td colspan="9">No upcoming fixtures on record.</td></tr>'}
</tbody></table>

<h2>Workload &amp; medical watchlist</h2>
<table><thead><tr><th>Player</th><th>Squad</th><th>Risk</th><th>Details</th><th>Limit</th><th>Severity</th></tr></thead><tbody>
${workloadAlerts.map(a => `<tr><td><b>${esc(a.playerName)}</b><br><small>${esc(a.role)}</small></td><td>${esc(a.teamName)}</td><td>${label(a.riskType)}</td><td>${esc(a.details)}</td><td>${esc(a.recommendedLimit)}</td><td class="${a.severity === 'HIGH' ? 'bad' : a.severity === 'MODERATE' ? 'warn' : 'ok'}">${a.severity}</td></tr>`).join('') || '<tr><td colspan="6">No active risks flagged.</td></tr>'}
</tbody></table>

<h2>Staff &amp; officials on duty</h2>
<table><thead><tr><th>Name</th><th>Role</th><th>Assignment</th><th>Contact</th><th>Status</th></tr></thead><tbody>
${staffRoster.map(s => `<tr><td>${esc(s.name)}</td><td>${esc(s.role)}</td><td>${esc(s.teamAssigned)}</td><td>${esc(s.contact)}</td><td>${label(s.status)}</td></tr>`).join('') || '<tr><td colspan="5">No staff assignments on record.</td></tr>'}
</tbody></table>

<div class="footer">Generated by SCRBRD OS · Director Command</div>
<div class="no-print"><button onclick="window.print()" style="padding:10px 20px;font-size:14px;cursor:pointer">Print / Save as PDF</button></div>
</body></html>`;
    },
};

function severityRank(s: MedicalIncident['severity']): number {
    return s === 'Critical' ? 4 : s === 'High' ? 3 : s === 'Medium' ? 2 : 1;
}

function alertRank(s: WorkloadRiskAlert['severity']): number {
    return s === 'HIGH' ? 3 : s === 'MODERATE' ? 2 : 1;
}

export { isJuniorLabel };
