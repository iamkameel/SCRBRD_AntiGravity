import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, Calendar, GraduationCap } from "lucide-react";
import { SchoolStats } from "@/types/firestore";

interface SchoolStatsCardsProps {
  stats?: SchoolStats;
}

export function SchoolStatsCards({ stats }: SchoolStatsCardsProps) {
  // Default values if stats are missing
  const data = {
    totalTeams: stats?.totalTeams || 0,
    activePlayers: stats?.activePlayers || 0,
    coachingStaff: stats?.coachingStaff || 0,
    upcomingFixtures: stats?.upcomingFixtures || 0,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-full text-emerald-600 dark:text-emerald-400">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Teams</p>
            <h3 className="text-2xl font-bold text-blue-700 dark:text-blue-300">{data.totalTeams}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-full text-green-600 dark:text-green-400">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Active Players</p>
            <h3 className="text-2xl font-bold text-green-700 dark:text-green-300">{data.activePlayers}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-100 dark:bg-amber-950/20 dark:border-amber-900">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-full text-amber-600 dark:text-amber-400">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Upcoming Games</p>
            <h3 className="text-2xl font-bold text-amber-700 dark:text-amber-300">{data.upcomingFixtures}</h3>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-full text-purple-600 dark:text-purple-400">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Coaching Staff</p>
            <h3 className="text-2xl font-bold text-purple-700 dark:text-purple-300">{data.coachingStaff}</h3>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
