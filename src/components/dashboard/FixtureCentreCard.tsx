"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Trophy, Activity, ArrowRight, Clock } from "lucide-react";
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

  // Context for filtering - wrapped in useMemo to prevent recreation
  const roleContext = useMemo<RoleContext>(() => ({
    teamId,
    schoolId,
    playerId,
    assignedMatches
  }), [teamId, schoolId, playerId, assignedMatches]);

    const assignedMatchesStr = JSON.stringify(assignedMatches);

    useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      
      try {
        // Fetch all categories using Server Actions
        const [live, recent, upcoming] = await Promise.all([
          getLiveMatchesAction(),
          getRecentMatchesAction(maxMatches * 2),
          getUpcomingMatchesAction(maxMatches * 2)
        ]);

        // Apply role-based filtering
        const filteredLive = filterMatchesByRole(live, role, roleContext);
        const filteredRecent = filterMatchesByRole(recent, role, roleContext).slice(0, maxMatches);
        const filteredUpcoming = filterMatchesByRole(upcoming, role, roleContext).slice(0, maxMatches);

        setLiveMatches(filteredLive);
        setRecentMatches(filteredRecent);
        setUpcomingMatches(filteredUpcoming);
        
        // Auto-switch tab if no live matches but we have upcoming/recent
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

    // Auto-refresh live matches every 30 seconds
    const interval = setInterval(async () => {
      const live = await getLiveMatchesAction();
      const filteredLive = filterMatchesByRole(live, role, roleContext);
      setLiveMatches(filteredLive);
    }, 30000);

    return () => clearInterval(interval);
  }, [role, roleContext, maxMatches, activeTab]);

  const renderMatchList = (matches: Match[], type: 'live' | 'results' | 'upcoming') => {
    if (loading) {
      return (
        <div className="space-y-3 py-4">
          {[1, 2, 3].map((i) => (
            <div key={`skeleton-${i}`} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      );
    }

    if (matches.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No {type === 'live' ? 'live matches' : type === 'results' ? 'recent results' : 'upcoming fixtures'} found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-2 mt-2">
        {matches.map((match, idx) => (
          <Link 
            key={`${match.id}-${idx}`} 
            href={`/matches/${match.id}`}
            className="block group"
          >
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              {/* Teams & Score */}
              <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                {/* Home Team */}
                <div className="text-right truncate">
                  <span className="font-medium">{match.homeTeamName}</span>
                </div>

                {/* Score/VS */}
                <div className="flex flex-col items-center min-w-[80px]">
                  {type === 'upcoming' ? (
                    <span className="text-xs font-bold text-muted-foreground">VS</span>
                  ) : (
                    <Badge variant={type === 'live' ? 'destructive' : 'secondary'} className="text-xs px-2 py-0.5 whitespace-nowrap">
                      {getMatchScore(match)}
                    </Badge>
                  )}
                </div>

                {/* Away Team */}
                <div className="truncate">
                  <span className="font-medium">{match.awayTeamName}</span>
                </div>
              </div>

              {/* Status/Time (Desktop) */}
              <div className="hidden sm:flex flex-col items-end ml-4 min-w-[100px]">
                <div className="flex items-center gap-1.5">
                  {type === 'live' && <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>}
                  <span className={cn(
                    "text-xs font-medium",
                    type === 'live' ? "text-red-600" : "text-muted-foreground"
                  )}>
                    {type === 'upcoming' ? formatMatchDateTime(match) : getMatchStatusText(match.status, match.state)}
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                  {match.venue || match.matchType || 'Match'}
                </div>
              </div>
              
              <ArrowRight className="h-4 w-4 text-muted-foreground ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Fixture Centre
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8" asChild>
              <Link href="/fixtures/create">Create</Link>
            </Button>
            <Button variant="ghost" size="sm" className="text-xs h-8" asChild>
              <Link href="/matches">View All</Link>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="live" className="text-xs sm:text-sm">
              <Activity className="h-3.5 w-3.5 mr-2" />
              Live
              {liveMatches.length > 0 && (
                <Badge variant="destructive" className="ml-1.5 h-4 w-4 p-0 flex items-center justify-center text-[10px] rounded-full">
                  {liveMatches.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="results" className="text-xs sm:text-sm">
              <Trophy className="h-3.5 w-3.5 mr-2" />
              Results
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="text-xs sm:text-sm">
              <Calendar className="h-3.5 w-3.5 mr-2" />
              Upcoming
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-0 focus-visible:ring-0">
            {renderMatchList(liveMatches, 'live')}
          </TabsContent>
          
          <TabsContent value="results" className="mt-0 focus-visible:ring-0">
            {renderMatchList(recentMatches, 'results')}
          </TabsContent>
          
          <TabsContent value="upcoming" className="mt-0 focus-visible:ring-0">
            {renderMatchList(upcomingMatches, 'upcoming')}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
