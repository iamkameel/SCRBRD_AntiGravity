import { describe, it, expect } from 'vitest';
import { ageFromTeamName, capForTeam, normaliseOvers, formatOvers, assessBowlingWorkload, extractBowlerEntries, type BowlerOversEntry } from './workloadEngine';

const NOW = '2026-09-12T18:00:00Z';
const e = (over: Partial<BowlerOversEntry>): BowlerOversEntry => ({
    playerId: 'p1', playerName: 'J. Reed', teamId: 't1', teamName: '1st XI', matchId: 'm1', matchDate: '2026-09-10T09:00:00Z', overs: 10, ...over,
});

describe('age bands', () => {
    it('parses common team-name forms', () => {
        expect(ageFromTeamName('U15A')).toBe(15);
        expect(ageFromTeamName('Under 13 B')).toBe(13);
        expect(ageFromTeamName('u-11 Colts')).toBe(11);
        expect(ageFromTeamName('1st XI')).toBeNull();
        expect(ageFromTeamName('U21')).toBeNull();
    });
    it('maps to the right cap', () => {
        expect(capForTeam('U13A').cap).toBe(12);
        expect(capForTeam('U14A')).toEqual({ maxAge: 15, label: 'U15', cap: 20 });
        expect(capForTeam('2nd XI')).toEqual({ label: 'Open', cap: 30 });
    });
});

describe('overs notation', () => {
    it('treats x.y as overs.balls and prefers ballsBowled', () => {
        expect(normaliseOvers(6.2)).toBeCloseTo(6.333, 3);
        expect(normaliseOvers('4.5')).toBeCloseTo(4.833, 3);
        expect(normaliseOvers(3.7)).toBe(3.7); // not a legal ball count → already decimal
        expect(normaliseOvers(undefined, 20)).toBeCloseTo(3.333, 3);
        expect(formatOvers(6.5)).toBe('6.3');
        expect(formatOvers(7)).toBe('7');
    });
});

describe('assessBowlingWorkload', () => {
    it('sums overs inside the window only and flags by utilisation', () => {
        const entries = [
            e({ matchId: 'm1', matchDate: '2026-09-06T09:00:00Z', overs: 10 }),  // 6 days ago ✓
            e({ matchId: 'm2', matchDate: '2026-09-09T09:00:00Z', overs: 8 }),   // ✓
            e({ matchId: 'm3', matchDate: '2026-09-11T09:00:00Z', overs: 7 }),   // ✓ → 25 / 30 = 0.83
            e({ matchId: 'm0', matchDate: '2026-09-01T09:00:00Z', overs: 10 }),  // outside window
        ];
        const [a] = assessBowlingWorkload(entries, NOW);
        expect(a.oversLast7).toBe(25);
        expect(a.matches).toBe(3);
        expect(a.cap).toBe(30);
        expect(a.level).toBe('MODERATE');
        expect(a.remainingOvers).toBe(5);
    });
    it('uses the youngest band a player bowled in as the binding cap', () => {
        const entries = [
            e({ matchId: 'm1', teamName: '1st XI', overs: 8 }),
            e({ matchId: 'm2', teamName: 'U15A', overs: 8, matchDate: '2026-09-11T09:00:00Z' }),
        ];
        const [a] = assessBowlingWorkload(entries, NOW);
        expect(a.ageBand).toBe('U15');
        expect(a.cap).toBe(20);
        expect(a.oversLast7).toBe(16);
        expect(a.level).toBe('MODERATE');
    });
    it('marks HIGH at or over the cap and sorts by utilisation', () => {
        const entries = [
            e({ playerId: 'a', matchId: 'm1', teamName: 'U13A', overs: 12 }),
            e({ playerId: 'b', matchId: 'm1', teamName: 'U13A', overs: 3 }),
        ];
        const out = assessBowlingWorkload(entries, NOW);
        expect(out.map(x => [x.playerId, x.level])).toEqual([['a', 'HIGH'], ['b', 'OK']]);
        expect(out[0].remainingOvers).toBe(0);
    });
});

describe('extractBowlerEntries', () => {
    const own = new Set(['home']);
    const name = (id: string) => (id === 'home' ? 'U15A' : 'Other');
    it('reads both innings and only counts our bowling side', () => {
        const out = extractBowlerEntries('m1', '2026-09-10', {
            innings1: { bowlingTeamId: 'away', bowlers: [{ playerId: 'x', overs: 5 }] },
            innings2: { bowlingTeamId: 'home', bowlers: [{ playerId: 'p1', name: 'J. Reed', overs: 6.2 }, { playerId: 'p2', overs: 0 }] },
        }, own, name);
        expect(out).toHaveLength(1);
        expect(out[0]).toMatchObject({ playerId: 'p1', teamName: 'U15A', matchId: 'm1' });
        expect(out[0].overs).toBeCloseTo(6.333, 3);
    });
    it('falls back to top-level bowlers for the current innings', () => {
        const out = extractBowlerEntries('m1', '2026-09-10', { currentInnings: { bowlingTeamId: 'home' }, bowlers: [{ playerId: 'p1', ballsBowled: 18 }] }, own, name);
        expect(out[0].overs).toBe(3);
    });
    it('handles a missing projection', () => {
        expect(extractBowlerEntries('m1', '2026-09-10', null, own, name)).toEqual([]);
    });
});
