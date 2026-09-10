import { getLeaguesAction } from "@/app/actions/leagueActions";
import { Button } from "@/components/ui/button";
import { Trophy, Plus } from "lucide-react";
import Link from "next/link";
import { D } from "@/lib/design-system";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LeaguesClient } from "@/components/leagues/LeaguesClient";

export const dynamic = 'force-dynamic';

export default async function LeaguesPage() {
  const leagues = await getLeaguesAction().catch(() => []);

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Standardized Header */}
      <SectionHeader 
        title="Leagues & Series"
        sub="Competition management engine. Institutional leagues and regional series data."
        icon={<Trophy className="w-5 h-5 text-indigo-400" />}
        actions={
          <Link href="/leagues/add">
            <Button className="h-10 px-5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20">
              <Plus className="mr-1.5 h-4 w-4" />
              Add Competition
            </Button>
          </Link>
        }
      />

      <LeaguesClient leagues={leagues} />
    </div>
  );
}
