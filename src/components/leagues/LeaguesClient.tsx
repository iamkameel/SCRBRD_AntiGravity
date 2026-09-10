"use client";

import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Search, 
  X, 
  Globe, 
  Award, 
  ShieldCheck, 
  SlidersHorizontal 
} from "lucide-react";
import { LeagueCard } from "./LeagueCard";
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from "framer-motion";

interface LeaguesClientProps {
  leagues: any[];
}

export function LeaguesClient({ leagues }: LeaguesClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredLeagues = useMemo(() => {
    return leagues.filter(league => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        league.name.toLowerCase().includes(searchLower) ||
        (league.description && league.description.toLowerCase().includes(searchLower)) ||
        (league.provinceId && league.provinceId.toLowerCase().includes(searchLower))
      );

      const matchesType = selectedType === 'all' || league.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [leagues, searchTerm, selectedType]);

  const metrics = useMemo(() => {
    const typesCount: Record<string, number> = {
      League: 0,
      Series: 0,
      Cup: 0,
      Friendly: 0
    };

    leagues.forEach(l => {
      if (typesCount[l.type] !== undefined) {
        typesCount[l.type]++;
      }
    });

    return {
      total: leagues.length,
      leaguesCount: typesCount.League,
      seriesCount: typesCount.Series,
      cupCount: typesCount.Cup
    };
  }, [leagues]);

  const types = ['all', 'League', 'Series', 'Cup', 'Friendly'];

  return (
    <div className="space-y-6">
      {/* Top Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Competitions</span>
            <Trophy size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-primary font-mono">{metrics.total}</div>
        </div>

        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Institutional Leagues</span>
            <Globe size={16} className="text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">{metrics.leaguesCount}</div>
        </div>

        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Regional Series</span>
            <Award size={16} className="text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-400 font-mono">{metrics.seriesCount}</div>
        </div>

        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cup Tournaments</span>
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{metrics.cupCount}</div>
        </div>
      </div>

      {/* Control Bar (Search & Filter Pills) */}
      <div className="p-4 rounded-2xl border space-y-3 shadow-xl" style={{ background: D.surf1, borderColor: D.border }}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search competition name, description, province..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-9 h-11 rounded-xl border-white/10 bg-white/5 focus:bg-white/10 text-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/20 border border-white/10 overflow-x-auto">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  selectedType === t 
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Leagues List */}
      <div className="space-y-4">
        {filteredLeagues.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3" style={{ borderColor: D.border }}>
            <Trophy className="h-10 w-10 text-muted-foreground/30 animate-pulse" />
            <h3 className="text-sm font-bold text-primary">No Competitions Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              No competitions match your search query or selected type filter.
            </p>
          </div>
        ) : (
          filteredLeagues.map((league, index) => (
            <LeagueCard key={league.id} league={league} index={index} />
          ))
        )}
      </div>
    </div>
  );
}
