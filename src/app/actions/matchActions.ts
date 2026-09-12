'use server';

import { createDocument, updateDocument, deleteDocument } from '@/lib/firestore';
import { MatchSchema } from '@/lib/validations/matchSchema';
import admin from '@/lib/firebase-admin';
import { Match, Person, Division } from '@/types/firestore';
import { ScoringAction, WicketType, ShotType, PitchLength, BowlingLine, ScoringActionSource } from '@/types/scoring';
import {
  ProjectionFold,
  FoldContext,
  FOLD_VERSION,
  applyActionToFold,
  buildFoldFromActions,
  projectionFromFold,
  isInningsFoldComplete,
  stripUndefined,
} from '@/lib/scoring/incrementalProjection';
import { ImpactEngine } from '@/services/impact/ImpactEngine';
import { ImpactAttributor } from '@/services/impact/ImpactAttributor';
import { RewardsEngine } from '@/services/rewards/RewardsEngine';
import { RewardService } from '@/services/rewards/RewardService';
import { recordAuditLog } from '@/lib/services/auditService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { serializeData } from '@/lib/serialize';
import { MOCK_MATCHES } from '@/lib/mockMatchData';

export type MatchActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function createMatchAction(
  prevState: MatchActionState,
  formData: FormData
): Promise<MatchActionState> {
  try {
    const rawData = {
      homeTeamId: formData.get('homeTeamId'),
      awayTeamId: formData.get('awayTeamId'),
      scheduledDate: formData.get('matchDate'),
      scheduledTime: formData.get('matchTime') || undefined,
      venueId: formData.get('fieldId') || undefined,
      format: formData.get('matchType') || 'T20',
      overs: formData.get('overs') || undefined,
      leagueId: formData.get('leagueId') || undefined,
      seasonId: formData.get('seasonId') || undefined,
      divisionId: formData.get('divisionId') || undefined,
      competition: formData.get('competition') || undefined,
      round: formData.get('round') || undefined,
      umpire1Id: formData.get('umpire1Id') || undefined,
      umpire2Id: formData.get('umpire2Id') || undefined,
      scorerId: formData.get('scorer') || undefined,
      notes: formData.get('notes') || undefined,
      isDayNight: formData.get('isDayNight') === 'true', // Passed as hidden input in wizard
      status: formData.get('status') || 'scheduled',
      state: (formData.get('status') || 'scheduled').toString().toUpperCase() as any,
    };

    const validatedData = MatchSchema.parse(rawData);

    const matchDate = formData.get('matchDate') as string;
    const matchTime = formData.get('matchTime') as string || '00:00';
    let dateTime = new Date().toISOString();
    try {
      if (matchDate) {
        dateTime = new Date(`${matchDate}T${matchTime}`).toISOString();
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }

    const newMatchData: Omit<Match, 'id'> = {
      ...validatedData,
      dateTime, // Populate legacy field for sorting
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;

    // Remove undefined values as Firestore doesn't support them
    Object.keys(newMatchData).forEach(key => {
      if ((newMatchData as any)[key] === undefined) {
        delete (newMatchData as any)[key];
      }
    });

    const matchId = await createDocument<Omit<Match, 'id'>>('matches', newMatchData);

    revalidatePath('/matches');
    if (matchId) {
      redirect(`/matches/${matchId}`);
    }
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Validation error details:', JSON.stringify(error.issues, null, 2));
      const fieldErrors: Record<string, string[]> = {};
      error.issues.forEach((err: any) => {
        const field = String(err.path[0]);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });
      return { fieldErrors };
    }
    // Handle redirect "error" which is special in Next.js
    if ((error as any).digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error('Create match error:', error);
    return { error: (error as Error).message || 'Failed to create match' };
  }
  redirect('/matches');
}

export async function updateMatchAction(
  id: string,
  prevState: MatchActionState,
  formData: FormData
): Promise<MatchActionState> {
  try {
    const rawData = {
      homeTeamId: formData.get('homeTeamId'),
      awayTeamId: formData.get('awayTeamId'),
      matchDate: formData.get('matchDate'),
      matchTime: formData.get('matchTime') || undefined,
      fieldId: formData.get('fieldId') || undefined,
      leagueId: formData.get('leagueId') || undefined,
      seasonId: formData.get('seasonId') || undefined,
      isDayNight: formData.get('isDayNight') === 'on',
      status: formData.get('status') || 'scheduled',
      matchType: formData.get('matchType') || 'T20',
      overs: formData.get('overs') ? Number(formData.get('overs')) : undefined,
      scorer: formData.get('scorer') || undefined,
      notes: formData.get('notes') || undefined,
    };

    const validatedData = MatchSchema.parse(rawData);

    const matchDate = formData.get('matchDate') as string;
    const matchTime = formData.get('matchTime') as string || '00:00';
    let dateTime: string | undefined;
    try {
      if (matchDate) {
        dateTime = new Date(`${matchDate}T${matchTime}`).toISOString();
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }

    const updateData: Partial<Match> = {
      ...validatedData,
      ...(dateTime && { dateTime }), // Update legacy field if date changed
      updatedAt: new Date().toISOString(),
    } as any;

    await updateDocument<Match>('matches', id, updateData);

    revalidatePath('/matches');
    revalidatePath(`/matches/${id}`);
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.issues.forEach((err: any) => {
        const field = String(err.path[0]);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });
      return { fieldErrors };
    }
    console.error('Update match error:', error);
    return { error: (error as Error).message || 'Failed to update match' };
  }
  redirect(`/matches`);
}

export async function deleteMatchAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDocument('matches', id);
    revalidatePath('/matches');
    return { success: true };
  } catch (error) {
    console.error('Delete match error:', error);
    return { success: false, error: (error as Error).message || 'Failed to delete match' };
  }
}

// --- Live Scoring Actions ---

