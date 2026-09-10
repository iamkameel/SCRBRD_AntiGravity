/**
 * SCRBRD Schema V4: TypeScript Type Definitions
 * Based on the 13-layer SQL model, converted to camelCase for TS/GQL consistency.
 * Primary keys are named 'id' to match the Data Connect GQL schema.
 */

export type UUID = string;
export type ISO8601Date = string;
export type ISO8601Timestamp = string;
export type JSONValue = string | number | boolean | null | { [key: string]: JSONValue } | JSONValue[];

// --- Layer 1: Core Identity ---

export interface Person {
    id: UUID;
    firstName: string;
    lastName: string;
    preferredName?: string;
    dateOfBirth?: ISO8601Date;
    gender?: string;
    email?: string;
    phone?: string;
    profileImageUrl?: string;
    biography?: string;
    dominantHand?: 'Right' | 'Left' | 'Ambidextrous';
    status: 'active' | 'inactive' | 'suspended';
    createdAt: ISO8601Timestamp;
    updatedAt: ISO8601Timestamp;
}

export interface PersonAddress {
    id: UUID;
    personId: UUID;
    addressType?: 'Home' | 'Work' | 'Postal';
    line1?: string;
    line2?: string;
    suburb?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country: string;
}

export interface PersonEmergencyContact {
    id: UUID;
    personId: UUID;
    contactName: string;
    relationship?: string;
    phone: string;
    email?: string;
    notes?: string;
}

export interface PersonDocument {
    id: UUID;
    personId: UUID;
    documentType?: 'ID' | 'Passport' | 'License' | 'Certificate';
    fileUrl: string;
    issuedOn?: ISO8601Date;
    expiresOn?: ISO8601Date;
    verifiedByPersonId?: UUID;
    createdAt: ISO8601Timestamp;
}

// --- Layer 2: Organisations and School Structure ---

export interface Organisation {
    id: UUID;
    organisationType?: 'School' | 'Club' | 'Academy' | 'League' | 'Governing Body';
    name: string;
    shortName?: string;
    slug?: string;
    logoUrl?: string;
    primaryColour?: string;
    secondaryColour?: string;
    contactEmail?: string;
    contactPhone?: string;
    websiteUrl?: string;
    status: 'active' | 'inactive';
    createdAt: ISO8601Timestamp;
    updatedAt: ISO8601Timestamp;
}

export interface Venue {
    id: UUID;
    organisationId: UUID;
    name: string;
    venueType?: 'Main Ground' | 'Indoor Centre' | 'Satellite Field';
    addressLine1?: string;
    suburb?: string;
    city?: string;
    province?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    timezone: string;
    notes?: string;
}

export interface Field {
    id: UUID;
    venueId: UUID;
    name: string;
    fieldType?: 'Oval' | 'Nets' | 'Indoor';
    pitchType?: 'Turf' | 'Astro' | 'Concrete' | 'Matting';
    boundaryLengthM?: number;
    endsJson?: Record<string, string>;
    status: 'available' | 'maintenance' | 'closed';
    notes?: string;
}

export interface GroundStatusLog {
    id: UUID;
    fieldId: UUID;
    fixtureId?: UUID;
    conditionStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unplayable';
    pitchReadiness: number; // 0-100
    outfieldReadiness: number; // 0-100
    equipmentReadiness: number; // 0-100
    moistureLevel?: number; // 0-100
    grassCover?: number; // 0-100
    notes?: string;
    loggedByPersonId: UUID;
    loggedAt: ISO8601Timestamp;
}

export interface MaintenanceTask {
    id: UUID;
    fieldId: UUID;
    title: string;
    description?: string;
    taskType: 'Mowing' | 'Rolling' | 'Watering' | 'Marking' | 'Repair' | 'Fertilizing' | 'Other';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    dueDate: ISO8601Date;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    assignedToPersonId?: UUID;
    completedAt?: ISO8601Timestamp;
    createdAt: ISO8601Timestamp;
    updatedAt: ISO8601Timestamp;
}

// --- Layer 3: Season, Competition and Team Hierarchy ---

