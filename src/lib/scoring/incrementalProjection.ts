/**
 * Incremental Projection Fold
 * ===========================
 *
 * `computeProjection` folds the entire ScoringAction log into a
 * LiveScoreProjection. Re-running that fold on every ball means reading the
 * whole log per ball — O(n) reads per ball, O(n²) per match.
 *
 * This module carries the fold's intermediate state as a plain, serialisable
 * object (`ProjectionFold`) so a single new action can be applied on top of
 * the persisted state, and the projection derived from it. It is guaranteed
 * to produce exactly what `computeProjection` would produce for the same
 * non-voided actions — see `__tests__/incrementalProjection.test.ts`.
 *
 * Assumption shared with computeProjection: within an innings, overNumber is
 * non-decreasing across the action sequence.
 */

import {
    ScoringAction,
    LiveScoreProjection,
    InningsProjection,
    BatsmanProjection,
    BowlerProjection,
    FallOfWicketEntry,
    PartnershipData,
    ExtrasBreakdown,
} from '@/types/scoring';
import {
    formatOvers,
    calculateStrikeRate,
    calculateEconomy,
    calculateRunRate,
    getCurrentOverBalls,
    getNextStriker,
    getNextNonStriker,
    computeMatchResult,
} from './projectionService';

export const FOLD_VERSION = 1;
const MAX_BALLS_PER_INNINGS = 120;

export interface FoldContext {
    matchId: string;
    homeTeamId: string;
    awayTeamId: string;
    homeTeamName?: string;
    awayTeamName?: string;
}

interface BowlerOverTracker {
    over: number;
    runs: number;
    balls: number;
    maidens: number;
}

export interface InningsFold {
    inningsNumber: 1 | 2;
    battingTeamId: string;
    bowlingTeamId: string;
    battingTeamName?: string;
    bowlingTeamName?: string;
    runs: number;
    wickets: number;
    balls: number;
    nextBattingPosition: number;
    extras: ExtrasBreakdown;
    batsmen: Record<string, BatsmanProjection>;
    bowlers: Record<string, BowlerProjection>;
    fallOfWickets: FallOfWicketEntry[];
    closedPartnerships: PartnershipData[];
    currentPartnership: PartnershipData;
    bowlerLastOver: Record<string, number>;
    bowlerOvers: Record<string, BowlerOverTracker>;
    hasInningsEndEvent: boolean;
    lastAction: ScoringAction | null;
    currentOverActions: ScoringAction[];
}

export interface ProjectionFold {
    version: number;
    matchId: string;
    /** Highest sequenceNumber seen, voided or not — used to detect a stale fold. */
    headSequence: number;
    innings1: InningsFold | null;
    innings2: InningsFold | null;
    /** bowlerIds of the last three wickets in the match, oldest first. */
    recentWicketBowlerIds: string[];
}

export function newFold(matchId: string): ProjectionFold {
    return {
        version: FOLD_VERSION,
        matchId,
        headSequence: 0,
        innings1: null,
        innings2: null,
        recentWicketBowlerIds: [],
    };
}

function newPartnership(number: number, startScore: number): PartnershipData {
    return {
        partnershipNumber: number,
        batsmanAId: '',
        batsmanBId: '',
        runs: 0,
        balls: 0,
        batsmanARuns: 0,
        batsmanBRuns: 0,
        startScore,
    };
}

function newInningsFold(inningsNumber: 1 | 2, ctx: FoldContext): InningsFold {
    const home = inningsNumber === 1;
    return {
        inningsNumber,
        battingTeamId: home ? ctx.homeTeamId : ctx.awayTeamId,
        bowlingTeamId: home ? ctx.awayTeamId : ctx.homeTeamId,
        battingTeamName: home ? ctx.homeTeamName : ctx.awayTeamName,
        bowlingTeamName: home ? ctx.awayTeamName : ctx.homeTeamName,
        runs: 0,
        wickets: 0,
        balls: 0,
        nextBattingPosition: 1,
        extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 },
        batsmen: {},
        bowlers: {},
        fallOfWickets: [],
        closedPartnerships: [],
        currentPartnership: newPartnership(1, 0),
        bowlerLastOver: {},
        bowlerOvers: {},
        hasInningsEndEvent: false,
        lastAction: null,
        currentOverActions: [],
    };
}

