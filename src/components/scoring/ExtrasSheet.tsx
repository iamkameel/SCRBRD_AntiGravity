import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ExtrasSheet({ onConfirm, onClose }: { onConfirm: (t: string, r: number) => void; onClose: () => void }) {
  const [typ, setTyp] = useState<string>('wide');
  const [runs, setRuns] = useState<number>(0);
  
  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl border-border/50 bg-background/80 backdrop-blur-2xl p-6 sm:max-w-lg mx-auto pb-8">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-1.5 rounded-full bg-border/50" />
        </div>
        
        <SheetHeader className="mb-6">
          <SheetTitle className="text-amber-500 font-black tracking-tighter text-2xl">Extras Module</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-2 gap-3 mb-8">
          {['wide', 'noball', 'bye', 'legbye'].map(t => (
            <button 
              key={t} 
              onClick={() => { setTyp(t); setRuns(t === 'wide' || t === 'noball' ? 1 : 0); }} 
              className={cn(
                "py-4 px-2 rounded-2xl text-sm font-black uppercase tracking-widest transition-all border",
                typ === t 
                  ? "bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]" 
                  : "bg-muted/10 border-border/50 hover:bg-muted/30 text-muted-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="mb-8 text-center animate-in slide-in-from-bottom-2 fade-in">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
            Additional Runs
          </div>
          <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
            {[0, 1, 2, 3, 4, 5, 6].map(r => {
              if ((typ === 'wide' || typ === 'noball') && r === 0) return null;
              if ((typ === 'bye' || typ === 'legbye') && r === 0) return null;
              return (
                <button 
                  key={r} 
                  onClick={() => setRuns(r)} 
                  className={cn(
                    "w-12 h-12 rounded-full font-black text-xl transition-all border flex items-center justify-center",
                    runs === r 
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.15)]" 
                      : "bg-muted/10 border-border hover:bg-muted/30 text-muted-foreground"
                  )}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-border/50">
          <Button 
            className="w-full h-14 rounded-xl font-black text-sm uppercase tracking-widest bg-amber-600 hover:bg-amber-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
            onClick={() => onConfirm(typ, runs)} 
            disabled={!typ || ((typ === 'bye' || typ === 'legbye') && runs === 0)}
          >
            Confirm {typ} (+{runs})
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
