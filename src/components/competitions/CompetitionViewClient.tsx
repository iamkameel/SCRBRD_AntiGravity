"use client";

import { useState } from "react";
import { League } from "@/services/leagueService";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Dribbble, Target, Crown, CalendarDays, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { LeagueTable, LeagueStanding } from "@/components/competitions/LeagueTable";
import { KnockoutBracket, BracketRound } from "@/components/competitions/KnockoutBracket";

interface CompetitionViewClientProps {
  league: League;
  standings: LeagueStanding[];
  bracketRounds: BracketRound[];
}

export function CompetitionViewClient({ league, standings, bracketRounds }: CompetitionViewClientProps) {
  return (
    <div className="container mx-auto py-8 max-w-7xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col mb-8">
        <Link href="/browse-leagues" className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors font-semibold w-fit mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Directory
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 shrink-0 rounded-2xl bg-primary/10 border-2 border-primary/20 flex flex-col items-center justify-center">
            <Trophy className="h-8 w-8 text-primary shadow-lg" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-foreground">
              {league.name}
            </h1>
            <div className="flex gap-4 mt-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <span className="flex items-center gap-1"><Target className="h-3 w-3" /> Type: {league.type || 'Standard'}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Dribbble className="h-3 w-3" /> {league.countryId || 'ZA'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="standings" className="w-full">
        <TabsList className="bg-transparent h-auto p-0 flex gap-6 border-b border-border/50 pb-4 mb-8">
          <TabsTrigger value="standings" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-2 text-lg font-bold data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground shadow-none">
            League Standings
          </TabsTrigger>
          <TabsTrigger value="bracket" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-2 text-lg font-bold data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground shadow-none">
            Knockout Bracket
          </TabsTrigger>
        </TabsList>

        {/* 1. STANDINGS TAB */}
        <TabsContent value="standings" className="mt-0 outline-none space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Crown className="w-5 h-5 text-primary" />
              League Table 
            </h2>
            <div className="text-sm font-bold bg-muted/50 px-3 py-1.5 rounded-sm border border-border/50">
              Season: <span className="text-primary">2026/27</span>
            </div>
          </div>

          <LeagueTable standings={standings} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
             <Card className="bg-card/40 border-border/50">
               <CardContent className="p-6">
                 <h3 className="text-xs uppercase font-black tracking-widest text-muted-foreground mb-4">Qualification Protocol</h3>
                 <ul className="space-y-3 text-sm font-medium">
                   <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Top 2 teams qualify directly for Finals Day.</li>
                   <li className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-destructive" /> Bottom 2 teams face Relegation Playoffs.</li>
                 </ul>
               </CardContent>
             </Card>
             <Card className="bg-card/40 border-border/50">
               <CardContent className="p-6">
                 <h3 className="text-xs uppercase font-black tracking-widest text-muted-foreground mb-4">Latest Results</h3>
                 <div className="space-y-4">
                   <div className="flex justify-between items-center text-sm font-bold">
                     <span>Hilton College</span>
                     <span className="text-emerald-500">Won</span>
                     <span>DHS</span>
                   </div>
                   <div className="flex justify-between items-center text-sm font-bold">
                     <span>Maritzburg College</span>
                     <span className="text-emerald-500">Won</span>
                     <span>Kearsney</span>
                   </div>
                 </div>
               </CardContent>
             </Card>
          </div>
        </TabsContent>

        {/* 2. KNOCKOUT BRACKET TAB */}
        <TabsContent value="bracket" className="mt-0 outline-none overflow-x-auto custom-scrollbar pb-6 pt-4">
           <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Trophy className="w-5 h-5 text-primary" />
              Finals Day Structure 
            </h2>
          </div>
          <KnockoutBracket rounds={bracketRounds} />
        </TabsContent>

      </Tabs>
    </div>
  );
}
