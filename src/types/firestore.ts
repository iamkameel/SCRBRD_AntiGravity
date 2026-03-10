import { FieldValue, Timestamp, GeoPoint } from 'firebase/firestore';

// Re-export V3 Scoring Types (Event-Sourced Architecture)
// These types implement the single-source-of-truth scoring engine
// See /docs/SCHEMA_V3_PROPOSAL.md for architecture details
export * from './scoring';
import * as V4 from './schema_v4';
export { V4 };


// Re-export types from store for convenience (used by transport module)
// --- Transport Types ---
/** @deprecated Use V4.Vehicle */
export interface Vehicle {

  vehicleId: string;
  name: string;
  type: string;
  capacity: number;
  licensePlate: string;
  status: string;
}

export interface Trip {
  tripId: string;
  vehicleId: string;
  date: string;
  destination: string;
  purpose: string;
  passengers: number;
  passengerCount?: number; // Alias for passengers
  status: string;
  driverName?: string;
}

export interface FirestoreEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

// --- 0. Geographic & Organizational Hierarchy ---
export interface Country extends FirestoreEntity {
  name: string;
}

export interface Province extends FirestoreEntity {
  name: string;
  countryId: string;
}

export type LeagueType = 'League' | 'Series' | 'Cup' | 'Friendly';

export interface League extends FirestoreEntity {
  name: string;
  provinceId: string;
  type: LeagueType;
}

export type DivisionType = 'AGE_GROUP' | 'OPEN_DIVISION';

export type AgeGroup = 'Open' | 'U19' | 'U16' | 'U15' | 'U14' | 'U13' | 'U12' | 'U11' | 'U10';

export interface Division extends FirestoreEntity {
  name: string;
  leagueId: string;
  ageGroup: AgeGroup;
  divisionType?: DivisionType;
  season?: string;
}

export interface School extends FirestoreEntity {
  name: string;
  divisionId?: string;
  provinceId?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  logoUrl?: string; // Changed from emblemUrl to match existing
  abbreviation?: string;
  motto?: string;
  establishmentYear?: number;
  location?: string;
  brandColors?: {
    primary: string;
    secondary: string;
  };
  principal?: string;
  contactName?: string;
}

export type PitchType = "Natural Turf" | "Artificial Astro-Turf" | "Hybrid" | "Matting" | "Concrete" | "Indoor";
export type ScoreboardType = "Manual" | "Digital (Basic)" | "Electronic LED" | "Video Screen";

export interface Field extends FirestoreEntity {
  name: string; // Official ground name
  abbreviatedName?: string; // Short code, e.g. 'WDV Field'
  nickName?: string; // Local nickname
  location?: string; // Address or description
  status?: 'Available' | 'Maintenance' | 'Booked' | 'Closed'; // Status from UI
  address?: string; // Full street address
  coordinates?: { lat: number; lng: number }; // GPS coordinates for map integration
  geoLocation?: GeoPoint; // Center point for mapping
  geoFence?: GeoPoint[]; // Boundary polygon for field limits
  schoolId?: string; // FK → Primary school owner (optional)

  // Physical Specs
  capacity?: number; // Spectator capacity
  pitchCount?: number; // Number of pitches available
  boundaryMin?: number; // meters
  boundaryMax?: number; // meters
  pitchLength?: number; // meters
  pitchWidth?: number; // meters
  fieldSize?: 'Full Size' | 'Youth' | 'Training Area'; // From UI

  // Surface Engine
  pitchType?: PitchType | string; // Allow string for legacy or custom
  surfaceConditionRating?: number; // 1-5
  surfaceDetails?: {
    grassCover?: number; // %
    moistureLevel?: string;
    firmness?: string;
    [key: string]: any;
  };

  // Facilities
  floodlights?: boolean;
  changingRoomsCount?: number;
  practiceNetsCount?: number;
  scoreboardType?: ScoreboardType | string;

  // Amenities
  amenities?: string[]; // Stored as array of strings, mapped to categories in UI

  // Staffing
  contactPerson?: string;
  contactPhone?: string;
  groundsKeeperIds?: string[];

  // Legacy/Existing fields (kept for compatibility)
  orientation?: 'N-S' | 'E-W' | string;
  boundaryDimensions?: {
    front?: number;
    square?: number;
    behind?: number;
  };
  facilityDetails?: {
    pavilions?: string[];
    sightScreens?: string[];
    floodlights?: boolean;
    lightingDetails?: string;
    clubhouse?: string;
    parkingCapacity?: number;
  };
  drainageSystem?: string;
  outfieldType?: 'grass' | 'synthetic';
  lastPitchPreparation?: Timestamp;
  notes?: string;
}

// --- 0.a. School ↔ Field Usage (many-to-many) ---
export interface SchoolField extends FirestoreEntity {
  schoolId: string; // FK → School
  fieldId: string; // FK → Field
  availability?: Array<{ // Optional usage windows
    start: Timestamp;
    end: Timestamp;
  }>;
  notes?: string;
}

