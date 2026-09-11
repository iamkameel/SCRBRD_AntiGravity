"use client";

import { PreMatchReadinessBoard } from "@/components/prematch/PreMatchReadinessBoard";

export default function StandalonePreMatchPage() {
  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-6">
      <PreMatchReadinessBoard 
        matchId="match-101"
        homeTeamName="Westville 1st XI"
        awayTeamName="Kearsney 1st XI"
      />
    </div>
  );
}
