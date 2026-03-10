"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ManhattanChartProps {
  data: { over: number; runs: number; wickets: number }[];
  teamName: string;
}

export function ManhattanChart({ data, teamName }: ManhattanChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manhattan Chart ({teamName})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
              <XAxis 
                dataKey="over" 
                label={{ value: 'Overs', position: 'insideBottom', offset: -5 }} 
              />
              <YAxis 
                label={{ value: 'Runs', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip 
                cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-popover p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Over
                            </span>
                            <span className="font-bold text-muted-foreground">
                              {d.over}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Runs
                            </span>
                            <span className="font-bold">
                              {d.runs}
                            </span>
                          </div>
                          {d.wickets > 0 && (
                            <div className="col-span-2 flex flex-col border-t pt-1 mt-1">
                              <span className="text-[0.70rem] uppercase text-destructive font-bold">
                                Wickets: {d.wickets}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="runs" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.wickets > 0 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
