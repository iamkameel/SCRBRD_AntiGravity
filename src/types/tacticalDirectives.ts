/**
 * Tactical Directive Bus — Data Model
 *
 * Real-time coach ↔ captain tactical communication layer for a live match.
 * Lives under matches/{matchId}/tacticalDirectives/{directiveId} — a sibling
 * of scoring_actions, not a replacement for it. A directive represents
 * TACTICAL INTENT; a ball (ScoringAction) represents MATCH TRUTH. The two
 * are linked via TacticalContext but must never be conflated.
 *
 * See "Markdown References/SCRBRD_Tactical_Directive_Bus.md" for the
 * full product spec this implements.
 */

import { FirestoreEntity } from './firestore';

// ── 1. Lifecycle ──────────────────────────────────────────────────────────

export type DirectiveStatus =
  | 'DRAFT'
  | 'QUEUED'
  | 'TRANSMITTED'
  | 'DELIVERED'
  | 'VIEWED'
  | 'ACCEPTED'
  | 'MODIFIED'
  | 'DISMISSED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'SUPERSEDED'
  | 'EXPIRED'
  | 'EXPIRED_BEFORE_DELIVERY'
  | 'OUTCOME_ANALYSED';

export const TERMINAL_DIRECTIVE_STATUSES: DirectiveStatus[] = [
  'DISMISSED',
  'COMPLETED',
  'SUPERSEDED',
  'EXPIRED',
  'EXPIRED_BEFORE_DELIVERY',
  'OUTCOME_ANALYSED',
];

// ── 2. Directive taxonomy ─────────────────────────────────────────────────

export type DirectiveType =
  | 'FIELD_PLACEMENT'
  | 'BOWLING_PLAN'
  | 'BATTING_PLAN'
  | 'BOWLING_FIELD_PLAN'
  | 'BATTER_SPECIFIC_PLAN'
  | 'BOWLER_SPECIFIC_PLAN'
  | 'PARTNERSHIP_DISRUPTION'
  | 'BOUNDARY_PROTECTION'
  | 'WICKET_TAKING_ATTACK'
  | 'RUN_RATE_SUPPRESSION'
  | 'POWERPLAY_STRATEGY'
  | 'MIDDLE_OVER_STRATEGY'
  | 'DEATH_OVER_STRATEGY'
  | 'NEW_BATTER_PLAN'
  | 'MATCH_UP_INSTRUCTION'
  | 'TEMPO_CHANGE'
  | 'BOWLER_CHANGE'
  | 'TRIGGER_BASED_INSTRUCTION'
  | 'CUSTOM';

export type MatchPhase =
  | 'POWERPLAY'
  | 'MIDDLE_OVERS'
  | 'DEATH_OVERS'
  | 'ANY';

export type TacticalIntent =
  | 'BUILD_PRESSURE'
  | 'TAKE_WICKET'
  | 'SUPPRESS_RUN_RATE'
  | 'PROTECT_BOUNDARY'
  | 'BREAK_PARTNERSHIP'
  | 'EXPLOIT_MATCH_UP'
  | 'SETTLE_NEW_BATTER'
  | 'OTHER';

export type DirectiveScope =
  | 'NEXT_BALL'
  | 'NEXT_3_BALLS'
  | 'NEXT_6_BALLS'
  | 'CURRENT_OVER'
  | 'NEXT_OVER'
  | 'BATTER'
  | 'BOWLER_SPELL'
  | 'PARTNERSHIP'
  | 'MATCH_PHASE'
  | 'UNTIL_CANCELLED'
  | 'CUSTOM';

// ── 3. Plan sub-objects ───────────────────────────────────────────────────

export interface FieldChange {
  personId: string;
  playerName?: string;
  fromPosition: string;
  toPosition: string;
}

export interface FieldPlan {
  presetId?: string;
  fieldChanges: FieldChange[];
}

export type BowlingLine = 'OFF_STUMP' | 'MIDDLE_STUMP' | 'LEG_STUMP' | 'FOURTH_STUMP' | 'WIDE_OUTSIDE_OFF' | 'DOWN_LEG';
export type BowlingLength = 'FULL' | 'GOOD_LENGTH' | 'SHORT' | 'YORKER' | 'BOUNCER';
export type BowlingVariation = 'SEAM' | 'SWING' | 'OFF_SPIN' | 'LEG_SPIN' | 'SLOWER_BALL' | 'PACE_ON' | 'NONE';

export interface BowlingPlan {
  line: BowlingLine;
  length: BowlingLength;
  variation: BowlingVariation;
  targetZone?: string;
}

export interface BattingPlan {
  approach: 'ATTACK' | 'ROTATE_STRIKE' | 'DEFEND' | 'TARGET_BOWLER';
  targetBowlerId?: string;
  notes?: string;
}

export interface DirectiveSuccessCriteria {
  maxRuns?: number;
  boundaryAllowed?: boolean;
  wicketTarget?: boolean;
  maxDotBalls?: number;
}

// ── 4. The directive itself ───────────────────────────────────────────────

export interface TacticalDirective extends FirestoreEntity {
  matchId: string;
  inningsNumber: 1 | 2;
  teamId: string;

  issuedByPersonId: string;
  issuedByName: string;
  issuedToPersonId: string; // captain on the fielding/batting side, as relevant
  issuedToName?: string;

  sequence: number;
  version: number;

  directiveType: DirectiveType;
  title: string;
  instruction: string;

  phase: MatchPhase;
  tacticalIntent: TacticalIntent;