export interface Season {
    id: UUID;
    name: string;
    sport: string;
    startDate: ISO8601Date;
    endDate: ISO8601Date;
    isActive: boolean;
    createdAt: ISO8601Timestamp;
}

export type DivisionType = 'AGE_GROUP' | 'OPEN_DIVISION';

export interface AgeDivision {
    id: UUID;
    sport: string;
    name: string;
    divisionType?: DivisionType;
    minAge?: number;
    maxAge?: number; // STRICT for AGE_GROUP, null or undefined for OPEN_DIVISION
    sortOrder?: number;
}

export interface TeamClass {
    id: UUID;
    sport: string;
    code: string;
    label: string;
    sortOrder?: number;
}

export interface Team {
    id: UUID;
    organisationId: UUID;
    seasonId: UUID;
    sport: string;
    ageDivisionId: UUID;
    teamClassId: UUID;
    genderCategory?: 'Male' | 'Female' | 'Mixed';
    name: string;
    displayName?: string;
    shortName?: string;
    teamColourPrimary?: string;
    teamColourSecondary?: string;
    logoUrl?: string;
    status: 'active' | 'inactive';
    createdAt: ISO8601Timestamp;
    updatedAt: ISO8601Timestamp;
}

export interface Competition {
    id: UUID;
    seasonId: UUID;
    organisationId?: UUID;
    sport: string;
    name: string;
    competitionType?: 'League' | 'Knockout' | 'Tournament';
    format?: string;
    oversPerInnings?: number;
    ballsPerOver: number;
    playingConditionsId?: UUID;
    startsOn?: ISO8601Date;
    endsOn?: ISO8601Date;
    status: 'planned' | 'active' | 'completed' | 'cancelled';
}

export interface CompetitionEntry {
    id: UUID;
    competitionId: UUID;
    teamId: UUID;
    seed?: number;
    groupName?: string;
    joinedAt: ISO8601Timestamp;
    status: 'entered' | 'withdrawn' | 'disqualified';
}

// --- Layer 4: Roles and Access ---

export type GlobalRole =
    | 'Super Admin'
    | 'Platform Operations Admin'
    | 'Support Admin'
    | 'Compliance / Safeguarding Officer'
    | 'Audit / Read-Only Compliance Reviewer'
    | 'Player'
    | 'Parent'
    | 'Adult Player-Payer';

export type ScopeType =
    | 'platform'
    | 'league'
    | 'school'
    | 'team'
    | 'fixture'
    | 'player-self'
    | 'linked-child';

export type ScopedRole =
    | 'League Admin'
    | 'Tournament Director'
    | 'Competition Operations Manager'
    | 'Regional Selector / Provincial Admin'
    | 'School Owner / Executive Head'
    | 'School Admin'
    | 'School Staff / Registrar'
    | 'Finance Admin'
    | 'Welfare / Medical Officer'
    | 'Transport / Logistics Admin'
    | 'Facilities / Grounds Admin'
    | 'Communications / Media Admin'
    | 'Head Coach'
    | 'Assistant Coach'
    | 'Team Manager'
    | 'Strength & Conditioning Coach'
    | 'Analyst / Performance Analyst'
    | 'Scorer'
    | 'Umpire'
    | 'Match Referee / Match Commissioner'
    | 'Groundsman / Match-Day Ops'
    | 'Selector'
    | 'Scout'
    | 'Sponsor / Partner Viewer'
    | 'Photographer / Media Contributor'
    | 'Spectator / Fan'
    | 'Alumni / Old Boy Viewer';

export interface ScopedRoleAssignment {
    role: ScopedRole;
    scopeType: ScopeType;
    scopeId: UUID;
    assignedByPersonId?: UUID;
    createdAt: ISO8601Timestamp;
}

