'use client';

import { Match, Team } from '@/types/firestore';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, Trophy, Radio, Moon, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { D } from '@/lib/design-system';

interface MatchCardProps {
  match: Match;
  homeTeam?: Team;
  awayTeam?: Team;
  showActions?: boolean;
  variant?: 'default' | 'compact';
}

const formatDate = (date: any) => {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date?.toDate?.() ?? new Date(date);
  return new Intl.DateTimeFormat('en-ZA', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(d);
};

const statusMap: Record<string, { color: string; bg: string; border: string; label: string; pulse?: boolean }> = {
  live:        { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', label: 'LIVE', pulse: true },
  in_progress: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', label: 'LIVE', pulse: true },
  scheduled:   { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.20)', label: 'UPCOMING' },
  completed:   { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.20)', label: 'RESULT' },
  cancelled:   { color: '#f43f5e', bg: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.20)', label: 'CANCELLED' },
  postponed:   { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.20)', label: 'POSTPONED' },
};

export function MatchCard({ match, homeTeam, awayTeam, showActions = true, variant = 'default' }: MatchCardProps) {
  const statusKey = match.status?.toLowerCase() ?? 'scheduled';
  const status = statusMap[statusKey] ?? statusMap.scheduled;
  const isLive = statusKey === 'live' || statusKey === 'in_progress';
  const isCompleted = statusKey === 'completed';

  const homeAbbr = (homeTeam?.name || 'HME').substring(0, 3).toUpperCase();
  const awayAbbr = (awayTeam?.name || 'AWY').substring(0, 3).toUpperCase();

  /* ── COMPACT ── */
  if (variant === 'compact') {
    return (
      <div className={cn(
        "relative rounded-2xl border transition-all duration-300 overflow-hidden",
        "bg-white/[0.025] border-white/[0.07] hover:bg-white/[0.04] hover:border-white/20",
        isLive && "border-red-500/20"
      )}>
        {isLive && <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />}
        <div className="p-4 flex items-center gap-4">
          {/* Badge */}
          <div
            className={cn("flex-shrink-0 px-2 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest", status.pulse && "animate-pulse")}
            style={{ background: status.bg, color: status.color, borderColor: status.border }}
          >
            {status.label}
          </div>
          {/* Teams */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-black text-white/80 truncate">{homeTeam?.name || 'Home'}</span>
              {match.score?.home && <span className="text-sm font-black text-white font-mono">{match.score.home}</span>}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-black text-white/80 truncate">{awayTeam?.name || 'Away'}</span>
              {match.score?.away && <span className="text-sm font-black text-white font-mono">{match.score.away}</span>}
            </div>
          </div>
          {/* CTA */}
          {showActions && (
            <Link href={`/matches/${match.id}`} className="flex-shrink-0">
              <div className="w-8 h-8 rounded-lg border border-white/[0.08] bg-white/[0.04] flex items-center justify-center hover:bg-white/[0.1] transition-colors">
                <ChevronRight className="h-4 w-4 text-white/40" />
              </div>
            </Link>
          )}
        </div>
      </div>
    );
  }

  /* ── DEFAULT ── */
  return (
    <div className={cn(
      "relative rounded-[2rem] border overflow-hidden transition-all duration-300 group",
      "bg-white/[0.025] border-white/[0.07]",
      "hover:bg-white/[0.04] hover:border-white/20 hover:shadow-xl hover:shadow-black/30",
      isLive && "border-red-500/20 bg-red-500/[0.015]"
    )}>
      {isLive && <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />}

      {/* Header band */}
      <div className="px-6 pt-5 pb-4 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest", status.pulse && "animate-pulse")}
            style={{ background: status.bg, color: status.color, borderColor: status.border }}
          >
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
            {status.label}
          </div>
          {match.isDayNight && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black uppercase tracking-widest text-indigo-400">
              <Moon className="h-2.5 w-2.5" />
              D/N
            </div>
          )}
          {match.matchType && (
            <span className="text-[9px] font-black uppercase tracking-widest text-white/25">{match.matchType}</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 text-white/25">
          <Calendar className="h-3 w-3" />
          <span className="text-[10px] font-medium">{formatDate(match.matchDate)}</span>
          {match.matchTime && (
            <>
              <Clock className="h-3 w-3 ml-1" />
              <span className="text-[10px] font-medium">{String(match.matchTime)}</span>
            </>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="px-6 py-5 space-y-3">
        {[
          { team: homeTeam, score: match.score?.home, abbr: homeAbbr, isTossWinner: match.tossWinner === homeTeam?.id },
          { team: awayTeam,  score: match.score?.away, abbr: awayAbbr,  isTossWinner: match.tossWinner === awayTeam?.id },
        ].map((row, i) => (
          <div key={i} className={cn(
            "flex items-center justify-between p-3 rounded-xl transition-all",
            row.isTossWinner ? "bg-amber-500/5 border border-amber-500/15" : "bg-white/[0.02] border border-transparent"
          )}>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center text-[9px] font-black border transition-all group-hover:scale-105",
                row.isTossWinner
                  ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                  : "bg-white/[0.05] border-white/[0.08] text-white/40"
              )}>
                {row.abbr}
              </div>
              <span className="text-sm font-black text-white/80">{row.team?.name || (i === 0 ? 'Home Team' : 'Away Team')}</span>
              {row.isTossWinner && (
                <span className="text-[8px] font-black uppercase tracking-widest text-amber-400/60">Toss ✓</span>
              )}
            </div>
            {(isLive || isCompleted) && row.score ? (
              <span className="text-xl font-black text-white tracking-tighter" style={{ fontFamily: 'var(--font-dm-mono)' }}>{row.score}</span>
            ) : (
              <span className="text-[9px] font-black uppercase tracking-widest text-white/15">TBD</span>
            )}
          </div>
        ))}

        {/* Result */}
        {match.result && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#22c55e]/5 border border-[#22c55e]/15 mt-1">
            <Trophy className="h-3.5 w-3.5 text-[#22c55e] flex-shrink-0" />
            <span className="text-xs font-bold text-[#22c55e]/80">{match.result}</span>
          </div>
        )}

        {/* Venue */}
        {(match.venue || match.location) && (
          <div className="flex items-center gap-1.5 text-white/25 pt-1">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="text-[10px] font-medium">{match.venue || match.location}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="px-6 pb-5 pt-0 flex gap-3 border-t border-white/[0.05]">
          <div className="pt-4 flex gap-3 w-full">
            <Link href={`/matches/${match.id}`} className="flex-1">
              <Button
                variant="outline"
                className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.07] hover:border-white/20 transition-all"
              >
                View Details
                <ChevronRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
            {isLive && (
              <Link href={`/matches/${match.id}/score`} className="flex-1">
                <Button className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all">
                  <Radio className="h-3.5 w-3.5 mr-1.5" />
                  Live Score
                </Button>
              </Link>
            )}
            {statusKey === 'scheduled' && (
              <Link href={`/matches/${match.id}/pre-match`} className="flex-1">
                <Button className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  Pre-Match
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
