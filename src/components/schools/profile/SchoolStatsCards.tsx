import { Card, CardContent } from "@/components/ui/card";
import { Users, Shield, Calendar, GraduationCap } from "lucide-react";
import { SchoolStats } from "@/types/firestore";

interface SchoolStatsCardsProps {
  stats?: SchoolStats;
}

export function SchoolStatsCards({ stats }: SchoolStatsCardsProps) {
  const data = {
    totalTeams: stats?.totalTeams || 0,
    activePlayers: stats?.activePlayers || 0,
    coachingStaff: stats?.coachingStaff || 0,
    upcomingFixtures: stats?.upcomingFixtures || 0,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Teams */}
      <div className="glass-card p-5 rounded-2xl border border-border/40 hover:border-primary/50 transition-all duration-300 group shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Teams</span>
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
            <Shield className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold font-mono tracking-tight text-foreground">{data.totalTeams}</h3>
          <span className="text-xs text-emerald-400 font-medium">+2 this season</span>
        </div>
      </div>

      {/* Active Players */}
      <div className="glass-card p-5 rounded-2xl border border-border/40 hover:border-emerald-500/50 transition-all duration-300 group shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Squad</span>
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold font-mono tracking-tight text-foreground">{data.activePlayers}</h3>
          <span className="text-xs text-muted-foreground">registered</span>
        </div>
      </div>

      {/* Upcoming Games */}
      <div className="glass-card p-5 rounded-2xl border border-border/40 hover:border-sky-500/50 transition-all duration-300 group shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upcoming</span>
          <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400 group-hover:scale-110 transition-transform">
            <Calendar className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold font-mono tracking-tight text-foreground">{data.upcomingFixtures}</h3>
          <span className="text-xs text-sky-400 font-medium">fixtures set</span>
        </div>
      </div>

      {/* Coaching Staff */}
      <div className="glass-card p-5 rounded-2xl border border-border/40 hover:border-violet-500/50 transition-all duration-300 group shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Coaching Staff</span>
          <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-400 group-hover:scale-110 transition-transform">
            <GraduationCap className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold font-mono tracking-tight text-foreground">{data.coachingStaff}</h3>
          <span className="text-xs text-muted-foreground">coaches</span>
        </div>
      </div>
    </div>
  );
}
