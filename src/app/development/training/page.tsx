'use client';

import React, { useState } from 'react';
import { Calendar, Dumbbell, Target, Plus, CheckCircle, Clock, Users, ArrowRight } from 'lucide-react';

interface DrillItem {
  id: string;
  name: string;
  category: string;
  intensity: 'Low' | 'Medium' | 'High';
  durationMins: number;
  linkedAttribute: string;
}

const DRILL_LIBRARY: DrillItem[] = [
  { id: 'd1', name: 'Drop & Run Strike Rotation', category: 'Batting', intensity: 'Medium', durationMins: 15, linkedAttribute: 'Strike Rotation' },
  { id: 'd2', name: 'Yorker Target Grid', category: 'Bowling', intensity: 'High', durationMins: 20, linkedAttribute: 'Death Over Execution' },
  { id: 'd3', name: 'Slip Catching Reaction Box', category: 'Fielding', intensity: 'High', durationMins: 15, linkedAttribute: 'High & Slip Catching' },
  { id: 'd4', name: 'Leg-Side Deflection Takes', category: 'Wicketkeeping', intensity: 'Medium', durationMins: 20, linkedAttribute: 'Glovework & Takes' },
  { id: 'd5', name: 'Between-Wickets Acceleration Sets', category: 'Physical', intensity: 'High', durationMins: 15, linkedAttribute: 'Speed & Acceleration' },
  { id: 'd6', name: '12-Ball Spin Rotation Scenario', category: 'Batting', intensity: 'Medium', durationMins: 20, linkedAttribute: 'Playing Spin' },
];

export default function TrainingPlannerPage() {
  const [sessionTitle, setSessionTitle] = useState('');
  const [team, setTeam] = useState('1st XI');
  const [sessionDate, setSessionDate] = useState('2026-09-15');
  const [selectedDrillIds, setSelectedDrillIds] = useState<string[]>(['d1', 'd2']);
  const [coachNotes, setCoachNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const toggleDrill = (id: string) => {
    setSelectedDrillIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const totalDuration = selectedDrillIds.reduce((sum, id) => {
    const drill = DRILL_LIBRARY.find((d) => d.id === id);
    return sum + (drill ? drill.durationMins : 0);
  }, 0);

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <main className="min-h-screen bg-[#0B0F17] text-white p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <Dumbbell className="w-4 h-4" /> Coach Development Hub
          </div>
          <h1 className="text-3xl font-bold text-white mt-1">Training Session Planner</h1>
          <p className="text-sm text-gray-400 mt-1">
            Build structured training sessions linked to player development needs and drill taxonomy.
          </p>
        </div>

        <button
          onClick={handleSaveSession}
          disabled={!sessionTitle.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-gray-950 font-bold text-sm rounded-xl transition-colors shadow-lg"
        >
          <CheckCircle className="w-4 h-4" /> Save Training Plan
        </button>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-semibold">
          <CheckCircle className="w-5 h-5" /> Training session saved and assigned to team log!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column — Session Details Form */}
        <div className="lg:col-span-1 bg-[#161D2F] border border-gray-800 rounded-2xl p-6 space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" /> Session Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Session Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Death Bowling & Strike Rotation Block"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0B0F17] border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Target Squad / Unit
              </label>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0B0F17] border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="1st XI">1st XI Squad</option>
                <option value="2nd XI">2nd XI Squad</option>
                <option value="Under 15A">Under 15A Squad</option>
                <option value="Batting Unit">Batting Unit Only</option>
                <option value="Bowling Unit">Bowling Unit Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Scheduled Date
              </label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0B0F17] border border-gray-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Coach Objectives & Notes
              </label>
              <textarea
                rows={3}
                placeholder="Key coaching points, scenario goals..."
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#0B0F17] border border-gray-700 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Total Duration</span>
              <span className="font-bold text-amber-400">{totalDuration} mins</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400 flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Selected Drills</span>
              <span className="font-bold text-white">{selectedDrillIds.length} drills</span>
            </div>
          </div>
        </div>

        {/* Right Column — Drill Selection Library */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" /> Drill Taxonomy Library
            </h2>
            <span className="text-xs text-gray-400 font-semibold">{DRILL_LIBRARY.length} available drills</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DRILL_LIBRARY.map((drill) => {
              const isSelected = selectedDrillIds.includes(drill.id);
              return (
                <div
                  key={drill.id}
                  onClick={() => toggleDrill(drill.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-400 text-white shadow-lg'
                      : 'bg-[#161D2F] border-gray-800 text-gray-300 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        {drill.category}
                      </span>
                      <h3 className="font-bold text-sm text-white mt-1.5">{drill.name}</h3>
                    </div>
                    <div className={`p-1.5 rounded-full border ${isSelected ? 'bg-amber-400 text-gray-950 border-amber-400' : 'border-gray-700 text-gray-600'}`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-800/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {drill.durationMins} mins
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      drill.intensity === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'
                    }`}>
                      {drill.intensity} Intensity
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-400">
                    Target Attribute: <strong className="text-gray-200">{drill.linkedAttribute}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
