import { getLeaguesAction } from "@/app/actions/leagueActions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Plus, PenTool } from "lucide-react";
import Link from "next/link";

export default async function LeaguesPage() {
  const leagues = await getLeaguesAction();

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Leagues</h1>
          </div>
          <p className="text-muted-foreground">
            Manage cricket leagues and competitions
          </p>
        </div>
        <Link href="/leagues/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add League
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {leagues.map((league: any) => {
          const typeColors: Record<string, string> = {
            League: "bg-blue-500/10 text-blue-600 border-blue-500/20",
            Series: "bg-purple-500/10 text-purple-600 border-purple-500/20",
            Cup: "bg-amber-500/10 text-amber-600 border-amber-500/20",
            Friendly: "bg-green-500/10 text-green-600 border-green-500/20",
          };

          return (
            <Card key={league.id}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{league.name}</h3>
                      <Badge className={typeColors[league.type] || ""}>{league.type}</Badge>
                    </div>
                    
                    {league.description && (
                      <p className="text-sm text-muted-foreground">{league.description}</p>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Province ID: {league.provinceId}</span>
                    </div>
                  </div>
                  
                  <Link href={`/leagues/${league.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <PenTool className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {leagues.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No leagues found. Create your first league to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