export type Permission =
    | 'person.read.self'
    | 'person.read.school'
    | 'person.read.linked_child'
    | 'person.update.self_basic'
    | 'person.update.school_operational'
    | 'person.update.sensitive_identity'
    | 'guardian_link.create'
    | 'guardian_link.verify'
    | 'guardian_link.read.linked'
    | 'guardian_link.remove'
    | 'team.create.school'
    | 'team.update.school'
    | 'team.archive.school'
    | 'assignment.create.team_role'
    | 'assignment.update.team_role'
    | 'fixture.create.school'
    | 'fixture.update.school'
    | 'fixture.manage.competition'
    | 'lineup.update.team'
    | 'score.update.assigned_fixture'
    | 'score.submit.assigned_fixture'
    | 'score.amend.approved'
    | 'training_log.create.team'
    | 'skill_rating.update.team'
    | 'stats.read.own'
    | 'stats.read.school'
    | 'analytics.read.programme'
    | 'medical.read.summary'
    | 'medical.read.full'
    | 'medical.update'
    | 'availability.override.medical'
    | 'discipline.create'
    | 'discipline.review'
    | 'discipline.read.own_case'
    | 'invoice.create'
    | 'invoice.read.payer'
    | 'invoice.read.school'
    | 'transaction.reconcile'
    | 'audit.read'
    | 'role.assign.school'
    | 'role.assign.platform'
    | 'access.override.emergency';

export interface GuardianLink {
    id: UUID;
    guardianPersonId: UUID;
    childPersonId: UUID;
    relationship: 'Parent' | 'Legal Guardian' | 'Other';
    verificationStatus: 'Pending' | 'Verified' | 'Rejected' | 'Revoked';
    verifiedByPersonId?: UUID;
    verifiedAt?: ISO8601Timestamp;
    consentGiven: boolean;
    safeguardingAccepted: boolean;
    createdAt: ISO8601Timestamp;
    updatedAt: ISO8601Timestamp;
}

export interface UserAccount {
    id: UUID;
    personId: UUID;
    authProvider?: 'Firebase' | 'Google' | 'Apple';
    authIdentifier?: string;
    lastLoginAt?: ISO8601Timestamp;
    globalRoles: GlobalRole[];
    scopedRoles: ScopedRoleAssignment[];
    isActive: boolean;
    createdAt: ISO8601Timestamp;
}

export interface TeamMembership {
    id: UUID;
    teamId: UUID;
    personId: UUID;
    membershipRole: 'Player' | 'Coach' | 'Manager' | 'Scorer';
    squadNumber?: string;
    isCaptain: boolean;
    isViceCaptain: boolean;
    battingStyle?: string;
    bowlingStyle?: string;
    wicketkeeper: boolean;
    status: 'active' | 'inactive';
    joinedOn?: ISO8601Date;
    leftOn?: ISO8601Date;
    notes?: string;
}

// --- Layer 5: Fixtures and Match Lifecycle ---

export interface Fixture {
    id: UUID;
    competitionId?: UUID;
    seasonId: UUID;
    sport: string;
    homeTeamId: UUID;
    awayTeamId: UUID;
    venueId: UUID;
    fieldId?: UUID;
    scheduledStartAt: ISO8601Timestamp;
    scheduledEndAt?: ISO8601Timestamp;
    matchType?: string;
    oversPerInnings?: number;
    ballsPerOver: number;
    status: 'scheduled' | 'live' | 'completed' | 'cancelled';
    roundName?: string;
    notes?: string;
    createdByPersonId?: UUID;
    createdAt: ISO8601Timestamp;
    updatedAt: ISO8601Timestamp;
}

export interface Match {
    id: UUID;
    fixtureId: UUID;
    liveStatus: 'pre_match' | 'toss' | 'innings_1' | 'innings_2' | 'break' | 'completed' | 'abandoned';
    matchState: 'not_started' | 'warm_up' | 'in_progress' | 'interrupted' | 'finished';
    startTimeActual?: ISO8601Timestamp;
    endTimeActual?: ISO8601Timestamp;
    resultType?: 'Win' | 'Draw' | 'Tie' | 'No Result';
    winningTeamId?: UUID;
    wonByRuns?: number;
    wonByWickets?: number;
    marginText?: string;
    tossWinnerTeamId?: UUID;
    tossDecision?: 'Bat' | 'Bowl';
    duckworthLewisUsed: boolean;
    revisedTarget?: number;
    currentInningsNo?: number;
    currentOver?: number;
    currentBall?: number;
    versionNo: number;
    createdAt: ISO8601Timestamp;
    updatedAt: ISO8601Timestamp;
}

