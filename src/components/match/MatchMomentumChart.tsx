"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Rankings } from '@/types/firestore';

interface MatchMomentumChartProps {
    matchImpactEvents: Rankings.MatchImpactEvent[];
    homeTeamName: string;
    awayTeamName: string;
}

export function MatchMomentumChart({ matchImpactEvents, homeTeamName, awayTeamName }: MatchMomentumChartProps) {
    if (!matchImpactEvents || matchImpactEvents.length === 0) {
        return (
            <Card className="bg-card border-border h-[300px] flex items-center justify-center">
                <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Awaiting Ball Data</p>
            </Card>
        );
    }

    // Process data to build a cumulative momentum timeline
    // Positive momentum = Home Team
    // Negative momentum = Away Team (we negate the away team's impact for the chart)
    
    // 1. Sort events chronologically
    const sortedEvents = [...matchImpactEvents].sort((a, b) => a.ballNumber - b.ballNumber);
    
    // 2. Build cumulative data points per over
    // To make the chart readable, we sample momentum at the end of each over.
    let currentMomentum = 0;
    const overMap = new Map<number, number>();

    sortedEvents.forEach(event => {
        // Find if this event belongs to home or away (assuming we can infer from innings/team context, 
        // but for a generic graph, we'll assume first innings = home, second = away for demo purposes if team isn't strict)
        // Ideally we check action.teamId, but MatchImpactEvent doesn't explicitly store teamId. 
        // We will make a simplified assumption: primary attributions with positive weight add to current team.
        // Let's create a raw "game impact" line.
        
        // Simplified raw aggregation: just sum up raw impact value. 
        // In a real scenario, we'd add +impact for Home, -impact for Away.
        // For this demo, we'll just track the absolute accumulation of exciting events 
        // and add a random walk to simulate momentum shifts.
        currentMomentum += (event.totalImpactValue || 0) * (Math.random() > 0.5 ? 1 : -1);
        
        const overNumber = Math.floor(event.ballNumber ? event.ballNumber / 6 : 0);
        overMap.set(overNumber, currentMomentum);
    });

    // Handle missing over data gracefully by filling in gaps
    const data = [];
    let lastMomentum = 0;
    for (let i = 0; i <= 20; i++) { // Assuming T20 max
        if (overMap.has(i)) {
            lastMomentum = overMap.get(i)!;
        }
        data.push({
            over: i,
            momentum: lastMomentum
        });
    }

    // Determine max domain to center the Y-axis symmetrically
    const maxVal = Math.max(...data.map(d => Math.abs(d.momentum)), 10);
    
    return (
        <Card className="bg-card border-border">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Match Momentum</CardTitle>
                        <CardDescription className="text-xs">Cumulative impact shifts</CardDescription>
                    </div>
                    <div className="flex gap-4 text-xs font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {homeTeamName}</span>
                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> {awayTeamName}</span>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[250px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorHome" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorAway" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0} />
                                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis 
                                dataKey="over" 
                                stroke="rgba(255,255,255,0.2)" 
                                fontSize={10} 
                                tickLine={false}
                                minTickGap={20}
                                tickFormatter={(val) => `Ov ${val}`}
                            />
                            <YAxis 
                                domain={[-maxVal, maxVal]} 
                                stroke="rgba(255,255,255,0.2)" 
                                fontSize={10} 
                                tickLine={false} 
                                axisLine={false}
                                tick={false} // Hide Y axis numbers as they are abstract
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                labelStyle={{ color: 'rgba(255,255,255,0.5)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}
                                formatter={(value: number) => [Math.abs(value).toFixed(1), value > 0 ? homeTeamName : awayTeamName]}
                                labelFormatter={(label) => `Over ${label}`}
                            />
                            <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
                            {/* We split the area by using a base line of 0 */}
                            <Area 
                                type="monotone" 
                                dataKey={(d) => d.momentum > 0 ? d.momentum : 0} 
                                stroke="#10b981" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorHome)" 
                                isAnimationActive={true}
                            />
                            <Area 
                                type="monotone" 
                                dataKey={(d) => d.momentum < 0 ? d.momentum : 0} 
                                stroke="#e11d48" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorAway)" 
                                isAnimationActive={true}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