// --- 1. Team & Squad Structures ---
export type OpenSuffix = '1st XI' | '2nd XI' | '3rd XI';
export type YouthSuffix = `${Extract<AgeGroup, `U${string}`>}${'A' | 'B' | 'C' | 'D'}`;
export type TeamSuffix = OpenSuffix | YouthSuffix | 'Development' | 'Academy' | string;

/** @deprecated Use V4.Team (Layer 3) */
export interface Team extends FirestoreEntity {

  name: string;
  abbreviatedName?: string; // e.g., 'WBHS'
  nickname?: string; // e.g., 'The Griffins'
  schoolId: string;
  divisionId?: string;
  suffix?: TeamSuffix;
  defaultCaptainId?: string;
  defaultViceCaptainId?: string;
  coachIds?: string[];
  defaultScorerId?: string;
  teamColors?: {
    primary: string;
    secondary?: string;
  };
  logoUrl?: string;
}

export interface Squad extends FirestoreEntity {
  teamId: string;
  season: string;
  squadName?: string;
  captainId?: string;
  viceCaptainId?: string;
  coachIds?: string[];
}

// --- 1.a. Player & Skill Ratings (FM-Style Schema) ---

export interface BattingAttributes {
  frontFoot: number;
  backFoot: number;
  powerHitting: number;
  timing: number;
  shotRange: number;
  sweep: number;
  reverseSweep: number;
  spinReading: number;
  seamAdaptation: number;
  strikeRotation: number;
  finishing: number;
}

export interface BowlingAttributes {
  stockBallControl: number;
  variations: number;
  powerplaySkill: number;
  middleOversControl: number;
  deathOversSkill: number;
  lineLengthConsistency: number;
  spinManipulation: number;
  releaseMechanics: number;
  tacticalOverConstruction: number;
}

export interface FieldingAttributes {
  closeCatching: number;
  deepCatching: number;
  groundFielding: number;
  throwingPower: number;
  throwingAccuracy: number;
  reactionSpeed: number;
  anticipation: number;
}

export interface MentalAttributes {
  temperament: number;
  gameAwareness: number;
  pressureHandling: number;
  patience: number;
  killerInstinct: number;
  decisionMaking: number;
  adaptability: number;
  workEthic: number;
  leadership: number;
  competitiveness: number;
}

export interface PhysicalAttributes {
  speed: number;
  acceleration: number;
  agility: number;
  strength: number;
  stamina: number;
  balance: number;
  coreFitness: number;
  injuryResistance: number;
}

export interface PlayerTrait {
  traitId: string;
  name: string;
}

export interface RoleRating {
  roleRatingId: string;
  roleCode: string;
  rating: number; // 1-5 stars or 1-20
}

export interface SeasonStats {
  seasonStatsId: string;
  seasonId: string;
  teamId: string;
  format: string; // T20, 50-over, 2-day, etc.
  matches: number;
  runs: number;
  battingAverage: number;
  strikeRate: number;
  wickets: number;
  economy: number;
  catches: number;
  momAwards: number;
}

export interface ZoneAnalysis {
  zoneId: string;
  type: 'strength' | 'weakness';
  zoneLabel: string; // e.g. "Extra Cover", "Short Ball 4th Stump"
  description: string;
}

export interface Achievement {
  achievementId: string;
  title: string;
  description: string;
  achievedOn: Timestamp | Date | string;
}

export interface CoachReport {
  reportId: string;
  summary: string;
  pros: string;
  cons: string;
  createdAt: Timestamp | Date | string;
  coachId: string;
}

export interface PlayerProfile {
  // Core
  primaryRole: string;
  battingStyle: string;
  bowlingStyle: string;
  preferredFormats: string[];
  currentAbility: number; // 1-20 or 1-100
  potentialAbility: number; // 1-20 or 1-100
  reputation: number; // 1-10
  heightCm?: number;
  weightKg?: number;

  // Attributes
  battingAttributes?: BattingAttributes;
  bowlingAttributes?: BowlingAttributes;
  fieldingAttributes?: FieldingAttributes;
  mentalAttributes?: MentalAttributes;
  physicalAttributes?: PhysicalAttributes;

  // Traits & Analysis
  playerTraits?: PlayerTrait[];
  roleRatings?: RoleRating[];
  zoneAnalysis?: ZoneAnalysis[];
  coachReports?: CoachReport[];
  achievements?: Achievement[];
  seasonStats?: SeasonStats[];
}

// --- 1.b. Coach Profile & Attributes (FM-Style Schema) ---

export interface CoachingAttributes {
  battingCoaching: number;
  fastBowlingCoaching: number;
  spinBowlingCoaching: number;
  fieldingCoaching: number;
  wicketkeepingCoaching: number;
  youthDevelopment: number;
  seniorDevelopment: number;
  oneToOneCoaching: number;
  sessionPlanning: number;
  videoAnalysisUse: number;
}

export interface TacticalAttributes {
  tacticsLimitedOvers: number;
  tacticsLongFormat: number;
  fieldSetting: number;
  bowlingChanges: number;
  battingOrderConstruction: number;
  inGameAdaptability: number;
  analyticsUse: number;
  oppositionAnalysis: number;
}

