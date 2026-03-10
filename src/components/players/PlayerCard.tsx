import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Edit, User } from "lucide-react";
import { Player as Person } from "@/lib/store";

interface PlayerCardProps {
  player: Person;
  viewMode?: 'grid' | 'list';
}

export function PlayerCard({ player, viewMode = 'grid' }: PlayerCardProps) {
  const avatarUrl = player.profileImageUrl || `https://ui-avatars.com/api/?name=${player.firstName}+${player.lastName}&background=22c55e&color=fff`;

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow group border-l-4 border-l-transparent hover:border-l-primary">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 shrink-0 rounded-full overflow-hidden bg-muted border border-border/50">
              <Image 
                src={avatarUrl} 
                alt={`${player.firstName} ${player.lastName}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{player.firstName} {player.lastName}</h3>
              <p className="text-sm text-muted-foreground">{player.role}</p>
            </div>
            
            <div className="hidden md:flex items-center gap-6 mr-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">Matches</div>
                <div className="font-medium text-sm">{player.stats?.matchesPlayed || 0}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wider">{player.role === 'Bowler' ? 'Wickets' : 'Runs'}</div>
                <div className="font-medium text-sm">{player.role === 'Bowler' ? (player.stats?.wicketsTaken || 0) : (player.stats?.totalRuns || 0)}</div>
              </div>
            </div>

            {player.status && (
              <Badge variant={player.status === 'active' ? 'default' : 'secondary'} className="mr-4">
                {player.status}
              </Badge>
            )}

            <div className="flex gap-2">
              <Link href={`/players/${player.id}`}>
                <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground">View</Button>
              </Link>
              <Link href={`/players/${player.id}/edit`}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-t-4 border-t-transparent hover:border-t-primary relative bg-card/50 hover:bg-card">
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Link href={`/players/${player.id}/edit`} onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background text-muted-foreground hover:text-primary">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      <CardContent className="p-6 text-center space-y-5">
        <div className="relative w-28 h-28 mx-auto transform group-hover:scale-105 transition-transform duration-300">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-emerald-600/20 blur-xl group-hover:blur-2xl transition-all" />
          <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-background shadow-lg group-hover:border-primary/20 transition-colors bg-muted">
            <Image 
              src={avatarUrl} 
              alt={`${player.firstName} ${player.lastName}`}
              fill
              className="object-cover"
            />
          </div>
          {player.status === 'active' && (
            <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-background rounded-full shadow-sm" title="Active" />
          )}
        </div>

        <div>
          <h3 className="font-bold text-xl group-hover:text-primary transition-colors tracking-tight">{player.firstName} {player.lastName}</h3>
          <Badge variant="outline" className="mt-2 border-primary/20 text-primary bg-primary/5 font-normal">
            {player.role}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left">
          <div className="bg-muted/40 p-3 rounded-xl border border-border/40 group-hover:border-primary/10 transition-colors">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Matches</div>
            <div className="font-bold text-lg text-foreground">{player.stats?.matchesPlayed || 0}</div>
          </div>
          <div className="bg-muted/40 p-3 rounded-xl border border-border/40 group-hover:border-primary/10 transition-colors">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">
              {player.role === 'Bowler' ? 'Wickets' : 'Runs'}
            </div>
            <div className="font-bold text-lg text-foreground">
              {player.role === 'Bowler' ? (player.stats?.wicketsTaken || 0) : (player.stats?.totalRuns || 0)}
            </div>
          </div>
        </div>

        <Link href={`/players/${player.id}`} className="block w-full pt-2">
          <Button className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 shadow-lg shadow-primary/20 group-hover:shadow-primary/30 transition-all">
            View Profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
