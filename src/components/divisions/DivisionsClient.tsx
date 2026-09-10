"use client";

import { useState, useMemo } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Layers, 
  Search, 
  X, 
  Award, 
  Users, 
  Calendar, 
  ShieldCheck 
} from "lucide-react";
import { DivisionCard } from "./DivisionCard";
import { D } from '@/lib/design-system';

interface DivisionsClientProps {
  divisions: any[];
  teams: any[];
}

export function DivisionsClient({ divisions, teams }: DivisionsClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');

  const filteredDivisions = useMemo(() => {
    return divisions.filter(division => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        division.name.toLowerCase().includes(searchLower) ||
        (division.ageGroup && division.ageGroup.toLowerCase().includes(searchLower)) ||
        (division.season && division.season.toLowerCase().includes(searchLower))
      );

      const matchesAge = selectedAgeGroup === 'all' || division.ageGroup === selectedAgeGroup;
      return matchesSearch && matchesAge;
    });
  }, [divisions, searchTerm, selectedAgeGroup]);

  const metrics = useMemo(() => {
    const ageGroupsSet = new Set(divisions.map(d => d.ageGroup).filter(Boolean));
    const seasonsSet = new Set(divisions.map(d => d.season).filter(Boolean));
    return {
      total: divisions.length,
      ageGroupsCount: ageGroupsSet.size,
      seasonsCount: seasonsSet.size,
      totalTeams: teams.length
    };
  }, [divisions, teams]);

  const ageGroups = ['all', ...Array.from(new Set(divisions.map(d => d.ageGroup).filter(Boolean)))];

  return (
    <div className="space-y-6">
      {/* Top Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Divisions</span>
            <Layers size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-primary font-mono">{metrics.total}</div>
        </div>

        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Age Groups</span>
            <Award size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{metrics.ageGroupsCount}</div>
        </div>

        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Enrolled Teams</span>
            <Users size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{metrics.totalTeams}</div>
        </div>

        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Seasons</span>
            <Calendar size={16} className="text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">{metrics.seasonsCount}</div>
        </div>
      </div>

      {/* Control Bar (Search & Filter Pills) */}
      <div className="p-4 rounded-2xl border space-y-3 shadow-xl" style={{ background: D.surf1, borderColor: D.border }}>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search division name, age group, season..."
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

          {/* Age Group Filter Pills */}
          {ageGroups.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/20 border border-white/10 overflow-x-auto">
              {ageGroups.map(ag => (
                <button
                  key={ag}
                  onClick={() => setSelectedAgeGroup(ag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                    selectedAgeGroup === ag 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                      : "text-muted-foreground hover:text-white hover:bg-white/5"
                  }`}
                >
                  {ag === 'all' ? 'All Groups' : ag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Divisions List */}
      <div className="space-y-4">
        {filteredDivisions.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3" style={{ borderColor: D.border }}>
            <Layers className="h-10 w-10 text-muted-foreground/30 animate-pulse" />
            <h3 className="text-sm font-bold text-primary">No Divisions Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              No divisions match your search query or selected age group filter.
            </p>
          </div>
        ) : (
          filteredDivisions.map((division, index) => (
            <DivisionCard 
              key={division.id} 
              division={division} 
              teams={teams}
              index={index} 
            />
          ))
        )}
      </div>
    </div>
  );
}
