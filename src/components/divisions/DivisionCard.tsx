"use client";

import { D } from "@/lib/design-system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, Users, Calendar, ArrowRight } from "lucide-react";
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.005 }}
      className="group p-8 rounded-[2rem] border overflow-hidden"
      style={{ background: D.surf1, borderColor: D.border }}
    >
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div className="flex gap-6 items-start">
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
            <Layers className="w-8 h-8 text-indigo-400" />
          </div>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-2xl font-black tracking-tight uppercase italic" style={{ color: D.textPrimary, fontFamily: D.head }}>
                  {division.name}
                </h3>
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full">
                  {division.ageGroup}
                </Badge>
              </div>
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] opacity-50" style={{ color: D.textMuted }}>
                 <div className="flex items-center gap-1.5">
                   <Calendar className="w-3.5 h-3.5" />
                   SEASON {division.season}
                 </div>
                 <div className="flex items-center gap-1.5">
                   <Users className="w-3.5 h-3.5" />
                   {divisionTeams.length} TEAMS ACTIVE
                 </div>
              </div>
            </div>

            {divisionTeams.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {divisionTeams.slice(0, 4).map((team) => (
                  <div key={team.id} 
                       className="px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider"
                       style={{ background: D.surf2, borderColor: D.border, color: D.textMuted }}>
                    {team.name}
                  </div>
                ))}
                {divisionTeams.length > 4 && (
                  <div className="px-3 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider opacity-60"
                       style={{ background: D.surf2, borderColor: D.border, color: D.textMuted }}>
                    +{divisionTeams.length - 4} MORE
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto">
          <Link href={`/divisions/${division.id}`} className="w-full xl:w-auto">
            <Button className="w-full xl:w-auto h-14 px-10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] group/btn transition-all"
                    style={{ background: D.indigo, color: 'white' }}>
              DIVISION HUB
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
