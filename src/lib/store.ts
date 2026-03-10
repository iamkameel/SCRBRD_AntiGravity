import {
  Person as V4Person,
  Match as V4Match,
  Fixture as V4Fixture,
  Team as V4Team,
  Organisation as V4Organisation,
  Season as V4Season,
  AgeDivision as V4AgeDivision,
  TeamClass as V4TeamClass,
  Innings as V4Innings,
  Over as V4Over,
  BallEvent as V4BallEvent,
  Vehicle as V4Vehicle,
  TransportTrip as V4TransportTrip,
  PlayerProfile as V4PlayerProfile,
  PlayerMatchStats as V4PlayerMatchStats,
  InningsBattingScorecard as V4BattingScorecard,
  InningsBowlingScorecard as V4BowlingScorecard
} from '../types/schema_v4';

// --- Extended Types for Client Side UI ---

export type PlayerStats = V4PlayerMatchStats;
export type Player = V4Person & {
  // Aliases for V4 Schema consistency
  personId?: string; // Alias for id
  schoolId?: string; // Alias for organisationId

  // UI-specific fields
  displayName?: string;
  middleName?: string;
  role?: string;
  email?: string; // Redundant but kept for compatibility
  phone?: string; // Redundant but kept for compatibility
  specializations?: string[];
  skills?: {
    batting: number;
    bowling: number;
    fielding: number;
    fitness: number;
    mental: number;
    leadership?: number;
    experience?: number;
  };
  physicalAttributes?: {
    height?: number;
    weight?: number;
    battingHand?: 'Left' | 'Right';
    bowlingHand?: 'Left' | 'Right';
    battingStyle?: string;
    bowlingStyle?: string;
  };
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  playingRole?: string;
  primaryFieldingPosition?: string;
  skillMatrix?: any;
  squadHistory?: any[];
  careerStatisticsId?: string;
  dataAiHint?: string;
  nationality?: string;
  battingHand?: 'RHB' | 'LHB';
  bowlingHand?: 'RAF' | 'LAF' | 'RAO' | 'LAO';
  battingStyle?: string;
  bowlingStyle?: string;
  assignedSchools?: string[];
  teamIds?: string[];
  title?: string;

  profile?: V4PlayerProfile;
  coachProfile?: any;
  umpireProfile?: any;
  scorerProfile?: any;
  medicalProfile?: any;
  groundskeeperProfile?: any;
  stats?: {
    matchesPlayed?: number;
    totalRuns?: number;
    battingAverage?: number;
    strikeRate?: number;
    hundreds?: number;
    fifties?: number;
    wicketsTaken?: number;
    bowlingAverage?: number;
    economyRate?: number;
    bestBowlingFigures?: string;
    bestBowling?: string;
    catches?: number;
    stumpings?: number;
    economy?: number;
    matches?: number;
    runs?: number;
    wickets?: number;
  };
};

export type Match = V4Match & {
  // Aliases for V4 Schema consistency
  matchId: string; // Alias for id

  // UI-specific fields
  fixture: V4Fixture;
  innings?: V4Innings[];
  teamAName?: string;
  teamBName?: string;
  teamAId?: string;
  teamBId?: string;
  dateTime?: string;
  venue?: string;
  status?: string;
  result?: string;
  score?: { home: string, away: string };
  homeScore?: number;
  awayScore?: number;
  tossWinnerId?: string;
  liveScore?: {
    runs: number;
    wickets: number;
    overs: number;
    battingTeam: string;
  };
  matchType?: 'T20' | 'ODI' | 'Test' | '50-over' | '2-day' | 'T10' | 'Other';
};

export type School = V4Organisation & {
  abbreviation?: string;
  motto?: string;
  establishmentYear?: number;
  principal?: string;
  location?: string;
  phone?: string;
  website?: string;
  brandColors?: { primary: string; secondary: string };
  schoolId: string; // Alias for id
};

export type Team = V4Team & {
  // Aliases for V4 Schema consistency
  teamId: string; // Alias for id
  organisationId: string; // Correct property name but keeping for visibility

  // UI-specific fields
  organisation: V4Organisation;
  season: V4Season;
  ageDivision: V4AgeDivision;
  teamClass: V4TeamClass;
  division?: string;
  teamColors?: { primary: string; secondary?: string };
};

export type Season = V4Season & {
  seasonId: string; // Alias for id
};
export type Vehicle = V4Vehicle;
export type Trip = V4TransportTrip;

// --- Legacy Interace Stubs for Compatibility (to be phased out) ---

export interface PlayerSkills {
  batting: number;
  bowling: number;
  fielding: number;
  fitness: number;
  mental: number;
}

export interface Store {
  currentUser: {
    name: string;
    role: string;
  };
  people: Player[];
  matches: Match[];
  teams: Team[];
  schools: School[];
  seasons: Season[];
  vehicles: Vehicle[];
  trips: Trip[];
  fields: any[];
  divisions: any[];
  equipment: any[];
  staffProfiles: any[];
  newsPosts: any[];
  schoolStats: any[];
}

