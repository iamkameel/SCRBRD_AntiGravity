/**
 * SCRBRD V3 Scoring Types
 * ========================
 * 
 * This module defines the event-sourced scoring architecture.
 * ScoringAction is the SINGLE SOURCE OF TRUTH for all ball-by-ball data.
 * All other structures (LiveScoreProjection, stats, scorecards) are derived.
 * 
 * @see /docs/SCHEMA_V3_PROPOSAL.md for architecture overview
 */

import { Timestamp } from 'firebase/firestore';
import * as V4 from './schema_v4';
export { V4 };


// ============================================================================
// ENUMS & LITERAL TYPES
// ============================================================================

export type WicketType =
    | 'bowled'
    | 'caught'
    | 'lbw'
    | 'run_out'
    | 'stumped'
    | 'hit_wicket'
    | 'handled_ball'
    | 'obstructing_field'
    | 'timed_out'
    | 'retired_out'
    | 'retired_hurt';

export type ShotType =
    | 'drive'
    | 'cover_drive'
    | 'straight_drive'
    | 'off_drive'
    | 'on_drive'
    | 'cut'
    | 'late_cut'
    | 'square_cut'
    | 'pull'
    | 'hook'
    | 'sweep'
    | 'reverse_sweep'
    | 'paddle_sweep'
    | 'flick'
    | 'glance'
    | 'leg_glance'
    | 'defend'
    | 'forward_defense'
    | 'back_foot_defense'
    | 'leave'
    | 'edge'
    | 'slog'
    | 'slog_sweep'
    | 'scoop'
    | 'ramp'
    | 'other';

export type PitchLength =
    | 'full_toss'
    | 'yorker'
    | 'full'
    | 'good'
    | 'short'
    | 'short_of_good'
    | 'bouncer';

export type BowlingLine =
    | 'off_stump'
    | 'middle_stump'
    | 'leg_stump'
    | 'outside_off'
    | 'wide_outside_off'
    | 'outside_leg'
    | 'wide_down_leg';

export type ScoringActionSource =
    | 'live'           // Recorded during live match
    | 'manual_entry'   // Entered after the fact
    | 'import'         // Imported from external source
    | 'correction'     // Created to correct a previous action
    | 'migration';     // Created during data migration

export type BowlingAngle = 'Over the Wicket' | 'Round the Wicket';

// ============================================================================
// SCORING ACTION - THE SINGLE SOURCE OF TRUTH
// ============================================================================

export interface Extras {
    wide: number;
    noBall: number;
    bye: number;
    legBye: number;
    penalty: number;
}

export interface WicketData {
    type: WicketType;
    dismissedPlayerId: string;
    fielderIds?: string[];        // For caught, run out, stumped
    assistFielderIds?: string[];  // For relay catches, etc.
}

export interface ShotData {
    coordinates?: { x: number; y: number };  // Wagon wheel position
    shotType?: ShotType;
    length?: PitchLength;
    line?: BowlingLine;
    speed?: number;               // Ball speed in km/h if available
    wagonWheelSegment?: number;   // 1-8 segments
}

/**
 * @deprecated Use V4.BallEvent (Layer 7) as the new single source of truth.
 * ScoringAction represents a single delivery in a cricket match.
 */
export interface ScoringAction {

    // Identity
    id: string;
    matchId: string;

    // Position in match
    inningsNumber: 1 | 2;
    overNumber: number;           // 0-indexed (0 = first over)
    ballInOver: number;           // 1-6 for legal deliveries, can exceed for extras
    sequenceNumber: number;       // Global sequence in innings (for ordering/pagination)

    // Participants
    strikerId: string;
    nonStrikerId: string;
    bowlerId: string;

    // Outcome: Runs
    runsOffBat: number;           // Runs credited to batsman
    extras: Extras;
    totalRuns: number;            // Computed: runsOffBat + sum of extras

    // Outcome: Wicket
    isWicket: boolean;
    wicket?: WicketData;

    // Legal delivery flag
    isLegalDelivery: boolean;     // Computed: no wide or no-ball

    // Shot analysis (for wagon wheel, pitch map)
    shotData?: ShotData;

    // Event Type (for non-ball events)
    eventType?: 'BALL' | 'INNINGS_END' | 'MATCH_END';

