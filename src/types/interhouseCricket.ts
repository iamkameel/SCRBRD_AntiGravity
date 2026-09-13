/**
 * SCRBRD — Inter-House Cricket Schema Types
 * Derived from Markdown References/SCRBRD_Inter-House_Cricket_Schema.md
 */

export type CompetitionFormat =
    | 'ROUND_ROBIN'
    | 'KNOCKOUT'
    | 'GROUP_AND_KNOCKOUT'
    | 'LEAGUE'
    | 'LADDER'
    | 'FESTIVAL';

export type CricketFormat =
    | 'PAIRS'
    | 'MINI_CRICKET'
    | 'T5'
    | 'T10'
    | 'T12'
    | 'T15'
    | 'T20'
    | 'T25'
    | 'T30'
    | 'T40'
    | 'T50'
    | 'TIMED'
    | 'DECLARATION'
    | 'CUSTOM';

export type BallType =
    | 'HARD_BALL'
    | 'SOFT_BALL'
    | 'INCREDIBALL'
    | 'TENNIS_BALL'
    | 'CUSTOM';

export type GenderCategory = 'BOYS' | 'GIRLS' | 'MIXED' | 'OPEN';

export type InterHouseCompetitionStatus =
    | 'DRAFT'
    | 'REGISTRATION'
    | 'DRAW_PUBLISHED'
    | 'ACTIVE'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'ARCHIVED';

