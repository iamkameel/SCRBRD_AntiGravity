import React from 'react';
import { getPlayerName } from './utils';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2 } from "lucide-react";

export function PartnershipMiniCard({ liveScore, cp, allPlayers }: { liveScore: any; cp: any; allPlayers: any[] }) {
  const part = liveScore?.partnership;
  if (!part || !cp?.strikerId) return null;
  const pRuns = (part as any).runs ?? 0;
  const pBalls = (part as any).balls ?? 0;
  const p1c = (part as any).player1Runs ?? 0;
  const p2c = (part as any).player2Runs ?? 0;
  const psum = p1c + p2c || 1;
  const pRR = pBalls > 0 ? ((pRuns / pBalls) * 6).toFixed(2) : '—';

  return (
    <Card className="bg-card/40 border-border/50 shadow-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <Link2 className="w-4 h-4 text-sky-500 shrink-0" />
            <div className="font-bold text-sm tracking-tight text-muted-foreground truncate group-hover:text-foreground transition-colors">
              <span>{getPlayerName(allPlayers, (part as any).player1Id)}</span>
              <span className="text-muted-foreground/50 mx-1.5 font-normal">&amp;</span>
              <span>{getPlayerName(allPlayers, (part as any).player2Id)}</span>
            </div>
          </div>
          
          <div className="flex items-baseline gap-4 shrink-0">
            <div className="text-center">
              <div className="font-mono text-base font-black text-foreground">{pRuns}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Runs</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-base font-black text-muted-foreground">{pBalls}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Balls</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-base font-black text-sky-500">{pRR}</div>
              <div className="text-[8px] font-black uppercase tracking-widest text-sky-500/80">RR</div>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full flex h-1.5 rounded-full overflow-hidden bg-muted/30">
          <div className="bg-gradient-to-r from-emerald-500/70 to-emerald-400" style={{ width: `${(p1c / psum) * 100}%` }} />
          <div className="w-0.5 bg-background shrink-0" />
          <div className="bg-gradient-to-r from-sky-500/70 to-sky-400" style={{ width: `${(p2c / psum) * 100}%` }} />
        </div>
        
        <div className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center mt-2.5">
          Active Partnership
        </div>
      </CardContent>
    </Card>
  );
}
