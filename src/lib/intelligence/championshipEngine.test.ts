import { describe, it, expect } from 'vitest';
import { computeChampionship, entriesFromHousePoints, entriesFromFieldSportMatches, entriesFromCricketStandings, type DisciplineEntry } from './championshipEngine';
import { createMatch, startPeriod, recordScore, endPeriod } from './fieldSportEngine';

const e = (discipline: DisciplineEntry['discipline'], entrant: string, points: number): DisciplineEntry => ({ discipline, entrant, points });

describe('computeChampionship', () => {
    const entries = [
        e('SWIMMING', 'Nash', 142), e('SWIMMING', 'Hill', 128), e('SWIMMING', 'Thomson', 115),
        e('ATHLETICS', 'Hill', 185), e('ATHLETICS', 'Nash', 172), e('ATHLETICS', 'Thomson', 124),
        e('CRICKET', 'Thomson', 12), e('CRICKET', 'Nash', 8), e('CRICKET', 'Hill', 8),
    ];

    it('PERCENT_OF_LEADER normalises each discipline so scales do not dominate', () => {
        const rows = computeChampionship(entries);
        const nash = rows.find(r => r.entrant === 'Nash')!;
        expect(nash.byDiscipline.SWIMMING).toEqual({ raw: 142, contribution: 100, rank: 1 });
        expect(nash.byDiscipline.ATHLETICS!.contribution).toBeCloseTo(93, 0);
        expect(nash.byDiscipline.CRICKET).toMatchObject({ rank: 2, contribution: 66.7 });
        expect(rows[0].entrant).toBe('Nash');
        expect(rows.map(r => r.rank)).toEqual([1, 2, 3]);
    });

    it('RAW just sums, so the gala dominates', () => {
        const rows = computeChampionship(entries, { method: 'RAW' });
        // Nash 142+172+8 = 322 edges Hill 128+185+8 = 321; the gala/meet totals swamp cricket's 8–12
        expect(rows.map(r => [r.entrant, r.overallScore])).toEqual([['Nash', 322], ['Hill', 321], ['Thomson', 251]]);
    });

    it('RANK_POINTS shares tied ranks and uses the table', () => {
        const rows = computeChampionship(entries, { method: 'RANK_POINTS' });
        const nash = rows.find(r => r.entrant === 'Nash')!;
        const hill = rows.find(r => r.entrant === 'Hill')!;
        expect(nash.byDiscipline.CRICKET).toEqual({ raw: 8, contribution: 8, rank: 2 });
        expect(hill.byDiscipline.CRICKET).toEqual({ raw: 8, contribution: 8, rank: 2 });
        expect(nash.overallScore).toBe(10 + 8 + 8);
    });

    it('weights scale a discipline and duplicates merge', () => {
        const rows = computeChampionship([e('RUGBY', 'A', 4), e('RUGBY', 'A', 4), e('RUGBY', 'B', 4)], { method: 'RAW', weights: { RUGBY: 2 } });
        expect(rows[0]).toMatchObject({ entrant: 'A', overallScore: 16, disciplineWins: 1 });
        expect(rows[1]).toMatchObject({ entrant: 'B', overallScore: 8, rank: 2 });
    });

    it('breaks overall ties by discipline wins, then name', () => {
        const rows = computeChampionship([e('SWIMMING', 'X', 10), e('SWIMMING', 'Y', 5), e('ATHLETICS', 'Y', 10), e('ATHLETICS', 'X', 5), e('CRICKET', 'X', 3), e('CRICKET', 'Y', 3)]);
        // X: 100 + 50 + 100 = 250, wins 2 ; Y: 50 + 100 + 100 = 250, wins 2 → name
        expect(rows.map(r => [r.entrant, r.rank])).toEqual([['X', 1], ['Y', 1]]);
    });
});

describe('adapters', () => {
    it('house points → entries', () => {
        const out = entriesFromHousePoints('SWIMMING', [{ houseName: 'Nash', color: '#f00', totalPoints: 10, goldCount: 1, silverCount: 0, bronzeCount: 0, recordsBrokenCount: 0 }]);
        expect(out).toEqual([{ discipline: 'SWIMMING', entrant: 'Nash', points: 10, color: '#f00' }]);
    });
    it('cricket standings → entries by school', () => {
        const out = entriesFromCricketStandings([{ teamId: 't1', teamName: 'KES 1st XI', points: 12 } as any], () => 'KES');
        expect(out).toEqual([{ discipline: 'CRICKET', entrant: 'KES', points: 12 }]);
    });
    it('field sport matches → league points only when full time', () => {
        const T = Date.now();
        let m = startPeriod(createMatch('HOCKEY', { teamId: 'h', name: 'Nash' }, { teamId: 'a', name: 'Hill' }), T);
        m = recordScore(m, 'home', 'FG', undefined, T + 1000);
        const live = entriesFromFieldSportMatches([m], (_, n) => n);
        expect(live).toEqual([]);
        for (let i = 0; i < 4; i++) { m = endPeriod(m, T + 2000 + i * 10); if (m.status === 'BREAK') m = startPeriod(m, T + 2005 + i * 10); }
        const done = entriesFromFieldSportMatches([m], (_, n) => n);
        expect(done).toEqual([{ discipline: 'HOCKEY', entrant: 'Nash', points: 3, color: undefined }, { discipline: 'HOCKEY', entrant: 'Hill', points: 0, color: undefined }]);
    });
});