export interface ManManagementAttributes {
  playerCommunication: number;
  parentCommunication: number;
  motivation: number;
  conflictManagement: number;
  disciplineStandards: number;
  leadershipPresence: number;
  playerWelfare: number;
  feedbackQuality: number;
}

export interface ProfessionalAttributes {
  organisation: number;
  attentionToDetail: number;
  opennessToNewMethods: number;
  consistency: number;
  workEthic: number;
  pressureComposure: number;
  longTermPlanning: number;
}

export interface CoachSeasonStats {
  seasonId: string;
  teamId: string;
  matches: number;
  wins: number;
  losses: number;
  noResults: number;
  titlesWon: number;
  finalsReached: number;
  avgMarginRuns: number;
  avgMarginWickets: number;
  chaseSuccessRate: number;
}

export interface CoachProfile {
  currentRole: string;
  qualificationLevel: string;
  coachingSince: number;
  primaryTeams: string[];
  preferredFormats: string[];
  philosophySummary: string;
  currentAbility: number; // 1-20
  potentialAbility: number; // 1-20
  reputation: number; // 1-5 stars

  // Attribute Blocks
  coachingAttributes?: CoachingAttributes;
  tacticalAttributes?: TacticalAttributes;
  manManagementAttributes?: ManManagementAttributes;
  professionalAttributes?: ProfessionalAttributes;

  // Tags & Stats
  coachTraits?: string[];
  coachSeasonStats?: CoachSeasonStats[];
}

// --- 1.c. Umpire Profile & Attributes ---

export interface UmpireDecisionAttributes {
  lbwJudgement: number;
  caughtBehindAccuracy: number;
  runOutPositioning: number;
  boundaryCalls: number;
  drsAccuracy: number; // If applicable
  consistency: number;
}

export interface UmpireMatchControlAttributes {
  playerManagement: number;
  conflictResolution: number;
  timeManagement: number;
  lawApplication: number;
  communication: number;
  pressureHandling: number;
}

export interface UmpirePhysicalAttributes {
  fitness: number;
  endurance: number;
  positioningAgility: number;
  concentration: number;
  vision: number;
}

export interface UmpireProfile {
  certificationLevel: 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Elite Panel' | string;
  homeAssociation: string;
  yearsActive: number;
  preferredFormats: string[];

  // Attribute Blocks
  decisionAttributes?: UmpireDecisionAttributes;
  matchControlAttributes?: UmpireMatchControlAttributes;
  physicalAttributes?: UmpirePhysicalAttributes;

  // Stats & Traits
  matchesOfficiated?: number;
  umpireTraits?: string[];
}

// --- 1.d. Scorer Profile & Attributes ---

export interface ScorerTechnicalAttributes {
  softwareProficiency: number; // PlayHQ, CricHQ, SCRBRD
  lawKnowledge: number; // DLS, Penalty runs, etc.
  linearScoring: number; // Paper scoring ability
  digitalScoring: number;
  problemSolving: number;
}

export interface ScorerProfessionalAttributes {
  concentration: number;
  speed: number;
  accuracy: number;
  communication: number; // With umpires
  punctuality: number;
  collaboration: number;
}

export interface ScorerProfile {
  certificationLevel: 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | string;
  preferredMethod: 'Digital' | 'Linear (Paper)' | 'Hybrid';
  experienceYears: number;

  // Attribute Blocks
  technicalAttributes?: ScorerTechnicalAttributes;
  professionalAttributes?: ScorerProfessionalAttributes;

  // Stats & Traits
  matchesScored?: number;
  correctionRate?: number; // Lower is better
  scorerTraits?: string[];
}

// --- 1.e. Medical Profile & Attributes ---

export interface MedicalClinicalAttributes {
  diagnosisAccuracy: number;
  tapingStrapping: number;
  emergencyResponse: number;
  massageTherapy: number;
  injuryPrevention: number;
}

export interface MedicalRehabAttributes {
  returnToPlayPlanning: number;
  strengthConditioning: number;
  loadManagement: number;
  rehabProgramDesign: number;
  psychologicalSupport: number;
}

export interface MedicalProfile {
  qualification: string; // e.g. "BSc Physiotherapy"
  registrationNumber: string; // Professional body reg
  specializations: string[]; // e.g. "Shoulder", "Knee"
  experienceYears: number;

  // Attribute Blocks
  clinicalAttributes?: MedicalClinicalAttributes;
  rehabAttributes?: MedicalRehabAttributes;

  // Stats & Traits
  patientsTreated?: number;
  medicalTraits?: string[];
}

// --- 1.f. Groundskeeper Profile & Attributes ---

export interface GroundskeeperPitchAttributes {
  paceGeneration: number;
  spinPromotion: number;
  durability: number;
  evenness: number;
  moistureControl: number;
}

export interface GroundskeeperOutfieldAttributes {
  drainageManagement: number;
  grassHealth: number;
  boundaryMarking: number;
  rollering: number;
  mowing: number;
}

