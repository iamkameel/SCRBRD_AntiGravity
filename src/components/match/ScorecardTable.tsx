import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Innings } from "@/types/firestore";

interface ScorecardTableProps {
  innings: Innings;
  teamName: string;
  allPlayers: Array<{ id: string; firstName: string; lastName: string }>;
}

export function ScorecardTable({ innings, teamName, allPlayers }: ScorecardTableProps) {
  // Helper to get player name
  const getPlayerName = (playerId: string) => {
    const player = allPlayers.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown';
  };

  // Extract data
  const batsmen = innings.batsmen || [];
  const bowlers = innings.bowlers || [];
  const extras = innings.extras || { wides: 0, noballs: 0, byes: 0, legbyes: 0 };
  const totalExtras = (extras.wides || 0) + (extras.noballs || 0) + (extras.byes || 0) + (extras.legbyes || 0);
  const totalRuns = innings.runs || 0;
  const totalWickets = innings.wickets || 0;
  const totalOvers = innings.overs || 0;

  return (
    <div className="space-y-6">
      {/* Batting Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{teamName} Batting</span>
            <Badge variant="outline">{totalRuns}/{totalWickets} ({totalOvers} ov)</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Batsman</TableHead>
                <TableHead className="w-[200px]">Dismissal</TableHead>
                <TableHead className="text-right">R</TableHead>
                <TableHead className="text-right">B</TableHead>
                <TableHead className="text-right">4s</TableHead>
                <TableHead className="text-right">6s</TableHead>
                <TableHead className="text-right">SR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batsmen.map((batsman, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    {getPlayerName(batsman.playerId)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {batsman.isOut ? (batsman.dismissal || 'out') : 'not out'}
                  </TableCell>
                  <TableCell className="text-right font-semibold">{batsman.runs}</TableCell>
                  <TableCell className="text-right">{batsman.ballsFaced}</TableCell>
                  <TableCell className="text-right">{batsman.fours || 0}</TableCell>
                  <TableCell className="text-right">{batsman.sixes || 0}</TableCell>
                  <TableCell className="text-right">{batsman.strikeRate?.toFixed(2) || '0.00'}</TableCell>
                </TableRow>
              ))}
              {/* Extras Row */}
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Extras</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  (w {extras.wides || 0}, nb {extras.noballs || 0}, b {extras.byes || 0}, lb {extras.legbyes || 0})
                </TableCell>
                <TableCell className="text-right font-semibold">{totalExtras}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
              {/* Total Row */}
              <TableRow className="font-bold bg-primary/10">
                <TableCell>Total</TableCell>
                <TableCell>({totalOvers} overs)</TableCell>
                <TableCell className="text-right">{totalRuns}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bowling Card */}
      <Card>
        <CardHeader>
          <CardTitle>Bowling</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Bowler</TableHead>
                <TableHead className="text-right">O</TableHead>
                <TableHead className="text-right">M</TableHead>
                <TableHead className="text-right">R</TableHead>
                <TableHead className="text-right">W</TableHead>
                <TableHead className="text-right">Econ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bowlers.map((bowler, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">
                    {getPlayerName(bowler.playerId)}
                  </TableCell>
                  <TableCell className="text-right">{bowler.overs?.toFixed(1) || '0.0'}</TableCell>
                  <TableCell className="text-right">{bowler.maidens || 0}</TableCell>
                  <TableCell className="text-right">{bowler.runsConceded}</TableCell>
                  <TableCell className="text-right font-semibold">{bowler.wickets || 0}</TableCell>
                  <TableCell className="text-right">{bowler.economy?.toFixed(2) || '0.00'}</TableCell>
                </TableRow>
              ))}
              {bowlers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No bowling data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
