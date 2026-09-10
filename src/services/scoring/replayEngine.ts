/**
 * SCRBRD Replay Scoring Engine
 * ============================================
 * Pure functional deterministic engine that derives 100% of innings and match
 * state strictly from an ordered event log of deliveries (BallEvents).
 * 
 * Guarantees zero state drift during undo/redo, offline sync replay,
 * and scorecard re-computation.
 */

import { BallEvent } from '@/types/schema_v4';
import {
    InningsProjection,
    BatsmanProjection,
    BowlerProjection,
    FallOfWicketEntry,
    PartnershipData,
    ExtrasBreakdown,
    BallSummary,
    WicketType
} from '@/types/scoring';

export interface ReplayEngineOutput {
    inningsNumber: 1 | 2;
    battingTeamId: string;
    bowlingTeamId: string;
    runs: number;
    wickets: number;
    oversDecimal: number;
    oversDisplay: string;
    legalBallsCount: number;
    runRate: number;
    batsmen: BatsmanProjection[];
    bowlers: BowlerProjection[];
    extras: ExtrasBreakdown;
    fallOfWickets: FallOfWicketEntry[];
    partnerships: PartnershipData[];
    currentOver: BallSummary[];
    currentStrikerId: string | null;
    currentNonStrikerId: string | null;
    currentBowlerId: string | null;
    isComplete: boolean;
}

/**
 * Normalises overs display (e.g. 4 legal balls in over 3 => 3.4)
 */
export function formatOversDisplay(legalBalls: number): string {
    const overs = Math.floor(legalBalls / 6);
    const balls = legalBalls % 6;
    return balls === 0 ? `${overs}.0` : `${overs}.${balls}`;
}

/**
 * Replays an array of BallEvents from scratch to construct the canonical Innings state.
 */
