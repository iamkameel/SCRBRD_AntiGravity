"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Globe, Calendar, Users, ChevronRight, Layers, ArrowUpRight } from "lucide-react";
import { D } from '@/lib/design-system';
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TeamCardProps {
  team: any;
  viewMode?: 'grid' | 'list' | 'table' | 'calendar' | 'stats';
}

export function TeamCard({ team, viewMode = 'grid' }: TeamCardProps) {
  if (viewMode === 'grid') {
    return (
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ duration: 0.2 }}
        className="group relative"
      >
        <div 
          className="p-5 rounded-2xl border transition-all duration-300 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5 space-y-4"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div 
                className="h-11 w-11 rounded-xl flex items-center justify-center border shrink-0 transition-colors group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10" 
                style={{ background: D.surf2, borderColor: D.border }}
              >
                <Layers className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                  {team.name}
                </h3>
                <p className="text-xs text-muted-foreground truncate font-medium">
                  {team.organisation?.name || 'Independent Institution'}
                </p>
              </div>
            </div>

            <Badge 
              variant="outline" 
              className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border-indigo-500/20 shrink-0"
            >
              {team.ageDivision?.name || 'Open'}
            </Badge>
          </div>

          {/* Meta Information Bar */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs" style={{ borderColor: D.border }}>
            <div className="flex items-center gap-1.5 text-muted-foreground truncate">
              <Globe size={13} className="text-sky-400 shrink-0" />
              <span className="truncate">{team.organisation?.name || 'Independent'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground truncate justify-end">
              <Calendar size={13} className="text-amber-400 shrink-0" />
              <span className="truncate">{team.season?.name || 'Current Season'}</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Squad
            </span>

            <div className="flex items-center gap-2">
              <Link href={`/teams/${team.id}/roster`}>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 px-2.5 text-xs rounded-lg border-white/10 hover:bg-white/10"
                >
                  Roster
                </Button>
              </Link>
              <Link href={`/teams/${team.id}`}>
                <Button 
                  size="sm" 
                  className="h-8 px-3 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20"
                >
                  View
                  <ArrowUpRight size={13} className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // List View Mode
  return (
    <motion.div
      whileHover={{ x: 2 }}
      transition={{ duration: 0.15 }}
      className="group"
    >
      <div 
        className="p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-indigo-500/40"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <div 
            className="h-10 w-10 rounded-xl flex items-center justify-center border shrink-0 group-hover:bg-indigo-500/10" 
            style={{ background: D.surf2, borderColor: D.border }}
          >
            <Layers className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                {team.name}
              </h3>
              <Badge 
                variant="outline" 
                className="text-[10px] font-medium px-2 py-0 rounded bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
              >
                {team.ageDivision?.name || 'Open'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {team.organisation?.name || 'Independent Institution'} • {team.season?.name || 'Current Season'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link href={`/teams/${team.id}/roster`}>
            <Button size="sm" variant="outline" className="h-8 px-3 text-xs rounded-lg border-white/10">
              Roster
            </Button>
          </Link>
          <Link href={`/teams/${team.id}`}>
            <Button size="sm" className="h-8 px-3 text-xs rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium">
              Manage
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
