/**
 * SCRBRD Rankings & Impact Engine Types
 * =====================================
 * 
 * This module defines the interfaces for the SCRBRD Rankings Intelligence Suite,
 * including Match Impact, Player Power Ratings, Scouting, and Potential Indexing.
 * 
 * These types align with the SCRBRD Architecture Layer 14 (Rankings & Intelligence).
 */

import { UUID, ISO8601Timestamp, JSONValue } from './schema_v4';

/**
 * Valid ranking systems within SCRBRD.
 */
export type RankingType = 'TeamRank' | 'PlayerPower' | 'ScoutGrade' | 'PotentialIndex';

/**
 * Target entity types for rankings.
 */
export type EntityType = 'School' | 'Team' | 'Person';

/**
 * A snapshot of a ranking at a specific point in time.
 * Snapshots are immutable and allow for historical tracking ("Rise/Fall").
 * 
 * Collection: /ranking_snapshots/{id}
 */
export interface RankingSnapshot {
    id: UUID;
    entityType: EntityType;
    entityId: UUID;
    rankingType: RankingType;
    score: number;             // 0-100 normalized score
    rank: number;              // Current position in the relevant segment
    previousRank?: number;     // For movement tracking
    movement?: number;         // Delta from previous rank
    confidence: number;        // 0.0 to 1.0 confidence score based on sample size

    // Segment/Scope Filters
    seasonId?: UUID;
    competitionId?: UUID;
    ageGroup?: string;
    province?: string;
    format?: string;

    computedAt: ISO8601Timestamp;
    modelVersionId?: UUID;     // Link to the algorithm version used
}

/**
 * Component-level breakdown of a ranking score.
 * Explains how the total score was derived.
 * 
 * Collection: /ranking_snapshots/{snapshotId}/components/{id}
 */
export interface RankingComponent {
    id: UUID;
    rankingSnapshotId: UUID;
    componentName: string;     // e.g., "Opposition Quality", "Recent Form"
    rawValue: number;
    normalisedValue: number;
    weight: number;            // The weighting applied to this component
    contribution: number;      // weight * normalisedValue
}

/**
 * A high-fidelity record of a ball's impact on match state.
 * Derived from BallEvent but enriched with intelligence context.
 * 
 * Collection: /match_impact_events/{id}
 */
export interface MatchImpactEvent {
    id: UUID;
    fixtureId: UUID;
    inningsId: UUID;
    ballEventId?: UUID;        // Optional link to raw scoring action

    // Position
    overNumber: number;
    ballNumber: number;

    // Event Classification
    eventType: string;
    subEventType?: string;

    // Contextual Intelligence
    phase:
    | 'Powerplay' | 'Middle' | 'Death'               // T20/ODI
    | 'Early' | 'Consolidation' | 'Launch'           // 50-over
    | 'New Ball' | 'Build' | 'Control' | 'Acceleration' | 'Tail'; // Multi-day

    pressureState:
    | 'Low' | 'Normal' | 'Elevated' | 'High'
    | 'Extreme' | 'Collapse' | 'Chase Critical';

    // Impact Values
    baseImpactValue: number;
    contextMultiplier: number;
    pressureMultiplier: number;
    oppositionMultiplier: number;
    swingAdjustment: number;   // Delta in Expected Match State

    totalImpactValue: number;
    battingTeamImpact: number;
    bowlingTeamImpact: number;

    explanation?: string;      // Natural language explanation of impact
    createdAt: ISO8601Timestamp;
}

/**
 * Splits the impact of a single event across multiple actors.
 * e.g., A catch split between Bowler (70%) and Fielder (30%).
 * 
 * Collection: /match_impact_events/{eventId}/attributions/{id}
 */
export interface ImpactAttribution {
    id: UUID;
    matchImpactEventId: UUID;
    personId: UUID;
    roleType: 'Batter' | 'Bowler' | 'Fielder' | 'Keeper' | 'Non-Striker';
    impactCategory: 'Batting' | 'Bowling' | 'Fielding' | 'Clutch' | 'Momentum';
    impactValue: number;
    explanation?: string;
}

/**
 * Aggregated impact profile for a player in a specific match.
 * Powers the "Match MVP" and "Match Impact Tab".
 * 
 * Collection: /player_match_impact/{id}
 */
export interface PlayerMatchImpact {
    id: UUID;
    fixtureId: UUID;
    personId: UUID;
    teamId: UUID;

    // Category Rollups
    battingImpact: number;
    bowlingImpact: number;
    fieldingImpact: number;
    clutchImpact: number;
    momentumShiftImpact: number;

    totalImpact: number;
    mvpScore: number;          // Weighted score for MVP selection

    badgesJson?: string[];     // e.g., ["Clutch Master", "Partnership Breaker"]
    rankInMatch?: number;      // 1 = MVP

    createdAt: ISO8601Timestamp;
}

/**
 * Tracks blocks of time where momentum was owned by a specific team.
 * Powers the "Momentum Shading" on charts.
 * 
 * Collection: /innings_momentum_segments/{id}
 */
export interface InningsMomentumSegment {
    id: UUID;
    inningsId: UUID;
    startOver: number;
    endOver: number;
    dominantTeamId: UUID;
    momentumScore: number;
    reasonCode?: string;       // e.g., "BOUNDARY_CLUSTER", "WICKET_MAIDEN"
    summaryText?: string;
}

/**
 * Qualitative scout assessment of a player's ability and potential.
 * Human-augmented signals for the scouting engine.
 * 
 * Collection: /scout_reports/{id}
 */
export interface ScoutReport {
    id: UUID;
    personId: UUID;
    scoutId: UUID;
    fixtureId?: UUID;          // If report was generated after a specific match

    // Quantitative Assessents (Scout Scale 1-20 or /Max)
    technicalScore: number;    // /20
    tacticalScore: number;     // /15
    physicalScore: number;      // /15
    mentalScore: number;        // /20
    competitivenessScore: number; // /10
    statisticalEvidenceScore: number; // /20

    // Derived Labels
    scoutGrade: 'A+' | 'A' | 'B+' | 'B' | 'C';
    prospectCategory:
    | 'Immediate Impact'
    | 'Long-term Project'
    | 'High-upside Athlete'
    | 'Role Specialist'
    | 'System Player';

    confidenceLevel: 'High' | 'Medium' | 'Low';
    projectionNotes?: string;

    createdAt: ISO8601Timestamp;
    updatedAt: ISO8601Timestamp;
}

/**
 * Probabilistic projection of a player's future ceiling.
 * 
 * Collection: /potential_projections/{id}
 */
export interface PotentialProjection {
    id: UUID;
    personId: UUID;
    seasonId: UUID;

    ceilingScore: number;      // 0-100 target ability
    readinessScore: number;    // How close they are to the ceiling now
    riskScore: number;         // 0-100 risk of not reaching potential
    potentialTier: 1 | 2 | 3 | 4 | 5; // Elite -> Monitor

    projectedRole?: string;
    projectionWindowMonths?: number;
    riskNotes?: string;

    createdAt: ISO8601Timestamp;
}

/**
 * Audit trail for the impact model itself.
 * Ensures historical rankings can be explained if algorithms change.
 * 
 * Collection: /impact_model_versions/{id}
 */
export interface ImpactModelVersion {
    id: UUID;
    versionName: string;
    configJson: JSONValue;      // Stores weights and multipliers
    isActive: boolean;
    activatedAt: ISO8601Timestamp;
    retiredAt?: ISO8601Timestamp;
}
