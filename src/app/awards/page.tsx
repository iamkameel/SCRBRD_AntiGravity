import { fetchTopRunScorers, fetchTopWicketTakers, fetchLeagueStandings } from "@/lib/firestore";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import Link from "next/link";
import { Crown, Trophy, Medal } from "lucide-react";

export default async function AwardsPage() {
  const [topBatsmen, topBowlers, standings] = await Promise.all([
    fetchTopRunScorers(5),
    fetchTopWicketTakers(5),
    fetchLeagueStandings()
  ]);

  // Mock MVP calculation (simple sum of runs + wickets * 20)
  // Ensure we have data before reducing
  const allPlayers = [...topBatsmen, ...topBowlers];
  const mvp = allPlayers.length > 0 ? allPlayers.reduce((prev, current) => {
    const prevScore = (prev.stats?.totalRuns || 0) + (prev.stats?.wicketsTaken || 0) * 20;
    const currScore = (current.stats?.totalRuns || 0) + (current.stats?.wicketsTaken || 0) * 20;
    return currScore > prevScore ? current : prev;
  }) : null;

  return (
    <div className="space-y-8 pb-8">
      <h1 className="text-4xl font-bold mb-8">Awards Hub 🏆</h1>

      {/* MVP Spotlight */}
      {mvp && (
        <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-emerald-500/10">
          <div className="p-8 flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-40 h-40 flex-shrink-0">
              <Image 
                src={mvp.profileImageUrl || `https://ui-avatars.com/api/?name=${mvp.firstName}+${mvp.lastName}&background=f59e0b&color=fff`}
                alt={mvp.displayName || `${mvp.firstName} ${mvp.lastName}`}
                fill
                className="rounded-full object-cover border-4 border-amber-500"
              />
              <div className="absolute bottom-0 right-0 bg-amber-500 rounded-full p-2 text-white shadow-lg">
                <Crown className="h-6 w-6" />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="text-amber-500 font-semibold tracking-wider mb-2 uppercase">Season MVP</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{mvp.firstName} {mvp.lastName}</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-lg">
                <div><span className="font-bold">{mvp.stats?.totalRuns}</span> Runs</div>
                <div><span className="font-bold">{mvp.stats?.wicketsTaken}</span> Wickets</div>
                <div><span className="font-bold">{mvp.stats?.matchesPlayed}</span> Matches</div>
              </div>
            </div>
            <Link href={`/people/${mvp.id}`}>
              <button className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md">
                View Profile
              </button>
            </Link>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Orange Cap - Top Batsmen */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-orange-500 p-2 rounded-lg text-white shadow-sm">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold">Top Run Scorers</h3>
          </div>
          <div className="space-y-4">
            {topBatsmen.map((player, index) => (
              <div key={player.id} className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${index === 0 ? 'bg-orange-500/10' : 'hover:bg-muted/50'}`}>
                <div className="font-bold text-muted-foreground w-6 text-center">{index + 1}</div>
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image 
                    src={player.profileImageUrl || ''} 
                    alt={player.displayName || `${player.firstName} ${player.lastName}`} 
                    fill 
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/people/${player.id}`} className="font-medium hover:text-primary truncate block">
                    {player.displayName}
                  </Link>
                </div>
                <div className="font-bold text-lg">{player.stats?.totalRuns}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Purple Cap - Top Bowlers */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-violet-500 p-2 rounded-lg text-white shadow-sm">
              <Trophy className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold">Top Wicket Takers</h3>
          </div>
          <div className="space-y-4">
            {topBowlers.map((player, index) => (
              <div key={player.id} className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${index === 0 ? 'bg-violet-500/10' : 'hover:bg-muted/50'}`}>
                <div className="font-bold text-muted-foreground w-6 text-center">{index + 1}</div>
                <div className="relative w-10 h-10 flex-shrink-0">
                  <Image 
                    src={player.profileImageUrl || ''} 
                    alt={player.displayName || `${player.firstName} ${player.lastName}`} 
                    fill 
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/people/${player.id}`} className="font-medium hover:text-primary truncate block">
                    {player.displayName}
                  </Link>
                </div>
                <div className="font-bold text-lg">{player.stats?.wicketsTaken}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* League Standings */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-500 p-2 rounded-lg text-white shadow-sm">
            <Medal className="h-5 w-5" />
          </div>
          <h3 className="text-xl font-bold">League Standings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 text-muted-foreground font-medium">Pos</th>
                <th className="text-left p-4 text-muted-foreground font-medium">Team</th>
                <th className="text-center p-4 text-muted-foreground font-medium">P</th>
                <th className="text-center p-4 text-muted-foreground font-medium">W</th>
                <th className="text-center p-4 text-muted-foreground font-medium">L</th>
                <th className="text-center p-4 text-muted-foreground font-medium">Pts</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, index) => (
                <tr key={row.team.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="p-4 font-medium">{index + 1}</td>
                  <td className="p-4">
                    <Link href={`/teams/${row.team.id}`} className="flex items-center gap-3 hover:text-primary font-medium">
                      <div 
                        className="w-6 h-6 rounded bg-muted" 
                        style={{ backgroundColor: row.team.teamColors?.primary || '#333' }} 
                      />
                      {row.team.name}
                    </Link>
                  </td>
                  <td className="text-center p-4">{row.played}</td>
                  <td className="text-center p-4">{row.won}</td>
                  <td className="text-center p-4">{row.lost}</td>
                  <td className="text-center p-4 font-bold">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