    // Metadata
    timestamp: Timestamp | Date | string;
    recordedBy?: string;          // User ID who recorded this
    source: ScoringActionSource;

    // Correction/Undo linkage (Event Sourcing pattern)
    corrects?: string;            // ID of action this corrects (null = original)
    correctedBy?: string;         // ID of action that corrected this
    isVoided: boolean;            // True if this action was undone
    voidReason?: string;
    voidedAt?: Timestamp | Date | string;
    voidedBy?: string;

    // Audit
    createdAt: Timestamp | Date | string;
    updatedAt?: Timestamp | Date | string;
}

// ============================================================================
// DERIVED PROJECTIONS - COMPUTED FROM SCORING ACTIONS
// ============================================================================

/**
 * BallSummary is a simplified view of a ball for display purposes.
 */
export interface BallSummary {
    actionId: string;
    runs: number;
    isWicket: boolean;
    extraType?: 'wide' | 'noball' | 'bye' | 'legbye';
    extraRuns?: number;
    display: string;              // "W", "4", "1nb", "•", etc.
}

/**
 * BatsmanProjection is the computed stats for a batsman in an innings.
 */
export interface BatsmanProjection {
    playerId: string;
    name?: string;                // Denormalized for display
    battingPosition: number;      // 1-11
    runs: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    strikeRate: number;           // Computed: (runs / ballsFaced) * 100
    dotBalls: number;
    singles: number;
    doubles: number;
    threes: number;
    isOut: boolean;
    isOnStrike: boolean;
    dismissal?: {
        type: WicketType;
        bowlerId?: string;
        bowlerName?: string;
        fielderIds?: string[];
        fielderNames?: string[];
        description?: string;       // "c Smith b Jones"
        overNumber?: number;
        ballInOver?: number;
    };
    entryScore: number;           // Team score when batsman came in
    entryWickets: number;         // Wickets fallen when batsman came in
}

/**
 * SpellSummary tracks a bowler's continuous bowling spell.
 */
export interface SpellSummary {
    spellNumber: number;
    startOver: number;
    endOver: number;
    overs: number;
    runs: number;
    wickets: number;
    maidens: number;
}

/**
 * BowlerProjection is the computed stats for a bowler in an innings.
 */
export interface BowlerProjection {
    playerId: string;
    name?: string;                // Denormalized for display
    overs: number;                // Display format: 4.3 = 4 overs and 3 balls
    ballsBowled: number;          // Raw count of legal deliveries
    maidens: number;
    runsConceded: number;
    wickets: number;
    wides: number;
    noBalls: number;
    economy: number;              // Computed: runsConceded / (ballsBowled / 6)
    dotBalls: number;
    dotBallPercentage: number;
    spells: SpellSummary[];
    currentSpellStart?: number;   // For live display
}

/**
 * FallOfWicketEntry records when each wicket fell.
 */
export interface FallOfWicketEntry {
    wicketNumber: number;
    score: number;                // Team score at fall
    over: string;                 // "12.4" format
    overNumber: number;           // Numeric for sorting
    ballInOver: number;
    batsmanOutId: string;
    batsmanOutName?: string;
    bowlerId?: string;
    bowlerName?: string;
    wicketType: WicketType;
    partnershipRuns: number;      // Runs added in that partnership
}

/**
 * PartnershipData tracks the current batting partnership.
 */
export interface PartnershipData {
    partnershipNumber: number;
    batsmanAId: string;
    batsmanAName?: string;
    batsmanBId: string;
    batsmanBName?: string;
    runs: number;
    balls: number;
    batsmanARuns: number;
    batsmanBRuns: number;
    startScore: number;           // Team score when partnership started
}

/**
 * ExtrasBreakdown tracks extras for an innings.
 */
export interface ExtrasBreakdown {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    penalty: number;
    total: number;
}

/**
 * InningsProjection is the complete computed state of an innings.
 */
export interface InningsProjection {
    inningsNumber: 1 | 2;
    battingTeamId: string;
    battingTeamName?: string;
    bowlingTeamId: string;
    bowlingTeamName?: string;
    runs: number;
    wickets: number;
    overs: number;                // Display format
    balls: number;                // Raw count
    runRate: number;              // Current run rate
    batsmen: BatsmanProjection[];
    bowlers: BowlerProjection[];
    extras: ExtrasBreakdown;
    fallOfWickets: FallOfWicketEntry[];
    partnerships: PartnershipData[];
    isComplete: boolean;
    completedAt?: Timestamp | Date | string;
}

