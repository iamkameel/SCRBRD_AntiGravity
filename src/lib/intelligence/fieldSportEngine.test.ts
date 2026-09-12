import { describe, it, expect } from 'vitest';
import {
    createMatch, startPeriod, startClock, stopClock, endPeriod, recordScore, recordCard, recordSub, undoLastEvent,
    deriveScore, activeSuspensions, foulTallies, playersOnField, summarize, periodElapsed, matchElapsed, formatClock, RULESETS,
} from './fieldSportEngine';

const T0 = Date.parse('2026-09-12T14:00:00Z');
const at = (sec: number) => T0 + sec * 1000;
const home = { teamId: 'h', name: 'Home 1st XV' };
const away = { teamId: 'a', name: 'Away 1st XV' };

describe('clock & periods', () => {
    it('tracks elapsed time only while running and carries across periods', () => {
        let m = createMatch('RUGBY', home, away, { now: T0 });
        expect(m.status).toBe('SCHEDULED');
        m = startPeriod(m, at(0));
        expect(m.status).toBe('LIVE');
        expect(periodElapsed(m, at(90))).toBe(90);
        m = stopClock(m, at(100));
        expect(periodElapsed(m, at(500))).toBe(100);     // frozen
        m = startClock(m, at(600));
        expect(periodElapsed(m, at(660))).toBe(160);
        m = endPeriod(m, at(700));
        expect(m.status).toBe('BREAK');
        m = startPeriod(m, at(1500));
        expect(m.period).toBe(2);
        expect(matchElapsed(m, at(1560))).toBe(RULESETS.RUGBY.periodSec + 60);
        m = endPeriod(m, at(1600));
        expect(m.status).toBe('FULL_TIME');
        expect(startPeriod(m, at(1700))).toBe(m); // no third half
    });
    it('formats the clock', () => {
        expect(formatClock(0)).toBe('00:00');
        expect(formatClock(2100)).toBe('35:00');
    });
});

describe('scoring', () => {
    it('derives rugby scoreline and breakdown from events', () => {
        let m = startPeriod(createMatch('RUGBY', home, away, { now: T0 }), at(0));
        m = recordScore(m, 'home', 'TRY', { name: 'A. Smith' }, at(60));
        m = recordScore(m, 'home', 'CON', { name: 'B. Jones' }, at(90));
        m = recordScore(m, 'away', 'PEN', { name: 'C. Brown' }, at(300));
        m = recordScore(m, 'away', 'DG', { name: 'C. Brown' }, at(400));
        const s = deriveScore(m);
        expect([s.home, s.away]).toEqual([7, 6]);
        expect(s.breakdown.home).toEqual({ TRY: 1, CON: 1 });
    });
    it('rejects unknown codes and scoring when not live', () => {
        const m = createMatch('HOCKEY', home, away, { now: T0 });
        expect(() => recordScore(m, 'home', 'FG', undefined, at(1))).toThrow(/not live/);
        expect(() => recordScore(startPeriod(m, at(0)), 'home', 'TRY', undefined, at(1))).toThrow(/Unknown score type/);
    });
    it('basketball point values', () => {
        let m = startPeriod(createMatch('BASKETBALL', home, away, { now: T0 }), at(0));
        m = recordScore(m, 'home', '3PT', { name: 'X' }, at(10));
        m = recordScore(m, 'home', '2PT', { name: 'X' }, at(20));
        m = recordScore(m, 'away', 'FT', { name: 'Y' }, at(30));
        expect(deriveScore(m)).toMatchObject({ home: 5, away: 1 });
    });
    it('undo removes the last score but not structural events', () => {
        let m = startPeriod(createMatch('SOCCER', home, away, { now: T0 }), at(0));
        m = recordScore(m, 'home', 'GOAL', { name: 'X' }, at(10));
        m = stopClock(m, at(20));
        m = undoLastEvent(m);
        expect(deriveScore(m).home).toBe(0);
        expect(m.events.map(e => e.type)).toEqual(['PERIOD_START', 'CLOCK_STOP']);
    });
});

