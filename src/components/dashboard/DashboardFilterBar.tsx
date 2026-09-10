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
import { Filter, Calendar, School as SchoolIcon, Radio } from "lucide-react";
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

  return (
    <div 
      className="flex flex-wrap items-center gap-4 p-4 rounded-3xl mb-8 sticky top-4 z-50 shadow-2xl border transition-all duration-500 backdrop-blur-xl"
      style={{ 
        background: `${D.surf1}f0`, 
        border: `1px solid ${D.border}`,
        boxShadow: `0 20px 40px -20px ${D.indigo}15`
      }}
    >
      <div className="flex items-center gap-3 mr-4 pr-6" style={{ borderRight: `1px solid ${D.border}` }}>
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
          style={{ background: `${D.indigo}15`, border: `1px solid ${D.indigo}30`, color: D.indigo }}
        >
          <Filter className="h-4 w-4" />
        </div>
        <div>
           <span className="text-[10px] font-black uppercase tracking-[0.2em] block leading-none" style={{ color: D.textMuted }}>SYSTEM</span>
           <span className="text-[12px] font-black uppercase tracking-tight italic" style={{ color: D.textPrimary, fontFamily: D.head }}>CONTEXT</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 flex-1">
        {/* Season Filter */}
        <div className="flex items-center gap-3">
          <Calendar className="h-4 w-4 opacity-40" style={{ color: D.textMuted }} />
          <Select 
            value={filters.seasonId} 
            onValueChange={(val) => setFilters({ seasonId: val })}
          >
            <SelectTrigger 
              className="w-[180px] rounded-xl font-black text-[10px] uppercase tracking-widest h-10 transition-all border-none"
              style={{ background: D.surf2, color: D.textSecondary }}
            >
              <SelectValue placeholder="ALL SEASONS" />
            </SelectTrigger>
            <SelectContent className="rounded-xl p-1 border shadow-2xl" style={{ background: D.surf1, border: `1px solid ${D.border}` }}>
              <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest rounded-lg">ALL SEASONS</SelectItem>
              {seasons.map((season) => (
                <SelectItem key={season.id} value={season.id} className="text-[10px] font-black uppercase tracking-widest rounded-lg">
                  {season.name.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* School Filter */}
        <div className="flex items-center gap-3">
          <SchoolIcon className="h-4 w-4 opacity-40" style={{ color: D.textMuted }} />
          <Select 
            value={filters.schoolId} 
            onValueChange={(val) => setFilters({ schoolId: val })}
          >
            <SelectTrigger 
              className="w-[220px] rounded-xl font-black text-[10px] uppercase tracking-widest h-10 transition-all border-none"
              style={{ background: D.surf2, color: D.textSecondary }}
            >
              <SelectValue placeholder="ALL INSTITUTIONS" />
            </SelectTrigger>
            <SelectContent className="rounded-xl p-1 border shadow-2xl" style={{ background: D.surf1, border: `1px solid ${D.border}` }}>
              <SelectItem value="all" className="text-[10px] font-black uppercase tracking-widest rounded-lg">ALL SCHOOLS</SelectItem>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id} className="text-[10px] font-black uppercase tracking-widest rounded-lg">
                  {school.name.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-3 pl-8 ml-auto" style={{ borderLeft: `1px solid ${D.border}` }}>
        <div className="flex flex-col items-end mr-3">
           <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40" style={{ color: D.textMuted }}>REALTIME ENGINE</span>
           <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: D.emerald }}>SYNC ACTIVE</span>
        </div>
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center animate-pulse"
          style={{ background: `${D.emerald}10`, border: `1px solid ${D.emerald}20` }}
        >
           <Radio className="h-4 w-4" style={{ color: D.emerald }} />
        </div>
      </div>
    </div>
  );
}
