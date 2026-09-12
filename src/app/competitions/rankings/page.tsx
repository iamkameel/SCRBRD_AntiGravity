import React from 'react';
import { Metadata } from 'next';
import { GlobalRankingsClient } from '@/components/charts/lazy';

export const metadata: Metadata = {
  title: 'School & Competition Standings | SCRBRD Cricket OS',
  description: 'Canonical authority on school cricket power rankings, standings, and historical landmarks.',
};

export default function CompetitionRankingsPage() {
  return (
    <GlobalRankingsClient />
  );
}
