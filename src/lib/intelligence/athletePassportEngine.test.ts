import { describe, it, expect } from 'vitest';
import { computeLoad, buildPassports, identityKey, sessionsFromSwimmingGala, sessionsFromAthleticsMeet, sessionsFromCricket, sessionsFromFieldSportMatches, LOAD_SCALE_AU, type LoadSession } from './athletePassportEngine';
import { MOCK_SWIMMING_GALA, MOCK_ATHLETICS_MEET } from './multiSportEngine';
import { createMatch, startPeriod, recordScore } from './fieldSportEngine';

const NOW = '2026-09-12T18:00:00Z';
const s = (over: Partial<LoadSession>): LoadSession => ({ discipline: 'CRICKET', date: '2026-09-10T09:00:00Z', kind: 'MATCH', durationMin: 60, intensity: 5, label: 'x', ...over });

describe('computeLoad', () => {
    it('sums duration × intensity inside the window and bands the score', () => {
        const r = computeLoad([s({ durationMin: 100, intensity: 5 }), s({ date: '2026-08-01T00:00:00Z', durationMin: 999, intensity: 10 })], NOW);
        expect(r.acuteLoadAU).toBe(500);
        expect(r.loadScore).toBe(Math.round((500 / LOAD_SCALE_AU) * 100));
        expect(r.loadStatus).toBe('OPTIMAL');
        expect(r.sessions).toHaveLength(1);
    });
    it('flags back-to-back competition days, three disciplines and no rest day', () => {
        const r = computeLoad([
            s({ discipline: 'SWIMMING', kind: 'RACE', date: '2026-09-11T15:00:00Z', intensity: 9, durationMin: 30, label: 'Gala 50m' }),
            s({ discipline: 'CRICKET', kind: 'MATCH', date: '2026-09-12T09:00:00Z', intensity: 8, durationMin: 360, label: '1st XI v KES' }),
            s({ discipline: 'RUGBY', kind: 'MATCH', date: '2026-09-09T15:00:00Z', intensity: 8, durationMin: 70, label: 'Rugby' }),
            s({ discipline: 'CRICKET', kind: 'TRAINING', date: '2026-09-08T15:00:00Z', intensity: 5, durationMin: 90 }),
            s({ discipline: 'CRICKET', kind: 'TRAINING', date: '2026-09-07T15:00:00Z', intensity: 5, durationMin: 90 }),
            s({ discipline: 'CRICKET', kind: 'TRAINING', date: '2026-09-06T15:00:00Z', intensity: 5, durationMin: 90 }),
        ], NOW);
        expect(r.alerts.some(a => /Back-to-back competition: Gala 50m/.test(a))).toBe(true);
        expect(r.alerts.some(a => /3 disciplines/.test(a))).toBe(true);
        expect(r.alerts.some(a => /no rest day/.test(a))).toBe(true);
        expect(r.primary).toBe('CRICKET');
        expect(r.loadStatus).toBe('HIGH_OVERLOAD_RISK');
    });
});

describe('buildPassports', () => {
    it('merges sessions by identity key and orders heaviest first', () => {
        const out = buildPassports([
            { identity: { key: identityKey('p1', 'A'), personId: 'p1', name: 'A' }, session: s({ durationMin: 300, intensity: 8 }) },
            { identity: { key: identityKey(undefined, 'B'), name: 'B' }, session: s({ durationMin: 30, intensity: 5 }) },
            { identity: { key: identityKey('p1', 'A'), personId: 'p1', name: 'A', house: 'Nash' }, session: s({ discipline: 'RUGBY', durationMin: 70, intensity: 8 }) },
        ], NOW);
        expect(out.map(p => p.name)).toEqual(['A', 'B']);
        expect(out[0].house).toBe('Nash');
        expect(out[0].disciplines).toEqual(['CRICKET', 'RUGBY']);
        expect(out[0].sessions).toHaveLength(2);
    });
    it('name keys are case/space-insensitive', () => {
        expect(identityKey(undefined, ' Sebastian   Roux ')).toBe(identityKey(undefined, 'sebastian roux'));
    });
});

describe('adapters', () => {
    it('gala lanes become races with swimmer identity and house', () => {
        const out = sessionsFromSwimmingGala(MOCK_SWIMMING_GALA);
        expect(out).toHaveLength(8);
        const roux = out.find(x => x.identity.name === 'Sebastian Roux')!;
        expect(roux.identity).toMatchObject({ personId: 'sw-2', house: 'Nash' });
        expect(roux.session).toMatchObject({ discipline: 'SWIMMING', kind: 'RACE', intensity: 9 });
    });
    it('meet results become events keyed by name', () => {
        const out = sessionsFromAthleticsMeet(MOCK_ATHLETICS_MEET);
        expect(out).toHaveLength(6);
        expect(out[0].session).toMatchObject({ discipline: 'ATHLETICS', durationMin: 45, intensity: 7 }); // high jump = FIELD
    });
    it('cricket appearances get bowling intensity from overs', () => {
        const out = sessionsFromCricket(
            [{ personId: 'p1', name: 'J. Reed', teamName: '1st XI', matchId: 'm1', date: '2026-09-10T09:00:00Z' }, { personId: 'p2', name: 'K. Bat', teamName: '1st XI', matchId: 'm1', date: '2026-09-10T09:00:00Z', format: 'T20' }],
            [{ playerId: 'p1', teamId: 't', teamName: '1st XI', matchId: 'm1', matchDate: '2026-09-10', overs: 10 }]
        );
        expect(out[0].session).toMatchObject({ intensity: 10, durationMin: 360 });
        expect(out[0].session.label).toMatch(/10 ov/);
        expect(out[1].session).toMatchObject({ intensity: 5, durationMin: 200 });
    });
    it('field-sport matches attribute a session to every named player once', () => {
        let m = startPeriod(createMatch('HOCKEY', { teamId: 'h', name: 'H' }, { teamId: 'a', name: 'A' }));
        m = recordScore(m, 'home', 'FG', { id: 'x', name: 'X' });
        m = recordScore(m, 'home', 'FG', { id: 'x', name: 'X' });
        m = recordScore(m, 'away', 'PS', { name: 'Y' });
        const out = sessionsFromFieldSportMatches([m]);
        expect(out.map(o => o.identity.name).sort()).toEqual(['X', 'Y']);
        expect(out[0].session).toMatchObject({ discipline: 'HOCKEY', durationMin: 60, kind: 'MATCH' });
    });
});
