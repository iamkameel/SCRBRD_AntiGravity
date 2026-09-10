"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  MapPin, 
  Calendar, 
  ChevronRight, 
  Activity, 
  TrendingUp,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for the live section
const liveMatches = [
  {
    id: "live-1",
    status: "live",
    league: "Premier Division • Round 4",
    venue: "Main Oval, Central Grounds",
    matchType: "T20 Match",
    homeTeam: {
      name: "St John's College",
      logo: "SJC",
      score: "164/4",
      overs: "18.2",
      isBatting: true
    },
    awayTeam: {
      name: "Kingswood High",
      logo: "KWH",
      score: "158/8",
      overs: "20.0",
      isBatting: false
    },
    summary: "St John's need 7 runs from 10 balls",
    isTense: true
  },
  {
    id: "result-1",
    status: "result",
    league: "Super League • Final",
    venue: "St Andrews Park",
    matchType: "50-Over Match",
    homeTeam: {
      name: "Bishops College",
      logo: "BC",
      score: "245/7",
      overs: "50.0",
      isBatting: false
    },
    awayTeam: {
      name: "Hilton College",
      logo: "HC",
      score: "242/10",
      overs: "48.4",
      isBatting: false
    },
    summary: "Bishops College won by 3 runs",
    isTense: false,
    winnerId: "BC"
  },
  {
    id: "upcoming-1",
    status: "upcoming",
    league: "Invitational Cup",
    venue: "Lords Cricket Ground",
    matchType: "One Day International",
    homeTeam: {
      name: "South Africa U19",
      logo: "SA",
      score: "",
      overs: "",
      isBatting: false
    },
    awayTeam: {
      name: "India U19",
      logo: "IND",
      score: "",
      overs: "",
      isBatting: false
    },
    summary: "Starts in 45 minutes",
    isTense: false
  }
];

export function LiveSection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase">
              <Activity className="h-3.5 w-3.5" />
              Match Central
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Live & Upcoming
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Experience the pulse of school cricket. From real-time ball-by-ball tension to scheduled future classics and historic results.
            </p>
          </div>
          <Link href="/fixtures">
            <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl shadow-primary/20 group">
              Explore All Matches
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {liveMatches.map((match) => (
            <Card 
              key={match.id} 
              className={cn(
                "group relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-border/40 bg-card/50 backdrop-blur-md",
                match.status === 'live' ? "ring-2 ring-primary/30" : "hover:border-primary/30"
              )}
            >
              {/* Status Specific Overlays */}
              {match.status === 'live' && (
                <div className="absolute top-0 right-0 p-4 z-20">
                  <div className="flex items-center gap-2 px-2 py-1 bg-red-600/10 border border-red-600/20 rounded-md">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                    </span>
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-tighter">Live</span>
                  </div>
                </div>
              )}

              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-8">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">
                      {match.league}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {match.venue}
                    </div>
                  </div>
                  <Badge 
                    variant={match.status === 'live' ? 'default' : 'secondary'}
                    className={cn(
                      "font-black px-3 py-1 text-[10px] uppercase tracking-widest rounded-sm",
                      match.status === 'live' ? "bg-red-600 hover:bg-red-600 text-white" : 
                      match.status === 'result' ? "bg-blue-600/10 text-blue-600 border border-blue-600/20" : ""
                    )}
                  >
                    {match.status}
                  </Badge>
                </div>

                <div className="space-y-8 mb-8">
                  {/* Home Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center font-black text-base border transition-all duration-500 group-hover:scale-110",
                        match.status === 'result' && match.winnerId === match.homeTeam.logo 
                          ? "bg-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/10" 
                          : "bg-muted border-border/50 text-muted-foreground"
                      )}>
                        {match.homeTeam.logo}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-bold text-lg leading-none",
                          match.homeTeam.isBatting ? "text-primary" : "text-foreground"
                        )}>
                          {match.homeTeam.name}
                        </span>
                        {match.homeTeam.isBatting && <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Batting</span>}
                      </div>
                    </div>
                    {(match.homeTeam.score || match.status === 'result') && (
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-black tracking-tighter text-foreground">{match.homeTeam.score}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{match.homeTeam.overs} ov</span>
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-xl flex items-center justify-center font-black text-base border transition-all duration-500 group-hover:scale-110",
                        match.status === 'result' && match.winnerId === match.awayTeam.logo 
                          ? "bg-primary/10 border-primary/30 text-primary shadow-lg shadow-primary/10" 
                          : "bg-muted border-border/50 text-muted-foreground"
                      )}>
                        {match.awayTeam.logo}
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "font-bold text-lg leading-none",
                          match.awayTeam.isBatting ? "text-primary" : "text-foreground"
                        )}>
                          {match.awayTeam.name}
                        </span>
                        {match.awayTeam.isBatting && <span className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Batting</span>}
                      </div>
                    </div>
                    {(match.awayTeam.score || match.status === 'result') && (
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-black tracking-tighter text-foreground">{match.awayTeam.score}</span>
                        <span className="text-[10px] text-muted-foreground font-bold">{match.awayTeam.overs} ov</span>
                      </div>
                    )}
                    {!match.awayTeam.score && match.status !== 'result' && (
                      <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] italic opacity-50">To bat</span>
                    )}
                  </div>
                </div>

                <div className={cn(
                  "p-4 rounded-xl flex items-center gap-3 mb-8 transition-all duration-500 border",
                  match.isTense 
                    ? "bg-red-500/5 border-red-500/20 text-red-600 dark:text-red-400" 
                    : match.status === 'result'
                    ? "bg-blue-500/5 border-blue-500/10 text-blue-600/80 dark:text-blue-400/80"
                    : "bg-muted/30 border-border/30"
                )}>
                  {match.isTense ? (
                    <TrendingUp className="h-4 w-4 animate-pulse" />
                  ) : match.status === 'result' ? (
                    <Trophy className="h-4 w-4" />
                  ) : (
                    <Clock className="h-4 w-4 opacity-50" />
                  )}
                  <p className="text-xs font-bold leading-tight">{match.summary}</p>
                </div>

                <div className="flex gap-3">
                  <Link href={`/matches/${match.id}`} className="flex-1">
                    <Button variant="outline" size="lg" className="w-full text-xs font-black uppercase tracking-widest border-border/50 hover:bg-primary/5 hover:text-primary transition-all group/btn">
                      Details
                      <ArrowUpRight className="ml-2 h-3.5 w-3.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </Button>
                  </Link>
                  {match.status === 'live' && (
                    <Link href={`/matches/${match.id}/live`} className="flex-1">
                      <Button size="lg" className="w-full text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group/live">
                        Live
                        <Activity className="ml-2 h-3.5 w-3.5 group-hover/live:scale-125 transition-transform" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-x-16 gap-y-8 border-t border-border/30 pt-16">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
              <Trophy className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">League Integration</span>
          </div>
          <div className="flex items-center gap-3 group cursor-default">
            <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Instant Updates</span>
          </div>
          <div className="flex items-center gap-3 group cursor-default">
            <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Smart Scheduling</span>
          </div>
        </div>
      </div>
    </section>
  );
}
