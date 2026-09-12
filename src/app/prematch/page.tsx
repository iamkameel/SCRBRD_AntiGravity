"use client";

import { useState } from "react";
import { PreMatchReadinessBoard } from "@/components/prematch/PreMatchReadinessBoard";
import { MatchDaySquadManager } from "@/components/prematch/MatchDaySquadManager";
import { TeamSelection } from "@/components/matches/TeamSelection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Users, 
  MapPin, 
  Bus, 
  FileText, 
  Clock, 
  Calendar, 
  Download, 
  ExternalLink,
  Layers,
  Thermometer,
  CloudSun,
  Wind,
  CheckCircle2,
  AlertTriangle,
  ChevronDown
} from "lucide-react";
import { D } from "@/lib/design-system";
import Link from "next/link";
import { toast } from "sonner";

// Mock Fixture Datasets for Selector
const FIXTURES = [
  { id: 'match-101', home: 'Westville 1st XI', away: 'Kearsney 1st XI', venue: 'Westville Main Oval', time: '09:00 AM', status: 'SQUAD_PENDING' },
  { id: 'match-102', home: 'Hilton 1st XI', away: 'Michaelhouse 1st XI', venue: 'Hilton Gilfillan Field', time: '09:30 AM', status: 'CONFIRMED' },
  { id: 'match-103', home: 'St Charles 1st XI', away: 'Maritzburg College 1st XI', venue: 'St Charles Oval', time: '10:00 AM', status: 'PRE_MATCH_READY' },
];

