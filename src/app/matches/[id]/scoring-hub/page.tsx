import { getMatchDetailsAction, getTeamSquadAction } from '@/app/actions/matchActions';
import { ScoringHubClient } from './client';
import { notFound } from 'next/navigation';

interface ScoringHubPageProps {
  params: Promise<{ id: string }>;
}

export default async function ScoringHubPage({ params }: ScoringHubPageProps) {
  const { id } = await params;
  const match = await getMatchDetailsAction(id);

  if (!match) {
    notFound();
  }

  const [homePlayers, awayPlayers] = await Promise.all([
    getTeamSquadAction(match.homeTeamId),
    getTeamSquadAction(match.awayTeamId),
  ]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ScoringHubClient 
        match={match}
        homePlayers={homePlayers}
        awayPlayers={awayPlayers}
      />
    </div>
  );
}
