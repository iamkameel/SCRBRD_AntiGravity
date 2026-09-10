"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bus, MapPin, Phone, UserCheck, Clock, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TransportPassenger {
  id: string;
  name: string;
  role: 'Player' | 'Coach' | 'Manager' | 'Scorer';
  boardedDeparture: boolean;
  boardedReturn: boolean;
}

const MOCK_PASSENGERS: TransportPassenger[] = [
  { id: 'tp-1', name: 'G. Steyn', role: 'Coach', boardedDeparture: true, boardedReturn: false },
  { id: 'tp-2', name: 'R. Botha', role: 'Manager', boardedDeparture: true, boardedReturn: false },
  { id: 'tp-3', name: 'Aidan Smith', role: 'Player', boardedDeparture: true, boardedReturn: false },
  { id: 'tp-4', name: 'Luke Davies', role: 'Player', boardedDeparture: true, boardedReturn: false },
  { id: 'tp-5', name: 'Michael Ross', role: 'Player', boardedDeparture: true, boardedReturn: false },
  { id: 'tp-6', name: 'Oliver Harris', role: 'Player', boardedDeparture: true, boardedReturn: false },
  { id: 'tp-7', name: 'Matthew Miller', role: 'Player', boardedDeparture: true, boardedReturn: false },
  { id: 'tp-8', name: 'James Anderson', role: 'Player', boardedDeparture: true, boardedReturn: false },
];

export function TransportManifestCard() {
  const [passengers, setPassengers] = useState<TransportPassenger[]>(MOCK_PASSENGERS);

  const toggleBoarding = (id: string, leg: 'boardedDeparture' | 'boardedReturn') => {
    setPassengers(prev =>
      prev.map(p => (p.id === id ? { ...p, [leg]: !p[leg] } : p))
    );
  };

  const totalBoarded = passengers.filter(p => p.boardedDeparture).length;

  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Bus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-['Syne',sans-serif] tracking-tight">Official School Transport Manifest</h2>
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-mono text-[10px]">
                Vehicle #BUS-04 (22 Seater)
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Fixture: Hilton College Away • Departure: 06:45 AM from Main Quad</p>
          </div>
        </div>

        <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono text-xs px-3 py-1">
          {totalBoarded} / {passengers.length} Boarded
        </Badge>
      </div>

      {/* Driver & Route Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-white/5 border border-white/5 text-xs font-mono">
        <div>
          <span className="text-slate-400 block">Assigned Driver</span>
          <span className="font-bold text-white text-sm">Mr Thomas Sithole</span>
          <div className="text-cyan-400 flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3" /> +27 82 555 1928
          </div>
        </div>
        <div>
          <span className="text-slate-400 block">Registration & Fleet ID</span>
          <span className="font-bold text-amber-400 text-sm">GP 882 SJ-GP</span>
          <div className="text-slate-400 text-[11px] mt-0.5">Mercedes Sprinter 22-Seater</div>
        </div>
        <div>
          <span className="text-slate-400 block">Scheduled Timetable</span>
          <div className="text-white font-bold flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> Dep: 06:45 AM | Ret: 18:30 PM
          </div>
        </div>
      </div>

      {/* Passenger Boarding Checklist */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase font-bold text-slate-400 flex justify-between items-center">
          <span>Passenger Manifest & Roll Call</span>
          <span className="text-[10px] text-cyan-400 font-normal">Tap to check student boarding</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {passengers.map(p => (
            <div 
              key={p.id}
              onClick={() => toggleBoarding(p.id, 'boardedDeparture')}
              className={cn(
                "p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-xs font-mono",
                p.boardedDeparture
                  ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                  : "bg-white/5 border-white/5 text-slate-400 hover:border-white/20"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]",
                  p.boardedDeparture ? "bg-emerald-500 text-slate-950" : "bg-slate-950 text-slate-500 border border-white/10"
                )}>
                  {p.boardedDeparture ? '✓' : '—'}
                </div>
                <div>
                  <div className="font-bold text-white">{p.name}</div>
                  <div className="text-[10px] text-slate-400">{p.role}</div>
                </div>
              </div>

              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px]",
                  p.boardedDeparture ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                )}
              >
                {p.boardedDeparture ? 'BOARDED' : 'PENDING'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
