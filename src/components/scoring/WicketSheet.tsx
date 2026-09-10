import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WicketSheet({ fieldingPlayers, onConfirm, onClose }: { fieldingPlayers: any[]; onConfirm: (m: string, f?: string | null) => void; onClose: () => void }) {
  const [mode, setMode] = useState<string>('bowled');
  const [f1, setF1] = useState<string | null>(null);
  const reqF = ['caught', 'stumped', 'run_out'].includes(mode);
  
  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl border-border/50 bg-background/80 backdrop-blur-2xl p-6 sm:max-w-lg mx-auto pb-8">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-1.5 rounded-full bg-border/50" />
        </div>
        <SheetHeader className="mb-6">
          <SheetTitle className="text-rose-500 font-black tracking-tighter text-2xl">Wicket Module</SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { id: 'bowled', l: 'Bowled' }, { id: 'caught', l: 'Caught' }, { id: 'lbw', l: 'LBW' },
            { id: 'stumped', l: 'Stumped' }, { id: 'run_out', l: 'Run Out' }, { id: 'hit_wicket', l: 'Hit Wicket' }
          ].map(m => (
            <button 
              key={m.id} 
              onClick={() => { setMode(m.id); setF1(null); }} 
              className={cn(
                "py-3 px-2 rounded-xl text-xs font-bold transition-all border",
                mode === m.id 
                  ? "bg-rose-500/10 border-rose-500/50 text-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.15)]" 
                  : "bg-muted/10 border-border/50 hover:bg-muted/30 text-muted-foreground"
              )}
            >
              {m.l}
            </button>
          ))}
        </div>

        {reqF && (
          <div className="mb-6 animate-in slide-in-from-bottom-2 fade-in">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Fielder (Primary)
            </div>
            <div className="grid grid-cols-3 gap-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
              {fieldingPlayers.map(p => {
                const sel = f1 === p.id;
                return (
                  <button 
                    key={p.id} 
                    onClick={() => setF1(p.id)} 
                    className={cn(
                      "py-2 px-3 rounded-lg text-left text-[11px] font-bold transition-all border",
                      sel 
                        ? "bg-rose-500/10 border-rose-500/50 text-rose-500" 
                        : "bg-transparent border-border hover:bg-muted/20 text-muted-foreground"
                    )}
                  >
                    {p.firstName[0]}. {p.lastName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-border/50">
          <Button 
            className="w-full h-14 rounded-xl font-black text-sm uppercase tracking-widest bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)] transition-all"
            onClick={() => onConfirm(mode, f1)} 
            disabled={reqF && !f1}
          >
            Confirm Wicket
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
