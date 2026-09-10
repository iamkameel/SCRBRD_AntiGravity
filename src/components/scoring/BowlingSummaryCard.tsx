import React from 'react';
import { getPlayerName, Econ } from './utils';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function BowlingSummaryCard({ cp, bowler, allPlayers, onBowlerClick }: { cp: any; bowler: any; allPlayers: any[]; onBowlerClick: () => void }) {
  return (
    <Card 
      onClick={onBowlerClick} 
      className="cursor-pointer bg-card/40 hover:bg-card/80 transition-all border-border/50 shadow-sm relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <Badge variant="outline" className="w-fit text-[9px] font-black uppercase tracking-[0.2em] text-sky-500 border-sky-500/20 bg-sky-500/10 rounded-sm px-1.5 py-0">
            Bowling
          </Badge>
          <div className="font-bold text-sm text-foreground tracking-tight group-hover:text-sky-400 transition-colors">
            {getPlayerName(allPlayers, cp?.bowlerId)}
          </div>
        </div>
        
        {bowler && (
          <div className="text-right flex flex-col gap-1 items-end">
            <div className="font-black font-mono text-lg text-foreground drop-shadow-sm leading-none">
              <span className="text-sky-500 mr-1">{bowler.wickets}</span>
              <span className="text-muted-foreground/50 font-sans mx-0.5">-</span>
              <span>{bowler.runsConceded}</span>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>{bowler.overs} <span className="text-muted-foreground/60">ov</span></span>
              <span className="w-1 h-1 rounded-full bg-border" />
              <span>{Econ(bowler.runsConceded, Math.round(parseFloat(String(bowler.overs || 0)) * 6))} <span className="text-muted-foreground/60">econ</span></span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
