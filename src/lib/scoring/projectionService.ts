/**
 * Projection Service
 * ==================
 * 
 * This service computes LiveScoreProjection from ScoringAction events.
 * It is the core of the event-sourced scoring architecture.
 * 
 * Key principles:
 * 1. ScoringAction[] is the ONLY input
 * 2. All stats, scorecards, and views are DERIVED from this
 * 3. Voided actions are excluded from computation
 * 4. The projection is deterministic - same input = same output
 * 
 * @see /docs/SCHEMA_V3_PROPOSAL.md
 */

import {
    ScoringAction,
    LiveScoreProjection,
    InningsProjection,
    BatsmanProjection,
    BowlerProjection,
    BallSummary,
    FallOfWicketEntry,
    PartnershipData,
    ExtrasBreakdown,
    SpellSummary,
    ComputeProjectionOptions,
    WicketType,
} from '@/types/scoring';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format overs to decimal notation (e.g., 12 balls = 2.0, 14 balls = 2.2)
 */
export function formatOvers(balls: number): number {
    const completedOvers = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return parseFloat(`${completedOvers}.${remainingBalls}`);
}

/**
 * Calculate strike rate
 */
export function calculateStrikeRate(runs: number, balls: number): number {
    if (balls === 0) return 0;
    return parseFloat(((runs / balls) * 100).toFixed(2));
}

/**
 * Calculate economy rate
 */
export function calculateEconomy(runs: number, balls: number): number {
    if (balls === 0) return 0;
    const overs = balls / 6;
    return parseFloat((runs / overs).toFixed(2));
}

/**
 * Calculate run rate
 */
export function calculateRunRate(runs: number, balls: number): number {
    if (balls === 0) return 0;
    const overs = balls / 6;
    return parseFloat((runs / overs).toFixed(2));
}

/**
 * Format ball display text
 */
export function formatBallDisplay(action: ScoringAction): string {
    if (action.isWicket) return 'W';
    if (action.extras.wide > 0) {
        const wideRuns = action.extras.wide + action.runsOffBat;
        return wideRuns === 1 ? 'Wd' : `${wideRuns}Wd`;
    }
    if (action.extras.noBall > 0) {
        const nbRuns = action.extras.noBall + action.runsOffBat;
        return `${nbRuns}Nb`;
    }
    if (action.extras.bye > 0) {
        return `${action.extras.bye}B`;
    }
    if (action.extras.legBye > 0) {
        return `${action.extras.legBye}Lb`;
    }
    if (action.runsOffBat === 0) return '•';
    return action.runsOffBat.toString();
}

/**
 * Generate dismissal description
 */
export function formatDismissal(
    wicketType: WicketType,
    bowlerName?: string,
    fielderNames?: string[]
): string {
    switch (wicketType) {
        case 'bowled':
            return bowlerName ? `b ${bowlerName}` : 'bowled';
        case 'caught':
            if (fielderNames?.length && bowlerName) {
                return `c ${fielderNames[0]} b ${bowlerName}`;
            }
            return 'caught';
        case 'lbw':
            return bowlerName ? `lbw b ${bowlerName}` : 'lbw';
        case 'run_out':
            if (fielderNames?.length) {
                return `run out (${fielderNames.join('/')})`;
            }
            return 'run out';
        case 'stumped':
            if (fielderNames?.length && bowlerName) {
                return `st ${fielderNames[0]} b ${bowlerName}`;
            }
            return 'stumped';
        case 'hit_wicket':
            return bowlerName ? `hit wicket b ${bowlerName}` : 'hit wicket';
        case 'retired_out':
            return 'retired out';
        case 'retired_hurt':
            return 'retired hurt';
        default:
            return wicketType;
    }
}

// ============================================================================
// MAIN PROJECTION COMPUTATION
// ============================================================================

/**
 * Compute a complete LiveScoreProjection from ScoringAction events.
 * This is the core function that derives all match state from the event log.
 */
