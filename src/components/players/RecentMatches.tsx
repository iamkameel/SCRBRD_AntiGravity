'use client';

import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, Trophy, MapPin, Activity } from "lucide-react";
import { D } from '@/lib/design-system';
import Link from "next/link";

interface RecentMatch {
  matchId: string;
  date: string;
  opponent: string;
  venue: string;
  result: 'won' | 'lost' | 'tied' | 'no-result';
  playerPerformance: {
    runs?: number;
    wickets?: number;
    catches?: number;
    ballsFaced?: number;
    overs?: number;
  };
}

interface RecentMatchesProps {
  playerId: string;
  matches?: RecentMatch[];
}

export function RecentMatches({ playerId, matches = [] }: RecentMatchesProps) {
  // Mock data for now - in production, this would fetch from the database
  const mockMatches: RecentMatch[] = matches.length > 0 ? matches : [
    {
      matchId: "m1",
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      opponent: "Mumbai Indians",
      venue: "Wankhede Stadium",
      result: "won",
      playerPerformance: {
        runs: 78,
        ballsFaced: 52,
        catches: 1
      }
    },
    {
      matchId: "m2",
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      opponent: "Knight Riders",
      venue: "Eden Gardens",
      result: "lost",
      playerPerformance: {
        runs: 34,
        ballsFaced: 28,
        wickets: 2,
        overs: 4
      }
    },
    {
      matchId: "m3",
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      opponent: "Sunrisers",
      venue: "Rajiv Gandhi Stadium",
      result: "won",
      playerPerformance: {
        runs: 102,
        ballsFaced: 64,
        catches: 2
      }
    },
    {
      matchId: "m4",
      date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
      opponent: "Capitals",
      venue: "Feroz Shah Kotla",
      result: "tied",
      playerPerformance: {
        runs: 45,
        ballsFaced: 38,
        wickets: 1,
        overs: 3
      }
    },
    {
      matchId: "m5",
      date: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      opponent: "Super Kings",
      venue: "Chepauk",
      result: "lost",
      playerPerformance: {
        runs: 23,
        ballsFaced: 19,
      }
    }
  ];

  const getResultVariant = (result: string) => {
    switch (result) {
      case 'won':
        return 'default';
      case 'lost':
        return 'destructive';
      case 'tied':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getResultIcon = (result: string) => {
    return result === 'won' ? TrendingUp : TrendingDown;
  };

  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden sh-slide-up">
      <div className="p-8 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary" style={{ fontFamily: D.mono }}>
          Operational Log (Recent)
        </h3>
        <Activity className="h-4 w-4 text-white/20" />
      </div>
      <div className="p-8">
        {mockMatches.length === 0 ? (
          <div className="text-center py-12 text-white/30">
            <Trophy className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">No recent operations logged</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mockMatches.map((match) => {
              const ResultIcon = getResultIcon(match.result);
              return (
                <Link
                  key={match.matchId}
                  href={`/matches/${match.matchId}`}
                  className="block group"
                >
                  <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] group-hover:bg-white/[0.05] group-hover:border-primary/30 transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-white/5 group-hover:bg-primary transition-colors" />
                    <div className="pl-2">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-black text-white group-hover:text-primary transition-colors tracking-tighter" style={{ fontFamily: D.head }}>
                              vs {match.opponent}
                            </h4>
                            <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 border ${
                                match.result === 'won' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                match.result === 'lost' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                'bg-white/5 text-white/60 border-white/10'
                            }`}>
                              <ResultIcon className="h-3 w-3" />
                              {match.result}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3 w-3" />
                              {new Date(match.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="h-3 w-3" />
                              {match.venue}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Performance Stats */}
                      <div className="flex flex-wrap gap-6 pt-4 border-t border-white/5">
                        {match.playerPerformance.runs !== undefined && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Runs</span>
                            <span className="text-xl font-black text-primary" style={{ fontFamily: D.head }}>
                              {match.playerPerformance.runs}
                              {match.playerPerformance.ballsFaced && (
                                <span className="text-[10px] font-bold text-white/40 ml-1 font-sans">
                                  ({match.playerPerformance.ballsFaced})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {match.playerPerformance.wickets !== undefined && match.playerPerformance.wickets > 0 && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Wickets</span>
                            <span className="text-xl font-black text-emerald-400" style={{ fontFamily: D.head }}>
                              {match.playerPerformance.wickets}
                              {match.playerPerformance.overs && (
                                <span className="text-[10px] font-bold text-white/40 ml-1 font-sans">
                                  ({match.playerPerformance.overs} ov)
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                        {match.playerPerformance.catches !== undefined && match.playerPerformance.catches > 0 && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Catches</span>
                            <span className="text-xl font-black text-white/80" style={{ fontFamily: D.head }}>{match.playerPerformance.catches}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
