import { MultiFixtureWizard } from "@/components/fixtures/MultiFixtureWizard";
import { fetchTeams, fetchFields, fetchSeasons, fetchCollection } from "@/lib/firestore";
import { Season, Team, Field } from "@/types/firestore";
import { LocalCompetition as Competition } from "@/app/actions/multiFixtureActions";

export default async function MultiCreateFixturePage() {
  const [teams, fields, seasons, competitions] = await Promise.all([
    fetchTeams(),
    fetchFields() as Promise<any[]>,
    fetchSeasons() as Promise<any[]>,
    fetchCollection<Competition>('competitions')
  ]);

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
