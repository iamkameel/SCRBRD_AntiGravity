import { getLeaguesAction } from "@/app/actions/leagueActions";
import { Button } from "@/components/ui/button";
import { Trophy, Plus } from "lucide-react";
import Link from "next/link";
import { D } from "@/lib/design-system";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { LeagueCard } from "@/components/leagues/LeagueCard";

export default async function LeaguesPage() {
  const leagues = await getLeaguesAction();

  return (
    <div className="space-y-12 pb-24">
      {/* Premium Header */}
      <SectionHeader 
        title="Leagues & Series"
        sub="Competition management engine. Institutional leagues and regional series data."
        icon={<Trophy className="w-5 h-5 text-indigo-400" />}
        actions={
          <Link href="/leagues/add">
            <Button className="h-11 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20" 
                    style={{ background: D.indigo, color: 'white' }}>
              <Plus className="mr-2 h-4 w-4" />
              ADD COMPETITION
            </Button>
          </Link>
        }
      />

      {/* Leagues Grid */}
      <div className="grid gap-6">
        {leagues.map((league: any, index: number) => (
          <LeagueCard key={league.id} league={league} index={index} />
        ))}

        {leagues.length === 0 && (
          <div className="p-24 rounded-[3rem] border border-dashed text-center space-y-4"
               style={{ background: D.surf1, borderColor: D.border }}>
            <div className="h-20 w-20 rounded-3xl flex items-center justify-center mx-auto opacity-20"
                 style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
              <Trophy className="h-10 w-10 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold uppercase italic" style={{ color: D.textPrimary, fontFamily: D.head }}>
                No Competitions Found
              </h3>
              <p className="text-sm font-medium" style={{ color: D.textMuted }}>
                Initialize your first institutional league to begin tracking records.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
