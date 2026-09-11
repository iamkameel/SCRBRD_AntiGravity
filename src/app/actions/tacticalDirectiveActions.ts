'use server';

/**
 * Tactical Directive Bus — write-side server actions.
 *
 * Mirrors the shape of matchActions.ts: Admin SDK writes (rules exist for the
 * client-side realtime listeners, but these actions run trusted, server-side),
 * every function returns { success, error?, ...extra } rather than throwing,
 * and every meaningful state transition is logged via recordAuditLog.
 *
 * Idempotency: every mutating call carries a clientEventId. Directive
 * transmission uses it as the document ID directly (a retried transmit is a
 * no-op, not a duplicate). Responses use it as the response subcollection's
 * document ID for the same reason — see firestore.rules, which also enforces
 * that only the captain who typed a response can ever write that id.
 */

import admin from '@/lib/firebase-admin';
import { recordAuditLog } from '@/lib/services/auditService';
import type {
  TacticalDirective,
  DirectiveResponse,
  TransmitDirectiveInput,
  RespondToDirectiveInput,
  DirectiveOutcome,
} from '@/types/tacticalDirectives';

type ActionResult<T = {}> = { success: true } & T | { success: false; error: string; currentDirective?: TacticalDirective };

function directivesRef(matchId: string) {
  return admin.firestore().collection('matches').doc(matchId).collection('tacticalDirectives');
}

/**
 * Coach transmits a new directive (or a replacement for a superseded one).
 * clientEventId doubles as the directive's document id, so a retried submit
 * (flaky connection, double-tap) lands on the same document instead of
 * creating a duplicate transmission.
 */
