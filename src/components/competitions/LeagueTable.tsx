"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface LeagueStanding {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  tied: number;
  noResult: number;
  points: number;
  netRunRate: number;
  recentForm: ('W' | 'L' | 'T' | 'NR')[];
}

interface LeagueTableProps {
  standings: LeagueStanding[];
  isPromotionRelegationEnabled?: boolean;
}

export function LeagueTable({ standings, isPromotionRelegationEnabled = true }: LeagueTableProps) {
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const sortedStandings = [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.netRunRate - a.netRunRate;
  });

  const topZone = 2;
  const bottomZone = sortedStandings.length - 2;

  return (
    <TooltipProvider>
      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl relative">
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <Table>
          <TableHeader className="bg-white/5 sticky top-0 z-10 backdrop-blur-md">
            <TableRow className="hover:bg-transparent border-white/10">
              <TableHead className="w-14 text-center text-[10px] font-black uppercase tracking-tighter opacity-50">RANK</TableHead>
              <TableHead className="text-[10px] font-black uppercase tracking-tighter opacity-50 pl-4">COMPETITOR</TableHead>
              <TableHead className="text-center w-12 text-[10px] font-black uppercase tracking-tighter opacity-50">MAT</TableHead>
              <TableHead className="text-center w-12 text-[10px] font-black uppercase tracking-tighter opacity-50">WON</TableHead>
              <TableHead className="text-center w-12 text-[10px] font-black uppercase tracking-tighter opacity-50 hidden sm:table-cell">LST</TableHead>
              <TableHead className="text-center w-14 text-[10px] font-black uppercase tracking-tighter opacity-50 hidden md:table-cell">NRR</TableHead>
              <TableHead className="text-center w-16 text-[10px] font-black uppercase tracking-tighter text-emerald-400">PTS</TableHead>
              <TableHead className="w-[124px] hidden lg:table-cell text-[10px] font-black uppercase tracking-tighter opacity-50">RECORDS / FORM</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStandings.map((team, index) => {
              const position = index + 1;
              const isTop = isPromotionRelegationEnabled && position <= topZone;
              const isBottom = isPromotionRelegationEnabled && position > bottomZone;
              const isExpanded = expandedTeamId === team.teamId;

              return (
                <TableRow 
                  key={team.teamId} 
                  className={`group cursor-pointer transition-all duration-300 border-white/5
                    ${isTop ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : ''}
                    ${isBottom ? 'bg-rose-500/5 hover:bg-rose-500/10' : ''}
                    ${!isTop && !isBottom ? 'hover:bg-white/5' : ''}
                  `}
                  onClick={() => setExpandedTeamId(isExpanded ? null : team.teamId)}
                >
                  {/* Position with Zone Indicator */}
                  <TableCell className="text-center relative">
                    {isTop && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                    {isBottom && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />}
                    
                    <div className="flex items-center justify-center">
                      <span className={`text-sm font-black italic ${isTop ? 'text-emerald-400' : isBottom ? 'text-rose-400' : 'text-white/40'}`}>
                        {position.toString().padStart(2, '0')}
                      </span>
                    </div>
                  </TableCell>
                  
                  {/* Team Name */}
                  <TableCell className="pl-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="relative w-8 h-8 shrink-0 rounded-lg overflow-hidden bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                        <Image 
                          src={`https://ui-avatars.com/api/?name=${team.teamName}&background=0D1117&color=fff&bold=true`} 
                          alt={team.teamName} 
                          fill 
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight group-hover:text-emerald-400 transition-colors uppercase">{team.teamName}</span>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="flex lg:hidden items-center gap-1 mt-2 mb-1 overflow-hidden"
                            >
                              {team.recentForm.map((result, i) => (
                                <div key={i} className={`w-4 h-4 rounded-[2px] flex items-center justify-center text-[8px] font-black ${
                                  result === 'W' ? 'bg-emerald-500 text-black' : 
                                  result === 'L' ? 'bg-rose-500 text-white' : 'bg-white/10 text-white/40'
                                }`}>{result}</div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Stats */}
                  <TableCell className="text-center font-mono text-xs opacity-60 tabular-nums">{team.played}</TableCell>
                  <TableCell className="text-center font-black text-sm text-emerald-400 tabular-nums">{team.won}</TableCell>
                  <TableCell className="text-center font-mono text-xs opacity-40 hidden sm:table-cell tabular-nums">{team.lost}</TableCell>
                  
                  {/* NRR with Velocity Indicator */}
                  <TableCell className="text-center hidden md:table-cell">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-mono text-[11px] font-bold ${team.netRunRate > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {team.netRunRate > 0 ? '+' : ''}{team.netRunRate.toFixed(3)}
                      </span>
                      <div className="w-10 h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${team.netRunRate > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${Math.min(Math.abs(team.netRunRate) * 20, 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  
                  {/* Points */}
                  <TableCell className="text-center">
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="font-black text-lg text-emerald-400">{team.points}</span>
                    </div>
                  </TableCell>
                  
                  {/* Form (Desktop High-Fidelity) */}
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 px-2">
                      {team.recentForm.map((result, i) => (
                        <Tooltip key={i}>
                          <TooltipTrigger>
                            <motion.div 
                              whileHover={{ y: -2, scale: 1.1 }}
                              className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black transition-all shadow-lg
                                ${result === 'W' ? 'bg-emerald-500 text-black shadow-emerald-500/20' : 
                                  result === 'L' ? 'bg-rose-500 text-white shadow-rose-500/20' : 
                                  'bg-white/10 text-white/50 border border-white/5'}`
                              }
                            >
                              {result}
                            </motion.div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-black/90 border-emerald-500/30 backdrop-blur-md">
                            <p className="text-xs font-bold">{result === 'W' ? 'Victory' : result === 'L' ? 'Defeat' : 'No Result'}</p>
                            <p className="text-[10px] opacity-60">Match performance logged</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}
