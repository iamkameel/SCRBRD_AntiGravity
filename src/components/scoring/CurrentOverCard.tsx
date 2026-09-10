import React from 'react';
import { Lbl, BallDot } from './primitives';
import { Card, CardContent } from "@/components/ui/card";

export function CurrentOverCard({ currentOver }: { currentOver: any[] }) {
  return (
    <Card className="bg-card/40 border-border/50 shadow-sm relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      <CardContent className="p-4">
        <Lbl>This Over</Lbl>
        <div className="flex gap-2 items-center flex-wrap mt-2.5">
          {currentOver.length === 0
            ? <span className="text-muted-foreground text-xs font-medium">No balls yet</span>
            : currentOver.map((b: any, i: number) => (
              <BallDot key={i} runs={b.runs ?? 0} isW={!!b.isWicket} extraType={b.extraType} />
            ))
          }
        </div>
      </CardContent>
    </Card>
  );
}
