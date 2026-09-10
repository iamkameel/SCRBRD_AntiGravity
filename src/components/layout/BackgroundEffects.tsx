"use client";

import { D } from "@/lib/design-system";

export function BackgroundEffects() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      {/* OS Matrix Background */}
      <div 
        className="absolute inset-0 transition-colors duration-[2s]" 
        style={{ background: D.bg }}
      />
      
      {/* Strategic Atmospheric Core */}
      <div 
        className="absolute top-[-15%] right-[-5%] w-[50%] h-[50%] rounded-full blur-[160px] animate-pulse-glow" 
        style={{ 
            background: `${D.indigo}15`,
            animationDuration: '12s'
        }} 
      />
      
      <div 
        className="absolute bottom-[-10%] left-[-5%] w-[45%] h-[45%] rounded-full blur-[140px] animate-pulse-glow [animation-delay:4s]" 
        style={{ 
            background: `${D.rose}08`,
            animationDuration: '15s'
        }} 
      />
      
      <div 
        className="absolute top-[20%] left-[10%] w-[30%] h-[30%] rounded-full blur-[120px] animate-pulse-glow [animation-delay:8s]" 
        style={{ 
            background: `${D.emerald}05`,
            animationDuration: '18s'
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