/**
 * @deprecated Use V4 layers (8-10) for derived projections.
 * LiveScoreProjection is the complete real-time view of a match.
 */
export interface LiveScoreProjection {

    matchId: string;
    status: 'scheduled' | 'live' | 'innings_break' | 'completed';

    // Current state
    inningsNumber: 1 | 2;

    currentInnings: {
        battingTeamId: string;
        battingTeamName?: string;
        bowlingTeamId: string;
        bowlingTeamName?: string;
        runs: number;
        wickets: number;
        overs: number;              // Display format: 12.4
        balls: number;              // Raw ball count
        runRate: number;            // Current run rate
        target?: number;            // For 2nd innings
        requiredRunRate?: number;   // For chasing team
        requiredRuns?: number;      // Runs needed
        projectedScore?: number;    // At current rate
    };

    // Current players
    currentPlayers: {
        strikerId: string | null;
        strikerName?: string;
        nonStrikerId: string | null;
        nonStrikerName?: string;
        bowlerId: string | null;
        bowlerName?: string;
        bowlingAngle?: BowlingAngle;
    };

    // Batsman stats (computed from scoring_actions)
    batsmen: BatsmanProjection[];

    // Bowler stats (computed from scoring_actions)
    bowlers: BowlerProjection[];

    // Current over summary (balls in current over)
    currentOver: BallSummary[];

    // Partnership
    partnership: PartnershipData;

    // Fall of wickets
    fallOfWickets: FallOfWicketEntry[];

    // Extras summary
    extras: ExtrasBreakdown;

    // Live History (for UI) - typed alias for currentOver history
    ballHistory?: Array<{
        runs?: number;
        isWicket?: boolean;
        coordinates?: { angle: number; distance: number };
        length?: string;
        line?: string;
        bowlerId?: string;
        [key: string]: any;
    }>;

    // Top-level result shortcuts
    winnerId?: string;
    winMargin?: string;

    // Previous innings (populated after 1st innings)
    innings1?: InningsProjection;

    // Second innings (populated after match completion)
    innings2?: InningsProjection;

    // Match result (when complete)
    result?: {
        winnerId?: string;
        winnerName?: string;
        winMargin?: string;
        resultText: string;         // "Team A won by 5 wickets"
        playerOfTheMatch?: string;
        playerOfTheMatchName?: string;
    };

    // Metadata
    lastUpdated: Timestamp | Date | string;
    lastActionId: string;         // For consistency checking
    lastActionSequence: number;   // Quick check if up-to-date
    version: number;              // Optimistic locking for concurrent updates

    // Undo support
    undoLog?: Array<{
        actionId: string;
        reason: string;
        timestamp: Timestamp | Date | string;
        undoneBy: string;
    }>;
}

// ============================================================================
// MATCH LINEUP - CANONICAL TEAM SELECTION
// ============================================================================

export type LineupRole = 'playing_xi' | 'substitute' | 'reserve' | 'withdrawn';

export type SubstitutionReason = 'concussion' | 'covid' | 'tactical' | 'injury' | 'other';

/**
 * MatchLineup is the canonical record of who played in a match.
 * This is the ONLY structure used for scorecards, match stats, and analytics.
 * 
 * Collection: /matches/{matchId}/lineups/{lineupId}
 */
export interface MatchLineup {
    id: string;
    matchId: string;
    teamId: string;
    playerId: string;
    playerName?: string;          // Denormalized for display

    // Selection status
    role: LineupRole;

    // Leadership
    isCaptain: boolean;
    isViceCaptain: boolean;
    isWicketkeeper: boolean;

    // Batting order
    battingPosition?: number;     // 1-11

    // Status changes during match
    substitutedAt?: Timestamp | Date | string;
    substitutedFor?: string;      // Player ID they replaced
    substitutionReason?: SubstitutionReason;

    // Impact sub (if rules allow)
    isImpactSub?: boolean;
    impactSubType?: 'batting' | 'bowling' | 'all_rounder';

    // Confirmation workflow
    selectedAt: Timestamp | Date | string;
    selectedBy: string;
    confirmedAt?: Timestamp | Date | string;
    confirmedBy?: string;

