"use client";

import React, { useState, useMemo } from 'react';
import { generateDrillRecommendations, PlayerAssessmentInput, DrillRecommendationResult } from '@/lib/training/drillRecommendationEngine';
import { Drill } from '@/lib/training/drillLibrary';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Zap, ShieldAlert, CheckCircle, Plus, Calendar, Clock, Award } from 'lucide-react';

interface MockPlayer {
  id: string;
  name: string;
  roleArchetype: string;
  readinessScore: number;
  attributeScores: Record<string, number>;
  medicalRestrictions?: string[];
}

const MOCK_SQUAD_PLAYERS: MockPlayer[] = [
  {
    id: 'p-1',
    name: 'Kameel Kalyan',
    roleArchetype: 'Opener',
    readinessScore: 88,
    attributeScores: {
      'strike rotation': 3,
      'defensive technique': 7,
      'gap finding': 4,
      'playing pace': 7,
    },
  },
  {
    id: 'p-2',
    name: 'David Warner',
    roleArchetype: 'Death Bowler',
    readinessScore: 92,
    attributeScores: {
      'death-over execution': 2,
      'control': 4,
      'line discipline': 6,
    },
  },
  {
    id: 'p-3',
    name: 'Kumar Sangakkara',
    roleArchetype: 'Specialist Wicketkeeper',
    readinessScore: 45, // Low readiness
    attributeScores: {
      'leg-side takes': 3,
      'glove work': 8,
    },
    medicalRestrictions: ['Sprained Wrist'],
  },
];

