"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";
import { TeamStanding } from "@/lib/utils/pointsTableUtils";

interface PointsTableProps {
  standings: TeamStanding[];
  title?: string;
}

export function PointsTable({ standings, title = "Points Table" }: PointsTableProps) {
  if (!standings || standings.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">No standings data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-3 text-left font-medium">#</th>
                <th className="p-3 text-left font-medium">Team</th>
                <th className="p-3 text-center font-medium">P</th>
                <th className="p-3 text-center font-medium">W</th>
                <th className="p-3 text-center font-medium">L</th>
                <th className="p-3 text-center font-medium">T</th>
                <th className="p-3 text-center font-medium">NR</th>
                <th className="p-3 text-center font-medium">Pts</th>
                <th className="p-3 text-center font-medium">NRR</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((team, index) => (
                <tr
                  key={team.teamId}
                  className={`border-b hover:bg-muted/30 transition-colors ${
                    index === 0 ? 'bg-amber-500/5' : ''
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{index + 1}</span>
                      {index === 0 && (
                        <Trophy className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-medium">{team.teamName}</span>
                  </td>
                  <td className="p-3 text-center">{team.played}</td>
                  <td className="p-3 text-center text-green-600 font-medium">{team.won}</td>
                  <td className="p-3 text-center text-red-600">{team.lost}</td>
                  <td className="p-3 text-center text-blue-600">{team.tied}</td>
                  <td className="p-3 text-center text-gray-600">{team.noResult}</td>
                  <td className="p-3 text-center">
                    <Badge variant="default" className="font-bold">
                      {team.points}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {team.netRunRate > 0 && (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      )}
                      {team.netRunRate < 0 && (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span
                        className={`font-mono ${
                          team.netRunRate > 0
                            ? 'text-green-600'
                            : team.netRunRate < 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {team.netRunRate > 0 ? '+' : ''}
                        {team.netRunRate.toFixed(3)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground font-medium mb-2">Legend:</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <div><span className="font-semibold">P</span> - Played</div>
            <div><span className="font-semibold">W</span> - Won</div>
            <div><span className="font-semibold">L</span> - Lost</div>
            <div><span className="font-semibold">T</span> - Tied</div>
            <div><span className="font-semibold">NR</span> - No Result</div>
            <div><span className="font-semibold">Pts</span> - Points</div>
            <div><span className="font-semibold">NRR</span> - Net Run Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
