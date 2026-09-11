"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { D } from '@/lib/design-system';
import { motion } from "framer-motion";

interface StandingEntry {
  rank: number;
  teamName: string;
  played: number;
  won: number;
  lost: number;
  drawn: number;
  nr: number;
  pts: number;
  nrr: number;
  form: ('W' | 'L' | 'D' | 'N')[];
  isQualifying?: boolean;
  isRelegation?: boolean;
}

interface StandingTableProps {
  title?: string;
  data: StandingEntry[];
}

const FormIndicator = ({ res }: { res: 'W' | 'L' | 'D' | 'N' }) => {
  const colors = {
    W: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    L: 'bg-red-500/20 text-red-400 border-red-500/30',
    D: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    N: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
  };
  
  return (
    <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-black ${colors[res]}`}>
      {res}
    </div>
  );
};

export function StandingTable({ title, data }: StandingTableProps) {
  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 px-2" style={{ fontFamily: D.syne }}>
          {title}
        </h3>
      )}
      
      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="w-12 text-center text-[10px] font-black uppercase tracking-widest text-white/40">#</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-white/40">Team</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">P</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">W</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">L</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">D</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">NR</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">NRR</TableHead>
                <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-white/40">Pts</TableHead>
                <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-white/40 pr-6">Recent Form</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((team, idx) => (
                <motion.tr
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={team.teamName}
                  className={`border-white/5 hover:bg-white/5 transition-colors group relative ${
                    team.isQualifying ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-emerald-500 shadow-[inset_10px_0_20px_-10px_rgba(16,185,129,0.05)]' : 
                    team.isRelegation ? 'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-red-500 shadow-[inset_10px_0_20px_-10px_rgba(239,68,68,0.05)]' : ''
                  }`}
                >
                  <TableCell className="text-center font-black text-white/60 text-xs" style={{ fontFamily: D.mono }}>
                    {team.rank}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold">
                        {team.teamName.charAt(0)}
                      </div>
                      <span className="font-bold text-white tracking-tight">{team.teamName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-white/80" style={{ fontFamily: D.mono }}>{team.played}</TableCell>
                  <TableCell className="text-center font-bold text-emerald-400" style={{ fontFamily: D.mono }}>{team.won}</TableCell>
                  <TableCell className="text-center font-bold text-red-400" style={{ fontFamily: D.mono }}>{team.lost}</TableCell>
                  <TableCell className="text-center font-bold text-amber-400" style={{ fontFamily: D.mono }}>{team.drawn}</TableCell>
                  <TableCell className="text-center font-bold text-white/40" style={{ fontFamily: D.mono }}>{team.nr}</TableCell>
                  <TableCell className="text-center font-bold text-blue-400" style={{ fontFamily: D.mono }}>
                    {team.nrr > 0 ? `+${team.nrr.toFixed(3)}` : team.nrr.toFixed(3)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="px-2 py-1 bg-white/10 rounded text-white font-black text-sm" style={{ fontFamily: D.mono }}>
                      {team.pts}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      {team.form.map((res, i) => (
                        <FormIndicator key={i} res={res} />
                      ))}
                    </div>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
