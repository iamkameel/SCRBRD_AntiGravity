"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerStats } from "@/app/actions/playerStatsActions";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ComparisonChartProps {
  players: Array<{
    id: string;
    name: string;
    stats: PlayerStats;
  }>;
  category: 'batting' | 'bowling';
}

export function ComparisonChart({ players, category }: ComparisonChartProps) {
  if (players.length === 0) return null;

  const battingData = [
    {
      name: 'Runs',
      ...Object.fromEntries(players.map(p => [p.name, p.stats.batting.runs]))
    },
    {
      name: 'Average',
      ...Object.fromEntries(players.map(p => [p.name, p.stats.batting.average]))
    },
    {
      name: 'Strike Rate',
      ...Object.fromEntries(players.map(p => [p.name, p.stats.batting.strikeRate]))
    },
    {
      name: '50s',
      ...Object.fromEntries(players.map(p => [p.name, p.stats.batting.fifties]))
    },
    {
      name: '100s',
      ...Object.fromEntries(players.map(p => [p.name, p.stats.batting.hundreds]))
    },
  ];

  const bowlingData = [
    {
      name: 'Wickets',
      ...Object.fromEntries(players.map(p => [p.name, p.stats.bowling.wickets]))
    },
    {
      name: 'Average',
      ...Object.fromEntries(players.map(p => [p.name, p.stats.bowling.average]))
    },
    {
      name: 'Economy',
      ...Object.fromEntries(players.map(p => [p.name, p.stats.bowling.economy]))
    },
    {
      name: '5W',
      ...Object.fromEntries(players.map(p => [p.name, p.stats.bowling.fiveWickets]))
    },
  ];

  const data = category === 'batting' ? battingData : bowlingData;
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{category === 'batting' ? 'Batting' : 'Bowling'} Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
              />
              <Legend />
              {players.map((player, index) => (
                <Bar 
                  key={player.id}
                  dataKey={player.name}
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
