import { getTournamentBracketAction, generateKnockoutFixturesAction, seedTeamsFromStandingsAction } from "@/app/actions/tournamentActions";
import { getLeagueAction } from "@/app/actions/leagueActions";
import { TournamentBracket } from "@/components/tournaments/TournamentBracket";
import { BracketGenerator } from "@/components/tournaments/BracketGenerator";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

export default async function LeagueBracketPage({ params }: { params: { id: string } }) {
  const league = await getLeagueAction(params.id);

  if (!league) {
    notFound();
  }

  const bracketResult = await getTournamentBracketAction(params.id);

  return (
    <div className="container mx-auto py-8 max-w-7xl space-y-6">
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
        <p className="text-muted-foreground mt-1">Tournament Bracket</p>
      </div>

      {bracketResult.success && bracketResult.bracket ? (
        <TournamentBracket bracket={bracketResult.bracket} />
      ) : (
        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">
                No tournament bracket has been generated yet.
              </p>
              <BracketGenerator leagueId={params.id} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
