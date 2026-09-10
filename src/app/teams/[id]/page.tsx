import { 
  fetchTeamById, 
  fetchSchoolById, 
  fetchDivisionById, 
  getPlayersByTeam,
  getMatchesByTeam,
  fetchTeams
} from "@/lib/firestore";
import { notFound } from "next/navigation";
import { SquadViewClient } from "./SquadViewClient";

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
    fetchTeams()
  ]);

  // Adapt players to roster format for the client
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
    <SquadViewClient 
      team={team}
      school={school}
      division={division}
      roster={rosterWithPeople}
      matches={matches}
      allTeams={allTeams}
    />
  );
}