export async function updateTossAction(
  matchId: string,
  tossResult: { winnerId: string; decision: 'bat' | 'bowl' }
) {
  console.log('updateTossAction called with:', { matchId, tossResult });
  try {
    const matchRef = admin.firestore().collection('matches').doc(matchId);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) {
      return { success: false, error: 'Match not found' };
    }

    const match = matchDoc.data() as Match;

    // Determine batting team based on toss
    const battingTeamId = tossResult.decision === 'bat'
      ? tossResult.winnerId
      : (tossResult.winnerId === match.homeTeamId ? match.awayTeamId : match.homeTeamId);

    // Update match with toss result and status
    await matchRef.update({
      tossWinnerId: tossResult.winnerId,
      tossDecision: tossResult.decision,
      status: 'live', // Auto-start match on toss for now, or keep as 'scheduled' until first ball?
      // Let's set to 'live' so the UI switches to scoring mode.
      updatedAt: new Date().toISOString()
    });

    // Initialize Live Score Document
    const liveScoreRef = matchRef.collection('live').doc('score');
    await liveScoreRef.set({
      matchId,
      status: 'live',
      inningsNumber: 1,
      currentInnings: {
        battingTeamId,
        runs: 0,
        wickets: 0,
        balls: 0,
        overs: 0,
      },
      currentPlayers: {
        strikerId: null,
        nonStrikerId: null,
        bowlerId: null,
      },
      batsmen: [],
      bowlers: [],
      ballHistory: [],
      lastUpdated: new Date().toISOString()
    });

    // Record Audit Log
    await recordAuditLog({
      actorId: 'SYSTEM', // In practice, get from session
      actorName: 'Official Scorer',
      actionType: 'MATCH_RESULT_VERIFIED', // Close enough for toss start
      entityType: 'match',
      entityId: matchId,
      description: `Toss won by ${tossResult.winnerId === match.homeTeamId ? 'Home Team' : 'Away Team'}. Elected to ${tossResult.decision}.`,
      afterState: { tossWinnerId: tossResult.winnerId, tossDecision: tossResult.decision }
    });

    revalidatePath(`/matches/${matchId}`);
    console.log('updateTossAction successful for match:', matchId);
    return { success: true };
  } catch (error) {
    console.error('Error in updateTossAction:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function updateLivePlayersAction(
  matchId: string,
  updates: {
    strikerId?: string;
    nonStrikerId?: string;
    bowlerId?: string;
    bowlingAngle?: 'Over the Wicket' | 'Round the Wicket';
  }
) {
  'use server';

  try {
    const liveScoreRef = admin.firestore()
      .collection('matches')
      .doc(matchId)
      .collection('live')
      .doc('score');

    const liveScoreDoc = await liveScoreRef.get();

    if (!liveScoreDoc.exists) {
      return { success: false, error: 'Match not in live state' };
    }

    const liveScore = liveScoreDoc.data() as any;
    const updateData: any = {};

    // Update striker
    if (updates.strikerId) {
      updateData['currentPlayers.strikerId'] = updates.strikerId;

      // Ensure striker exists in batsmen array
      const strikerExists = liveScore.batsmen?.some((b: any) => b.playerId === updates.strikerId);
      if (!strikerExists) {
        // Add new batsman with initial stats
        const batsmen = liveScore.batsmen || [];
        batsmen.push({
          playerId: updates.strikerId,
          runs: 0,
          ballsFaced: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
          isOut: false
        });
        updateData.batsmen = batsmen;
      }
    }

    // Update non-striker
    if (updates.nonStrikerId) {
      updateData['currentPlayers.nonStrikerId'] = updates.nonStrikerId;

      // Ensure non-striker exists in batsmen array
      const nonStrikerExists = liveScore.batsmen?.some((b: any) => b.playerId === updates.nonStrikerId);
      if (!nonStrikerExists) {
        const batsmen = updateData.batsmen || liveScore.batsmen || [];
        batsmen.push({
          playerId: updates.nonStrikerId,
          runs: 0,
          ballsFaced: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
          isOut: false
        });
        updateData.batsmen = batsmen;
      }
    }

    // Update bowler
    if (updates.bowlerId) {
      updateData['currentPlayers.bowlerId'] = updates.bowlerId;

      // Ensure bowler exists in bowlers array
      const bowlerExists = liveScore.bowlers?.some((b: any) => b.playerId === updates.bowlerId);
      if (!bowlerExists) {
        const bowlers = liveScore.bowlers || [];
        bowlers.push({
          playerId: updates.bowlerId,
          overs: 0,
          ballsBowled: 0,
          runsConceded: 0,
          wickets: 0,
          wides: 0,
          noballs: 0,
          economy: 0
        });
        updateData.bowlers = bowlers;
      }
    }

    // Update bowling angle
    if (updates.bowlingAngle) {
      updateData['currentPlayers.bowlingAngle'] = updates.bowlingAngle;
    }

    updateData.lastUpdated = new Date().toISOString();

    await liveScoreRef.update(updateData);

    // Record Audit Log for replacement/update
    if (updates.strikerId || updates.nonStrikerId || updates.bowlerId) {
      await recordAuditLog({
        actorId: 'SCORER',
        actorName: 'Scorer',
        actionType: 'PLAYER_REPLACED',
        entityType: 'match',
        entityId: matchId,
        description: `Live players updated: ${updates.strikerId ? 'Striker: ' + updates.strikerId : ''} ${updates.nonStrikerId ? 'Non-Striker: ' + updates.nonStrikerId : ''} ${updates.bowlerId ? 'Bowler: ' + updates.bowlerId : ''}`,
        afterState: updates
      });
    }

    return { success: true };

  } catch (error) {
    console.error('updateLivePlayersAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to update players' };
  }
}

/**
 * Loads the persisted projection fold for a match, or rebuilds it from the
 * full action log when it is missing, from an older version, or out of step
 * with the log (e.g. after an undo). Returns the fold plus the highest
 * sequence number currently in the log.
 */
async function loadFold(
  matchRef: FirebaseFirestore.DocumentReference,
  ctx: FoldContext
): Promise<{ fold: ProjectionFold; headSequence: number; rebuilt: boolean }> {
  const actionsCol = matchRef.collection('scoring_actions');
  const [foldDoc, lastActionSnap] = await Promise.all([
    matchRef.collection('live').doc('fold').get(),
    actionsCol.orderBy('sequenceNumber', 'desc').limit(1).get(),
  ]);

  const headSequence = lastActionSnap.empty ? 0 : (lastActionSnap.docs[0].data() as ScoringAction).sequenceNumber;
  const stored = foldDoc.exists ? (foldDoc.data() as ProjectionFold) : null;

  if (stored && stored.version === FOLD_VERSION && stored.headSequence === headSequence) {
    return { fold: stored, headSequence, rebuilt: false };
  }

  const allSnap = await actionsCol.orderBy('sequenceNumber', 'asc').get();
  const fold = buildFoldFromActions(allSnap.docs.map(d => d.data() as ScoringAction), ctx);
  return { fold, headSequence: Math.max(headSequence, fold.headSequence), rebuilt: true };
}

function foldContextFor(matchId: string, match: Match): FoldContext {
  return { matchId, homeTeamId: match.homeTeamId, awayTeamId: match.awayTeamId };
}

function writeFoldAndProjection(
  batch: FirebaseFirestore.WriteBatch,
  matchRef: FirebaseFirestore.DocumentReference,
  fold: ProjectionFold,
  ctx: FoldContext
) {
  const projection = projectionFromFold(fold, ctx);
  batch.set(matchRef.collection('live').doc('score'), stripUndefined(projection));
  batch.set(matchRef.collection('live').doc('fold'), stripUndefined(fold));
  return projection;
}

export async function recordBallAction(matchId: string, ballData: any) {
  'use server';

  try {
    const db = admin.firestore();
    const matchRef = db.collection('matches').doc(matchId);

    // 1. Fetch Match and the projection fold (3 small reads, not the whole ball log)
    const matchDoc = await matchRef.get();
    if (!matchDoc.exists) {
      return { success: false, error: 'Match not found' };
    }
    const match = matchDoc.data() as Match;
    const ctx = foldContextFor(matchId, match);
    const { fold, headSequence } = await loadFold(matchRef, ctx);

    // 2. Determine Sequence and Over/Ball numbers
    const sequenceNumber = headSequence + 1;

    let inningsNumber: 1 | 2 = 1;
    if (fold.innings2 || (fold.innings1 && isInningsFoldComplete(fold.innings1))) {
      inningsNumber = 2;
    }

    let overNumber = 0;
    let ballInOver = 1;
    const currentInnings = inningsNumber === 2 ? fold.innings2 : fold.innings1;
    if (currentInnings?.lastAction) {
      const legalBallsInOver = currentInnings.currentOverActions.filter(a => a.isLegalDelivery).length;
      if (legalBallsInOver >= 6) {
        overNumber = currentInnings.lastAction.overNumber + 1;
        ballInOver = 1;
      } else {
        overNumber = currentInnings.lastAction.overNumber;
        ballInOver = currentInnings.currentOverActions.length + 1;
      }
    }

    // 3. Construct ScoringAction
    const isWicket = ballData.isWicket || false;
    const extraType = ballData.extraType as 'wide' | 'noball' | 'bye' | 'legbye' | undefined;
    const runsOffBat = ballData.runs || 0;
    const extraRuns = ballData.extraRuns || 0; // Usually 1 for wide/nb, or boundary extras

    // Calculate extras object
    const extras = {
      wide: extraType === 'wide' ? extraRuns : 0,
      noBall: extraType === 'noball' ? extraRuns : 0,
      bye: extraType === 'bye' ? extraRuns : 0,
      legBye: extraType === 'legbye' ? extraRuns : 0,
      penalty: 0
    };

    const totalRuns = runsOffBat + extras.wide + extras.noBall + extras.bye + extras.legBye + extras.penalty;
    const isLegalDelivery = extraType !== 'wide' && extraType !== 'noball';

    const actionId = matchRef.collection('scoring_actions').doc().id;

    const newAction: ScoringAction = {
      id: actionId,
      matchId,
      inningsNumber,
      overNumber,
      ballInOver,
      sequenceNumber,
      strikerId: ballData.strikerId,
      nonStrikerId: ballData.nonStrikerId,
      bowlerId: ballData.bowlerId,
      runsOffBat,
      extras,
      totalRuns,
      isWicket,
      isLegalDelivery,
      timestamp: new Date().toISOString(),
      source: 'live',
      isVoided: false,
      createdAt: new Date().toISOString()
    };

    if (isWicket) {
      newAction.wicket = {
        type: ballData.wicketType as WicketType || 'bowled',
        dismissedPlayerId: ballData.dismissedPlayerId || ballData.strikerId, // Default to striker if not specified
        fielderIds: ballData.fielderIds
      };
    }

    if (ballData.shotCoordinates) {
      newAction.shotData = {
        coordinates: ballData.shotCoordinates
      };
    }

    if (ballData.commentary) {
      (newAction as any).commentary = ballData.commentary;
    }

    // 4. Save Action and Update Projection atomically

    const batch = db.batch();

    // Save action
    batch.set(matchRef.collection('scoring_actions').doc(actionId), stripUndefined(newAction));

    // Apply the ball to the fold and persist fold + projection
    applyActionToFold(fold, newAction, ctx);
    const projection = writeFoldAndProjection(batch, matchRef, fold, ctx);

    // 4.5. Match Impact Engine Integration
    try {
      const matchContext: any = {
        runs: projection.currentInnings.runs,
        wickets: projection.currentInnings.wickets,
        balls: projection.currentInnings.balls,
        inningsNumber: (projection.innings2 ? 2 : 1) as 1 | 2,
        target: (projection.currentInnings as any).target,
      };

      const impactEvent = ImpactEngine.calculateBallImpact(newAction, matchContext, match as any);
      const attributions = ImpactAttributor.attributeImpact(impactEvent, newAction);

      // Save Impact Event
      const impactEventRef = matchRef.collection('impact_events').doc(impactEvent.id);
      batch.set(impactEventRef, impactEvent);

      // Save Attributions and Update Player Totals
      for (const attr of attributions) {
        const attrRef = impactEventRef.collection('attributions').doc(attr.id);
        batch.set(attrRef, attr);

        // Update aggregated player impact for THIS match
        const playerImpactRef = matchRef.collection('player_impact').doc(attr.personId);
        batch.set(playerImpactRef, {
          personId: attr.personId,
          fixtureId: matchId,
          totalImpactValue: admin.firestore.FieldValue.increment(attr.impactValue),
          [`${attr.impactCategory.toLowerCase()}Impact`]: admin.firestore.FieldValue.increment(attr.impactValue),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
      }
    } catch (impactError) {
      // Log impact errors but don't fail the ball recording
      console.error('Impact Engine Error:', impactError);
    }

    // 4.6. Rewards Engine Integration
    try {
      const rewardTransactions = await RewardsEngine.processBallRewards(newAction, projection, match as any);
      await RewardService.applyTransactions(
        rewardTransactions.map(t => ({
          ...t,
          walletId: `wallet_${t.playerId}`,
          sourceEventId: matchId,
          metadata: { ...t.metadata, ballActionId: actionId }
        })),
        batch
      );
    } catch (rewardsError) {
      console.error('Rewards Engine Error:', rewardsError);
    }

    await batch.commit();

    // 5. Calculate Return Values for Client (Milestones, etc.)
    const strikerStats = projection.batsmen.find(b => b.playerId === ballData.strikerId);
    let milestone = null;
    if (strikerStats) {
      if ([50, 100, 150, 200].includes(strikerStats.runs)) {
        milestone = `${strikerStats.runs}`;
      }
    }

    // Simplified hat-trick: the last three wickets in the match fell to this bowler.
    const last3Bowlers = fold.recentWicketBowlerIds;
    const isHatTrick = isWicket
      && projection.fallOfWickets.length >= 3
      && last3Bowlers.length >= 3
      && last3Bowlers.every(id => id === ballData.bowlerId);

    const isOverComplete = projection.currentOver.length === 0 && projection.currentInnings.balls > 0 && projection.currentInnings.balls % 6 === 0;
    let calculatedMaiden = false;
    if (isOverComplete) {
      const thisOverActions = (inningsNumber === 2 ? fold.innings2 : fold.innings1)?.currentOverActions ?? [];
      calculatedMaiden = thisOverActions.reduce((sum, a) => sum + a.totalRuns, 0) === 0;
    }

    return {
      success: true,
      milestone,
      isHatTrick,
      isDuck: isWicket && strikerStats?.runs === 0,
      isMaidenOver: calculatedMaiden,
      isOverComplete
    };

  } catch (error) {
    console.error('recordBallAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to record ball' };
  }
}

export async function endInningsAction(matchId: string) {
  'use server';

  try {
    const db = admin.firestore();
    const matchRef = db.collection('matches').doc(matchId);

    const matchDoc = await matchRef.get();
    if (!matchDoc.exists) {
      return { success: false, error: 'Match not found' };
    }

    const match = matchDoc.data() as Match;
    const ctx = foldContextFor(matchId, match);
    const { fold, headSequence } = await loadFold(matchRef, ctx);
    const nextSequence = headSequence + 1;

    const currentInningsNumber: 1 | 2 = fold.innings2 ? 2 : 1;
    const lastAction = (fold.innings2 ?? fold.innings1)?.lastAction ?? null;

    // Create INNINGS_END action
    const actionId = matchRef.collection('scoring_actions').doc().id;
    const endInningsEvent: ScoringAction = {
      id: actionId,
      matchId,
      sequenceNumber: nextSequence,
      inningsNumber: currentInningsNumber,
      overNumber: lastAction?.overNumber || 0,
      ballInOver: lastAction?.ballInOver || 0,
      bowlerId: lastAction?.bowlerId || '',
      strikerId: lastAction?.strikerId || '',
      nonStrikerId: lastAction?.nonStrikerId || '',
      runsOffBat: 0,
      extras: { wide: 0, noBall: 0, bye: 0, legBye: 0, penalty: 0 },
      isWicket: false,
      isLegalDelivery: false, // Not a ball
      totalRuns: 0,
      timestamp: new Date().toISOString(),
      source: 'manual_entry',
      eventType: 'INNINGS_END',
      isVoided: false,
      createdAt: new Date().toISOString()
    };

    // Save event, fold and projection atomically
    const batch = db.batch();
    batch.set(matchRef.collection('scoring_actions').doc(endInningsEvent.id), stripUndefined(endInningsEvent));
    applyActionToFold(fold, endInningsEvent, ctx);
    const projection = writeFoldAndProjection(batch, matchRef, fold, ctx);

    // 4.7. End of Innings Rewards Integration
    try {
      const rewardTransactions = await RewardsEngine.processInningsRewards(projection, match as any);
      await RewardService.applyTransactions(
        rewardTransactions.map(t => ({
          ...t,
          walletId: `wallet_${t.playerId}`,
          sourceEventId: matchId,
          metadata: { ...t.metadata, inningsNumber: projection.inningsNumber }
        })),
        batch
      );
    } catch (rewardsError) {
      console.error('Innings Rewards Error:', rewardsError);
    }

    await batch.commit();

    // Record Audit Log
    await recordAuditLog({
      actorId: 'SCORER',
      actorName: 'Scorer',
      actionType: 'MATCH_RESULT_VERIFIED',
      entityType: 'match',
      entityId: matchId,
      description: `Innings ${currentInningsNumber} ended. ${projection.status === 'completed' ? 'Match Completed.' : 'Target set: ' + (projection.currentInnings as any).target}`,
      afterState: { status: projection.status, winnerId: projection.result?.winnerId }
    });

    if (projection.status === 'completed') {
      return {
        success: true,
        isMatchComplete: true,
        winnerId: projection.result?.winnerId,
        margin: projection.result?.winMargin
      };
    } else {
      return {
        success: true,
        isMatchComplete: false,
        target: (projection.currentInnings as any).target
      };
    }

  } catch (error) {
    console.error('endInningsAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to end innings' };
  }
}

export async function startSecondInningsAction(matchId: string) {
  'use server';
  try {
    const matchRef = admin.firestore().collection('matches').doc(matchId);
    const liveScoreRef = matchRef.collection('live').doc('score');

    await matchRef.update({
      status: 'live',
      state: 'LIVE',
      isLive: true
    });

    await liveScoreRef.update({
      status: 'live'
    });

    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error('Error starting second innings:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function undoLastBallAction(matchId: string, reason: string) {
  'use server';

  try {
    const db = admin.firestore();
    const matchRef = db.collection('matches').doc(matchId);

    // 1. Fetch Match and Actions
    const [matchDoc, actionsSnapshot] = await Promise.all([
      matchRef.get(),
      matchRef.collection('scoring_actions').orderBy('sequenceNumber', 'asc').get()
    ]);

    if (!matchDoc.exists) {
      return { success: false, error: 'Match not found' };
    }

    const match = matchDoc.data() as Match;
    const allActions = actionsSnapshot.docs.map(doc => doc.data() as ScoringAction);
    const validActions = allActions.filter(a => !a.isVoided);

    if (validActions.length === 0) {
      return { success: false, error: 'No actions to undo' };
    }

    // 2. Identify Last Valid Action
    const lastAction = validActions[validActions.length - 1];

    // 3. Mark as Voided
    const updatedAction = {
      ...lastAction,
      isVoided: true,
      voidReason: reason,
      voidedAt: new Date().toISOString()
    };

    // 4. Rebuild the fold from the corrected log. Undo is rare, so a full
    //    replay here is fine; it also keeps the persisted fold in sync so the
    //    next ball takes the fast path.
    const updatedAllActions = allActions.map(a => a.id === lastAction.id ? updatedAction : a);
    const ctx = foldContextFor(matchId, match);
    const fold = buildFoldFromActions(updatedAllActions, ctx);

    // 5. Save Updates Atomically
    const batch = db.batch();
    batch.set(matchRef.collection('scoring_actions').doc(lastAction.id), stripUndefined(updatedAction));
    writeFoldAndProjection(batch, matchRef, fold, ctx);
    await batch.commit();

    return { success: true, undoneRuns: lastAction.totalRuns };

  } catch (error) {
    console.error('undoLastBallAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to undo last ball' };
  }
}

export async function fetchOfficialMatches(userId: string): Promise<MatchFetchResult> {
  'use server';
  try {
    const matchesRef = admin.firestore().collection('matches');

    // We need to query for matches where the user is either an umpire, scorer, or referee
    // Firestore doesn't support OR queries across different fields efficiently in one go
    // So we'll run parallel queries

    const [umpiresQuery, scorerQuery, refereeQuery] = await Promise.all([
      matchesRef.where('umpires', 'array-contains', userId).get(),
      matchesRef.where('scorer', '==', userId).get(),
      matchesRef.where('referee', '==', userId).get()
    ]);

    const matchesMap = new Map<string, Match>();

    // Helper to process snapshots
    const processSnapshot = (snapshot: admin.firestore.QuerySnapshot) => {
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        // Ensure ID is included
        const match = { id: doc.id, ...data } as Match;
        matchesMap.set(doc.id, match);
      });
    };

    processSnapshot(umpiresQuery);
    processSnapshot(scorerQuery);
    processSnapshot(refereeQuery);

    const allMatches = Array.from(matchesMap.values());

    // Sort by date
    allMatches.sort((a, b) => {
      const dateA = new Date(a.matchDate as string).getTime();
      const dateB = new Date(b.matchDate as string).getTime();
      return dateA - dateB; // Ascending order
    });

    const now = new Date();
    const upcoming = allMatches.filter(m => {
      const matchDate = new Date(m.matchDate as string);
      return matchDate >= now && m.status !== 'completed' && m.status !== 'cancelled';
    });

    const past = allMatches.filter(m => {
      const matchDate = new Date(m.matchDate as string);
      return matchDate < now || m.status === 'completed';
    });

    // Sort past matches descending (most recent first)
    past.sort((a, b) => {
      const dateA = new Date(a.matchDate as string).getTime();
      const dateB = new Date(b.matchDate as string).getTime();
      return dateB - dateA;
    });

    const result = { success: true, upcoming, past, total: allMatches.length };
    return serializeData(result) as { success: true; upcoming: Match[]; past: Match[]; total: number };

  } catch (error) {
    console.error('fetchOfficialMatches error:', error);
    return { success: false, error: (error as Error).message } as { success: false; error: string };
  }
}

export type MatchFetchResult =
  | { success: true; upcoming: Match[]; past: Match[]; total: number }
  | { success: false; error: string };

export async function fetchMatchesForTeams(teamIds: string[]): Promise<MatchFetchResult> {
  'use server';
  try {
    if (!teamIds || teamIds.length === 0) {
      return { success: true, upcoming: [], past: [], total: 0 };
    }

    const matchesRef = admin.firestore().collection('matches');

    // Firestore "in" query allows up to 10 values.
    // We need to query for homeTeamId IN teamIds OR awayTeamId IN teamIds.
    // We'll run two queries and merge.

    const [homeQuery, awayQuery] = await Promise.all([
      matchesRef.where('homeTeamId', 'in', teamIds).get(),
      matchesRef.where('awayTeamId', 'in', teamIds).get()
    ]);

    const matchesMap = new Map<string, Match>();

    const processSnapshot = (snapshot: FirebaseFirestore.QuerySnapshot) => {
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const match = { id: doc.id, ...data } as Match;
        matchesMap.set(doc.id, match);
      });
    };

    processSnapshot(homeQuery);
    processSnapshot(awayQuery);

    const allMatches = Array.from(matchesMap.values());

    // Sort by date
    allMatches.sort((a, b) => {
      const dateA = new Date(a.matchDate as string).getTime();
      const dateB = new Date(b.matchDate as string).getTime();
      return dateA - dateB;
    });

    const now = new Date();
    const upcoming = allMatches.filter(m => {
      const matchDate = new Date(m.matchDate as string);
      return matchDate >= now && m.status !== 'completed' && m.status !== 'cancelled';
    });

    const past = allMatches.filter(m => {
      const matchDate = new Date(m.matchDate as string);
      return matchDate < now || m.status === 'completed';
    });

    past.sort((a, b) => {
      const dateA = new Date(a.matchDate as string).getTime();
      const dateB = new Date(b.matchDate as string).getTime();
      return dateB - dateA;
    });

    const result = { success: true, upcoming, past, total: allMatches.length };
    return serializeData(result) as { success: true; upcoming: Match[]; past: Match[]; total: number };

  } catch (error) {
    console.error('fetchMatchesForTeams error:', error);
    return { success: false, error: (error as Error).message } as { success: false; error: string };
  }
}





export async function simulateBallAction(matchId: string) {
  // Stub
  console.log('simulateBallAction', matchId);
  return { success: true };
}

export async function createScorecardFromLive(matchId: string) {
  // Stub
  console.log('createScorecardFromLive', matchId);
  return { scorecard: { id: 'temp-scorecard-id' } };
}

export async function getTopPerformersAction(scorecard: any) {
  // Stub
  console.log('getTopPerformersAction');
  return [];
}

export async function savePlayerOfTheMatchAction(matchId: string, player: any) {
  // Stub
  console.log('savePlayerOfTheMatchAction', matchId, player);
  return { success: true };
}

export async function assignOfficialToMatchAction(matchId: string, official: any) {
  // Stub
  console.log('assignOfficialToMatchAction', matchId, official);
  return { success: true };
}

export async function removeOfficialFromMatchAction(matchId: string, officialId: string) {
  // Stub
  console.log('removeOfficialFromMatchAction', matchId, officialId);
  return { success: true };
}

export async function getMatchDetailsAction(matchId: string) {
  'use server';
  try {
    const doc = await admin.firestore().collection('matches').doc(matchId).get();
    if (doc.exists) {
      return serializeData({ id: doc.id, ...doc.data() }) as Match;
    }
  } catch (error) {
    console.error('Error fetching match from Firestore, checking fallback:', error);
  }

  // Graceful Demo Fallback for demo match IDs
  const mockMatch = MOCK_MATCHES.find(m => m.id === matchId) || MOCK_MATCHES[0];
  return serializeData({
    id: mockMatch.id,
    homeTeamId: 'home-team-id',
    awayTeamId: 'away-team-id',
    homeTeamName: mockMatch.homeTeamName,
    awayTeamName: mockMatch.awayTeamName,
    matchType: mockMatch.matchType,
    division: mockMatch.division,
    location: mockMatch.venue,
    matchDate: new Date().toISOString(),
    status: mockMatch.state.toLowerCase() as any,
    state: mockMatch.state,
    currentInningsNumber: mockMatch.currentInnings,
    liveScore: mockMatch.liveScore
  }) as unknown as Match;
}

export async function getDivisionAction(divisionId: string) {
  'use server';
  try {
    const doc = await admin.firestore().collection('divisions').doc(divisionId).get();
    if (!doc.exists) return null;
    return serializeData({ id: doc.id, ...doc.data() }) as Division;
  } catch (error) {
    console.error('Error fetching division:', error);
    return null;
  }
}

export async function getTeamSquadAction(teamId: string) {
  'use server';
  try {
    const snapshot = await admin.firestore()
      .collection('people')
      .where('teamIds', 'array-contains', teamId)
      .get();

    if (!snapshot.empty) {
      return serializeData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Person)));
    }
  } catch (error) {
    console.warn('Error or quota exceeded fetching squad from Firestore, using mock fallback:', (error as Error).message || error);
  }

  // Fallback mock squad when Firestore fails (e.g. quota exceeded) or returns empty
  return serializeData([
    { id: 'p1', firstName: 'Kagiso', lastName: 'Rabada', displayName: 'Kagiso Rabada', role: 'Bowler', primaryRole: 'Bowler', teamIds: [teamId] },
    { id: 'p2', firstName: 'Aiden', lastName: 'Markram', displayName: 'Aiden Markram', role: 'Batter', primaryRole: 'Batter', teamIds: [teamId] },
    { id: 'p3', firstName: 'Quinton', lastName: 'de Kock', displayName: 'Quinton de Kock', role: 'Wicketkeeper', primaryRole: 'Wicketkeeper', teamIds: [teamId] },
    { id: 'p4', firstName: 'Marco', lastName: 'Jansen', displayName: 'Marco Jansen', role: 'All-Rounder', primaryRole: 'All-Rounder', teamIds: [teamId] },
    { id: 'p5', firstName: 'Lungi', lastName: 'Ngidi', displayName: 'Lungi Ngidi', role: 'Bowler', primaryRole: 'Bowler', teamIds: [teamId] },
    { id: 'p6', firstName: 'Temba', lastName: 'Bavuma', displayName: 'Temba Bavuma', role: 'Batter', primaryRole: 'Batter', teamIds: [teamId] },
    { id: 'p7', firstName: 'David', lastName: 'Miller', displayName: 'David Miller', role: 'Batter', primaryRole: 'Batter', teamIds: [teamId] },
    { id: 'p8', firstName: 'Keshav', lastName: 'Maharaj', displayName: 'Keshav Maharaj', role: 'Spinner', primaryRole: 'Spinner', teamIds: [teamId] },
    { id: 'p9', firstName: 'Anrich', lastName: 'Nortje', displayName: 'Anrich Nortje', role: 'Bowler', primaryRole: 'Bowler', teamIds: [teamId] },
    { id: 'p10', firstName: 'Heinrich', lastName: 'Klaasen', displayName: 'Heinrich Klaasen', role: 'Wicketkeeper', primaryRole: 'Wicketkeeper', teamIds: [teamId] },
    { id: 'p11', firstName: 'Tabraiz', lastName: 'Shamsi', displayName: 'Tabraiz Shamsi', role: 'Spinner', primaryRole: 'Spinner', teamIds: [teamId] }
  ]) as Person[];
}

