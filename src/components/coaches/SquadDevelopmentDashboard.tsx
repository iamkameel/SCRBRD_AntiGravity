'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Brain, 
  Target, 
  Shield, 
  Zap, 
  Dumbbell, 
  Award, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Activity, 
  Sparkles,
  Search,
  Filter,
  ArrowUpRight,
  TrendingUp,
  X
} from 'lucide-react';
import { DRILL_LIBRARY } from '@/lib/services/drillService';
import { assignInterventionAction, getSquadSkillMatrixAction } from '@/app/actions/skillActions';
import { SkillDomain } from '@/types/schema_v4';

interface PlayerMatrixRow {
  id: string;
  name: string;
  role: string;
  team: string;
  domainScores: Record<SkillDomain, number>;
  readiness: number;
  watchlistFlag?: string;
}

const DEFAULT_SQUAD: PlayerMatrixRow[] = [
  {
    id: 'player-1',
    name: 'Kameel Kalyan',
    role: 'Opener',
    team: '1st XI',
    readiness: 92,
    watchlistFlag: 'Form Spike',
    domainScores: { Batting: 88, Bowling: 45, Fielding: 82, Wicketkeeping: 30, Physical: 85, Mental: 90, Tactical: 84 }
  },
  {
    id: 'player-2',
    name: 'Liam Botha',
    role: 'New-ball Seamer',
    team: '1st XI',
    readiness: 64,
    watchlistFlag: 'Fatigue Risk',
    domainScores: { Batting: 52, Bowling: 86, Fielding: 74, Wicketkeeping: 25, Physical: 68, Mental: 72, Tactical: 78 }
  },
  {
    id: 'player-3',
    name: 'Thabo Mokoena',
    role: 'Wicketkeeper-Batter',
    team: '1st XI',
    readiness: 88,
    domainScores: { Batting: 82, Bowling: 20, Fielding: 85, Wicketkeeping: 92, Physical: 80, Mental: 85, Tactical: 82 }
  },
  {
    id: 'player-4',
    name: 'Ethan van Zyl',
    role: 'Wrist Spinner',
    team: 'Under 15A',
    readiness: 76,
    domainScores: { Batting: 48, Bowling: 84, Fielding: 65, Wicketkeeping: 20, Physical: 75, Mental: 70, Tactical: 74 }
  },
  {
    id: 'player-5',
    name: 'David Miller',
    role: 'Finisher',
    team: '1st XI',
    readiness: 95,
    domainScores: { Batting: 90, Bowling: 30, Fielding: 88, Wicketkeeping: 25, Physical: 90, Mental: 94, Tactical: 88 }
  },
];