export function CoachTrainingPlanner() {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>(MOCK_SQUAD_PLAYERS[0].id);
  const [sessionPlanDrills, setSessionPlanDrills] = useState<Drill[]>([]);
  const [planTitle, setPlanTitle] = useState('Match Preparation Session');

  const selectedPlayer = useMemo(
    () => MOCK_SQUAD_PLAYERS.find((p) => p.id === selectedPlayerId) || MOCK_SQUAD_PLAYERS[0],
    [selectedPlayerId]
  );

  const recommendations = useMemo(() => {
    const input: PlayerAssessmentInput = {
      personId: selectedPlayer.id,
      roleArchetype: selectedPlayer.roleArchetype,
      readinessScore: selectedPlayer.readinessScore,
      attributeScores: selectedPlayer.attributeScores,
      medicalRestrictions: selectedPlayer.medicalRestrictions,
    };
    return generateDrillRecommendations(input);
  }, [selectedPlayer]);

  const totalSessionDuration = useMemo(
    () => sessionPlanDrills.reduce((sum, d) => sum + d.durationMinutes, 0),
    [sessionPlanDrills]
  );

  const handleAddDrill = (drill: Drill) => {
    if (!sessionPlanDrills.some((d) => d.id === drill.id)) {
      setSessionPlanDrills([...sessionPlanDrills, drill]);
    }
  };

  const handleRemoveDrill = (drillId: string) => {
    setSessionPlanDrills(sessionPlanDrills.filter((d) => d.id !== drillId));
  };

  return (
    <div className="space-y-8 p-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-white flex items-center gap-3">
            <Target className="w-7 h-7 text-sky-400" />
            Coach Training & Development Planner
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rules-based drill recommendations derived from skill matrix, role archetypes, and readiness safety.
          </p>
        </div>

        {/* Squad Player Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-white/10 p-2 rounded-xl">
          <span className="text-xs font-bold text-slate-400 uppercase px-2">Player:</span>
          {MOCK_SQUAD_PLAYERS.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPlayerId(p.id);
                setSessionPlanDrills([]);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedPlayerId === p.id
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/20'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Player Profile & Diagnosis */}
        <div className="space-y-6 lg:col-span-1">
          {/* Player Card */}
          <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">{selectedPlayer.name}</h3>
                <Badge variant="outline" className="mt-1 bg-sky-500/10 text-sky-400 border-sky-500/20 text-[10px] uppercase font-bold">
                  {selectedPlayer.roleArchetype}
                </Badge>
              </div>

              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400">Readiness</div>
                <div
                  className={`text-xl font-black font-mono ${
                    selectedPlayer.readinessScore >= 80
                      ? 'text-emerald-400'
                      : selectedPlayer.readinessScore >= 50
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {selectedPlayer.readinessScore}%
                </div>
              </div>
            </div>

            {/* Medical Restrictions Banner */}
            {selectedPlayer.medicalRestrictions && selectedPlayer.medicalRestrictions.length > 0 && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400">
                <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                <div className="text-xs">
                  <div className="font-bold">Medical Restriction:</div>
                  <div>{selectedPlayer.medicalRestrictions.join(', ')} (High intensity drills disabled)</div>
                </div>
              </div>
            )}

            {/* Skill Matrix Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Key Attribute Ratings (1-9)</h4>
              <div className="space-y-1.5">
                {Object.entries(selectedPlayer.attributeScores).map(([attr, score]) => (
                  <div key={attr} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5">
                    <span className="capitalize text-slate-300">{attr}</span>
                    <span
                      className={`font-mono font-bold ${
                        score >= 7 ? 'text-emerald-400' : score < 5 ? 'text-rose-400' : 'text-slate-400'
                      }`}
                    >
                      {score} / 9
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* System Diagnosis */}
          <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Automated System Diagnosis
            </h3>
            <div className="space-y-3">
              {recommendations.map((rec, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{rec.drill.name}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase font-bold ${
                        rec.recommendationType === 'weakness_remediation'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {rec.recommendationType === 'weakness_remediation' ? 'Remediation' : 'Sharpening'}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-[11px]">{rec.reason}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Middle Column: Recommended Drills */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center justify-between">
              Recommended Drill Sets
              <Badge variant="outline" className="bg-sky-500/10 text-sky-400 border-sky-500/20 text-[10px]">
                {recommendations.length} Available
              </Badge>
            </h3>

            <div className="space-y-4">
              {recommendations.map((rec) => {
                const isAdded = sessionPlanDrills.some((d) => d.id === rec.drill.id);
                return (
                  <div
                    key={rec.drill.id}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-sky-500/40 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-white">{rec.drill.name}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{rec.drill.category}</span> • <span>{rec.drill.durationMinutes} mins</span> •{' '}
                          <span
                            className={
                              rec.drill.intensity === 'High'
                                ? 'text-rose-400 font-bold'
                                : rec.drill.intensity === 'Moderate'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }
                          >
                            {rec.drill.intensity} Intensity
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] bg-slate-800 text-slate-300 border-white/10">
                        Score: {rec.developmentNeedScore}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-300">{rec.drill.description}</p>

                    <div className="p-2 rounded-lg bg-black/30 text-[11px] text-slate-400 italic">
                      🎯 Objective: {rec.drill.coachingObjective}
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleAddDrill(rec.drill)}
                      disabled={isAdded}
                      className={`w-full text-xs font-bold gap-2 ${
                        isAdded
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-sky-500 hover:bg-sky-400 text-white'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle className="w-4 h-4" /> Added to Session Plan
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Add to Session Plan
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Training Session Plan Builder */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl space-y-6">
            <div className="border-b border-white/10 pb-4 space-y-2">
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                Active Training Session Plan
              </h3>
              <input
                type="text"
                value={planTitle}
                onChange={(e) => setPlanTitle(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Duration</div>
                <div className="text-lg font-black font-mono text-sky-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {totalSessionDuration} mins
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Drills</div>
                <div className="text-lg font-black font-mono text-emerald-400">{sessionPlanDrills.length} Drills</div>
              </div>
            </div>

            {/* Selected Drills List */}
            <div className="space-y-3 min-h-[160px]">
              {sessionPlanDrills.length === 0 ? (
                <div className="text-center py-10 text-xs text-slate-500 border border-dashed border-white/10 rounded-xl">
                  No drills added yet. Click &quot;Add to Session Plan&quot; to build session.
                </div>
              ) : (
                sessionPlanDrills.map((drill, idx) => (
                  <div key={drill.id} className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between text-xs gap-3">
                    <div>
                      <div className="font-bold text-white">{idx + 1}. {drill.name}</div>
                      <div className="text-[10px] text-slate-400">{drill.durationMinutes} mins • {drill.format}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveDrill(drill.id)}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded bg-rose-500/10"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Save Action */}
            <Button
              disabled={sessionPlanDrills.length === 0}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              Save & Assign Training Plan
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
