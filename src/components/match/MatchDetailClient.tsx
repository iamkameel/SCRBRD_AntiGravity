"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Match, Team, Innings, Person, Rankings, LiveScoreProjection } from "@/types/firestore";
import { useLiveScore } from "@/hooks/useLiveScore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { D } from '@/lib/design-system';
import Link from "next/link";
import { toast } from "sonner";
import {
  ChevronLeft, Share2, RefreshCw, Play, Moon, Zap, Users,
  Activity, MapPin, Calendar, Clock, Trophy, Radio, Tv2,
  BarChart3, MessageSquare, Shield, Star, Search, Filter, Check,
  Bus, Bell, Smartphone, Send, ShieldCheck, CheckCircle2, Navigation, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/lib/auth/usePermissions";
import { parentNotificationService, ParentNotification, INITIAL_PARENT_NOTIFICATIONS } from "@/lib/services/parentNotificationService";

interface MatchDetailClientProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  players?: Person[];
  playerImpact?: Rankings.PlayerMatchImpact[];
  matchImpactEvents?: Rankings.MatchImpactEvent[];
}

type TabId = 'overview' | 'scorecard' | 'analytics' | 'impact' | 'parent_hub' | 'broadcast' | 'squads' | 'commentary';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview',   label: 'Overview',   icon: Activity },
  { id: 'scorecard',  label: 'Scorecard',  icon: BarChart3 },
  { id: 'analytics',  label: 'Analytics',  icon: Zap },
  { id: 'impact',     label: 'Impact',     icon: Star },
  { id: 'parent_hub', label: 'Parent & Bus Hub', icon: Bus },
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
      <div className="text-xl font-black tracking-tighter text-white" style={{ color, fontFamily: D.head }}>{value}</div>
      <div className="text-[8px] font-black uppercase tracking-[0.15em] text-white/25 mt-0.5">{label}</div>
    </div>
  );
}

