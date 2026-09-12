import { describe, it, expect } from 'vitest';
import { computeProjection } from '../projectionService';
import {
    applyActionToFold,
    buildFoldFromActions,
    projectionFromFold,
    stripUndefined,
    FoldContext,
} from '../incrementalProjection';
import { ScoringAction, WicketType } from '@/types/scoring';

const ctx: FoldContext = {
    matchId: 'm1',
    homeTeamId: 'home',
    awayTeamId: 'away',
    homeTeamName: 'Home XI',
    awayTeamName: 'Away XI',
};

function mulberry32(seed: number) {
    return () => {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const WICKETS: WicketType[] = ['bowled', 'caught', 'lbw', 'run_out', 'stumped'];

/** A plausible two-innings match with extras, wickets, bowler changes, voids and an INNINGS_END event. */
function generateMatch(seed: number): ScoringAction[] {
    const rnd = mulberry32(seed);
    const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];
    const actions: ScoringAction[] = [];
    let seq = 0;

    for (const inningsNumber of [1, 2] as const) {
        const bat = inningsNumber === 1 ? 'h' : 'a';
        const bowl = inningsNumber === 1 ? 'a' : 'h';
        const order = Array.from({ length: 11 }, (_, i) => `${bat}${i + 1}`);
        const bowlers = Array.from({ length: 5 }, (_, i) => `${bowl}${i + 1}`);
        let striker = order[0], nonStriker = order[1], nextIn = 2;
        let wickets = 0, legalBalls = 0, over = 0, ballInOver = 1;
        let bowler = bowlers[0];
        const maxBalls = 60 + Math.floor(rnd() * 61);

        while (wickets < 10 && legalBalls < maxBalls) {
            const r = rnd();
            let runsOffBat = 0, wide = 0, noBall = 0, bye = 0, legBye = 0, isWicket = false;
            if (r < 0.05) wide = 1;
            else if (r < 0.08) { noBall = 1; runsOffBat = pick([0, 1, 4]); }
            else if (r < 0.11) bye = pick([1, 2]);
            else if (r < 0.14) legBye = 1;
            else if (r < 0.19) isWicket = true;
            else runsOffBat = pick([0, 0, 0, 1, 1, 2, 3, 4, 6]);

            const isLegalDelivery = wide === 0 && noBall === 0;
            const totalRuns = runsOffBat + wide + noBall + bye + legBye;
            const action: ScoringAction = {
                id: `a${++seq}`, matchId: 'm1', inningsNumber, overNumber: over, ballInOver,
                sequenceNumber: seq, strikerId: striker, nonStrikerId: nonStriker, bowlerId: bowler,
                runsOffBat, extras: { wide, noBall, bye, legBye, penalty: 0 }, totalRuns, isWicket,
                isLegalDelivery, timestamp: `t${seq}`, source: 'live', isVoided: false, createdAt: `t${seq}`,
            };
            if (isWicket) {
                const type = pick(WICKETS);
                const dismissed = type === 'run_out' && rnd() < 0.5 ? nonStriker : striker;
                action.wicket = { type, dismissedPlayerId: dismissed, fielderIds: type === 'caught' ? [pick(bowlers)] : undefined };
            }
            if (rnd() < 0.3) action.shotData = { coordinates: { x: rnd(), y: rnd() } };

            // ~4% of balls are undone; they still consume a sequence number.
            if (rnd() < 0.04) {
                actions.push({ ...action, isVoided: true, voidReason: 'test' });
                continue;
            }
            actions.push(action);

            if (isWicket) {
                wickets++;
                const dismissed = action.wicket!.dismissedPlayerId;
                if (wickets < 10) {
                    if (dismissed === striker) striker = order[nextIn++];
                    else nonStriker = order[nextIn++];
                }
            } else if (totalRuns % 2 === 1) {
                [striker, nonStriker] = [nonStriker, striker];
            }

            if (isLegalDelivery) {
                legalBalls++;
                if (ballInOver === 6) {
                    over++; ballInOver = 1;
                    [striker, nonStriker] = [nonStriker, striker];
                    bowler = pick(bowlers.filter(b => b !== bowler));
                } else {
                    ballInOver++;
                }
            } else {
                ballInOver++;
            }
        }

        if (inningsNumber === 1 || rnd() < 0.5) {
            const last = actions[actions.length - 1];
            actions.push({
                id: `a${++seq}`, matchId: 'm1', inningsNumber, overNumber: last.overNumber, ballInOver: last.ballInOver,
                sequenceNumber: seq, strikerId: last.strikerId, nonStrikerId: last.nonStrikerId, bowlerId: last.bowlerId,
                runsOffBat: 0, extras: { wide: 0, noBall: 0, bye: 0, legBye: 0, penalty: 0 }, totalRuns: 0,
                isWicket: false, isLegalDelivery: false, timestamp: `t${seq}`, source: 'manual_entry',
                eventType: 'INNINGS_END', isVoided: false, createdAt: `t${seq}`,
            });
        }
    }
    return actions;
}

function normalise(p: ReturnType<typeof computeProjection>) {
    const { lastUpdated: _, ...rest } = stripUndefined(p);
    return rest;
}

const reference = (actions: ScoringAction[]) =>
    normalise(computeProjection(actions, ctx.matchId, ctx.homeTeamId, ctx.awayTeamId, ctx.homeTeamName, ctx.awayTeamName));

describe('incrementalProjection', () => {
    const seeds = Array.from({ length: 40 }, (_, i) => i + 1);

    it.each(seeds)('full fold matches computeProjection (seed %i)', (seed) => {
        const actions = generateMatch(seed);
        const fold = buildFoldFromActions(actions, ctx);
        expect(normalise(projectionFromFold(fold, ctx))).toEqual(reference(actions));
        expect(fold.headSequence).toBe(actions.length);
    });

    it.each(seeds)('projection matches at every prefix of the log (seed %i)', (seed) => {
        const actions = generateMatch(seed);
        for (let n = 0; n <= actions.length; n += 7) {
            const prefix = actions.slice(0, n);
            expect(normalise(projectionFromFold(buildFoldFromActions(prefix, ctx), ctx))).toEqual(reference(prefix));
        }
    });

    it.each(seeds)('a fold persisted mid-match resumes to the same projection (seed %i)', (seed) => {
        const actions = generateMatch(seed);
        const cut = Math.floor(actions.length * 0.6);
        // Round-trip through JSON: this is what comes back from Firestore.
        const fold = stripUndefined(buildFoldFromActions(actions.slice(0, cut), ctx));
        for (const action of actions.slice(cut)) {
            fold.headSequence = Math.max(fold.headSequence, action.sequenceNumber);
            if (!action.isVoided) applyActionToFold(fold, action, ctx);
        }
        expect(normalise(projectionFromFold(fold, ctx))).toEqual(reference(actions));
    });

    it('an empty fold yields the scheduled projection', () => {
        expect(normalise(projectionFromFold(buildFoldFromActions([], ctx), ctx))).toEqual(reference([]));
    });
});
