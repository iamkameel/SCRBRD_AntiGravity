import React from 'react';
import { getPlayerName } from './utils';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function BattingSummaryCard({
  cp,
  striker,
  nonStriker,
  allPlayers,
  onStrikerClick,
  onNonStrikerClick
}: {
  cp: any;
  striker: any;
  nonStriker: any;
  allPlayers: any[];
  onStrikerClick: () => void;
  onNonStrikerClick: () => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Card 
        onClick={onStrikerClick} 
        className="cursor-pointer bg-card/40 hover:bg-card/80 transition-all border-emerald-500/20 shadow-sm relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <CardContent className="p-3">
          <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 border-emerald-500/20 bg-emerald-500/10 rounded-sm px-1.5 py-0 mb-1.5 flex flex-row items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            Striker
          </Badge>
          <div className="font-bold text-sm tracking-tight text-foreground truncate mb-0.5 group-hover:text-emerald-400 transition-colors">
            {getPlayerName(allPlayers, cp?.strikerId)}
          </div>
          {striker && (
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-black font-mono text-lg leading-none drop-shadow-sm">{striker.runs}</span>
              <span className="text-xs text-muted-foreground/60 font-mono">({striker.ballsFaced})</span>
              <span className={cn(
                "ml-auto text-[10px] font-bold tracking-wider",
                (striker.strikeRate ?? 0) > 150 ? "text-emerald-500" : "text-muted-foreground"
              )}>
                {striker.strikeRate?.toFixed(0)} <span className="text-muted-foreground/60 text-[8px] uppercase">SR</span>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <Card 
        onClick={onNonStrikerClick} 
        className="cursor-pointer bg-card/40 hover:bg-card/80 transition-all border-border/50 shadow-sm relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <CardContent className="p-3">
          <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground border-border/50 bg-muted/10 rounded-sm px-1.5 py-0 mb-1.5 flex flex-row items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full border border-muted-foreground" />
            Non-Striker
          </Badge>
          <div className="font-bold text-sm tracking-tight text-foreground truncate mb-0.5 group-hover:text-white transition-colors">
            {getPlayerName(allPlayers, cp?.nonStrikerId)}
          </div>
          {nonStriker && (
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="font-black font-mono text-lg leading-none text-muted-foreground drop-shadow-sm">{nonStriker.runs}</span>
              <span className="text-xs text-muted-foreground/40 font-mono">({nonStriker.ballsFaced})</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