export default function StandalonePreMatchPage() {
  const [selectedFixtureId, setSelectedFixtureId] = useState('match-101');
  const [activeTab, setActiveTab] = useState<'readiness' | 'selection' | 'ground' | 'logistics'>('readiness');

  const currentFixture = FIXTURES.find(f => f.id === selectedFixtureId) || FIXTURES[0];

  const handleExportPdf = () => {
    toast.success(`Exported Official Pre-Match Sign-Off PDF for ${currentFixture.home} vs ${currentFixture.away}`);
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Executive Section Header */}
      <SectionHeader
        title="Pre-Match Operations & Match-Day Readiness Cockpit"
        sub="Comprehensive match-day clearance board, team lineup builder, turf telemetry check, and squad transport dispatcher."
        icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Fixture Selector Dropdown */}
            <div className="relative">
              <select
                value={selectedFixtureId}
                onChange={(e) => setSelectedFixtureId(e.target.value)}
                className="h-10 pl-3 pr-8 rounded-xl font-bold text-xs border border-white/10 text-white appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-emerald-500"
                style={{ background: D.surf2 }}
              >
                {FIXTURES.map(f => (
                  <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                    {f.home} vs {f.away} ({f.time})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            <Button 
              onClick={handleExportPdf}
              variant="outline" 
              className="h-10 px-4 rounded-xl font-bold text-xs border border-white/10 hover:bg-white/5 text-white gap-2"
              style={{ background: D.surf2 }}
            >
              <Download className="w-4 h-4 text-indigo-400" />
              Print Sign-Off Sheet
            </Button>

            <Link href={`/matches/${currentFixture.id}`}>
              <Button 
                className="h-10 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Match Centre
              </Button>
            </Link>
          </div>
        }
      />

      {/* Fixture Context Banner */}
      <div 
        className="p-6 rounded-3xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[9px] font-black uppercase">
              FIXTURE STATUS: {currentFixture.status}
            </Badge>
            <span className="text-[10px] font-mono text-zinc-400">
              FIXTURE ID: {currentFixture.id}
            </span>
          </div>

          <h2 className="text-2xl font-black italic uppercase tracking-tight text-white" style={{ fontFamily: D.head }}>
            {currentFixture.home} <span style={{ color: D.textMuted }}>VS</span> {currentFixture.away}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-400">
            <span className="flex items-center gap-1.5 text-indigo-300">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {currentFixture.venue}
            </span>
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> {currentFixture.time} START
            </span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" /> SATURDAY 12 SEP 2026
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-2xl border bg-black/40 border-white/10 shrink-0">
          <div className="text-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
              GROUND CLEGG INDEX
            </span>
            <span className="text-2xl font-black italic text-emerald-400" style={{ fontFamily: D.head }}>
              92 CIV
            </span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="text-center">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block">
              SQUAD MANIFEST
            </span>
            <span className="text-2xl font-black italic text-sky-400" style={{ fontFamily: D.head }}>
              13/13 BOARDED
            </span>
          </div>
        </div>
      </div>

      {/* 4-Tab Navigation Bar */}
      <div 
        className="flex items-center gap-2 p-1.5 rounded-2xl border overflow-x-auto"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        {[
          { id: 'readiness', label: '7-Point Readiness Board', icon: ShieldCheck },
          { id: 'selection', label: 'Match-Day Selection & Lineup', icon: Users },
          { id: 'ground', label: 'Turf & Weather Intelligence', icon: MapPin },
          { id: 'logistics', label: 'Squad Transport & Manifest', icon: Bus },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap border ${
                isActive 
                  ? "bg-indigo-600 text-white border-indigo-500/50 shadow-lg shadow-indigo-600/30" 
                  : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT VIEWS */}
      {activeTab === 'readiness' && (
        <PreMatchReadinessBoard 
          matchId={currentFixture.id}
          homeTeamName={currentFixture.home}
          awayTeamName={currentFixture.away}
          hideHeader={true}
        />
      )}

      {activeTab === 'selection' && (
        <MatchDaySquadManager hideHeader={true} />
      )}

      {activeTab === 'ground' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border space-y-2 bg-black/40" style={{ borderColor: D.border }}>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                <span>CLEGG IMPACT INDEX</span>
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px]">EXCELLENT</Badge>
              </div>
              <p className="text-3xl font-black text-white italic" style={{ fontFamily: D.head }}>92 CIV</p>
              <p className="text-xs text-zinc-400">Surface compaction ideal for fast seam bounce and even footholds.</p>
            </div>

            <div className="p-5 rounded-2xl border space-y-2 bg-black/40" style={{ borderColor: D.border }}>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                <span>SOIL MOISTURE (TDM %)</span>
                <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-[9px]">OPTIMAL</Badge>
              </div>
              <p className="text-3xl font-black text-white italic" style={{ fontFamily: D.head }}>18.4%</p>
              <p className="text-xs text-zinc-400">Moisture retention uniform across good length and batting creases.</p>
            </div>

            <div className="p-5 rounded-2xl border space-y-2 bg-black/40" style={{ borderColor: D.border }}>
              <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                <span>CANOPY CUT HEIGHT</span>
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[9px]">MATCH SPEC</Badge>
              </div>
              <p className="text-3xl font-black text-white italic" style={{ fontFamily: D.head }}>4.2 mm</p>
              <p className="text-xs text-zinc-400">Kikuyu turf mowed with heavy 2-ton roller finish completed at 06:30 AM.</p>
            </div>
          </div>

          {/* Micro-Climate Sensor Widget */}
          <div className="p-6 rounded-3xl border space-y-4 bg-black/40" style={{ borderColor: D.border }}>
            <h4 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2" style={{ fontFamily: D.head }}>
              <CloudSun className="w-4 h-4 text-amber-400" /> Ground Micro-Climate & Weather Telemetry
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Ambient Temp</span>
                <p className="text-xl font-bold text-white flex items-center gap-1.5">
                  <Thermometer className="w-4 h-4 text-rose-400" /> 23°C
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Wind Velocity</span>
                <p className="text-xl font-bold text-white flex items-center gap-1.5">
                  <Wind className="w-4 h-4 text-sky-400" /> 12 km/h ENE
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Relative Humidity</span>
                <p className="text-xl font-bold text-white">58%</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Rain Probability</span>
                <p className="text-xl font-bold text-emerald-400">0%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logistics' && (
        <div className="p-6 rounded-3xl border space-y-6 bg-black/40" style={{ borderColor: D.border }}>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2" style={{ fontFamily: D.head }}>
              <Bus className="w-4 h-4 text-amber-400" /> Squad Transport Dispatch & Boarding Manifest
            </h4>
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[9px] font-mono">
              BUS V02 EN ROUTE (ETA 08:35 AM)
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h5 className="text-xs font-bold text-white uppercase">Vehicle & Driver Details</h5>
              <div className="space-y-1 text-xs text-zinc-300">
                <p><span className="text-zinc-500 font-bold">Vehicle:</span> Mercedes Sprinter V02 (Reg: KZN 882 GP)</p>
                <p><span className="text-zinc-500 font-bold">Driver:</span> Mr. S. Cele (Contact: +27 82 491 0029)</p>
                <p><span className="text-zinc-500 font-bold">Capacity:</span> 22 Seater (13/22 occupied)</p>
                <p><span className="text-zinc-500 font-bold">Departure:</span> 07:45 AM from Westville Campus</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <h5 className="text-xs font-bold text-white uppercase">Parent Guardian Notification Status</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> 13/13 Boarding SMS Delivered</span>
                  <span>07:46 AM</span>
                </div>
                <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Live GPS Tracking Broadcast Active</span>
                  <span>ONLINE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