export interface GroundskeeperProfile {
  experienceYears: number;
  machineryLicenses: string[]; // e.g. "Heavy Roller", "Mower"
  primaryVenues: string[]; // Field IDs they manage

  // Attribute Blocks
  pitchAttributes?: GroundskeeperPitchAttributes;
  outfieldAttributes?: GroundskeeperOutfieldAttributes;

  // Stats & Traits
  matchesPrepared?: number;
  avgPitchRating?: number; // From captain/umpire feedback
  groundskeeperTraits?: string[];
}

// Legacy SkillMatrix (kept for backward compatibility, can be derived from above)
export interface SkillMatrix {
  battingTechnique?: number;
  battingPower?: number;
  battingTemperament?: number;
  bowlingPace?: number;
  bowlingSpinControl?: number;
  bowlingAccuracy?: number;
  fieldingAgility?: number;
  fieldingCatching?: number;
  fieldingThrowing?: number;
  fitnessEndurance?: number;
  fitnessStrength?: number;
  fitnessAgility?: number;
  leadership?: number;
  tacticalAwareness?: number;
  teamwork?: number;
  overallRating?: number;
}

export interface PlayerSkillRating extends FirestoreEntity {
  playerId: string;
  coachId: string;
  skillCategory: string;
  rating: number;
  algorithmVersion?: string;
  comments?: string;
  ratedAt: Timestamp;
}

/** @deprecated Use V4.Person (Layer 1) */
export interface Person extends FirestoreEntity {

  firstName: string;
  middleName?: string;
  lastName: string;
  displayName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string | Timestamp | Date;
  nationality?: string;
  profileImageUrl?: string;
  status?: 'active' | 'injured' | 'inactive' | 'suspended';
  role?: string; // For backwards compatibility
  title?: string;
  specializations?: string[];

  // FM-Style Player Profile (The new source of truth)
  playerProfile?: PlayerProfile;

  // FM-Style Coach Profile
  coachProfile?: CoachProfile;

  // FM-Style Umpire Profile
  umpireProfile?: UmpireProfile;

  // FM-Style Scorer Profile
  scorerProfile?: ScorerProfile;

  // FM-Style Medical Profile
  medicalProfile?: MedicalProfile;

  // FM-Style Groundskeeper Profile
  groundskeeperProfile?: GroundskeeperProfile;

  // LEGACY FIELDS (Marked for deprecation)
  /** @deprecated Use playerProfile.primaryRole */
  primaryRole?: string;
  /** @deprecated Use playerProfile.battingStyle */
  battingStyle?: string;
  /** @deprecated Use playerProfile.bowlingStyle */
  bowlingStyle?: string;
  /** @deprecated Use playerProfile.battingHand */
  battingHand?: 'RHB' | 'LHB';
  /** @deprecated Use playerProfile.bowlingHand */
  bowlingHand?: 'RHB' | 'LHB';
  /** @deprecated Use playerProfile.primaryRole */
  playingRole?: 'Batsman' | 'Bowler' | 'AllRounder' | 'Wicketkeeper';
  /** @deprecated Use playerProfile.fieldingAttributes */
  primaryFieldingPosition?: string;
  /** @deprecated Use playerProfile.attributes */
  skillMatrix?: SkillMatrix;

  // LEGACY STATS
  /** @deprecated Use PlayerSeasonStats (V3 Statistics Module) */
  stats?: {
    matchesPlayed?: number;
    totalRuns?: number;
    wicketsTaken?: number;
    battingAverage?: number;
    bowlingAverage?: number;
    strikeRate?: number;
    economy?: number;
  };

  // Organizational Links
  schoolId?: string;
  teamIds?: string[];
  squadHistory?: string[];
  careerStatisticsId?: string;
  dataAiHint?: string;
  assignedSchools?: string[];

  // Guardians/Spectators
  childrenIds?: string[];
  guardianIds?: string[];
  following?: {
    teamIds?: string[];
    matchIds?: string[];
    playerIds?: string[];
  };
}

export interface SquadPlayer extends FirestoreEntity {
  squadId: string;
  playerId: string;
  joinedAt?: Timestamp;
  isPrimary?: boolean;
  position?: string;
  isWicketkeeper?: boolean;
}

// --- 2. Fixture, Scheduling & Notifications ---
export enum FixtureStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  LIVE = 'live',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed'
}

/** @deprecated Use V4.Fixture (Layer 5) */
export interface Fixture extends FirestoreEntity {

  matchId: string;
  scheduledAt: Timestamp;
  fieldId: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
}

export interface FixtureNotification extends FirestoreEntity {
  fixtureId: string;
  userIds: string[];
  notifiedAt: Timestamp;
}

