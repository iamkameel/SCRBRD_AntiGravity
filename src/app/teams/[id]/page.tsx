import { 
  fetchTeamById, 
  fetchSchoolById, 
  fetchDivisionById, 
  getPlayersByTeam,
  getMatchesByTeam,
  fetchPersonById,
  fetchTeams
} from "@/lib/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteTeamDialog } from "@/components/teams/DeleteTeamDialog";
import { Edit, ArrowLeft, Shield, User } from "lucide-react";
import { Team, School, Division, RosterMember, Match, Person } from "@/types/firestore";

export default async function TeamDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  const team = await fetchTeamById(id);
  
  if (!team) {
    notFound();
  }

  const [school, division, players, matches, allTeams] = await Promise.all([
    fetchSchoolById(team.schoolId),
    team.divisionId ? fetchDivisionById(team.divisionId) : Promise.resolve(null),
    getPlayersByTeam(id),
    getMatchesByTeam(id),
    fetchTeams() // Fetch all teams to resolve names in matches
  ]);

  // Adapt players to rosterWithPeople format
  const rosterWithPeople = players.map((person) => ({
      id: person.id,
      personId: person.id,
      teamId: id,
      role: person.primaryRole || 'Player',
      person: person,
      isCaptain: false,
      isViceCaptain: false,
      jerseyNumber: undefined
  }));

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <Link href="/teams" className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Teams
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/teams/${id}/edit`}>
            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Team
            </Button>
          </Link>
          <DeleteTeamDialog teamId={id} teamName={team.name} />
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-muted">
              <Image 
                src={team.logoUrl || `https://ui-avatars.com/api/?name=${team.name}&background=random&color=fff`}
                alt={team.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold">{team.name}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{division?.name || 'No Division'}</Badge>
                  <Badge variant="outline">{division?.season || '-'}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-4 bg-muted/30 rounded-lg">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">School</div>
                  <div className="font-medium">
                    <Link href={`/schools/${team.schoolId}`} className="text-primary hover:underline">
                      {school?.name || 'Unknown School'}
                    </Link>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Division</div>
                  <div className="font-medium">{division?.name || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Season</div>
                  <div className="font-medium">{division?.season || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          {team.teamColors && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-sm font-medium mb-3">Team Colors</h3>
              <div className="flex gap-4">
                {team.teamColors.primary && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-border/50 shadow-sm"
                      style={{ backgroundColor: team.teamColors.primary }}
                    />
                    <span className="text-xs text-muted-foreground">Primary</span>
                  </div>
                )}
                {team.teamColors.secondary && (
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded border border-border/50 shadow-sm"
                      style={{ backgroundColor: team.teamColors.secondary }}
                    />
                    <span className="text-xs text-muted-foreground">Secondary</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          Roster 
          <span className="text-muted-foreground text-lg font-normal">({rosterWithPeople.length})</span>
        </h2>
        
        {rosterWithPeople.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rosterWithPeople.map((member) => {
              const person = member.person;
              if (!person) return null;
              
              return (
                <Card key={member.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden bg-muted">
                      <Image 
                        src={`https://ui-avatars.com/api/?name=${person.firstName}+${person.lastName}&background=22c55e&color=fff`}
                        alt={`${person.firstName} ${person.lastName}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">{person.firstName} {person.lastName}</h4>
                      <p className="text-sm text-muted-foreground truncate">{member.role}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {member.isCaptain && <Badge variant="default" className="text-[10px] px-1 py-0 h-5">C</Badge>}
                        {member.isViceCaptain && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-5">VC</Badge>}
                        {member.jerseyNumber && <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">#{member.jerseyNumber}</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No roster members found. Add players to this team.
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Matches 
          <span className="text-muted-foreground text-lg font-normal">({matches.length})</span>
        </h2>

        {matches.length > 0 ? (
          <div className="grid gap-4">
            {matches.map((match) => {
              const homeTeam = allTeams.find(t => t.id === match.homeTeamId);
              const awayTeam = allTeams.find(t => t.id === match.awayTeamId);
              const homeTeamName = homeTeam?.name || 'Unknown Team';
              const awayTeamName = awayTeam?.name || 'Unknown Team';

              return (
                <Card key={match.id}>
                  <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-lg">{homeTeamName} vs {awayTeamName}</h4>
                      <p className="text-sm text-muted-foreground">
                      {match.dateTime ? new Date(match.dateTime).toLocaleDateString() : 'Date TBD'} • {match.location || 'TBD'}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {(match.homeScore !== undefined && match.awayScore !== undefined) && (
                        <span className="font-bold text-xl text-primary">
                          {match.homeScore} - {match.awayScore}
                        </span>
                      )}
                      <Badge variant={match.status === 'completed' ? 'default' : 'secondary'}>
                        {match.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No matches scheduled for this team.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
