'use server';

/**
 * Tactical Directive Bus — Phase C (effectiveness) and Phase D (advisory
 * suggestions). Read-only aggregation over the data written by
 * tacticalDirectiveActions.ts. Nothing here is machine-learned — Phase D is
 * a historical-pattern lookup over this team's own recorded outcomes, which
 * is what the spec itself describes ("Historical pattern search → Suggested
 * tactical plan"), kept explicitly advisory rather than automatic.
 */

import admin from '@/lib/firebase-admin';
import type {
  TacticalDirective,
  DirectiveOutcome,
  DirectiveEffectiveness,
  TacticalIntelligenceSummary,
  TacticalSuggestion,
} from '@/types/tacticalDirectives';

type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

function directivesRef(matchId: string) {
  return admin.firestore().collection('matches').doc(matchId).collection('tacticalDirectives');
}

export async function computeDirectiveEffectivenessAction(
  matchId: string,
  directiveId: string
): Promise<ActionResult<DirectiveEffectiveness>> {
  try {
    const dirSnap = await directivesRef(matchId).doc(directiveId).get();
    if (!dirSnap.exists) return { success: false, error: 'Directive not found' };
    const directive = dirSnap.data() as TacticalDirective;

    const outcomesSnap = await directivesRef(matchId).doc(directiveId).collection('outcomes').get();
    const outcomes = outcomesSnap.docs.map((d) => d.data() as DirectiveOutcome);

    const ballsDelivered = outcomes.length;
    const runsConceded = outcomes.reduce((s, o) => s + o.runs, 0);
    const wickets = outcomes.filter((o) => o.isWicket).length;
    const boundariesConceded = outcomes.filter((o) => o.isBoundary).length;
    const dotBalls = outcomes.filter((o) => o.isDot).length;

    let metSuccessCriteria: boolean | null = null;
    if (directive.successCriteria) {
      const { maxRuns, boundaryAllowed, wicketTarget, maxDotBalls } = directive.successCriteria;
      metSuccessCriteria =
        (maxRuns === undefined || runsConceded <= maxRuns) &&
        (boundaryAllowed !== false || boundariesConceded === 0) &&
        (!wicketTarget || wickets > 0) &&
        (maxDotBalls === undefined || dotBalls >= maxDotBalls);
    }

    // Heuristic score when there's no explicit success criteria to grade
    // against: reward dot balls and wickets, penalise boundaries and runs.
    let effectivenessPct: number;
    if (metSuccessCriteria !== null) {
      effectivenessPct = metSuccessCriteria ? 100 : Math.max(0, 60 - boundariesConceded * 20);
    } else if (ballsDelivered === 0) {
      effectivenessPct = 0;
    } else {
      const dotRate = dotBalls / ballsDelivered;
      const wicketBonus = wickets > 0 ? 25 : 0;
      const boundaryPenalty = boundariesConceded * 15;
      effectivenessPct = Math.max(0, Math.min(100, Math.round(dotRate * 75 + wicketBonus - boundaryPenalty)));
    }

    return {
      success: true,
      data: { directiveId, ballsDelivered, runsConceded, wickets, boundariesConceded, dotBalls, metSuccessCriteria, effectivenessPct },
    };
  } catch (error) {
    console.error('computeDirectiveEffectivenessAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to compute effectiveness' };
  }
}

/**
 * Summary across every directive issued in one match — the card the Coach
 * Cockpit shows, and the "Coach intelligence" / "Captain intelligence"
 * split from spec §19, scoped to a single match rather than a season (a
 * season-wide rollup needs the same shape queried across matchIds, which
 * this function's caller can do by calling it per match and combining).
 */