export function replayInningsEvents(
    events: BallEvent[],
    options?: {
        inningsNumber?: 1 | 2;
        battingTeamId?: string;
        bowlingTeamId?: string;
    }
): ReplayEngineOutput {
    // 1. Filter out voided/invalid and sort deterministically by global sequence or over/ball
    const sortedEvents = [...events].sort((a, b) => {
        if (a.ballSequenceGlobal !== undefined && b.ballSequenceGlobal !== undefined) {
            return a.ballSequenceGlobal - b.ballSequenceGlobal;
        }
        if (a.overNumber !== b.overNumber) {
            return a.overNumber - b.overNumber;
        }
        return a.ballInOver - b.ballInOver;
    });

    let totalRuns = 0;
    let totalWickets = 0;
    let legalBallsCount = 0;

    const extras: ExtrasBreakdown = {
        wides: 0,
        noBalls: 0,
        byes: 0,
        legByes: 0,
        penalty: 0,
        total: 0
    };

    const batsmenMap = new Map<string, BatsmanProjection>();
    const bowlersMap = new Map<string, BowlerProjection>();

    const fallOfWickets: FallOfWicketEntry[] = [];
    const partnerships: PartnershipData[] = [];

    let currentStrikerId: string | null = null;
    let currentNonStrikerId: string | null = null;
    let currentBowlerId: string | null = null;

    let currentPartnershipRuns = 0;
    let currentPartnershipBalls = 0;
    let currentPartnershipBatsmanARuns = 0;
    let currentPartnershipBatsmanBRuns = 0;
    let partnershipNumber = 1;

    // Track overs breakdown for bowler maidens
    const bowlerOverMap = new Map<string, Map<number, { runs: number; legalBalls: number }>>();

    sortedEvents.forEach((ev) => {
        const strikerId = ev.strikerPersonId;
        const nonStrikerId = ev.nonStrikerPersonId;
        const bowlerId = ev.bowlerPersonId;

        currentStrikerId = strikerId;
        currentNonStrikerId = nonStrikerId;
        currentBowlerId = bowlerId;

        // Ensure batsman records exist
        if (!batsmenMap.has(strikerId)) {
            batsmenMap.set(strikerId, {
                playerId: strikerId,
                battingPosition: batsmenMap.size + 1,
                runs: 0,
                ballsFaced: 0,
                fours: 0,
                sixes: 0,
                strikeRate: 0,
                dotBalls: 0,
                singles: 0,
                doubles: 0,
                threes: 0,
                isOut: false,
                isOnStrike: true,
                entryScore: totalRuns,
                entryWickets: totalWickets
            });
        }
        if (!batsmenMap.has(nonStrikerId)) {
            batsmenMap.set(nonStrikerId, {
                playerId: nonStrikerId,
                battingPosition: batsmenMap.size + 1,
                runs: 0,
                ballsFaced: 0,
                fours: 0,
                sixes: 0,
                strikeRate: 0,
                dotBalls: 0,
                singles: 0,
                doubles: 0,
                threes: 0,
                isOut: false,
                isOnStrike: false,
                entryScore: totalRuns,
                entryWickets: totalWickets
            });
        }

        // Ensure bowler record exists
        if (!bowlersMap.has(bowlerId)) {
            bowlersMap.set(bowlerId, {
                playerId: bowlerId,
                overs: 0,
                ballsBowled: 0,
                maidens: 0,
                runsConceded: 0,
                wickets: 0,
                wides: 0,
                noBalls: 0,
                economy: 0,
                dotBalls: 0,
                dotBallPercentage: 0,
                spells: []
            });
        }

        const striker = batsmenMap.get(strikerId)!;
        const bowler = bowlersMap.get(bowlerId)!;

        // Process Extras & Delivery Legality
        const isWide = ev.extraType === 'Wide';
        const isNoBall = ev.extraType === 'No Ball';
        const isBye = ev.extraType === 'Bye';
        const isLegBye = ev.extraType === 'Leg Bye';
        const isPenalty = ev.extraType === 'Penalty';

        const extraRuns = ev.runsExtras || 0;
        const batRuns = ev.runsBat || 0;
        const ballTotalRuns = ev.runsTotal ?? (batRuns + extraRuns);

        totalRuns += ballTotalRuns;

        if (isWide) {
            extras.wides += extraRuns || 1;
            bowler.wides += extraRuns || 1;
            bowler.runsConceded += ballTotalRuns;
        } else if (isNoBall) {
            extras.noBalls += extraRuns || 1;
            bowler.noBalls += extraRuns || 1;
            bowler.runsConceded += ballTotalRuns;
            striker.runs += batRuns;
            striker.ballsFaced += 1;
            if (batRuns === 4) striker.fours += 1;
            if (batRuns === 6) striker.sixes += 1;
            if (batRuns === 0) striker.dotBalls += 1;
            if (batRuns === 1) striker.singles += 1;
            if (batRuns === 2) striker.doubles += 1;
            if (batRuns === 3) striker.threes += 1;
        } else if (isBye) {
            extras.byes += extraRuns;
        } else if (isLegBye) {
            extras.legByes += extraRuns;
        } else if (isPenalty) {
            extras.penalty += extraRuns;
        } else {
            // Standard delivery
            striker.runs += batRuns;
            striker.ballsFaced += 1;
            if (batRuns === 4) striker.fours += 1;
            if (batRuns === 6) striker.sixes += 1;
            if (batRuns === 0) striker.dotBalls += 1;
            if (batRuns === 1) striker.singles += 1;
            if (batRuns === 2) striker.doubles += 1;
            if (batRuns === 3) striker.threes += 1;
            bowler.runsConceded += batRuns;
        }

        extras.total = extras.wides + extras.noBalls + extras.byes + extras.legByes + extras.penalty;

        // Count legal delivery
        const isLegal = ev.isLegalDelivery ?? (!isWide && !isNoBall);
        if (isLegal) {
            legalBallsCount += 1;
            bowler.ballsBowled += 1;
            if (!isWide && batRuns === 0 && !isBye && !isLegBye) {
                bowler.dotBalls += 1;
            }
        }

        // Track bowler over detail for maiden calculation
        if (!bowlerOverMap.has(bowlerId)) {
            bowlerOverMap.set(bowlerId, new Map());
        }
        const bowlerOvers = bowlerOverMap.get(bowlerId)!;
        const overEntry = bowlerOvers.get(ev.overNumber) || { runs: 0, legalBalls: 0 };
        overEntry.runs += isBye || isLegBye || isPenalty ? 0 : ballTotalRuns;
        if (isLegal) overEntry.legalBalls += 1;
        bowlerOvers.set(ev.overNumber, overEntry);

        // Update partnership stats
        currentPartnershipRuns += ballTotalRuns;
        if (isLegal) currentPartnershipBalls += 1;
        currentPartnershipBatsmanARuns += batRuns;

        // Process Wicket
        if (ev.wicketFlag) {
            totalWickets += 1;
            if (ev.creditedBowlerFlag !== false && ev.wicketType !== 'Run Out' && ev.wicketType !== 'Retired') {
                bowler.wickets += 1;
            }

            const dismissedId = ev.dismissedPersonId || strikerId;
            const dismissedBatsman = batsmenMap.get(dismissedId);
            if (dismissedBatsman) {
                dismissedBatsman.isOut = true;
                dismissedBatsman.dismissal = {
                    type: (ev.wicketType?.toLowerCase() as WicketType) || 'bowled',
                    bowlerId: bowlerId,
                    overNumber: ev.overNumber,
                    ballInOver: ev.ballInOver,
                    description: ev.wicketType || 'Out'
                };
            }

            // Fall of wicket
            fallOfWickets.push({
                wicketNumber: totalWickets,
                score: totalRuns,
                over: formatOversDisplay(legalBallsCount),
                overNumber: ev.overNumber,
                ballInOver: ev.ballInOver,
                batsmanOutId: dismissedId,
                bowlerId: bowlerId,
                wicketType: (ev.wicketType?.toLowerCase() as WicketType) || 'bowled',
                partnershipRuns: currentPartnershipRuns
            });

            // Finalise partnership
            partnerships.push({
                partnershipNumber,
                batsmanAId: strikerId,
                batsmanBId: nonStrikerId,
                runs: currentPartnershipRuns,
                balls: currentPartnershipBalls,
                batsmanARuns: currentPartnershipBatsmanARuns,
                batsmanBRuns: currentPartnershipBatsmanBRuns,
                startScore: totalRuns - currentPartnershipRuns
            });

            partnershipNumber += 1;
            currentPartnershipRuns = 0;
            currentPartnershipBalls = 0;
            currentPartnershipBatsmanARuns = 0;
            currentPartnershipBatsmanBRuns = 0;
        }

        // Recalculate rates
        striker.strikeRate = striker.ballsFaced > 0 ? Number(((striker.runs / striker.ballsFaced) * 100).toFixed(2)) : 0;
    });

    // Compute bowler maidens, overs display, and economy
    bowlersMap.forEach((bowler, bId) => {
        const oversDecimal = Number((Math.floor(bowler.ballsBowled / 6) + (bowler.ballsBowled % 6) / 10).toFixed(1));
        bowler.overs = oversDecimal;

        const oversMap = bowlerOverMap.get(bId);
        let maidens = 0;
        if (oversMap) {
            oversMap.forEach((data) => {
                if (data.legalBalls >= 6 && data.runs === 0) {
                    maidens += 1;
                }
            });
        }
        bowler.maidens = maidens;

        const totalOversFraction = bowler.ballsBowled / 6;
        bowler.economy = totalOversFraction > 0 ? Number((bowler.runsConceded / totalOversFraction).toFixed(2)) : 0;
        bowler.dotBallPercentage = bowler.ballsBowled > 0 ? Number(((bowler.dotBalls / bowler.ballsBowled) * 100).toFixed(1)) : 0;
    });

    // Build current over summary (last <= 6 deliveries)
    const currentOverNumber = sortedEvents.length > 0 ? sortedEvents[sortedEvents.length - 1].overNumber : 0;
    const currentOverEvents = sortedEvents.filter((e) => e.overNumber === currentOverNumber);
    const currentOver: BallSummary[] = currentOverEvents.map((e) => {
        let display = `${e.runsBat}`;
        if (e.extraType === 'Wide') display = `${e.runsExtras || 1}w`;
        else if (e.extraType === 'No Ball') display = `${e.runsTotal}nb`;
        else if (e.extraType === 'Bye') display = `${e.runsExtras}b`;
        else if (e.extraType === 'Leg Bye') display = `${e.runsExtras}lb`;
        if (e.wicketFlag) display = 'W';

        return {
            actionId: e.id,
            runs: e.runsTotal,
            isWicket: e.wicketFlag,
            extraType: e.extraType ? (e.extraType.toLowerCase().replace(' ', '') as any) : undefined,
            extraRuns: e.runsExtras,
            display
        };
    });

    const totalOversFraction = legalBallsCount / 6;
    const runRate = totalOversFraction > 0 ? Number((totalRuns / totalOversFraction).toFixed(2)) : 0;

    return {
        inningsNumber: options?.inningsNumber ?? 1,
        battingTeamId: options?.battingTeamId ?? '',
        bowlingTeamId: options?.bowlingTeamId ?? '',
        runs: totalRuns,
        wickets: totalWickets,
        oversDecimal: Number((Math.floor(legalBallsCount / 6) + (legalBallsCount % 6) / 10).toFixed(1)),
        oversDisplay: formatOversDisplay(legalBallsCount),
        legalBallsCount,
        runRate,
        batsmen: Array.from(batsmenMap.values()),
        bowlers: Array.from(bowlersMap.values()),
        extras,
        fallOfWickets,
        partnerships,
        currentOver,
        currentStrikerId,
        currentNonStrikerId,
        currentBowlerId,
        isComplete: totalWickets >= 10
    };
}