function newBatsman(playerId: string, battingPosition: number, entryScore: number, entryWickets: number): BatsmanProjection {
    return {
        playerId, battingPosition,
        runs: 0, ballsFaced: 0, fours: 0, sixes: 0, strikeRate: 0,
        dotBalls: 0, singles: 0, doubles: 0, threes: 0,
        isOut: false, isOnStrike: false,
        entryScore, entryWickets,
    };
}

function newBowler(playerId: string): BowlerProjection {
    return {
        playerId,
        overs: 0, ballsBowled: 0, maidens: 0, runsConceded: 0, wickets: 0,
        wides: 0, noBalls: 0, economy: 0, dotBalls: 0, dotBallPercentage: 0,
        spells: [],
    };
}

function trackBowlerOver(inn: InningsFold, action: ScoringAction) {
    let t = inn.bowlerOvers[action.bowlerId];
    if (!t) {
        t = { over: -1, runs: 0, balls: 0, maidens: 0 };
        inn.bowlerOvers[action.bowlerId] = t;
    }
    if (action.overNumber !== t.over) {
        if (t.over >= 0 && t.balls === 6 && t.runs === 0) t.maidens++;
        t.over = action.overNumber;
        t.runs = 0;
        t.balls = 0;
    }
    if (action.isLegalDelivery) t.balls++;
    t.runs += action.totalRuns;
}

/** Mutates `fold` in place and returns it. Callers must not pass voided actions. */
export function applyActionToFold(fold: ProjectionFold, action: ScoringAction, ctx: FoldContext): ProjectionFold {
    fold.headSequence = Math.max(fold.headSequence, action.sequenceNumber);

    const key = action.inningsNumber === 2 ? 'innings2' : 'innings1';
    if (!fold[key]) fold[key] = newInningsFold(action.inningsNumber === 2 ? 2 : 1, ctx);
    const inn = fold[key]!;

    if (inn.lastAction && inn.lastAction.overNumber === action.overNumber) {
        inn.currentOverActions.push(action);
    } else {
        inn.currentOverActions = [action];
    }
    inn.lastAction = action;

    if (action.eventType === 'INNINGS_END' || action.eventType === 'MATCH_END') {
        if (action.eventType === 'INNINGS_END') inn.hasInningsEndEvent = true;
        // computeProjection's maiden calculation filters all actions by bowlerId,
        // events included, so feed the tracker to stay byte-for-byte equivalent.
        if (inn.bowlers[action.bowlerId]) trackBowlerOver(inn, action);
        return fold;
    }

    if (!inn.batsmen[action.strikerId]) {
        inn.batsmen[action.strikerId] = newBatsman(action.strikerId, inn.nextBattingPosition++, inn.runs, inn.wickets);
    }
    if (!inn.batsmen[action.nonStrikerId]) {
        inn.batsmen[action.nonStrikerId] = newBatsman(action.nonStrikerId, inn.nextBattingPosition++, inn.runs, inn.wickets);
    }

    const p = inn.currentPartnership;
    if (!p.batsmanAId) {
        p.batsmanAId = action.strikerId;
        p.batsmanBId = action.nonStrikerId;
        p.startScore = inn.runs;
    }

    if (!inn.bowlers[action.bowlerId]) {
        inn.bowlers[action.bowlerId] = newBowler(action.bowlerId);
    }

    const batsman = inn.batsmen[action.strikerId];
    const bowler = inn.bowlers[action.bowlerId];

    inn.runs += action.totalRuns;
    batsman.runs += action.runsOffBat;
    bowler.runsConceded += action.totalRuns;

    if (action.isLegalDelivery) {
        inn.balls++;
        batsman.ballsFaced++;
        bowler.ballsBowled++;
    }

    if (action.runsOffBat === 4) batsman.fours++;
    else if (action.runsOffBat === 6) batsman.sixes++;

    if (action.runsOffBat === 0 && !action.isWicket && Object.values(action.extras).every(e => e === 0)) {
        batsman.dotBalls++;
        bowler.dotBalls++;
    }

    if (action.runsOffBat === 1) batsman.singles++;
    if (action.runsOffBat === 2) batsman.doubles++;
    if (action.runsOffBat === 3) batsman.threes++;

    const ex = action.extras;
    inn.extras.wides += ex.wide;
    inn.extras.noBalls += ex.noBall;
    inn.extras.byes += ex.bye;
    inn.extras.legByes += ex.legBye;
    inn.extras.penalty += ex.penalty;
    inn.extras.total += ex.wide + ex.noBall + ex.bye + ex.legBye + ex.penalty;

    if (ex.wide > 0) bowler.wides++;
    if (ex.noBall > 0) bowler.noBalls++;

    p.runs += action.totalRuns;
    if (action.isLegalDelivery) p.balls++;
    if (action.strikerId === p.batsmanAId) p.batsmanARuns += action.runsOffBat;
    else p.batsmanBRuns += action.runsOffBat;

    if (action.isWicket && action.wicket) {
        inn.wickets++;
        bowler.wickets++;

        const out = inn.batsmen[action.wicket.dismissedPlayerId];
        if (out) {
            out.isOut = true;
            out.dismissal = {
                type: action.wicket.type,
                bowlerId: action.bowlerId,
                fielderIds: action.wicket.fielderIds,
                overNumber: action.overNumber,
                ballInOver: action.ballInOver,
            };
        }

        inn.fallOfWickets.push({
            wicketNumber: inn.wickets,
            score: inn.runs,
            over: formatOvers(inn.balls).toString(),
            overNumber: action.overNumber,
            ballInOver: action.ballInOver,
            batsmanOutId: action.wicket.dismissedPlayerId,
            bowlerId: action.bowlerId,
            wicketType: action.wicket.type,
            partnershipRuns: p.runs,
        });

        inn.closedPartnerships.push({ ...p });
        inn.currentPartnership = newPartnership(inn.closedPartnerships.length + 1, inn.runs);

        fold.recentWicketBowlerIds = [...fold.recentWicketBowlerIds, action.bowlerId].slice(-3);
    }

    const lastOver = inn.bowlerLastOver[action.bowlerId];
    if (lastOver === undefined || action.overNumber > lastOver + 1) {
        bowler.spells.push({
            spellNumber: bowler.spells.length + 1,
            startOver: action.overNumber,
            endOver: action.overNumber,
            overs: 0, runs: 0, wickets: 0, maidens: 0,
        });
    }
    const spell = bowler.spells[bowler.spells.length - 1];
    spell.endOver = action.overNumber;
    spell.runs += action.totalRuns;
    if (action.isWicket) spell.wickets++;
    inn.bowlerLastOver[action.bowlerId] = action.overNumber;

    trackBowlerOver(inn, action);

    return fold;
}