    // Metadata
    createdAt: Timestamp | Date | string;
    updatedAt?: Timestamp | Date | string;
}

// ============================================================================
// ROLE ASSIGNMENTS - TEMPORAL ROLE TRACKING
// ============================================================================

export type SchoolRole =
    | 'director_of_cricket'
    | 'head_coach'
    | 'assistant_coach'
    | 'batting_coach'
    | 'bowling_coach'
    | 'fielding_coach'
    | 'administrator'
    | 'scorer'
    | 'groundskeeper'
    | 'medical_officer';

/**
 * SchoolRoleAssignment tracks who holds what role at a school.
 * 
 * Collection: /school_role_assignments/{id}
 */
export interface SchoolRoleAssignment {
    id: string;
    schoolId: string;
    personId: string;
    personName?: string;

    role: SchoolRole;

    // Temporal bounds
    startDate: Timestamp | Date | string;
    endDate?: Timestamp | Date | string;  // null = current
    seasonId?: string;

    // Details
    isPrimary: boolean;
    notes?: string;

    // Audit
    assignedBy: string;
    assignedAt: Timestamp | Date | string;
    revokedBy?: string;
    revokedAt?: Timestamp | Date | string;

    createdAt: Timestamp | Date | string;
    updatedAt?: Timestamp | Date | string;
}

export type TeamRole =
    | 'player'
    | 'captain'
    | 'vice_captain'
    | 'head_coach'
    | 'assistant_coach'
    | 'manager'
    | 'scorer'
    | 'analyst'
    | 'physio'
    | 'mentor';

/**
 * TeamRoleAssignment tracks who holds what role in a team.
 * 
 * Collection: /team_role_assignments/{id}
 */
export interface TeamRoleAssignment {
    id: string;
    teamId: string;
    personId: string;
    personName?: string;

    role: TeamRole;

    // Temporal bounds
    startDate: Timestamp | Date | string;
    endDate?: Timestamp | Date | string;
    seasonId?: string;

    // Leadership (for players)
    isCaptain: boolean;
    isViceCaptain: boolean;

    // Details
    jerseyNumber?: string;
    notes?: string;

    // Audit
    assignedBy: string;
    assignedAt: Timestamp | Date | string;

    createdAt: Timestamp | Date | string;
    updatedAt?: Timestamp | Date | string;
}

export type MatchRole =
    | 'umpire_on_field'
    | 'umpire_third'
    | 'umpire_reserve'
    | 'match_referee'
    | 'scorer_home'
    | 'scorer_away'
    | 'scorer_neutral'
    | 'medical_officer'
    | 'groundskeeper'
    | 'match_manager';

export type MatchRoleStatus = 'assigned' | 'confirmed' | 'present' | 'no_show';

/**
 * MatchRoleAssignment tracks officials and support staff for a match.
 * 
 * Collection: /matches/{matchId}/role_assignments/{id}
 */
export interface MatchRoleAssignment {
    id: string;
    matchId: string;
    personId: string;
    personName?: string;

    role: MatchRole;

    // Status
    status: MatchRoleStatus;

    // Confirmation workflow
    assignedAt: Timestamp | Date | string;
    assignedBy: string;
    confirmedAt?: Timestamp | Date | string;
    arrivedAt?: Timestamp | Date | string;

    // Performance (optional feedback)
    performanceRating?: number;   // 1-5
    performanceNotes?: string;

    createdAt: Timestamp | Date | string;
    updatedAt?: Timestamp | Date | string;
}

// ============================================================================
// SEASON-AWARE STATISTICS
// ============================================================================

export type MatchFormat = 'T20' | 'ODI' | 'Test' | '50-over' | '2-day' | 'T10' | 'All';

/**
 * PlayerSeasonStats aggregates a player's stats for a season.
 * 
 * Collection: /player_season_stats/{id}
 */
export interface PlayerSeasonStats {
    id: string;
    personId: string;
    seasonId: string;
    teamId: string;
    format?: MatchFormat;

    // Batting
    batting: {
        matches: number;
        innings: number;
        notOuts: number;
        runs: number;
        highestScore: number;
        highestScoreNotOut: boolean;
        average: number;
        strikeRate: number;
        fifties: number;
        hundreds: number;
        ducks: number;
        fours: number;
        sixes: number;
        ballsFaced: number;
        dotBallPercentage: number;
    };

