'use server';

import admin from '@/lib/firebase-admin';
import { TeamStanding, calculateNRR, sortStandings, calculatePoints, extractMatchScores } from '@/lib/utils/pointsTableUtils';
import { Match } from '@/types/firestore';
import { serializeData } from '@/lib/serialize';

export async function getPointsTableAction(
  leagueId?: string,
  seasonId?: string
): Promise<{ success: boolean; standings?: TeamStanding[]; error?: string }> {
  try {
    if (!leagueId && !seasonId) {
      return { success: false, error: 'Either leagueId or seasonId must be provided' };
    }

    // Fetch completed matches for the league/season
    let matchesQuery = admin.firestore().collection('matches')
      .where('status', '==', 'completed');

    if (leagueId) {
      matchesQuery = matchesQuery.where('leagueId', '==', leagueId);
    }
    if (seasonId) {
      matchesQuery = matchesQuery.where('seasonId', '==', seasonId);
    }

    const matchesSnapshot = await matchesQuery.get();
    const matches = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));

    // Build standings map
    const standingsMap = new Map<string, TeamStanding>();

    // Process each match
    for (const match of matches) {
      const homeTeamId = match.homeTeamId;
      const awayTeamId = match.awayTeamId;

      // Initialize team standings if not exists
      if (!standingsMap.has(homeTeamId)) {
        const homeTeamDoc = await admin.firestore().collection('teams').doc(homeTeamId).get();
        const homeTeamData = homeTeamDoc.data();
        standingsMap.set(homeTeamId, {
          teamId: homeTeamId,
          teamName: homeTeamData?.name || 'Unknown Team',
          played: 0,
          won: 0,
          lost: 0,
          tied: 0,
          noResult: 0,
          points: 0,
          runsFor: 0,
          ballsFor: 0,
          runsAgainst: 0,
          ballsAgainst: 0,
          netRunRate: 0,
        });
      }

      if (!standingsMap.has(awayTeamId)) {
        const awayTeamDoc = await admin.firestore().collection('teams').doc(awayTeamId).get();
        const awayTeamData = awayTeamDoc.data();
        standingsMap.set(awayTeamId, {
          teamId: awayTeamId,
          teamName: awayTeamData?.name || 'Unknown Team',
          played: 0,
          won: 0,
          lost: 0,
          tied: 0,
          noResult: 0,
          points: 0,
          runsFor: 0,
          ballsFor: 0,
          runsAgainst: 0,
          ballsAgainst: 0,
          netRunRate: 0,
        });
      }

      const homeTeam = standingsMap.get(homeTeamId)!;
      const awayTeam = standingsMap.get(awayTeamId)!;

      // Extract scores
      const { homeRuns, homeBalls, awayRuns, awayBalls } = extractMatchScores(match);

      // Update runs and balls
      homeTeam.runsFor += homeRuns;
      homeTeam.ballsFor += homeBalls;
      homeTeam.runsAgainst += awayRuns;
      homeTeam.ballsAgainst += awayBalls;

      awayTeam.runsFor += awayRuns;
      awayTeam.ballsFor += awayBalls;
      awayTeam.runsAgainst += homeRuns;
      awayTeam.ballsAgainst += homeBalls;

      // Update match results
      homeTeam.played++;
      awayTeam.played++;

      // Determine winner from result string or completion data
      const result = match.result || match.completion?.finalResult || '';
      const winner = match.completion?.winner;

      if (result.toLowerCase().includes('tie') || winner === 'tie') {
        homeTeam.tied++;
        awayTeam.tied++;
      } else if (result.toLowerCase().includes('no result') || winner === 'no-result') {
        homeTeam.noResult++;
        awayTeam.noResult++;
      } else if (winner === 'home' || result.toLowerCase().includes('home')) {
        homeTeam.won++;
        awayTeam.lost++;
      } else if (winner === 'away' || result.toLowerCase().includes('away')) {
        awayTeam.won++;
        homeTeam.lost++;
      } else if (homeRuns > awayRuns) {
        homeTeam.won++;
        awayTeam.lost++;
      } else if (awayRuns > homeRuns) {
        awayTeam.won++;
        homeTeam.lost++;
      }
    }

    // Calculate points and NRR for all teams
    const standings: TeamStanding[] = Array.from(standingsMap.values()).map(team => ({
      ...team,
      points: calculatePoints(team.won, team.tied, team.noResult),
      netRunRate: calculateNRR(team.runsFor, team.ballsFor, team.runsAgainst, team.ballsAgainst),
    }));

    // Sort standings
    const sortedStandings = sortStandings(standings);

    return serializeData({ success: true, standings: sortedStandings });
  } catch (error) {
    console.error('Get points table error:', error);
    return { success: false, error: (error as Error).message || 'Failed to calculate points table' };
  }
}
