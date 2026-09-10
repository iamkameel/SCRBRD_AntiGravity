"use client";

import { useState, useMemo } from "react";
import { Match, Team, Innings, Person, Rankings, LiveScoreProjection } from "@/types/firestore";
import { useLiveScore } from "@/hooks/useLiveScore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ManhattanChart } from "@/components/charts/ManhattanChart";
import { WormChart } from "@/components/charts/WormChart";
import { WagonWheel } from "@/components/charts/WagonWheel";
import { ScoreOverlay } from "@/components/match/ScoreOverlay";
import { ScorecardTable } from "@/components/match/ScorecardTable";
import { ImpactTab } from "@/components/match/ImpactTab";
import { ImpactHighlights } from "@/components/match/ImpactHighlights";
import { MatchMVP } from "@/components/match/MatchMVP";
import { MatchMomentumChart } from "@/components/match/MatchMomentumChart";
import { PrintableMatchReport } from "@/components/match/PrintableMatchReport";
import { PerformanceWorm } from "@/components/analytics/PerformanceWorm";
import { BroadcastOverlay } from "@/components/broadcast/BroadcastOverlay";
import { D, GlobalStyles } from "@/lib/scoring/theme";
import Link from "next/link";
import {
  ChevronLeft, Share2, RefreshCw, Play, Moon, Zap, Users,
  Activity, MapPin, Calendar, Clock, Trophy, Radio, Tv2,
  BarChart3, MessageSquare, Shield, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchDetailClientProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  players?: Person[];
  playerImpact?: Rankings.PlayerMatchImpact[];
  matchImpactEvents?: Rankings.MatchImpactEvent[];
}

type TabId = 'overview' | 'scorecard' | 'analytics' | 'commentary' | 'impact' | 'squads' | 'broadcast';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview',   label: 'Overview',   icon: Activity },
  { id: 'scorecard',  label: 'Scorecard',  icon: BarChart3 },
  { id: 'analytics',  label: 'Analytics',  icon: Zap },
  { id: 'impact',     label: 'Impact',     icon: Star },
  { id: 'broadcast',  label: 'Broadcast',  icon: Tv2 },
  { id: 'squads',     label: 'Squads',     icon: Users },
  { id: 'commentary', label: 'Commentary', icon: MessageSquare },
];

/* ── Minimal section label ── */
const Lbl = ({ children }: { children: React.ReactNode }) => (
  <div style={{ fontFamily: D.sans, fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: D.textMuted }}>
    {children}
  </div>
);

