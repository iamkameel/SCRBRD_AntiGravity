"use client";

import { AthleticsMeetHub } from "@/components/sports/AthleticsMeetHub";
import { MultiSportPassportWidget } from "@/components/sports/MultiSportPassportWidget";

export default function AthleticsPage() {
  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8 font-['DM_Sans',sans-serif]">
      {/* Page Title Header */}
      <div className="pb-4 border-b border-white/10 space-y-1">
        <h1 className="text-3xl font-extrabold font-['Syne',sans-serif] text-white">Athletics Track & Field Engine</h1>
        <p className="text-sm text-slate-400">
          Inter-school athletics meet manager, field event clearance grids, and wind gauge telemetry.
        </p>
      </div>

      {/* Main Athletics Meet Engine Hub */}
      <AthleticsMeetHub />

      {/* Multi-Sport Workload & Athlete Passport */}
      <MultiSportPassportWidget />
    </div>
  );
}
