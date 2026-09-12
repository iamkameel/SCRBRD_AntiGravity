"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ClipboardCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  Award, 
  TrendingUp, 
  Sparkles,
  Save
} from "lucide-react";
import { D } from "@/lib/design-system";

export interface DrillItem {
  id: string;
  name: string;
  category: string;
  targetFocus: string;
  completedStatus: "COMPLETED" | "PARTIAL" | "SKIPPED";
  observation?: string;
  effectivenessScore: number; // 1-9
}

export interface TrainingSessionLoggerProps {
  squadName?: string;
  sessionDate?: string;
  initialDrills?: DrillItem[];
  onSaveSession?: (log: any) => void;
}

export function TrainingSessionLogger({
  squadName = "1st XI Squad",
  sessionDate = new Date().toISOString().split("T")[0],
  initialDrills = [
    { id: "d-1", name: "Drop-and-Run Strike Rotation", category: "BATTING", targetFocus: "Gap Awareness & Speed", completedStatus: "COMPLETED", effectivenessScore: 8, observation: "Excellent footwork on leg-side drop" },
    { id: "d-2", name: "Yorker Target Grid Series", category: "BOWLING", targetFocus: "Death-Over Execution", completedStatus: "COMPLETED", effectivenessScore: 7, observation: "Consistently hit block hole 4/6 balls" },
    { id: "d-3", name: "Standing-Up Stumping Reaction", category: "WICKETKEEPING", targetFocus: "Reaction & Soft Hands", completedStatus: "PARTIAL", effectivenessScore: 6, observation: "Struggled slightly on leg-side takes" }
  ],
  onSaveSession
}: TrainingSessionLoggerProps) {
  const [drills, setDrills] = useState<DrillItem[]>(initialDrills);
  const [sessionNotes, setSessionNotes] = useState<string>("High intensity session focusing on tactical decision-making and pressure handling.");
  const [saved, setSaved] = useState<boolean>(false);

  const handleStatusChange = (id: string, status: "COMPLETED" | "PARTIAL" | "SKIPPED") => {
    setDrills(prev => prev.map(d => d.id === id ? { ...d, completedStatus: status } : d));
  };

  const handleScoreChange = (id: string, score: number) => {
    setDrills(prev => prev.map(d => d.id === id ? { ...d, effectivenessScore: score } : d));
  };

  const handleSave = () => {
    const sessionLog = {
      squadName,
      sessionDate,
      drills,
      sessionNotes,
      loggedAt: new Date().toISOString()
    };
    if (onSaveSession) onSaveSession(sessionLog);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const completedCount = drills.filter(d => d.completedStatus === "COMPLETED").length;
  const complianceRate = Math.round((completedCount / drills.length) * 100);

  return (
    <Card 
      className="p-6 md:p-8 border rounded-3xl shadow-2xl space-y-6"
      style={{ background: D.surf1, borderColor: D.border }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b pb-6" style={{ borderColor: D.border }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <ClipboardCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight" style={{ fontFamily: D.head }}>
                COACH TRAINING SESSION LOGGER
              </h2>
              <Badge className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                STAGE 5 WORKFLOW
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              LOG DRILL COMPLIANCE • RECORD OBSERVED PLAYER RESPONSE • UPDATE DEVELOPMENT TRENDS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right font-mono">
            <span className="text-[10px] text-zinc-400 block uppercase">COMPLIANCE RATE</span>
            <span className="text-xl font-black text-emerald-400">{complianceRate}%</span>
          </div>
          <Button
            onClick={handleSave}
            className="bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-xs tracking-wider px-5 py-2.5 rounded-xl gap-2 shadow-lg"
          >
            <Save className="w-4 h-4" />
            {saved ? "Logged!" : "Save Session Log"}
          </Button>
        </div>
      </div>

      {/* Drill Compliance Items */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
          ASSIGNED DRILL DRILLDOWN ({drills.length} DRILLS)
        </h3>

        <div className="space-y-3">
          {drills.map((drill) => (
            <div 
              key={drill.id}
              className="p-4 rounded-2xl bg-black/40 border space-y-3"
              style={{ borderColor: D.border }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Badge className="bg-zinc-800 text-zinc-300 border border-white/10 text-[9px] font-mono">
                    {drill.category}
                  </Badge>
                  <span className="text-sm font-bold text-white">{drill.name}</span>
                  <span className="text-xs text-zinc-400 font-mono">({drill.targetFocus})</span>
                </div>

                <div className="flex items-center gap-2">
                  {(["COMPLETED", "PARTIAL", "SKIPPED"] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(drill.id, status)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-black uppercase transition-all border ${
                        drill.completedStatus === status
                          ? status === "COMPLETED" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : status === "PARTIAL" ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                            : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                          : "bg-black/20 text-zinc-500 border-white/5 hover:text-zinc-300"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">Coach Observation</label>
                  <input
                    type="text"
                    value={drill.observation || ""}
                    onChange={e => {
                      const val = e.target.value;
                      setDrills(prev => prev.map(d => d.id === drill.id ? { ...d, observation: val } : d));
                    }}
                    placeholder="Note technical response, tempo, or fatigue..."
                    className="w-full p-2 rounded-xl bg-black border border-white/10 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-zinc-400 block mb-1">Effectiveness Rating ({drill.effectivenessScore}/9)</label>
                  <input
                    type="range"
                    min={1}
                    max={9}
                    value={drill.effectivenessScore}
                    onChange={e => handleScoreChange(drill.id, parseInt(e.target.value))}
                    className="w-full accent-amber-400 mt-2"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Notes */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider block">
          OVERALL SESSION SUMMARY & FEEDBACK
        </label>
        <textarea
          value={sessionNotes}
          onChange={e => setSessionNotes(e.target.value)}
          rows={3}
          className="w-full p-3.5 rounded-2xl bg-black/60 border border-white/10 text-xs text-white font-mono leading-relaxed"
          placeholder="Enter squad-wide coaching observations..."
        />
      </div>
    </Card>
  );
}
