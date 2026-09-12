"use client";

import React, { useState } from 'react';
import { D } from '@/lib/design-system';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { 
  Trophy, 
  Calculator, 
  Calendar, 
  GitBranch, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  TrendingUp, 
  Layers, 
  Zap,
  Play,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CompetitionStandingsTable } from '@/components/competitions/CompetitionStandingsTable';
import { NRRScenarioCalculator } from '@/components/competitions/NRRScenarioCalculator';
import { 
  calculateCompetitionStandings, 
  TeamMatchResult, 
  StandingsRow 
} from '@/lib/competitions/nrrEngine';
import { 
  generateRoundRobinFixtures, 
  generateKnockoutBracket, 
  GeneratedSchedule 
} from '@/lib/competitions/fixtureGenerator';

import { motion } from 'framer-motion';

// Mock Data for KZN Schools Super 8 Premier League
const MOCK_TEAMS = [
  { id: 't-1', name: 'Westville Boys\' High 1st XI', shortName: 'WBHS' },
  { id: 't-2', name: 'Hilton College 1st XI', shortName: 'HIL' },
  { id: 't-3', name: 'Maritzburg College 1st XI', shortName: 'MAR' },
  { id: 't-4', name: 'Kearsney College 1st XI', shortName: 'KEA' },
  { id: 't-5', name: 'Michaelhouse 1st XI', shortName: 'MHS' },
  { id: 't-6', name: 'Clifton College 1st XI', shortName: 'CLF' },
  { id: 't-7', name: 'Durban High School 1st XI', shortName: 'DHS' },
  { id: 't-8', name: 'Glenwood High 1st XI', shortName: 'GLN' }
];

const TEAM_NAMES: Record<string, string> = {
  't-1': 'Westville Boys\' High 1st XI',
  't-2': 'Hilton College 1st XI',
  't-3': 'Maritzburg College 1st XI',
  't-4': 'Kearsney College 1st XI',
  't-5': 'Michaelhouse 1st XI',
  't-6': 'Clifton College 1st XI',
  't-7': 'Durban High School 1st XI',
  't-8': 'Glenwood High 1st XI'
};