export async function getMatchTacticalSummaryAction(matchId: string): Promise<ActionResult<TacticalIntelligenceSummary>> {
  try {
    const dirsSnap = await directivesRef(matchId).get();
    const directives = dirsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as TacticalDirective));

    if (directives.length === 0) {
      return {
        success: true,
        data: {
          scopeLabel: 'This match',
          directivesIssued: 0,
          acceptRate: 0,
          modifyRate: 0,
          dismissRate: 0,
          avgResponseSeconds: null,
          avgEffectivenessPct: null,
          boundaryPreventionRate: null,
        },
      };
    }

    const responded = directives.filter((d) => d.latestResponse);
    const accepted = responded.filter((d) => d.latestResponse!.type === 'ACCEPTED').length;
    const modified = responded.filter((d) => d.latestResponse!.type === 'MODIFIED').length;
    const dismissed = responded.filter((d) => d.latestResponse!.type === 'DISMISSED').length;

    const responseTimes: number[] = [];
    for (const d of directives) {
      if (d.transmittedAt && d.latestResponse?.respondedAt) {
        responseTimes.push((new Date(d.latestResponse.respondedAt).getTime() - new Date(d.transmittedAt).getTime()) / 1000);
      }
    }

    const effectivenessResults = await Promise.all(
      directives.map((d) => computeDirectiveEffectivenessAction(matchId, d.id))
    );
    const effectivenessValues = effectivenessResults
      .filter((r): r is { success: true; data: DirectiveEffectiveness } => r.success)
      .map((r) => r.data);

    const withOutcomes = effectivenessValues.filter((e) => e.ballsDelivered > 0);
    const boundaryPreventionRate =
      withOutcomes.length > 0
        ? Math.round((withOutcomes.filter((e) => e.boundariesConceded === 0).length / withOutcomes.length) * 100)
        : null;

    return {
      success: true,
      data: {
        scopeLabel: 'This match',
        directivesIssued: directives.length,
        acceptRate: Math.round((accepted / directives.length) * 100),
        modifyRate: Math.round((modified / directives.length) * 100),
        dismissRate: Math.round((dismissed / directives.length) * 100),
        avgResponseSeconds:
          responseTimes.length > 0 ? Math.round(responseTimes.reduce((s, v) => s + v, 0) / responseTimes.length) : null,
        avgEffectivenessPct:
          effectivenessValues.length > 0
            ? Math.round(effectivenessValues.reduce((s, e) => s + e.effectivenessPct, 0) / effectivenessValues.length)
            : null,
        boundaryPreventionRate,
      },
    };
  } catch (error) {
    console.error('getMatchTacticalSummaryAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to summarise match tactics' };
  }
}

/**
 * Phase D — advisory suggestion for a target batter, built from this team's
 * own historical directive outcomes rather than a trained model. Needs a
 * Firestore collection-group index on `tacticalDirectives` (Firebase will
 * prompt for it on first real query if one isn't already deployed via
 * firestore.indexes.json — collectionGroup queries need explicit indexing
 * beyond the automatic single-field ones).
 */
export async function suggestTacticalPlanAction(
  teamId: string,
  batterId: string,
  batterName: string
): Promise<ActionResult<TacticalSuggestion | null>> {
  try {
    const db = admin.firestore();
    const directivesSnap = await db
      .collectionGroup('tacticalDirectives')
      .where('teamId', '==', teamId)
      .where('target.batterId', '==', batterId)
      .get();

    if (directivesSnap.empty) {
      return { success: true, data: null };
    }

    let totalBalls = 0;
    let totalRuns = 0;
    let dismissals = 0;
    let dots = 0;
    let boundaries = 0;
    let bestBowlingPlan: TacticalSuggestion['recommendedBowlingPlan'] | undefined;
    let bestPlanDotRate = -1;

    for (const dirDoc of directivesSnap.docs) {
      const directive = dirDoc.data() as TacticalDirective;
      const outcomesSnap = await dirDoc.ref.collection('outcomes').get();
      const outcomes = outcomesSnap.docs.map((d) => d.data() as DirectiveOutcome);
      if (outcomes.length === 0) continue;

      totalBalls += outcomes.length;
      totalRuns += outcomes.reduce((s, o) => s + o.runs, 0);
      dismissals += outcomes.filter((o) => o.isWicket).length;
      dots += outcomes.filter((o) => o.isDot).length;
      boundaries += outcomes.filter((o) => o.isBoundary).length;

      const dotRate = outcomes.filter((o) => o.isDot).length / outcomes.length;
      if (directive.bowlingPlan && dotRate > bestPlanDotRate) {
        bestPlanDotRate = dotRate;
        bestBowlingPlan = directive.bowlingPlan;
      }
    }

    if (totalBalls === 0) {
      return { success: true, data: null };
    }

    const dotBallRatePct = Math.round((dots / totalBalls) * 100);
    const boundaryRatePct = Math.round((boundaries / totalBalls) * 100);
    const average = dismissals > 0 ? Math.round((totalRuns / dismissals) * 10) / 10 : totalRuns;

    const vulnerability = bestBowlingPlan
      ? `${bestBowlingPlan.line?.replace(/_/g, ' ').toLowerCase()}, ${bestBowlingPlan.length?.replace(/_/g, ' ').toLowerCase()}`
      : 'no single plan stands out yet';

    return {
      success: true,
      data: {
        batterId,
        batterName,
        basis: 'HISTORICAL_DIRECTIVE_OUTCOMES',
        sampleSize: totalBalls,
        observedVulnerability: vulnerability,
        averageConceded: average,
        dismissalCount: dismissals,
        dotBallRatePct,
        boundaryRatePct,
        recommendedBowlingPlan: bestBowlingPlan,
        narrative: `Across ${totalBalls} deliveries under a tactical directive against ${batterName}, ${dotBallRatePct}% were dot balls and ${dismissals} produced a dismissal. ${bestBowlingPlan ? `The plan with the best dot-ball rate was ${vulnerability}.` : ''}`.trim(),
        advisoryOnly: true,
      },
    };
  } catch (error) {
    console.error('suggestTacticalPlanAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to build tactical suggestion' };
  }
}