export function MatchDetailClient({
  match, homeTeam, awayTeam, players = [], playerImpact = [], matchImpactEvents = []
}: MatchDetailClientProps) {
  const { canAccess } = usePermissions();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [commentaryFilter, setCommentaryFilter] = useState<'all' | 'wicket' | 'four' | 'six'>('all');
  const [commentaryQuery, setCommentaryQuery] = useState('');

  // Parent Hub & SMS Alerts State
  const [parentNotifications, setParentNotifications] = useState<ParentNotification[]>(INITIAL_PARENT_NOTIFICATIONS);
  const [parentPhone, setParentPhone] = useState('');
  const [smsPreferences, setSmsPreferences] = useState({
    milestones: true,
    wickets: false,
    busDeparture: true,
    matchResult: true,
  });

  useEffect(() => {
    const unsub = parentNotificationService.subscribeNotifications('TRIP-101', (notifs) => {
      if (notifs?.length) setParentNotifications(notifs);
    });
    return () => unsub();
  }, []);

  const handleSaveSmsPreferences = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentPhone || parentPhone.length < 8) {
      toast.error("Please enter a valid mobile phone number for SMS alerts");
      return;
    }
    toast.success(`Subscribed ${parentPhone} to instant match & bus SMS alerts!`);
  };

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
          const ov = ball.overNumber ?? 0;
          if (!map.has(ov)) map.set(ov, { overNumber: ov, runs: 0, wickets: 0 });
          const o = map.get(ov);
          o.runs += ball.runs ?? 0;
          if (ball.isWicket) o.wickets += 1;
        });
        map.forEach(v => overHistory.push(v));
      }
      return {
        teamId: proj.teamId || '',
        runs: proj.runs ?? 0,
        wickets: proj.wickets ?? 0,
        overs: proj.overs ?? '0.0',
        battingCard: (proj.battingCard || []).map((b: any) => ({
          playerId: b.playerId || '',
          runs: b.runs ?? 0,
          balls: b.balls ?? 0,
          fours: b.fours ?? 0,
          sixes: b.sixes ?? 0,
          dismissal: b.howOut || (b.isOut ? 'out' : 'not out'),
          isOut: b.isOut ?? false,
        })),
        bowlingCard: (proj.bowlingCard || []).map((bw: any) => ({
          playerId: bw.playerId || '',
          overs: bw.overs ?? '0.0',
          oversBowled: parseFloat(bw.overs) || 0,
          maidens: bw.maidens ?? 0,
          runs: bw.runs ?? 0,
          wickets: bw.wickets ?? 0,
        })),
        overHistory: overHistory.sort((a, b) => a.overNumber - b.overNumber),
      };
    };
    return {
      firstInnings: mapV3toV2(liveScore.currentInnings, true),
      secondInnings: mapV3toV2(liveScore.currentInnings?.target ? { runs: liveScore.currentInnings.runs, wickets: liveScore.currentInnings.wickets, overs: liveScore.currentInnings.overs } : undefined),
    };
  }, [liveScore, match.inningsData]);

  const homeTeamName = homeTeam?.name || match.homeTeamId || 'Home Team';
  const awayTeamName = awayTeam?.name || match.awayTeamId || 'Away Team';

  const getPlayerName = useCallback((id?: string) => {
    if (!id) return 'Player';
    const p = players.find(x => x.id === id);
    return p ? `${p.firstName} ${p.lastName}` : id;
  }, [players]);

  const filteredBalls = useMemo(() => {
    const history = liveScore?.ballHistory || [];
    return [...history].reverse().filter(b => {
      if (commentaryFilter === 'wicket' && !b.isWicket) return false;
      if (commentaryFilter === 'four' && b.runs !== 4) return false;
      if (commentaryFilter === 'six' && b.runs !== 6) return false;
      if (commentaryQuery) {
        const text = `${b.commentary || ''} ${getPlayerName(b.bowlerId)} ${getPlayerName(b.strikerId)}`.toLowerCase();
        if (!text.includes(commentaryQuery.toLowerCase())) return false;
      }
      return true;
    });
  }, [liveScore?.ballHistory, commentaryFilter, commentaryQuery, getPlayerName]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Match Hub link copied to clipboard");
    } else {
      toast.info("Sharing match dossier");
    }
  };

  return (
    <div className="min-h-screen pb-24 space-y-8" style={{ background: D.base }}>
      
      {/* ─── Top Bar ─── */}
      <div className="flex items-center justify-between">
        <Link href="/matches">
          <Button variant="ghost" size="sm" className="gap-2 text-white/50 hover:text-white text-xs font-bold rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <ChevronLeft className="h-4 w-4" />
            Match Centre
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toast.success("Refreshed match state")}
            className="gap-2 text-white/40 hover:text-white text-xs font-bold rounded-xl border border-white/[0.06] bg-white/[0.02]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync
          </Button>
          <Button
            size="sm"
            onClick={handleShare}
            className="gap-2 text-xs font-black uppercase tracking-widest bg-white/[0.06] border border-white/10 text-white hover:bg-white/15 rounded-xl"
          >
            <Share2 className="h-3.5 w-3.5 text-emerald-400" />
            Share
          </Button>
          {isLive && canAccess('scoring') && (
            <Link href={`/matches/${match.id}/score`}>
              <Button size="sm" className="gap-2 text-xs font-black uppercase tracking-widest bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg shadow-red-500/20">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Live Console
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* ─── Hero Match Dossier Banner ─── */}
      <div className={cn(
        "relative rounded-[2.5rem] border overflow-hidden p-8 md:p-10 transition-all duration-300",
        isLive ? "border-red-500/30 bg-gradient-to-br from-red-950/40 via-black/80 to-slate-950/80" : "border-white/[0.08] bg-white/[0.02] backdrop-blur-xl"
      )}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_100%_at_50%_-20%,rgba(34,197,94,0.06),transparent)] pointer-events-none" />
        {isLive && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />}

        <div className="relative space-y-6">
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3">
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
            <div className="flex items-center gap-2 text-white/30 ml-auto text-xs font-medium">
              <Calendar className="h-3.5 w-3.5" />
              <span>{match.dateTime ? new Date(match.dateTime).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Date TBA'}</span>
              {match.venue && (
                <>
                  <span>·</span>
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{match.venue}</span>
                </>
              )}
            </div>
          </div>

          {/* Team clash */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-2">
            {/* Home Team */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-400/80">Home Squad</div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight" style={{ fontFamily: D.head }}>
                {homeTeamName}
              </h2>
              {(isLive || isCompleted) && liveInningsData?.firstInnings && (
                <div className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">
                  {liveInningsData.firstInnings.runs}/{liveInningsData.firstInnings.wickets}
                  <span className="text-base font-bold text-white/30 ml-2">({liveInningsData.firstInnings.overs} ov)</span>
                </div>
              )}
            </div>

            {/* VS Badge */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-xs font-black text-white/40">
                VS
              </div>
            </div>

            {/* Away Team */}
            <div className="flex-1 text-center md:text-right space-y-2">
              <div className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400/80">Away Squad</div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight" style={{ fontFamily: D.head }}>
                {awayTeamName}
              </h2>
              {(isLive || isCompleted) && liveInningsData?.secondInnings && (
                <div className="text-3xl md:text-4xl font-black text-white font-mono tracking-tight">
                  {liveInningsData.secondInnings.runs}/{liveInningsData.secondInnings.wickets}
                  <span className="text-base font-bold text-white/30 ml-2">({liveInningsData.secondInnings.overs} ov)</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Ops Links */}
          <div className="pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href={`/matches/${match.id}/pre-match`}>
                <Button size="sm" variant="ghost" className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20">
                  Pre-Match Hub
                </Button>
              </Link>
              <Link href={`/matches/${match.id}/manage`}>
                <Button size="sm" variant="ghost" className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20">
                  Roster & XI Selection
                </Button>
              </Link>
            </div>
            <PrintableMatchReport matchData={{
              id: match.id,
              homeTeam: homeTeamName,
              awayTeam: awayTeamName,
              venue: match.venue || 'TBA',
              date: typeof match.matchDate === 'string' ? match.matchDate : '',
              format: match.matchType || 'T20',
              result: match.result,
            }} />
          </div>
        </div>
      </div>

      {/* ─── Navigation Tabs ─── */}
      <div className="border-b border-white/[0.08] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max pb-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors",
                  active
                    ? "text-white"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                )}
              >
                {active && (
                  <motion.div
                    layoutId="matchDetailTabPill"
                    className="absolute inset-0 bg-white/10 rounded-2xl border border-white/15 shadow-lg shadow-black/20"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon className={cn("h-3.5 w-3.5", active ? "text-emerald-400" : "text-white/30")} />
                  <span>{tab.label}</span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ─── Tab Content Views ─── */}
      <div className="space-y-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* MVP Card if available */}
            {playerImpact && playerImpact.length > 0 && (() => {
              const topMvp = [...playerImpact].sort((a, b) => b.totalImpact - a.totalImpact)[0];
              const mvpPlayer = players.find(p => p.id === topMvp.personId);
              return <MatchMVP mvp={topMvp} player={mvpPlayer} />;
            })()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Section label="Match Overview" accent="#60a5fa">
                <div className="p-5 space-y-4 text-xs font-medium text-white/70">
                  <div className="flex justify-between border-b border-white/[0.04] pb-2">
                    <span className="text-white/30 uppercase text-[9px] font-bold tracking-widest">Venue</span>
                    <span className="text-white font-bold">{match.venue || 'TBA'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.04] pb-2">
                    <span className="text-white/30 uppercase text-[9px] font-bold tracking-widest">Format</span>
                    <span className="text-white font-bold">{match.matchType || 'T20'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.04] pb-2">
                    <span className="text-white/30 uppercase text-[9px] font-bold tracking-widest">Status</span>
                    <span className="text-emerald-400 font-bold uppercase text-[10px]">{match.status || 'Scheduled'}</span>
                  </div>
                </div>
              </Section>

              <Section label="Match Impact Highlights" accent="#f59e0b">
                <div className="p-5">
                  <ImpactHighlights events={matchImpactEvents} liveScore={liveScore} />
                </div>
              </Section>

              <Section label="Live Projection" accent="#10b981">
                <div className="p-5 flex flex-col justify-center items-center text-center space-y-2 min-h-[140px]">
                  <Activity className="h-8 w-8 text-emerald-400 mb-1" />
                  <div className="text-xs font-bold text-white/80">Realtime Scorer Connected</div>
                  <div className="text-[10px] text-white/30">All scoring data auto-synced with analytics pipeline</div>
                </div>
              </Section>
            </div>
          </div>
        )}

        {/* SCORECARD TAB */}
        {activeTab === 'scorecard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {liveInningsData?.firstInnings ? (
              <ScorecardTable innings={liveInningsData.firstInnings} teamName={homeTeamName} allPlayers={players} playerImpact={playerImpact} />
            ) : (
              <div className="py-16 text-center text-white/30 font-medium border border-dashed border-white/10 rounded-2xl">
                First innings scorecard not available yet.
              </div>
            )}
            {liveInningsData?.secondInnings && (
              <ScorecardTable innings={liveInningsData.secondInnings} teamName={awayTeamName} allPlayers={players} playerImpact={playerImpact} />
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Section label="Match Momentum (Over by Over)" accent="#3b82f6">
                <div className="p-5">
                  <MatchMomentumChart matchImpactEvents={matchImpactEvents} homeTeamName={homeTeamName} awayTeamName={awayTeamName} />
                </div>
              </Section>
              <Section label="Interactive Wagon Wheel" accent="#10b981">
                <div className="p-5 flex justify-center">
                  <WagonWheel innings={liveInningsData?.firstInnings} />
                </div>
              </Section>
            </div>
          </div>
        )}

        {/* IMPACT TAB */}
        {activeTab === 'impact' && (
          <div className="animate-in fade-in duration-300">
            <ImpactTab playerImpact={playerImpact} players={players} />
          </div>
        )}

        {/* PARENT & BUS HUB TAB */}
        {activeTab === 'parent_hub' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Top Transport & Safety Header */}
            <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-black/60 to-slate-950/80 p-6 md:p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),transparent)] pointer-events-none" />
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                    <Bus className="h-4 w-4" />
                    <span>Parent & Fleet Logistics Telemetry</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight" style={{ fontFamily: D.head }}>
                    1st XI Squad Bus & Parent Notification Hub
                  </h3>
                  <p className="text-xs text-white/50 max-w-xl">
                    Real-time transport tracking, student boarding verifications, and instant SMS alerts for parents and guardians.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-wider">11/11 Players Boarded & Safe</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bus Status & Manifest */}
              <div className="lg:col-span-2 space-y-6">
                <Section label="Live Bus Manifest & Travel Status" accent="#6366f1">
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <StatPill label="Vehicle" value="Bus V02" color="#818cf8" />
                      <StatPill label="Route Status" value="EN ROUTE" color="#34d399" />
                      <StatPill label="Est. Arrival" value="08:35 AM" color="#fbbf24" />
                      <StatPill label="Driver" value="D. Roberts" color="#f472b6" />
                    </div>

                    <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Navigation className="h-5 w-5 text-indigo-400 animate-pulse" />
                        <div>
                          <div className="text-xs font-bold text-white">Current Route Location</div>
                          <div className="text-[10px] text-white/40 font-mono">N3 Highway Southbound (Km 42) · 12 mins to venue</div>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest text-indigo-300">
                        GPS Active
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Verified Passenger Boarding Manifest</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {players.slice(0, 11).map((p, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                              <span className="text-xs font-bold text-white">{p.firstName} {p.lastName}</span>
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                              BOARDED
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Live Dispatch History */}
                <Section label="Parent Notification Activity Stream" accent="#10b981">
                  <div className="p-6 space-y-4">
                    {parentNotifications.length > 0 ? (
                      parentNotifications.map((notif, idx) => (
                        <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-4">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Smartphone className="h-4 w-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-white uppercase tracking-wider">{notif.title}</span>
                              <span className="text-[9px] font-mono text-white/30">{typeof notif.sentAt === 'string' ? notif.sentAt : 'Just now'}</span>
                            </div>
                            <p className="text-xs text-white/70">{notif.message}</p>
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                {notif.channel} {notif.status}
                              </span>
                              <span className="text-[9px] text-white/30 font-medium">To: {notif.guardianName} ({notif.guardianPhone})</span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-white/30 text-xs font-bold uppercase tracking-widest">
                        No notifications sent yet
                      </div>
                    )}
                  </div>
                </Section>
              </div>

              {/* SMS Subscription Form */}
              <div className="space-y-6">
                <Section label="Subscribe to Parent SMS Alerts" accent="#f59e0b">
                  <form onSubmit={handleSaveSmsPreferences} className="p-6 space-y-5">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/50">Guardian Mobile Phone</label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                        <Input
                          type="tel"
                          placeholder="+27 82 123 4567"
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value)}
                          className="pl-10 h-11 rounded-xl bg-white/[0.04] border-white/10 text-xs font-mono text-white placeholder:text-white/20 focus-visible:ring-emerald-500"
                        />
                      </div>
                      <p className="text-[9px] text-white/30">Direct SMS updates will be delivered to this mobile number during the match.</p>
                    </div>

                    <div className="space-y-3 pt-2 border-t border-white/[0.06]">
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/40">Select Alert Triggers</div>

                      {[
                        { key: 'milestones', label: 'Milestones (50s, 100s, 5-Wkts)', desc: 'Instant SMS when a player reaches a milestone' },
                        { key: 'wickets', label: 'Wicket Alerts', desc: 'SMS on every wicket fall in the match' },
                        { key: 'busDeparture', label: 'Bus Departure & ETA Updates', desc: 'Alerts when squad bus departs or arrives' },
                        { key: 'matchResult', label: 'Match Result Summary', desc: 'Final scorecard summary SMS' },
                      ].map((item) => (
                        <div key={item.key} className="flex items-start justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                          <div className="space-y-0.5">
                            <div className="text-xs font-bold text-white">{item.label}</div>
                            <div className="text-[9px] text-white/30">{item.desc}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={(smsPreferences as any)[item.key]}
                            onChange={(e) => setSmsPreferences({ ...smsPreferences, [item.key]: e.target.checked })}
                            className="mt-1 h-4 w-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-0"
                          />
                        </div>
                      ))}
                    </div>

                    <Button type="submit" className="w-full h-11 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest text-xs gap-2 shadow-lg shadow-emerald-500/20">
                      <Bell className="h-4 w-4" />
                      Save SMS Preferences
                    </Button>
                  </form>
                </Section>
              </div>
            </div>
          </div>
        )}

        {/* BROADCAST OVERLAY TAB */}
        {activeTab === 'broadcast' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <PerformanceWorm />
            <div className="relative h-[420px] rounded-[2.5rem] border border-white/[0.08] bg-black/40 overflow-hidden flex items-center justify-center group">
              <BroadcastOverlay 
                score={`${liveScore?.currentInnings?.runs ?? 0}`} 
                wickets={liveScore?.currentInnings?.wickets ?? 0}
                overs={`${liveScore?.currentInnings?.overs ?? '0.0'}`}
              />
            </div>
          </div>
        )}

        {/* SQUADS TAB */}
        {activeTab === 'squads' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
            <Section label={`${homeTeamName} Squad`} accent="#f59e0b">
              <div className="p-5 space-y-2">
                {players.slice(0, 11).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-xs font-bold text-white">{p.firstName} {p.lastName}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{p.battingStyle || 'Batter'}</span>
                  </div>
                ))}
              </div>
            </Section>
            <Section label={`${awayTeamName} Squad`} accent="#3b82f6">
              <div className="p-5 space-y-2">
                {players.slice(11, 22).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                    <span className="text-xs font-bold text-white">{p.firstName} {p.lastName}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{p.battingStyle || 'Batter'}</span>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* COMMENTARY TAB */}
        {activeTab === 'commentary' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Search and Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-white/30 ml-1" />
                <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
                  {[
                    { id: 'all', label: 'All Balls' },
                    { id: 'wicket', label: 'Wickets' },
                    { id: 'four', label: 'Fours (4)' },
                    { id: 'six', label: 'Sixes (6)' },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setCommentaryFilter(f.id as any)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                        commentaryFilter === f.id ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
                <Input
                  placeholder="Filter commentary…"
                  value={commentaryQuery}
                  onChange={e => setCommentaryQuery(e.target.value)}
                  className="pl-9 h-9 rounded-xl bg-white/[0.04] border-white/[0.08] text-xs text-white placeholder:text-white/30 focus-visible:ring-0"
                />
              </div>
            </div>

            {/* Commentary List */}
            {filteredBalls.length > 0 ? (
              <div className="space-y-3">
                {filteredBalls.map((ball, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-4 p-4 rounded-2xl border transition-all",
                      ball.isWicket ? "bg-red-500/10 border-red-500/25" :
                      ball.runs === 6 ? "bg-amber-500/10 border-amber-500/25" :
                      ball.runs === 4 ? "bg-blue-500/10 border-blue-500/20" :
                      "bg-white/[0.025] border-white/[0.06]"
                    )}
                  >
                    <div className="w-12 text-right font-mono text-sm font-black text-white/30 flex-shrink-0 pt-0.5">
                      {ball.overNumber}.{ball.ballInOver}
                    </div>
                    <div className="flex-1">
                      <p className={cn(
                        "text-sm leading-relaxed",
                        ball.isWicket ? "text-red-400 font-bold" :
                        ball.runs === 6 ? "text-amber-400 font-bold" :
                        ball.runs === 4 ? "text-blue-400 font-semibold" :
                        "text-white/80"
                      )}>
                        {ball.commentary || `${getPlayerName(ball.bowlerId)} to ${getPlayerName(ball.strikerId)}, ${ball.runs} run${ball.runs !== 1 ? 's' : ''}.`}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-start justify-center pt-0.5">
                      {ball.isWicket && <div className="w-6 h-6 rounded-lg bg-red-500 text-white text-[9px] font-black flex items-center justify-center">W</div>}
                      {!ball.isWicket && ball.runs === 6 && <div className="w-6 h-6 rounded-lg bg-amber-500 text-black text-[9px] font-black flex items-center justify-center">6</div>}
                      {!ball.isWicket && ball.runs === 4 && <div className="w-6 h-6 rounded-lg bg-blue-500 text-white text-[9px] font-black flex items-center justify-center">4</div>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-white/[0.08]">
                <MessageSquare className="h-8 w-8 text-white/10 mb-3" />
                <p className="text-sm font-bold text-white/30 uppercase tracking-widest">No matching commentary entries</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