/** Rebuild a fold from the full log (voided actions are skipped but still advance headSequence). */
export function buildFoldFromActions(actions: ScoringAction[], ctx: FoldContext): ProjectionFold {
    const fold = newFold(ctx.matchId);
    const sorted = [...actions].sort((a, b) =>
        a.inningsNumber !== b.inningsNumber ? a.inningsNumber - b.inningsNumber : a.sequenceNumber - b.sequenceNumber
    );
    for (const action of sorted) {
        fold.headSequence = Math.max(fold.headSequence, action.sequenceNumber);
        if (!action.isVoided) applyActionToFold(fold, action, ctx);
    }
    return fold;
}

export function isInningsFoldComplete(inn: InningsFold): boolean {
    return inn.hasInningsEndEvent || inn.wickets >= 10 || inn.balls >= MAX_BALLS_PER_INNINGS;
}

function finalizeInnings(inn: InningsFold): InningsProjection {
    const bowlers = Object.values(inn.bowlers).map(b => {
        const t = inn.bowlerOvers[b.playerId];
        const maidens = t ? t.maidens + (t.balls === 6 && t.runs === 0 ? 1 : 0) : 0;
        return {
            ...b,
            spells: b.spells.map(s => ({ ...s })),
            maidens,
            overs: formatOvers(b.ballsBowled),
            economy: calculateEconomy(b.runsConceded, b.ballsBowled),
            dotBallPercentage: b.ballsBowled > 0 ? parseFloat(((b.dotBalls / b.ballsBowled) * 100).toFixed(1)) : 0,
        };
    });

    const batsmen = Object.values(inn.batsmen)
        .map(b => ({ ...b, strikeRate: calculateStrikeRate(b.runs, b.ballsFaced) }))
        .sort((a, b) => a.battingPosition - b.battingPosition);

    const cp = inn.currentPartnership;
    const partnerships = cp.runs > 0 || cp.balls > 0
        ? [...inn.closedPartnerships, { ...cp }]
        : [...inn.closedPartnerships];

    return {
        inningsNumber: inn.inningsNumber,
        battingTeamId: inn.battingTeamId,
        battingTeamName: inn.battingTeamName,
        bowlingTeamId: inn.bowlingTeamId,
        bowlingTeamName: inn.bowlingTeamName,
        runs: inn.runs,
        wickets: inn.wickets,
        overs: formatOvers(inn.balls),
        balls: inn.balls,
        runRate: calculateRunRate(inn.runs, inn.balls),
        batsmen,
        bowlers,
        extras: { ...inn.extras },
        fallOfWickets: inn.fallOfWickets.map(f => ({ ...f })),
        partnerships,
        isComplete: isInningsFoldComplete(inn),
    };
}