// --- Layer 6: Match Officials and Line-ups ---

export interface MatchOfficialAssignment {
    id: UUID;
    matchId: UUID;
    personId: UUID;
    officialRole: 'Umpire 1' | 'Umpire 2' | 'Scorer' | 'Referee';
    assignedByPersonId?: UUID;
    confirmedAt?: ISO8601Timestamp;
    notes?: string;
}

export interface MatchTeamSheet {
    id: UUID;
    matchId: UUID;
    teamId: UUID;
    confirmedByPersonId?: UUID;
    confirmedAt?: ISO8601Timestamp;
    battingOrderLocked: boolean;
    bowlingRosterLocked: boolean;
    status: 'draft' | 'confirmed' | 'verified';
    versionNo: number;
    updatedAt: ISO8601Timestamp;
}

export interface MatchTeamSheetPlayer {
    id: UUID;
    matchTeamSheetId: UUID;
    teamMembershipId?: UUID;
    personId: UUID;
    shirtNumber?: string;
    battingPosition?: number;
    isStartingXi: boolean;
    isSubstitute: boolean;
    isWicketkeeper: boolean;
    isCaptain: boolean;
    isViceCaptain: boolean;
    availabilityStatus: 'available' | 'injured' | 'away';
    notes?: string;
}

// --- Layer 6.5: Match Readiness ---

export interface FixtureReadinessCheck {
    id: UUID;
    fixtureId: UUID;
    squadReady: boolean;
    transportReady: boolean;
    facilitiesReady: boolean;
    officialsReady: boolean;
    medicalChecked: boolean;
    equipmentReady: boolean;
    overallStatus: 'Pending' | 'Ready' | 'Caution' | 'Issue';
    notes?: string;
    updatedAt: ISO8601Timestamp;
}

// --- Layer 7: Innings, Overs and Ball-by-Ball Scoring ---

export interface Innings {
    id: UUID;
    matchId: UUID;
    inningsNo: number;
    battingTeamId: UUID;
    bowlingTeamId: UUID;
    inningsType: 'Standard' | 'Super Over';
    targetRuns?: number;
    maxOvers?: number;
    startedAt?: ISO8601Timestamp;
    endedAt?: ISO8601Timestamp;
    closureType?: 'All Out' | 'Overs Completed' | 'Declared' | 'Target Reached';
    totalRuns: number;
    totalWickets: number;
    totalOversDecimal: number;
    totalBalls: number;
    extrasTotal: number;
    byes: number;
    legByes: number;
    wides: number;
    noBalls: number;
    penaltyRuns: number;
    revisedTarget?: number;
    runRate?: number;
    requiredRunRate?: number;
    createdAt: ISO8601Timestamp;
    updatedAt: ISO8601Timestamp;
}

export interface Over {
    id: UUID;
    inningsId: UUID;
    overNumber: number;
    bowlerPersonId: UUID;
    fromEnd?: 'North' | 'South' | 'Pavilion' | 'City';
    maiden: boolean;
    runsConceded: number;
    wicketsInOver: number;
    legalBallsBowled: number;
    startedAt?: ISO8601Timestamp;
    endedAt?: ISO8601Timestamp;
}

export interface BallEvent {
    id: UUID;
    inningsId: UUID;
    overId: UUID;
    overNumber: number;
    ballInOver: number;
    ballSequenceGlobal: number;
    strikerPersonId: UUID;
    nonStrikerPersonId: UUID;
    bowlerPersonId: UUID;
    battingTeamId: UUID;
    bowlingTeamId: UUID;
    deliveryType?: string;
    shotType?: string;
    contactType?: string;
    outcomeType: 'Runs' | 'Wicket' | 'Extra' | 'Dot';
    runsBat: number;
    runsExtras: number;
    runsTotal: number;
    extraType?: 'Wide' | 'No Ball' | 'Bye' | 'Leg Bye' | 'Penalty';
    boundaryFlag: boolean;
    isLegalDelivery: boolean;
    createsFreeHit: boolean;
    isFreeHit: boolean;
    wicketFlag: boolean;
    wicketType?: 'Bowled' | 'Caught' | 'Lbw' | 'Run Out' | 'Stumped' | 'Hit Wicket' | 'Handled Ball' | 'Obstructing Field' | 'Timed Out' | 'Retired';
    dismissedPersonId?: UUID;
    creditedBowlerFlag: boolean;
    assistingFielder1Id?: UUID;
    assistingFielder2Id?: UUID;
    pitchZone?: string;
    shotZone?: string;
    wagonWheelX?: number;
    wagonWheelY?: number;
    commentaryText?: string;
    scorerNotes?: string;
    recordedByPersonId?: UUID;
    recordedAt: ISO8601Timestamp;
    updatedAt: ISO8601Timestamp;
    versionNo: number;
}