// --- 3. Pre-Match Procedure & Team Confirmation ---
export interface PreMatchProcedure extends FirestoreEntity {
  fixtureId: string;
  coachesNotifiedAt?: Timestamp;
  captainNotifiedAt?: Timestamp;
  groundskeeperNotifiedAt?: Timestamp;
  playersNotifiedAt?: Timestamp;
  reservesNotifiedAt?: Timestamp;
  teamSelection?: {
    homePlayingXI: string[];
    homeReserves: string[];
    awayPlayingXI: string[];
    awayReserves: string[];
    selectedAt?: Timestamp;
    selectedBy?: string;
  };
  teamConfirmed?: {
    homeConfirmedAt?: Timestamp;
    homeConfirmedBy?: string;
    awayConfirmedAt?: Timestamp;
    awayConfirmedBy?: string;
  };
  scorerChecklist?: Array<{
    item: string;
    completed: boolean;
    completedBy?: string;
    completedAt?: Timestamp;
    approved?: boolean;
    approvedBy?: string;
    approvedAt?: Timestamp;
  }>;
  battingOrder?: Array<{
    teamId: string;
    order: string[];
    arrangedAt?: Timestamp;
    arrangedBy?: string;
  }>;
  bowlingOrder?: Array<{
    teamId: string;
    order: string[];
    arrangedAt?: Timestamp;
    arrangedBy?: string;
  }>;
  notifications?: Array<{
    playerIds: string[];
    notifiedAt?: Timestamp;
    notifiedBy?: string;
    type: 'teamConfirmation' | 'lineupChange' | string;
  }>;
}

// --- 4. Matches & Results ---
/** @deprecated Use V4.Match (Layer 5) */
export interface Match extends FirestoreEntity {

  // Identity & Meta
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName?: string;
  awayTeamName?: string;
  matchDate: Timestamp | string;
  matchTime?: Timestamp;
  fieldId?: string;
  isDayNight?: boolean;

  // V3 STATE MACHINE
  state?: 'SCHEDULED' | 'TEAM_SELECTION' | 'PRE_MATCH' | 'LIVE' | 'INNINGS_BREAK' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
  stateHistory?: Array<{
    from: string;
    to: string;
    timestamp: Timestamp | Date | string;
    triggeredBy: string;
    reason?: string;
  }>;

  // GEOGRAPHIC / COMPETITION
  location?: string;
  divisionId?: string;
  leagueId?: string;
  seasonId?: string;
  competitionId?: string;
  fixtureStatus?: FixtureStatus;

  // V3 SCORING ENGINE (Event-Sourced)
  // Collection: /matches/{matchId}/scoring_actions/
  // Projection: /matches/{matchId}/live/score (LiveScoreProjection)

  // LEGACY FIELDS (Kept for compatibility)
  /** @deprecated Use state */
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed' | 'live';
  /** @deprecated Use state === 'LIVE' */
  isLive?: boolean;
  /** @deprecated Use matchDate */
  dateTime?: string;
  /** @deprecated Use fieldId */
  venue?: string;
  /** @deprecated Use location */
  division?: string;

  // LEGACY SCORING DATA (Deprecated V1/V2)
  /** @deprecated Use LiveScoreProjection */
  score?: {
    home?: string;
    away?: string;
  };
  /** @deprecated Use LiveScoreProjection */
  homeScore?: number;
  /** @deprecated Use LiveScoreProjection */
  awayScore?: number;
  /** @deprecated Use LiveScoreProjection.result */
  result?: string;
  /** @deprecated Use matchRoleSelection workflow */
  tossWinnerId?: string;
  /** @deprecated Use matchRoleSelection workflow */
  tossDecision?: 'bat' | 'bowl' | 'field';
  tossWinner?: string; // For backwards compatibility
  tossChoice?: string; // For backwards compatibility
  weather?: string;
  pitchCondition?: string;
  notes?: string;

  // MATCH SETTINGS
  matchType?: 'T20' | 'ODI' | 'Test' | 'T10' | 'Other' | '50-over' | '2-day';
  overs?: number;

  // OFFICIALS (V3 uses MatchRoleAssignment)
  /** @deprecated Use MatchRoleAssignment */
  umpires?: string[];
  /** @deprecated Use MatchRoleAssignment */
  referee?: string;
  /** @deprecated Use MatchRoleAssignment */
  scorer?: string;

  // LEGACY INNINGS DATA
  /** @deprecated Use ScoringAction events */
  inningsData?: {
    firstInnings?: Innings;
    secondInnings?: Innings;
  };

  // TEAM SELECTION (New workflow data)
  teamSelection?: {
    home?: {
      playingXI: string[];
      reserves: string[];
      captain: string;
      viceCaptain?: string;
      confirmedAt?: Timestamp | Date | string;
      confirmedBy?: string;
    };
    away?: {
      playingXI: string[];
      reserves: string[];
      captain: string;
      viceCaptain?: string;
      confirmedAt?: Timestamp | Date | string;
      confirmedBy?: string;
    };
  };

  // PRE-MATCH WORKFLOW (New!)
  preMatch?: {
    toss?: {
      winner: 'home' | 'away';
      decision: 'bat' | 'field';
      conductedAt: Timestamp | Date | string;
      conductedBy: string;
    };
    scorerChecklist?: {
      scorebookPrepared: boolean;
      teamSheetsReceived: boolean;
      umpiresBriefed: boolean;
      equipmentChecked: boolean;
      completedBy?: string;
      completedAt?: Timestamp | Date | string;
    };
    battingOrder?: {
      team: 'home' | 'away';
      order: string[];
    };
  };