export function projectionFromFold(fold: ProjectionFold, ctx: FoldContext): LiveScoreProjection {
    const innings1 = fold.innings1 ? finalizeInnings(fold.innings1) : null;
    const innings2 = fold.innings2 ? finalizeInnings(fold.innings2) : null;

    const hasSecondInnings = !!fold.innings2;
    const currentInningsNumber: 1 | 2 = hasSecondInnings ? 2 : 1;
    const currentFold = hasSecondInnings ? fold.innings2 : fold.innings1;
    const currentInningsData = hasSecondInnings ? innings2 : innings1;

    let status: LiveScoreProjection['status'] = 'live';
    if (!fold.innings1 && !fold.innings2) status = 'scheduled';
    else if (innings2?.isComplete) status = 'completed';
    else if (innings1?.isComplete && !hasSecondInnings) status = 'innings_break';

    const overActions = currentFold?.currentOverActions ?? [];
    const currentOver = getCurrentOverBalls(overActions);

    const lastAction = currentFold?.lastAction ?? null;
    const currentPlayers = lastAction
        ? {
            strikerId: lastAction.isWicket ? null : getNextStriker(lastAction, overActions),
            nonStrikerId: lastAction.isWicket ? lastAction.nonStrikerId : getNextNonStriker(lastAction, overActions),
            bowlerId: lastAction.bowlerId,
        }
        : { strikerId: null, nonStrikerId: null, bowlerId: null };

    const target = innings1?.runs !== undefined ? innings1.runs + 1 : undefined;
    const requiredRuns = target && currentInningsData ? target - currentInningsData.runs : undefined;
    const remainingBalls = currentInningsData ? Math.max(0, MAX_BALLS_PER_INNINGS - currentInningsData.balls) : undefined;
    const requiredRunRate = requiredRuns && remainingBalls && remainingBalls > 0
        ? parseFloat((requiredRuns / (remainingBalls / 6)).toFixed(2))
        : undefined;

    const projection: LiveScoreProjection = {
        matchId: ctx.matchId,
        status,
        inningsNumber: currentInningsNumber,
        currentInnings: {
            battingTeamId: currentInningsData?.battingTeamId || (currentInningsNumber === 1 ? ctx.homeTeamId : ctx.awayTeamId),
            battingTeamName: currentInningsData?.battingTeamName,
            bowlingTeamId: currentInningsData?.bowlingTeamId || (currentInningsNumber === 1 ? ctx.awayTeamId : ctx.homeTeamId),
            bowlingTeamName: currentInningsData?.bowlingTeamName,
            runs: currentInningsData?.runs || 0,
            wickets: currentInningsData?.wickets || 0,
            overs: currentInningsData?.overs || 0,
            balls: currentInningsData?.balls || 0,
            runRate: currentInningsData?.runRate || 0,
            target: currentInningsNumber === 2 ? target : undefined,
            requiredRunRate: currentInningsNumber === 2 ? requiredRunRate : undefined,
            requiredRuns: currentInningsNumber === 2 ? requiredRuns : undefined,
        },
        currentPlayers,
        batsmen: currentInningsData?.batsmen || [],
        bowlers: currentInningsData?.bowlers || [],
        currentOver,
        partnership: currentInningsData?.partnerships[currentInningsData.partnerships.length - 1] || newPartnership(1, 0),
        fallOfWickets: currentInningsData?.fallOfWickets || [],
        extras: currentInningsData?.extras || { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalty: 0, total: 0 },
        lastUpdated: new Date().toISOString(),
        lastActionId: lastAction?.id || '',
        lastActionSequence: lastAction?.sequenceNumber || 0,
        version: 1,
    };

    if (innings1 && (innings1.isComplete || hasSecondInnings)) projection.innings1 = innings1;
    if (innings2) projection.innings2 = innings2;

    if (status === 'completed' && innings1 && innings2) {
        projection.result = computeMatchResult(innings1, innings2, ctx.homeTeamId, ctx.awayTeamId, ctx.homeTeamName, ctx.awayTeamName);
    }

    return projection;
}

/** Firestore rejects `undefined`; the fold and projection both carry optional fields. */
export function stripUndefined<T>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}
