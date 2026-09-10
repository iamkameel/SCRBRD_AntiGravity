import React, { useEffect, useRef, useState } from 'react';
import { buildSignals, buildNarratives } from '@/lib/scoring/intelUtils';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function DynamicInsightBar({ liveScore, overs, target, isChase }: { liveScore: any; overs: number; target?: number; isChase: boolean }) {
  const [cardIdx, setCardIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const sig = buildSignals(liveScore, overs, target, isChase);
  const cards = buildNarratives(sig);

  useEffect(() => {
    if (!cards.length) return;
    timerRef.current = setInterval(() => {
      setCardIdx(p => (p + 1) % cards.length);
      setAnimKey(k => k + 1);
    }, 7000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [cards.length, sig?.balls]);

  if (!sig || !cards.length) return null;
  const card = cards[Math.min(cardIdx, cards.length - 1)] || cards[0];
  
  const phaseColClass = sig.phase === 'POWERPLAY' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 
                        sig.phase === 'MIDDLE' ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 
                        'text-orange-500 bg-orange-500/10 border-orange-500/20';

  const fmtOv = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`;

  return (
    <div className="sticky top-[49px] z-[95] bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
      <div className="grid grid-cols-[auto_1fr_auto] items-stretch min-h-[52px]">
        {/* Left — RR */}
        <div className="flex items-center border-r border-border px-3 gap-0 shrink-0">
          <div className="text-center px-2 border-r border-border/50">
            <div className={cn(
               "font-mono text-lg font-medium leading-none",
               isChase ? (sig.rrDelta != null && sig.rrDelta < -1 ? 'text-rose-500' : 'text-emerald-500') : 'text-sky-500'
            )}>{sig.rr}</div>
            <div className="text-[7px] font-bold tracking-widest uppercase text-muted-foreground mt-0.5">CRR</div>
          </div>
          {isChase && sig.reqRr != null && (
            <div className="text-center px-2 border-r border-border/50">
              <div className={cn(
                 "font-mono text-lg font-medium leading-none",
                 sig.rrDelta !== null && sig.rrDelta < -1 ? 'text-rose-500' : sig.rrDelta !== null && sig.rrDelta > 0.5 ? 'text-emerald-500' : 'text-amber-500'
              )}>{sig.reqRr}</div>
              <div className="text-[7px] font-bold tracking-widest uppercase text-muted-foreground mt-0.5">RRR</div>
            </div>
          )}
          <div className="px-2 flex flex-col items-center gap-1">
            <div className={cn(
              "text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-full border",
              phaseColClass
            )}>{sig.phase}</div>
            <div className="font-mono text-[8px] text-muted-foreground">{fmtOv(sig.balls)} ov</div>
          </div>
        </div>

        {/* Centre — narrative */}
        <div key={animKey} className="flex items-center gap-2.5 px-3 py-2 overflow-hidden animate-in fade-in duration-500">
          {card.icon && <span className="text-sm shrink-0">{card.icon}</span>}
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold whitespace-nowrap overflow-hidden text-ellipsis leading-tight" style={{ color: card.accent }}>{card.hl}</div>
            <div className="flex gap-2 mt-1 flex-nowrap overflow-hidden">
              {card.chips.slice(0, 3).map((chip: any, i: number) => (
                <div key={i} className="flex items-baseline gap-1 shrink-0">
                  <span className="font-mono text-xs font-medium leading-none text-foreground" style={{ color: chip.c || 'inherit' }}>{chip.v}</span>
                  <span className="text-[7px] font-bold tracking-widest uppercase text-muted-foreground">{chip.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — micro bars */}
        <div className="flex items-center gap-1.5 border-l border-border px-2.5 shrink-0">
          <div className="flex flex-col items-center gap-1 w-[34px]">
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500 ease-out" 
                   style={{ width: Math.min(100, Math.max(0, 50 + sig.mom / 2)) + '%', backgroundColor: sig.momColor }} />
            </div>
            <span className="text-[7px] font-bold tracking-widest uppercase" style={{ color: sig.momColor }}>{sig.momLabel}</span>
          </div>
          <div className="flex flex-col items-center gap-1 w-[34px]">
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500 ease-out" 
                   style={{ width: sig.pressure + '%', backgroundColor: sig.pressureColor }} />
            </div>
            <span className="text-[7px] font-bold tracking-widest uppercase" style={{ color: sig.pressureColor }}>{sig.pressureLabel}</span>
          </div>
          
          {cards.length > 1 && (
            <div className="flex flex-col gap-1 ml-1">
              {cards.slice(0, 5).map((_: any, i: number) => (
                <button 
                  key={i} 
                  onClick={() => { setCardIdx(i); setAnimKey(k => k + 1); }}
                  className="h-1 rounded-full border-none p-0 cursor-pointer transition-all duration-250"
                  style={{
                    width: i === cardIdx ? '12px' : '4px',
                    backgroundColor: i === cardIdx ? (cards[i]?.accent || '#6366f1') : 'hsl(var(--muted-foreground)/0.3)'
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="h-[1.5px] transition-colors duration-500" style={{ background: `linear-gradient(90deg, ${card.accent}, ${card.accent}55, transparent)` }} />
    </div>
  );
}
