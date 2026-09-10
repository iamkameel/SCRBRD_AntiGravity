"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Tv, Radio, Calendar, CheckCircle2, ChevronRight, 
  Play, Users, MapPin, Trophy, Flame, Search
} from "lucide-react";
import { MOCK_MATCHES, MockMatchData } from "@/lib/mockMatchData";

export default function LiveScoringPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'LIVE' | 'SCHEDULED' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMatches = MOCK_MATCHES.filter(match => {
    const matchesTab = activeTab === 'ALL' || match.state === activeTab;
    const matchesSearch = searchQuery === '' || 
      match.homeTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.awayTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.venue.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const liveCount = MOCK_MATCHES.filter(m => m.state === 'LIVE').length;
  const scheduledCount = MOCK_MATCHES.filter(m => m.state === 'SCHEDULED').length;
  const completedCount = MOCK_MATCHES.filter(m => m.state === 'COMPLETED').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              SCRBRD Broadcast Match Engine
            </div>
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Live Match Scoring & Command Centre
            </h1>
            <p className="text-slate-300 text-sm lg:text-base leading-relaxed">
              Real-time ball-by-ball recording, interactive wagon wheel analytics, pressure intelligence, and instant scorecard distribution across school cricket fixtures.
            </p>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-3 shrink-0">
            <Link 
              href="/matches/wbhs-vs-kearsney-2026/scoring-hub"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02]"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Scorer Console (Demo)
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md overflow-x-auto">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === 'ALL' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            All Matches ({MOCK_MATCHES.length})
          </button>
          
          <button
            onClick={() => setActiveTab('LIVE')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'LIVE' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            Live Now ({liveCount})
          </button>

          <button
            onClick={() => setActiveTab('SCHEDULED')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'SCHEDULED' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            Upcoming ({scheduledCount})
          </button>

          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'COMPLETED' 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
            Completed ({completedCount})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search teams or venues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {/* Match Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMatches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>

      {filteredMatches.length === 0 && (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Tv className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No matches found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your status filter or search term.</p>
        </div>
      )}
    </div>
  );
}

function MatchCard({ match }: { match: MockMatchData }) {
  const isLive = match.state === 'LIVE';
  const isScheduled = match.state === 'SCHEDULED';
  const isCompleted = match.state === 'COMPLETED';

  return (
    <div className={`relative rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
      isLive 
        ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-emerald-500/30 hover:border-emerald-500/60 shadow-lg shadow-emerald-950/40' 
        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
    }`}>
      {/* Live Border Accent */}
      {isLive && (
        <div className="h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 w-full" />
      )}

      <div className="p-6 space-y-5">
        {/* Top Meta Line */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              {match.division} • {match.matchType}
            </span>
          </div>

          <div>
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold tracking-wider uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE INNINGS {match.currentInnings}
              </span>
            )}
            {isScheduled && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-mono font-bold uppercase">
                Upcoming
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono font-bold uppercase">
                Final Result
              </span>
            )}
          </div>
        </div>

        {/* Team Matchup & Score Display */}
        <div className="space-y-4">
          {/* Batting / Home Team */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
                {match.homeTeamName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white tracking-tight">
                  {match.homeTeamName}
                </h4>
                <p className="text-[11px] text-slate-400">{match.homeSchoolName}</p>
              </div>
            </div>

            <div className="text-right">
              {isLive ? (
                <div>
                  <span className="text-xl font-black font-mono text-emerald-400">
                    {match.liveScore.totalRuns}/{match.liveScore.wickets}
                  </span>
                  <span className="text-xs text-slate-400 font-mono block">
                    ({match.liveScore.overs}.{match.liveScore.ballsInOver} ov)
                  </span>
                </div>
              ) : isCompleted ? (
                <span className="text-lg font-bold font-mono text-slate-300">
                  {match.liveScore.totalRuns}/{match.liveScore.wickets}
                </span>
              ) : (
                <span className="text-xs text-slate-500 font-mono">Yet to Bat</span>
              )}
            </div>
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-slate-400">
                {match.awayTeamName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white tracking-tight">
                  {match.awayTeamName}
                </h4>
                <p className="text-[11px] text-slate-400">{match.awaySchoolName}</p>
              </div>
            </div>

            <div className="text-right">
              {match.liveScore.target ? (
                <div>
                  <span className="text-xs text-slate-400 font-mono block">
                    Target: <strong className="text-white">{match.liveScore.target}</strong>
                  </span>
                  {match.liveScore.requiredRunRate && (
                    <span className="text-[10px] font-mono text-emerald-400">
                      RRR: {match.liveScore.requiredRunRate}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-slate-500 font-mono">
                  {isScheduled ? "Toss at 09:15 AM" : "Fielding"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Live Striker & Bowler Teaser (if Live) */}
        {isLive && (
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="text-emerald-400 font-bold">*</span>
                <span className="font-medium text-white">{match.liveScore.striker.name}</span>
                <span className="text-slate-400">({match.liveScore.striker.runs} off {match.liveScore.striker.balls})</span>
              </div>
              <div className="text-slate-400">
                CRR: <span className="text-emerald-400 font-bold">{match.liveScore.currentRunRate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <div>
                Bowler: <span className="text-slate-200">{match.liveScore.currentBowler.name}</span>
              </div>
              <div>
                {match.liveScore.currentBowler.wickets}/{match.liveScore.currentBowler.runs} ({match.liveScore.currentBowler.overs} ov)
              </div>
            </div>
          </div>
        )}

        {/* Venue Info */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{match.venue}</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-slate-950/40 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <Link
          href={`/matches/${match.id}/manage`}
          className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <Users className="w-3.5 h-3.5" />
          Squad & Pre-Match
        </Link>

        <Link
          href={`/matches/${match.id}/scoring-hub`}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isLive 
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20' 
              : 'bg-slate-800 hover:bg-slate-700 text-white'
          }`}
        >
          {isLive ? 'Launch Scorer Console' : 'View Scoring Hub'}
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