export interface InterHouseCricketCompetition {
    cricketCompetitionId: string;
    competitionId: string;
    schoolId: string;
    seasonId?: string;
    name: string;
    academicYear: number;
    competitionFormat: CompetitionFormat;
    cricketFormat: CricketFormat;
    ballType: BallType;
    genderCategory: GenderCategory;
    startDate: string;
    endDate: string;
    status: InterHouseCompetitionStatus;
    rulesetId: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export type TiedMatchRule =
    | 'TIE_ALLOWED'
    | 'SUPER_OVER'
    | 'WICKETS_LOST'
    | 'BOUNDARY_COUNT'
    | 'HEAD_TO_HEAD'
    | 'CUSTOM';

export type RainRule =
    | 'DLS'
    | 'RUN_RATE'
    | 'REVISED_TARGET'
    | 'SHARE_POINTS'
    | 'REPLAY'
    | 'CUSTOM';

export interface InterHouseCricketRuleset {
    rulesetId: string;
    schoolId: string;
    name: string;
    version: string;
    inningsPerSide: number;
    oversPerInnings?: number;
    ballsPerOver: number;
    maxPlayersPerSquad: number;
    playersPerSide: number;
    minimumPlayersToStart?: number;
    maxOversPerBowler?: number;
    powerplayEnabled: boolean;
    powerplayOvers?: number;
    fieldingRestrictionsEnabled: boolean;
    retirementEnabled: boolean;
    retirementRuns?: number;
    retirementBalls?: number;
    battersCanReturnAfterRetirement: boolean;
    compulsoryRetirement: boolean;
    batterBallLimitEnabled: boolean;
    maxBallsPerBatter?: number;
    freeHitEnabled: boolean;
    noBallRuns: number;
    wideRuns: number;
    noBallCountsAsBall: boolean;
    wideCountsAsBall: boolean;
    lastBatterContinues: boolean;
    allowSubstitutions: boolean;
    concussionReplacementEnabled: boolean;
    superOverEnabled: boolean;
    tiedMatchRule: TiedMatchRule;
    rainRule: RainRule;
    minimumOversForResult?: number;
    pointsSystemId: string;
    customRules?: Record<string, unknown>;
    effectiveFrom: string;
    effectiveTo?: string;
    active: boolean;
}

export type DivisionType =
    | 'AGE_GROUP'
    | 'GRADE'
    | 'JUNIOR'
    | 'SENIOR'
    | 'OPEN'
    | 'CUSTOM';

export interface InterHouseCricketDivision {
    divisionId: string;
    cricketCompetitionId: string;
    name: string;
    code: string;
    divisionType: DivisionType;
    minimumAge?: number;
    maximumAge?: number;
    minimumGrade?: number;
    maximumGrade?: number;
    playerEligibilityRuleId?: string;
    formatOverride?: CricketFormat;
    rulesetOverrideId?: string;
    displayOrder: number;
    status: 'ACTIVE' | 'COMPLETED';
}

export type HouseTeamStatus =
    | 'DRAFT'
    | 'REGISTERED'
    | 'ACTIVE'
    | 'ELIMINATED'
    | 'WITHDRAWN'
    | 'COMPLETED';

export interface HouseCricketTeam {
    houseTeamId: string;
    houseId: string;
    cricketCompetitionId: string;
    divisionId: string;
    name: string;
    shortName?: string;
    teamNumber: number;
    captainId?: string;
    viceCaptainId?: string;
    coachId?: string;
    managerId?: string;
    status: HouseTeamStatus;
    registeredAt?: string;
}

export type PrimaryPlayerRole =
    | 'BATTER'
    | 'WICKETKEEPER_BATTER'
    | 'ALL_ROUNDER'
    | 'BOWLING_ALL_ROUNDER'
    | 'BOWLER'
    | 'WICKETKEEPER';

export type BattingStyle = 'RIGHT_HAND' | 'LEFT_HAND';

export type BowlingStyle =
    | 'RIGHT_ARM_FAST'
    | 'RIGHT_ARM_FAST_MEDIUM'
    | 'RIGHT_ARM_MEDIUM'
    | 'LEFT_ARM_FAST'
    | 'LEFT_ARM_FAST_MEDIUM'
    | 'LEFT_ARM_MEDIUM'
    | 'RIGHT_ARM_OFF_SPIN'
    | 'RIGHT_ARM_LEG_SPIN'
    | 'LEFT_ARM_ORTHODOX'
    | 'LEFT_ARM_WRIST_SPIN'
    | 'OTHER';

export type SquadMemberStatus =
    | 'REGISTERED'
    | 'AVAILABLE'
    | 'UNAVAILABLE'
    | 'INJURED'
    | 'SUSPENDED'
    | 'WITHDRAWN';

export interface HouseCricketSquadMember {
    squadMemberId: string;
    houseTeamId: string;
    personId: string;
    primaryRole?: PrimaryPlayerRole;
    battingStyle?: BattingStyle;
    bowlingStyle?: BowlingStyle;
    wicketkeeperEligible: boolean;
    isCaptain: boolean;
    isViceCaptain: boolean;
    status: SquadMemberStatus;
    registeredAt: string;
}

export interface InterHouseEligibilityRules {
    ruleId: string;
    cricketCompetitionId: string;
    divisionId?: string;
    requireActiveHouseMembership: boolean;
    minimumAge?: number;
    maximumAge?: number;
    minimumGrade?: number;
    maximumGrade?: number;
    allowPlayingUp: boolean;
    maximumPlayUpLevels?: number;
    allowPlayingDown: boolean;
    allowMultipleDivisionParticipation: boolean;
    maxMatchesPerDay?: number;
    schoolFirstTeamEligible: boolean;
    provincialPlayersEligible: boolean;
    nationalPlayersEligible: boolean;
    representativePlayerLimitPerXI?: number;
    customConditions?: Record<string, unknown>;
}

export interface InterHouseCricketGroup {
    groupId: string;
    cricketCompetitionId: string;
    divisionId: string;
    name: string;
    groupType: 'POOL' | 'GROUP' | 'LEAGUE';
    qualificationCount?: number;
    displayOrder: number;
}

export interface InterHouseCricketGroupTeam {
    id: string;
    groupId: string;
    houseTeamId: string;
    seed?: number;
}

export type RoundType =
    | 'POOL'
    | 'LEAGUE'
    | 'ROUND_OF_16'
    | 'QUARTER_FINAL'
    | 'SEMI_FINAL'
    | 'PLATE_SEMI_FINAL'
    | 'PLATE_FINAL'
    | 'FINAL'
    | 'THIRD_PLACE';

export interface InterHouseCricketRound {
    roundId: string;
    cricketCompetitionId: string;
    divisionId: string;
    roundType: RoundType;
    sequence: number;
    name: string;
}

export type LineupStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'LOCKED';
export type EligibilityStatus = 'VALID' | 'WARNING' | 'INELIGIBLE' | 'OVERRIDDEN';

export interface InterHouseMatchLineup {
    lineupId: string;
    fixtureId: string;
    houseTeamId: string;
    captainId: string;
    wicketkeeperId?: string;
    submittedBy: string;
    submittedAt: string;
    confirmedAt?: string;
    status: LineupStatus;
}

export interface InterHouseMatchLineupPlayer {
    lineupPlayerId: string;
    lineupId: string;
    personId: string;
    battingPosition?: number;
    playingStatus: 'PLAYING_XI' | 'SUBSTITUTE' | 'RESERVE';
    isCaptain: boolean;
    isWicketkeeper: boolean;
    eligibilityStatus: EligibilityStatus;
    eligibilityOverrideBy?: string;
    eligibilityOverrideReason?: string;
}

export interface FixtureToss {
    fixtureId: string;
    winningHouseTeamId: string;
    tossChoice: 'BAT' | 'BOWL';
    conductedBy?: string;
    recordedBy: string;
    recordedAt: string;
}

export interface InterHouseCricketPointsSystem {
    pointsSystemId: string;
    cricketCompetitionId: string;
    winPoints: number;
    tiePoints: number;
    drawPoints: number;
    noResultPoints: number;
    lossPoints: number;
    walkoverWinPoints: number;
    bonusPointsEnabled: boolean;
    battingBonusRules?: Record<string, unknown>;
    bowlingBonusRules?: Record<string, unknown>;
    penaltyRules?: Record<string, unknown>;
}

export type PointsTransactionType =
    | 'WIN'
    | 'TIE'
    | 'DRAW'
    | 'NO_RESULT'
    | 'BATTING_BONUS'
    | 'BOWLING_BONUS'
    | 'WALKOVER'
    | 'PENALTY'
    | 'ADJUSTMENT';

export interface InterHouseCricketPointsLedger {
    transactionId: string;
    cricketCompetitionId: string;
    fixtureId?: string;
    houseTeamId: string;
    houseId: string;
    type: PointsTransactionType;
    points: number;
    description: string;
    awardedBy?: string;
    createdAt: string;
    reversalOf?: string;
}

export interface InterHouseCricketStandings {
    cricketCompetitionId: string;
    divisionId: string;
    groupId?: string;
    houseTeamId: string;
    houseId: string;
    played: number;
    won: number;
    lost: number;
    tied: number;
    drawn: number;
    noResults: number;
    runsFor: number;
    oversFaced: number;
    runsAgainst: number;
    oversBowled: number;
    points: number;
    bonusPoints: number;
    penaltyPoints: number;
    netRunRate: number;
    position: number;
    previousPosition?: number;
    qualified: boolean;
}

export interface InterHouseCricketH2H {
    h2hId: string;
    schoolId: string;
    houseAId: string;
    houseBId: string;
    divisionId?: string;
    matchesPlayed: number;
    houseAWins: number;
    houseBWins: number;
    ties: number;
    noResults: number;
    houseARuns: number;
    houseBRuns: number;
    lastMeetingFixtureId?: string;
    updatedAt: string;
}
