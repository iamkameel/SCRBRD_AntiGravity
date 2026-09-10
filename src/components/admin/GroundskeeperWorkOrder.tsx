"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shovel, CheckCircle2, FileCheck, Layers, Droplets, Gauge } from 'lucide-react';

export function GroundskeeperWorkOrder() {
  const [certified, setCertified] = useState<boolean>(true);

  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Shovel className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-['Syne',sans-serif] tracking-tight">Pitch Preparation & Field Clearance Certificate</h2>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[10px]">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Match-Day Certified
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Venue: Mitchell Field (Turf Pitch #1) • Head Groundskeeper: S. Dlamini</p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => setCertified(!certified)}
          className={certified ? "bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs" : "bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs"}
        >
          <FileCheck className="w-3.5 h-3.5 mr-1.5" />
          {certified ? 'Clearance Certified' : 'Pending Final Rolling'}
        </Button>
      </div>

      {/* Preparation Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-white/5 border border-white/5 text-xs font-mono">
        <div>
          <span className="text-slate-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-amber-400" /> Grass Cut Height
          </span>
          <span className="font-bold text-white text-sm">4.0 mm (Hard Turf)</span>
        </div>
        <div>
          <span className="text-slate-400 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-cyan-400" /> Heavy Rolling
          </span>
          <span className="font-bold text-cyan-400 text-sm">3.5 Hours (1.2 Tonne)</span>
        </div>
        <div>
          <span className="text-slate-400 flex items-center gap-1">
            <Droplets className="w-3 h-3 text-blue-400" /> Moisture Content
          </span>
          <span className="font-bold text-blue-400 text-sm">11.8% (Optimal)</span>
        </div>
        <div>
          <span className="text-slate-400 block">Outfield Mowing</span>
          <span className="font-bold text-emerald-400 text-sm">12 mm Cross-Cut</span>
        </div>
      </div>

      {/* Ground Checklist Items */}
      <div className="space-y-3">
        <div className="text-xs font-mono uppercase font-bold text-slate-400">Match Readiness Safety Verification</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <span className="text-slate-200">Pitch Markings & Crease Painting</span>
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">PASSED</Badge>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <span className="text-slate-200">Sight Screens (White/Black Cleaned)</span>
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">PASSED</Badge>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <span className="text-slate-200">Boundary Rope Placement (68m Radius)</span>
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">PASSED</Badge>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
            <span className="text-slate-200">Pitch Covers Staged on Sideline</span>
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">READY</Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
