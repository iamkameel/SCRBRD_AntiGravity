/**
 * Cricket-side data for the multi-sport platform:
 *   - XI appearances + bowling overs (trailing window) → passport sessions
 *   - completed match results → league standings for the championship shield
 * Both degrade to [] on any read failure; the platform's cricket inputs then
 * simply contribute nothing rather than blocking the other disciplines.
 */

import { doc, getDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { queryDocsLenient, fetchWhereIn, fetchByIds, toDate } from '@/lib/services/firestoreQuery';
import type { Team, Match, Person } from '@/types/firestore';
import { extractBowlerEntries, type BowlerOversEntry } from '@/lib/intelligence/workloadEngine';
import type { MatchResultRecord } from '@/lib/intelligence/competitionEngine';

export interface CricketAppearance { personId: string; name: string; teamName: string; matchId: string; date: string; format?: string; }

export interface CricketWindow {
    appearances: CricketAppearance[];
    bowling: BowlerOversEntry[];
    results: MatchResultRecord[];
    teams: Team[];
}

const isCompleted = (m: Match) => m.state === 'COMPLETED' || m.status === 'completed';

export const multiSportService = {
    async loadCricketWindow(schoolId: string, windowDays = 7, resultsDays = 120): Promise<CricketWindow> {
        try {
            const teams = await queryDocsLenient<Team>('teams', [where('schoolId', '==', schoolId)]);
            if (!teams.length) return { appearances: [], bowling: [], results: [], teams: [] };
            const teamIds = teams.map(t => t.id);
            const teamById = new Map(teams.map(t => [t.id, t]));
            const own = new Set(teamIds);

            const [home, away] = await Promise.all([
                fetchWhereIn<Match>('matches', 'homeTeamId', teamIds),
                fetchWhereIn<Match>('matches', 'awayTeamId', teamIds),
            ]);
            const byId = new Map<string, Match>();
            [...home, ...away].forEach(m => byId.set(m.id, m));
            const now = Date.now();
            const completed = Array.from(byId.values()).filter(isCompleted);

            // ── Results (for standings) ──
            const results: MatchResultRecord[] = completed
                .filter(m => { const d = toDate(m.matchDate); return d && d.getTime() >= now - resultsDays * 86_400_000; })
                .map(m => ({
                    fixtureId: m.id,
                    homeTeamId: m.homeTeamId, awayTeamId: m.awayTeamId,
                    homeTeamName: teamById.get(m.homeTeamId)?.name ?? m.homeTeamName ?? 'Home',
                    awayTeamName: teamById.get(m.awayTeamId)?.name ?? m.awayTeamName ?? 'Away',
                    homeRuns: Number(m.homeScore ?? 0), homeWickets: 0, homeOvers: m.overs ?? 50,
                    awayRuns: Number(m.awayScore ?? 0), awayWickets: 0, awayOvers: m.overs ?? 50,
                    winnerTeamId: (m as any).winnerId,
                    status: (m as any).winnerId ? 'COMPLETED' : /tie/i.test(String(m.result ?? '')) ? 'TIED' : 'NO_RESULT',
                    maxOversAllocated: m.overs ?? 50,
                }));

            // ── Appearances + bowling (trailing window) ──
            const recent = completed
                .filter(m => { const d = toDate(m.matchDate); return d && d.getTime() >= now - windowDays * 86_400_000; })
                .slice(0, 40);
            const personIds = new Set<string>();
            const raw: Array<{ personId: string; teamId: string; matchId: string; date: string; format?: string }> = [];
            for (const m of recent) {
                const date = toDate(m.matchDate)!.toISOString();
                (['home', 'away'] as const).forEach(side => {
                    const teamId = side === 'home' ? m.homeTeamId : m.awayTeamId;
                    if (!own.has(teamId)) return;
                    (m.teamSelection?.[side]?.playingXI ?? []).forEach(pid => { personIds.add(pid); raw.push({ personId: pid, teamId, matchId: m.id, date, format: m.matchType }); });
                });
            }
            const [people, projections] = await Promise.all([
                fetchByIds<Person>('people', Array.from(personIds)),
                Promise.all(recent.map(async m => { try { const s = await getDoc(doc(db, 'matches', m.id, 'live', 'score')); return s.exists() ? (s.data() as any) : null; } catch { return null; } })),
            ]);
            const nameOf = new Map(people.map(p => [p.id, p.displayName || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || p.id]));
            const appearances: CricketAppearance[] = raw.map(r => ({ personId: r.personId, name: nameOf.get(r.personId) ?? r.personId, teamName: teamById.get(r.teamId)?.name ?? 'Squad', matchId: r.matchId, date: r.date, format: r.format }));
            const bowling = recent.flatMap((m, i) => extractBowlerEntries(m.id, toDate(m.matchDate)!.toISOString(), projections[i], own, id => teamById.get(id)?.name ?? 'Squad'));

            return { appearances, bowling, results, teams };
        } catch (err) {
            console.warn('[multiSportService] cricket window unavailable:', err);
            return { appearances: [], bowling: [], results: [], teams: [] };
        }
    },
};
