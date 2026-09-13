"use client";

import React from "react";
import { Landmark, DollarSign, Award, Eye, TrendingUp } from "lucide-react";

export function CommercialView() {
  const sponsors = [
    { name: "First National Bank (FNB)", tier: "Principal Partner", impressions: "142,500", revenue: "R120,000" },
    { name: "Discovery Health", tier: "Official Wellness Partner", impressions: "88,200", revenue: "R75,000" },
    { name: "Steers South Africa", tier: "Match Day Scoreboard Sponsor", impressions: "64,100", revenue: "R45,000" },
    { name: "Gray-Nicolls Cricket", tier: "Equipment Supplier", impressions: "39,000", revenue: "R30,000" },
  ];

  return (
    <div className="bg-card border border-border rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Landmark className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              Commercial & Sponsorship Revenue Hub
            </h2>
            <p className="text-xs text-muted-foreground">
              Digital Billboard Overlays · Impression Telemetry · School Sports Monetization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Total Revenue: R270,000
          </span>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-secondary/30 border border-white/5 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5 text-sky-400" /> Total Impressions
          </span>
          <p className="font-display font-bold text-2xl text-foreground mt-1">333,800</p>
          <p className="text-xs text-emerald-400 mt-0.5">+24% vs last month</p>
        </div>

        <div className="bg-secondary/30 border border-white/5 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" /> Annual Sponsorship
          </span>
          <p className="font-display font-bold text-2xl text-foreground mt-1">R270,000</p>
          <p className="text-xs text-emerald-400 mt-0.5">100% target met</p>
        </div>

        <div className="bg-secondary/30 border border-white/5 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-amber-400" /> Active Partners
          </span>
          <p className="font-display font-bold text-2xl text-foreground mt-1">4 Brands</p>
          <p className="text-xs text-muted-foreground mt-0.5">Tier 1 & Tier 2</p>
        </div>

        <div className="bg-secondary/30 border border-white/5 rounded-2xl p-4">
          <span className="text-[11px] font-mono text-muted-foreground uppercase flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-400" /> Stream CPM
          </span>
          <p className="font-display font-bold text-2xl text-foreground mt-1">R45.00</p>
          <p className="text-xs text-sky-400 mt-0.5">Live broadcast ads</p>
        </div>
      </div>

      {/* Sponsor Table */}
      <div className="border border-white/10 rounded-2xl overflow-hidden bg-card">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-secondary/50 text-muted-foreground uppercase text-[10px]">
            <tr>
              <th className="p-3">Sponsor Name</th>
              <th className="p-3">Sponsorship Tier</th>
              <th className="p-3">Live Impressions</th>
              <th className="p-3">Annual Contract Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-foreground">
            {sponsors.map((s, idx) => (
              <tr key={idx} className="hover:bg-white/5">
                <td className="p-3 font-bold">{s.name}</td>
                <td className="p-3">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] bg-primary/10 text-primary border border-primary/20">
                    {s.tier}
                  </span>
                </td>
                <td className="p-3 text-sky-400 font-bold">{s.impressions}</td>
                <td className="p-3 text-emerald-400 font-bold">{s.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
