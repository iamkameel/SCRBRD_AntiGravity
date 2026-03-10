"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Team, StaffProfile, Match, School } from "@/types/firestore";
import { Users, Calendar, Shield } from "lucide-react";
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
      <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
        <TabsTrigger value="teams">Teams</TabsTrigger>
        <TabsTrigger value="staff">Staff</TabsTrigger>
        <TabsTrigger value="fixtures">Fixtures</TabsTrigger>
      </TabsList>

      <TabsContent value="teams" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              School Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                <div className="p-8 text-center text-muted-foreground">
                  No teams found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="staff" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Staff Leadership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staff.length > 0 ? (
                staff.map((member) => (
                  <div key={member.id} className="flex items-center gap-4 p-4 rounded-lg border hover:shadow-md transition-shadow">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-muted">
                      <Image 
                        src={member.imageUrl || `https://ui-avatars.com/api/?name=${member.name}&background=random`} 
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-primary font-medium">{member.title}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center p-8 text-muted-foreground">
                  No staff profiles available.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="fixtures" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Fixtures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fixtures.length > 0 ? (
                fixtures.map((match) => (
                  <div key={match.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-center min-w-[60px]">
                        <div className="text-xs font-bold text-muted-foreground uppercase">
                          {new Date(match.matchDate as string).toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-2xl font-bold text-primary">
                          {new Date(match.matchDate as string).getDate()}
                        </div>
                      </div>
                      <div className="h-10 w-[1px] bg-border hidden md:block" />
                      <div>
                        <h4 className="font-semibold">vs {match.awayTeamId}</h4> {/* Ideally fetch opponent name */}
                        <p className="text-sm text-muted-foreground">{match.venue || "TBA"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      <Badge variant="secondary">{match.matchType || "Match"}</Badge>
                      <Link href={`/matches/${match.id}`} className="w-full md:w-auto">
                        <Button size="sm" className="w-full">Match Center</Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-muted-foreground">
                  No upcoming fixtures scheduled.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