  // LIVE MATCH DATA (New!)
  liveData?: {
    currentInnings: 1 | 2;
    currentOver: number;
    currentBall: number;
    striker: string;
    nonStriker: string;
    bowler: string;
    lastBallTimestamp: Timestamp | Date | string;
  };

  liveScore?: {
    innings: Innings;
    currentOver: Ball[];
    partnership: {
      runs: number;
      balls: number;
    };
    target?: number;
  };

  // COMPLETION DATA (New!)
  completion?: {
    winner: 'home' | 'away' | 'tie' | 'draw' | 'no-result';
    margin?: string;
    completedAt: Timestamp | Date | string;
    finalResult: string;
    playerOfTheMatch?: string;
  };
}

export interface MatchResult extends FirestoreEntity {
  matchId: string;
  winnerTeamId?: string;
  margin?: string;
  summary?: string;
}

// --- 5. Officials & Assignments ---
export interface MatchOfficial extends FirestoreEntity {
  matchId: string;
  officialType: 'umpire' | 'scorer' | 'groundskeeper';
  officialId: string;
  role: string;
  assignedAt?: Timestamp;
}

export interface Umpire extends FirestoreEntity {
  firstName: string;
  lastName: string;
  certification?: string;
  phoneNumber?: string;
}

export interface LegacyScorerProfile extends FirestoreEntity {
  userId: string;
  organisationId: string;
  certificationLevel?: string;
  availability?: Record<string, any>[];
  isActive?: boolean;
}

export interface Groundskeeper extends FirestoreEntity {
  firstName: string;
  lastName: string;
  qualification?: string;
  phoneNumber?: string;
  experienceLevel?: string;
}

// --- 6. Primary Scoring Actions & Live Scoring Tools ---
export interface ScoringAction extends FirestoreEntity {
  fixtureId: string;
  inningsId: string;
  overNumber: number;
  ballInOver: number;
  zoneId: string;
  runs: number;
  extras: number;
  isWicket: boolean;
  wicketType?: string;
  dismissedPlayerId?: string;
  fielderIds?: string[];
  eventTime: Timestamp;
}

export interface Delivery extends FirestoreEntity {
  actionId: string;
  fixtureId: string;
  inningsId: string;
  overNumber: number;
  ballInOver: number;
  batsmanId: string;
  nonStrikerId: string;
  bowlerId: string;
  runsOffBat: number;
  extras: number;
  extraType?: 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'penalty';
  isWicket: boolean;
  wicketType?: string;
  dismissedPlayerId?: string;
  fielderIds?: string[];
  eventTime: Timestamp;
}

export interface BatterInnings extends FirestoreEntity {
  inningsId: string;
  playerId: string;
  battingPosition: number;
  runsScored: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  notOut: boolean;
  dismissalType?: string;
  dismissalBowlerId?: string;
  dismissalFielderId?: string;
}

export interface BowlerInnings extends FirestoreEntity {
  inningsId: string;
  playerId: string;
  overs: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  wides: number;
  noBalls: number;
  economyRate: number;
}

export interface OverSummary extends FirestoreEntity {
  inningsId: string;
  overNumber: number;
  runsScored: number;
  wickets: number;
  extras: number;
  cumulativeRuns: number;
  cumulativeWickets: number;
}

export interface BowlingSpell extends FirestoreEntity {
  bowlerInningsId: string;
  startOver: number;
  endOver: number;
}

export interface ScoringZone extends FirestoreEntity {
  name: string;
  polygon: GeoPoint[];
}

export interface DeliveryZone extends FirestoreEntity {
  zoneId: string;
  runs: number;
}

export interface WagonWheel {
  inningsId: string;
  actionSeries: Record<string, string[]>;
}

export interface SpiderSegment extends FirestoreEntity {
  name: string;
  angleStart: number;
  angleEnd: number;
}

export interface SpiderWheel {
  inningsId: string;
  segmentActions: Record<string, string[]>;
}

// --- 6.a Scorecards & Cards ---

export interface BattingCardEntry {
  playerId: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate?: number;
  dismissal?: string;
  isOut: boolean;
}

export interface BowlingCardEntry {
  playerId: string;
  name: string;
  overs: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  economyRate?: number;
}

export interface ExtraSummary {
  type: 'wide' | 'no-ball' | 'bye' | 'leg-bye' | 'penalty';
  count: number;
}

export interface PlayerMatchStats extends BattingCardEntry {
  minutesBatting?: number;
}

export interface BowlerMatchStats extends BowlingCardEntry {
  dots?: number;
  wides?: number;
  noBalls?: number;
}

export interface ExtraStats extends ExtraSummary {
  runs: number;
}

export interface LiveScoreProjection extends FirestoreEntity {
  matchId: string;
  status: 'scheduled' | 'live' | 'innings_break' | 'completed';
  inningsNumber: 1 | 2;

