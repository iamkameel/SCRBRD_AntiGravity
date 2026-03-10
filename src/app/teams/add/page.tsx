import { SmartTeamCreator } from "@/components/teams/SmartTeamCreator";
import { organisationService } from "@/services/organisationService";
import { ageDivisionService } from "@/services/ageDivisionService";
import { seasonService } from "@/services/seasonService";
import { teamClassService } from "@/services/teamClassService";

export default async function AddTeamPage() {
  const [organisations, ageDivisions, activeSeason, teamClasses] = await Promise.all([
    organisationService.getAll(),
    ageDivisionService.getAll(),
    seasonService.getActive(),
    teamClassService.getAll()
  ]);

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading italic tracking-tight">Create New Team</h1>
        <p className="text-muted-foreground">
          Use the smart builder to create a team in the new relational engine.
        </p>
      </div>
      
      <SmartTeamCreator 
        organisations={organisations}
        ageDivisions={ageDivisions}
        activeSeason={activeSeason}
        teamClasses={teamClasses}
      />
    </div>
  );
}
