"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Printer, Shield, FileText, CheckCircle2, User, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TeamSheetPlayer {
  id: string;
  name: string;
  role: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  isWicketkeeper?: boolean;
  medicalNote?: string;
  shirtNumber: number;
}

const MOCK_PLAYING_XI: TeamSheetPlayer[] = [
  { id: 'p1', name: 'Aidan Smith', role: 'Opener / Batter', isCaptain: true, shirtNumber: 7 },
  { id: 'p2', name: 'Luke Davies', role: 'Opener / Batter', shirtNumber: 12 },
  { id: 'p3', name: 'Michael Ross', role: 'Top-Order Batter', shirtNumber: 4 },
  { id: 'p4', name: 'Oliver Harris', role: 'Wicketkeeper-Batter', isWicketkeeper: true, shirtNumber: 1 },
  { id: 'p5', name: 'Matthew Miller', role: 'Batting All-Rounder', isViceCaptain: true, shirtNumber: 18 },
  { id: 'p6', name: 'James Anderson', role: 'Fast Bowler', shirtNumber: 99 },
  { id: 'p7', name: 'Daniel Coetzee', role: 'Finger Spinner', shirtNumber: 21 },
  { id: 'p8', name: 'Sipho Zulu', role: 'Seam Bowler', medicalNote: 'Restricted: Max 6 overs per spell', shirtNumber: 11 },
  { id: 'p9', name: 'Ethan Botha', role: 'Bowler', shirtNumber: 15 },
  { id: 'p10', name: 'Kagiso Maseko', role: 'Batter', shirtNumber: 9 },
  { id: 'p11', name: 'Mark Vance', role: 'All-Rounder', shirtNumber: 3 },
];

const MOCK_RESERVES: TeamSheetPlayer[] = [
  { id: 'p12', name: 'Jordan Smith', role: '12th Man / Fielder', shirtNumber: 22 },
  { id: 'p13', name: 'David Khumalo', role: 'Standby Bowler', shirtNumber: 14 },
];

export function MatchDayTeamSheet() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6 print:bg-white print:text-black print:p-0 print:border-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6 print:border-black">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 print:hidden">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-['Syne',sans-serif] tracking-tight print:text-black">Official Match-Day Team Sheet</h2>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[10px] print:hidden">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Head Coach Approved
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 print:text-gray-600">St John&apos;s College 1st XI vs King Edward VII School • Mitchell Field</p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={handlePrint}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs print:hidden"
        >
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          Print / Export Team Sheet PDF
        </Button>
      </div>

      {/* Fixture Metadata Box */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/5 border border-white/10 text-xs font-mono print:bg-gray-100 print:text-black print:border-gray-300">
        <div>
          <span className="text-slate-400 block print:text-gray-500">Date & Time</span>
          <span className="font-bold text-white print:text-black">10 March 2026 • 09:30 AM</span>
        </div>
        <div>
          <span className="text-slate-400 block print:text-gray-500">Competition</span>
          <span className="font-bold text-amber-400 print:text-black">Gauteng 1st XI Premier League</span>
        </div>
        <div>
          <span className="text-slate-400 block print:text-gray-500">Match Format</span>
          <span className="font-bold text-cyan-400 print:text-black">50-Over Limited Overs</span>
        </div>
        <div>
          <span className="text-slate-400 block print:text-gray-500">Umpire Assignments</span>
          <span className="font-bold text-white print:text-black">R. Gibson & P. Mthembu</span>
        </div>
      </div>

      {/* Playing XI Table */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase font-bold text-slate-400 print:text-black">Starting Playing XI</div>
        <div className="border border-white/10 rounded-xl overflow-hidden print:border-gray-400">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-white/5 text-slate-400 border-b border-white/10 print:bg-gray-200 print:text-black print:border-gray-400">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Player Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Designation</th>
                <th className="p-3">Medical / Clearance Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-gray-300">
              {MOCK_PLAYING_XI.map((p, idx) => (
                <tr key={p.id} className="hover:bg-white/5 print:hover:bg-transparent">
                  <td className="p-3 font-bold text-indigo-400 print:text-black">{p.shirtNumber}</td>
                  <td className="p-3 font-bold text-white print:text-black">{p.name}</td>
                  <td className="p-3 text-slate-300 print:text-black">{p.role}</td>
                  <td className="p-3">
                    {p.isCaptain && <Badge className="bg-amber-500 text-slate-950 font-bold text-[9px] mr-1">CAPTAIN (C)</Badge>}
                    {p.isViceCaptain && <Badge className="bg-slate-400 text-slate-950 font-bold text-[9px] mr-1">VICE CAPTAIN (VC)</Badge>}
                    {p.isWicketkeeper && <Badge className="bg-cyan-500 text-slate-950 font-bold text-[9px]">WK</Badge>}
                  </td>
                  <td className="p-3 text-amber-400 print:text-gray-700">
                    {p.medicalNote ? (
                      <span className="flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 print:hidden" />
                        {p.medicalNote}
                      </span>
                    ) : (
                      <span className="text-slate-500 print:text-gray-400">Full Clearance</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reserves */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase font-bold text-slate-400 print:text-black">12th Man & Reserves</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MOCK_RESERVES.map(p => (
            <div key={p.id} className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs font-mono print:bg-gray-100 print:border-gray-300 print:text-black">
              <div>
                <span className="font-bold text-white print:text-black">#{p.shirtNumber} {p.name}</span>
                <div className="text-slate-400 text-[11px] print:text-gray-600">{p.role}</div>
              </div>
              <Badge variant="outline" className="bg-slate-950 text-slate-400 border-white/10 print:border-gray-400 print:text-black">
                RESERVE
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Official Signatures Box */}
      <div className="pt-6 border-t border-white/10 grid grid-cols-2 md:grid-cols-3 gap-6 font-mono text-xs print:border-black">
        <div className="space-y-6">
          <div className="text-slate-400 print:text-gray-600">Head Coach Signature:</div>
          <div className="border-b border-white/20 pb-1 text-slate-300 print:border-black print:text-black">G. Steyn (Head Coach)</div>
        </div>
        <div className="space-y-6">
          <div className="text-slate-400 print:text-gray-600">Team Manager Signature:</div>
          <div className="border-b border-white/20 pb-1 text-slate-300 print:border-black print:text-black">R. Botha (Master i/c Cricket)</div>
        </div>
        <div className="space-y-6">
          <div className="text-slate-400 print:text-gray-600">Match Umpire Confirmation:</div>
          <div className="border-b border-white/20 pb-1 text-slate-300 print:border-black print:text-black">R. Gibson (Official Umpire)</div>
        </div>
      </div>
    </Card>
  );
}
