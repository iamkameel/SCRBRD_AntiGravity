'use server';

import admin from '@/lib/firebase-admin';
import { Match } from '@/types/firestore';
import { requireUser } from '@/lib/auth/session';

export interface BracketMatch {
  id: string;
  round: string;
  position: number;
  team1Id?: string;
  team2Id?: string;
  team1Name?: string;
  team2Name?: string;
  team1Score?: string;
  team2Score?: string;
  winnerId?: string;
  matchId?: string;
  status: 'pending' | 'scheduled' | 'completed';
}

export interface TournamentBracket {
  leagueId: string;
  rounds: {
    [key: string]: BracketMatch[];
  };
}

export async function generateKnockoutFixturesAction(
  leagueId: string,
  teamIds: string[]
): Promise<{ success: boolean; bracket?: TournamentBracket; error?: string }> {
  try {
      await requireUser('competitions');
    const numTeams = teamIds.length;

    // Validate power of 2
    if (![4, 8, 16].includes(numTeams)) {
      return { success: false, error: 'Number of teams must be 4, 8, or 16' };
    }

    // Fetch team details
    const teams = await Promise.all(
      teamIds.map(async (id) => {
        const doc = await admin.firestore().collection('teams').doc(id).get();
        return { id, name: doc.data()?.name || 'Unknown Team' };
      })
    );

    // Determine rounds
    const rounds: string[] = [];
    if (numTeams === 16) rounds.push('Round of 16');
    if (numTeams >= 8) rounds.push('Quarter Finals');
    rounds.push('Semi Finals', 'Final');

    const bracket: TournamentBracket = {
      leagueId,
      rounds: {},
    };

    // Generate first round matches
    const firstRound = rounds[0];
    const matchesInFirstRound = numTeams / 2;

    bracket.rounds[firstRound] = [];
    for (let i = 0; i < matchesInFirstRound; i++) {
      const team1 = teams[i * 2];
      const team2 = teams[i * 2 + 1];

      bracket.rounds[firstRound].push({
        id: `${firstRound}-${i}`,
        round: firstRound,
        position: i,
        team1Id: team1.id,
        team2Id: team2.id,
        team1Name: team1.name,
        team2Name: team2.name,
        status: 'pending',
      });
    }

    // Generate subsequent rounds (empty matches)
    for (let r = 1; r < rounds.length; r++) {
      const round = rounds[r];
      const matchesInRound = Math.pow(2, rounds.length - r - 1);

      bracket.rounds[round] = [];
      for (let i = 0; i < matchesInRound; i++) {
        bracket.rounds[round].push({
          id: `${round}-${i}`,
          round,
          position: i,
          status: 'pending',
        });
      }
    }

    // Save bracket to Firestore
    await admin.firestore()
      .collection('leagues')
      .doc(leagueId)
      .collection('bracket')
      .doc('current')
      .set(bracket);

    return { success: true, bracket };
  } catch (error) {
    console.error('Generate knockout fixtures error:', error);
    return { success: false, error: (error as Error).message || 'Failed to generate fixtures' };
  }
}

export async function getTournamentBracketAction(
  leagueId: string
): Promise<{ success: boolean; bracket?: TournamentBracket; error?: string }> {
  try {
    const bracketDoc = await admin.firestore()
      .collection('leagues')
      .doc(leagueId)
      .collection('bracket')
      .doc('current')
      .get();

    if (!bracketDoc.exists) {
      return { success: false, error: 'No bracket found for this league' };
    }

    const bracket = bracketDoc.data() as TournamentBracket;

    // Update match statuses based on actual matches
    const matchesSnapshot = await admin.firestore()
      .collection('matches')
      .where('leagueId', '==', leagueId)
      .get();

    const matches = matchesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));

    // Update bracket with match results
    for (const round in bracket.rounds) {
      for (const bracketMatch of bracket.rounds[round]) {
        const match = matches.find(m => m.id === bracketMatch.matchId);
        if (match) {
          bracketMatch.status = match.status === 'completed' ? 'completed' : 'scheduled';
          bracketMatch.team1Score = match.score?.home;
          bracketMatch.team2Score = match.score?.away;

          if (match.completion?.winner) {
            if (match.completion.winner === 'home') {
              bracketMatch.winnerId = bracketMatch.team1Id;
            } else if (match.completion.winner === 'away') {
              bracketMatch.winnerId = bracketMatch.team2Id;
            }
          }
        }
      }
    }

    return { success: true, bracket };
  } catch (error) {
    console.error('Get tournament bracket error:', error);
    return { success: false, error: (error as Error).message || 'Failed to fetch bracket' };
  }
}

export async function seedTeamsFromStandingsAction(
  leagueId: string
): Promise<{ success: boolean; teamIds?: string[]; error?: string }> {
  try {
      await requireUser('competitions');
    // Get standings
    const { getPointsTableAction } = await import('./pointsTableActions');
    const standingsResult = await getPointsTableAction(leagueId, undefined);

    if (!standingsResult.success || !standingsResult.standings) {
      return { success: false, error: 'Failed to fetch standings' };
    }

    // Get top teams (8 or 16)
    const teamIds = standingsResult.standings
      .slice(0, 8)
      .map(team => team.teamId);

    return { success: true, teamIds };
  } catch (error) {
    console.error('Seed teams error:', error);
    return { success: false, error: (error as Error).message || 'Failed to seed teams' };
  }
}
