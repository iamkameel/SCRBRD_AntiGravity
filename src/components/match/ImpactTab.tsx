"use client";

import { Rankings, Person } from "@/types/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Zap, TrendingUp, Shield, Target } from "lucide-react";

interface ImpactTabProps {
  playerImpact: Rankings.PlayerMatchImpact[];
  players: Person[];
}

export function ImpactTab({ playerImpact, players }: ImpactTabProps) {
  const getPlayerName = (id: string) => {
    const p = players.find(p => p.id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown Player';
  };

  if (playerImpact.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed border-border bg-transparent">
        <Zap className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-20" />
        <h3 className="text-lg font-bold uppercase tracking-wider mb-2">No Impact Data Yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto">
          Impact scores are calculated in real-time as the match is scored.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {playerImpact.slice(0, 3).map((impact, index) => (
          <Card key={impact.id} className={cn(
            "bg-card border-border relative overflow-hidden",
            index === 0 && "ring-2 ring-fox-gold ring-inset"
          )}>
            {index === 0 && (
              <div className="absolute top-0 right-0 bg-fox-gold text-black text-[10px] font-black px-2 py-0.5 uppercase tracking-tighter">
                MATCH MVP
              </div>
            )}
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex justify-between">
                <span>Rank #{index + 1}</span>
                <span className="text-fox-gold flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-current" />
                  {impact.totalImpact.toFixed(1)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-lg font-black uppercase tracking-tight truncate mb-1">
                {getPlayerName(impact.personId)}
              </h3>
              <div className="flex flex-wrap gap-1 mb-4">
                {impact.badgesJson?.map(badge => (
                  <Badge key={badge} variant="secondary" className="text-[9px] h-4 uppercase font-bold bg-secondary/30">
                    {badge}
                  </Badge>
                ))}
              </div>
              
              <div className="space-y-3">
                <ImpactMetric label="Batting" value={impact.battingImpact} color="bg-fox-gold" icon={<Target className="w-3 h-3" />} />
                <ImpactMetric label="Bowling" value={impact.bowlingImpact} color="bg-fox-blue" icon={<TrendingUp className="w-3 h-3" />} />
                <ImpactMetric label="Fielding" value={impact.fieldingImpact} color="bg-emerald-500" icon={<Shield className="w-3 h-3" />} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-border">
        <div className="bg-secondary/30 p-4 border-b border-border flex justify-between items-center">
          <h3 className="text-sm font-bold uppercase tracking-widest">Full Impact Leaderboard</h3>
          <span className="text-[10px] text-muted-foreground uppercase font-medium">Points calculated via Match Context Engine</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b border-border/50 bg-background/50">
                <th className="px-4 py-3 text-left font-bold uppercase tracking-tighter text-[10px] w-12">#</th>
                <th className="px-4 py-3 text-left font-bold uppercase tracking-tighter text-[10px]">Player</th>
                <th className="px-4 py-3 text-right font-bold uppercase tracking-tighter text-[10px]">Bat</th>
                <th className="px-4 py-3 text-right font-bold uppercase tracking-tighter text-[10px]">Bowl</th>
                <th className="px-4 py-3 text-right font-bold uppercase tracking-tighter text-[10px]">Field</th>
                <th className="px-4 py-3 text-right font-bold uppercase tracking-tighter text-[10px]">Total</th>
              </tr>
            </thead>
            <tbody>
              {playerImpact.map((impact, idx) => (
                <tr key={impact.id} className="border-b border-border/50 hover:bg-secondary/10 transition-colors group">
                  <td className="px-4 py-3 font-mono font-bold text-muted-foreground">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold uppercase tracking-tight">{getPlayerName(impact.personId)}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{impact.rankInMatch === 1 ? 'Match MVP' : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(impact.battingImpact > 0 ? "text-fox-gold" : "text-muted-foreground")}>
                      {impact.battingImpact > 0 ? `+${impact.battingImpact.toFixed(1)}` : '0.0'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(impact.bowlingImpact > 0 ? "text-fox-blue" : "text-muted-foreground")}>
                      {impact.bowlingImpact > 0 ? `+${impact.bowlingImpact.toFixed(1)}` : '0.0'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={cn(impact.fieldingImpact > 0 ? "text-emerald-500" : "text-muted-foreground")}>
                      {impact.fieldingImpact > 0 ? `+${impact.fieldingImpact.toFixed(1)}` : '0.0'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-black text-fox-gold">
                    {impact.totalImpact.toFixed(1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ImpactMetric({ label, value, color, icon }: { label: string, value: number, color: string, icon: React.ReactNode }) {
  // Normalize value for progress bar (cap at 30 for visualization)
  const percent = Math.min((value / 30) * 100, 100);
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-wider">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className={cn(value > 0 ? "text-foreground" : "text-muted-foreground/50")}>
          {value.toFixed(1)}
        </span>
      </div>
      <div className="h-1 w-full bg-secondary/50 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000", color)} 
          style={{ width: `${value > 0 ? percent : 0}%` }} 
        />
      </div>
    </div>
  );
}
