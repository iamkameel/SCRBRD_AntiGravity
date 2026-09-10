import { fetchDocument, fetchCollection } from '@/lib/firestore';
import { Match, Team, Person } from '@/types/firestore';
import { MatchManagementClient } from './client';
import { notFound } from 'next/navigation';
import { where } from 'firebase/firestore';
import { fetchPreMatchProcedure } from '@/app/actions/preMatchActions';
import { fetchManagementContextAction } from '@/app/actions/preMatchActions_v2';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function MatchManagePage({ params }: PageProps) {
  const { id: matchId } = await params;

  // Fetch match data
  const match = await fetchDocument<Match>('matches', matchId);
  
  if (!match) {
    notFound();
  }

  // Fetch teams and pre-match procedure in parallel
  const [homeTeam, awayTeam, preMatchProcedure] = await Promise.all([
    fetchDocument<Team>('teams', match.homeTeamId),
    fetchDocument<Team>('teams', match.awayTeamId),
    fetchPreMatchProcedure(matchId)
  ]);

  if (!homeTeam || !awayTeam) {
    return <div>Error: Teams not found</div>;
  }

  // Fetch players for both teams
  const homePlayers = await fetchCollection<Person>('people', [
    where('teamIds', 'array-contains', match.homeTeamId)
  ]);
  
  const awayPlayers = await fetchCollection<Person>('people', [
    where('teamIds', 'array-contains', match.awayTeamId)
  ]);

  // Fetch management context (readiness, squads, availability)
  const context = await fetchManagementContextAction(matchId, match.homeTeamId);

  if (!context.success) {
    return <div>Error loading match context: {("error" in context) ? context.error : "Unknown"}</div>;
  }

  // Help TypeScript narrow the type
  const ctx = context as Extract<typeof context, { success: true }>;

  return (
    <MatchManagementClient
      match={match}
      homeTeam={homeTeam}
      awayTeam={awayTeam}
      homePlayers={homePlayers}
      awayPlayers={awayPlayers}
      context={ctx}
    />
  );
}
