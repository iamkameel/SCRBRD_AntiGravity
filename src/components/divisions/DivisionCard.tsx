"use client";

import { D } from "@/lib/design-system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, Users, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface DivisionCardProps {
  division: {
    id: string;
    name: string;
    ageGroup: string;
    season: string;
  };
  teams: any[];
  index: number;
}

export function DivisionCard({ division, teams, index }: DivisionCardProps) {
  const divisionTeams = teams.filter((t) => t.divisionId === division.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -2 }}
      className="group relative"
    >
      <div 
        className="p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/5"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div 
            className="h-12 w-12 rounded-xl flex items-center justify-center border shrink-0 transition-colors group-hover:border-indigo-500/40 group-hover:bg-indigo-500/10"
            style={{ background: D.surf2, borderColor: D.border }}
          >
            <Layers className="w-6 h-6 text-indigo-400" />
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                {division.name}
              </h3>
              <Badge 
                variant="outline" 
                className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border-indigo-500/20"
              >
                {division.ageGroup}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground ml-auto md:ml-0">
                <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Season {division.season}</span>
              </div>
            </div>

            {/* Teams Chips */}
            <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
              <div className="flex items-center gap-1 shrink-0">
                <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white">{divisionTeams.length}</span> Teams:
              </div>
              {divisionTeams.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {divisionTeams.slice(0, 4).map((team) => (
                    <span 
                      key={team.id} 
                      className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-medium text-white/80"
                    >
                      {team.name}
                    </span>
                  ))}
                  {divisionTeams.length > 4 && (
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-medium text-muted-foreground">
                      +{divisionTeams.length - 4} more
                    </span>
                  )}
                </div>
              ) : (
                <span className="italic text-muted-foreground/60 text-[11px]">No teams assigned yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <Link href={`/divisions/${division.id}`}>
            <Button 
              size="sm" 
              className="h-9 px-4 text-xs rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/20"
            >
              Division Hub
              <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
