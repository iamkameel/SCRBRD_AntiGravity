"use client";

import { BroadcastOverlayEngine } from "@/components/media/BroadcastOverlayEngine";
import { AutomatedMatchBulletin } from "@/components/media/AutomatedMatchBulletin";

export default function MediaPage() {
  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8 font-['DM_Sans',sans-serif]">
      {/* Page Title Header */}
      <div className="pb-4 border-b border-white/10 space-y-1">
        <h1 className="text-3xl font-extrabold font-['Syne',sans-serif] text-white">Broadcast & School Media Engine</h1>
        <p className="text-sm text-slate-400">
          Live streaming overlay graphics (OBS/vMix) and automated school match news bulletins.
        </p>
      </div>

      {/* Broadcast Overlay Switcher */}
      <BroadcastOverlayEngine />

      {/* Automated School News Bulletin */}
      <AutomatedMatchBulletin />
    </div>
  );
}
