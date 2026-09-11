import React, { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, TrendingUp, Users, Target, Award, Zap, ChevronLeft, ChevronRight } from 'lucide-react';

export interface InsightCard {
  id: string;
  category: 'PARTNERSHIP' | 'MOMENTUM' | 'MATCHUP' | 'MILESTONE' | 'PROJECTION';
  headline: string;
  subtext?: string;
  accentColor: string; // hex or Tailwind color class
  icon?: React.ReactNode;
  metrics: { label: string; value: string | number; color?: string }[];
}

export interface IntelligenceRibbonProps {
  cards?: InsightCard[];
  autoRotateIntervalMs?: number;
  className?: string;
}

export function IntelligenceRibbon({
  cards,
  autoRotateIntervalMs = 6000,
  className,
}: IntelligenceRibbonProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Default rich insights if none provided
  const defaultCards: InsightCard[] = [
    {
      id: 'partnership-1',
      category: 'PARTNERSHIP',
      headline: '4th Wicket Partnership: 43 Runs (27 balls)',
      subtext: 'Current partnership RR: 9.56 runs/over',
      accentColor: '#10b981',
      icon: <Users className="w-4 h-4 text-emerald-400" />,
      metrics: [
        { label: 'LEWIS', value: '28 (16)' },
        { label: 'HALL', value: '15 (11)' },
        { label: 'DOT %', value: '22%' },
      ],
    },
    {
      id: 'momentum-1',
      category: 'MOMENTUM',
      headline: 'Batting Surge in Last 3 Overs',
      subtext: '34 runs scored off last 18 deliveries',
      accentColor: '#3b82f6',
      icon: <TrendingUp className="w-4 h-4 text-blue-400" />,
      metrics: [
        { label: 'BOUNDARIES', value: '4x4, 2x6' },
        { label: 'PHASE RPO', value: '11.3' },
        { label: 'WIN PROB', value: '68%' },
      ],
    },
    {
      id: 'matchup-1',
      category: 'MATCHUP',
      headline: 'Lewis vs Mkhize H2H',
      subtext: '21 runs off 13 balls • 0 dismissals',
      accentColor: '#a855f7',
      icon: <Target className="w-4 h-4 text-purple-400" />,
      metrics: [
        { label: 'STRIKE RATE', value: '161.5' },
        { label: 'CONTROL %', value: '85%' },
        { label: 'DOMINANT ZONE', value: 'Mid-Wicket' },
      ],
    },
    {
      id: 'projection-1',
      category: 'PROJECTION',
      headline: 'Projected Total: 184 Runs',
      subtext: 'At current rate of 8.25 RPO',
      accentColor: '#f59e0b',
      icon: <Sparkles className="w-4 h-4 text-amber-400" />,
      metrics: [
        { label: 'CURRENT RR', value: '8.25' },
        { label: 'AT 10.0 RPO', value: '198' },
        { label: 'DLS PAR', value: '142' },
      ],
    },
  ];

  const insightCards = cards && cards.length > 0 ? cards : defaultCards;

  useEffect(() => {
    if (insightCards.length <= 1) return;
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % insightCards.length);
      setAnimKey((k) => k + 1);
    }, autoRotateIntervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [insightCards.length, autoRotateIntervalMs]);

  if (insightCards.length === 0) return null;

  const current = insightCards[Math.min(activeIndex, insightCards.length - 1)];

  return (
    <div
      className={cn(
        "w-full bg-slate-950/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-lg transition-all duration-300",
        className
      )}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-stretch min-h-[52px] px-3 sm:px-4 py-2">
        {/* Left: Category Badge & Icon */}
        <div className="flex items-center gap-2 border-r border-white/10 pr-3 my-1 shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center border"
            style={{
              backgroundColor: `${current.accentColor}15`,
              borderColor: `${current.accentColor}30`,
            }}
          >
            {current.icon || <Sparkles className="w-4 h-4" style={{ color: current.accentColor }} />}
          </div>
          <div className="hidden sm:flex flex-col">
            <span
              className="text-[9px] font-black uppercase tracking-widest leading-tight"
              style={{ color: current.accentColor }}
            >
              {current.category}
            </span>
            <span className="text-[9px] font-bold text-muted-foreground">INTELLIGENCE</span>
          </div>
        </div>

        {/* Center: Dynamic Headline & Metrics (Animated Fade) */}
        <div
          key={animKey}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3 sm:px-4 overflow-hidden animate-in fade-in duration-500"
        >
          <div className="flex flex-col min-w-0">
            <div className="text-xs sm:text-sm font-extrabold text-white truncate tracking-tight">
              {current.headline}
            </div>
            {current.subtext && (
              <div className="text-[10px] text-muted-foreground truncate font-medium">
                {current.subtext}
              </div>
            )}
          </div>

          {/* Micro Metrics Chips */}
          <div className="flex items-center gap-3 shrink-0 overflow-x-auto">
            {current.metrics.map((m, idx) => (
              <div
                key={idx}
                className="flex items-baseline gap-1 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md"
              >
                <span className="text-[9px] font-extrabold uppercase text-muted-foreground tracking-wider">
                  {m.label}
                </span>
                <span
                  className="font-mono text-xs font-black"
                  style={{ color: m.color || current.accentColor }}
                >
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Dot Pagination Controls */}
        <div className="flex items-center gap-1.5 border-l border-white/10 pl-3 my-1 shrink-0">
          <button
            onClick={() => {
              setActiveIndex((prev) => (prev - 1 + insightCards.length) % insightCards.length);
              setAnimKey((k) => k + 1);
            }}
            className="p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-white transition"
            title="Previous insight"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1">
            {insightCards.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveIndex(i);
                  setAnimKey((k) => k + 1);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === activeIndex ? "w-4" : "w-1.5 opacity-40 hover:opacity-80"
                )}
                style={{
                  backgroundColor: i === activeIndex ? current.accentColor : '#ffffff',
                }}
              />
            ))}
          </div>

          <button
            onClick={() => {
              setActiveIndex((prev) => (prev + 1) % insightCards.length);
              setAnimKey((k) => k + 1);
            }}
            className="p-1 hover:bg-white/10 rounded text-muted-foreground hover:text-white transition"
            title="Next insight"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dynamic Accent Line */}
      <div
        className="h-0.5 transition-all duration-500"
        style={{
          background: `linear-gradient(90deg, ${current.accentColor}, ${current.accentColor}55, transparent)`,
        }}
      />
    </div>
  );
}
