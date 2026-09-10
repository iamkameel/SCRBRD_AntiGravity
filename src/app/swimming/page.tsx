"use client";

import { SwimmingGalaHub } from "@/components/sports/SwimmingGalaHub";
import { MultiSportPassportWidget } from "@/components/sports/MultiSportPassportWidget";

export default function SwimmingPage() {
  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8 font-['DM_Sans',sans-serif]">
      {/* Page Title Header */}
      <div className="pb-4 border-b border-white/10 space-y-1">
        <h1 className="text-3xl font-extrabold font-['Syne',sans-serif] text-white">Swimming Gala Engine</h1>
        <p className="text-sm text-slate-400">
          Inter-school aquatic gala management, touchpad split telemetry, and gala points leaderboard.
        </p>
      </div>

      {/* Main Swimming Gala Telemetry Hub */}
      <SwimmingGalaHub />

      {/* Multi-Sport Workload & Athlete Passport */}
      <MultiSportPassportWidget />
    </div>
  );
}