export async function saveTeamSelectionAction(
  matchId: string,
  teamType: 'home' | 'away',
  selection: {
    playingXI: string[];
    reserves: string[];
    captain: string;
    viceCaptain?: string;
  }
) {
  'use server';
  try {
    const updateData = {
      [`teamSelection.${teamType}`]: {
        ...selection,
        confirmedAt: new Date().toISOString(),
        confirmedBy: 'user' // In real app, get from auth
      }
    };

    await admin.firestore().collection('matches').doc(matchId).set(updateData, { merge: true });
    revalidatePath(`/matches/${matchId}/pre-match`);
    return { success: true };
  } catch (error) {
    console.error('Error saving team selection:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function saveTossResultAction(
  matchId: string,
  result: {
    winner: 'home' | 'away';
    decision: 'bat' | 'field';
  }
) {
  'use server';
  try {
    const updateData = {
      'preMatch.toss': {
        ...result,
        conductedAt: new Date().toISOString(),
        conductedBy: 'user'
      },
      // Also update legacy fields for compatibility
      tossWinner: result.winner === 'home' ? 'Home Team' : 'Away Team', // Ideally ID
      tossChoice: result.decision
    };

    await admin.firestore().collection('matches').doc(matchId).set(updateData, { merge: true });
    revalidatePath(`/matches/${matchId}/pre-match`);
    return { success: true };
  } catch (error) {
    console.error('Error saving toss result:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function saveScorerChecklistAction(matchId: string, checklist: any) {
  'use server';
  try {
    const updateData = {
      'preMatch.scorerChecklist': {
        ...checklist,
        completedAt: new Date().toISOString(),
        completedBy: 'user'
      }
    };

    await admin.firestore().collection('matches').doc(matchId).set(updateData, { merge: true });
    revalidatePath(`/matches/${matchId}/pre-match`);
    return { success: true };
  } catch (error) {
    console.error('Error saving scorer checklist:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function endMatchAction(matchId: string, result: { winnerId?: string; margin?: string; resultText: string }) {
  'use server';
  try {
    const matchRef = admin.firestore().collection('matches').doc(matchId);
    const liveScoreRef = matchRef.collection('live').doc('score');

    const [matchDoc, liveScoreDoc] = await Promise.all([
      matchRef.get(),
      liveScoreRef.get()
    ]);

    if (!matchDoc.exists || !liveScoreDoc.exists) {
      throw new Error("Match or live score not found");
    }

    const match = matchDoc.data() as any;
    const liveScore = liveScoreDoc.data() as any;

    // Calculate scores to update on Match doc
    const scoreString = `${liveScore.currentInnings.runs}/${liveScore.currentInnings.wickets} (${liveScore.currentInnings.overs})`;
    const isHomeBatting = liveScore.currentInnings.battingTeamId === match.homeTeamId;

    const matchUpdateData: any = {
      status: 'completed',
      winnerId: result.winnerId,
      winMargin: result.margin,
      result: result.resultText,
      completedAt: new Date().toISOString()
    };

    if (isHomeBatting) {
      matchUpdateData.homeScore = liveScore.currentInnings.runs;
      matchUpdateData['score.home'] = scoreString;
    } else {
      matchUpdateData.awayScore = liveScore.currentInnings.runs;
      matchUpdateData['score.away'] = scoreString;
    }

    await matchRef.update(matchUpdateData);

    await liveScoreRef.update({
      status: 'completed',
      winnerId: result.winnerId,
      winMargin: result.margin
    });

    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error('Error ending match:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function retireBatterAction(matchId: string, playerId: string, retirementType: 'retired_hurt' | 'retired_out' = 'retired_out') {
  'use server';
  try {
    const matchRef = admin.firestore().collection('matches').doc(matchId);
    const liveScoreRef = matchRef.collection('live').doc('score');

    await admin.firestore().runTransaction(async (t) => {
      const scoreDoc = await t.get(liveScoreRef);
      if (!scoreDoc.exists) throw new Error("Live score not found");

      const data = scoreDoc.data();
      const batsmen = data?.batsmen || [];

      // Find and update the batsman's stats
      const batsmanIndex = batsmen.findIndex((b: any) => b.playerId === playerId);
      if (batsmanIndex === -1) throw new Error("Batsman not found");

      batsmen[batsmanIndex].isOut = true;
      batsmen[batsmanIndex].dismissalType = retirementType;

      // Determine which position to clear
      const isStriker = data?.currentPlayers?.strikerId === playerId;
      const isNonStriker = data?.currentPlayers?.nonStrikerId === playerId;

      const updates: any = {
        batsmen: batsmen,
        lastUpdated: new Date().toISOString()
      };

      if (isStriker) {
        updates['currentPlayers.strikerId'] = null;
        t.update(matchRef, { 'liveData.striker': null });
      } else if (isNonStriker) {
        updates['currentPlayers.nonStrikerId'] = null;
        t.update(matchRef, { 'liveData.nonStriker': null });
      } else {
        throw new Error("Player is not currently batting");
      }

      t.update(liveScoreRef, updates);
    });

    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error('Error retiring batter:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function saveBattingOrderAction(matchId: string, orderData: { home: string[], away: string[] }) {
  'use server';
  try {
    const updateData = {
      'preMatch.battingOrder': {
        ...orderData,
        arrangedAt: new Date().toISOString(),
        arrangedBy: 'user'
      }
    };

    await admin.firestore().collection('matches').doc(matchId).set(updateData, { merge: true });
    revalidatePath(`/matches/${matchId}/pre-match`);
    return { success: true };
  } catch (error) {
    console.error('Error saving batting order:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function initializeLiveMatchAction(
  matchId: string,
  tossResult: { winner: 'home' | 'away', decision: 'bat' | 'field' },
  battingOrder: { home: string[], away: string[] }
) {
  'use server';
  try {
    const matchRef = admin.firestore().collection('matches').doc(matchId);
    const matchDoc = await matchRef.get();

    let matchData: Partial<Match>;
    if (matchDoc.exists) {
      matchData = matchDoc.data() as Match;
    } else {
      const mockMatch = (MOCK_MATCHES.find(m => m.id === matchId) || MOCK_MATCHES[0]) as any;
      matchData = {
        id: matchId,
        homeTeamId: mockMatch.homeTeamId || 'home-team-id',
        awayTeamId: mockMatch.awayTeamId || 'away-team-id',
        homeTeamName: mockMatch.homeTeamName || 'Westville 1st XI',
        awayTeamName: mockMatch.awayTeamName || 'Kearsney 1st XI',
        matchType: 'T20',
        status: 'scheduled',
        state: 'SCHEDULED',
      };
    }

    const homeTeamId = matchData.homeTeamId || 'home-team-id';
    const awayTeamId = matchData.awayTeamId || 'away-team-id';

    // Determine batting team
    let battingTeamId = '';
    let bowlingTeamId = '';

    if (tossResult.decision === 'bat') {
      battingTeamId = tossResult.winner === 'home' ? homeTeamId : awayTeamId;
      bowlingTeamId = tossResult.winner === 'home' ? awayTeamId : homeTeamId;
    } else {
      battingTeamId = tossResult.winner === 'home' ? awayTeamId : homeTeamId;
      bowlingTeamId = tossResult.winner === 'home' ? homeTeamId : awayTeamId;
    }

    // Get openers from batting order with fallbacks
    const isHomeBatting = battingTeamId === homeTeamId;
    const battingTeamOrder = (isHomeBatting ? battingOrder.home : battingOrder.away) || [];
    const strikerId = battingTeamOrder[0] || 'p1';
    const nonStrikerId = battingTeamOrder[1] || 'p2';

    // Initial Live Score Data
    const initialLiveScore = {
      status: 'live',
      inningsNumber: 1,
      currentInnings: {
        battingTeamId,
        bowlingTeamId,
        runs: 0,
        wickets: 0,
        balls: 0,
        overs: 0
      },
      currentPlayers: {
        strikerId,
        nonStrikerId,
        bowlerId: null, // To be selected by user
        bowlingAngle: 'Over the Wicket'
      },
      batsmen: [
        { playerId: strikerId, runs: 0, ballsFaced: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false },
        { playerId: nonStrikerId, runs: 0, ballsFaced: 0, fours: 0, sixes: 0, strikeRate: 0, isOut: false }
      ],
      bowlers: [],
      ballHistory: [],
      undoLog: [],
      lastUpdated: new Date().toISOString()
    };

    // Update Match Status and Create Live Score
    await matchRef.set({
      status: 'live',
      state: 'LIVE',
      isLive: true,
      homeTeamId,
      awayTeamId,
      'liveData.currentInnings': 1,
      'liveData.striker': strikerId,
      'liveData.nonStriker': nonStrikerId
    }, { merge: true });

    await matchRef.collection('live').doc('score').set(initialLiveScore);

    revalidatePath(`/matches/${matchId}`);
    return { success: true };

  } catch (error) {
    console.error('Error initializing live match:', error);
    return { success: false, error: (error as Error).message };
  }
}


export async function selectNewBatsmanAction(matchId: string, playerId: string) {
  'use server';
  try {
    const matchRef = admin.firestore().collection('matches').doc(matchId);
    const liveScoreRef = matchRef.collection('live').doc('score');

    await admin.firestore().runTransaction(async (t) => {
      const scoreDoc = await t.get(liveScoreRef);
      if (!scoreDoc.exists) throw new Error("Live score not found");

      const newBatsmanStats = {
        playerId,
        runs: 0,
        ballsFaced: 0,
        fours: 0,
        sixes: 0,
        strikeRate: 0,
        isOut: false
      };

      t.update(liveScoreRef, {
        'currentPlayers.strikerId': playerId,
        'batsmen': admin.firestore.FieldValue.arrayUnion(newBatsmanStats)
      });

      t.update(matchRef, {
        'liveData.striker': playerId
      });
    });

    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error('Error selecting batsman:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function selectNewBowlerAction(matchId: string, playerId: string) {
  'use server';
  try {
    const matchRef = admin.firestore().collection('matches').doc(matchId);
    const liveScoreRef = matchRef.collection('live').doc('score');

    await admin.firestore().runTransaction(async (t) => {
      const scoreDoc = await t.get(liveScoreRef);
      if (!scoreDoc.exists) throw new Error("Live score not found");

      const data = scoreDoc.data();
      const existingBowler = data?.bowlers?.find((b: any) => b.playerId === playerId);

      if (!existingBowler) {
        const newBowlerStats = {
          playerId,
          overs: 0,
          maidens: 0,
          runsConceded: 0,
          wickets: 0,
          ballsBowled: 0,
          wides: 0,
          noballs: 0,
          economy: 0
        };
        t.update(liveScoreRef, {
          'currentPlayers.bowlerId': playerId,
          'bowlers': admin.firestore.FieldValue.arrayUnion(newBowlerStats)
        });
      } else {
        t.update(liveScoreRef, {
          'currentPlayers.bowlerId': playerId
        });
      }

      t.update(matchRef, {
        'liveData.bowler': playerId
      });
    });

    revalidatePath(`/matches/${matchId}`);
    return { success: true };
  } catch (error) {
    console.error('Error selecting bowler:', error);
    return { success: false, error: (error as Error).message };
  }
}

// --- Match Fetching Actions ---

export async function getLiveMatchesAction(): Promise<Match[]> {
  try {
    const snapshot = await admin.firestore().collection('matches')
      .where('status', 'in', ['live', 'LIVE', 'in_progress', 'IN_PROGRESS', 'scoring', 'SCORING'])
      .get();

    const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Match[];
    return serializeData(matches);
  } catch (error) {
    console.error('Error fetching live matches:', error);
    return [];
  }
}

export async function getRecentMatchesAction(limitCount = 5): Promise<Match[]> {
  try {
    console.log('[matchActions] Fetching recent matches...');
    const snapshot = await admin.firestore().collection('matches')
      .where('status', 'in', ['completed', 'COMPLETED', 'finished', 'FINISHED', 'closed', 'CLOSED'])
      .orderBy('dateTime', 'desc')
      .limit(limitCount)
      .get();
    const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Match[];
    console.log(`[matchActions] Found ${matches.length} recent matches`);
    return serializeData(matches);
  } catch (error) {
    console.error('Error fetching recent matches:', error);
    return [];
  }
}

export async function getUpcomingMatchesAction(limitCount = 5): Promise<Match[]> {
  try {
    console.log('[matchActions] Fetching upcoming matches...');
    // We'll broaden the query to any scheduled match regardless of date for debugging
    const snapshot = await admin.firestore().collection('matches')
      .where('status', 'in', ['scheduled', 'SCHEDULED', 'upcoming', 'UPCOMING', 'pre_match', 'PRE_MATCH', 'confirmed', 'CONFIRMED'])
      .limit(limitCount)
      .get();

    let matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Match[];

    // Sort manually if we can't trust the dateTime field format in the query
    matches.sort((a, b) => {
      const dateA = a.dateTime ? new Date(a.dateTime).getTime() : 0;
      const dateB = b.dateTime ? new Date(b.dateTime).getTime() : 0;
      return dateA - dateB;
    });

    console.log(`[matchActions] Found ${matches.length} upcoming matches (total matching status)`);
    return serializeData(matches);
  } catch (error) {
    console.error('Error fetching upcoming matches:', error);
    return [];
  }
}
