"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { fetchSchools, fetchSeasons } from "@/lib/firestore";
import { School, Season } from "@/types/firestore";
import { useEffect, useState } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, Calendar, School as SchoolIcon, Radio, UserCheck, Shield } from "lucide-react";
import { D } from "@/lib/design-system";

export function DashboardFilterBar() {
  const { filters, setFilters } = useDashboard();
  const [schools, setSchools] = useState<School[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);

  useEffect(() => {
    async function loadData() {
      const [schoolData, seasonData] = await Promise.all([
        fetchSchools(),
        fetchSeasons()
      ]);
      setSchools(schoolData);
      setSeasons(seasonData);
    }
    loadData();
  }, []);

  const simulatedRole = filters.simulatedRole || "default";

  return (
    <div 
      className="flex flex-wrap items-center gap-4 p-4 rounded-2xl  border transition-all duration-500 backdrop-blur-xl"
      style={{ 
        background: D.surf1, 
        border: `1px solid ${D.border}`,
        boxShadow: `0 20px 40px -20px ${D.indigo}15`
      }}
    >
      <div className="flex items-center gap-3 mr-2 pr-4 border-r border-slate-300 dark:border-white/10">
        <div 
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
          style={{ background: `${D.indigo}15`, border: `1px solid ${D.indigo}30`, color: D.indigo }}
        >
          <Filter className="h-4 w-4" />
        </div>
        <div>
           <span className="text-[9px] font-bold uppercase tracking-wider block leading-none text-slate-600 dark:text-slate-400" style={{ fontFamily: D.sans }}>FILTER</span>
           <span className="text-xs font-bold uppercase tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: D.head }}>Your view</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 flex-1">
        {/* Season Filter */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-400 opacity-80" />
          <Select 
            value={filters.seasonId} 
            onValueChange={(val) => setFilters({ seasonId: val })}
          >
            <SelectTrigger 
              className="w-[150px] rounded-xl font-semibold text-xs h-9 transition-all border-none text-slate-800 dark:text-slate-200"
              style={{ background: D.surf2 }}
            >
              <SelectValue placeholder="All seasons" />
            </SelectTrigger>
            <SelectContent className="rounded-xl p-1 border shadow-2xl" style={{ background: D.surf1, border: `1px solid ${D.border}` }}>
              <SelectItem value="all" className="text-xs font-medium rounded-lg">All seasons</SelectItem>
              {seasons.map((season) => (
                <SelectItem key={season.id} value={season.id} className="text-xs font-medium rounded-lg">
                  {season.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* School Filter */}
        <div className="flex items-center gap-2">
          <SchoolIcon className="h-4 w-4 text-slate-600 dark:text-slate-400 opacity-80" />
          <Select 
            value={filters.schoolId} 
            onValueChange={(val) => setFilters({ schoolId: val })}
          >
            <SelectTrigger 
              className="w-[190px] rounded-xl font-semibold text-xs h-9 transition-all border-none text-slate-800 dark:text-slate-200"
              style={{ background: D.surf2 }}
            >
              <SelectValue placeholder="ALL INSTITUTIONS" />
            </SelectTrigger>
            <SelectContent className="rounded-xl p-1 border shadow-2xl" style={{ background: D.surf1, border: `1px solid ${D.border}` }}>
              <SelectItem value="all" className="text-xs font-medium rounded-lg">All schools</SelectItem>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id} className="text-xs font-medium rounded-lg">
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Interactive Persona / Role Simulator */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-300 dark:border-white/10">
          <UserCheck className="h-4 w-4 text-indigo-500 opacity-80" />
          <Select 
            value={simulatedRole} 
            onValueChange={(val) => setFilters({ simulatedRole: val === "default" ? undefined : val })}
          >
            <SelectTrigger 
              className="w-[190px] rounded-xl font-bold text-xs h-9 transition-all border-none text-indigo-700 dark:text-indigo-300"
              style={{ background: `${D.indigo}15`, border: `1px solid ${D.indigo}30` }}
            >
              <SelectValue placeholder="PERSONA SIMULATOR" />
            </SelectTrigger>
            <SelectContent className="rounded-xl p-1 border shadow-2xl" style={{ background: D.surf1, border: `1px solid ${D.border}` }}>
              <SelectItem value="default" className="text-xs font-medium rounded-lg">AUTO (AUTHENTICATED)</SelectItem>
              <SelectItem value="superadmin" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 rounded-lg">SYSTEM ARCHITECT</SelectItem>
              <SelectItem value="coach" className="text-xs font-semibold text-amber-600 dark:text-amber-400 rounded-lg">HEAD COACH</SelectItem>
              <SelectItem value="sportsmaster" className="text-xs font-semibold text-sky-600 dark:text-sky-400 rounded-lg">SPORTSMASTER</SelectItem>
              <SelectItem value="matchofficial" className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 rounded-lg">UMPIRE / SCORER</SelectItem>
              <SelectItem value="player" className="text-xs font-semibold text-rose-600 dark:text-rose-400 rounded-lg">PLAYER OPS</SelectItem>
              <SelectItem value="groundskeeper" className="text-xs font-semibold text-violet-600 dark:text-violet-400 rounded-lg">GROUNDSKEEPER</SelectItem>
              <SelectItem value="driver" className="text-xs font-semibold text-teal-600 dark:text-teal-400 rounded-lg">LOGISTICS / DRIVER</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-3 pl-6 ml-auto border-l border-slate-300 dark:border-white/10">
        <div className="flex flex-col items-end mr-2">
           <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400" style={{ fontFamily: D.sans }}>REALTIME TELEMETRY</span>
           <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400" style={{ fontFamily: D.mono }}>SYNC ACTIVE</span>
        </div>
        <div 
          className="w-9 h-9 rounded-full flex items-center justify-center animate-pulse"
          style={{ background: `${D.emerald}10`, border: `1px solid ${D.emerald}20` }}
        >
           <Radio className="h-4 w-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
}
