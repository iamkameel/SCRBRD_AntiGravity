"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WormChartProps {
  innings1Data: { over: number; runs: number }[];
  innings2Data?: { over: number; runs: number }[];
  team1Name: string;
  team2Name?: string;
}

export function WormChart({ innings1Data, innings2Data, team1Name, team2Name }: WormChartProps) {
  // Transform data for Recharts
  // We need a single array of objects like { over: 1, team1: 5, team2: 8 }
  
  const maxOvers = Math.max(
    innings1Data.length, 
    innings2Data?.length || 0
  );

  const data = Array.from({ length: maxOvers }, (_, i) => {
    const overNum = i + 1;
    const team1Point = innings1Data.find(d => d.over === overNum);
    const team2Point = innings2Data?.find(d => d.over === overNum);

    return {
      over: overNum,
      [team1Name]: team1Point?.runs,
      ...(team2Name && { [team2Name]: team2Point?.runs })
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Worm Chart (Cumulative Runs)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="over" 
                label={{ value: 'Overs', position: 'insideBottom', offset: -5 }} 
              />
              <YAxis 
                label={{ value: 'Runs', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))' }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line 
                type="monotone" 
                dataKey={team1Name} 
                stroke="hsl(var(--primary))" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 6 }}
              />
              {team2Name && (
                <Line 
                  type="monotone" 
                  dataKey={team2Name} 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2} 
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
