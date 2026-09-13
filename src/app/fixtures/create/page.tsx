import { FixtureWizard } from "@/components/fixtures/FixtureWizard";
import { fetchTeams, fetchFields, fetchSchools } from "@/lib/firestore";
import { serializeForClient } from "@/lib/utils";

export default async function CreateFixturePage() {
  const [rawTeams, rawFields, rawSchools] = await Promise.all([
    fetchTeams(),
    fetchFields() as Promise<any[]>,
    fetchSchools()
  ]);

  const teams = serializeForClient(rawTeams);
  const fields = serializeForClient(rawFields);
  const schools = serializeForClient(rawSchools);

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Schedule New Match</h1>
        <p className="text-muted-foreground">
          Use the smart scheduler to create a fixture with automatic conflict detection and dynamic division filtering.
        </p>
      </div>
      
      <FixtureWizard 
        teams={teams}
        fields={fields}
        schools={schools}
      />
    </div>
  );
}