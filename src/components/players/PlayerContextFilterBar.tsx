"use client";

import { Filter, Calendar, Users, Trophy, Layers } from "lucide-react";
import { D } from "@/lib/design-system";

export interface PlayerContextFilterState {
  season: string;
  team: string;
  format: string;
  competition: string;
}

interface PlayerContextFilterBarProps {
  filters: PlayerContextFilterState;
  onFilterChange: (filters: PlayerContextFilterState) => void;
  matchesCount?: number;
}

export function PlayerContextFilterBar({
  filters,
  onFilterChange,
  matchesCount = 42,
}: PlayerContextFilterBarProps) {
  const seasons = [
    { id: "2026", label: "2026 Season" },
    { id: "2025", label: "2025 Season" },
    { id: "2024", label: "2024 Season" },
    { id: "career", label: "All Seasons (Career)" },
  ];

  const teams = [
    { id: "all", label: "All Teams" },
    { id: "1stXI", label: "1st XI" },
    { id: "u19a", label: "U19 A" },
    { id: "u15a", label: "U15 A" },
  ];

  const formats = [
    { id: "all", label: "All Formats" },
    { id: "multiday", label: "Multi-Day" },
    { id: "50over", label: "50-Over" },
    { id: "t20", label: "T20" },
  ];

  const competitions = [
    { id: "all", label: "All Competitions" },
    { id: "superleague", label: "Super League" },
    { id: "premiercup", label: "Premier Cup" },
    { id: "friendlies", label: "Friendlies" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0c0c10]/80 backdrop-blur-xl p-3.5 flex flex-wrap items-center justify-between gap-3 transition-colors shadow-sm">
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Context Label */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-[#22c55e]">
          <Filter className="h-3 w-3" />
          <span className="text-[9px] font-black uppercase tracking-wider" style={{ fontFamily: D.mono }}>
            Context
          </span>
        </div>

        {/* Season Selector */}
        <div className="relative flex items-center">
          <select
            value={filters.season}
            onChange={(e) => onFilterChange({ ...filters, season: e.target.value })}
            className="appearance-none bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white text-[10px] font-bold py-1.5 pl-3 pr-7 rounded-xl hover:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
            style={{ fontFamily: D.mono }}
          >
            {seasons.map((s) => (
              <option key={s.id} value={s.id} className="bg-white dark:bg-[#0c0c10] text-zinc-900 dark:text-white">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Team Selector */}
        <div className="relative flex items-center">
          <select
            value={filters.team}
            onChange={(e) => onFilterChange({ ...filters, team: e.target.value })}
            className="appearance-none bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white text-[10px] font-bold py-1.5 pl-3 pr-7 rounded-xl hover:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
            style={{ fontFamily: D.mono }}
          >
            {teams.map((t) => (
              <option key={t.id} value={t.id} className="bg-white dark:bg-[#0c0c10] text-zinc-900 dark:text-white">
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Format Selector */}
        <div className="relative flex items-center">
          <select
            value={filters.format}
            onChange={(e) => onFilterChange({ ...filters, format: e.target.value })}
            className="appearance-none bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white text-[10px] font-bold py-1.5 pl-3 pr-7 rounded-xl hover:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
            style={{ fontFamily: D.mono }}
          >
            {formats.map((f) => (
              <option key={f.id} value={f.id} className="bg-white dark:bg-[#0c0c10] text-zinc-900 dark:text-white">
                {f.label}
              </option>
            ))}
          </select>
        </div>

        {/* Competition Selector */}
        <div className="relative flex items-center">
          <select
            value={filters.competition}
            onChange={(e) => onFilterChange({ ...filters, competition: e.target.value })}
            className="appearance-none bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white text-[10px] font-bold py-1.5 pl-3 pr-7 rounded-xl hover:border-emerald-500/40 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer"
            style={{ fontFamily: D.mono }}
          >
            {competitions.map((c) => (
              <option key={c.id} value={c.id} className="bg-white dark:bg-[#0c0c10] text-zinc-900 dark:text-white">
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scope Badge / Sample Count */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-zinc-500 dark:text-white/40">
          Showing <span className="font-bold text-zinc-900 dark:text-white">{matchesCount}</span> matches in scope
        </span>
      </div>
    </div>
  );
}