/* ── Section card wrapper ── */
function Section({ label, children, accent }: { label?: string; children: React.ReactNode; accent?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] overflow-hidden">
      {label && (
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2" style={{ background: accent ? `${accent}08` : 'transparent' }}>
          <Lbl>{label}</Lbl>
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Stat pill ── */
function StatPill({ label, value, color = D.textSecondary }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
      <div className="text-xl font-black tracking-tighter" style={{ color, fontFamily: D.head }}>{value}</div>
      <div className="text-[8px] font-black uppercase tracking-[0.15em] text-white/25 mt-0.5">{label}</div>
    </div>
  );
}

export function MatchDetailClient({
  match, homeTeam, awayTeam, players = [], playerImpact = [], matchImpactEvents = []
}: MatchDetailClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const { liveScore, loading: liveLoading } = useLiveScore(match.id);

  const currentMatch = liveScore ? { ...match, ...liveScore } : match;
  const isLive = match.status === 'live' || match.status === 'in_progress';
  const isCompleted = match.status === 'completed';

  /* ── innings mapping ── */
  const liveInningsData = useMemo(() => {
    if (!liveScore) return match.inningsData;
    const mapV3toV2 = (proj?: any, isCurrent?: boolean): Innings | undefined => {
      if (!proj) return undefined;
      const overHistory: any[] = [];
      const src = isCurrent ? liveScore.ballHistory : proj.ballHistory;
      if (src?.length) {
        const map = new Map<number, any>();
        src.forEach((ball: any) => {
          const oNum = ball.overNumber ?? Math.floor(ball.ballIndex / 6);
          if (!map.has(oNum)) map.set(oNum, { overNumber: oNum + 1, runsConceded: 0, wicketsTaken: 0, balls: [] });
          const o = map.get(oNum);
          o.runsConceded += (ball.runs || 0) + (ball.extraRuns || 0);
          if (ball.isWicket) o.wicketsTaken += 1;
          o.balls.push(ball);
        });
        overHistory.push(...Array.from(map.values()).sort((a, b) => a.overNumber - b.overNumber));
      }
      return {
        teamId: proj.battingTeamId || '',
        runs: proj.runs || 0, wickets: proj.wickets || 0, overs: proj.overs || 0,
        batsmen: proj.batsmen?.map((b: any) => ({ playerId: b.playerId, runs: b.runs || 0, ballsFaced: b.ballsFaced || 0, fours: b.fours || 0, sixes: b.sixes || 0, strikeRate: b.strikeRate || 0, isOut: b.isOut || false, dismissal: b.dismissal?.description || '' })),
        bowlers: proj.bowlers?.map((b: any) => ({ playerId: b.playerId, overs: b.overs || 0, maidens: b.maidens || 0, runsConceded: b.runsConceded || 0, wickets: b.wickets || 0, economy: b.economy || 0 })),
        extras: proj.extras ? { wides: proj.extras.wides || 0, noballs: proj.extras.noBalls || 0, byes: proj.extras.byes || 0, legbyes: proj.extras.legByes || 0 } : { wides: 0, noballs: 0, byes: 0, legbyes: 0 },
        overHistory,
      } as Innings;
    };
    return {
      firstInnings:  liveScore.innings1 ? mapV3toV2(liveScore.innings1) : mapV3toV2(liveScore.inningsNumber === 1 ? liveScore.currentInnings : undefined, true),
      secondInnings: liveScore.innings2 ? mapV3toV2(liveScore.innings2) : mapV3toV2(liveScore.inningsNumber === 2 ? liveScore.currentInnings : undefined, true),
    };
  }, [liveScore, match.inningsData]);

  const hasInningsData = !!(liveInningsData?.firstInnings);
  const homeTeamName = homeTeam?.name || "Home Team";
  const awayTeamName = awayTeam?.name || "Away Team";
  const homeAbbr = homeTeam?.abbreviatedName || homeTeamName.substring(0, 3).toUpperCase();
  const awayAbbr = awayTeam?.abbreviatedName || awayTeamName.substring(0, 3).toUpperCase();

  const getPlayerName = (id: string) => {
    const p = players.find(p => p.id === id);
    return p ? `${p.firstName} ${p.lastName}` : 'Unknown';
  };

  const mvp = [...playerImpact].sort((a, b) => b.totalImpact - a.totalImpact)[0];
  const mvpPlayer = mvp ? players.find(p => p.id === mvp.personId) : undefined;

  const homeRoster  = useMemo(() => players.filter(p => (homeTeam as any)?.playerIds?.includes(p.id)), [players, homeTeam]);
  const awayRoster  = useMemo(() => players.filter(p => (awayTeam as any)?.playerIds?.includes(p.id)), [players, awayTeam]);
  const displayPlayers = useMemo(() => players.length > 0 ? players : [
    { id: '1', firstName: 'Player', lastName: 'One' } as Person,
    { id: '2', firstName: 'Player', lastName: 'Two' } as Person,
  ], [players]);

  /* ── Broadcast helper ── */
  const mockBattingTeam = {
    name: liveScore?.inningsNumber === 2 ? awayTeamName : homeTeamName,
    shortName: liveScore?.inningsNumber === 2 ? awayAbbr : homeAbbr,
    score: `${liveScore?.currentInnings?.runs || 0}/${liveScore?.currentInnings?.wickets || 0}`,
    overs: liveScore?.currentInnings?.overs?.toString() || "0.0",
    color: "bg-fox-gold",
  };
  const mockBowlingTeam = {
    name: liveScore?.inningsNumber === 2 ? homeTeamName : awayTeamName,
    shortName: liveScore?.inningsNumber === 2 ? homeAbbr : awayAbbr,
    score: liveScore?.inningsNumber === 2 ? `${liveScore.innings1?.runs || 0}/${liveScore.innings1?.wickets || 0}` : "0/0",
    overs: liveScore?.inningsNumber === 2 ? liveScore.innings1?.overs?.toString() || "0.0" : "0.0",
    color: "bg-fox-blue",
  };

  const reportData = {
    id: match.id,
    homeTeam: homeTeamName, awayTeam: awayTeamName,
    venue: match.venue || 'TBA',
    date: match.dateTime ? new Date(match.dateTime).toLocaleDateString() : 'Date TBA',
    format: match.matchType || 'T20',
    result: match.result,
    totalRuns: (liveInningsData?.firstInnings?.runs || 0) + (liveInningsData?.secondInnings?.runs || 0),
    totalWickets: (liveInningsData?.firstInnings?.wickets || 0) + (liveInningsData?.secondInnings?.wickets || 0),
    batsmen: [
      ...(liveInningsData?.firstInnings?.batsmen || []),
      ...(liveInningsData?.secondInnings?.batsmen || []),
    ].map(b => ({ name: getPlayerName(b.playerId), runs: b.runs, balls: b.ballsFaced, fours: b.fours || 0, sixes: b.sixes || 0, strikeRate: b.strikeRate || 0 })).sort((a, b) => b.runs - a.runs).slice(0, 10),
    bowlers: [
      ...(liveInningsData?.firstInnings?.bowlers || []),
      ...(liveInningsData?.secondInnings?.bowlers || []),
    ].map(b => ({ name: getPlayerName(b.playerId), overs: b.overs || 0, runs: b.runsConceded, wickets: b.wickets || 0, economy: b.economy || 0 })).sort((a, b) => b.wickets - a.wickets).slice(0, 10),
  };

  /* ═════════════════════════════════════════════════════════ RENDER */
  return (
    <div style={{ background: D.base, minHeight: '100vh', paddingBottom: '80px', color: D.textPrimary }}>
      <GlobalStyles />

      {/* ── Sticky top nav ── */}
      <div className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          <Link
            href="/matches"
            className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors group"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Matches</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href={`/matches/${match.id}/pre-match`}>
              <Button size="sm" variant="ghost" className="h-8 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition-all">
                Pre-Match
              </Button>
            </Link>
            <Link href={`/matches/${match.id}/score`}>
              <Button size="sm" className="h-8 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest bg-[#22c55e]/15 border border-[#22c55e]/25 text-[#22c55e] hover:bg-[#22c55e]/25 transition-all">
                <Play className="h-3 w-3 mr-1.5 fill-current" />
                Start Scoring
              </Button>
            </Link>
            <PrintableMatchReport matchData={reportData} />
            <button className="h-8 w-8 rounded-xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/[0.07] transition-all">
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* ══ MATCH HERO ══ */}
        <div className={cn(
          "relative rounded-[2.5rem] border overflow-hidden p-8 md:p-10",
          isLive ? "border-red-500/20 bg-red-500/[0.015]" : "border-white/[0.07] bg-white/[0.02]"
        )}>
          {/* background ambient */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_100%_at_50%_-20%,rgba(34,197,94,0.05),transparent)] pointer-events-none" />
          {isLive && (
            <>
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_100%_at_50%_-20%,rgba(239,68,68,0.04),transparent)] pointer-events-none" />
            </>
          )}

          <div className="relative">
            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest",
                  isLive && "animate-pulse"
                )}
                style={{
                  background: isLive ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.04)',
                  color: isLive ? '#ef4444' : D.textSecondary,
                  borderColor: isLive ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)',
                }}
              >
                {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
                {match.status || 'Scheduled'}
              </div>
              {match.isDayNight && (
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border bg-indigo-500/10 border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest">
                  <Moon className="h-2.5 w-2.5" />
                  Day / Night
                </div>
              )}
              {match.matchType && (
                <div className="px-2.5 py-1.5 rounded-xl border border-white/[0.07] bg-white/[0.03] text-[9px] font-black uppercase tracking-widest text-white/30">
                  {match.matchType}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-white/25 ml-auto">
                <Calendar className="h-3 w-3" />
                <span className="text-[10px] font-medium">
                  {match.dateTime ? new Date(match.dateTime).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Date TBA'}
                </span>
                {match.venue && (
                  <>
                    <span className="text-white/15">·</span>
                    <MapPin className="h-3 w-3" />
                    <span className="text-[10px] font-medium">{match.venue}</span>
                  </>
                )}
              </div>
            </div>

            {/* Team clash */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 mb-8">
              {/* Home */}
              <div className="flex-1 text-center md:text-left">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Home</div>
                <div className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-amber-400 leading-none" style={{ fontFamily: 'var(--font-syne)' }}>
                  {homeTeamName}
                </div>
                {(isLive || isCompleted) && liveInningsData?.firstInnings && (
                  <div className="mt-3 text-3xl font-black tracking-tighter text-white" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                    {liveInningsData.firstInnings.runs}/{liveInningsData.firstInnings.wickets}
                    <span className="text-base font-bold text-white/30 ml-2">({liveInningsData.firstInnings.overs})</span>
                  </div>
                )}
              </div>

              {/* VS divider */}
              <div className="flex-shrink-0 flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl border border-white/[0.08] bg-white/[0.03] flex items-center justify-center">
                  <span className="text-xs font-black uppercase tracking-widest text-white/30">VS</span>
                </div>
                {isLive && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-red-400">Live</span>
                  </div>
                )}
              </div>

              {/* Away */}
              <div className="flex-1 text-center md:text-right">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20 mb-2">Away</div>
                <div className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-blue-400 leading-none" style={{ fontFamily: 'var(--font-syne)' }}>
                  {awayTeamName}
                </div>
                {(isLive || isCompleted) && liveInningsData?.secondInnings && (
                  <div className="mt-3 text-3xl font-black tracking-tighter text-white md:text-right" style={{ fontFamily: 'var(--font-dm-mono)' }}>
                    {liveInningsData.secondInnings.runs}/{liveInningsData.secondInnings.wickets}
                    <span className="text-base font-bold text-white/30 ml-2">({liveInningsData.secondInnings.overs})</span>
                  </div>
                )}
              </div>
            </div>

            {/* Result banner */}
            {match.result && (
              <div className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#22c55e]/8 border border-[#22c55e]/20">
                <Trophy className="h-4 w-4 text-[#22c55e]" />
                <span className="text-sm font-black text-[#22c55e]/90">{match.result}</span>
              </div>
            )}

            {/* Live run rate stats strip */}
            {isLive && liveScore && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <StatPill label="Run Rate" value={liveScore.currentInnings?.runRate?.toFixed(2) || '0.00'} color={D.sky} />
                <StatPill label="Req. Rate" value={'—'} color={D.rose} />
                <StatPill label="Extras"   value={liveScore.extras?.total || 0} color={D.amber} />
                <StatPill label="Innings"  value={liveScore.inningsNumber || 1} color={D.textSecondary} />
              </div>
            )}
          </div>
        </div>

        {/* ══ TAB BAR ══ */}
        <div className="relative">
          <div className="flex gap-1 overflow-x-auto scrollbar-none border border-white/[0.07] bg-white/[0.02] rounded-2xl p-1">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-200 flex-shrink-0",
                    isActive
                      ? "bg-white/[0.08] text-white border border-white/15 shadow-lg"
                      : "text-white/30 hover:text-white/60 hover:bg-white/[0.04] border border-transparent"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ══ CONTENT GRID ══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ─ Left (main) ─ */}
          <div className="lg:col-span-8 space-y-6">

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
                <Section label="Impact Highlights">
                  <ImpactHighlights events={matchImpactEvents} />
                </Section>

                {mvp ? (
                  <MatchMVP mvp={mvp} player={mvpPlayer} />
                ) : (
                  <Section>
                    <div className="p-6 flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                        <Star className="h-6 w-6 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/60 mb-1">Projected Match MVP</div>
                        <div className="text-2xl font-black text-white/80 tracking-tight" style={{ fontFamily: 'var(--font-syne)' }}>Star Player</div>
                        <div className="text-[10px] text-white/30 mt-0.5">MVP will be determined once match data is available</div>
                      </div>
                    </div>
                  </Section>
                )}

                <Section label="Match Momentum">
                  <div className="p-5">
                    <MatchMomentumChart matchImpactEvents={matchImpactEvents} homeTeamName={homeTeamName} awayTeamName={awayTeamName} />
                  </div>
                </Section>

                {hasInningsData ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Section label="Run Rate — Manhattan">
                      <div className="p-5">
                        <ManhattanChart innings={liveInningsData!.firstInnings as any} />
                      </div>
                    </Section>
                    <Section label="Innings Progression — Worm">
                      <div className="p-5">
                        <WormChart innings1={liveInningsData!.firstInnings as any} innings2={liveInningsData!.secondInnings as any} team1Name={homeTeamName} team2Name={awayTeamName} />
                      </div>
                    </Section>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-white/[0.07]">
                    <Activity className="h-8 w-8 text-white/10 mb-3" />
                    <p className="text-sm font-bold text-white/25 uppercase tracking-widest">Awaiting Match Data</p>
                    <p className="text-xs text-white/15 mt-1">Charts will populate once scoring begins</p>
                  </div>
                )}
              </div>
            )}

            {/* SCORECARD */}
            {activeTab === 'scorecard' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
                {hasInningsData ? (
                  <>
                    {liveInningsData!.firstInnings && (
                      <ScorecardTable innings={liveInningsData!.firstInnings} teamName={liveInningsData!.firstInnings.teamId === homeTeam?.id ? homeTeamName : awayTeamName} allPlayers={displayPlayers} playerImpact={playerImpact} />
                    )}
                    {liveInningsData!.secondInnings && (
                      <ScorecardTable innings={liveInningsData!.secondInnings} teamName={liveInningsData!.secondInnings.teamId === homeTeam?.id ? homeTeamName : awayTeamName} allPlayers={displayPlayers} playerImpact={playerImpact} />
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-white/[0.07]">
                    <BarChart3 className="h-8 w-8 text-white/10 mb-3" />
                    <p className="text-sm font-bold text-white/25 uppercase tracking-widest">No Scorecard Yet</p>
                  </div>
                )}
              </div>
            )}

            {/* ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
                {hasInningsData ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Section label={`Wagon Wheel — ${homeTeamName}`}>
                        <div className="p-5"><WagonWheel innings={liveInningsData!.firstInnings as any} /></div>
                      </Section>
                      {liveInningsData!.secondInnings && (
                        <Section label={`Wagon Wheel — ${awayTeamName}`}>
                          <div className="p-5"><WagonWheel innings={liveInningsData!.secondInnings as any} /></div>
                        </Section>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Section label="Run Rate — Manhattan">
                        <div className="p-5"><ManhattanChart innings={liveInningsData!.firstInnings as any} /></div>
                      </Section>
                      <Section label="Innings Worm">
                        <div className="p-5">
                          <WormChart innings1={liveInningsData!.firstInnings as any} innings2={liveInningsData!.secondInnings as any} team1Name={homeTeamName} team2Name={awayTeamName} />
                        </div>
                      </Section>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-white/[0.07]">
                    <Zap className="h-8 w-8 text-white/10 mb-3" />
                    <p className="text-sm font-bold text-white/25 uppercase tracking-widest">No Analytics Yet</p>
                  </div>
                )}
              </div>
            )}

            {/* IMPACT */}
            {activeTab === 'impact' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-400">
                <Section label="Player Impact Breakdown">
                  <ImpactTab playerImpact={playerImpact} players={displayPlayers} />
                </Section>
              </div>
            )}

            {/* SQUADS */}
            {activeTab === 'squads' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
                {[
                  { label: `${homeTeamName} Squad`, roster: homeRoster, accent: '#EAB308' },
                  { label: `${awayTeamName} Squad`, roster: awayRoster, accent: '#3B82F6' },
                ].map(({ label, roster, accent }) => (
                  <Section key={label} label={label} accent={accent}>
                    <div className="p-2">
                      {roster.length > 0 ? roster.map(player => (
                        <Link key={player.id} href={`/players/${player.id}`}>
                          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group cursor-pointer">
                            <div className="w-9 h-9 rounded-xl border border-white/[0.08] bg-white/[0.04] flex items-center justify-center text-[10px] font-black text-white/40 flex-shrink-0 group-hover:text-white/70 transition-colors">
                              {player.firstName[0]}{player.lastName[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-black text-white/80 group-hover:text-white transition-colors truncate">{player.firstName} {player.lastName}</div>
                              <div className="text-[9px] font-black uppercase tracking-widest text-white/25">{player.battingStyle || 'Player'}</div>
                            </div>
                          </div>
                        </Link>
                      )) : (
                        <div className="py-10 text-center">
                          <Users className="h-7 w-7 text-white/10 mx-auto mb-2" />
                          <p className="text-xs text-white/25 font-medium">No players assigned</p>
                        </div>
                      )}
                    </div>
                  </Section>
                ))}
              </div>
            )}

            {/* COMMENTARY */}
            {activeTab === 'commentary' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-400">
                {(liveScore?.ballHistory || []).length > 0 ? (
                  [...(liveScore?.ballHistory || [])].reverse().map((ball, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex gap-4 p-4 rounded-2xl border transition-all",
                        ball.isWicket ? "bg-red-500/5 border-red-500/15" :
                        ball.runs === 6 ? "bg-amber-500/5 border-amber-500/15" :
                        ball.runs === 4 ? "bg-blue-500/5 border-blue-500/10" :
                        "bg-white/[0.02] border-white/[0.06]"
                      )}
                    >
                      <div className="w-12 text-right font-mono text-sm font-black text-white/25 flex-shrink-0 pt-0.5">
                        {ball.overNumber}.{ball.ballInOver}
                      </div>
                      <div className="flex-1">
                        <p className={cn(
                          "text-sm leading-relaxed",
                          ball.isWicket ? "text-red-400 font-bold" :
                          ball.runs === 6 ? "text-amber-400 font-bold" :
                          ball.runs === 4 ? "text-blue-400 font-semibold" :
                          "text-white/70"
                        )}>
                          {ball.commentary || `${getPlayerName(ball.bowlerId)} to ${getPlayerName(ball.strikerId)}, ${ball.runs} run${ball.runs !== 1 ? 's' : ''}.`}
                        </p>
                      </div>
                      <div className="flex-shrink-0 w-6 flex items-start justify-center pt-0.5">
                        {ball.isWicket && <div className="w-5 h-5 rounded-lg bg-red-500 text-white text-[8px] font-black flex items-center justify-center">W</div>}
                        {!ball.isWicket && ball.runs === 6 && <div className="w-5 h-5 rounded-lg bg-amber-500 text-black text-[8px] font-black flex items-center justify-center">6</div>}
                        {!ball.isWicket && ball.runs === 4 && <div className="w-5 h-5 rounded-lg bg-blue-500 text-white text-[8px] font-black flex items-center justify-center">4</div>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-white/[0.07]">
                    <MessageSquare className="h-8 w-8 text-white/10 mb-3" />
                    <p className="text-sm font-bold text-white/25 uppercase tracking-widest">No Commentary Yet</p>
                  </div>
                )}
              </div>
            )}

            {/* BROADCAST */}
            {activeTab === 'broadcast' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-400">
                <PerformanceWorm />
                <div className="relative h-[400px] rounded-[2.5rem] border border-white/[0.07] bg-black/40 overflow-hidden flex items-center justify-center group">
                  <div className="text-center z-10">
                    <div className="w-16 h-16 rounded-2xl bg-[#22c55e]/15 border border-[#22c55e]/25 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                      <Tv2 className="h-7 w-7 text-[#22c55e]" />
                    </div>
                    <p className="text-xl font-black text-white uppercase tracking-[-0.02em]" style={{ fontFamily: 'var(--font-syne)' }}>
                      Broadcast <span className="text-[#22c55e]">Overlay</span>
                    </p>
                    <p className="text-xs text-white/30 mt-2 font-medium">TV-style live match theatre</p>
                  </div>
                  <BroadcastOverlay
                    score={(currentMatch as any).currentInnings?.runs?.toString() || "142"}
                    wickets={(currentMatch as any).currentInnings?.wickets || 3}
                    overs={(currentMatch as any).currentInnings?.overs?.toString() || "15.4"}
                    batterName="Liam Peterson"
                    batterRuns={48}
                    batterBalls={32}
                    bowlerName="K. Rabada"
                    bowlerFigures="3.4-0-22-2"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ─ Right sidebar ─ */}
          <div className="lg:col-span-4 space-y-5">
            {/* Match Info */}
            <Section label="Match Info">
              <div className="p-5 space-y-4">
                {[
                  { label: 'Format',   value: match.matchType || 'T20' },
                  { label: 'Venue',    value: match.venue || 'TBA' },
                  { label: 'Toss',     value: match.tossWinnerId ? `${match.tossWinnerId} elected to ${match.tossDecision}` : 'TBA' },
                  { label: 'Umpires',  value: match.umpires?.join(', ') || 'TBA' },
                  { label: 'Referee',  value: match.referee || 'TBA' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-start gap-4 pb-4 border-b border-white/[0.04] last:border-0 last:pb-0">
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/25 flex-shrink-0 mt-0.5">{label}</span>
                    <span className="text-xs font-bold text-white/60 text-right">{value}</span>
                  </div>
                ))}
              </div>
            </Section>

            {/* Key Live Stats */}
            {(isLive || isCompleted) && (
              <Section label="Key Stats">
                <div className="p-4 grid grid-cols-2 gap-3">
                  <div className="flex flex-col items-center px-3 py-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                    <div className="text-2xl font-black tracking-tighter text-[#60a5fa]" style={{ fontFamily: D.head }}>
                      {liveScore?.currentInnings?.runRate?.toFixed(1) || '0.0'}
                    </div>
                    <div className="text-[7px] font-black uppercase tracking-[0.15em] text-white/20 mt-1">Run Rate</div>
                  </div>
                  <div className="flex flex-col items-center px-3 py-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                    <div className="text-2xl font-black tracking-tighter text-[#EAB308]" style={{ fontFamily: D.head }}>
                      {liveScore?.extras?.total || 0}
                    </div>
                    <div className="text-[7px] font-black uppercase tracking-[0.15em] text-white/20 mt-1">Extras</div>
                  </div>
                  <div className="flex flex-col items-center px-3 py-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                    <div className="text-2xl font-black tracking-tighter text-[#22c55e]" style={{ fontFamily: D.head }}>
                      {(liveInningsData?.firstInnings?.wickets || 0) + (liveInningsData?.secondInnings?.wickets || 0)}
                    </div>
                    <div className="text-[7px] font-black uppercase tracking-[0.15em] text-white/20 mt-1">Wickets</div>
                  </div>
                  <div className="flex flex-col items-center px-3 py-4 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                    <div className="text-2xl font-black tracking-tighter text-white/80" style={{ fontFamily: D.head }}>
                      {(liveInningsData?.firstInnings?.runs || 0) + (liveInningsData?.secondInnings?.runs || 0)}
                    </div>
                    <div className="text-[7px] font-black uppercase tracking-[0.15em] text-white/20 mt-1">Total Runs</div>
                  </div>
                </div>
              </Section>
            )}

            {/* Quick actions */}
            <Section label="Actions">
              <div className="p-4 space-y-2.5">
                <Link href={`/matches/${match.id}/score`}>
                  <Button className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all justify-start gap-3">
                    <Play className="h-4 w-4 text-[#22c55e]" />
                    Start Scoring
                  </Button>
                </Link>
                <Link href={`/matches/${match.id}/pre-match`}>
                  <Button className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all justify-start gap-3">
                    <Shield className="h-4 w-4 text-[#60a5fa]" />
                    Pre-Match Setup
                  </Button>
                </Link>
                <Link href={`/matches/${match.id}/manage`}>
                  <Button className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/[0.04] border border-white/[0.08] text-white/60 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all justify-start gap-3">
                    <Radio className="h-4 w-4 text-[#a78bfa]" />
                    Live Management
                  </Button>
                </Link>
              </div>
            </Section>
          </div>
        </div>
      </div>

      {/* Sticky Score Overlay */}
      <ScoreOverlay
        battingTeam={mockBattingTeam}
        bowlingTeam={mockBowlingTeam}
        matchStatus={typeof currentMatch.result === 'object' ? (currentMatch.result as any).resultText : (currentMatch.result || 'Live')}
        recentBalls={(liveScore?.currentOver || []).map(b => b.isWicket ? 'W' : b.runs.toString())}
      />
    </div>
  );
}
