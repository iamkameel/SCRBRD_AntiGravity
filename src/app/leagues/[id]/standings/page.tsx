import { getPointsTableAction } from "@/app/actions/pointsTableActions";
import { getLeagueAction } from "@/app/actions/leagueActions";
import { PointsTable } from "@/components/tournaments/PointsTable";
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

      {result.success && result.standings ? (
        <PointsTable standings={result.standings} title={`${league.name} - Standings`} />
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
