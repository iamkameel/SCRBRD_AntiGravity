import { getMatchDetailsAction, getTeamSquadAction } from '@/app/actions/matchActions';
import { ScoringHubClient } from './client';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { RouteGuard } from '@/components/auth/RouteGuard';

interface ScoringHubPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Scoring Hub — SCRBRD',
};

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
    <RouteGuard module="scoring" label="Live Scoring Hub" fallbackRoute={`/matches/${id}`}>
      <ScoringHubClient
        match={match}
        homePlayers={homePlayers}
        awayPlayers={awayPlayers}
      />
    </RouteGuard>
  );
}
