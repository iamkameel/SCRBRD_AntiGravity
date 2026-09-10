"use client";

import { MatchDayTeamSheet } from "@/components/admin/MatchDayTeamSheet";
import { TransportManifestCard } from "@/components/admin/TransportManifestCard";
import { GroundskeeperWorkOrder } from "@/components/admin/GroundskeeperWorkOrder";

export default function MatchOperationsPage() {
  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8 font-['DM_Sans',sans-serif]">
      {/* Page Title Header */}
      <div className="pb-4 border-b border-white/10 space-y-1 print:hidden">
        <h1 className="text-3xl font-extrabold font-['Syne',sans-serif] text-white">Match Operations & Logistics Suite</h1>
        <p className="text-sm text-slate-400">
          Official printable team sheets, school bus transport manifests, and groundskeeper pitch clearance certificates.
        </p>
      </div>

      {/* Official Printable Team Sheet */}
      <MatchDayTeamSheet />

      {/* School Transport Manifest */}
      <div className="print:hidden">
        <TransportManifestCard />
      </div>

      {/* Pitch Clearance Work Order */}
      <div className="print:hidden">
        <GroundskeeperWorkOrder />
      </div>
    </div>
  );
}
