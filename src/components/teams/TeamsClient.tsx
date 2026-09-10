"use client";

import { useState } from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import { Button } from "@/components/ui/button";
import { 
  LayoutGrid, 
  List, 
  Search, 
  Filter,
  X,
  Layers,
  Plus,
  ChevronRight,
  Globe,
  Award,
  Shield
} from "lucide-react";
import Link from 'next/link';
import { 
  ListTeamsData, 
  ListOrganisationsData, 
  ListAgeDivisionsData 
} from "@/generated/dataconnect";
import { TeamCard } from "./TeamCard";
import { Badge } from "@/components/ui/badge";
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

  const filteredTeams = teams.filter(team => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      team.name.toLowerCase().includes(searchLower) ||
      team.organisation?.name.toLowerCase().includes(searchLower) ||
      team.ageDivision?.name.toLowerCase().includes(searchLower)
    );

    const matchesOrg = selectedOrg === 'all' || team.organisation?.id === selectedOrg;
    const matchesDivision = selectedDivision === 'all' || team.ageDivision?.id === selectedDivision;

    return matchesSearch && matchesOrg && matchesDivision;
  });

  return (
    <div className="space-y-12 pb-24">
      {/* View & Filter Hub */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-6 p-4 rounded-[2rem] border" 
           style={{ background: D.surf1, borderColor: D.border }}>
        
        <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
          <div className="relative flex-1 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-all" size={18} />
            <input 
              type="text" 
              placeholder="SEARCH TEAMS, ORGANISATIONS, DIVISIONS..."
              className="w-full h-16 pl-16 pr-8 rounded-2xl bg-black/5 border-transparent focus:border-indigo-500/30 focus:bg-white/5 outline-none transition-all text-xs font-black tracking-widest uppercase"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded-2xl" style={{ background: D.surf2 }}>
            {[
              { id: 'grid', icon: LayoutGrid, label: 'GRID' },
              { id: 'list', icon: List, label: 'LIST' }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id as any)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest",
                  viewMode === v.id ? "text-white shadow-xl" : "opacity-40 hover:opacity-100"
                )}
                style={{ background: viewMode === v.id ? D.indigo : 'transparent' }}
              >
                <v.icon size={14} />
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Advanced Filter Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4 p-4 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
           <Globe size={18} className="text-indigo-500 ml-2" />
           <select 
            className="flex-1 bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
          >
            <option value="all">ALL ORGANISATIONS</option>
            {organisations.map(org => (
              <option key={org.id} value={org.id}>{org.name.toUpperCase()}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
           <Award size={18} className="text-sky-500 ml-2" />
           <select 
            className="flex-1 bg-transparent text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
          >
            <option value="all">ALL DIVISIONS</option>
            {ageDivisions.map(div => (
              <option key={div.id} value={div.id}>{div.name.toUpperCase()}</option>
            ))}
          </select>
        </div>

        {(selectedOrg !== 'all' || selectedDivision !== 'all' || searchTerm) && (
          <Button 
            variant="ghost" 
            onClick={() => {
              setSelectedOrg('all');
              setSelectedDivision('all');
              setSearchTerm('');
            }}
            className="h-16 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 hover:text-rose-500"
            style={{ borderColor: D.border }}
          >
            <X className="h-4 w-4 mr-3" />
            CLEAR ENGINE FILTERS
          </Button>
        )}
      </div>

      {/* Results HUD */}
      <div className="flex items-center justify-between px-10">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">
           IDENTITY RESULTS: <span className="text-white opacity-100 italic" style={{ color: D.indigo }}>{filteredTeams.length} UNIT(S)</span>
        </div>
        <div className="px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-[0.2em]" 
             style={{ background: `${D.indigo}08`, borderColor: `${D.indigo}20`, color: D.indigo }}>
          V4 RELATIONAL ENGINE
        </div>
      </div>

      {/* Dynamic View Engine */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={viewMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"
          )}
        >
          {filteredTeams.length === 0 ? (
            <div className="col-span-full py-24 text-center rounded-[3rem] border border-dashed flex flex-col items-center gap-4" 
                 style={{ borderColor: D.border }}>
               <Shield className="h-12 w-12 opacity-10 animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">NO RELATIONAL CORES FOUND FOR SELECTED TOPOLOGY</p>
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
