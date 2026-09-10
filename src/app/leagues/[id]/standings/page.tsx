import { getPointsTableAction } from "@/app/actions/pointsTableActions";
import { getLeagueAction } from "@/app/actions/leagueActions";
import { StandingTable } from "@/components/leagues/StandingTable";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function LeagueStandingsPage({ params }: { params: { id: string } }) {
  const league = await getLeagueAction(params.id);

  if (!league) {
    notFound();
  }

  const result = await getPointsTableAction(params.id, undefined);

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/leagues">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leagues
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">{league.name}</h1>
        <p className="text-muted-foreground mt-1">League Standings</p>
      </div>

      {result.success && result.standings && result.standings.length > 0 ? (
        <StandingTable 
          data={result.standings.map((team, idx) => ({
            rank: idx + 1,
            teamName: team.teamName,
            played: team.played,
            won: team.won,
            lost: team.lost,
            drawn: team.tied,
            nr: team.noResult,
            pts: team.points,
            nrr: team.netRunRate,
            form: ['W', 'W', 'L', 'W', 'W'], // Mock form for UI demonstration
            isQualifying: idx < 2,
            isRelegation: result.standings ? idx > result.standings.length - 3 && result.standings.length > 6 : false
          }))} 
          title="Season Tournament Standings" 
        />
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">
              {result.error || "No matches have been completed yet"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