export async function transmitDirectiveAction(input: TransmitDirectiveInput): Promise<ActionResult<{ directiveId: string }>> {
  try {
    const db = admin.firestore();
    const ref = directivesRef(input.matchId).doc(input.clientEventId);
    const existing = await ref.get();
    if (existing.exists) {
      // Already transmitted by an earlier attempt of this same client action.
      return { success: true, directiveId: ref.id };
    }

    const now = new Date();
    const expiresAt = input.expiresInSeconds
      ? new Date(now.getTime() + input.expiresInSeconds * 1000).toISOString()
      : undefined;

    const countSnap = await directivesRef(input.matchId).count().get();
    const sequence = countSnap.data().count + 1;

    if (input.supersedesDirectiveId) {
      const prevRef = directivesRef(input.matchId).doc(input.supersedesDirectiveId);
      const prevSnap = await prevRef.get();
      if (prevSnap.exists) {
        await prevRef.update({
          status: 'SUPERSEDED',
          version: admin.firestore.FieldValue.increment(1),
          updatedAt: now.toISOString(),
        });
      }
    }

    const directive: Omit<TacticalDirective, 'id'> = {
      matchId: input.matchId,
      inningsNumber: input.inningsNumber,
      teamId: input.teamId,
      issuedByPersonId: input.issuedByPersonId,
      issuedByName: input.issuedByName,
      issuedToPersonId: input.issuedToPersonId,
      issuedToName: input.issuedToName,
      sequence,
      version: 1,
      directiveType: input.directiveType,
      title: input.title,
      instruction: input.instruction,
      phase: input.phase,
      tacticalIntent: input.tacticalIntent,
      scope: input.scope,
      target: input.target,
      fieldPlan: input.fieldPlan,
      bowlingPlan: input.bowlingPlan,
      battingPlan: input.battingPlan,
      trigger: input.trigger,
      successCriteria: input.successCriteria,
      priority: input.priority ?? 'P2_TACTICAL',
      transmittedAt: now.toISOString(),
      expiresAt,
      status: 'TRANSMITTED',
      supersedesDirectiveId: input.supersedesDirectiveId,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    await ref.set(directive);
    await ref.collection('receipts').doc(input.issuedToPersonId).set({
      personId: input.issuedToPersonId,
      status: 'SENT',
      sentAt: now.toISOString(),
    });

    await recordAuditLog({
      actorId: input.issuedByPersonId,
      actorName: input.issuedByName,
      actionType: 'TACTICAL_DIRECTIVE_TRANSMITTED',
      entityType: 'tactical_directive',
      entityId: ref.id,
      description: `Transmitted "${input.title}" to ${input.issuedToName ?? input.issuedToPersonId}`,
    });

    return { success: true, directiveId: ref.id };
  } catch (error) {
    console.error('transmitDirectiveAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to transmit directive' };
  }
}

/** Captain marks a directive as delivered/viewed on their device. Cheap, called from the client listener. */
export async function acknowledgeDirectiveReceiptAction(
  matchId: string,
  directiveId: string,
  personId: string,
  stage: 'DEVICE_RECEIVED' | 'VIEWED'
): Promise<ActionResult> {
  try {
    const now = new Date().toISOString();
    const receiptRef = directivesRef(matchId).doc(directiveId).collection('receipts').doc(personId);
    await receiptRef.set(
      stage === 'DEVICE_RECEIVED'
        ? { personId, status: 'DEVICE_RECEIVED', deviceReceivedAt: now }
        : { personId, status: 'VIEWED', viewedAt: now },
      { merge: true }
    );
    // Bump the directive's own status forward too, but never backward (a
    // late VIEWED ack shouldn't downgrade a directive already ACCEPTED).
    const dirRef = directivesRef(matchId).doc(directiveId);
    const snap = await dirRef.get();
    const current = snap.data() as TacticalDirective | undefined;
    if (current && (current.status === 'TRANSMITTED' || (stage === 'VIEWED' && current.status === 'DELIVERED'))) {
      await dirRef.update({ status: stage === 'VIEWED' ? 'VIEWED' : 'DELIVERED', updatedAt: now });
    }
    return { success: true };
  } catch (error) {
    console.error('acknowledgeDirectiveReceiptAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to acknowledge receipt' };
  }
}

/**
 * Captain accepts, modifies, or dismisses a directive.
 *
 * Concurrency: the caller must pass the directiveVersion it was shown. If the
 * coach transmitted a v2 while the captain was reading v1, this rejects with
 * STALE_VERSION and the current directive, so the UI can show "the coach
 * changed this instruction before your response was received" rather than
 * silently applying a response to a plan that no longer exists.
 */
export async function respondToDirectiveAction(input: RespondToDirectiveInput): Promise<ActionResult> {
  try {
    const dirRef = directivesRef(input.matchId).doc(input.directiveId);
    const dirSnap = await dirRef.get();
    if (!dirSnap.exists) {
      return { success: false, error: 'Directive not found' };
    }
    const current = { id: dirSnap.id, ...dirSnap.data() } as TacticalDirective;

    if (current.version !== input.directiveVersion) {
      return { success: false, error: 'STALE_VERSION', currentDirective: current };
    }

    const responseRef = dirRef.collection('responses').doc(input.clientEventId);
    const existingResponse = await responseRef.get();
    if (existingResponse.exists) {
      // Duplicate submit (retry/double-tap) — already applied, no-op.
      return { success: true };
    }

    const now = new Date().toISOString();
    const response: Omit<DirectiveResponse, 'id'> = {
      directiveId: input.directiveId,
      directiveVersion: input.directiveVersion,
      matchId: input.matchId,
      responseType: input.responseType,
      reason: input.reason,
      modification: input.modification,
      respondedByPersonId: input.respondedByPersonId,
      respondedAt: now,
      clientEventId: input.clientEventId,
    };
    await responseRef.set(response);

    await dirRef.update({
      status: input.responseType,
      latestResponse: {
        type: input.responseType,
        reason: input.reason,
        respondedAt: now,
      },
      updatedAt: now,
    });

    const actionType =
      input.responseType === 'ACCEPTED' ? 'TACTICAL_DIRECTIVE_ACCEPTED'
      : input.responseType === 'MODIFIED' ? 'TACTICAL_DIRECTIVE_MODIFIED'
      : 'TACTICAL_DIRECTIVE_DISMISSED';

    await recordAuditLog({
      actorId: input.respondedByPersonId,
      actorName: input.respondedByPersonId,
      actionType,
      entityType: 'tactical_directive',
      entityId: input.directiveId,
      description: `${input.responseType} · ${current.title}${input.reason ? ` (${input.reason})` : ''}`,
    });

    return { success: true };
  } catch (error) {
    console.error('respondToDirectiveAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to respond to directive' };
  }
}

/** Coach cancels an active directive outright — no replacement plan. */
export async function cancelDirectiveAction(
  matchId: string,
  directiveId: string,
  cancelledByPersonId: string,
  cancelledByName: string
): Promise<ActionResult> {
  try {
    const dirRef = directivesRef(matchId).doc(directiveId);
    const snap = await dirRef.get();
    if (!snap.exists) return { success: false, error: 'Directive not found' };
    const current = snap.data() as TacticalDirective;

    await dirRef.update({
      status: 'SUPERSEDED',
      version: admin.firestore.FieldValue.increment(1),
      updatedAt: new Date().toISOString(),
    });

    await recordAuditLog({
      actorId: cancelledByPersonId,
      actorName: cancelledByName,
      actionType: 'TACTICAL_DIRECTIVE_CANCELLED',
      entityType: 'tactical_directive',
      entityId: directiveId,
      description: `Cancelled "${current.title}" with no replacement`,
    });

    return { success: true };
  } catch (error) {
    console.error('cancelDirectiveAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to cancel directive' };
  }
}

/**
 * Lazy expiry sweep. There's no scheduled Cloud Function wired up in this
 * codebase yet, so this is called opportunistically — on Coach/Captain
 * Cockpit mount and on an interval — rather than running server-side on a
 * timer. A directive that expired while the captain was offline is marked
 * EXPIRED_BEFORE_DELIVERY (never surfaced as a fresh alert on reconnect,
 * per the spec's "expired offline directives" rule); one that was at least
 * viewed is marked plain EXPIRED.
 */
export async function sweepExpiredDirectivesAction(matchId: string): Promise<ActionResult<{ expiredCount: number }>> {
  try {
    const now = new Date().toISOString();
    const activeStatuses: TacticalDirective['status'][] = ['TRANSMITTED', 'DELIVERED', 'VIEWED', 'ACTIVE'];
    const snap = await directivesRef(matchId).where('status', 'in', activeStatuses).get();

    let expiredCount = 0;
    const batch = admin.firestore().batch();
    for (const doc of snap.docs) {
      const d = doc.data() as TacticalDirective;
      if (!d.expiresAt || d.expiresAt > now) continue;
      const wasViewed = d.status === 'VIEWED' || d.status === 'ACTIVE';
      batch.update(doc.ref, { status: wasViewed ? 'EXPIRED' : 'EXPIRED_BEFORE_DELIVERY', updatedAt: now });
      expiredCount++;
    }
    if (expiredCount > 0) await batch.commit();

    return { success: true, expiredCount };
  } catch (error) {
    console.error('sweepExpiredDirectivesAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to sweep expired directives' };
  }
}

/**
 * Phase B — links a scored delivery back to the directive that was active
 * when it was bowled, without touching scoring truth. Writes the outcome
 * record unconditionally; patches the ball's own tacticalContext field too
 * if the caller can supply the scoring_actions document id (optional,
 * because the three current live-scoring screens don't all expose it the
 * same way — see the scoreboard audit for that wider inconsistency).
 */
export async function tagDeliveryOutcomeAction(params: {
  matchId: string;
  directiveId: string;
  directiveVersion: number;
  deliveryId: string;
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  scoringActionDocId?: string;
}): Promise<ActionResult> {
  try {
    const now = new Date().toISOString();
    const outcome: DirectiveOutcome = {
      deliveryId: params.deliveryId,
      directiveId: params.directiveId,
      directiveVersion: params.directiveVersion,
      matchId: params.matchId,
      over: params.over,
      ball: params.ball,
      runs: params.runs,
      isWicket: params.isWicket,
      isBoundary: params.runs === 4 || params.runs === 6,
      isDot: params.runs === 0 && !params.isWicket,
      linkedAt: now,
    };
    await directivesRef(params.matchId)
      .doc(params.directiveId)
      .collection('outcomes')
      .doc(params.deliveryId)
      .set(outcome);

    if (params.scoringActionDocId) {
      await admin
        .firestore()
        .collection('matches')
        .doc(params.matchId)
        .collection('scoring_actions')
        .doc(params.scoringActionDocId)
        .update({
          tacticalContext: { directiveId: params.directiveId, directiveVersion: params.directiveVersion },
        });
    }

    return { success: true };
  } catch (error) {
    console.error('tagDeliveryOutcomeAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to tag delivery outcome' };
  }
}
