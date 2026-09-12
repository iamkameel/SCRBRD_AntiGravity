/**
 * Cross-sport athlete passport & load engine.
 *
 * Every appearance — a cricket XI, a gala race, a track/field event, a
 * field-sport match — becomes a LoadSession (duration × intensity, session-RPE
 * style). Sessions in the trailing window roll up into a 0–100 load score,
 * a status band and specific alerts (back-to-back competition days, three
 * disciplines in one week, no rest day). Adapters at the bottom build sessions
 * from the existing engines' data structures. Pure — no I/O.
 */

import type { SportDiscipline, SwimmingGala, AthleticsMeet } from '@/lib/intelligence/multiSportEngine';
import type { FieldSportMatch } from '@/lib/intelligence/fieldSportEngine';
import type { BowlerOversEntry } from '@/lib/intelligence/workloadEngine';

export interface LoadSession {
    discipline: SportDiscipline;
    date: string;            // ISO
    kind: 'MATCH' | 'RACE' | 'EVENT' | 'TRAINING';
    durationMin: number;
    intensity: number;       // 1–10 (RPE)
    label: string;
    sourceId?: string;
}

export interface AthleteIdentity {
    key: string;             // stable merge key (personId when known, else normalised name)
    personId?: string;
    name: string;
    house?: string;
    grade?: string;
}

export interface AthletePassport extends AthleteIdentity {
    primary: SportDiscipline;
    disciplines: SportDiscipline[];
    sessions: LoadSession[];         // in window, newest first
    acuteLoadAU: number;             // Σ duration × intensity
    loadScore: number;               // 0–100
    loadStatus: 'OPTIMAL' | 'MODERATE_LOAD' | 'HIGH_OVERLOAD_RISK';
    alerts: string[];
    byDiscipline: Array<{ discipline: SportDiscipline; sessions: number; minutes: number; loadAU: number }>;
}

/** Arbitrary units at which the score saturates (≈ 3 hard matches + 4 trainings in a week). */
export const LOAD_SCALE_AU = 2500;
export const LOAD_THRESHOLDS = { moderate: 50, high: 75 };

export function identityKey(personId: string | undefined, name: string): string {
    return personId ? `id:${personId}` : `name:${name.trim().toLowerCase().replace(/\s+/g, ' ')}`;
}

export function computeLoad(sessions: LoadSession[], nowIso: string, windowDays = 7): Pick<AthletePassport, 'sessions' | 'acuteLoadAU' | 'loadScore' | 'loadStatus' | 'alerts' | 'byDiscipline' | 'disciplines' | 'primary'> {
    const now = new Date(nowIso).getTime();
    const from = now - windowDays * 86_400_000;
    const inWindow = sessions
        .filter(s => { const t = new Date(s.date).getTime(); return !isNaN(t) && t >= from && t <= now + 86_400_000; }) // include today's later events
        .sort((a, b) => b.date.localeCompare(a.date));

    const acuteLoadAU = Math.round(inWindow.reduce((s, x) => s + x.durationMin * x.intensity, 0));
    const loadScore = Math.min(100, Math.round((acuteLoadAU / LOAD_SCALE_AU) * 100));
    const loadStatus: AthletePassport['loadStatus'] = loadScore >= LOAD_THRESHOLDS.high ? 'HIGH_OVERLOAD_RISK' : loadScore >= LOAD_THRESHOLDS.moderate ? 'MODERATE_LOAD' : 'OPTIMAL';

    const byMap = new Map<SportDiscipline, { sessions: number; minutes: number; loadAU: number }>();
    inWindow.forEach(s => {
        const b = byMap.get(s.discipline) ?? { sessions: 0, minutes: 0, loadAU: 0 };
        b.sessions += 1; b.minutes += s.durationMin; b.loadAU += s.durationMin * s.intensity;
        byMap.set(s.discipline, b);
    });
    const byDiscipline = Array.from(byMap.entries()).map(([discipline, b]) => ({ discipline, ...b })).sort((a, b) => b.loadAU - a.loadAU);
    const disciplines = byDiscipline.map(b => b.discipline);
    const primary = disciplines[0] ?? 'CRICKET';

    const alerts: string[] = [];
    // Competition on consecutive days (hard sessions ≥ 7)
    const hardDays = Array.from(new Set(inWindow.filter(s => s.kind !== 'TRAINING' && s.intensity >= 7).map(s => s.date.slice(0, 10)))).sort();
    for (let i = 1; i < hardDays.length; i++) {
        const gap = (Date.parse(hardDays[i]) - Date.parse(hardDays[i - 1])) / 86_400_000;
        if (gap === 1) {
            const a = inWindow.find(s => s.date.startsWith(hardDays[i - 1]) && s.kind !== 'TRAINING')!;
            const b = inWindow.find(s => s.date.startsWith(hardDays[i]) && s.kind !== 'TRAINING')!;
            alerts.push(`Back-to-back competition: ${a.label} (${hardDays[i - 1]}) then ${b.label} (${hardDays[i]}).`);
        }
    }
    if (disciplines.length >= 3) alerts.push(`${disciplines.length} disciplines in one week (${disciplines.join(', ')}).`);
    const activeDays = new Set(inWindow.map(s => s.date.slice(0, 10))).size;
    if (activeDays >= 6) alerts.push(`Active on ${activeDays} of ${windowDays} days — no rest day.`);
    if (loadStatus === 'HIGH_OVERLOAD_RISK') alerts.push(`Acute load ${acuteLoadAU} AU is ${Math.round((acuteLoadAU / LOAD_SCALE_AU) * 100)}% of the weekly scale — reduce intensity or rest.`);

    return { sessions: inWindow, acuteLoadAU, loadScore, loadStatus, alerts, byDiscipline, disciplines, primary };
}

