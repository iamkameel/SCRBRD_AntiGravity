import { redirect, notFound } from 'next/navigation';
import { fetchPersonById, fetchDocument } from "@/lib/firestore";
import { PlayerDetailClient } from "@/components/players/PlayerDetailClient";
import { RewardsWallet } from "@/types/rewards";
import { getPlayerAssessmentsAction, getPlayerReadinessAction } from "@/app/actions/skillActions";

export default async function PlayerProfilePage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  if (!id) {
    notFound();
  }

  const [person, wallet, assessments, readiness] = await Promise.all([
    fetchPersonById(id),
    fetchDocument<RewardsWallet>('rewards_wallets', id),
    getPlayerAssessmentsAction(id),
    getPlayerReadinessAction(id)
  ]);
  
  if (!person) {
    notFound();
  }
  
  // Verify this person is actually a player
  const isPlayer = person.role?.toLowerCase().includes('player') || person.role === 'Player';
  
  if (!isPlayer) {
    // Not a player, redirect to generic people page
    redirect(`/people/${id}`);
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
