import React from 'react';
import { cn } from "@/lib/utils";

interface ScoreOverlayProps {
  battingTeam: {
    name: string;
    shortName: string;
    score: string; // e.g. "120/3"
    overs: string; // e.g. "17.2"
    color: string; // Tailwind class or hex
    logo?: string;
  };
  bowlingTeam: {
    name: string;
    shortName: string;
    score?: string; // e.g. "118 ao" (if chasing)
    color: string;
  };
  matchStatus: string; // e.g. "AUS need 15 runs to win"
  recentBalls?: string[]; // e.g. ["1", "0", "4", "W", "1", "6"]
  className?: string;
}

export function ScoreOverlay({
  battingTeam,
  bowlingTeam,
  matchStatus,
  recentBalls = [],
  className
}: ScoreOverlayProps) {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 flex flex-col p-4 md:p-6 pb-0 pointer-events-none",
      "animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out",
      className
    )}>
      {/* Main Score Bar */}
      <div className="glass-morphism-premium rounded-t-3xl border-t-4 border-emerald-500 text-foreground px-6 py-4 flex flex-col md:flex-row items-center justify-between mx-auto w-full max-w-5xl shadow-[0_-10px_40px_rgba(34,197,94,0.15)] pointer-events-auto">
        
        {/* Left: Batting Team */}
        <div className="flex items-center gap-4">
          <div className={cn("px-3 py-1 rounded font-bold text-lg tracking-wider", battingTeam.color)}>
            {battingTeam.shortName}
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold leading-none">{battingTeam.score}</span>
            <span className="text-sm text-gray-400 font-medium">Overs: {battingTeam.overs}</span>
          </div>
        </div>

        {/* Center: Match Status / Target */}
        <div className="hidden md:flex flex-col items-center justify-center text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-fox-blue">
            {matchStatus}
          </span>
          {/* Recent Balls (Desktop) */}
          <div className="flex items-center gap-1 mt-1">
            {recentBalls.map((ball, idx) => (
              <span 
                key={idx} 
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold",
                  ball === '4' ? "bg-fox-blue text-white" :
                  ball === '6' ? "bg-fox-gold text-black" :
                  ball === 'W' ? "bg-red-600 text-white" :
                  "bg-gray-800 text-gray-300"
                )}
              >
                {ball}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Bowling Team */}
        <div className="flex items-center gap-4 text-right">
          <div className="flex flex-col">
            <span className="text-xl font-bold text-gray-300">{bowlingTeam.shortName}</span>
            {bowlingTeam.score && (
              <span className="text-sm text-gray-500">{bowlingTeam.score}</span>
            )}
          </div>
          <div className={cn("w-2 h-8 rounded-full", bowlingTeam.color)}></div>
        </div>
      </div>

      {/* Mobile Recent Balls (if needed, or just hide on very small screens) */}
      <div className="md:hidden bg-black/90 px-4 py-1 flex justify-center gap-2 overflow-x-auto">
         {recentBalls.slice(-6).map((ball, idx) => (
            <span 
              key={idx} 
              className={cn(
                "w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold",
                ball === '4' ? "bg-fox-blue text-white" :
                ball === '6' ? "bg-fox-gold text-black" :
                ball === 'W' ? "bg-red-600 text-white" :
                "bg-gray-800 text-gray-300"
              )}
            >
              {ball}
            </span>
          ))}
      </div>
    </div>
  );
}
