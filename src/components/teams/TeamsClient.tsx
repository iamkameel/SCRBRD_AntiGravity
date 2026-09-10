"use client";

import { useState, useMemo } from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  LayoutGrid, 
  List as ListIcon, 
  Search, 
  X,
  Layers,
  Globe,
  Award,
  Shield,
  Users,
  SlidersHorizontal
} from "lucide-react";
import { 
  ListTeamsData, 
  ListOrganisationsData, 
  ListAgeDivisionsData 
} from "@/generated/dataconnect";
import { TeamCard } from "./TeamCard";
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

interface TeamsClientProps {
  teams: ListTeamsData['teams'];
  organisations: ListOrganisationsData['organisations'];
  ageDivisions: ListAgeDivisionsData['ageDivisions'];
}

export function TeamsClient({ teams, organisations, ageDivisions }: TeamsClientProps) {
  const { viewMode, setViewMode } = useViewMode({ 
    storageKey: 'teams-v4-view-mode',
    defaultMode: 'grid'
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (
        team.name.toLowerCase().includes(searchLower) ||
        (team.organisation?.name && team.organisation.name.toLowerCase().includes(searchLower)) ||
        (team.ageDivision?.name && team.ageDivision.name.toLowerCase().includes(searchLower))
      );

      const matchesOrg = selectedOrg === 'all' || team.organisation?.id === selectedOrg;
      const matchesDivision = selectedDivision === 'all' || team.ageDivision?.id === selectedDivision;

      return matchesSearch && matchesOrg && matchesDivision;
    });
  }, [teams, searchTerm, selectedOrg, selectedDivision]);

  const metrics = useMemo(() => {
    const orgsSet = new Set(teams.map(t => t.organisation?.name).filter(Boolean));
    const divsSet = new Set(teams.map(t => t.ageDivision?.name).filter(Boolean));
    return {
      total: teams.length,
      organisationsCount: orgsSet.size,
      divisionsCount: divsSet.size,
      filteredCount: filteredTeams.length
    };
  }, [teams, filteredTeams]);

  const hasActiveFilters = searchTerm !== '' || selectedOrg !== 'all' || selectedDivision !== 'all';

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedOrg('all');
    setSelectedDivision('all');
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Teams</span>
            <Layers size={16} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-primary font-mono">{metrics.total}</div>
        </div>

        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Institutions</span>
            <Globe size={16} className="text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">{metrics.organisationsCount}</div>
        </div>

        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Age Divisions</span>
            <Award size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{metrics.divisionsCount}</div>
        </div>

        <div className="p-4 rounded-2xl border bg-surf1" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filtered Units</span>
            <Users size={16} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{metrics.filteredCount}</div>
        </div>
      </div>

      {/* Control Strip (Search, Select Filters, View Toggle) */}
      <div className="p-4 rounded-2xl border space-y-3 shadow-xl" style={{ background: D.surf1, borderColor: D.border }}>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team, institution, or division..."
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

          {/* Filters & View Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Organisation Filter */}
            <Select value={selectedOrg} onValueChange={setSelectedOrg}>
              <SelectTrigger className="h-11 text-xs rounded-xl border-white/10 bg-white/5 w-[180px]">
                <SelectValue placeholder="All Institutions" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="all">All Institutions</SelectItem>
                {organisations.map(org => (
                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Age Division Filter */}
            <Select value={selectedDivision} onValueChange={setSelectedDivision}>
              <SelectTrigger className="h-11 text-xs rounded-xl border-white/10 bg-white/5 w-[170px]">
                <SelectValue placeholder="All Divisions" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="all">All Divisions</SelectItem>
                {ageDivisions.map(div => (
                  <SelectItem key={div.id} value={div.id}>{div.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/20 border border-white/10 flex-shrink-0">
              <button
                onClick={() => setViewMode('grid')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
                title="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white")}
                title="List View"
              >
                <ListIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Reset Filter Action */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
            <span className="text-muted-foreground">Showing {filteredTeams.length} of {teams.length} teams</span>
            <button
              onClick={resetFilters}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
            >
              <X size={12} />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Dynamic View Display */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"
          )}
        >
          {filteredTeams.length === 0 ? (
            <div className="col-span-full py-16 text-center rounded-2xl border border-dashed flex flex-col items-center justify-center gap-3" style={{ borderColor: D.border }}>
              <Shield className="h-10 w-10 text-muted-foreground/30 animate-pulse" />
              <h3 className="text-sm font-bold text-primary">No Teams Found</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                No team units match your current search terms or filter selections.
              </p>
              {hasActiveFilters && (
                <Button size="sm" variant="outline" onClick={resetFilters} className="mt-2 text-xs rounded-xl border-white/10">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            filteredTeams.map((team) => (
              <TeamCard 
                key={team.id} 
                team={team} 
                viewMode={viewMode} 
              />
            ))
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
