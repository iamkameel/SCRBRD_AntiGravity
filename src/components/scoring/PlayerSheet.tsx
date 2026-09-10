import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function PlayerSheet({ title, players, excludeIds, onSelect, onClose }: { title: string; players: any[]; excludeIds: string[]; onSelect: (id: string) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const filtered = players.filter(p => !excludeIds.includes(p.id) && (`${p.firstName} ${p.lastName}`).toLowerCase().includes(q.toLowerCase()));
  
  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="rounded-t-3xl border-border/50 bg-background/80 backdrop-blur-2xl p-6 sm:max-w-lg mx-auto pb-8 h-[80vh] flex flex-col">
        <div className="flex justify-center mb-2 shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-border/50" />
        </div>
        
        <SheetHeader className="mb-6 shrink-0">
          <SheetTitle className="text-sky-500 font-black tracking-tighter text-2xl">{title}</SheetTitle>
        </SheetHeader>

        <div className="relative mb-6 shrink-0 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-sky-500 transition-colors" />
          <Input 
            type="text" 
            placeholder="Search roster..." 
            value={q} 
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-11 h-14 bg-muted/10 border-border/50 rounded-2xl focus-visible:ring-sky-500/30 focus-visible:border-sky-500 text-base font-bold shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar flex-1 pr-2">
          {filtered.length === 0 ? (
            <div className="text-muted-foreground/60 font-bold uppercase tracking-widest text-xs text-center py-10">
              No available players
            </div>
          ) : null}
          
          {filtered.map(p => (
            <button 
              key={p.id} 
              onClick={() => onSelect(p.id)} 
              className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/5 hover:bg-sky-500/5 hover:border-sky-500/30 hover:text-sky-500 text-foreground text-left transition-all group"
            >
              <span className="font-bold tracking-tight">{p.firstName} {p.lastName}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-sky-500/50 transition-colors" />
            </button>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