export function buildPassport(identity: AthleteIdentity, sessions: LoadSession[], nowIso: string, windowDays = 7): AthletePassport {
    return { ...identity, ...computeLoad(sessions, nowIso, windowDays) };
}

/** Group sessions by athlete and build a passport per athlete, heaviest load first. */
export function buildPassports(
    entries: Array<{ identity: AthleteIdentity; session: LoadSession }>,
    nowIso: string,
    windowDays = 7
): AthletePassport[] {
    const byKey = new Map<string, { identity: AthleteIdentity; sessions: LoadSession[] }>();
    for (const { identity, session } of entries) {
        const g = byKey.get(identity.key) ?? { identity, sessions: [] };
        // Prefer the richest identity we see (one with personId / house).
        if (!g.identity.personId && identity.personId) g.identity = { ...g.identity, ...identity };
        if (!g.identity.house && identity.house) g.identity.house = identity.house;
        g.sessions.push(session);
        byKey.set(identity.key, g);
    }
    return Array.from(byKey.values())
        .map(g => buildPassport(g.identity, g.sessions, nowIso, windowDays))
        .sort((a, b) => b.loadScore - a.loadScore || a.name.localeCompare(b.name));
}

// ─────────────────────────────────────────────────────────────────────────────
// Adapters
// ─────────────────────────────────────────────────────────────────────────────

export function sessionsFromSwimmingGala(gala: SwimmingGala): Array<{ identity: AthleteIdentity; session: LoadSession }> {
    const out: Array<{ identity: AthleteIdentity; session: LoadSession }> = [];
    const date = `${gala.date}T09:00:00`;
    for (const ev of gala.events) {
        const isRelay = /relay/i.test(ev.stroke) || /x/.test(ev.distance);
        const metres = parseInt(ev.distance, 10) || 50;
        for (const lane of ev.lanes) {
            out.push({
                identity: { key: identityKey(lane.swimmerId, lane.swimmerName), personId: lane.swimmerId, name: lane.swimmerName, house: lane.houseOrSchool },
                session: {
                    discipline: 'SWIMMING', date, kind: 'RACE',
                    durationMin: Math.max(15, Math.round(metres / 10) + (isRelay ? 10 : 0)),
                    intensity: ev.status === 'COMPLETED' ? 9 : 8,
                    label: ev.eventName, sourceId: ev.eventId,
                },
            });
        }
    }
    return out;
}

export function sessionsFromAthleticsMeet(meet: AthleticsMeet): Array<{ identity: AthleteIdentity; session: LoadSession }> {
    const out: Array<{ identity: AthleteIdentity; session: LoadSession }> = [];
    const date = `${meet.date}T09:00:00`;
    for (const ev of meet.events) {
        for (const r of ev.results) {
            out.push({
                identity: { key: identityKey(undefined, r.swimmerOrAthleteName), name: r.swimmerOrAthleteName, house: r.houseOrSchool },
                session: {
                    discipline: 'ATHLETICS', date, kind: 'EVENT',
                    durationMin: ev.category === 'FIELD' ? 45 : 25,
                    intensity: ev.category === 'FIELD' ? 7 : 9,
                    label: ev.eventName, sourceId: ev.eventId,
                },
            });
        }
    }
    return out;
}

/** Cricket: every XI appearance is a match session; bowlers get extra intensity from overs bowled. */
export function sessionsFromCricket(
    appearances: Array<{ personId: string; name: string; teamName: string; matchId: string; date: string; format?: string }>,
    bowling: BowlerOversEntry[]
): Array<{ identity: AthleteIdentity; session: LoadSession }> {
    const oversBy = new Map<string, number>();
    bowling.forEach(b => oversBy.set(`${b.matchId}|${b.playerId}`, (oversBy.get(`${b.matchId}|${b.playerId}`) ?? 0) + b.overs));
    return appearances.map(a => {
        const overs = oversBy.get(`${a.matchId}|${a.personId}`) ?? 0;
        const short = /T20|T10/i.test(a.format ?? '');
        return {
            identity: { key: identityKey(a.personId, a.name), personId: a.personId, name: a.name },
            session: {
                discipline: 'CRICKET', date: a.date, kind: 'MATCH',
                durationMin: short ? 200 : 360,
                intensity: Math.min(10, 5 + (overs > 0 ? 2 + Math.min(3, Math.round(overs / 4)) : 0)),
                label: `${a.teamName} match${overs ? ` · ${Math.round(overs * 10) / 10} ov` : ''}`, sourceId: a.matchId,
            },
        };
    });
}

/** Field sports: any player named in a score/card/sub event is treated as having played the match. */
export function sessionsFromFieldSportMatches(matches: FieldSportMatch[]): Array<{ identity: AthleteIdentity; session: LoadSession }> {
    const out: Array<{ identity: AthleteIdentity; session: LoadSession }> = [];
    for (const m of matches) {
        if (m.status === 'SCHEDULED') continue;
        const seen = new Set<string>();
        const add = (id: string | undefined, name: string | undefined) => {
            if (!name) return;
            const key = identityKey(id, name);
            if (seen.has(key)) return;
            seen.add(key);
            out.push({
                identity: { key, personId: id, name },
                session: {
                    discipline: m.sport, date: m.createdAt, kind: 'MATCH',
                    durationMin: Math.round((m.ruleset.periods * m.ruleset.periodSec) / 60),
                    intensity: 8, label: `${m.home.name} v ${m.away.name}`, sourceId: m.id,
                },
            });
        };
        for (const e of m.events) {
            add(e.playerId, e.playerName);
            add(e.onPlayerId, e.onPlayerName);
        }
    }
    return out;
}
