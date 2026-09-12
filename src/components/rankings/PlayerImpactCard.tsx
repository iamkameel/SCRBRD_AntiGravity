"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Zap, Shield, Target, Award, Info, Loader2 } from 'lucide-react';
import { Rankings } from '@/types/firestore';
import { UUID } from '@/types/schema_v4';
import { rankingsService } from '@/services/rankingsService';

interface PlayerImpactCardProps {
    playerId: string;
}

export default function PlayerImpactCard({ playerId }: PlayerImpactCardProps) {
    const [impact, setImpact] = useState<Rankings.PlayerMatchImpact | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchImpact() {
            setLoading(true);
            try {
                // Fetch the PPR (Player Power Rating) aggregate data
                const pprData = await rankingsService.calculatePPR(playerId as UUID, {});
                if (pprData) {
                    
                    // Extract components from the PPR calculation
                    const battingComp = pprData.components.find(c => c.componentName === 'Batting Impact');
                    const bowlingComp = pprData.components.find(c => c.componentName === 'Bowling Impact');
                    const clutchComp = pprData.components.find(c => c.componentName === 'Clutch Performance');

                    // Adapt the PPR data to fit the visual impact structure
                    setImpact({
                        id: crypto.randomUUID() as UUID,
                        playerId: playerId as UUID,
                        matchId: 'aggregate' as UUID,
                        teamId: 'unknown' as UUID,
                        seasonId: 'current' as UUID,
                        // Null where the engine has no component for this
                        // player: an untracked dimension renders as "—" rather
                        // than a plausible-looking number.
                        battingImpact: battingComp ? battingComp.normalisedValue : null,
                        bowlingImpact: bowlingComp ? bowlingComp.normalisedValue : null,
                        fieldingImpact: null, // Not tracked by the impact engine yet
                        clutchImpact: clutchComp ? clutchComp.normalisedValue : null,
                        momentumShiftImpact: null, // Not tracked by the impact engine yet
                        totalImpact: pprData.score,
                        pressureIndex: 1.0,
                        oppositionMultiplier: 1.0,
                        badgesJson: [],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    } as any); // Cast as any to bypass strict ID types for this aggregate view
                }
            } catch (error) {
                console.error("Failed to fetch player impact:", error);
            } finally {
                setLoading(false);
            }
        }
        
        if (playerId) {
            fetchImpact();
        }
    }, [playerId]);

    if (loading) {
        return (
            <Card variant="glass" className="w-full max-w-2xl h-[400px] flex items-center justify-center border-primary/20 bg-black/40 backdrop-blur-3xl">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
        );
    }

    if (!impact) {
        return null; // Don't show if no impact data
    }

    // Only dimensions the engine actually produced are plotted.
    const chartData = ([
        { subject: 'Batting', value: impact.battingImpact },
        { subject: 'Bowling', value: impact.bowlingImpact },
        { subject: 'Fielding', value: impact.fieldingImpact },
        { subject: 'Clutch', value: impact.clutchImpact },
        { subject: 'Momentum', value: impact.momentumShiftImpact },
    ] as Array<{ subject: string; value: number | null }>)
        .filter(d => d.value !== null)
        .map(d => ({ subject: d.subject, A: Math.min(100, d.value as number), fullMark: 100 }));

    // Season rating is derived from the score, not asserted.
    const seasonRating =
        impact.totalImpact >= 80 ? 'Elite'
            : impact.totalImpact >= 65 ? 'Excellent'
                : impact.totalImpact >= 50 ? 'Strong'
                    : impact.totalImpact >= 35 ? 'Developing'
                        : 'Emerging';

    return (
        <Card variant="glass" className="w-full max-w-2xl overflow-hidden border-primary/20 bg-black/40 backdrop-blur-3xl shadow-[0_0_50px_rgba(var(--primary),0.1)]">
            <CardHeader className="relative pb-0">
                <div className="absolute top-6 right-6 flex gap-2">
                    {impact.badgesJson?.map((badge, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/10 border-primary/30 text-primary font-bold px-3 py-1 animate-pulse">
                            {badge}
                        </Badge>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-emerald-500 p-0.5 shadow-lg animate-float">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center font-black text-2xl text-white">
                            {impact.totalImpact.toFixed(0)}
                        </div>
                    </div>
                    <div>
                        <CardTitle className="text-3xl font-black italic uppercase italic tracking-tighter">Impact Profile</CardTitle>
                        <CardDescription className="text-muted-foreground/60 flex items-center gap-2 mt-1 font-medium italic">
                            Season Rating: <span className="text-foreground font-black">{seasonRating}</span>
                            <Award className="h-4 w-4 text-amber-500" />
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="grid md:grid-cols-2 gap-8 pt-6">
                {/* Visual Analytics */}
                <div className="h-[280px] w-full flex items-center justify-center bg-white/5 rounded-3xl border border-white/5 relative group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl duration-700" />
                    <ResponsiveContainer width="100%" height="100%">
                        {/* margin leaves room for the outermost axis labels,
                            which were clipping at the chart bounds */}
                        <RadarChart
                            cx="50%"
                            cy="50%"
                            outerRadius="68%"
                            data={chartData}
                            margin={{ top: 16, right: 40, bottom: 16, left: 40 }}
                        >
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 'bold' }}
                            />
                            <Radar
                                name="Impact"
                                dataKey="A"
                                stroke="var(--primary)"
                                fill="var(--primary)"
                                fillOpacity={0.4}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* Sub-metrics Breakdown */}
                <div className="space-y-6 flex flex-col justify-center">
                    <ImpactMetric 
                        icon={Zap} 
                        label="Primary Impact" 
                        value={Math.max(impact.battingImpact ?? -1, impact.bowlingImpact ?? -1) >= 0
                            ? Math.max(impact.battingImpact ?? -1, impact.bowlingImpact ?? -1)
                            : null}
                        color="bg-primary"
                    />
                    <ImpactMetric 
                        icon={Shield} 
                        label="Defensive Contribution" 
                        value={impact.fieldingImpact} 
                        color="bg-emerald-500"
                    />
                    <ImpactMetric 
                        icon={Target} 
                        label="Clutch Index" 
                        value={impact.clutchImpact} 
                        color="bg-amber-500"
                    />
                    
                    <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3">
                         <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                         <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
                            Calculated using the V2 Impact Engine. Includes opposition strength weighting and pressure multipliers.
                         </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function ImpactMetric({ icon: Icon, label, value, color }: {
    icon: React.ElementType; label: string; value: number | null; color: string;
}) {
    const tracked = value !== null && Number.isFinite(value);
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest px-1">
                <span className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="h-3.5 w-3.5" /> {label}
                </span>
                {tracked
                    ? <span className="text-foreground">{(value as number).toFixed(1)}</span>
                    : <span className="text-muted-foreground/40 normal-case tracking-normal font-medium">Not tracked</span>}
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                {tracked && (
                    <div
                        className={`h-full ${color} shadow-[0_0_10px_rgba(var(--primary),0.3)] transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.min(100, value as number)}%` }}
                    />
                )}
            </div>
        </div>
    );
}
