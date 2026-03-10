import { fetchSeasons } from "@/lib/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, PenTool } from "lucide-react";
import Link from "next/link";

export default async function SeasonsPage() {
  const seasons = await fetchSeasons();

  return (
    <div className="container mx-auto py-8 max-w-6xl space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Seasons</h1>
          </div>
          <p className="text-muted-foreground">
            Manage cricket seasons and competitions
          </p>
        </div>
        <Link href="/seasons/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Season
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {seasons.map((season: any) => {
          const startDate = new Date(season.startDate);
          const endDate = new Date(season.endDate);
          const isActive = season.active;
          
          return (
            <Card key={season.id || season.seasonId}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-bold">{season.name}</h3>
                      {isActive && <Badge variant="default">Active</Badge>}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg max-w-xl">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Start Date</div>
                        <div className="font-medium">{startDate.toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">End Date</div>
                        <div className="font-medium">{endDate.toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <Link href={`/seasons/${season.id || season.seasonId}/edit`}>
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

      {seasons.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No seasons found. Create your first season to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
