import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ShotSelectorSheet({ current, onSelect, onClose }: { current: string | null; onSelect: (id: string | null) => void; onClose: () => void }) {
  const SHOT_CATEGORIES = require('./constants').SHOT_CATEGORIES;
  
  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl border-border/50 bg-background/80 backdrop-blur-2xl p-6 sm:max-w-xl mx-auto pb-8 h-[85vh] flex flex-col">
        <div className="flex justify-center mb-2 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-border/50" />
        </div>
        
        <SheetHeader className="mb-6 shrink-0">
          <SheetTitle className="text-foreground font-black tracking-tighter text-2xl">Shot Selection</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-8 overflow-y-auto custom-scrollbar flex-1 pr-2 pb-4">
          {SHOT_CATEGORIES.map((cat: any) => (
            <div key={cat.cat} className="space-y-3">
              <div 
                className="text-[10px] font-black tracking-[0.2em] uppercase"
                style={{ color: cat.color }}
              >
                {cat.cat}
              </div>
              <div className="flex flex-wrap gap-2">
                {cat.shots.map((s: any) => {
                  const sel = current === s.id;
                  return (
                    <button 
                      key={s.id} 
                      onClick={() => onSelect(s.id)} 
                      className={cn(
                        "px-4 py-2.5 rounded-full text-xs font-bold transition-all border",
                        sel ? "shadow-md" : "hover:bg-muted/30"
                      )}
                      style={{
                        borderColor: sel ? cat.color : 'hsl(var(--border))',
                        backgroundColor: sel ? `${cat.color}20` : 'transparent',
                        color: sel ? cat.color : 'hsl(var(--foreground))'
                      }}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 shrink-0">
          <Button 
            variant="outline"
            className="w-full h-14 rounded-2xl font-bold text-sm tracking-widest text-muted-foreground border-border/50 hover:bg-muted/20"
            onClick={() => onSelect(null)} 
          >
            Clear Selection
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