  currentInnings: {
    battingTeamId: string;
    battingTeamName?: string;
    bowlingTeamId: string;
    bowlingTeamName?: string;
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
    target?: number;
    runRate: number;
    requiredRunRate?: number;
    requiredRuns?: number;
    projectedScore?: number;
  };

  ballHistory?: any[];
  undoLog?: any[];

  currentPlayers: {
    strikerId: string | null;
    strikerName?: string;
    nonStrikerId: string | null;
    nonStrikerName?: string;
    bowlerId: string | null;
    bowlerName?: string;
    bowlingAngle?: string;
  };

  batsmen: BatsmanProjection[];
  bowlers: BowlerProjection[];
  currentOver: BallSummary[];
  partnership: PartnershipData;
  fallOfWickets: FallOfWicketEntry[];
  extras: ExtrasBreakdown;

  innings1?: InningsProjection;
  innings2?: InningsProjection;
  result?: {
    winnerId?: string;
    winnerName?: string;
    winMargin?: string;
    resultText: string;
  };

  lastUpdated: any; // Timestamp
  lastActionId: string;
  lastActionSequence: number;
  version: number;

  // Top-level shortcut fields (derived from result)
  winnerId?: string;
  winMargin?: string;
}

export interface InningsProjection {
  inningsNumber: 1 | 2;
  battingTeamId: string;
  battingTeamName?: string;
  bowlingTeamId: string;
  bowlingTeamName?: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  runRate: number;
  batsmen: BatsmanProjection[];
  bowlers: BowlerProjection[];
  extras: ExtrasBreakdown;
  fallOfWickets: FallOfWicketEntry[];
  partnerships: PartnershipData[];
  isComplete: boolean;
}

// Re-using/Mapping some types from scoring.ts or defining them here for completeness
export interface BatsmanProjection {
  playerId: string;
  name?: string;
  battingPosition: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissal?: any;
}

export interface BowlerProjection {
  playerId: string;
  name?: string;
  overs: number;
  ballsBowled: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
}

export interface BallSummary {
  actionId: string;
  runs: number;
  isWicket: boolean;
  display: string;
}

export interface PartnershipData {
  runs: number;
  balls: number;
  batsmanARuns: number;
  batsmanBRuns: number;
}

export interface FallOfWicketEntry {
  wicketNumber: number;
  score: number;
  over: string;
  batsmanOutId: string;
}

export interface ExtrasBreakdown {
  wides: number;
  noBalls: number;
  byes: number;
  legByes: number;
  penalty: number;
  total: number;
}

export interface Partnership {
  battingTeamId: string;
  partners: [string, string];
  runs: number;
  balls: number;
  wicketAtScore: number;
  wicketAtOver: number;
}

export interface FallOfWicket {
  wicketNumber: number;
  score: number;
  over: string;
  batsmanOutId: string;
}

export type ChartType = 'worm' | 'manhattan' | 'runRate' | 'partnership' | 'overProgress';

export interface ChartData {
  type: ChartType;
  dataPoints: any[];
}

export interface Scorecard {
  fixtureId: string;
  matchId: string;
  date: Timestamp;
  fieldId: string;
  status: Match['status'];
  isLive: boolean;
  battingCards: BattingCardEntry[];
  bowlingCards: BowlingCardEntry[];
  extras: ExtraSummary[];
  partnerships: Partnership[];
  fallOfWickets: FallOfWicket[];
  overSummaries: OverSummary[];
  wagonWheel: WagonWheel;
  charts: ChartData[];
}

// --- 7. Aggregated & Head-to-Head Statistics ---
export interface SquadStatistics extends FirestoreEntity {
  squadId: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
}

export interface TeamHeadToHeadStats extends FirestoreEntity {
  teamAId: string;
  teamBId: string;
  matchesPlayed: number;
  teamAWins: number;
  teamBWins: number;
  draws: number;
}

// --- 8. Coaching & Awards ---
export interface Coach extends FirestoreEntity {
  firstName: string;
  lastName: string;
  qualifications?: Record<string, any>[];
  phoneNumber?: string;
}

export interface CoachingNote extends FirestoreEntity {
  coachId: string;
  squadId?: string;
  playerId?: string;
  note: string;
}

export interface Award extends FirestoreEntity {
  fixtureId: string;
  playerId?: string;
  awardType: string;
  details?: string;
}

// --- 9. Match Predictions ---
export interface MatchPrediction extends FirestoreEntity {
  fixtureId: string;
  predictedWinnerId?: string;
  probability: number;
  factors?: Record<string, any>;
}

export interface Sponsor extends FirestoreEntity {
  name: string;
  industry: string;
  contributionAmount: number;
  active: boolean;
  logoUrl: string;
  website?: string;
}

// --- Legacy Interfaces (Kept for compatibility) ---
export interface Ball {
  runs: number;
  extras?: number;
  extrasType?: 'wide' | 'noball' | 'bye' | 'legbye';
  isWicket: boolean;
  wicketType?: string;
  playerOutId?: string;
  bowlerId?: string;
  batsmanId?: string;
  fielderId?: string; // Added in previous session
  shotType?: string;
  coordinates?: { x: number; y: number }; // For wagon wheel
  length?: 'Full' | 'Good' | 'Short' | 'Yorker';
  line?: 'Off Stump' | 'Middle Stump' | 'Leg Stump' | 'Wide Outside Off' | 'Wide Down Leg';
}

