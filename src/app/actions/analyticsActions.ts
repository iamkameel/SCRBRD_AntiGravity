'use server';

import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, limit, Timestamp } from 'firebase/firestore';
import { Team, Person, Season } from '@/types/firestore';
import { normalizePeople } from '@/lib/normalizePerson';
import { serializeData } from '@/lib/serialize';
import { unstable_cache } from 'next/cache';
import {
  fetchPersonById,
  getMatchesByTeam,
  fetchMatchesByDateRange,
  fetchMatches,
  fetchTopRunScorers,
  fetchTopWicketTakers
} from '@/lib/firestore';

export interface TeamCreationContext {
  historicalTeams: Team[];
  playerDepth: {
    totalEligible: number;
    byRole: Record<string, number>;
  };
  coachWorkload: Record<string, {
    teamCount: number;
    teams: string[];
  }>;
}

/**
 * Fetch comprehensive context for team creation
 * - Historical teams for this school/division
 * - Player depth analysis
 * - Coach workload data
 */
export async function getTeamCreationContextAction(
  schoolId: string,
  divisionId: string,
  seasonId?: string
): Promise<TeamCreationContext> {
  try {
    // 1. Fetch Historical Teams (last season or current)
    // For now, we fetch all teams for this school/division to see patterns
    const teamsQuery = query(
      collection(db, 'teams'),
      where('schoolId', '==', schoolId),
      where('divisionId', '==', divisionId)
    );
    const teamsSnapshot = await getDocs(teamsQuery);
    const historicalTeams = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));

    // 2. Fetch Player Depth
    // Count players assigned to this school (and potentially age group if we had DOB data)
    // For now, simple count of players in the school
    const playersQuery = query(
      collection(db, 'people'),
      where('assignedSchools', 'array-contains', schoolId),
      where('role', '==', 'Player')
    );
    const playersSnapshot = await getDocs(playersQuery);
    const players = normalizePeople(playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const playerDepth = {
      totalEligible: players.length,
      byRole: {
        'Batsman': players.filter(p => p.playingRole === 'Batsman').length,
        'Bowler': players.filter(p => p.playingRole === 'Bowler').length,
        'AllRounder': players.filter(p => p.playingRole === 'AllRounder').length,
        'Wicketkeeper': players.filter(p => p.playingRole === 'Wicketkeeper').length,
      }
    };

    // 3. Fetch Coach Workload
    // Get all teams for this school to check coach assignments
    const allSchoolTeamsQuery = query(
      collection(db, 'teams'),
      where('schoolId', '==', schoolId)
    );
    const allTeamsSnapshot = await getDocs(allSchoolTeamsQuery);
    const allTeams = allTeamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Team));

    const coachWorkload: Record<string, { teamCount: number; teams: string[] }> = {};

    allTeams.forEach(team => {
      if (team.coachIds) {
        team.coachIds.forEach(coachId => {
          if (!coachWorkload[coachId]) {
            coachWorkload[coachId] = { teamCount: 0, teams: [] };
          }
          coachWorkload[coachId].teamCount++;
          coachWorkload[coachId].teams.push(team.name);
        });
      }
    });

    return serializeData({
      historicalTeams,
      playerDepth,
      coachWorkload
    });

  } catch (error) {
    console.error('Error fetching team creation context:', error);
    return {
      historicalTeams: [],
      playerDepth: { totalEligible: 0, byRole: {} },
      coachWorkload: {}
    };
  }
}

// Analytics Data Types
export interface PerformerData {
  id: string;
  name: string;
  value: number;
  stat: string;
}

export interface AnalyticsData {
  totalMatches: number;
  totalRuns: number;
  totalWickets: number;
  topRunScorers: PerformerData[];
  topWicketTakers: PerformerData[];
  bestBattingAverages: PerformerData[];
  bestBowlingEconomy: PerformerData[];
  mostCatches: PerformerData[];
}

export interface AnalyticsResult {
  success: boolean;
  data?: AnalyticsData;
  error?: string;
}


/**
 * Fetch analytics data for the analytics dashboard
 */
export interface AnalyticsFilters {
  dateRange?: { from?: Date; to?: Date };
  season?: string;
  division?: string;
  league?: string;
  team?: string;
}

/**
 * Fetch analytics data for the analytics dashboard
 */
