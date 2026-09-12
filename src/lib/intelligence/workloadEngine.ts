/**
 * Bowling workload assessment.
 *
 * Aggregates overs per bowler from completed matches' live-score projections
 * (matches/{id}/live/score → innings1/innings2.bowlers) over a trailing window
 * and compares against age-banded weekly caps. Pure — no I/O.
 *
 * Caps follow the spirit of CSA youth fast-bowling directives (weekly totals);
 * adjust WEEKLY_OVER_CAPS per federation.
 */

export interface BowlerOversEntry {
    playerId: string;
    playerName?: string;
    teamId: string;
    teamName: string;
    matchId: string;
    matchDate: string;   // ISO
    overs: number;       // decimal overs (6.2 → 6.333)
}

export interface BowlingWorkloadAssessment {
    playerId: string;
    playerName?: string;
    teamName: string;
    ageBand: string;
    oversLast7: number;
    matches: number;
    cap: number;
    utilisation: number;         // 0-1+
    remainingOvers: number;
    level: 'OK' | 'MODERATE' | 'HIGH';
}

/** Weekly caps by age band (upper age of the band). Senior = 30. */
export const WEEKLY_OVER_CAPS: Array<{ maxAge: number; label: string; cap: number }> = [
    { maxAge: 11, label: 'U11', cap: 8 },
    { maxAge: 13, label: 'U13', cap: 12 },
    { maxAge: 15, label: 'U15', cap: 20 },
    { maxAge: 17, label: 'U17', cap: 26 },
    { maxAge: 19, label: 'U19', cap: 30 },
];
export const SENIOR_CAP = { label: 'Open', cap: 30 };

/** "U15A", "Under 15", "u-13 B" → 15 / 15 / 13; anything else → null (senior). */
export function ageFromTeamName(name: string): number | null {
    // (?!\d) instead of \b so "U15A" still matches — 5 and A are both word chars.
    const m = /\bU(?:nder)?[\s-]?(\d{1,2})(?!\d)/i.exec(name);
    if (!m) return null;
    const n = Number(m[1]);
    return n >= 6 && n <= 19 ? n : null;
}

export function capForTeam(teamName: string): { label: string; cap: number } {
    const age = ageFromTeamName(teamName);
    if (age === null) return SENIOR_CAP;
    return WEEKLY_OVER_CAPS.find(b => age <= b.maxAge) ?? SENIOR_CAP;
}

/** "6.2" (overs.balls) → 6.333; also accepts numbers already decimal and ballsBowled. */
export function normaliseOvers(overs: number | string | undefined, ballsBowled?: number): number {
    if (typeof ballsBowled === 'number' && ballsBowled > 0) return ballsBowled / 6;
    if (overs === undefined || overs === null) return 0;
    const n = typeof overs === 'string' ? parseFloat(overs) : overs;
    if (isNaN(n)) return 0;
    const whole = Math.floor(n);
    const frac = Math.round((n - whole) * 10);
    // If the fraction is a legal ball count (0–5) treat as overs.balls notation.
    return frac >= 0 && frac <= 5 ? whole + frac / 6 : n;
}

export function formatOvers(decimal: number): string {
    const whole = Math.floor(decimal);
    const balls = Math.round((decimal - whole) * 6);
    return balls ? `${whole}.${balls}` : `${whole}`;
}

export function assessBowlingWorkload(
    entries: BowlerOversEntry[],
    nowIso: string,
    windowDays = 7,
    thresholds = { moderate: 0.8, high: 1.0 }
): BowlingWorkloadAssessment[] {
    const now = new Date(nowIso).getTime();
    const from = now - windowDays * 86_400_000;
    const inWindow = entries.filter(e => {
        const t = new Date(e.matchDate).getTime();
        return !isNaN(t) && t >= from && t <= now;
    });

    const byPlayer = new Map<string, BowlerOversEntry[]>();
    inWindow.forEach(e => byPlayer.set(e.playerId, [...(byPlayer.get(e.playerId) ?? []), e]));

    const out: BowlingWorkloadAssessment[] = [];
    for (const [playerId, list] of byPlayer) {
        const oversLast7 = Math.round(list.reduce((s, e) => s + e.overs, 0) * 1000) / 1000;
        // Use the *youngest* band the player bowled in — that is the binding cap.
        const band = list
            .map(e => capForTeam(e.teamName))
            .sort((a, b) => a.cap - b.cap)[0];
        const utilisation = oversLast7 / band.cap;
        const level: BowlingWorkloadAssessment['level'] =
            utilisation >= thresholds.high ? 'HIGH' : utilisation >= thresholds.moderate ? 'MODERATE' : 'OK';
        const latest = [...list].sort((a, b) => b.matchDate.localeCompare(a.matchDate))[0];
        out.push({
            playerId,
            playerName: latest.playerName,
            teamName: latest.teamName,
            ageBand: band.label,
            oversLast7,
            matches: new Set(list.map(e => e.matchId)).size,
            cap: band.cap,
            utilisation: Math.round(utilisation * 100) / 100,
            remainingOvers: Math.max(0, Math.round((band.cap - oversLast7) * 10) / 10),
            level,
        });
    }
    return out.sort((a, b) => b.utilisation - a.utilisation);
}

/**
 * Extract bowler entries from a live-score projection (either innings, or the
 * top-level current-innings bowlers as a fallback). Only bowling sides in
 * `ownTeamIds` are counted.
 */
export function extractBowlerEntries(
    matchId: string,
    matchDate: string,
    projection: {
        innings1?: { bowlingTeamId: string; bowlingTeamName?: string; bowlers?: Array<{ playerId: string; name?: string; overs?: number; ballsBowled?: number }> };
        innings2?: { bowlingTeamId: string; bowlingTeamName?: string; bowlers?: Array<{ playerId: string; name?: string; overs?: number; ballsBowled?: number }> };
        currentInnings?: { bowlingTeamId: string; bowlingTeamName?: string };
        bowlers?: Array<{ playerId: string; name?: string; overs?: number; ballsBowled?: number }>;
    } | null | undefined,
    ownTeamIds: Set<string>,
    teamNameOf: (id: string) => string
): BowlerOversEntry[] {
    if (!projection) return [];
    const out: BowlerOversEntry[] = [];
    const push = (teamId: string | undefined, bowlers?: Array<{ playerId: string; name?: string; overs?: number; ballsBowled?: number }>) => {
        if (!teamId || !ownTeamIds.has(teamId) || !bowlers) return;
        bowlers.forEach(b => {
            const overs = normaliseOvers(b.overs, b.ballsBowled);
            if (overs <= 0) return;
            out.push({ playerId: b.playerId, playerName: b.name, teamId, teamName: teamNameOf(teamId), matchId, matchDate, overs });
        });
    };
    if (projection.innings1 || projection.innings2) {
        push(projection.innings1?.bowlingTeamId, projection.innings1?.bowlers);
        push(projection.innings2?.bowlingTeamId, projection.innings2?.bowlers);
    } else {
        push(projection.currentInnings?.bowlingTeamId, projection.bowlers);
    }
    return out;
}
