import { teamService } from "@/services/teamService";
import { organisationService } from "@/services/organisationService";
import { ageDivisionService } from "@/services/ageDivisionService";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Layers } from "lucide-react";
import { TeamsClient } from "@/components/teams/TeamsClient";
import { D } from '@/lib/design-system';
import { SectionHeader } from "@/components/ui/SectionHeader";

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  const [teams, organisations, ageDivisions] = await Promise.all([
    teamService.getAll().catch(() => []),
    organisationService.getAll().catch(() => []),
    ageDivisionService.getAll().catch(() => [])
  ]);

  return (
    <div className="space-y-8 pb-20 max-w-[1600px] mx-auto">
      {/* Standardized Header */}
      <SectionHeader 
        title="Teams"
        sub="Manage your teams, explore squads, and follow their season."
        icon={<Layers className="w-5 h-5 text-primary" />}
        actions={
          <Link href="/teams/add">
            <Button className="h-10 px-5 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-indigo-600/20">
              <Plus className="mr-1.5 h-4 w-4" />
              New Team
            </Button>
          </Link>
        }
      />

      <TeamsClient 
        teams={teams} 
        organisations={organisations} 
        ageDivisions={ageDivisions} 
      />
    </div>
  );
}
