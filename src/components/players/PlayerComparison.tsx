"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPlayerStatsAction, PlayerStats } from "@/app/actions/playerStatsActions";
import { ComparisonChart } from "@/components/charts/lazy";
import { PlayerComparisonTool } from "./PlayerComparisonTool";
import { Users, X, TrendingUp, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
}

interface PlayerComparisonProps {
  availablePlayers: Player[];
}

export function PlayerComparison({ availablePlayers }: PlayerComparisonProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [playerStats, setPlayerStats] = useState<Map<string, PlayerStats>>(new Map());
  const [loading, setLoading] = useState(false);

  const handleAddPlayer = async (playerId: string) => {
    if (selectedPlayers.includes(playerId) || selectedPlayers.length >= 4) return;

    setLoading(true);
    const result = await getPlayerStatsAction(playerId);
    
    if (result.success && result.stats) {
      setPlayerStats(new Map(playerStats.set(playerId, result.stats)));
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
    setLoading(false);
  };

  const handleRemovePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    const newStats = new Map(playerStats);
    newStats.delete(playerId);
    setPlayerStats(newStats);
  };

  const comparisonData = selectedPlayers.map(id => {
    const player = availablePlayers.find(p => p.id === id);
    const stats = playerStats.get(id);
    return {
      id,
      name: player ? `${player.firstName} ${player.lastName}` : 'Unknown',
      stats: stats!
    };
  }).filter(p => p.stats);

  return (
    <div className="space-y-6">
      {/* Player Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Players to Compare
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select onValueChange={handleAddPlayer} disabled={loading || selectedPlayers.length >= 4}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Add a player..." />
              </SelectTrigger>
              <SelectContent>
                {availablePlayers
                  .filter(p => !selectedPlayers.includes(p.id))
                  .map(player => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.firstName} {player.lastName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selected Players */}
          {selectedPlayers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedPlayers.map(id => {
                const player = availablePlayers.find(p => p.id === id);
                return (
                  <Badge key={id} variant="secondary" className="gap-2 pr-1">
                    {player ? `${player.firstName} ${player.lastName}` : 'Unknown'}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemovePlayer(id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Select 2-4 players to compare. {selectedPlayers.length}/4 selected.
          </p>
        </CardContent>
      </Card>

      {/* Comparison Stats */}
      {comparisonData.length >= 2 && (
        <>
          {/* Battle Card — shown when exactly 2 players are selected */}
          {comparisonData.length === 2 && (() => {
            const [pa, pb] = comparisonData;
            const toToolStats = (p: typeof pa) => ({
              name: p.name,
              role: p.stats.batting.runs > 100 ? 'Batter' : 'All-Rounder',
              avatar: p.name.split(' ').map((s: string) => s[0]).join('').slice(0, 2),
              domains: {
                batting: Math.min(100, Math.round(p.stats.batting.average * 2.5)),
                bowling: Math.min(100, p.stats.bowling.wickets > 0 ? Math.round(100 - p.stats.bowling.economy * 10) : 20),
                physical: 70,
                tactical: Math.min(100, Math.round(p.stats.batting.strikeRate * 0.6)),
                mental: Math.min(100, 60 + (p.stats.batting.fifties * 5)),
              },
              metrics: {
                avg: p.stats.batting.average,
                sr: p.stats.batting.strikeRate,
                eco: p.stats.bowling.economy,
              },
            });
            return (
              <PlayerComparisonTool
                playerA={toToolStats(pa)}
                playerB={toToolStats(pb)}
              />
            );
          })()}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparisonData.map((player, index) => (
              <Card key={player.id}>
                <CardHeader>
                  <CardTitle className="text-base">{player.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Batting */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-xs font-semibold text-muted-foreground">BATTING</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Runs</span>
                        <span className="font-semibold">{player.stats.batting.runs}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg</span>
                        <span className="font-semibold">{player.stats.batting.average.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">SR</span>
                        <span className="font-semibold">{player.stats.batting.strikeRate.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">50s/100s</span>
                        <span className="font-semibold">{player.stats.batting.fifties}/{player.stats.batting.hundreds}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bowling */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-red-500" />
                      <span className="text-xs font-semibold text-muted-foreground">BOWLING</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wickets</span>
                        <span className="font-semibold">{player.stats.bowling.wickets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg</span>
                        <span className="font-semibold">{player.stats.bowling.average.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Econ</span>
                        <span className="font-semibold">{player.stats.bowling.economy.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Best</span>
                        <span className="font-semibold">{player.stats.bowling.bestFigures}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ComparisonChart players={comparisonData} category="batting" />
            <ComparisonChart players={comparisonData} category="bowling" />
          </div>
        </>
      )}

      {comparisonData.length < 2 && selectedPlayers.length > 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Select at least 2 players to see comparison</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