// --- Layer 8: Derived Scorecard Layer ---

export interface InningsBattingScorecard {
    id: UUID;
    inningsId: UUID;
    personId: UUID;
    battingPosition?: number;
    dismissalText?: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    strikeRate?: number;
    minutesBatted?: number;
    onStrikeLastKnown: boolean;
    isNotOut: boolean;
}

export interface InningsBowlingScorecard {
    id: UUID;
    inningsId: UUID;
    personId: UUID;
    oversDecimal: number;
    maidens: number;
    runsConceded: number;
    wickets: number;
    wides: number;
    noBalls: number;
    economyRate?: number;
}

export interface InningsPartnership {
    id: UUID;
    inningsId: UUID;
    wicketNumber: number;
    batter1Id: UUID;
    batter2Id: UUID;
    runs: number;
    balls: number;
    startedBallEventId?: UUID;
    endedBallEventId?: UUID;
}

export interface InningsFallOfWicket {
    id: UUID;
    inningsId: UUID;
    wicketNumber: number;
    teamScore: number;
    batterOutId: UUID;
    overDisplay: string;
    ballEventId: UUID;
}

// --- Layer 9: Commentary and Insights ---

export interface CommentaryEntry {
    id: UUID;
    matchId: UUID;
    inningsId?: UUID;
    ballEventId?: UUID;
    commentaryType: 'Standard' | 'Critical' | 'Highlight' | 'Milestone';
    title?: string;
    body: string;
    priority: number;
    createdByPersonId?: UUID;
    createdAt: ISO8601Timestamp;
}

export interface MatchInsight {
    id: UUID;
    matchId: UUID;
    inningsId?: UUID;
    relatedBallEventId?: UUID;
    insightType: 'Milestone' | 'Trend' | 'Win Probability' | 'Momentum';
    label?: string;
    valueJson: any;
    generatedAt: ISO8601Timestamp;
    source: string;
}

// --- Layer 10: Statistics and Analytics (Base) ---

export interface PlayerMatchStats {
    id: UUID;
    matchId: UUID;
    teamId: UUID;
    personId: UUID;
    rolePlayed?: string;
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
    wickets: number;
    oversBowled: number;
    maidens: number;
    runsConceded: number;
    catches: number;
    stumpings: number;
    runOuts: number;
    strikeRate?: number;
    economyRate?: number;
    fantasyPoints?: number;
    playerOfMatchPoints: number;
}

export interface PlayerSeasonStats {
    id: UUID;
    seasonId: UUID;
    teamId: UUID;
    personId: UUID;
    matchesPlayed: number;
    inningsBatted: number;
    notOuts: number;
    runs: number;
    highestScore: number;
    battingAverage?: number;
    strikeRate?: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    inningsBowled: number;
    ballsBowled: number;
    wickets: number;
    bestBowling?: string;
    bowlingAverage?: number;
    economyRate?: number;
    catches: number;
    stumpings: number;
    runOuts: number;
}

export interface TeamSeasonStats {
    id: UUID;
    seasonId: UUID;
    teamId: UUID;
    competitionId?: UUID;
    matchesPlayed: number;
    wins: number;
    losses: number;
    ties: number;
    noResults: number;
    points: number;
    netRunRate?: number;
    formGuideJson: string[];
    lastUpdatedAt: ISO8601Timestamp;
}

// --- Layer 11: Player Intelligence & Development ---

