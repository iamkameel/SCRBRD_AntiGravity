"use client";

import React from "react";
import { Landmark, Shield, Award, Clock, BookOpen } from "lucide-react";

export function HistoricalArchiveVault() {
  const records = [
    { year: 2024, title: "1st XI unbeaten season (14 Matches)", detail: "Captained by M. Van der Merwe" },
    { year: 2022, title: "Highest Individual Innings: 184*", detail: "R. Sharma vs Jeppe High School for Boys" },
    { year: 2019, title: "Best Bowling Figures: 8/14", detail: "D. Steyn vs King Edward VII School (KES)" },
  ];

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              Institutional Archival & Historical Record Vault
            </h2>
            <p className="text-xs text-muted-foreground">
              School Centenary Records · Derby Day Archives · Milestone Plaques
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            EST. 1953 CENTENARY VAULT
          </span>
        </div>
      </div>

      {/* Historical Milestones List */}
      <div className="space-y-3">
        {records.map((r, idx) => (
          <div key={idx} className="bg-secondary/30 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-bold text-sm border border-amber-500/30">
                {r.year}
              </div>
              <div>
                <h4 className="font-display font-bold text-sm text-foreground">{r.title}</h4>
                <p className="text-xs font-mono text-muted-foreground">{r.detail}</p>
              </div>
            </div>
            <Award className="h-5 w-5 text-amber-400" />
          </div>
        ))}
      </div>
    </div>
  );
}
