import { MultiFixtureWizard } from "@/components/fixtures/MultiFixtureWizard";
import { fetchTeams, fetchFields, fetchSeasons, fetchCollection } from "@/lib/firestore";
import { Season, Team, Field } from "@/types/firestore";
import { LocalCompetition as Competition } from "@/app/actions/multiFixtureActions";
import { serializeForClient } from "@/lib/utils";

export default async function MultiCreateFixturePage() {
  const [rawTeams, rawFields, rawSeasons, rawCompetitions] = await Promise.all([
    fetchTeams(),
    fetchFields() as Promise<any[]>,
    fetchSeasons() as Promise<any[]>,
    fetchCollection<Competition>('competitions')
  ]);

  const teams = serializeForClient(rawTeams);
  const fields = serializeForClient(rawFields);
  const seasons = serializeForClient(rawSeasons);
  const competitions = serializeForClient(rawCompetitions);

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Multi-Fixture creation Tool</h1>
        <p className="text-muted-foreground">
          Generate multiple fixtures for leagues, competitions, and knockouts with automated scheduling and clash detection.
        </p>
      </div>
      
      <MultiFixtureWizard 
        teams={teams}
        fields={fields}
        seasons={seasons}
        competitions={competitions}
      />
    </div>
  );
}
