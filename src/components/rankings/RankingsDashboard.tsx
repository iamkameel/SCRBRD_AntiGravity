"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Trophy, Activity, TrendingUp, TrendingDown, Minus, Search, Filter, ArrowRight, Info, Layers, RefreshCw } from "lucide-react";
import { getRankingsAction, getRankingBreakdownAction, recalculateRankingsAction, HydratedRankingSnapshot, RankingComponentItem } from '@/app/actions/rankingActions';

interface RankingsDashboardProps {
    seasonId?: string;
    initialTab?: 'teams' | 'players';
}

export default function RankingsDashboard({ initialTab = 'teams' }: RankingsDashboardProps) {
    const [teamRankings, setTeamRankings] = useState<HydratedRankingSnapshot[]>([]);
    const [playerRankings, setPlayerRankings] = useState<HydratedRankingSnapshot[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSnapshot, setSelectedSnapshot] = useState<HydratedRankingSnapshot | null>(null);
    const [breakdownComponents, setBreakdownComponents] = useState<RankingComponentItem[]>([]);
    const [breakdownLoading, setBreakdownLoading] = useState(false);
    const [recalculating, setRecalculating] = useState(false);

    const loadRankings = async () => {
        setLoading(true);
        try {
            const res = await getRankingsAction();
            if (res.success) {
                setTeamRankings(res.teams || []);
                setPlayerRankings(res.players || []);
            }
        } catch (error) {
            console.error("Failed to load rankings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRankings();
    }, []);

    const handleSelectCard = async (snapshot: HydratedRankingSnapshot) => {
        setSelectedSnapshot(snapshot);
        setBreakdownLoading(true);
        try {
            const res = await getRankingBreakdownAction(snapshot.id);
            if (res.success) {
                setBreakdownComponents(res.components || []);
            }
        } catch (err) {
            console.error("Failed to load breakdown:", err);
        } finally {
            setBreakdownLoading(false);
        }
    };

    const handleRecalculate = async () => {
        setRecalculating(true);
        try {
            await recalculateRankingsAction('Team', 'team-st-andrews');
            await loadRankings();
        } catch (err) {
            console.error("Recalculate failed:", err);
        } finally {
            setRecalculating(false);
        }
    };

    const filteredTeams = teamRankings.filter(t => 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.subtext.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPlayers = playerRankings.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (p.role && p.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
        p.subtext.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter text-foreground flex items-center gap-3">
                        <Trophy className="h-8 w-8 text-primary animate-pulse" />
                        Global Rankings Hub
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                        Canonical School Sports Ratings: Team Ranking Score (TRS) & Player Power Rating (PPR)
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input 
                            type="text"
                            placeholder="Search team or player..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary w-48 sm:w-64"
                        />
                    </div>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleRecalculate}
                        disabled={recalculating}
                        className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 text-primary font-bold text-xs"
                    >
                        <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${recalculating ? 'animate-spin' : ''}`} />
                        Recalculate
                    </Button>
                </div>
            </div>

            <Tabs defaultValue={initialTab} className="w-full">
                <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl mb-6">
                    <TabsTrigger value="teams" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">
                        Teams (TRS)
                    </TabsTrigger>
                    <TabsTrigger value="players" className="rounded-xl px-8 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">
                        Players (PPR)
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="teams">
                    {loading ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">Loading Team Rankings...</div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredTeams.map((rk) => (
                                <RankCard 
                                    key={rk.id} 
                                    snapshot={rk}
                                    onClick={() => handleSelectCard(rk)}
                                />
                            ))}
                            {filteredTeams.length === 0 && <EmptyState label="No matching team rankings found." />}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="players">
                    {loading ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">Loading Player Ratings...</div>
                    ) : (
                        <div className="grid gap-3">
                            {filteredPlayers.map((rk) => (
                                <RankCard 
                                    key={rk.id} 
                                    snapshot={rk}
                                    onClick={() => handleSelectCard(rk)}
                                />
                            ))}
                            {filteredPlayers.length === 0 && <EmptyState label="No matching player ratings found." />}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Component Breakdown Drill-down Modal */}
            <Dialog open={!!selectedSnapshot} onOpenChange={(open) => !open && setSelectedSnapshot(null)}>
                <DialogContent className="sm:rounded-3xl border-white/10 glass-card max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic uppercase text-foreground flex items-center gap-2">
                            <Layers className="h-5 w-5 text-primary" />
                            Score Breakdown: {selectedSnapshot?.name}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            {selectedSnapshot?.rankingType === 'TeamRank' ? 'TRS Weighted Model' : 'PPR Match Impact Aggregation'} • {selectedSnapshot?.subtext}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                            <div>
                                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Composite Rating</span>
                                <div className="text-3xl font-black text-primary font-mono tabular-nums">{selectedSnapshot?.score.toFixed(1)}</div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Rank Position</span>
                                <div className="text-2xl font-black text-foreground">#{selectedSnapshot?.rank}</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">Contributing Components</h4>
                            {breakdownLoading ? (
                                <div className="py-8 text-center text-xs text-muted-foreground">Loading breakdown metrics...</div>
                            ) : (
                                breakdownComponents.map((comp) => (
                                    <div key={comp.id} className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold text-foreground">
                                            <span>{comp.componentName}</span>
                                            <span className="font-mono text-primary">+{comp.contribution.toFixed(1)} pts</span>
                                        </div>
                                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className="bg-primary h-full transition-all duration-500" 
                                                style={{ width: `${Math.min(100, comp.normalisedValue)}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                                            <span>Weight: {(comp.weight * 100).toFixed(0)}%</span>
                                            <span>Normalised: {comp.normalisedValue.toFixed(1)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function RankCard({ snapshot, onClick }: { snapshot: HydratedRankingSnapshot; onClick: () => void }) {
    return (
        <Card 
            variant="glass" 
            onClick={onClick}
            className="group overflow-hidden border-white/5 hover:border-primary/50 transition-all duration-300 cursor-pointer"
        >
            <CardContent className="p-0 flex items-center">
                <div className="w-16 h-16 flex items-center justify-center bg-white/5 font-black text-2xl italic tracking-tighter text-muted-foreground/30 group-hover:text-primary transition-colors">
                    #{snapshot.rank}
                </div>
                <div className="flex-1 px-6 py-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors">{snapshot.name}</span>
                        {snapshot.role && (
                            <Badge variant="outline" className="text-[10px] uppercase border-white/10 text-muted-foreground">
                                {snapshot.role}
                            </Badge>
                        )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>{snapshot.subtext}</span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">{snapshot.stats}</span>
                    </div>
                </div>
                <div className="flex items-center gap-6 px-6 py-4">
                    <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                            {snapshot.rankingType === 'TeamRank' ? 'TRS' : 'PPR'} Score
                        </div>
                        <div className="text-2xl font-black text-primary font-mono tabular-nums">{snapshot.score.toFixed(1)}</div>
                    </div>
                    <div className="w-12 flex flex-col items-center">
                         <div className="text-[10px] uppercase font-bold text-muted-foreground/60 mb-1">Move</div>
                         {snapshot.movement > 0 ? (
                             <div className="flex items-center text-emerald-400 font-bold text-xs">
                                 <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> +{snapshot.movement}
                             </div>
                         ) : snapshot.movement < 0 ? (
                             <div className="flex items-center text-rose-400 font-bold text-xs">
                                 <TrendingDown className="h-3.5 w-3.5 mr-0.5" /> {snapshot.movement}
                             </div>
                         ) : (
                             <Minus className="h-4 w-4 text-muted-foreground" />
                         )}
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full hover:bg-primary/20 hover:text-primary opacity-60 group-hover:opacity-100 transition-all">
                        <Info className="h-4 w-4" />
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
