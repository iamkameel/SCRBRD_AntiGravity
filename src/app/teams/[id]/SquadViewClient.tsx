"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Team, School, Division, Person, Match } from "@/types/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeleteTeamDialog } from "@/components/teams/DeleteTeamDialog";
import { Edit, ArrowLeft, Shield, User, Dribbble, Crosshair, MapPin } from "lucide-react";
import { SkillMatrixAssessment } from "@/components/coaches/SkillMatrixAssessment";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

// We define a type representing the joined roster data
type RosterMemberData = {
  id: string;
  personId: string;
  teamId: string;
  role: string;
  person: Person;
  isCaptain: boolean;
  isViceCaptain: boolean;
  jerseyNumber?: string;
};

interface SquadViewClientProps {
  team: Team;
  school: School | null;
  division: Division | null;
  roster: RosterMemberData[];
  matches: Match[];
  allTeams: Team[];
}

export function SquadViewClient({ team, school, division, roster, matches, allTeams }: SquadViewClientProps) {
  const [activePlayerForSkill, setActivePlayerForSkill] = useState<RosterMemberData | null>(null);

  const pendingMatches = matches.filter(m => m.status !== 'completed');
  const pastMatches = matches.filter(m => m.status === 'completed');

  return (
    <div className="container mx-auto py-8 max-w-7xl animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <Link href="/teams" className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors font-semibold">
          <ArrowLeft className="h-4 w-4" /> Back to Teams Hierarchy
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/teams/${team.id}/edit`}>
            <Button size="sm" variant="outline" className="font-bold tracking-widest uppercase text-xs">
              <Edit className="h-4 w-4 mr-2" />
              Manage Details
            </Button>
          </Link>
          <DeleteTeamDialog teamId={team.id} teamName={team.name} />
        </div>
      </div>

      <Tabs defaultValue="roster" className="w-full">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 pb-4 border-b border-border/50 gap-4">
          <div className="flex items-end gap-6">
            <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-primary/10 border-2 border-primary/20 shadow-xl">
              <Image 
                src={team.logoUrl || `https://ui-avatars.com/api/?name=${team.name}&background=random&color=fff`}
                alt={team.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="pb-1">
              <h1 className="text-4xl font-black tracking-tighter">{team.name}</h1>
              <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground font-semibold uppercase tracking-wider">
                <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {division?.name || 'Unassigned'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {school?.name || 'No School'}</span>
              </div>
            </div>
          </div>
          <TabsList className="bg-transparent h-auto p-0 flex gap-6">
            <TabsTrigger value="roster" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-2 text-lg font-bold data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground shadow-none">
              Squad Roster
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-2 text-lg font-bold data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground shadow-none">
              Skill Development
            </TabsTrigger>
            <TabsTrigger value="fixtures" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-2 text-lg font-bold data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground shadow-none">
              Fixtures
            </TabsTrigger>
          </TabsList>
        </div>

        {/* 1. SQUAD ROSTER TAB */}
        <TabsContent value="roster" className="mt-0 outline-none">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Active Squad 
              <Badge variant="secondary" className="ml-2 font-black">{roster.length}</Badge>
            </h2>
            <Button variant="default" className="font-bold text-xs uppercase tracking-widest">
              + Add Player
            </Button>
          </div>
          
          {roster.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {roster.map((member) => (
                <Card key={member.id} className="hover:border-primary/50 hover:shadow-lg transition-all group overflow-hidden bg-card/50">
                  <div className="h-1 w-full bg-gradient-to-r from-primary/40 to-primary/10 group-hover:from-primary group-hover:to-primary/50 transition-all opacity-0 group-hover:opacity-100" />
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="relative w-14 h-14 shrink-0 rounded-full overflow-hidden bg-muted border border-border group-hover:border-primary/50 transition-colors">
                      <Image 
                        src={member.person.profileImageUrl || `https://ui-avatars.com/api/?name=${member.person.firstName}+${member.person.lastName}&background=10b981&color=fff`}
                        alt={`${member.person.firstName} ${member.person.lastName}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/players/${member.personId}`} className="hover:text-primary transition-colors">
                        <h4 className="font-bold text-lg leading-tight truncate">{member.person.firstName} {member.person.lastName}</h4>
                      </Link>
                      <p className="text-sm font-medium text-muted-foreground truncate">{member.role}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.isCaptain && <Badge variant="default" className="bg-primary text-black font-black text-[9px] px-1.5 py-0 h-4">C</Badge>}
                        {member.isViceCaptain && <Badge variant="secondary" className="font-black text-[9px] px-1.5 py-0 h-4">VC</Badge>}
                        {member.jerseyNumber && <Badge variant="outline" className="font-black text-[9px] px-1.5 py-0 h-4">#{member.jerseyNumber}</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <User className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <p className="text-xl font-bold text-foreground">Squad Empty</p>
                <p className="text-sm max-w-sm mt-2">There are currently no players registered to this squad roster. Add players to begin.</p>
                <Button variant="outline" className="mt-6 font-bold uppercase text-xs tracking-widest">Configure Roster</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 2. SKILL DEVELOPMENT TAB */}
        <TabsContent value="skills" className="mt-0 outline-none">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Crosshair className="h-5 w-5 text-primary" />
              Q3 Assessments 
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 border-r border-border/50 pr-6 space-y-2 max-h-[600px] overflow-y-auto">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Select Player</p>
              {roster.map(member => (
                <button
                  key={member.id}
                  onClick={() => setActivePlayerForSkill(member)}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${
                    activePlayerForSkill?.id === member.id 
                      ? "bg-primary/10 border border-primary/20 text-foreground" 
                      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground border border-transparent"
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${activePlayerForSkill?.id === member.id ? "bg-primary" : "bg-transparent"}`} />
                  <div>
                    <p className="font-bold text-sm">{member.person.firstName} {member.person.lastName}</p>
                    <p className="text-[10px] uppercase tracking-wider">{member.role}</p>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="lg:col-span-3">
              {activePlayerForSkill ? (
                <SkillMatrixAssessment 
                  playerId={activePlayerForSkill.personId}
                  playerName={`${activePlayerForSkill.person.firstName} ${activePlayerForSkill.person.lastName}`}
                  role={activePlayerForSkill.role}
                />
              ) : (
                <div className="h-[600px] rounded-3xl border border-dashed flex flex-col items-center justify-center text-muted-foreground/60">
                  <Crosshair className="h-12 w-12 mb-4 opacity-50" />
                  <p className="font-bold text-lg text-foreground/50">Select a player</p>
                  <p className="text-sm">Choose a squad member to conduct a skill assessment.</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* 3. FIXTURES TAB */}
        <TabsContent value="fixtures" className="mt-0 outline-none">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
            <Dribbble className="h-5 w-5 text-primary" />
            Seasonal Fixtures
          </h2>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Upcoming</h3>
              {pendingMatches.length > 0 ? (
                <div className="space-y-3">
                  {pendingMatches.map(match => {
                    const homeMatchTeam = allTeams.find(t => t.id === match.homeTeamId);
                    const awayMatchTeam = allTeams.find(t => t.id === match.awayTeamId);
                    
                    return (
                      <Card key={match.id} className="hover:border-primary/30 transition-colors">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-bold">{homeMatchTeam?.name} vs {awayMatchTeam?.name}</p>
                            <p className="text-xs text-muted-foreground mt-1 font-medium flex items-center gap-2">
                              {match.dateTime ? new Date(match.dateTime).toLocaleDateString() : 'TBD'} • {match.location || 'TBD'}
                            </p>
                          </div>
                          <Link href={`/matches/${match.id}/manage`}>
                            <Button variant="secondary" size="sm" className="font-bold uppercase tracking-widest text-[10px]">
                              Manage
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming fixtures.</p>
              )}
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Completed Results</h3>
              {pastMatches.length > 0 ? (
                <div className="space-y-3">
                  {pastMatches.map(match => {
                    const homeMatchTeam = allTeams.find(t => t.id === match.homeTeamId);
                    const awayMatchTeam = allTeams.find(t => t.id === match.awayTeamId);
                    
                    return (
                      <Card key={match.id} className="bg-muted/30 opacity-75 hover:opacity-100 transition-opacity">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-bold">{homeMatchTeam?.name} vs {awayMatchTeam?.name}</p>
                            <p className="text-xs text-muted-foreground mt-1 font-medium">
                              {match.dateTime ? new Date(match.dateTime).toLocaleDateString() : 'TBD'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-lg text-primary">{match.homeScore} - {match.awayScore}</p>
                            <Link href={`/matches/${match.id}/scorecard`}>
                              <span className="text-[10px] uppercase font-bold text-primary hover:underline cursor-pointer">Scorecard</span>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No completed results yet.</p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
