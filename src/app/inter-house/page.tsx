"use client";

import React, { useState } from 'react';
import { 
    Trophy, Shield, Calendar, Award, Plus, 
    Layers, Play, ChevronRight, FileText
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { InterHouseService } from '@/services/interHouseService';
import Link from 'next/link';

export default function InterHouseHubPage() {
    const competitions = InterHouseService.getCompetitions();
    const activeComp = competitions[0];
    const standings = activeComp ? InterHouseService.getStandings(activeComp.cricketCompetitionId) : [];
    const houses = InterHouseService.getHouses();
    const ledger = activeComp ? InterHouseService.getLedger(activeComp.cricketCompetitionId) : [];
    const fixtures = activeComp ? InterHouseService.getFixtures(activeComp.cricketCompetitionId) : [];
    const ruleset = activeComp ? InterHouseService.getRuleset(activeComp.rulesetId) : undefined;

    const [activeTab, setActiveTab] = useState('standings');

    // Utility map for house details
    const getHouseName = (houseId: string) => {
        const found = houses.find(h => h.houseId === houseId || h.houseTeamId === houseId);
        return found ? found.name : houseId;
    };

    const getHouseCode = (houseId: string) => {
        const found = houses.find(h => h.houseId === houseId || h.houseTeamId === houseId);
        return found ? (found.shortName || 'HSE') : 'HSE';
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
            {/* Top Banner Header */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/20 p-8 shadow-2xl">
                <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 px-3 py-1 font-semibold flex items-center gap-1.5">
                                <Trophy className="w-3.5 h-3.5" /> SCHOOL OPERATING SYSTEM
                            </Badge>
                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 px-3 py-1">
                                Inter-House Engine
                            </Badge>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white font-sans">
                            Inter-House Cricket Hub
                        </h1>
                        <p className="text-slate-400 mt-2 max-w-2xl text-sm md:text-base">
                            The central command center for school internal house competitions, standings, points ledgers, house rosters, and inter-house derby fixtures.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/fixtures/create?context=INTER_HOUSE">
                            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20">
                                <Plus className="w-4 h-4" /> Schedule House Derby
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                            <span>Houses Enrolled</span>
                            <Shield className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">{houses.length}</div>
                        <p className="text-xs text-slate-500 mt-1">Founders, Falcons, Lions, Eagles</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                            <span>Leading House</span>
                            <Trophy className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="text-2xl font-bold text-amber-400 truncate">
                            {standings[0] ? getHouseName(standings[0].houseId) : 'Founders House'}
                        </div>
                        <p className="text-xs text-amber-300/70 mt-1 flex items-center gap-1">
                            {standings[0]?.points || 14} pts • NRR +{standings[0]?.netRunRate || '1.85'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                            <span>Active Trophy</span>
                            <Award className="w-4 h-4 text-indigo-400" />
                        </div>
                        <div className="text-lg font-bold text-white truncate">
                            {activeComp?.name || 'Founders Cup 2026'}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">Season 2026 T20 Championship</p>
                    </CardContent>
                </Card>

                <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-sm">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                            <span>House Derbies</span>
                            <Calendar className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-3xl font-bold text-white">{fixtures.length} Scheduled</div>
                        <p className="text-xs text-emerald-400/80 mt-1">Next: Sept 18 (Founders vs Falcons)</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Tabs Section */}
            <Tabs defaultValue="standings" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl">
                    <TabsTrigger value="standings" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium">
                        House Standings & NRR
                    </TabsTrigger>
                    <TabsTrigger value="houses" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium">
                        House Rosters ({houses.length})
                    </TabsTrigger>
                    <TabsTrigger value="ledger" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium">
                        Points Ledger Log
                    </TabsTrigger>
                    <TabsTrigger value="fixtures" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium">
                        House Fixtures ({fixtures.length})
                    </TabsTrigger>
                    <TabsTrigger value="rules" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg px-4 py-2 text-sm font-medium">
                        Competition Ruleset
                    </TabsTrigger>
                </TabsList>

                {/* TAB 1: STANDINGS */}
                <TabsContent value="standings" className="space-y-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader className="border-b border-slate-800/80 pb-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-amber-400" />
                                        {activeComp?.name || 'Founders Cup 2026'} Official Standings
                                    </CardTitle>
                                    <p className="text-slate-400 text-xs mt-1">
                                        4 pts per win • 2 pts per tie • Bonus points for win margin & wickets
                                    </p>
                                </div>
                                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                    Live Updated
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-300">
                                    <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs border-b border-slate-800">
                                        <tr>
                                            <th className="py-3.5 px-4 font-semibold">Pos</th>
                                            <th className="py-3.5 px-4 font-semibold">House Team</th>
                                            <th className="py-3.5 px-4 font-semibold text-center">P</th>
                                            <th className="py-3.5 px-4 font-semibold text-center">W</th>
                                            <th className="py-3.5 px-4 font-semibold text-center">L</th>
                                            <th className="py-3.5 px-4 font-semibold text-center">T</th>
                                            <th className="py-3.5 px-4 font-semibold text-center">Bonus</th>
                                            <th className="py-3.5 px-4 font-semibold text-center">NRR</th>
                                            <th className="py-3.5 px-4 font-semibold text-right">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/60">
                                        {standings.map((s, idx) => (
                                            <tr key={s.houseTeamId} className="hover:bg-slate-800/40 transition-colors">
                                                <td className="py-4 px-4 font-bold text-slate-200">
                                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                                        idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                                                        idx === 1 ? 'bg-slate-700 text-slate-300' : 'bg-slate-900 text-slate-500'
                                                    }`}>
                                                        {s.position}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 font-medium text-white">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-3.5 h-3.5 rounded-full border border-white/20 bg-blue-500" />
                                                        <div>
                                                            <div className="font-semibold text-white">{getHouseName(s.houseId)}</div>
                                                            <div className="text-xs text-slate-400">{getHouseCode(s.houseId)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-4 text-center text-slate-300 font-mono">{s.played}</td>
                                                <td className="py-4 px-4 text-center text-emerald-400 font-mono font-bold">{s.won}</td>
                                                <td className="py-4 px-4 text-center text-rose-400 font-mono">{s.lost}</td>
                                                <td className="py-4 px-4 text-center text-slate-400 font-mono">{s.tied}</td>
                                                <td className="py-4 px-4 text-center text-amber-400 font-mono font-semibold">+{s.bonusPoints}</td>
                                                <td className="py-4 px-4 text-center font-mono">
                                                    <span className={s.netRunRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                                                        {s.netRunRate >= 0 ? `+${s.netRunRate.toFixed(2)}` : s.netRunRate.toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-right font-bold text-lg text-white font-mono">{s.points}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 2: HOUSE ROSTERS */}
                <TabsContent value="houses" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {houses.map((h) => (
                            <Card key={h.houseTeamId} className="bg-slate-900 border-slate-800 overflow-hidden">
                                <div className="h-2 w-full bg-blue-600" />
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                                <Shield className="w-5 h-5 text-blue-400" />
                                                {h.name} ({h.shortName || 'HSE'})
                                            </CardTitle>
                                            <p className="text-xs text-slate-400 italic mt-1">&quot;Virtus et Scientia&quot;</p>
                                        </div>
                                        <Badge className="bg-slate-800 text-slate-300 border-slate-700">
                                            Active House
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800">
                                        <div>
                                            <span className="text-slate-500 block">House Master</span>
                                            <span className="text-white font-medium">Mr. D. Roberts</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Captain</span>
                                            <span className="text-amber-400 font-medium">A. Smith (C)</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-xs text-slate-400">Roster Capacity: 18 Players</span>
                                        <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800 text-xs">
                                            Manage Roster <ChevronRight className="w-3.5 h-3.5 ml-1" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* TAB 3: LEDGER LOG */}
                <TabsContent value="ledger" className="space-y-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-400" />
                                Transparent House Points Audit Ledger
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {ledger.map((item) => (
                                <div key={item.transactionId} className="flex justify-between items-center p-3.5 rounded-lg bg-slate-950 border border-slate-800">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                                {item.type}
                                            </Badge>
                                            <span className="text-sm font-semibold text-white">{item.description}</span>
                                        </div>
                                        <span className="text-xs text-slate-500 block">
                                            Logged at {new Date(item.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <span className="text-base font-bold text-amber-400 font-mono">
                                        +{item.points} pts
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB 4: FIXTURES */}
                <TabsContent value="fixtures" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {fixtures.map((f) => {
                            return (
                                <Card key={f.id} className="bg-slate-900 border-slate-800">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-center">
                                            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                                                {f.roundName || 'House Derby'}
                                            </Badge>
                                            <span className="text-xs text-slate-400">
                                                {new Date(f.scheduledStartAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex justify-around items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
                                            <div className="text-center space-y-1">
                                                <div className="font-bold text-lg text-white">{getHouseName(f.homeTeamId)}</div>
                                                <span className="text-xs text-slate-500">{getHouseCode(f.homeTeamId)}</span>
                                            </div>
                                            <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded">VS</span>
                                            <div className="text-center space-y-1">
                                                <div className="font-bold text-lg text-white">{getHouseName(f.awayTeamId)}</div>
                                                <span className="text-xs text-slate-500">{getHouseCode(f.awayTeamId)}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center text-xs text-slate-400 pt-2">
                                            <span>Format: {f.oversPerInnings || 20} Overs T20</span>
                                            <Link href={`/matches/add?fixtureId=${f.id}`}>
                                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5">
                                                    <Play className="w-3.5 h-3.5" /> Launch Live Scoring
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </TabsContent>

                {/* TAB 5: RULESET */}
                <TabsContent value="rules" className="space-y-6">
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                <Layers className="w-5 h-5 text-blue-400" />
                                {ruleset?.name || 'Standard Inter-House Ruleset'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm text-slate-300">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                                <div>
                                    <span className="text-slate-500 text-xs block">Format</span>
                                    <span className="text-amber-400 font-bold text-lg">{ruleset?.oversPerInnings || 20} Overs</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 text-xs block">Players per Side</span>
                                    <span className="text-white font-bold text-lg">{ruleset?.playersPerSide || 11} Players</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 text-xs block">Retirement Limit</span>
                                    <span className="text-white font-bold text-lg">{ruleset?.retirementRuns || 50} Runs</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 text-xs block">Tied Rule</span>
                                    <span className="text-white font-bold text-lg">{ruleset?.tiedMatchRule || 'SUPER_OVER'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