export function computeProjection(
    actions: ScoringAction[],
    matchId: string,
    homeTeamId: string,
    awayTeamId: string,
    homeTeamName?: string,
    awayTeamName?: string,
    options: ComputeProjectionOptions = {}
): LiveScoreProjection {
    const { includeVoided = false, upToSequence, populateNames = false } = options;

    // Filter actions
    let filteredActions = actions;
    if (!includeVoided) {
        filteredActions = actions.filter(a => !a.isVoided);
    }
    if (upToSequence !== undefined) {
        filteredActions = filteredActions.filter(a => a.sequenceNumber <= upToSequence);
    }

    // Sort by sequence number
    filteredActions.sort((a, b) => {
        if (a.inningsNumber !== b.inningsNumber) {
            return a.inningsNumber - b.inningsNumber;
        }
        return a.sequenceNumber - b.sequenceNumber;
    });

    // Separate by innings
    const innings1Actions = filteredActions.filter(a => a.inningsNumber === 1);
    const innings2Actions = filteredActions.filter(a => a.inningsNumber === 2);

    // Compute each innings
    const innings1 = innings1Actions.length > 0
        ? computeInningsProjection(innings1Actions, 1, homeTeamId, awayTeamId, homeTeamName, awayTeamName)
        : null;

    const innings2 = innings2Actions.length > 0
        ? computeInningsProjection(innings2Actions, 2, awayTeamId, homeTeamId, awayTeamName, homeTeamName)
        : null;

    // Determine current state
    const hasSecondInnings = innings2Actions.length > 0;
    const currentInningsNumber = hasSecondInnings ? 2 : 1;
    const currentInningsData = hasSecondInnings ? innings2 : innings1;
    const currentActions = hasSecondInnings ? innings2Actions : innings1Actions;

    // Determine status
    let status: LiveScoreProjection['status'] = 'live';
    if (filteredActions.length === 0) {
        status = 'scheduled';
    } else if (innings2?.isComplete) {
        status = 'completed';
    } else if (innings1?.isComplete && !hasSecondInnings) {
        status = 'innings_break';
    }

    // Get current over balls
    const currentOver = getCurrentOverBalls(currentActions);

    // Get current players from last action
    const lastAction = currentActions[currentActions.length - 1];
    const currentPlayers = lastAction
        ? {
            strikerId: lastAction.isWicket ? null : getNextStriker(lastAction, currentActions),
            nonStrikerId: lastAction.isWicket ? lastAction.nonStrikerId : getNextNonStriker(lastAction, currentActions),
            bowlerId: lastAction.bowlerId,
        }
        : { strikerId: null, nonStrikerId: null, bowlerId: null };

    // Calculate target for second innings
    const target = innings1?.runs !== undefined ? innings1.runs + 1 : undefined;
    const requiredRuns = target && currentInningsData
        ? target - currentInningsData.runs
        : undefined;
    const remainingBalls = currentInningsData
        ? Math.max(0, 120 - currentInningsData.balls) // Assuming 20 overs
        : undefined;
    const requiredRunRate = requiredRuns && remainingBalls && remainingBalls > 0
        ? parseFloat((requiredRuns / (remainingBalls / 6)).toFixed(2))
        : undefined;

    // Build projection
    const projection: LiveScoreProjection = {
        matchId,
        status,
        inningsNumber: currentInningsNumber as 1 | 2,
        currentInnings: {
            battingTeamId: currentInningsData?.battingTeamId || (currentInningsNumber === 1 ? homeTeamId : awayTeamId),
            battingTeamName: currentInningsData?.battingTeamName,
            bowlingTeamId: currentInningsData?.bowlingTeamId || (currentInningsNumber === 1 ? awayTeamId : homeTeamId),
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
        currentPlayers: {
            strikerId: currentPlayers.strikerId,
            nonStrikerId: currentPlayers.nonStrikerId,
            bowlerId: currentPlayers.bowlerId,
        },
        batsmen: currentInningsData?.batsmen || [],
        bowlers: currentInningsData?.bowlers || [],
        currentOver,
        partnership: currentInningsData?.partnerships[currentInningsData.partnerships.length - 1] || {
            partnershipNumber: 1,
            batsmanAId: '',
            batsmanBId: '',
            runs: 0,
            balls: 0,
            batsmanARuns: 0,
            batsmanBRuns: 0,
            startScore: 0,
        },
        fallOfWickets: currentInningsData?.fallOfWickets || [],
        extras: currentInningsData?.extras || {
            wides: 0,
            noBalls: 0,
            byes: 0,
            legByes: 0,
            penalty: 0,
            total: 0,
        },
        lastUpdated: new Date().toISOString(),
        lastActionId: lastAction?.id || '',
        lastActionSequence: lastAction?.sequenceNumber || 0,
        version: 1,
    };

    // Add completed innings
    if (innings1 && (innings1.isComplete || hasSecondInnings)) {
        projection.innings1 = innings1;
    }
    if (innings2) {
        projection.innings2 = innings2;
    }

    // Compute match result if completed
    if (status === 'completed' && innings1 && innings2) {
        projection.result = computeMatchResult(innings1, innings2, homeTeamId, awayTeamId, homeTeamName, awayTeamName);
    }

    return projection;
}

/**
 * Compute projection for a single innings
 */
function computeInningsProjection(
    actions: ScoringAction[],
    inningsNumber: 1 | 2,
    battingTeamId: string,
    bowlingTeamId: string,
    battingTeamName?: string,
    bowlingTeamName?: string
): InningsProjection {
    // Initialize batsmen and bowlers maps
    const batsmenMap = new Map<string, BatsmanProjection>();
    const bowlersMap = new Map<string, BowlerProjection>();
    const fallOfWickets: FallOfWicketEntry[] = [];
    const partnerships: PartnershipData[] = [];

    let currentRuns = 0;
    let currentWickets = 0;
    let currentBalls = 0;
    let battingPosition = 1;

    // Extras tracking
    const extras: ExtrasBreakdown = {
        wides: 0,
        noBalls: 0,
        byes: 0,
        legByes: 0,
        penalty: 0,
        total: 0,
    };

    // Current partnership tracking
    let currentPartnership: PartnershipData = {
        partnershipNumber: 1,
        batsmanAId: '',
        batsmanBId: '',
        runs: 0,
        balls: 0,
        batsmanARuns: 0,
        batsmanBRuns: 0,
        startScore: 0,
    };

    // Bowler spell tracking
    const bowlerLastOver = new Map<string, number>();

    // Process each action
    for (const action of actions) {
        // Handle non-ball events
        if (action.eventType === 'INNINGS_END' || action.eventType === 'MATCH_END') {
            continue;
        }

        // Initialize batsman if new
        if (!batsmenMap.has(action.strikerId)) {
            batsmenMap.set(action.strikerId, createBatsmanProjection(action.strikerId, battingPosition++, currentRuns, currentWickets));
        }
        if (!batsmenMap.has(action.nonStrikerId)) {
            batsmenMap.set(action.nonStrikerId, createBatsmanProjection(action.nonStrikerId, battingPosition++, currentRuns, currentWickets));
        }

        // Initialize partnership if needed
        if (!currentPartnership.batsmanAId) {
            currentPartnership.batsmanAId = action.strikerId;
            currentPartnership.batsmanBId = action.nonStrikerId;
            currentPartnership.startScore = currentRuns;
        }

        // Initialize bowler if new
        if (!bowlersMap.has(action.bowlerId)) {
            bowlersMap.set(action.bowlerId, createBowlerProjection(action.bowlerId));
        }

        const batsman = batsmenMap.get(action.strikerId)!;
        const bowler = bowlersMap.get(action.bowlerId)!;

        // Update runs
        currentRuns += action.totalRuns;
        batsman.runs += action.runsOffBat;
        bowler.runsConceded += action.totalRuns;

        // Update balls
        if (action.isLegalDelivery) {
            currentBalls++;
            batsman.ballsFaced++;
            bowler.ballsBowled++;
        }

        // Update boundaries
        if (action.runsOffBat === 4) {
            batsman.fours++;
        } else if (action.runsOffBat === 6) {
            batsman.sixes++;
        }

        // Update dot balls
        if (action.runsOffBat === 0 && !action.isWicket && Object.values(action.extras).every(e => e === 0)) {
            batsman.dotBalls++;
            bowler.dotBalls++;
        }

        // Track runs by type
        if (action.runsOffBat === 1) batsman.singles++;
        if (action.runsOffBat === 2) batsman.doubles++;
        if (action.runsOffBat === 3) batsman.threes++;

        // Update extras
        extras.wides += action.extras.wide;
        extras.noBalls += action.extras.noBall;
        extras.byes += action.extras.bye;
        extras.legByes += action.extras.legBye;
        extras.penalty += action.extras.penalty;
        extras.total += action.extras.wide + action.extras.noBall + action.extras.bye + action.extras.legBye + action.extras.penalty;

        if (action.extras.wide > 0) bowler.wides++;
        if (action.extras.noBall > 0) bowler.noBalls++;

        // Update partnership
        currentPartnership.runs += action.totalRuns;
        if (action.isLegalDelivery) currentPartnership.balls++;
        if (action.strikerId === currentPartnership.batsmanAId) {
            currentPartnership.batsmanARuns += action.runsOffBat;
        } else {
            currentPartnership.batsmanBRuns += action.runsOffBat;
        }

        // Handle wicket
        if (action.isWicket && action.wicket) {
            currentWickets++;
            bowler.wickets++;

            const outBatsman = batsmenMap.get(action.wicket.dismissedPlayerId);
            if (outBatsman) {
                outBatsman.isOut = true;
                outBatsman.dismissal = {
                    type: action.wicket.type,
                    bowlerId: action.bowlerId,
                    fielderIds: action.wicket.fielderIds,
                    overNumber: action.overNumber,
                    ballInOver: action.ballInOver,
                };
            }

            // Record fall of wicket
            fallOfWickets.push({
                wicketNumber: currentWickets,
                score: currentRuns,
                over: formatOvers(currentBalls).toString(),
                overNumber: action.overNumber,
                ballInOver: action.ballInOver,
                batsmanOutId: action.wicket.dismissedPlayerId,
                bowlerId: action.bowlerId,
                wicketType: action.wicket.type,
                partnershipRuns: currentPartnership.runs,
            });

            // End current partnership, start new one
            partnerships.push({ ...currentPartnership });
            currentPartnership = {
                partnershipNumber: partnerships.length + 1,
                batsmanAId: '', // Will be set on next ball
                batsmanBId: '',
                runs: 0,
                balls: 0,
                batsmanARuns: 0,
                batsmanBRuns: 0,
                startScore: currentRuns,
            };
        }

        // Update bowler spell tracking
        const lastOver = bowlerLastOver.get(action.bowlerId);
        if (lastOver === undefined || action.overNumber > lastOver + 1) {
            // New spell
            bowler.spells.push({
                spellNumber: bowler.spells.length + 1,
                startOver: action.overNumber,
                endOver: action.overNumber,
                overs: 0,
                runs: 0,
                wickets: 0,
                maidens: 0,
            });
        }
        if (bowler.spells.length > 0) {
            const currentSpell = bowler.spells[bowler.spells.length - 1];
            currentSpell.endOver = action.overNumber;
            currentSpell.runs += action.totalRuns;
            if (action.isWicket) currentSpell.wickets++;
        }
        bowlerLastOver.set(action.bowlerId, action.overNumber);
    }

    // Finalize current partnership if not ended
    if (currentPartnership.runs > 0 || currentPartnership.balls > 0) {
        partnerships.push(currentPartnership);
    }

    // Calculate maiden overs for each bowler
    for (const [bowlerId, bowler] of bowlersMap) {
        const bowlerActions = actions.filter(a => a.bowlerId === bowlerId);
        bowler.maidens = calculateMaidenOvers(bowlerActions);
        bowler.overs = formatOvers(bowler.ballsBowled);
        bowler.economy = calculateEconomy(bowler.runsConceded, bowler.ballsBowled);
        bowler.dotBallPercentage = bowler.ballsBowled > 0
            ? parseFloat(((bowler.dotBalls / bowler.ballsBowled) * 100).toFixed(1))
            : 0;
    }

    // Calculate strike rates for batsmen
    for (const [, batsman] of batsmenMap) {
        batsman.strikeRate = calculateStrikeRate(batsman.runs, batsman.ballsFaced);
    }

    // Sort batsmen by batting position
    const sortedBatsmen = Array.from(batsmenMap.values()).sort((a, b) => a.battingPosition - b.battingPosition);

    // Determine if innings is complete (all out, overs completed, or explicit event)
    const hasInningsEndEvent = actions.some(a => a.eventType === 'INNINGS_END');
    const isComplete = hasInningsEndEvent || currentWickets >= 10 || currentBalls >= 120; // Assuming 20 overs

    return {
        inningsNumber,
        battingTeamId,
        battingTeamName,
        bowlingTeamId,
        bowlingTeamName,
        runs: currentRuns,
        wickets: currentWickets,
        overs: formatOvers(currentBalls),
        balls: currentBalls,
        runRate: calculateRunRate(currentRuns, currentBalls),
        batsmen: sortedBatsmen,
        bowlers: Array.from(bowlersMap.values()),
        extras,
        fallOfWickets,
        partnerships,
        isComplete,
    };
}

/**
 * Create a new batsman projection with initial values
 */
function createBatsmanProjection(
    playerId: string,
    battingPosition: number,
    entryScore: number,
    entryWickets: number
): BatsmanProjection {
    return {
        playerId,
        battingPosition,
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
        entryScore,
        entryWickets,
    };
}

/**
 * Create a new bowler projection with initial values
 */
function createBowlerProjection(playerId: string): BowlerProjection {
    return {
        playerId,
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
        spells: [],
    };
}

/**
 * Calculate number of maiden overs for a bowler
 */
function calculateMaidenOvers(bowlerActions: ScoringAction[]): number {
    let maidens = 0;
    let currentOver = -1;
    let overRuns = 0;
    let overBalls = 0;

    for (const action of bowlerActions) {
        if (action.overNumber !== currentOver) {
            // Check if previous over was a maiden
            if (currentOver >= 0 && overBalls === 6 && overRuns === 0) {
                maidens++;
            }
            currentOver = action.overNumber;
            overRuns = 0;
            overBalls = 0;
        }

        if (action.isLegalDelivery) {
            overBalls++;
        }
        overRuns += action.totalRuns;
    }

    // Check final over
    if (overBalls === 6 && overRuns === 0) {
        maidens++;
    }

    return maidens;
}

/**
 * Get balls in the current over
 */
export function getCurrentOverBalls(actions: ScoringAction[]): BallSummary[] {
    if (actions.length === 0) return [];

    const lastAction = actions[actions.length - 1];
    const currentOverNumber = lastAction.overNumber;

    // If the last legal ball completed an over, show empty
    const legalBallsInOver = actions
        .filter(a => a.overNumber === currentOverNumber && a.isLegalDelivery)
        .length;

    if (legalBallsInOver >= 6) {
        return []; // Over is complete
    }

    // Get all balls in current over
    return actions
        .filter(a => a.overNumber === currentOverNumber)
        .map(a => ({
            actionId: a.id,
            runs: a.totalRuns,
            isWicket: a.isWicket,
            extraType: a.extras.wide > 0 ? 'wide' :
                a.extras.noBall > 0 ? 'noball' :
                    a.extras.bye > 0 ? 'bye' :
                        a.extras.legBye > 0 ? 'legbye' : undefined,
            extraRuns: a.extras.wide + a.extras.noBall + a.extras.bye + a.extras.legBye,
            display: formatBallDisplay(a),
        }));
}

/**
 * Determine who should be on strike after the action
 */
export function getNextStriker(action: ScoringAction, allActions: ScoringAction[]): string | null {
    if (action.isWicket) return null;

    // Check if strike should rotate
    const shouldRotate = action.totalRuns % 2 === 1;

    // Check if over ended (6 legal balls)
    const legalBallsInOver = allActions
        .filter(a => a.overNumber === action.overNumber && a.isLegalDelivery)
        .length;
    const isOverEnd = legalBallsInOver >= 6 && action.ballInOver >= 6;

    // XOR logic: rotate for odd runs XOR over end
    const finalRotate = shouldRotate !== isOverEnd;

    return finalRotate ? action.nonStrikerId : action.strikerId;
}

/**
 * Determine who should be at non-striker end after the action
 */
export function getNextNonStriker(action: ScoringAction, allActions: ScoringAction[]): string | null {
    const nextStriker = getNextStriker(action, allActions);
    if (nextStriker === action.strikerId) return action.nonStrikerId;
    return action.strikerId;
}

/**
 * Compute match result from completed innings
 */
export function computeMatchResult(
    innings1: InningsProjection,
    innings2: InningsProjection,
    homeTeamId: string,
    awayTeamId: string,
    homeTeamName?: string,
    awayTeamName?: string
): LiveScoreProjection['result'] {
    if (innings2.runs > innings1.runs) {
        // Second batting team won
        const wicketsRemaining = 10 - innings2.wickets;
        return {
            winnerId: innings2.battingTeamId,
            winnerName: innings2.battingTeamName,
            winMargin: `by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`,
            resultText: `${innings2.battingTeamName || innings2.battingTeamId} won by ${wicketsRemaining} wicket${wicketsRemaining !== 1 ? 's' : ''}`,
        };
    } else if (innings2.runs < innings1.runs) {
        // First batting team won
        const runMargin = innings1.runs - innings2.runs;
        return {
            winnerId: innings1.battingTeamId,
            winnerName: innings1.battingTeamName,
            winMargin: `by ${runMargin} run${runMargin !== 1 ? 's' : ''}`,
            resultText: `${innings1.battingTeamName || innings1.battingTeamId} won by ${runMargin} run${runMargin !== 1 ? 's' : ''}`,
        };
    } else {
        // Tie
        return {
            winMargin: 'Tie',
            resultText: 'Match tied',
        };
    }
}

// ============================================================================
// CONVENIENCE / UTILITY EXPORTS
// ============================================================================

/**
 * Recompute projection from actions - useful for undo/redo
 */
export function recomputeProjection(
    actions: ScoringAction[],
    matchId: string,
    homeTeamId: string,
    awayTeamId: string,
    homeTeamName?: string,
    awayTeamName?: string
): LiveScoreProjection {
    return computeProjection(
        actions,
        matchId,
        homeTeamId,
        awayTeamId,
        homeTeamName,
        awayTeamName,
        { includeVoided: false }
    );
}

/**
 * Validate that a projection is consistent with actions
 */
export function validateProjection(
    projection: LiveScoreProjection,
    actions: ScoringAction[]
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const validActions = actions.filter(a => !a.isVoided);

    // Check action count
    if (projection.lastActionSequence !== validActions.length) {
        errors.push(`Sequence mismatch: projection=${projection.lastActionSequence}, actions=${validActions.length}`);
    }

    // Check runs total
    const computedRuns = validActions.reduce((sum, a) => sum + a.totalRuns, 0);
    const inningsRuns = (projection.innings1?.runs || 0) + (projection.currentInnings?.runs || 0);
    if (computedRuns !== inningsRuns) {
        errors.push(`Runs mismatch: computed=${computedRuns}, projection=${inningsRuns}`);
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}
