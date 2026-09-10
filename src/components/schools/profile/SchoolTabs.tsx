"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Team, StaffProfile, Match, School } from "@/types/firestore";
import { Users, Calendar, Shield, ArrowRight, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { TeamCard } from "@/components/teams/TeamCard";

interface SchoolTabsProps {
  teams: Team[];
  staff: StaffProfile[];
  fixtures: Match[];
  school: School;
}

export function SchoolTabs({ teams, staff, fixtures, school }: SchoolTabsProps) {
  return (
    <Tabs defaultValue="teams" className="w-full space-y-6">
      <TabsList className="grid w-full grid-cols-3 max-w-md bg-card/80 p-1 rounded-xl border border-border/50 backdrop-blur-md">
        <TabsTrigger value="teams" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium text-xs md:text-sm">
          Teams ({teams.length})
        </TabsTrigger>
        <TabsTrigger value="staff" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium text-xs md:text-sm">
          Staff ({staff.length})
        </TabsTrigger>
        <TabsTrigger value="fixtures" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg font-medium text-xs md:text-sm">
          Fixtures ({fixtures.length})
        </TabsTrigger>
      </TabsList>

      {/* Teams Tab */}
      <TabsContent value="teams" className="space-y-4">
        <div className="glass-card p-6 rounded-2xl border border-border/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-head flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              School Teams & Squads
            </h3>
            <span className="text-xs text-muted-foreground font-mono">{teams.length} Active Teams</span>
          </div>

          <div className="space-y-4">
            {teams.length > 0 ? (
              teams.map((team) => (
                <TeamCard 
                  key={team.id} 
                  team={team} 
                  viewMode="list" 
                />
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground border border-dashed rounded-xl">
                No teams currently registered for this school.
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      {/* Staff Tab */}
      <TabsContent value="staff" className="space-y-4">
        <div className="glass-card p-6 rounded-2xl border border-border/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-head flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-400" />
              Staff Leadership & Coaches
            </h3>
            <span className="text-xs text-muted-foreground font-mono">{staff.length} Members</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.length > 0 ? (
              staff.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl bg-card/60 border border-border/40 hover:border-primary/50 transition-all">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted border border-border/50 shrink-0">
                    <Image 
                      src={member.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=1e3a5f&color=fff`} 
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{member.name}</h4>
                    <p className="text-xs text-primary font-medium">{member.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center p-8 text-muted-foreground border border-dashed rounded-xl">
                No staff profiles available.
              </div>
            )}
          </div>
        </div>
      </TabsContent>

      {/* Fixtures Tab */}
      <TabsContent value="fixtures" className="space-y-4">
        <div className="glass-card p-6 rounded-2xl border border-border/40 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-head flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-400" />
              Upcoming Fixtures & Schedule
            </h3>
            <span className="text-xs text-muted-foreground font-mono">{fixtures.length} Fixtures</span>
          </div>

          <div className="space-y-3">
            {fixtures.length > 0 ? (
              fixtures.map((match) => (
                <div key={match.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-xl bg-card/60 border border-border/40 hover:border-sky-500/50 transition-all gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-center min-w-[60px] p-2 bg-muted/30 rounded-lg border border-border/40">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {new Date(match.matchDate as string).toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="text-xl font-extrabold font-mono text-primary">
                        {new Date(match.matchDate as string).getDate()}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm md:text-base">vs {match.awayTeamId}</h4>
                      <p className="text-xs text-muted-foreground">{match.venue || "TBA"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <Badge variant="outline" className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-xs">
                      {match.matchType || "Match"}
                    </Badge>
                    <Link href={`/matches/${match.id}`}>
                      <Button size="sm" variant="secondary" className="gap-1 text-xs">
                        Match Center <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-8 text-muted-foreground border border-dashed rounded-xl">
                No upcoming fixtures scheduled.
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