const MOCK_MATCH_RESULTS: TeamMatchResult[] = [
  // WBHS matches
  { matchId: 'm1', teamId: 't-1', teamName: 'Westville Boys\' High', opponentId: 't-4', opponentName: 'Kearsney College', outcome: 'WIN', runsScored: 275, wicketsLost: 6, oversFaced: 50.0, isAllOut: false, runsConceded: 185, wicketsTaken: 10, oversBowled: 42.3, isOpponentAllOut: true, maxMatchOvers: 50, matchDate: '2026-02-14' },
  { matchId: 'm2', teamId: 't-1', teamName: 'Westville Boys\' High', opponentId: 't-2', opponentName: 'Hilton College', outcome: 'WIN', runsScored: 242, wicketsLost: 8, oversFaced: 50.0, isAllOut: false, runsConceded: 210, wicketsTaken: 9, oversBowled: 50.0, isOpponentAllOut: false, maxMatchOvers: 50, matchDate: '2026-02-21' },
  { matchId: 'm3', teamId: 't-1', teamName: 'Westville Boys\' High', opponentId: 't-3', opponentName: 'Maritzburg College', outcome: 'WIN', runsScored: 310, wicketsLost: 4, oversFaced: 50.0, isAllOut: false, runsConceded: 198, wicketsTaken: 10, oversBowled: 44.1, isOpponentAllOut: true, maxMatchOvers: 50, matchDate: '2026-02-28' },
  
  // Hilton matches
  { matchId: 'm4', teamId: 't-2', teamName: 'Hilton College', opponentId: 't-5', opponentName: 'Michaelhouse', outcome: 'WIN', runsScored: 260, wicketsLost: 5, oversFaced: 50.0, isAllOut: false, runsConceded: 205, wicketsTaken: 10, oversBowled: 47.0, isOpponentAllOut: true, maxMatchOvers: 50, matchDate: '2026-02-14' },
  { matchId: 'm5', teamId: 't-2', teamName: 'Hilton College', opponentId: 't-1', opponentName: 'Westville Boys\' High', outcome: 'LOSS', runsScored: 210, wicketsLost: 9, oversFaced: 50.0, isAllOut: false, runsConceded: 242, wicketsTaken: 8, oversBowled: 50.0, isOpponentAllOut: false, maxMatchOvers: 50, matchDate: '2026-02-21' },
  { matchId: 'm6', teamId: 't-2', teamName: 'Hilton College', opponentId: 't-6', opponentName: 'Clifton College', outcome: 'WIN', runsScored: 288, wicketsLost: 3, oversFaced: 50.0, isAllOut: false, runsConceded: 190, wicketsTaken: 10, oversBowled: 41.2, isOpponentAllOut: true, maxMatchOvers: 50, matchDate: '2026-02-28' },

  // Maritzburg College matches
  { matchId: 'm7', teamId: 't-3', teamName: 'Maritzburg College', opponentId: 't-7', opponentName: 'DHS', outcome: 'WIN', runsScored: 220, wicketsLost: 7, oversFaced: 50.0, isAllOut: false, runsConceded: 215, wicketsTaken: 10, oversBowled: 49.5, isOpponentAllOut: true, maxMatchOvers: 50, matchDate: '2026-02-14' },
  { matchId: 'm8', teamId: 't-3', teamName: 'Maritzburg College', opponentId: 't-8', opponentName: 'Glenwood', outcome: 'WIN', runsScored: 295, wicketsLost: 4, oversFaced: 50.0, isAllOut: false, runsConceded: 230, wicketsTaken: 8, oversBowled: 50.0, isOpponentAllOut: false, maxMatchOvers: 50, matchDate: '2026-02-21' },
  { matchId: 'm9', teamId: 't-3', teamName: 'Maritzburg College', opponentId: 't-1', opponentName: 'Westville Boys\' High', outcome: 'LOSS', runsScored: 198, wicketsLost: 10, oversFaced: 44.1, isAllOut: true, runsConceded: 310, wicketsTaken: 4, oversBowled: 50.0, isOpponentAllOut: false, maxMatchOvers: 50, matchDate: '2026-02-28' },

  // Kearsney matches
  { matchId: 'm10', teamId: 't-4', teamName: 'Kearsney College', opponentId: 't-1', opponentName: 'Westville Boys\' High', outcome: 'LOSS', runsScored: 185, wicketsLost: 10, oversFaced: 42.3, isAllOut: true, runsConceded: 275, wicketsTaken: 6, oversBowled: 50.0, isOpponentAllOut: false, maxMatchOvers: 50, matchDate: '2026-02-14' },
  { matchId: 'm11', teamId: 't-4', teamName: 'Kearsney College', opponentId: 't-5', opponentName: 'Michaelhouse', outcome: 'WIN', runsScored: 250, wicketsLost: 6, oversFaced: 50.0, isAllOut: false, runsConceded: 245, wicketsTaken: 9, oversBowled: 50.0, isOpponentAllOut: false, maxMatchOvers: 50, matchDate: '2026-02-21' },
  { matchId: 'm12', teamId: 't-4', teamName: 'Kearsney College', opponentId: 't-7', opponentName: 'DHS', outcome: 'WIN', runsScored: 235, wicketsLost: 5, oversFaced: 46.2, isAllOut: false, runsConceded: 234, wicketsTaken: 10, oversBowled: 50.0, isOpponentAllOut: true, maxMatchOvers: 50, matchDate: '2026-02-28' },

  // Michaelhouse matches
  { matchId: 'm13', teamId: 't-5', teamName: 'Michaelhouse', opponentId: 't-2', opponentName: 'Hilton College', outcome: 'LOSS', runsScored: 205, wicketsLost: 10, oversFaced: 47.0, isAllOut: true, runsConceded: 260, wicketsTaken: 5, oversBowled: 50.0, isOpponentAllOut: false, maxMatchOvers: 50, matchDate: '2026-02-14' },
  { matchId: 'm14', teamId: 't-5', teamName: 'Michaelhouse', opponentId: 't-4', opponentName: 'Kearsney College', outcome: 'LOSS', runsScored: 245, wicketsLost: 9, oversFaced: 50.0, isAllOut: false, runsConceded: 250, wicketsTaken: 6, oversBowled: 50.0, isOpponentAllOut: false, maxMatchOvers: 50, matchDate: '2026-02-21' },
  
  // Clifton matches
  { matchId: 'm15', teamId: 't-6', teamName: 'Clifton College', opponentId: 't-8', opponentName: 'Glenwood', outcome: 'WIN', runsScored: 215, wicketsLost: 7, oversFaced: 49.0, isAllOut: false, runsConceded: 210, wicketsTaken: 10, oversBowled: 48.2, isOpponentAllOut: true, maxMatchOvers: 50, matchDate: '2026-02-14' },
  { matchId: 'm16', teamId: 't-6', teamName: 'Clifton College', opponentId: 't-2', opponentName: 'Hilton College', outcome: 'LOSS', runsScored: 190, wicketsLost: 10, oversFaced: 41.2, isAllOut: true, runsConceded: 288, wicketsTaken: 3, oversBowled: 50.0, isOpponentAllOut: false, maxMatchOvers: 50, matchDate: '2026-02-28' },

  // DHS matches
  { matchId: 'm17', teamId: 't-7', teamName: 'Durban High School', opponentId: 't-3', opponentName: 'Maritzburg College', outcome: 'LOSS', runsScored: 215, wicketsLost: 10, oversFaced: 49.5, isAllOut: true, runsConceded: 220, wicketsTaken: 7, oversBowled: 50.0, isOpponentAllOut: false, maxMatchOvers: 50, matchDate: '2026-02-14' },
  { matchId: 'm18', teamId: 't-7', teamName: 'Durban High School', opponentId: 't-4', opponentName: 'Kearsney College', outcome: 'LOSS', runsScored: 234, wicketsLost: 10, oversFaced: 50.0, isAllOut: true, runsConceded: 235, wicketsTaken: 5, oversBowled: 46.2, isOpponentAllOut: false, maxMatchOvers: 50, matchDate: '2026-02-28' },

  // Glenwood matches
  { matchId: 'm19', teamId: 't-8', teamName: 'Glenwood High', opponentId: 't-6', opponentName: 'Clifton College', outcome: 'LOSS', runsScored: 210, wicketsLost: 10, oversFaced: 48.2, isAllOut: true, runsConceded: 215, wicketsTaken: 7, oversBowled: 49.0, isOpponentAllOut: false, maxMatchOvers: 50, matchDate: '2026-02-14' },
  { matchId: 'm20', teamId: 't-8', teamName: 'Glenwood High', opponentId: 't-3', opponentName: 'Maritzburg College', outcome: 'LOSS', runsScored: 230, wicketsLost: 8, oversFaced: 50.0, isAllOut: false, runsConceded: 295, wicketsTaken: 4, oversBowled: 50.0, isOpponentAllOut: false, maxMatchOvers: 50, matchDate: '2026-02-21' }
];