export type BattingArchetype =
    | 'Opener'
    | 'Top-order Anchor'
    | 'Middle-order Stabiliser'
    | 'Aggressive Middle-order Batter'
    | 'Finisher'
    | 'Batting All-rounder';

export type BowlingArchetype =
    | 'New-ball Seamer'
    | 'Strike Pace Bowler'
    | 'Containment Seamer'
    | 'Finger Spinner'
    | 'Wrist Spinner'
    | 'Middle-over Control Bowler'
    | 'Death Bowler'
    | 'Bowling All-rounder';

export type SpecialistArchetype =
    | 'Specialist Wicketkeeper'
    | 'Wicketkeeper-Batter'
    | 'Wicketkeeper-Finisher'
    | 'Fielding Specialist';

export type RoleArchetype = BattingArchetype | BowlingArchetype | SpecialistArchetype;

export type SkillDomain =
    | 'Physical'
    | 'Mental'
    | 'Tactical'
    | 'Batting'
    | 'Bowling'
    | 'Fielding'
    | 'Wicketkeeping';

export type RatingScale1to9 = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface SkillAttribute {
    domain: SkillDomain;
    name: string;
    description?: string;
}

export interface SkillAssessment {
    id: UUID;
    personId: UUID;
    assessorId: UUID; // PersonId of the coach/scout
    domain: SkillDomain;
    attributeName: string;
    rating: RatingScale1to9;
    confidence: 'Low' | 'Moderate' | 'High';
    note?: string;
    assessedAt: ISO8601Timestamp;
}

export interface PerformanceIndex {
    id: UUID;
    personId: UUID;
    seasonId: UUID;
    roleArchetype: RoleArchetype;
    battingScore: number;    // 0-100
    bowlingScore: number;    // 0-100
    fieldingScore: number;   // 0-100
    overallScore: number;   // 0-100
    confidenceLevel: 'Low' | 'Moderate' | 'High';
    updatedAt: ISO8601Timestamp;
}

export interface DevelopmentTrend {
    id: UUID;
    personId: UUID;
    seasonId: UUID;
    trendStatus: 'Improving Strongly' | 'Improving Steadily' | 'Stable' | 'Slight Regression' | 'Needs Intervention';
    movementScore: number; // e.g., points gained/lost in a period
    summary?: string;
    updatedAt: ISO8601Timestamp;
}

export interface ReadinessScore {
    id: UUID;
    personId: UUID;
    seasonId: UUID;
    fixtureId?: UUID; // Optional, can be fixture-specific or daily
    score: number;    // 0-100
    status: 'Ready' | 'Caution' | 'Restricted' | 'Unavailable';
    injuryModifier: number;
    workloadModifier: number;
    fatigueModifier: number;
    notes?: string;
    updatedAt: ISO8601Timestamp;
}

export interface PlayerProfile {
    id: UUID;
    personId: UUID;
    primaryRoleArchetype?: RoleArchetype;
    secondaryRoleArchetype?: RoleArchetype;
    battingStyle?: string;
    bowlingStyle?: string;
    dominantHand?: 'Right' | 'Left' | 'Ambidextrous';
    debutDate?: ISO8601Date;
    playerIdCode?: string;
    profileStatus: 'Prospect' | 'Active' | 'Retired';
    status: 'active' | 'inactive' | 'suspended';
    createdAt: ISO8601Timestamp;
    updatedAt: ISO8601Timestamp;
}

export interface TrainingSession {
    id: UUID;
    teamId?: UUID;
    seasonId: UUID;
    scheduledAt: ISO8601Timestamp;
    venueId?: UUID;
    theme?: string;
    objective?: string;
    status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
}

export interface TrainingLog {
    id: UUID;
    personId: UUID;
    sessionId?: UUID;
    sessionDate: ISO8601Date;
    sessionType: string;
    drillsCompleted: string[];
    workload: number;
    coachObservation?: string;
    playerResponse?: string; // Player's self-reflection
    effectivenessScore?: number; // 0-100
    loggedAt: ISO8601Timestamp;
}