export function SquadDevelopmentDashboard() {
  const [squad, setSquad] = useState<PlayerMatrixRow[]>(DEFAULT_SQUAD);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  // Intervention Assignment Modal State
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerMatrixRow | null>(null);
  const [selectedDrillId, setSelectedDrillId] = useState(DRILL_LIBRARY[0]?.id || '');
  const [durationWeeks, setDurationWeeks] = useState(2);
  const [notes, setNotes] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignedSuccess, setAssignedSuccess] = useState(false);

  useEffect(() => {
    async function loadSquadData() {
      try {
        const res = await getSquadSkillMatrixAction();
        if (res.success && res.squadMatrix && res.squadMatrix.length > 0) {
          setSquad(res.squadMatrix as any);
        }
      } catch (e) {
        console.error('Error fetching squad matrix:', e);
      } finally {
        setLoading(false);
      }
    }
    loadSquadData();
  }, []);

  const domains: SkillDomain[] = ['Batting', 'Bowling', 'Fielding', 'Wicketkeeping', 'Physical', 'Mental', 'Tactical'];

  // Domain Averages
  const domainAverages: Record<SkillDomain, number> = domains.reduce((acc, dom) => {
    const total = squad.reduce((sum, p) => sum + (p.domainScores[dom] || 50), 0);
    acc[dom] = Math.round(total / (squad.length || 1));
    return acc;
  }, {} as Record<SkillDomain, number>);

  const aggregateSquadCapacity = Math.round(
    squad.reduce((sum, p) => sum + p.readiness, 0) / (squad.length || 1)
  );

  const filteredSquad = squad.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || p.role.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const handleOpenIntervention = (player: PlayerMatrixRow) => {
    setSelectedPlayer(player);
    // Auto-select drill matching player's lowest domain
    let lowestDomain: SkillDomain = 'Batting';
    let lowestScore = 100;
    domains.forEach((d) => {
      if (player.domainScores[d] < lowestScore) {
        lowestScore = player.domainScores[d];
        lowestDomain = d;
      }
    });

    const matchingDrill = DRILL_LIBRARY.find((dr) => dr.category === lowestDomain) || DRILL_LIBRARY[0];
    if (matchingDrill) setSelectedDrillId(matchingDrill.id);
  };

  const handleAssignIntervention = async () => {
    if (!selectedPlayer) return;
    setAssigning(true);
    try {
      const drill = DRILL_LIBRARY.find((d) => d.id === selectedDrillId);
      const res = await assignInterventionAction({
        personId: selectedPlayer.id,
        drillId: selectedDrillId,
        drillName: drill?.name || 'Targeted Protocol',
        targetAttribute: drill?.targetAttributes[0] || 'Skill Development',
        durationWeeks,
        notes
      });
      if (res.success) {
        setAssignedSuccess(true);
        setTimeout(() => {
          setAssignedSuccess(false);
          setSelectedPlayer(null);
        }, 2000);
      }
    } catch (e) {
      console.error('Error assigning intervention:', e);
    } finally {
      setAssigning(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 65) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card border border-white/10 bg-slate-900/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase tracking-wider font-sans">
            <Users className="w-4 h-4" /> Squad Intelligence & Skill Distribution
          </div>
          <h1 className="text-3xl font-extrabold font-['Syne',sans-serif] text-white mt-1">
            Squad Development Command Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">
            Longitudinal squad skill matrix, capacity readiness, and targeted coach intervention protocols.
          </p>
        </div>

        {/* Aggregate Capacity Metric */}
        <div className="flex items-center gap-4 bg-slate-950/60 border border-white/10 p-4 rounded-2xl">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider font-sans">
              Squad Aggregate Readiness
            </span>
            <div className="text-2xl font-black text-amber-400 font-sans mt-0.5">
              {aggregateSquadCapacity}% Capacity
            </div>
          </div>
          <Activity className="w-8 h-8 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* Domain Averages Overview Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {domains.map((dom) => {
          const avg = domainAverages[dom];
          return (
            <div key={dom} className="glass-card border border-white/10 bg-slate-900/60 p-4 rounded-xl flex flex-col justify-between">
              <span className="text-[11px] text-muted-foreground font-semibold font-sans uppercase tracking-wider">{dom}</span>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-black text-white font-['Syne',sans-serif]">{avg}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getScoreColor(avg)}`}>
                  {avg >= 75 ? 'Strong' : avg >= 60 ? 'Stable' : 'Gap'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Squad Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card border border-white/10 bg-slate-900/60 p-4 rounded-2xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search player or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-semibold font-sans">Role Filter:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
          >
            <option value="All">All Roles</option>
            <option value="Opener">Openers</option>
            <option value="Seamer">Seamers</option>
            <option value="Spinner">Spinners</option>
            <option value="Batter">Batters</option>
            <option value="Wicketkeeper">Keepers</option>
          </select>
        </div>
      </div>

      {/* Squad Skill Matrix Table */}
      <div className="glass-card border border-white/10 bg-slate-900/60 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-950/80 text-muted-foreground uppercase font-bold tracking-wider font-sans">
                <th className="py-4 px-4">Player</th>
                <th className="py-4 px-3">Role</th>
                <th className="py-4 px-3 text-center">Readiness</th>
                <th className="py-4 px-3 text-center">Watchlist</th>
                {domains.map((d) => (
                  <th key={d} className="py-4 px-2 text-center">{d}</th>
                ))}
                <th className="py-4 px-4 text-right">Intervention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredSquad.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-muted-foreground text-sm">
                    No players found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSquad.map((player) => (
                  <tr key={player.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white font-['Syne',sans-serif] whitespace-nowrap">
                      {player.name}
                    </td>
                    <td className="py-3.5 px-3 text-muted-foreground whitespace-nowrap">
                      {player.role}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-block font-mono font-bold px-2.5 py-1 rounded-lg border text-xs ${getScoreColor(player.readiness)}`}>
                        {player.readiness}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {player.watchlistFlag ? (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                          player.watchlistFlag.includes('Fatigue') ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          <AlertTriangle className="w-3 h-3" />
                          {player.watchlistFlag}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[11px]">—</span>
                      )}
                    </td>
                    {domains.map((dom) => {
                      const score = player.domainScores[dom] || 50;
                      return (
                        <td key={dom} className="py-3.5 px-2 text-center">
                          <span className={`inline-block w-9 py-1 rounded font-bold font-mono text-[11px] border ${getScoreColor(score)}`}>
                            {score}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleOpenIntervention(player)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold rounded-xl text-[11px] transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Assign Protocol
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Intervention Assignment Modal */}
      {selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card border border-white/10 bg-slate-900 rounded-2xl p-6 max-w-lg w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setSelectedPlayer(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider font-sans">
                <Brain className="w-4 h-4" /> Coach Intervention Protocol
              </div>
              <h2 className="text-xl font-bold font-['Syne',sans-serif] text-white mt-1">
                Assign Drill Protocol to {selectedPlayer.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Targeted skill remediation based on 1–9 assessment deficits.
              </p>
            </div>

            {assignedSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Intervention protocol successfully assigned and logged!
              </div>
            )}

            <div className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-muted-foreground font-bold uppercase tracking-wider mb-1.5">
                  Select Drill Protocol *
                </label>
                <select
                  value={selectedDrillId}
                  onChange={(e) => setSelectedDrillId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {DRILL_LIBRARY.map((d) => (
                    <option key={d.id} value={d.id}>
                      [{d.category}] {d.name} — ({d.intensity} Intensity)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-muted-foreground font-bold uppercase tracking-wider mb-1.5">
                  Protocol Duration (Weeks)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setDurationWeeks(w)}
                      className={`py-2 rounded-xl font-bold transition-all ${
                        durationWeeks === w
                          ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                          : 'bg-slate-950 text-muted-foreground border border-white/10 hover:border-white/20'
                      }`}
                    >
                      {w} {w === 1 ? 'Week' : 'Weeks'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-muted-foreground font-bold uppercase tracking-wider mb-1.5">
                  Coach Prescription & Goal Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Focus on head stability and soft hands when rotating dot balls..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPlayer(null)}
                className="px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs font-bold text-muted-foreground hover:text-white font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAssignIntervention}
                disabled={assigning}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-lg active:scale-95 font-sans"
              >
                {assigning ? 'Assigning...' : 'Assign Protocol'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