export default function CompetitionsPage() {
  const standings: StandingsRow[] = calculateCompetitionStandings(
    MOCK_TEAMS.map(t => t.id),
    TEAM_NAMES,
    MOCK_MATCH_RESULTS
  );

  const [activeTab, setActiveTab] = useState<'standings' | 'roundrobin' | 'knockout'>('standings');
  const [calculatorOpen, setCalculatorOpen] = useState<boolean>(false);
  const [calcTargetTeamId, setCalcTargetTeamId] = useState<string>('t-1');

  // Generated schedules
  const roundRobinSchedule: GeneratedSchedule = generateRoundRobinFixtures(MOCK_TEAMS, 'kzn-super8', false);
  const knockoutSchedule: GeneratedSchedule = generateKnockoutBracket(MOCK_TEAMS, 'kzn-cup');

  const handleOpenCalculator = (targetTeamId: string) => {
    setCalcTargetTeamId(targetTeamId);
    setCalculatorOpen(true);
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Standardized Header */}
      <SectionHeader
        title="Competition Engine & Standings"
        sub="Automated standings calculations, ICC/School all-out Net Run Rate (NRR) engine, and fixture bracket generator."
        icon={<Trophy className="w-5 h-5 text-amber-400" />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleOpenCalculator('t-1')}
              className="h-10 px-4 rounded-xl font-bold text-xs bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20 gap-1.5"
            >
              <Calculator className="w-4 h-4" />
              NRR Scenario Simulator
            </Button>
          </div>
        }
      />

      {/* Top Engine Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold">
            <span>TOURNAMENT LEADER</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 text-lg font-black text-white" style={{ fontFamily: D.head }}>
            {standings[0]?.teamName.split(' ')[0]} {standings[0]?.teamName.split(' ')[1]}
          </div>
          <div className="mt-1 text-xs font-mono font-bold text-emerald-400">
            {standings[0]?.points} PTS | NRR +{standings[0]?.nrr.toFixed(3)}
          </div>
        </div>

        <div className="p-4 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold">
            <span>PLAYOFF QUALIFIERS</span>
            <Award className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 text-lg font-black text-white" style={{ fontFamily: D.head }}>
            Top 4 Schools
          </div>
          <div className="mt-1 text-xs font-bold text-indigo-300 truncate">
            {standings.slice(0, 4).map(s => s.teamName.split(' ')[0]).join(', ')}
          </div>
        </div>

        <div className="p-4 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold">
            <span>MATCHES LOGGED</span>
            <Calendar className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 text-lg font-black text-white font-mono" style={{ fontFamily: D.head }}>
            {MOCK_MATCH_RESULTS.length / 2} Matches
          </div>
          <div className="mt-1 text-xs font-bold text-sky-400">
            100% Deterministic Scored
          </div>
        </div>

        <div className="p-4 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex items-center justify-between text-muted-foreground text-xs font-bold">
            <span>NRR RULES</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-lg font-black text-white" style={{ fontFamily: D.head }}>
            ICC & School Std.
          </div>
          <div className="mt-1 text-xs font-bold text-emerald-400">
            All-Out Full-Overs Applied
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border shadow-xl backdrop-blur-xl overflow-x-auto no-scrollbar w-fit" style={{ background: D.surf1, borderColor: D.border }}>
        {[
          { id: 'standings', label: 'Automated Standings Table', icon: Trophy },
          { id: 'roundrobin', label: 'Round-Robin Schedule', icon: Calendar },
          { id: 'knockout', label: 'Knockout Bracket', icon: GitBranch },
        ].map((t) => {
          const isActive = activeTab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors duration-300 select-none ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{ fontFamily: D.head }}
            >
              {isActive && (
                <motion.div
                  layoutId="compTabPill"
                  className="absolute inset-0 rounded-xl border border-amber-500/30 bg-amber-500/15 shadow-lg shadow-amber-500/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`w-4 h-4 relative z-10 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="relative z-10 uppercase tracking-wider text-[11px]">{t.label}</span>
              {isActive && (
                <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Standings Table */}
      {activeTab === 'standings' && (
        <CompetitionStandingsTable
          leagueTitle="KZN Schools Super 8 Premier League"
          season="2026 Season"
          standings={standings}
          onOpenCalculator={handleOpenCalculator}
        />
      )}

      {/* Tab 2: Round-Robin Schedule */}
      {activeTab === 'roundrobin' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl border flex items-center justify-between" style={{ background: D.surf1, borderColor: D.border }}>
            <div>
              <h3 className="text-base font-black uppercase italic text-white" style={{ fontFamily: D.head }}>
                Round-Robin Fixture Schedule (Berger Algorithm)
              </h3>
              <p className="text-xs text-muted-foreground">
                Automatically generated balanced home/away pairings for {MOCK_TEAMS.length} schools.
              </p>
            </div>
            <Badge className="bg-sky-500/20 text-sky-300 border-sky-500/30 text-xs font-bold font-mono px-3 py-1">
              {roundRobinSchedule.totalFixtures} Total Fixtures
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roundRobinSchedule.rounds.map((round) => (
              <div key={round.roundNumber} className="rounded-2xl border p-4 space-y-3" style={{ background: D.surf2, borderColor: D.border }}>
                <div className="flex items-center justify-between border-b pb-2 border-white/10">
                  <span className="text-xs font-black text-indigo-400 uppercase italic" style={{ fontFamily: D.head }}>
                    {round.roundName}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground">{round.fixtures.length} Matches</span>
                </div>

                <div className="space-y-2">
                  {round.fixtures.map((fix) => (
                    <div key={fix.id} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-white">
                        <span className="text-emerald-400">{fix.homeTeamName.split(' ')[0]}</span>
                        <span className="text-[10px] text-slate-500 uppercase font-black">VS</span>
                        <span className="text-sky-400">{fix.awayTeamName.split(' ')[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Knockout Bracket */}
      {activeTab === 'knockout' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl border flex items-center justify-between" style={{ background: D.surf1, borderColor: D.border }}>
            <div>
              <h3 className="text-base font-black uppercase italic text-white" style={{ fontFamily: D.head }}>
                Knockout Cup Tournament Bracket
              </h3>
              <p className="text-xs text-muted-foreground">
                Seeded elimination tree for Quarter-Finals, Semi-Finals, and Grand Final.
              </p>
            </div>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-bold font-mono px-3 py-1">
              Top 8 Seeded Cup
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {knockoutSchedule.rounds.map((round, rIdx) => (
              <div key={round.roundNumber} className="space-y-4">
                <div className="text-xs font-black text-amber-400 uppercase italic tracking-wider text-center" style={{ fontFamily: D.head }}>
                  {round.roundName}
                </div>

                <div className="space-y-4">
                  {round.fixtures.map((fix) => (
                    <div key={fix.id} className="p-4 rounded-2xl border bg-black/60 border-white/10 space-y-2 shadow-xl hover:border-amber-500/40 transition-colors">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-white font-mono">{fix.homeTeamName}</span>
                        <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">TBD</span>
                      </div>
                      <div className="border-t border-white/5 pt-2 flex items-center justify-between text-xs font-bold">
                        <span className="text-white font-mono">{fix.awayTeamName}</span>
                        <span className="text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">TBD</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive NRR Scenario Calculator Modal */}
      <NRRScenarioCalculator
        open={calculatorOpen}
        onOpenChange={setCalculatorOpen}
        standings={standings}
        defaultTeamId={calcTargetTeamId}
      />
    </div>
  );
}