  scope: DirectiveScope;
  target?: {
    batterId?: string;
    batterName?: string;
    bowlerId?: string;
    bowlerName?: string;
  };

  fieldPlan?: FieldPlan;
  bowlingPlan?: BowlingPlan;
  battingPlan?: BattingPlan;

  trigger?: string;
  successCriteria?: DirectiveSuccessCriteria;

  priority: 'P1_CRITICAL' | 'P2_TACTICAL' | 'P3_ADVISORY';

  transmittedAt?: string;
  expiresAt?: string;

  status: DirectiveStatus;

  supersedesDirectiveId?: string;
  parentDirectiveId?: string;

  // Denormalized so the Coach Cockpit doesn't need a second listener per directive.
  latestResponse?: {
    type: 'ACCEPTED' | 'MODIFIED' | 'DISMISSED';
    reason?: string;
    respondedAt: string;
  };
}

// ── 5. Responses (subcollection: tacticalDirectives/{id}/responses) ───────

export type ResponseType = 'ACCEPTED' | 'MODIFIED' | 'DISMISSED';

export const DISMISS_REASONS = [
  'Conditions changed',
  'Batter changed',
  'Bowler uncomfortable',
  'Field restriction',
  'Injury',
  'Already implemented',
  'Tactical disagreement',
  'Directive arrived too late',
  'Other',
] as const;

export const MODIFY_REASONS = [
  'Wind conditions',
  'Batter movement',
  'Bowler preference',
  'Pitch behaviour',
  'Field restriction',
  'Match situation',
  'Other',
] as const;

export interface DirectiveModification {
  fieldPlan?: FieldPlan;
  bowlingPlan?: Partial<BowlingPlan>;
  battingPlan?: Partial<BattingPlan>;
  note?: string;
}

export interface DirectiveResponse extends FirestoreEntity {
  directiveId: string;
  directiveVersion: number; // version this response was made against
  matchId: string;
  responseType: ResponseType;
  reason?: string; // from DISMISS_REASONS / MODIFY_REASONS, or free text
  modification?: DirectiveModification;
  respondedByPersonId: string;
  respondedAt: string;
  clientEventId: string; // idempotency key — also used as the response doc id
}

// ── 6. Receipts (subcollection: tacticalDirectives/{id}/receipts/{personId}) ─

export type ReceiptStatus = 'SENT' | 'SERVER_RECEIVED' | 'DEVICE_RECEIVED' | 'VIEWED' | 'NOT_DELIVERED';

export interface DirectiveReceipt {
  personId: string;
  status: ReceiptStatus;
  sentAt?: string;
  deviceReceivedAt?: string;
  viewedAt?: string;
}

// ── 7. Outcomes (subcollection: tacticalDirectives/{id}/outcomes/{deliveryId}) ─

export interface TacticalContext {
  directiveId: string;
  directiveVersion: number;
}

export interface DirectiveOutcome {
  deliveryId: string;
  directiveId: string;
  directiveVersion: number;
  matchId: string;
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  isBoundary: boolean;
  isDot: boolean;
  linkedAt: string;
}

// ── 8. Effectiveness (computed, not stored as-is) ─────────────────────────

export interface DirectiveEffectiveness {
  directiveId: string;
  ballsDelivered: number;
  runsConceded: number;
  wickets: number;
  boundariesConceded: number;
  dotBalls: number;
  metSuccessCriteria: boolean | null; // null if no successCriteria was set
  effectivenessPct: number; // 0-100 heuristic score
}

export interface TacticalIntelligenceSummary {
  scopeLabel: string; // e.g. "Coach • this match" / "Team • season"
  directivesIssued: number;
  acceptRate: number;
  modifyRate: number;
  dismissRate: number;
  avgResponseSeconds: number | null;
  avgEffectivenessPct: number | null;
  boundaryPreventionRate: number | null;
}

// ── 9. Phase D — advisory tactical suggestions ─────────────────────────────

export interface TacticalSuggestion {
  batterId: string;
  batterName: string;
  basis: 'HISTORICAL_DIRECTIVE_OUTCOMES';
  sampleSize: number;
  observedVulnerability: string;
  averageConceded: number;
  dismissalCount: number;
  dotBallRatePct: number;
  boundaryRatePct: number;
  recommendedBowlingPlan?: Partial<BowlingPlan>;
  recommendedFieldPreset?: string;
  narrative: string;
  advisoryOnly: true;
}

// ── 10. Idempotent write input shapes (used by server actions) ────────────

export interface TransmitDirectiveInput {
  matchId: string;
  inningsNumber: 1 | 2;
  teamId: string;
  issuedByPersonId: string;
  issuedByName: string;
  issuedToPersonId: string;
  issuedToName?: string;
  directiveType: DirectiveType;
  title: string;
  instruction: string;
  phase: MatchPhase;
  tacticalIntent: TacticalIntent;
  scope: DirectiveScope;
  target?: TacticalDirective['target'];
  fieldPlan?: FieldPlan;
  bowlingPlan?: BowlingPlan;
  battingPlan?: BattingPlan;
  trigger?: string;
  successCriteria?: DirectiveSuccessCriteria;
  priority?: TacticalDirective['priority'];
  expiresInSeconds?: number;
  supersedesDirectiveId?: string;
  clientEventId: string;
}

export interface RespondToDirectiveInput {
  matchId: string;
  directiveId: string;
  directiveVersion: number;
  responseType: ResponseType;
  reason?: string;
  modification?: DirectiveModification;
  respondedByPersonId: string;
  clientEventId: string;
}
