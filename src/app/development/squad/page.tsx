'use client';

import React from 'react';
import { SquadDevelopmentDashboard } from '@/components/coaches/SquadDevelopmentDashboard';

export default function SquadDevelopmentPage() {
  return (
    <main className="min-h-screen bg-[#05080f] text-[#f3f5ef] font-sans p-6 space-y-6 max-w-6xl mx-auto">
      <SquadDevelopmentDashboard />
    </main>
  );
}
