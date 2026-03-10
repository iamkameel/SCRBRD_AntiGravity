import { teamService } from "@/services/teamService";
import { organisationService } from "@/services/organisationService";
import { ageDivisionService } from "@/services/ageDivisionService";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Layers } from "lucide-react";
import { TeamsClient } from "@/components/teams/TeamsClient";

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  const [teams, organisations, ageDivisions] = await Promise.all([
    teamService.getAll(),
    organisationService.getAll(),
    ageDivisionService.getAll()
  ]);

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Layers className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold font-heading italic tracking-tight">Teams (V4)</h1>
          </div>
          <p className="text-muted-foreground italic font-medium">
            Relational Team Management Engine
          </p>
        </div>
        <Link href="/teams/add">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-heading italic shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </Link>
      </div>

      <TeamsClient 
        teams={teams} 
        organisations={organisations} 
        ageDivisions={ageDivisions} 
      />
    </div>
  );
}
