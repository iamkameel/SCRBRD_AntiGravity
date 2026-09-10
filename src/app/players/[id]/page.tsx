import { redirect, notFound } from 'next/navigation';
import { fetchPersonById, fetchDocument } from "@/lib/firestore";
import { PlayerDetailClient } from "@/components/players/PlayerDetailClient";
import { RewardsWallet } from "@/types/rewards";
import { getPlayerAssessmentsAction, getPlayerReadinessAction } from "@/app/actions/skillActions";

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const [person, wallet, assessments, readiness] = await Promise.all([
    fetchPersonById(params.id),
    fetchDocument<RewardsWallet>('rewards_wallets', params.id),
    getPlayerAssessmentsAction(params.id),
    getPlayerReadinessAction(params.id)
  ]);
  
  if (!person) {
    notFound();
  }
  
  // Verify this person is actually a player
  const isPlayer = person.role?.toLowerCase().includes('player') || person.role === 'Player';
  
  if (!isPlayer) {
    // Not a player, redirect to generic people page
    redirect(`/people/${params.id}`);
  }
  
  return (
    <PlayerDetailClient 
      player={person} 
      rewardsWallet={wallet || undefined} 
      assessments={assessments.success ? assessments.assessments : []}
      readiness={readiness.success ? (readiness.readiness || undefined) : undefined}
    />
  );
}
