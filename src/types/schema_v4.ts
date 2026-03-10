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

export interface UserAccount {
    id: UUID;
    personId: UUID;
    authProvider?: 'Firebase' | 'Google' | 'Apple';
    authIdentifier?: string;
    lastLoginAt?: ISO8601Timestamp;
    isActive: boolean;
    createdAt: ISO8601Timestamp;
}

export interface SystemRole {
    id: UUID;
    code: string;
    label: string;
}

export interface UserRoleAssignment {
    id: UUID;
    userAccountId: UUID;
    systemRoleId: UUID;
    organisationId?: UUID;
    teamId?: UUID;
    startDate: ISO8601Date;
    endDate?: ISO8601Date;
    status: 'active' | 'expired' | 'revoked';
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

// --- Layer 10: Statistics and Analytics ---

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

export interface TeamHeadToHeadStats {
    id: UUID;
    teamAId: UUID;
    teamBId: UUID;
    matchesPlayed: number;
    teamAWins: number;
    teamBWins: number;
    ties: number;
    noResults: number;
    highestTeamAScore?: number;
    highestTeamBScore?: number;
    lastMeetingMatchId?: UUID;
    updatedAt: ISO8601Timestamp;
}

// --- Layer 11: Player Development ---

export interface PlayerProfile {
    id: UUID;
    personId: UUID;
    preferredRole?: string;
    battingStyle?: string;
    bowlingStyle?: string;
    debutDate?: ISO8601Date;
    playerIdCode?: string;
    profileStatus: 'Prospect' | 'Active' | 'Retired';
}

export interface SkillRating {
    id: UUID;
    personId: UUID;
    ratedByPersonId: UUID;
    seasonId?: UUID;
    category: 'Physical' | 'Tactical' | 'Technical' | 'Mental';
    attributeName: string;
    ratingValue: number; // 1-20
    notes?: string;
    ratedAt: ISO8601Timestamp;
}

export interface TrainingLog {
    id: UUID;
    personId: UUID;
    teamId?: UUID;
    sessionDate: ISO8601Date;
    sessionType: string;
    workload: number;
    notes?: string;
    coachComments?: string;
}

export interface InjuryRecord {
    id: UUID;
    personId: UUID;
    injuryType: string;
    bodyArea: string;
    severity: 'Low' | 'Medium' | 'High';
    occurredOn?: ISO8601Date;
    expectedReturnDate?: ISO8601Date;
    status: 'Active' | 'Recovering' | 'Cleared' | 'Permanent';
    rehabPlan?: string;
}

export interface PlayerAvailability {
    id: UUID;
    personId: UUID;
    teamId: UUID;
    fixtureId?: UUID;
    availableFrom?: ISO8601Date;
    availableTo?: ISO8601Date;
    availabilityStatus: 'Available' | 'Away' | 'Injured' | 'Tentative';
    reason?: string;
}

// --- Layer 12: Finance and Logistics ---

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
