"use client";

import { Rankings } from "@/types/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Zap, Sparkles, Activity, AlertTriangle, TrendingUp, Flame } from "lucide-react";
import { buildSignals, buildNarratives } from "@/lib/scoring/intelUtils";

interface ImpactHighlightsProps {
  events: Rankings.MatchImpactEvent[];
  liveScore?: any;
  overs?: number;
  target?: number;
  isChase?: boolean;
}

export function ImpactHighlights({ events, liveScore, overs = 20, target, isChase = false }: ImpactHighlightsProps) {
  const sig = liveScore ? buildSignals(liveScore, overs, target, isChase) : null;
  const narratives = sig ? buildNarratives(sig) : [];

  if (events.length === 0 && narratives.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-fox-gold" />
          Impact Highlights
        </h3>
        <span className="text-[10px] text-muted-foreground uppercase font-bold">Key Match Moments</span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar -mx-1 px-1">
        {/* Render Live Intelligence Narratives First */}
        {narratives.map((narrative, idx) => (
          <NarrativeCard key={`nar-${idx}`} narrative={narrative} />
        ))}
        
        {/* Render Event-based Impact Highlights */}
        {events.map((event, idx) => (
          <HighlightCard key={event.id || `evt-${idx}`} event={event} />
        ))}
      </div>
    </div>
  );
}

function NarrativeCard({ narrative }: { narrative: any }) {
  const isPositive = narrative.pri >= 60; // Just styling assumption
  const isExtreme = narrative.pri >= 80;

  return (
    <Card className={cn(
      "min-w-[280px] md:min-w-[320px] border-border shadow-sm transition-all group relative overflow-hidden shrink-0",
      isExtreme ? "bg-red-950/20 border-red-900/50" : "bg-card hover:bg-muted/10"
    )}>
      {/* Narrative Label */}
      <div className={cn(
        "absolute top-0 right-0 px-3 py-1 font-black text-[10px] uppercase tracking-widest rounded-bl flex items-center gap-1",
        isExtreme ? "bg-red-600 text-white" : "bg-primary/20 text-primary"
      )}>
        {narrative.icon === '🔥' ? <Flame className="w-3 h-3" /> : <Activity className="w-3 h-3" />}
        {narrative.type.replace(/_/g, ' ')}
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              Live Intelligence
              {isExtreme && (
                <>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="text-red-400">Critical</span>
                </>
              )}
            </div>
            <h4 className="text-md font-black uppercase tracking-tight leading-tight group-hover:text-primary transition-colors text-foreground line-clamp-2" style={{ color: narrative.accent }}>
              {narrative.hl}
            </h4>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {narrative.chips.map((chip: any, i: number) => (
            <Badge key={i} variant="outline" className="text-[9px] uppercase font-black px-1.5 py-0 bg-background/50 border-border">
               <span style={{ color: chip.c || 'inherit' }} className="mr-1">{chip.v}</span> 
               <span className="text-muted-foreground">{chip.l}</span>
            </Badge>
          ))}
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic border-l-2 pl-3" style={{ borderLeftColor: narrative.accent }}>
          Predictive OS signal driven by the latest match data context.
        </p>
      </CardContent>
    </Card>
  );
}

function HighlightCard({ event }: { event: Rankings.MatchImpactEvent }) {
  const isPositive = event.totalImpactValue > 0;
  
  return (
    <Card className="min-w-[280px] md:min-w-[320px] bg-card border-border hover:border-fox-gold/50 transition-all group relative overflow-hidden shrink-0">
      {/* Impact Score Badge */}
      <div className={cn(
        "absolute top-0 right-0 px-3 py-1 font-black text-sm uppercase tracking-tighter rounded-bl flex items-center gap-1",
        isPositive ? "bg-fox-gold text-black" : "bg-red-600 text-white"
      )}>
        <Zap className="w-3.5 h-3.5 fill-current" />
        {isPositive ? "+" : ""}{event.totalImpactValue.toFixed(1)}
      </div>

      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              Over {event.overNumber}.{event.ballNumber}
              <span className="w-1 h-1 rounded-full bg-border" />
              {event.phase}
            </div>
            <h4 className="text-lg font-black uppercase tracking-tight leading-tight group-hover:text-fox-gold transition-colors text-foreground">
              {event.eventType} {event.subEventType ? `• ${event.subEventType}` : ''}
            </h4>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className={cn(
            "text-[9px] uppercase font-black px-1.5 py-0 border-primary/20",
            event.pressureState === 'Extreme' || event.pressureState === 'High' ? "text-red-500 border-red-500/30 bg-red-500/5" : "text-muted-foreground"
          )}>
            {event.pressureState} Pressure
          </Badge>
          <Badge variant="secondary" className="text-[9px] uppercase font-black px-1.5 py-0 bg-secondary/50">
            {event.pressureMultiplier.toFixed(1)}x Multiplier
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 italic border-l-2 border-fox-gold/30 pl-3">
          {event.explanation || `This ${event.eventType.toLowerCase()} significantly shifted the match momentum in the ${event.phase.toLowerCase()} phase.`}
        </p>
      </CardContent>
    </Card>
  );
}