    // Bowling
    bowling: {
        matches: number;
        innings: number;
        overs: number;
        ballsBowled: number;
        maidens: number;
        runs: number;
        wickets: number;
        average: number;
        economy: number;
        strikeRate: number;
        bestBowlingWickets: number;
        bestBowlingRuns: number;
        fiveWickets: number;
        fourWickets: number;
        wides: number;
        noBalls: number;
        dotBallPercentage: number;
    };

    // Fielding
    fielding: {
        catches: number;
        stumpings: number;          // For wicketkeepers
        runOutsDirect: number;
        runOutsAssisted: number;
        catchesDropped?: number;    // Optional tracking
    };

    // Aggregates
    matchesPlayed: number;
    momAwards: number;

    // Last update info
    lastUpdated: Timestamp | Date | string;
    lastMatchId: string;

    createdAt: Timestamp | Date | string;
    updatedAt?: Timestamp | Date | string;
}

/**
 * TeamSeasonStats aggregates a team's results for a season.
 * 
 * Collection: /team_season_stats/{id}
 */
export interface TeamSeasonStats {
    id: string;
    teamId: string;
    seasonId: string;
    competitionId?: string;
    format?: MatchFormat;

    // Results
    matchesPlayed: number;
    wins: number;
    losses: number;
    ties: number;
    noResults: number;

    // Points (for league tables)
    points: number;

    // Net Run Rate calculation
    runsScored: number;
    ballsFaced: number;
    oversPlayed: number;          // Decimal: 45.3 = 45 overs 3 balls
    runsConceded: number;
    ballsBowled: number;
    oversBowled: number;
    netRunRate: number;

    // Form tracker
    formGuide: Array<'W' | 'L' | 'T' | 'NR'>;  // Last 5-10 matches
    currentStreak: {
        type: 'W' | 'L' | 'T' | 'NR';
        count: number;
    };
    longestWinStreak: number;
    longestLossStreak: number;

    // Home/Away breakdown
    homeRecord: { played: number; wins: number; losses: number };
    awayRecord: { played: number; wins: number; losses: number };

    // Last update info
    lastUpdated: Timestamp | Date | string;
    lastMatchId: string;

    createdAt: Timestamp | Date | string;
    updatedAt?: Timestamp | Date | string;
}

/**
 * PlayerHeadToHeadStats tracks batter vs bowler matchups.
 * 
 * Collection: /player_h2h_stats/{id}
 */
export interface PlayerHeadToHeadStats {
    id: string;
    batsmanId: string;
    batsmanName?: string;
    bowlerId: string;
    bowlerName?: string;

    // Optional filters (can aggregate across all or filter)
    seasonId?: string;
    format?: MatchFormat;

    // Core stats
    ballsFaced: number;
    runsScored: number;
    dismissals: number;

    // Breakdown
    fours: number;
    sixes: number;
    dotBalls: number;
    singles: number;
    doubles: number;
    threes: number;

    // Computed rates
    strikeRate: number;
    dotBallPercentage: number;
    boundaryPercentage: number;
    dismissalRate: number;        // Balls per dismissal
    averagePerDismissal: number;  // Runs per dismissal

    // Dismissal types
    dismissalBreakdown: {
        bowled: number;
        caught: number;
        lbw: number;
        stumped: number;
        runOut: number;
        other: number;
    };

    // Match context
    matchesPlayed: number;
    inningsPlayed: number;

    // Last update info
    lastUpdated: Timestamp | Date | string;
    lastMatchId: string;

    createdAt: Timestamp | Date | string;
    updatedAt?: Timestamp | Date | string;
}

// ============================================================================
// HELPER TYPES FOR PROJECTION COMPUTATION
// ============================================================================

/**
 * ComputeProjectionOptions configures how projections are computed.
 */
export interface ComputeProjectionOptions {
    includeVoided?: boolean;      // Default: false
    upToSequence?: number;        // For replay/debugging
    populateNames?: boolean;      // Whether to join player names
}

/**
 * ProjectionUpdateResult is returned after writing a projection.
 */
export interface ProjectionUpdateResult {
    success: boolean;
    version: number;
    lastActionId: string;
    milestones?: {
        type: 'fifty' | 'hundred' | 'maiden' | 'hatTrick' | 'fiveWickets';
        playerId: string;
        value?: number;
    }[];
    warnings?: string[];
}
