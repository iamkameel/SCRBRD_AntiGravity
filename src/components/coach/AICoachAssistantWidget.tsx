"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BrainCircuit, Sparkles, CheckCircle2, ShieldAlert, Dumbbell, ArrowRight, UserCheck, Flame, RefreshCw } from 'lucide-react';
import { aiCoachAssistant, PlayerDiagnosis } from '@/services/aiCoachAssistant';

const SQUAD_PLAYERS = [
  { id: 'p1', name: 'Aidan Smith', role: 'Opener / Top-Order Anchor', dotBallPct: 52, strikeRate: 121, medical: ['Minor Shoulder Impingement'] },
  { id: 'p2', name: 'Luke Davies', role: 'Middle-Order Stabiliser', dotBallPct: 42, strikeRate: 98, medical: [] },
  { id: 'p3', name: 'James Anderson', role: 'Death Bowler / Strike Pace', dotBallPct: 38, strikeRate: 140, medical: ['Right Ankle Stiffness'] },
];

export function AICoachAssistantWidget() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('p1');
  const [acceptedDrills, setAcceptedDrills] = useState<Record<string, boolean>>({});

  const selectedPlayer = SQUAD_PLAYERS.find(p => p.id === selectedPlayerId) || SQUAD_PLAYERS[0];
  const diagnosis: PlayerDiagnosis = aiCoachAssistant.diagnosePlayer(
    selectedPlayer.id,
    selectedPlayer.name,
    selectedPlayer.role,
    selectedPlayer.dotBallPct,
    selectedPlayer.strikeRate,
    selectedPlayer.medical
  );

  const toggleDrillAcceptance = (drillId: string) => {
    setAcceptedDrills(prev => ({
      ...prev,
      [drillId]: !prev[drillId]
    }));
  };

  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-['Syne',sans-serif] tracking-tight">AI Coach Assistant & Training Engine</h2>
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 font-mono text-[10px]">
                <Sparkles className="w-3 h-3 mr-1" />
                Gemini 3 Pro Engine
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Role-weighted skill matrix diagnosis, medical safety checks, and micro-plan recommendations.</p>
          </div>
        </div>
      </div>

      {/* Squad Player Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono uppercase text-slate-400 font-bold">Select Player for AI Diagnosis</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SQUAD_PLAYERS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPlayerId(p.id)}
              className={`p-3 rounded-xl border text-left font-mono transition-all flex flex-col justify-between ${
                selectedPlayerId === p.id 
                  ? 'bg-cyan-500/15 border-cyan-400/50 text-white shadow-lg shadow-cyan-500/10' 
                  : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
              }`}
            >
              <div>
                <div className="font-bold text-sm text-white">{p.name}</div>
                <div className="text-[10px] text-slate-400">{p.role}</div>
              </div>
              {p.medical.length > 0 && (
                <Badge variant="outline" className="mt-2 border-amber-500/30 text-amber-400 text-[9px] w-max">
                  {p.medical.length} Restriction
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Diagnosis Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold">Primary Weakness Identified</div>
          <div className="text-amber-400 font-bold text-sm">{diagnosis.primaryWeakness}</div>
          <div className="text-slate-400 text-[11px]">Severity: <span className="text-rose-400 font-bold">{diagnosis.weaknessSeverity}</span></div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold">Primary Core Strength</div>
          <div className="text-cyan-300 font-bold text-sm">{diagnosis.primaryStrength}</div>
          <div className="text-slate-400 text-[11px]">Status: Sharpening Target</div>
        </div>

        <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-1">
          <div className="text-slate-400 text-[10px] uppercase font-bold">Medical Restrictions</div>
          {diagnosis.medicalRestrictions.length > 0 ? (
            <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{diagnosis.medicalRestrictions.join(', ')}</span>
            </div>
          ) : (
            <div className="text-emerald-400 font-bold text-sm flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Clear for Full Training
            </div>
          )}
        </div>
      </div>

      {/* Recommended Drills & Micro-Plan */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-cyan-400" /> AI-Generated Individual Training Plan ({diagnosis.recommendedDrills.length} Drills)
          </h3>
          <Button size="sm" variant="ghost" className="text-xs text-cyan-400 font-mono hover:bg-cyan-500/10">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Recalibrate Model
          </Button>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {diagnosis.recommendedDrills.map((drill) => {
            const isAccepted = !!acceptedDrills[drill.id];
            return (
              <div 
                key={drill.id} 
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
                  isAccepted 
                    ? 'bg-emerald-500/10 border-emerald-500/30' 
                    : drill.safetyCleared ? 'bg-white/5 border-white/10' : 'bg-rose-500/10 border-rose-500/30'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] font-bold">
                      {drill.category}
                    </Badge>
                    <span className="font-bold text-white text-sm">{drill.name}</span>
                    <span className="text-slate-400 text-[11px]">({drill.durationMinutes} mins)</span>
                  </div>
                  <p className="text-slate-300 font-sans text-xs">{drill.objective}</p>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1">
                    <span>Equipment: <strong className="text-slate-200">{drill.equipment.join(', ')}</strong></span>
                    <span>Confidence: <strong className="text-cyan-400">{drill.confidence}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!drill.safetyCleared ? (
                    <Badge variant="outline" className="border-rose-500/40 text-rose-400 text-[10px]">
                      Medical Hold
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => toggleDrillAcceptance(drill.id)}
                      className={isAccepted ? 'bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400' : 'bg-white/10 hover:bg-white/20 text-white'}
                    >
                      {isAccepted ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <PlusIcon className="w-3.5 h-3.5 mr-1" />}
                      {isAccepted ? 'Assigned to Plan' : 'Approve & Assign'}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
