"use client";

import { D } from "@/lib/design-system";

// Design 2.0 §7.1 — the signature gradient behaves like light falling on a
// dark surface, not wallpaper. Static radial fields, no filters, no animation:
// the previous blurred-disc version repainted every frame on every page.
// Opacities stay low so content, not the canvas, carries the colour.
export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: [
            `radial-gradient(ellipse 55% 45% at 12% 8%, ${D.lime}14, transparent 70%)`,
            `radial-gradient(ellipse 50% 50% at 88% 30%, ${D.green}10, transparent 70%)`,
            `radial-gradient(ellipse 40% 40% at 70% 92%, ${D.cyan}0c, transparent 70%)`,
            D.bg,
          ].join(', '),
        }}
      />

      {/* Grain — keeps large flat surfaces from reading as vector-flat */}
      <div
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Tactical grid — structure hint, barely there */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${D.border} 1px, transparent 1px), linear-gradient(90deg, ${D.border} 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />
    </div>
  );
}
