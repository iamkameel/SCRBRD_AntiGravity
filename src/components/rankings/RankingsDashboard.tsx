"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Activity, TrendingUp, TrendingDown, Minus, Search, Filter, ArrowRight } from "lucide-react";
import { rankingsService } from '@/services/rankingsService';
import { Rankings } from '@/types/firestore';
import { UUID } from '@/types/schema_v4';

interface RankingsDashboardProps {
    seasonId?: UUID;
    initialTab?: 'teams' | 'players';
}

export default function RankingsDashboard({ seasonId, initialTab = 'teams' }: RankingsDashboardProps) {
    const [teamRankings, setTeamRankings] = useState<Rankings.RankingSnapshot[]>([]);
    const [playerRankings, setPlayerRankings] = useState<Rankings.RankingSnapshot[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRankings = async () => {
            setLoading(true);
            try {
                const [teams, players] = await Promise.all([
                    rankingsService.getRankings({ 
                        entityType: 'Team', 
                        rankingType: 'TeamRank',
                        seasonId 
                    }),
                    rankingsService.getRankings({ 
                        entityType: 'Person', 
                        rankingType: 'PlayerPower',
                        seasonId 
                    })
                ]);
                setTeamRankings(teams);
                setPlayerRankings(players);
            } catch (error) {
                console.error("Failed to load rankings:", error);
            } finally {
                setLoading(false);
            }
        };

        loadRankings();
    }, [seasonId]);

    const renderMovement = (movement?: number) => {
        if (!movement || movement === 0) return <Minus className="h-4 w-4 text-muted-foreground" />;
        return movement > 0 ? (
            <div className="flex items-center text-emerald-500 font-bold text-xs">
                <TrendingUp className="h-3 w-3 mr-1" /> {movement}
            </div>
        ) : (
            <div className="flex items-center text-rose-500 font-bold text-xs">
                <TrendingDown className="h-3 w-3 mr-1" /> {Math.abs(movement)}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-primary animate-pulse-glow" />
                    Global Rankings
                </h2>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-full bg-white/5 border-white/10 hover:bg-white/10">
                        <Filter className="h-4 w-4 mr-2" /> Filter
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 text-primary">
                        <Activity className="h-4 w-4 mr-2" /> Live Shifts
                    </Button>
                </div>
            </div>

            <Tabs defaultValue={initialTab} className="w-full">
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl mb-8">
                    <TabsTrigger value="teams" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white">Teams (TRS)</TabsTrigger>
                    <TabsTrigger value="players" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white">Players (PPR)</TabsTrigger>
                </TabsList>

                <TabsContent value="teams">
                    <div className="grid gap-4">
                        {teamRankings.map((rk, idx) => (
                            <RankCard 
                                key={rk.id} 
                                rank={idx + 1} 
                                name={`Team ${rk.entityId.slice(0, 8)}`} // Mock name resolver
                                score={rk.score}
                                movement={rk.movement}
                                stats="8 Wins | 2 Losses"
                            />
                        ))}
                        {teamRankings.length === 0 && <EmptyState label="No team rankings available yet." />}
                    </div>
                </TabsContent>

                <TabsContent value="players">
                    <div className="grid gap-4">
                        {playerRankings.map((rk, idx) => (
                            <RankCard 
                                key={rk.id} 
                                rank={idx + 1} 
                                name={`Player ${rk.entityId.slice(0, 8)}`} // Mock name resolver
                                score={rk.score}
                                movement={rk.movement}
                                stats="+45.2 Batting Impact / Match"
                            />
                        ))}
                        {playerRankings.length === 0 && <EmptyState label="No player ratings available yet." />}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function RankCard({ rank, name, score, movement, stats }: any) {
    return (
        <Card variant="glass" className="group overflow-hidden border-white/5 hover:border-primary/50 transition-all duration-300">
            <CardContent className="p-0 flex items-center">
                <div className="w-16 h-16 flex items-center justify-center bg-white/5 font-black text-2xl italic tracking-tighter text-muted-foreground/30 group-hover:text-primary transition-colors">
                    #{rank}
                </div>
                <div className="flex-1 px-6">
                    <div className="font-bold text-lg text-foreground">{name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        {stats}
                    </div>
                </div>
                <div className="flex items-center gap-8 px-8 py-4">
                    <div className="text-right">
                        <div className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Score</div>
                        <div className="text-2xl font-black text-primary font-mono tabular-nums">{score.toFixed(1)}</div>
                    </div>
                    <div className="w-12 flex flex-col items-center">
                         <div className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-1">Move</div>
                         {movement > 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : movement < 0 ? <TrendingDown className="h-4 w-4 text-rose-500" /> : <Minus className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/20 hover:text-primary translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function EmptyState({ label }: { label: string }) {
    return (
        <div className="h-48 flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-dashed border-white/10 opacity-60">
            <Activity className="h-8 w-8 mb-3 text-muted-foreground" />
            <p className="text-sm font-medium">{label}</p>
        </div>
    );
}