export interface InjuryRecord {
    id: UUID;
    personId: UUID;
    injuryType: string;
    bodyArea: string;
    severity: 'Low' | 'Medium' | 'High';
    status: 'Active' | 'Recovering' | 'Cleared' | 'Permanent';
    occurredOn?: ISO8601Date;
    expectedReturnDate?: ISO8601Date;
    rehabPlan?: string;
    medicalNotes?: string;
    clearedByPersonId?: UUID;
    updatedAt: ISO8601Timestamp;
}

export interface PlayerAvailability {
    id: UUID;
    personId: UUID;
    fixtureId: UUID;
    availabilityStatus: 'Available' | 'Away' | 'Injured' | 'Tentative' | 'Unknown';
    responseAt?: ISO8601Timestamp;
    reason?: string;
    notes?: string;
}

// --- Layer 12: Recommendation Engine ---

export interface Drill {
    id: UUID;
    sport: string;
    name: string;
    category: string;
    subcategory?: string;
    description: string;
    intensity: 'Low' | 'Medium' | 'High';
    durationMinutes: number;
    format: 'Individual' | 'Pair' | 'Group' | 'Team';
    equipmentNeeded: string[];
    level: 'Foundation' | 'Intermediate' | 'Advanced';
    videoUrl?: string;
}

export interface DevelopmentNeed {
    id: UUID;
    personId: UUID;
    seasonId: UUID;
    domain: SkillDomain;
    attributeName: string;
    priorityRank: number;
    needScore: number;
    generatedAt: ISO8601Timestamp;
}

export interface DrillRecommendation {
    id: UUID;
    personId: UUID;
    needId: UUID;
    drillId: UUID;
    recommendationType: 'Weakness' | 'Strength Sharpening';
    confidenceLevel: 'Low' | 'Moderate' | 'High';
    generatedAt: ISO8601Timestamp;
}

export interface RecommendationFeedback {
    id: UUID;
    recommendationId: UUID;
    coachId: UUID;
    action: 'Accepted' | 'Modified' | 'Rejected';
    note?: string;
    timestamp: ISO8601Timestamp;
}

// --- Layer 13: Finance and Logistics ---

export interface Invoice {
    id: UUID;
    organisationId?: UUID;
    personId?: UUID;
    relatedEntityType?: string;
    relatedEntityId?: UUID;
    invoiceNumber: string;
    currency: string;
    totalAmount: number;
    dueDate?: ISO8601Date;
    status: 'unpaid' | 'paid' | 'overdue' | 'void';
}

export interface Transaction {
    id: UUID;
    invoiceId: UUID;
    amount: number;
    paymentMethod?: string;
    processorReference?: string;
    transactionDate: ISO8601Timestamp;
    status: 'completed' | 'pending' | 'failed';
}

export interface Vehicle {
    id: UUID;
    organisationId: UUID;
    registrationNumber: string;
    make?: string;
    model?: string;
    vehicleType?: string;
    capacity?: number;
    status: 'active' | 'maintenance' | 'retired';
}

export interface TransportTrip {
    id: UUID;
    fixtureId: UUID;
    vehicleId?: UUID;
    driverPersonId?: UUID;
    departureTime?: ISO8601Timestamp;
    arrivalTime?: ISO8601Timestamp;
    routeNotes?: string;
    passengerCount?: number;
    status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
}

// --- Layer 13: Media and Audit ---

export interface MediaAsset {
    id: UUID;
    relatedEntityType: string;
    relatedEntityId: UUID;
    uploadedByPersonId?: UUID;
    mediaType: 'Image' | 'Video' | 'PDF' | 'Audio';
    fileUrl: string;
    altText?: string;
    createdAt: ISO8601Timestamp;
}

export interface Notification {
    id: UUID;
    recipientPersonId: UUID;
    notificationType: 'Alert' | 'Reminder' | 'Message';
    title: string;
    body: string;
    isRead: boolean;
    sentAt: ISO8601Timestamp;
}

export interface AuditLog {
    id: UUID;
    actorPersonId: UUID;
    entityType: string;
    entityId: UUID;
    actionType: 'Create' | 'Update' | 'Delete' | 'Login';
    beforeJson?: any;
    afterJson?: any;
    createdAt: ISO8601Timestamp;
}
