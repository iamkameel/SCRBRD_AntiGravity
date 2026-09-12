'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Target, Flame, Printer, Sparkles, AlertTriangle, Crosshair, ChevronRight, BarChart3, Compass, UserCheck } from 'lucide-react';
import { getOppositionDossier, OppositionScoutingDossier } from '@/lib/intelligence/scoutingDossierEngine';

export function OppositionScoutingDossierView({ fixtureId = 'fix-1st-xi-kes' }: { fixtureId?: string }) {
    const [dossier, setDossier] = useState<OppositionScoutingDossier>(getOppositionDossier(fixtureId));
    const [selectedTab, setSelectedTab] = useState('summary');

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    return (
        <div className="space-y-6 font-sans text-[#f3f5ef] print:text-black print:bg-white">
            {/* Action Bar & Print Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-['Syne',sans-serif] tracking-tight">Opposition Scouting & Tactical Dossier</h1>
                        <p className="text-xs text-slate-400 font-mono">Pre-Match Intelligence Briefing • {dossier.oppositionSchoolName}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Badge className={`font-mono text-xs px-3 py-1 flex items-center gap-1.5 ${
                        dossier.overallThreatRating === 'EXTREME' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        dossier.overallThreatRating === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    }`}>
                        <AlertTriangle className="w-3.5 h-3.5" /> THREAT: {dossier.overallThreatRating}
                    </Badge>

                    <Button size="sm" onClick={handlePrint} className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold font-mono text-xs">
                        <Printer className="w-3.5 h-3.5 mr-1.5" /> Export Briefing (PDF)
                    </Button>
                </div>
            </div>

            {/* Print Only Header Banner */}
            <div className="hidden print:block space-y-2 border-b border-black pb-4 mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">SCRBRD OS — PRE-MATCH SCOUTING DOSSIER</h1>
                    <span className="text-sm font-mono">{dossier.generatedAt}</span>
                </div>
                <div className="text-lg font-bold">{dossier.homeTeamName} vs {dossier.oppositionTeamName}</div>
                <div className="text-sm">Venue: {dossier.venueName} • Date: {dossier.matchDate}</div>
            </div>

            {/* Fixture & Opponent Header Card */}
            <Card className="p-6 bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl backdrop-blur-2xl text-slate-100 relative overflow-hidden print:border-black print:bg-white print:text-black print:shadow-none">
                {/* Background Ambient Glow */}
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />

                <div className="relative z-10 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Opposition Name & Match Details */}
                        <div className="md:col-span-7 space-y-2">
                            <div className="text-xs font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5" /> Opposition Dossier Target
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white font-['Syne',sans-serif] tracking-tight print:text-black">
                                {dossier.oppositionTeamName}
                            </h2>
                            <p className="text-xs text-slate-400 font-mono print:text-slate-600">
                                Match Date: <strong className="text-white print:text-black">{dossier.matchDate}</strong> • Venue: <strong className="text-cyan-400 print:text-black">{dossier.venueName}</strong>
                            </p>
                        </div>

                        {/* Quick Telemetry Indicators */}
                        <div className="md:col-span-5 grid grid-cols-2 gap-3 font-mono text-xs">
                            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-1 print:border-slate-300">
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Avg 1st Innings</div>
                                <div className="text-xl font-black text-amber-400 print:text-black">{dossier.oppositionSummary.averageFirstInningsScore} Runs</div>
                                <div className="text-[10px] text-slate-400">Standard T20 Match</div>
                            </div>

                            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl space-y-1 print:border-slate-300">
                                <div className="text-[10px] text-slate-400 uppercase font-bold">Recent Form</div>
                                <div className="flex gap-1">
                                    {dossier.oppositionSummary.recentForm.map((res, i) => (
                                        <span key={i} className={`w-6 h-6 rounded-md font-bold flex items-center justify-center text-xs ${
                                            res === 'W' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 print:bg-slate-200 print:text-black' :
                                            'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                        }`}>
                                            {res}
                                        </span>
                                    ))}
                                </div>
                                <div className="text-[10px] text-slate-400">Last 5 Matches</div>
                            </div>
                        </div>
                    </div>

                    {/* Key Strategic Insights Banner */}
                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-amber-200 print:bg-slate-100 print:text-black print:border-slate-300">
                        <div>
                            <span className="text-[10px] uppercase text-amber-400/80 font-bold block">Toss Preference:</span>
                            <strong className="text-white print:text-black">{dossier.oppositionSummary.tossPreference}</strong>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase text-amber-400/80 font-bold block">Tactical Bias:</span>
                            <strong className="text-white print:text-black">{dossier.oppositionSummary.spinVsPaceBias}</strong>
                        </div>
                        <div>
                            <span className="text-[10px] uppercase text-amber-400/80 font-bold block">Powerplay vs Death Rating:</span>
                            <strong className="text-cyan-400 print:text-black">PP {dossier.oppositionSummary.powerplayAggressionRating}/100 • Death {dossier.oppositionSummary.deathOverEfficiencyRating}/100</strong>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Navigation Tabs (Hidden in Print) */}
            <Tabs defaultValue="threats" onValueChange={setSelectedTab} className="space-y-6 print:space-y-4">
                <TabsList className="bg-slate-900 border border-white/10 p-1 rounded-xl font-mono text-xs text-slate-400 print:hidden">
                    <TabsTrigger value="threats" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold">
                        Key Player Threat Matrix ({dossier.keyPlayers.length})
                    </TabsTrigger>
                    <TabsTrigger value="tactics" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 font-bold">
                        Match Phase Tactical Plan
                    </TabsTrigger>
                </TabsList>

                {/* Tab 1: Key Player Threat Matrix */}
                <TabsContent value="threats" className="space-y-4 print:block">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dossier.keyPlayers.map((player) => (
                            <Card key={player.id} className="p-5 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl text-slate-100 space-y-4 print:border-slate-300 print:bg-white print:text-black">
                                {/* Player Header */}
                                <div className="flex justify-between items-start border-b border-white/10 pb-3 print:border-slate-200">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-base font-bold font-['Syne',sans-serif] text-white print:text-black">{player.name}</h3>
                                            <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 text-[10px] font-mono print:text-black">{player.role}</Badge>
                                        </div>
                                        <p className="text-xs text-slate-400 font-mono mt-0.5">{player.battingStyle} • {player.bowlingStyle}</p>
                                    </div>

                                    <Badge className={`font-mono text-[10px] font-bold ${
                                        player.threatLevel === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                        player.threatLevel === 'HIGH' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                        'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    }`}>
                                        {player.threatLevel} THREAT
                                    </Badge>
                                </div>

                                {/* Scoring Zones Breakdown */}
                                {player.scoringZones.length > 0 && (
                                    <div className="space-y-2 font-mono text-xs">
                                        <div className="text-[10px] uppercase text-slate-400 font-bold">Wagon Wheel Scoring Sectors</div>
                                        <div className="space-y-1.5">
                                            {player.scoringZones.map((sz, idx) => (
                                                <div key={idx} className="space-y-1">
                                                    <div className="flex justify-between text-[11px]">
                                                        <span className="text-slate-300 print:text-black">{sz.zone}</span>
                                                        <span className="font-bold text-amber-400 print:text-black">{sz.percentage}%</span>
                                                    </div>
                                                    <div className="w-full bg-slate-950 rounded-full h-1.5 border border-white/5 overflow-hidden print:border-slate-300">
                                                        <div 
                                                            className="bg-gradient-to-r from-amber-500 to-cyan-400 h-full rounded-full"
                                                            style={{ width: `${sz.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Weakness & Tactical Recommendation Box */}
                                <div className="space-y-2 pt-2 border-t border-white/5 print:border-slate-200 font-mono text-xs">
                                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1 print:bg-slate-100 print:text-black print:border-slate-300">
                                        <div className="text-[10px] uppercase text-rose-400 font-bold flex items-center gap-1">
                                            <Target className="w-3 h-3" /> Target Weakness:
                                        </div>
                                        <p className="text-slate-200 text-[11px] leading-relaxed print:text-slate-800">{player.weaknessTarget}</p>
                                    </div>

                                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl space-y-1 print:bg-slate-100 print:text-black print:border-slate-300">
                                        <div className="text-[10px] uppercase text-cyan-400 font-bold flex items-center gap-1">
                                            <Compass className="w-3 h-3" /> Recommended Bowling / Field Plan:
                                        </div>
                                        <p className="text-slate-200 text-[11px] leading-relaxed print:text-slate-800">{player.recommendedTactics}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* Tab 2: Match Phase Tactical Plan */}
                <TabsContent value="tactics" className="space-y-4 print:block print:mt-6">
                    <div className="space-y-4">
                        {dossier.tacticalPlans.map((plan, idx) => (
                            <Card key={idx} className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-xl backdrop-blur-xl text-slate-100 space-y-4 print:border-slate-300 print:bg-white print:text-black">
                                <div className="flex justify-between items-center border-b border-white/10 pb-3 print:border-slate-200">
                                    <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2 print:text-black">
                                        <Flame className="w-4 h-4" /> Phase {idx + 1}: {plan.phase} PLAN
                                    </h3>
                                    <Badge variant="outline" className="border-white/10 text-slate-300 font-mono text-[10px] print:text-black">
                                        Key Matchup: {plan.keyMatchup}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1 print:border-slate-200">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Batting Strategy</div>
                                        <p className="text-slate-200 text-[11px] leading-relaxed print:text-black">{plan.battingPlan}</p>
                                    </div>

                                    <div className="p-3 bg-white/5 border border-white/5 rounded-xl space-y-1 print:border-slate-200">
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">Bowling & Spell Strategy</div>
                                        <p className="text-slate-200 text-[11px] leading-relaxed print:text-black">{plan.bowlingPlan}</p>
                                    </div>

                                    <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl space-y-1 print:bg-slate-100 print:border-slate-300">
                                        <div className="text-[10px] text-cyan-400 font-bold uppercase">Fielding Setup</div>
                                        <p className="text-slate-200 text-[11px] leading-relaxed print:text-black">{plan.recommendedFieldPlacement}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