export interface Over {
  overNumber: number;
  balls: Ball[];
  bowlerId: string;
  runsConceded: number;
  wicketsTaken: number;
}

export interface Innings {
  teamId: string;
  runs: number;
  wickets: number;
  overs: number;
  overHistory: Over[];
  battingCard?: BattingCardEntry[];
  bowlingCard?: BowlingCardEntry[];
  currentBatsmen?: string[]; // Added for live scoring
  currentBowler?: string; // Added for live scoring

  // Added for scorecard display
  batsmen?: Array<{
    playerId: string;
    runs: number;
    ballsFaced: number;
    fours?: number;
    sixes?: number;
    strikeRate?: number;
    isOut: boolean;
    dismissal?: string;
  }>;
  bowlers?: Array<{
    playerId: string;
    overs?: number;
    maidens?: number;
    runsConceded: number;
    wickets?: number;
    economy?: number;
  }>;
  extras?: {
    wides?: number;
    noballs?: number;
    byes?: number;
    legbyes?: number;
  };
}

export interface RosterMember extends FirestoreEntity {
  teamId: string;
  personId: string;
  role: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  jerseyNumber?: string;
  personName?: string;
}

export interface Season extends FirestoreEntity {
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface Equipment extends FirestoreEntity {
  name: string;
  type: string;
  brand: string;
  category: string;
  status: string;
  condition: string;
  quantity: number;
  assignedTo: string | null;
  cost?: number;
  itemId?: string; // For legacy support if needed
}

export interface Transaction extends FirestoreEntity {
  transactionId?: string; // Legacy support
  date: string;
  type: string;
  category: string;
  amount: number;
  description: string;
  status: string;
}

export interface StaffProfile extends FirestoreEntity {
  schoolId: string;
  name: string;
  title: string;
  role: 'Principal' | 'Director of Sport' | 'Head Coach' | 'Admin' | 'Other';
  bio?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
}

export interface NewsPost extends FirestoreEntity {
  schoolId: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  imageUrl?: string;
  author?: string;
  tags?: string[];
}

export interface SchoolStats extends FirestoreEntity {
  schoolId: string;
  totalTeams: number;
  activePlayers: number;
  coachingStaff: number;
  upcomingFixtures: number;
  lastUpdated: string;
}

// --- 10. Live Scoring Types ---
export type BowlingAngle = 'Over the Wicket' | 'Round the Wicket';

export interface LiveMatchUpdateOutput {
  winProbability: number;
  summary: string;
}

export interface MatchForecast {
  details: {
    condition: string;
    temperature: number;
  };
}

export interface PlayerOfTheMatch {
  name: string;
  teamName: string;
  justification: string;
}

export interface RosterMemberWithStats extends RosterMember {
  stats: {
    oversBowled: number;
    wicketsTaken: number;
    runsConceded: number;
    economyRate: number;
    oversDisplay?: string;
  };
  physicalAttributes?: {
    bowlingHand?: string;
    bowlingStyles?: string[];
  };
  profileImageUrl?: string;
}

export interface LiveFallOfWicket extends FallOfWicket {
  batsmanName?: string;
}

export interface LiveBatsman {
  playerId: string;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  howOut?: string;
  bowlerId?: string;
}

export interface LiveBowler {
  playerId: string;
  overs: number;
  balls: number;
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  wides: number;
  noBalls: number;
}

export interface LiveScore {
  matchId: string;
  status: 'live' | 'completed' | 'scheduled';
  inningsNumber: number;
  battingTeamId: string;
  bowlingTeamId: string;

  currentInnings: {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
    battingTeamId: string;
    bowlingTeamId: string;
    target?: number;
  };

  // Previous innings data (if 2nd innings)
  innings1?: {
    runs: number;
    wickets: number;
    overs: number;
    balls?: number;
    batsmen?: LiveBatsman[];
    bowlers?: LiveBowler[];
    battingTeamId?: string;
  };

  // Second innings data (if match completed)
  innings2?: {
    runs: number;
    wickets: number;
    overs: number;
    balls?: number;
    batsmen?: LiveBatsman[];
    bowlers?: LiveBowler[];
    battingTeamId?: string;
  };

  winnerId?: string;
  winMargin?: string;

  currentPlayers: {
    strikerId?: string;
    nonStrikerId?: string;
    bowlerId?: string;
    bowlingAngle?: BowlingAngle;
  };

  batsmen: LiveBatsman[];
  bowlers: LiveBowler[];

  ballHistory: any[]; // Ideally defined as Ball[]
  undoLog?: any[];

  // Legacy/Alternative fields (keeping for compatibility if needed, or removing if unused)
  extras?: { total: number; wides: number; noBalls: number; byes: number; legByes: number; partnership: number };
  fallOfWickets?: LiveFallOfWicket[];
  partnerships?: Partnership[];
}
