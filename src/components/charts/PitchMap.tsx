"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PitchMapProps {
  deliveries: Array<{
    length: 'Full' | 'Good' | 'Short' | 'Yorker';
    line: 'Off Stump' | 'Middle Stump' | 'Leg Stump' | 'Wide Outside Off' | 'Wide Down Leg';
    runs: number;
    isWicket?: boolean;
  }>;
}

import { cn } from '@/lib/utils';

export function PitchMap({ deliveries }: PitchMapProps) {
  // Define pitch zones as a grid
  const lengths = ['Full', 'Good', 'Short', 'Yorker'];
  const lines = ['Wide Outside Off', 'Off Stump', 'Middle Stump', 'Leg Stump', 'Wide Down Leg'];

  // Count deliveries in each zone
  const heatmap: Record<string, number> = {};
  deliveries.forEach(delivery => {
    const key = `${delivery.length}-${delivery.line}`;
    heatmap[key] = (heatmap[key] || 0) + 1;
  });

  // Find max for color intensity
  const maxCount = Math.max(...Object.values(heatmap), 1);

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-muted/10';
    const intensity = Math.ceil((count / maxCount) * 5);
    const colors = [
      'bg-blue-100/20',
      'bg-blue-200/40',
      'bg-blue-300/60',
      'bg-blue-400/80',
      'bg-emerald-500/90',
      'bg-blue-600',
    ];
    return colors[intensity] || colors[5];
  };

  return (
    <div className={cn(
      "relative p-6 rounded-xl transition-all duration-300",
      "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800",
      "border border-slate-200 dark:border-slate-700",
      "shadow-inner hover:shadow-lg hover:border-emerald-500/30"
    )} data-testid="pitch-map">
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-blue-500/5 rounded-xl blur-xl pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-6">
          <h3 className="text-lg font-semibold tracking-tight">Pitch Map</h3>
          <p className="text-sm text-muted-foreground">Bowling Line & Length Analysis</p>
        </div>

        <div className="space-y-2">
          {/* Column Headers (Lines) */}
          <div className="grid grid-cols-6 gap-1 mb-2">
            <div className="text-xs font-medium text-center"></div>
            {lines.map(line => (
              <div key={line} className="text-[10px] uppercase tracking-wider font-semibold text-center text-muted-foreground">
                {line.split(' ').map((word, i) => (
                  <div key={i}>{word}</div>
                ))}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          {lengths.map(length => (
            <div key={length} className="grid grid-cols-6 gap-1">
              {/* Row Header (Length) */}
              <div className="text-xs font-medium flex items-center text-muted-foreground">
                {length}
              </div>
              
              {/* Zone Cells */}
              {lines.map(line => {
                const key = `${length}-${line}`;
                const count = heatmap[key] || 0;
                const wickets = deliveries.filter(
                  d => d.length === length && d.line === line && d.isWicket
                ).length;

                return (
                  <div
                    key={key}
                    className={cn(
                      "h-12 rounded border flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer backdrop-blur-sm",
                      getIntensity(count),
                      wickets > 0 ? 'ring-2 ring-red-500 border-red-500/50' : 'border-transparent'
                    )}
                    title={`${length} - ${line}: ${count} deliveries${wickets > 0 ? `, ${wickets} wicket(s)` : ''}`}
                    data-testid="pitch-cell"
                  >
                    <div className="text-center">
                      {count > 0 && (
                        <>
                          <div className={cn("font-bold text-sm", count > 2 ? "text-white" : "text-foreground")}>{count}</div>
                          {wickets > 0 && (
                            <div className="text-[10px] text-red-600 font-extrabold bg-white/90 px-1 rounded-full -mt-1 shadow-sm">W</div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-border/50">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Fewer</span>
            <div className="flex gap-1">
              <div className="w-6 h-3 bg-blue-100/20 rounded-sm"></div>
              <div className="w-6 h-3 bg-blue-300/60 rounded-sm"></div>
              <div className="w-6 h-3 bg-emerald-500/90 rounded-sm"></div>
            </div>
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
