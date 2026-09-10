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
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Standardized Header */}
      <SectionHeader 
        title="Team Registry"
        sub="Institutional team identities, squad allocation, and competitive tracking engine."
        icon={<Layers className="w-5 h-5 text-indigo-400" />}
        actions={
          <Link href="/teams/add">
            <Button className="h-10 px-5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
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
