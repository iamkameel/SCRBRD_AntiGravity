"use client";

import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Activity, ArrowRight, Clock, ChevronRight, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { Match } from "@/types/firestore";
import { 
  getLiveMatchesAction, 
  getRecentMatchesAction, 
  getUpcomingMatchesAction 
} from "@/app/actions/matchActions";
import { 
  filterMatchesByRole,
  getMatchStatusColor,
  getMatchStatusText,
  formatMatchDateTime,
  getMatchScore,
  RoleContext
} from "@/lib/utils/fixtureUtils";
import { cn } from "@/lib/utils";
import { useDashboard } from "@/contexts/DashboardContext";
import { D } from "@/lib/design-system";
import { motion, AnimatePresence } from "framer-motion";

interface FixtureCentreCardProps {
  role: string;
  teamId?: string;
  schoolId?: string;
  playerId?: string;
  assignedMatches?: string[];
  fieldId?: string;
  maxMatches?: number;
  className?: string;
}

export default function FixtureCentreCard({
  role,
  teamId,
  schoolId,
  playerId,
  assignedMatches,
  fieldId,
  maxMatches = 5,
  className
}: FixtureCentreCardProps) {
  const [activeTab, setActiveTab] = useState<string>("live");
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const { filters } = useDashboard();

  const mergedSchoolId = filters.schoolId !== 'all' ? filters.schoolId : schoolId;
  const mergedSeasonId = filters.seasonId !== 'all' ? filters.seasonId : undefined;

  const roleContext = useMemo<RoleContext>(() => ({
    teamId,
    schoolId: mergedSchoolId,
    playerId,
    assignedMatches,
    seasonId: mergedSeasonId
  }), [teamId, mergedSchoolId, playerId, assignedMatches, mergedSeasonId]);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      
      try {
        const [live, recent, upcoming] = await Promise.all([
          getLiveMatchesAction(),
          getRecentMatchesAction(maxMatches * 2),
          getUpcomingMatchesAction(maxMatches * 2)
        ]);

        const filteredLive = filterMatchesByRole(live, role, roleContext);
        const filteredRecent = filterMatchesByRole(recent, role, roleContext).slice(0, maxMatches);
        const filteredUpcoming = filterMatchesByRole(upcoming, role, roleContext).slice(0, maxMatches);

        setLiveMatches(filteredLive);
        setRecentMatches(filteredRecent);
        setUpcomingMatches(filteredUpcoming);
        
        if (filteredLive.length === 0 && activeTab === 'live') {
          if (filteredUpcoming.length > 0) setActiveTab('upcoming');
          else if (filteredRecent.length > 0) setActiveTab('results');
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();

    const interval = setInterval(async () => {
      const live = await getLiveMatchesAction();
      const filteredLive = filterMatchesByRole(live, role, roleContext);
      setLiveMatches(filteredLive);
    }, 30000);

    return () => clearInterval(interval);
  }, [role, roleContext, maxMatches, activeTab, filters]);

  const renderMatchList = (matches: Match[], type: 'live' | 'results' | 'upcoming') => {
    if (loading) {
      return (
        <div className="space-y-4 py-8">
           {[1, 2, 3].map((i) => (
             <div 
               key={`skeleton-${i}`} 
               className="h-24 rounded-2xl animate-pulse" 
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}
             />
           ))}
        </div>
      );
    }

    if (matches.length === 0) {
      return (
        <div className="py-24 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center gap-6" style={{ background: D.surf2, borderColor: D.border }}>
          <div className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-inner" style={{ background: D.surf1, border: `1px solid ${D.border}` }}>
            <Activity className="h-8 w-8 opacity-20" />
          </div>
          <div>
            <p className="text-[12px] font-black uppercase tracking-[0.3em]" style={{ color: D.textPrimary }}>
                {type === 'live' ? 'NO ACTIVE OPERATIONS' : type === 'results' ? 'NO ARCHIVED DATA' : 'NO SCHEDULED FIXTURES'}
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-40 px-8" style={{ color: D.textMuted }}>
                Strategic cycle complete. No matching records found in the current temporal window.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid gap-4 mt-8">
        <AnimatePresence mode="popLayout">
          {matches.map((match, idx) => (
            <motion.div
              key={`${match.id}-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link href={`/matches/${match.id}`} className="block group">
                <div 
                  className="flex items-center justify-between p-6 rounded-2xl border transition-all relative overflow-hidden group-hover:bg-black/5"
                  style={{ background: D.surf2, border: `1px solid ${D.border}` }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity pointer-events-none" style={{ background: `linear-gradient(90deg, ${type === 'live' ? D.rose : D.indigo}, transparent)` }} />
                  
                  {/* Strategic Scoring Hub */}
                  <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_1fr] gap-4 sm:gap-12 items-center">
                    <div className="text-right">
                      <span className="text-sm font-black uppercase italic tracking-tighter sm:text-2xl truncate block group-hover:translate-x-[-8px] transition-all duration-300" style={{ fontFamily: D.head, color: D.textPrimary }}>
                        {match.homeTeamName}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: D.textMuted }}>HOME UNIT</span>
                    </div>

                    <div className="flex flex-col items-center min-w-[140px]">
                      {type === 'upcoming' ? (
                        <div 
                          className="px-6 py-2 rounded-xl text-[10px] font-black tracking-[0.4em] border shadow-inner italic"
                          style={{ background: D.surf1, borderColor: D.border, color: D.textMuted }}
                        >
                          VERSUS
                        </div>
                      ) : (
                        <div 
                          className="text-2xl font-black italic tracking-tighter px-6 py-2 rounded-xl shadow-2xl border flex items-center gap-3 transition-transform group-hover:scale-110"
                          style={{ 
                            background: type === 'live' ? `${D.rose}10` : D.surf1, 
                            color: type === 'live' ? D.rose : D.textPrimary,
                            borderColor: type === 'live' ? `${D.rose}30` : D.border,
                            fontFamily: D.mono
                          }}
                        >
                          {getMatchScore(match)}
                        </div>
                      )}
                    </div>

                    <div className="text-left">
                      <span className="text-sm font-black uppercase italic tracking-tighter sm:text-2xl truncate block group-hover:translate-x-[8px] transition-all duration-300" style={{ fontFamily: D.head, color: D.textPrimary }}>
                        {match.awayTeamName}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest opacity-40" style={{ color: D.textMuted }}>AWAY UNIT</span>
                    </div>
                  </div>

                  {/* Operational Status Panel */}
                  <div className="hidden lg:flex flex-col items-end ml-10 min-w-[180px] pl-10 border-l" style={{ borderColor: D.border }}>
                    <div className="flex items-center gap-3">
                      {type === 'live' && (
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: D.rose }}></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: D.rose }}></span>
                        </span>
                      )}
                      <span className="text-[10px] font-black uppercase tracking-widest leading-none" style={{ color: type === 'live' ? D.rose : D.textPrimary }}>
                        {type === 'upcoming' ? formatMatchDateTime(match) : getMatchStatusText(match.status, match.state)}
                      </span>
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-[0.2em] mt-2.5 opacity-40 flex items-center gap-2 group-hover:opacity-100 transition-opacity" style={{ color: D.textMuted }}>
                      <MapPin className="h-3 w-3" />
                      {match.venue || 'SYSTEM UNDEFINED'}
                    </div>
                  </div>
                  
                  <div className="ml-8 p-3 rounded-full transition-all group-hover:translate-x-3 shadow-inner" style={{ background: D.surf1, color: D.textMuted, border: `1px solid ${D.border}` }}>
                    <ChevronRight className="h-5 w-5 opacity-40 group-hover:opacity-100 group-hover:text-indigo-500 transition-all" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div 
      className={cn("rounded-[2.5rem] border shadow-2xl overflow-hidden transition-all duration-700", className)}
      style={{ background: D.surf1, borderColor: D.border }}
    >
      {/* Dynamic Header Hub */}
      <div className="p-10 pb-6 relative overflow-hidden border-b" style={{ borderColor: D.border, background: D.surf2 }}>
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
          <Activity className="h-40 w-40" style={{ color: D.indigo }} />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div>
            <h2 className="text-4xl font-black tracking-tighter uppercase italic flex items-center gap-4" style={{ fontFamily: D.head, color: D.textPrimary }}>
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg border transition-transform group-hover:scale-105"
                style={{ background: `${D.indigo}15`, border: `1px solid ${D.indigo}30`, color: D.indigo }}
              >
                <Activity className="h-7 w-7 animate-pulse" />
              </div>
              FIXTURE <span style={{ color: D.indigo }}>CENTRE</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mt-3 italic flex items-center gap-3 opacity-60" style={{ color: D.textMuted }}>
              <Clock className="w-4 h-4" /> REAL-TIME MULTI-SPORT OPERATIONAL GATEWAY
            </p>
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            <Button 
                variant="outline" 
                className="flex-1 md:flex-none rounded-2xl font-black text-[10px] uppercase tracking-widest px-8 h-12 border shadow-sm transition-all hover:translate-y-[-2px] active:scale-95"
                style={{ background: D.surf1, borderColor: D.border, color: D.textPrimary }}
                asChild
            >
              <Link href="/fixtures/create">INITIALIZE</Link>
            </Button>
            <Button 
                className="flex-1 md:flex-none rounded-2xl font-black text-[10px] uppercase tracking-widest px-10 h-12 shadow-2xl shadow-indigo-500/20 transition-all hover:scale-[1.03] active:scale-95"
                style={{ background: D.indigo, color: 'white' }}
                asChild
            >
              <Link href="/fixtures">DIRECTORY</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Strategic Command Tabs */}
      <div className="p-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="p-1.5 rounded-2xl border flex w-full shadow-inner" style={{ background: D.surf2, borderColor: D.border }}>
            {[
              { value: "live", label: "ACTIVE OPS", icon: Activity, badge: liveMatches.length },
              { value: "results", label: "HISTORICAL", icon: Trophy },
              { value: "upcoming", label: "FIXTURES", icon: Calendar },
            ].map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="flex-1 font-black text-[10px] uppercase tracking-[0.2em] gap-3 rounded-xl h-12 transition-all data-[state=active]:shadow-lg data-[state=active]:bg-background"
                style={{ color: D.textMuted }}
              >
                <tab.icon className="h-4 w-4" style={{ color: activeTab === tab.value ? D.indigo : 'inherit' }} />
                {tab.label}
                {tab.badge ? (
                  <span className="ml-1 px-3 py-1 rounded-full text-[9px] font-black ring-4 ring-white/5 animate-pulse" style={{ background: D.rose, color: 'white' }}>
                    {tab.badge}
                  </span>
                ) : null}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="focus-visible:outline-none">
            <TabsContent value="live" className="mt-0 outline-none">
              {renderMatchList(liveMatches, 'live')}
            </TabsContent>
            
            <TabsContent value="results" className="mt-0 outline-none">
              {renderMatchList(recentMatches, 'results')}
            </TabsContent>
            
            <TabsContent value="upcoming" className="mt-0 outline-none">
              {renderMatchList(upcomingMatches, 'upcoming')}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