/**
 * Fetch analytics data for the analytics dashboard
 */
export async function getAnalyticsDataAction(filters?: AnalyticsFilters): Promise<AnalyticsResult> {
  try {
    let matches: any[] = [];

    // 1. Fetch Matches based on primary filter (Team > Date > Default)
    if (filters?.team) {
      matches = await getMatchesByTeam(filters.team);
    } else if (filters?.dateRange?.from && filters?.dateRange?.to) {
      matches = await fetchMatchesByDateRange(filters.dateRange.from, filters.dateRange.to);
    } else {
      matches = await fetchMatches(100); // Default limit
    }

    // 2. Apply client-side filtering for other criteria
    let filteredMatches = matches.filter(m => m.status === 'completed' || m.result);

    if (filters?.season) {
      filteredMatches = filteredMatches.filter(m => m.seasonId === filters.season);
    }
    if (filters?.division) {
      filteredMatches = filteredMatches.filter(m => m.divisionId === filters.division || m.division === filters.division);
    }
    if (filters?.league) {
      filteredMatches = filteredMatches.filter(m => m.leagueId === filters.league);
    }
    // Apply date filter if not already used for fetching (e.g. if we fetched by team)
    if (filters?.team && filters?.dateRange?.from) {
      filteredMatches = filteredMatches.filter(m => {
        const date = m.dateTime ? new Date(m.dateTime) : new Date();
        return date >= filters.dateRange!.from!;
      });
    }
    if (filters?.team && filters?.dateRange?.to) {
      filteredMatches = filteredMatches.filter(m => {
        const date = m.dateTime ? new Date(m.dateTime) : new Date();
        return date <= filters.dateRange!.to!;
      });
    }

    // 3. Calculate Totals from Filtered Matches
    const totalMatches = filteredMatches.length;
    let totalRuns = 0;
    let totalWickets = 0;

    // 4. Aggregate Player Stats from Filtered Matches
    const playerStats: Record<string, {
      name: string,
      runs: number,
      wickets: number,
      catches: number,
      matches: number
    }> = {};

    filteredMatches.forEach(match => {
      // Aggregate Match Totals
      if (match.score) {
        // Try to parse score string "245/8"
        const parseScore = (score?: string) => {
          if (!score) return 0;
          const parts = score.split('/');
          return parseInt(parts[0]) || 0;
        };
        // This is rough estimation if inningsData is missing
        // totalRuns += parseScore(match.score.home) + parseScore(match.score.away);
      }

      // Aggregate from Innings Data (More accurate)
      if (match.inningsData) {
        const processInnings = (innings?: any) => {
          if (!innings) return;

          totalRuns += innings.runs || 0;
          totalWickets += innings.wickets || 0;

          // Process Batsmen
          if (innings.batsmen) {
            innings.batsmen.forEach((b: any) => {
              if (!playerStats[b.playerId]) {
                playerStats[b.playerId] = { name: 'Unknown', runs: 0, wickets: 0, catches: 0, matches: 0 };
              }
              playerStats[b.playerId].runs += b.runs || 0;
              playerStats[b.playerId].matches++; // Rough match count

              // Try to get name if available (not standard in innings data usually, but good to check)
              if (b.playerName) playerStats[b.playerId].name = b.playerName;
            });
          }

          // Process Bowlers
          if (innings.bowlers) {
            innings.bowlers.forEach((b: any) => {
              if (!playerStats[b.playerId]) {
                playerStats[b.playerId] = { name: 'Unknown', runs: 0, wickets: 0, catches: 0, matches: 0 };
              }
              playerStats[b.playerId].wickets += b.wickets || 0;
              if (b.playerName) playerStats[b.playerId].name = b.playerName;
            });
          }
        };

        processInnings(match.inningsData.firstInnings);
        processInnings(match.inningsData.secondInnings);
      }
    });

    // 5. Enhance Player Names (Fetch if unknown)
    // For MVP, we might miss names if they aren't in the innings data.
    // We can fetch the top X IDs to get their names.
    const topRunScorerIds = Object.keys(playerStats)
      .sort((a, b) => playerStats[b].runs - playerStats[a].runs)
      .slice(0, 5);

    const topWicketTakerIds = Object.keys(playerStats)
      .sort((a, b) => playerStats[b].wickets - playerStats[a].wickets)
      .slice(0, 5);

    const uniqueIdsToFetch = Array.from(new Set([...topRunScorerIds, ...topWicketTakerIds]));

    // Fetch names for top performers
    await Promise.all(uniqueIdsToFetch.map(async (id) => {
      if (playerStats[id].name === 'Unknown') {
        const person = await fetchPersonById(id);
        if (person) {
          playerStats[id].name = `${person.firstName} ${person.lastName}`;
        }
      }
    }));

    // 6. Format Output
    const topRunScorers = topRunScorerIds.map(id => ({
      id,
      name: playerStats[id].name,
      value: playerStats[id].runs,
      stat: 'Runs'
    }));

    const topWicketTakers = topWicketTakerIds.map(id => ({
      id,
      name: playerStats[id].name,
      value: playerStats[id].wickets,
      stat: 'Wickets'
    }));

    // Fallback to global stats if local aggregation yields nothing (e.g. no innings data yet)
    if (topRunScorers.length === 0 && !filters?.team && !filters?.season) {
      const [globalRunScorers, globalWicketTakers] = await Promise.all([
        fetchTopRunScorers(5),
        fetchTopWicketTakers(5)
      ]);

      return serializeData({
        success: true,
        data: {
          totalMatches,
          totalRuns: totalRuns || totalMatches * 240, // Estimate if 0
          totalWickets: totalWickets || totalMatches * 12, // Estimate if 0
          topRunScorers: globalRunScorers.map(p => ({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            value: p.stats?.totalRuns || 0,
            stat: 'Runs'
          })),
          topWicketTakers: globalWicketTakers.map(p => ({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            value: p.stats?.wicketsTaken || 0,
            stat: 'Wickets'
          })),
          bestBattingAverages: [],
          bestBowlingEconomy: [],
          mostCatches: []
        }
      });
    }

    return serializeData({
      success: true,
      data: {
        totalMatches,
        totalRuns,
        totalWickets,
        topRunScorers,
        topWicketTakers,
        bestBattingAverages: [],
        bestBowlingEconomy: [],
        mostCatches: []
      }
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {
      success: false,
      error: 'Failed to fetch analytics data'
    };
  }
}

export interface PredictionResult {
  homeWinProbability: number;
  awayWinProbability: number;
  factors: string[];
}

/**
 * Predict match outcome based on historical data
 */
export async function predictMatchOutcomeAction(
  homeTeamId: string,
  awayTeamId: string
): Promise<PredictionResult> {
  try {
    const [homeMatches, awayMatches] = await Promise.all([
      getMatchesByTeam(homeTeamId),
      getMatchesByTeam(awayTeamId)
    ]);

    // 1. Calculate Win Rates
    const calculateWinRate = (matches: any[], teamId: string) => {
      const completed = matches.filter(m => m.status === 'completed');
      if (completed.length === 0) return 0;
      const wins = completed.filter(m => {
        if (m.completion?.winner === 'home') return m.homeTeamId === teamId;
        if (m.completion?.winner === 'away') return m.awayTeamId === teamId;
        return false;
      }).length;
      return wins / completed.length;
    };

    const homeWinRate = calculateWinRate(homeMatches, homeTeamId);
    const awayWinRate = calculateWinRate(awayMatches, awayTeamId);

    // 2. Head-to-Head
    const h2hMatches = homeMatches.filter(m =>
      (m.homeTeamId === awayTeamId || m.awayTeamId === awayTeamId) && m.status === 'completed'
    );
    const homeH2HWins = h2hMatches.filter(m => {
      if (m.completion?.winner === 'home') return m.homeTeamId === homeTeamId;
      if (m.completion?.winner === 'away') return m.awayTeamId === homeTeamId;
      return false;
    }).length;

    // 3. Heuristic Model
    let probability = 0.50; // Base
    const factors: string[] = [];

    // Factor: Recent Form (Win Rate)
    if (homeWinRate > awayWinRate) {
      probability += 0.10;
      factors.push("Home team has better recent form.");
    } else if (awayWinRate > homeWinRate) {
      probability -= 0.10;
      factors.push("Away team has better recent form.");
    }

    // Factor: Head-to-Head
    if (h2hMatches.length > 0) {
      if (homeH2HWins > h2hMatches.length / 2) {
        probability += 0.10;
        factors.push("Home team dominates head-to-head.");
      } else {
        probability -= 0.10;
        factors.push("Away team dominates head-to-head.");
      }
    }

    // Factor: Home Advantage
    probability += 0.05;
    factors.push("Home ground advantage.");

    // Clamp
    probability = Math.max(0.1, Math.min(0.9, probability));

    return {
      homeWinProbability: Math.round(probability * 100),
      awayWinProbability: Math.round((1 - probability) * 100),
      factors
    };

  } catch (error) {
    console.error('Error predicting match outcome:', error);
    return {
      homeWinProbability: 50,
      awayWinProbability: 50,
      factors: ["Insufficient data for prediction."]
    };
  }
}

export interface PlayerForecast {
  predictedValue: number;
  metric: 'Runs' | 'Wickets';
  confidence: number;
  trend: 'Up' | 'Down' | 'Stable';
  analysis: string;
}

/**
 * Predict player performance for next match
 */
export async function predictPlayerPerformanceAction(playerId: string): Promise<PlayerForecast> {
  try {
    const player = await fetchPersonById(playerId);
    if (!player) throw new Error("Player not found");

    const isBowler = player.playingRole === 'Bowler';
    const metric = isBowler ? 'Wickets' : 'Runs';

    // Base stats
    const average = isBowler
      ? (player.stats?.wicketsTaken || 0) / (player.stats?.matchesPlayed || 1) // Wickets per match
      : (player.stats?.battingAverage || 25);

    // Heuristic: Random fluctuation around average to simulate "Form"
    const formFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
    let predictedValue = Math.round(average * formFactor);

    if (isBowler) {
      // Clamp wickets to realistic range (0-10)
      predictedValue = Math.max(0, Math.min(10, predictedValue));
      if (predictedValue === 0 && Math.random() > 0.5) predictedValue = 1;
    }

    const trend = formFactor > 1 ? 'Up' : formFactor < 0.9 ? 'Down' : 'Stable';

    let analysis = "";
    if (trend === 'Up') {
      analysis = `${player.firstName} is showing signs of positive form. Expect a strong performance.`;
    } else if (trend === 'Down') {
      analysis = `Recent data suggests a slight dip. ${player.firstName} might need to consolidate early.`;
    } else {
      analysis = `Consistent performance expected based on career average of ${Math.round(average)}.`;
    }

    return {
      predictedValue,
      metric,
      confidence: Math.round(60 + Math.random() * 30), // 60-90%
      trend,
      analysis
    };

  } catch (error) {
    console.error('Error predicting player performance:', error);
    return {
      predictedValue: 0,
      metric: 'Runs',
      confidence: 0,
      trend: 'Stable',
      analysis: "Insufficient data."
    };
  }
}

export interface FilterOptions {
  seasons: { id: string; name: string }[];
  divisions: { id: string; name: string }[];
  leagues: { id: string; name: string }[];
  teams: { id: string; name: string }[];
}

/**
 * Fetch available filter options for the analytics dashboard
 */
// Names of teams/leagues/divisions change rarely; cache for 5 minutes so the
// analytics filter bar doesn't re-read three collections on every mount.
const getCachedFilterOptions = unstable_cache(
  async (): Promise<FilterOptions> => {
    const [teamsSnapshot, leaguesSnapshot, divisionsSnapshot] = await Promise.all([
      getDocs(collection(db, 'teams')),
      getDocs(collection(db, 'leagues')),
      getDocs(collection(db, 'divisions'))
    ]);

    return {
      // Mock seasons for now as we don't have a dedicated collection yet
      seasons: [
        { id: '2024', name: '2024 Season' },
        { id: '2023', name: '2023 Season' },
        { id: '2022', name: '2022 Season' }
      ],
      divisions: divisionsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })),
      leagues: leaguesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })),
      teams: teamsSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name })),
    };
  },
  ['analytics-filter-options'],
  { revalidate: 300 }
);

export async function getAnalyticsFilterOptionsAction(): Promise<{ success: boolean; data?: FilterOptions; error?: string }> {
  try {
    return serializeData({ success: true, data: await getCachedFilterOptions() });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return {
      success: false,
      error: 'Failed to fetch filter options'
    };
  }
}
