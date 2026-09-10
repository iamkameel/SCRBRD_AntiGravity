import { fetchDivisions, fetchTeams } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Layers, Plus } from "lucide-react";
import Link from "next/link";
import { D } from "@/lib/design-system";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DivisionsClient } from "@/components/divisions/DivisionsClient";

export const dynamic = 'force-dynamic';

export default async function DivisionsPage() {
  const [divisions, teams] = await Promise.all([
    fetchDivisions().catch(() => []),
    fetchTeams().catch(() => [])
  ]);

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Standardized Header */}
      <SectionHeader 
        title="Divisions & Units"
        sub="Institutional age groups and competitive divisions. Squad allocation management."
        icon={<Layers className="w-5 h-5 text-indigo-400" />}
        actions={
          <Link href="/divisions/add">
            <Button className="h-10 px-5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Division
            </Button>
          </Link>
        }
      />

      <DivisionsClient divisions={divisions} teams={teams} />
    </div>
  );
}
