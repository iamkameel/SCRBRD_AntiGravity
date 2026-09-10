"use client";

import { use } from 'react';
import { PublicLiveMatchCenter } from "@/components/live/PublicLiveMatchCenter";

interface LiveMatchPageProps {
  params: Promise<{ fixtureId: string }>;
}

export default function LiveMatchPage({ params }: LiveMatchPageProps) {
  const resolvedParams = use(params);

  return (
    <div className="container mx-auto py-8 max-w-5xl space-y-6 font-['DM_Sans',sans-serif]">
      <PublicLiveMatchCenter fixtureId={resolvedParams.fixtureId} />
    </div>
  );
}
