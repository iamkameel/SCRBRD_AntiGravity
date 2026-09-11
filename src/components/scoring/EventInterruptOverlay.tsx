import React from 'react';
import { cn } from '@/lib/utils';
import { Trophy, Zap, AlertTriangle, XCircle, Flame } from 'lucide-react';

export interface EventInterrupt {
  type: 'WICKET' | 'MILESTONE_50' | 'MILESTONE_100' | 'HAT_TRICK_BALL' | 'PRESSURE_SPIKE';
  title: string;
  subtitle?: string;
  playername?: string;
  statsText?: string;
}

export interface EventInterruptOverlayProps {
  interrupt: EventInterrupt | null;
  onDismiss?: () => void;
}

export function EventInterruptOverlay({ interrupt, onDismiss }: EventInterruptOverlayProps) {
  if (!interrupt) return null;

  const isWicket = interrupt.type === 'WICKET';
  const isMilestone = interrupt.type === 'MILESTONE_50' || interrupt.type === 'MILESTONE_100';
  const isHatTrick = interrupt.type === 'HAT_TRICK_BALL';
  const isPressure = interrupt.type === 'PRESSURE_SPIKE';

  let bgClass = 'bg-slate-900 border-white/20 text-white';
  let icon = <Zap className="w-6 h-6 text-white" />;

  if (isWicket) {
    bgClass = 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 border-rose-400/60 text-white shadow-[0_0_40px_rgba(225,29,72,0.6)]';
    icon = <XCircle className="w-7 h-7 text-white animate-bounce" />;
  } else if (isMilestone) {
    bgClass = 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 border-amber-300 text-slate-950 shadow-[0_0_40px_rgba(245,158,11,0.6)]';
    icon = <Trophy className="w-7 h-7 text-slate-950 animate-bounce" />;
  } else if (isHatTrick) {
    bgClass = 'bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 border-purple-300 text-white shadow-[0_0_40px_rgba(147,51,234,0.6)]';
    icon = <Flame className="w-7 h-7 text-yellow-300 animate-pulse" />;
  } else if (isPressure) {
    bgClass = 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 border-orange-400 text-white shadow-[0_0_30px_rgba(234,88,12,0.5)]';
    icon = <AlertTriangle className="w-7 h-7 text-white animate-pulse" />;
  }

  return (
    <div className="w-full relative z-[100] my-3 animate-in zoom-in-95 fade-in duration-300">
      <div
        className={cn(
          "w-full rounded-2xl border p-4 sm:p-5 flex items-center justify-between gap-4 overflow-hidden relative",
          bgClass
        )}
      >
        {/* Glow Shimmer Background */}
        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <div className="p-3 rounded-full bg-white/20 backdrop-blur-md shrink-0 shadow">
            {icon}
          </div>

          <div className="flex flex-col">
            <div className="text-xs font-black uppercase tracking-[0.25em] opacity-90">
              {interrupt.type.replace('_', ' ')}
            </div>
            <div className="text-xl sm:text-2xl font-black tracking-tight drop-shadow leading-tight">
              {interrupt.title}
            </div>
            {interrupt.subtitle && (
              <div className="text-xs sm:text-sm font-semibold opacity-90 mt-0.5">
                {interrupt.subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Right Stats & Manual Dismiss */}
        <div className="flex items-center gap-3 relative z-10 shrink-0">
          {interrupt.statsText && (
            <div className="hidden sm:flex flex-col items-end px-3 py-1.5 rounded-xl bg-black/20 backdrop-blur-md border border-white/20">
              <span className="text-[10px] font-black uppercase tracking-wider opacity-75">STAT</span>
              <span className="font-mono text-sm font-black">{interrupt.statsText}</span>
            </div>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-2 rounded-full hover:bg-black/20 text-white/80 hover:text-white transition"
              title="Dismiss banner"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
