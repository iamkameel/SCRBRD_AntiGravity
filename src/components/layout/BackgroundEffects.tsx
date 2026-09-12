"use client";

import { D } from "@/lib/design-system";

// Static, single-layer background. The previous version stacked three
// viewport-sized discs with 120–160px blur filters and animated drop-shadow on
// them, which forced a full repaint every frame on every page. Radial gradients
// give the same soft glow with no filter and no animation.
export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: [
            `radial-gradient(ellipse 50% 50% at 90% 5%, ${D.indigo}18, transparent 70%)`,
            `radial-gradient(ellipse 45% 45% at 5% 95%, ${D.rose}0a, transparent 70%)`,
            `radial-gradient(ellipse 30% 30% at 25% 35%, ${D.emerald}06, transparent 70%)`,
            D.bg,
          ].join(', '),
        }}
      />

      {/* OS Grain Unit — Strategic Texture */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Tactical Grid — UIX Spec §1.4 Background Detail */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${D.border} 1px, transparent 1px), linear-gradient(90deg, ${D.border} 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />
    </div>
  );
}
