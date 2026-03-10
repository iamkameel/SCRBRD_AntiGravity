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
    id: "live-2",
    status: "live",
    league: "U15 Junior League",
    venue: "Field B, North Park",
    matchType: "30-Over Match",
    homeTeam: {
      name: "Westside Academy",
      logo: "WSA",
      score: "82/2",
      overs: "12.4",
      isBatting: true
    },
    awayTeam: {
      name: "Eastview High",
      logo: "EVH",
      score: "",
      overs: "",
      isBatting: false
    },
    summary: "Westside Academy elected to bat",
    isTense: false
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
    <section className="py-16 md:py-24 bg-muted/20 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3 tracking-wider uppercase">
              <Activity className="h-3 w-3" />
              Real-time Experience
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Live & Upcoming Matches</h2>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Experience the roar of the crowd and the precision of every ball. Track local matches with pro-level stats and visualizations.
            </p>
          </div>
          <Link href="/matches">
            <Button variant="ghost" className="group text-primary hover:text-primary hover:bg-primary/5">
              View Match Center
              <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {liveMatches.map((match) => (
            <Card 
              key={match.id} 
              className={cn(
                "relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-border/50",
                match.status === 'live' ? "ring-1 ring-primary/20" : ""
              )}
            >
              {match.status === 'live' && (
                <div className="absolute top-0 right-0 p-3 z-10">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                  </span>
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">
                      {match.league}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {match.venue}
                    </div>
                  </div>
                  <Badge 
                    variant={match.status === 'live' ? 'default' : 'secondary'}
                    className={cn(
                      "font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider",
                      match.status === 'live' ? "bg-red-600 hover:bg-red-600 text-white" : ""
                    )}
                  >
                    {match.status}
                  </Badge>
                </div>

                <div className="space-y-5 mb-6">
                  {/* Home Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm border border-border/50 shadow-sm">
                        {match.homeTeam.logo}
                      </div>
                      <span className={cn(
                        "font-semibold text-lg",
                        match.homeTeam.isBatting ? "text-foreground" : "text-foreground/70"
                      )}>
                        {match.homeTeam.name}
                      </span>
                    </div>
                    {match.homeTeam.score && (
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-bold tracking-tight">{match.homeTeam.score}</span>
                        <span className="text-[10px] text-muted-foreground">({match.homeTeam.overs} ov)</span>
                      </div>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm border border-border/50 shadow-sm">
                        {match.awayTeam.logo}
                      </div>
                      <span className={cn(
                        "font-semibold text-lg",
                        match.awayTeam.isBatting ? "text-foreground" : "text-foreground/70"
                      )}>
                        {match.awayTeam.name}
                      </span>
                    </div>
                    {match.awayTeam.score ? (
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-bold tracking-tight">{match.awayTeam.score}</span>
                        <span className="text-[10px] text-muted-foreground">({match.awayTeam.overs} ov)</span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider italic">To bat</span>
                    )}
                  </div>
                </div>

                <div className={cn(
                  "p-3 rounded-lg flex items-center gap-3 mb-6 transition-colors",
                  match.isTense 
                    ? "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400" 
                    : "bg-muted/50 border border-border/50"
                )}>
                  {match.isTense ? (
                    <TrendingUp className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Clock className="h-4 w-4 opacity-50" />
                  )}
                  <p className="text-xs font-semibold leading-none">{match.summary}</p>
                </div>

                <div className="flex gap-2">
                  <Link href={`/matches/${match.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs font-bold border-primary/20 hover:bg-primary/5 hover:text-primary group">
                      Match Details
                      <ArrowUpRight className="ml-1.5 h-3 w-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                  </Link>
                  {match.status === 'live' && (
                    <Link href={`/matches/${match.id}/live`} className="flex-1 text-center">
                      <Button size="sm" className="w-full text-xs font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group">
                        Live Center
                        <Activity className="ml-1.5 h-3 w-3 group-hover:scale-110 transition-transform" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-60">
          <div className="flex items-center gap-2 group cursor-default">
            <Trophy className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium uppercase tracking-widest">League Integration</span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <Activity className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium uppercase tracking-widest">Instant Updates</span>
          </div>
          <div className="flex items-center gap-2 group cursor-default">
            <Calendar className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium uppercase tracking-widest">Smart Scheduling</span>
          </div>
        </div>
      </div>
    </section>
  );
}
