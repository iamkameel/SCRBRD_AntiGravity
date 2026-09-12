/**
 * Championship Shield aggregation.
 *
 * Takes per-discipline point totals for entrants (houses or schools) and
 * combines them into one ladder. Because disciplines score on wildly
 * different scales (a gala awards hundreds of points, a cricket league a
 * handful), the default method normalises each discipline to the leader
 * before summing. Pure — adapters at the bottom turn existing structures
 * (gala/meet house tables, cricket standings, field-sport matches) into entries.
 */

import type { SportDiscipline, HousePointsSummary } from '@/lib/intelligence/multiSportEngine';
import type { TeamStandingsEntry } from '@/lib/intelligence/competitionEngine';
import { summarize, type FieldSportMatch } from '@/lib/intelligence/fieldSportEngine';

export interface DisciplineEntry {
    discipline: SportDiscipline;
    entrant: string;
    points: number;
    color?: string;
}

export type ChampionshipMethod = 'RAW' | 'PERCENT_OF_LEADER' | 'RANK_POINTS';

export interface ChampionshipConfig {
    method: ChampionshipMethod;
    /** Per-discipline multiplier (default 1). */
    weights?: Partial<Record<SportDiscipline, number>>;
    /** RANK_POINTS: points for 1st, 2nd, … (default 10, 8, 6, 5, 4, 3, 2, 1). */
    rankPointsTable?: number[];
}

export const DEFAULT_CHAMPIONSHIP_CONFIG: ChampionshipConfig = { method: 'PERCENT_OF_LEADER' };
const DEFAULT_RANK_POINTS = [10, 8, 6, 5, 4, 3, 2, 1];

export interface DisciplineCell { raw: number; contribution: number; rank: number; }

export interface ChampionshipRow {
    entrant: string;
    color?: string;
    byDiscipline: Partial<Record<SportDiscipline, DisciplineCell>>;
    overallScore: number;
    rank: number;
    disciplineWins: number;
    disciplinesEntered: number;
}

export function computeChampionship(entries: DisciplineEntry[], config: ChampionshipConfig = DEFAULT_CHAMPIONSHIP_CONFIG): ChampionshipRow[] {
    // Sum duplicate (discipline, entrant) pairs first.
    const merged = new Map<string, DisciplineEntry>();
    for (const e of entries) {
        const k = `${e.discipline}|${e.entrant}`;
        const prev = merged.get(k);
        merged.set(k, prev ? { ...prev, points: prev.points + e.points, color: prev.color ?? e.color } : { ...e });
    }
    const list = Array.from(merged.values());
    const disciplines = Array.from(new Set(list.map(e => e.discipline)));
    const rows = new Map<string, ChampionshipRow>();
    const rowFor = (entrant: string, color?: string) => {
        const r = rows.get(entrant) ?? { entrant, color, byDiscipline: {}, overallScore: 0, rank: 0, disciplineWins: 0, disciplinesEntered: 0 };
        if (!r.color && color) r.color = color;
        rows.set(entrant, r);
        return r;
    };
    const table = config.rankPointsTable ?? DEFAULT_RANK_POINTS;

    for (const d of disciplines) {
        const inD = list.filter(e => e.discipline === d).sort((a, b) => b.points - a.points);
        const leader = inD[0]?.points ?? 0;
        const weight = config.weights?.[d] ?? 1;
        let rank = 0, prevPts: number | null = null;
        inD.forEach((e, i) => {
            if (prevPts === null || e.points < prevPts) rank = i + 1; // ties share the higher rank
            prevPts = e.points;
            let contribution: number;
            switch (config.method) {
                case 'RAW': contribution = e.points * weight; break;
                case 'RANK_POINTS': contribution = (table[rank - 1] ?? 0) * weight; break;
                default: contribution = leader > 0 ? (e.points / leader) * 100 * weight : 0;
            }
            const r = rowFor(e.entrant, e.color);
            r.byDiscipline[d] = { raw: e.points, contribution: Math.round(contribution * 10) / 10, rank };
            r.overallScore = Math.round((r.overallScore + contribution) * 10) / 10;
            r.disciplinesEntered += 1;
            if (rank === 1) r.disciplineWins += 1;
        });
    }

    const out = Array.from(rows.values()).sort((a, b) =>
        b.overallScore - a.overallScore || b.disciplineWins - a.disciplineWins || a.entrant.localeCompare(b.entrant)
    );
    let rank = 0, prev: number | null = null;
    out.forEach((r, i) => {
        if (prev === null || r.overallScore < prev) rank = i + 1;
        prev = r.overallScore;
        r.rank = rank;
    });
    return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Adapters
// ─────────────────────────────────────────────────────────────────────────────

export function entriesFromHousePoints(discipline: SportDiscipline, houses: HousePointsSummary[]): DisciplineEntry[] {
    return houses.map(h => ({ discipline, entrant: h.houseName, points: h.totalPoints, color: h.color }));
}

export function entriesFromCricketStandings(standings: TeamStandingsEntry[], entrantOf: (teamId: string, teamName: string) => string): DisciplineEntry[] {
    return standings.map(s => ({ discipline: 'CRICKET' as SportDiscipline, entrant: entrantOf(s.teamId, s.teamName), points: s.points }));
}

/** League points from completed field/court matches, keyed by the entrant each team belongs to. */
export function entriesFromFieldSportMatches(matches: FieldSportMatch[], entrantOf: (teamId: string, teamName: string) => string): DisciplineEntry[] {
    const out: DisciplineEntry[] = [];
    for (const m of matches) {
        if (m.status !== 'FULL_TIME') continue;
        const s = summarize(m);
        if (!s.leaguePoints) continue;
        out.push({ discipline: m.sport, entrant: entrantOf(m.home.teamId, m.home.name), points: s.leaguePoints.home, color: m.home.color });
        out.push({ discipline: m.sport, entrant: entrantOf(m.away.teamId, m.away.name), points: s.leaguePoints.away, color: m.away.color });
    }
    return out;
}