// --- Mock Data ---

export const store: Store = {
  currentUser: {
    name: "Kameel Kalyan",
    role: "Admin"
  },
  people: [
    {
      id: "p1",
      personId: "p1",
      firstName: "Virat",
      lastName: "Kohli",
      preferredName: "Virat",
      email: "virat.kohli@bcci.tv",
      status: "active",
      dateOfBirth: "1988-11-05",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        matchesPlayed: 250,
        totalRuns: 12000,
        battingAverage: 58.5,
        strikeRate: 93.2,
        hundreds: 43,
        fifties: 62
      },
      profileImageUrl: "https://ui-avatars.com/api/?name=Virat+Kohli&background=10b981&color=fff",
      assignedSchools: ["s1"],
      teamIds: ["t1"],
      schoolId: "s1"
    },
    {
      id: "p2",
      personId: "p2",
      firstName: "Jasprit",
      lastName: "Bumrah",
      preferredName: "Boom Boom",
      email: "j.bumrah@mumbaiindians.com",
      status: "active",
      dateOfBirth: "1993-12-06",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        matchesPlayed: 120,
        wicketsTaken: 250,
        bowlingAverage: 21.4,
        economyRate: 4.5,
        bestBowling: "6/19"
      },
      profileImageUrl: "https://ui-avatars.com/api/?name=Jasprit+Bumrah&background=f59e0b&color=fff",
      assignedSchools: ["s1"],
      teamIds: ["t1"],
      schoolId: "s1"
    },
    {
      id: "p3",
      personId: "p3",
      firstName: "Ben",
      lastName: "Stokes",
      preferredName: "Stokesy",
      email: "ben.stokes@ecb.co.uk",
      status: "inactive", // V4 'status' doesn't have 'injured'
      dateOfBirth: "1991-06-04",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        matchesPlayed: 150,
        totalRuns: 4500,
        wicketsTaken: 180,
        battingAverage: 38.2,
        bowlingAverage: 28.5
      },
      profileImageUrl: "https://ui-avatars.com/api/?name=Ben+Stokes&background=ef4444&color=fff",
      assignedSchools: ["s2"],
      teamIds: ["t2"],
      schoolId: "s2"
    },
    {
      id: "p4",
      personId: "p4",
      firstName: "Kane",
      lastName: "Williamson",
      preferredName: "Kane",
      email: "kane.w@nzc.nz",
      status: "active",
      dateOfBirth: "1990-08-08",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        matchesPlayed: 160,
        totalRuns: 6000,
        battingAverage: 48.5,
        strikeRate: 125.0,
        hundreds: 20,
        fifties: 40
      },
      profileImageUrl: "https://ui-avatars.com/api/?name=Kane+Williamson&background=000000&color=fff",
      assignedSchools: ["s3"],
      teamIds: ["t3"],
      schoolId: "s3"
    },
    {
      id: "p5",
      personId: "p5",
      firstName: "Rashid",
      lastName: "Khan",
      preferredName: "Rashid",
      email: "rashid.k@acb.af",
      status: "active",
      dateOfBirth: "1998-09-20",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        matchesPlayed: 100,
        wicketsTaken: 200,
        bowlingAverage: 18.5,
        economyRate: 6.2,
        bestBowling: "5/10"
      },
      profileImageUrl: "https://ui-avatars.com/api/?name=Rashid+Khan&background=0000FF&color=fff",
      assignedSchools: ["s1"],
      teamIds: ["t4"],
      schoolId: "s1"
    }
  ],
  matches: [
    {
      id: "m1",
      matchId: "m1",
      fixtureId: "f1",
      liveStatus: "pre_match",
      matchState: "not_started",
      versionNo: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fixture: {
        id: "f1",
        seasonId: "s2024",
        sport: "Cricket",
        homeTeamId: "t1",
        awayTeamId: "t4",
        venueId: "v1",
        scheduledStartAt: new Date(Date.now() + 86400000).toISOString(),
        status: "scheduled",
        ballsPerOver: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      teamAId: "t1",
      teamBId: "t4",
      teamAName: "Royal Challengers",
      teamBName: "Super Kings",
      dateTime: new Date(Date.now() + 86400000).toISOString(),
      status: "scheduled",
      venue: "Main Oval",
      duckworthLewisUsed: false
    },
    {
      id: "m2",
      matchId: "m2",
      fixtureId: "f2",
      liveStatus: "completed",
      matchState: "finished",
      versionNo: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fixture: {
        id: "f2",
        seasonId: "s2024",
        sport: "Cricket",
        homeTeamId: "t2",
        awayTeamId: "t3",
        venueId: "v2",
        scheduledStartAt: new Date(Date.now() - 86400000).toISOString(),
        status: "completed",
        ballsPerOver: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      teamAId: "t2",
      teamBId: "t3",
      teamAName: "Mumbai Indians",
      teamBName: "Capitals",
      dateTime: new Date(Date.now() - 86400000).toISOString(),
      status: "completed",
      result: "Mumbai Indians won by 5 wickets",
      venue: "Piley Rees",
      tossWinnerTeamId: "t3",
      tossDecision: "Bat",
      homeScore: 180,
      awayScore: 178,
      duckworthLewisUsed: false
    },
    {
      id: "m3",
      matchId: "m3",
      fixtureId: "f3",
      liveStatus: "innings_1",
      matchState: "in_progress",
      versionNo: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fixture: {
        id: "f3",
        seasonId: "s2024",
        sport: "Cricket",
        homeTeamId: "t3",
        awayTeamId: "t4",
        venueId: "v3",
        scheduledStartAt: new Date().toISOString(),
        status: "live",
        ballsPerOver: 6,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      teamAId: "t3",
      teamBId: "t4",
      teamAName: "Capitals",
      teamBName: "Super Kings",
      dateTime: new Date().toISOString(),
      status: "live",
      liveScore: {
        runs: 145,
        wickets: 3,
        overs: 15.4,
        battingTeam: "Capitals"
      },
      venue: "Hilton Oval",
      duckworthLewisUsed: false
    }
  ],
  teams: [
    {
      id: "t1",
      teamId: "t1",
      organisationId: "s1",
      seasonId: "s2024",
      sport: "Cricket",
      ageDivisionId: "d1",
      teamClassId: "c1",
      name: "Royal Challengers",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      teamColors: { primary: "#FF0000", secondary: "#FFD700" },
      division: "Under 15",
      organisation: { id: "s1", name: "Westville Boys' High School", status: "active", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" } as any,
      season: { id: "s2024", name: "2024", sport: "Cricket", startDate: "2024-01-01", endDate: "2024-12-31", isActive: true, createdAt: "2024-01-01T00:00:00Z" } as any,
      ageDivision: { id: "d1", name: "Under 15", sport: "Cricket" } as any,
      teamClass: { id: "c1", label: "A Team", code: "A", sport: "Cricket" } as any
    },
    {
      id: "t2",
      teamId: "t2",
      organisationId: "s2",
      seasonId: "s2024",
      sport: "Cricket",
      ageDivisionId: "d1",
      teamClassId: "c1",
      name: "Mumbai Indians",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      teamColors: { primary: "#005DA0", secondary: "#FFFFFF" },
      division: "Under 15",
      organisation: { id: "s2", name: "Kearsney College", status: "active", createdAt: "2024-01-01T00:00:00Z", updatedAt: "2024-01-01T00:00:00Z" } as any,
      season: { id: "s2024", name: "2024", sport: "Cricket", startDate: "2024-01-01", endDate: "2024-12-31", isActive: true, createdAt: "2024-01-01T00:00:00Z" } as any,
      ageDivision: { id: "d1", name: "Under 15", sport: "Cricket" } as any,
      teamClass: { id: "c1", label: "A Team", code: "A", sport: "Cricket" } as any
    }
  ],
  schools: [
    {
      id: "s1",
      name: "Westville Boys' High School",
      status: "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      abbreviation: "WBHS",
      motto: "Incepto Ne Desistam",
      establishmentYear: 1952,
      principal: "Mr. Brian North",
      location: "Jan Hofmeyr Road, Westville, Durban",
      brandColors: { primary: "#003D7A", secondary: "#FFD700" },
      schoolId: "s1"
    }
  ],
  seasons: [
    {
      id: "s2024",
      seasonId: "s2024",
      name: "2024 Season",
      sport: "Cricket",
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ],
  vehicles: [],
  trips: [],
  fields: [],
  divisions: [],
  equipment: [],
  staffProfiles: [],
  newsPosts: [],
  schoolStats: []
};

// --- Helper Functions ---

export const getPlayerById = (id: string) => store.people.find(p => p.id === id);
export const getMatchById = (id: string) => store.matches.find(m => m.id === id);
export const getTeamById = (id: string) => store.teams.find(t => t.id === id);
export const getSchoolById = (id: string) => store.schools.find(s => s.id === id);

export const getLiveMatches = () => store.matches.filter(m => m.fixture.status === 'live');
export const getUpcomingMatches = () => store.matches.filter(m => m.fixture.status === 'scheduled');

export const getTopBatters = (limit = 5) => {
  return [...store.people]
    .filter(p => p.stats?.totalRuns)
    .sort((a, b) => (b.stats?.totalRuns || 0) - (a.stats?.totalRuns || 0))
    .slice(0, limit);
};

export const getTopBowlers = (limit = 5) => {
  return [...store.people]
    .filter(p => p.stats?.wicketsTaken)
    .sort((a, b) => (b.stats?.wicketsTaken || 0) - (a.stats?.wicketsTaken || 0))
    .slice(0, limit);
};

export const getPlayersBySchool = (schoolId: string) => {
  return store.people.filter(p => p.assignedSchools?.includes(schoolId));
};
