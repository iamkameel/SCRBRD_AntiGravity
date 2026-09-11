/**
 * Live scoring route — renders the full MatchScoringInterface.
 * This is the second (more complete) scoring engine, revived and wired here.
 */
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MatchScoringInterface } from '@/components/scoring/MatchScoringInterface';
import { notFound } from 'next/navigation';

export default async function MatchScoringPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const matchId = params.id;

  const matchRef = doc(db, 'matches', matchId);
  const matchSnap = await getDoc(matchRef);

  if (!matchSnap.exists()) {
    notFound();
  }

  const data = matchSnap.data();

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <MatchScoringInterface
        matchId={matchId}
        initialData={data}
        homeTeamName={data?.homeTeamName ?? data?.homeTeam ?? 'Home Team'}
        awayTeamName={data?.awayTeamName ?? data?.awayTeam ?? 'Away Team'}
        currentInnings={(data?.liveScore?.innings?.currentInnings ?? 1) as 1 | 2}
      />
    </div>
  );
}