describe('cards, suspensions, fouls', () => {
    it('rugby yellow is a 10-minute sin-bin that expires on the match clock', () => {
        let m = startPeriod(createMatch('RUGBY', home, away, { now: T0 }), at(0));
        m = recordCard(m, 'away', 'YC', { name: 'D. Prop' }, at(120));
        expect(activeSuspensions(m, at(130))).toMatchObject([{ playerName: 'D. Prop', remainingSec: 590 }]);
        expect(playersOnField(m, 'away', at(130))).toBe(14);
        expect(activeSuspensions(m, at(120 + 600))).toEqual([]);
        expect(playersOnField(m, 'away', at(800))).toBe(15);
    });
    it('a red card never expires; soccer yellow is a caution only', () => {
        let m = startPeriod(createMatch('SOCCER', home, away, { now: T0 }), at(0));
        m = recordCard(m, 'home', 'YC', { name: 'E' }, at(10));
        m = recordCard(m, 'home', 'RC', { name: 'F' }, at(20));
        const s = activeSuspensions(m, at(99999));
        expect(s).toHaveLength(1);
        expect(s[0]).toMatchObject({ playerName: 'F', endsAtMatchSec: null, remainingSec: null });
        expect(playersOnField(m, 'home', at(99999))).toBe(10);
    });
    it('basketball fouls tally and foul-out at five', () => {
        let m = startPeriod(createMatch('BASKETBALL', home, away, { now: T0 }), at(0));
        for (let i = 0; i < 5; i++) m = recordCard(m, 'home', 'PF', { id: 'p9', name: 'G' }, at(10 + i));
        m = recordCard(m, 'away', 'TF', { id: 'p3', name: 'H' }, at(100));
        const t = foulTallies(m);
        expect(t[0]).toMatchObject({ playerName: 'G', fouls: 5, fouledOut: true });
        expect(t[1]).toMatchObject({ playerName: 'H', fouls: 1, fouledOut: false });
        expect(foulTallies(startPeriod(createMatch('RUGBY', home, away), at(0)))).toEqual([]); // no foul limit
    });
});

describe('substitutions', () => {
    it('enforces the rugby sub cap and allows unlimited rolling subs in hockey', () => {
        let r = startPeriod(createMatch('RUGBY', home, away, { now: T0 }), at(0));
        for (let i = 0; i < 8; i++) r = recordSub(r, 'home', { name: `off${i}` }, { name: `on${i}` }, at(10 + i));
        expect(() => recordSub(r, 'home', { name: 'x' }, { name: 'y' }, at(100))).toThrow(/all 8 substitutions/);
        let h = startPeriod(createMatch('HOCKEY', home, away, { now: T0 }), at(0));
        for (let i = 0; i < 20; i++) h = recordSub(h, 'away', { name: `o${i}` }, { name: `n${i}` }, at(10 + i));
        expect(summarize(h).subsUsed.away).toBe(20);
    });
});

describe('summarize', () => {
    it('produces period scores, scorers, cards, result and league points', () => {
        let m = startPeriod(createMatch('HOCKEY', home, away, { now: T0 }), at(0));
        m = recordScore(m, 'home', 'FG', { name: 'A' }, at(100));
        m = endPeriod(m, at(900)); m = startPeriod(m, at(1000));
        m = recordScore(m, 'away', 'PC', { name: 'B' }, at(1100));
        m = recordScore(m, 'away', 'PS', { name: 'B' }, at(1200));
        m = recordCard(m, 'home', 'GC', { name: 'A' }, at(1300));
        m = endPeriod(m, at(1900)); m = startPeriod(m, at(2000)); m = endPeriod(m, at(2900));
        m = startPeriod(m, at(3000)); m = endPeriod(m, at(3900));
        const s = summarize(m);
        expect(s.result).toBe('AWAY');
        expect(s.periodScores).toEqual([{ period: 1, home: 1, away: 0 }, { period: 2, home: 0, away: 2 }, { period: 3, home: 0, away: 0 }, { period: 4, home: 0, away: 0 }]);
        expect(s.scorers[0]).toMatchObject({ playerName: 'B', points: 2, count: 2 });
        expect(s.cards).toHaveLength(1);
        expect(s.leaguePoints).toEqual({ home: 0, away: 3 });
    });
    it('result and league points are null until full time', () => {
        const m = startPeriod(createMatch('NETBALL', home, away, { now: T0 }), at(0));
        expect(summarize(m).result).toBeNull();
        expect(summarize(m).leaguePoints).toBeNull();
    });
});
