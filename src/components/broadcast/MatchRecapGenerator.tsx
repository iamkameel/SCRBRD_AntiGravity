'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, Share2, Copy, Check, Award, Sparkles, Download, Flame, Trophy, Twitter, Instagram, Mail, FileText } from 'lucide-react';
import { getMatchRecapData, MatchRecapData } from '@/lib/intelligence/recapEngine';

export function MatchRecapGeneratorView({ fixtureId = 'fix-1st-xi-kes' }: { fixtureId?: string }) {
    const [recap, setRecap] = useState<MatchRecapData>(getMatchRecapData(fixtureId));
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const copyToClipboard = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2500);
    };

    return (
        <div className="space-y-8 font-sans text-[#f0f4ff]">
            {/* Header Title */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                        <Newspaper className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-['Syne',sans-serif] tracking-tight">Automated Broadcast Press Release & Social Recap</h1>
                        <p className="text-xs text-slate-400 font-mono">Instant Multi-Channel Media Generator • SCRBRD Broadcast Engine</p>
                    </div>
                </div>

                <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono text-xs px-3 py-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> AI BROADCAST READY
                </Badge>
            </div>

            {/* SECTION 1: High-Impact Broadcast Graphic Card (Social Media Canvas) */}
            <div className="space-y-3">
                <div className="flex justify-between items-center font-mono text-xs">
                    <span className="text-slate-400 uppercase font-bold flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-purple-400" /> Broadcast Match Result Graphic
                    </span>
                    <span className="text-slate-500">1080 x 1080 Broadcast Aspect Ratio</span>
                </div>

                <Card className="p-8 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-purple-500/30 rounded-3xl shadow-2xl relative overflow-hidden text-white font-sans">
                    {/* Background Decorative Graphic Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-6">
                        {/* Header Banner */}
                        <div className="flex justify-between items-center border-b border-white/10 pb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse" />
                                <span className="text-xs font-mono font-bold tracking-widest text-purple-300 uppercase">{recap.competitionName}</span>
                            </div>
                            <span className="text-xs font-mono text-slate-400">{recap.matchDate} • {recap.venueName}</span>
                        </div>

                        {/* Teams Scoreboard Display */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-4">
                            {/* 1st Innings Team */}
                            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">{recap.firstInnings.teamName}</div>
                                <div className="text-3xl font-black font-['Syne',sans-serif] text-white tracking-tight">{recap.firstInnings.score}</div>
                                <div className="text-xs font-mono text-slate-400">({recap.firstInnings.overs} overs)</div>

                                <div className="pt-2 border-t border-white/5 space-y-1 font-mono text-xs">
                                    <div className="text-slate-300">Top Batter: <strong className="text-amber-400">{recap.firstInnings.topBatters[0]?.name}</strong> ({recap.firstInnings.topBatters[0]?.runs})</div>
                                    <div className="text-slate-300">Best Bowler: <strong className="text-cyan-400">{recap.secondInnings.topBowlers[0]?.name}</strong> ({recap.secondInnings.topBowlers[0]?.wickets}/{recap.secondInnings.topBowlers[0]?.runs})</div>
                                </div>
                            </div>

                            {/* 2nd Innings Team */}
                            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-2xl space-y-2 relative overflow-hidden">
                                <div className="text-xs font-mono text-purple-300 uppercase tracking-wider">{recap.secondInnings.teamName}</div>
                                <div className="text-3xl font-black font-['Syne',sans-serif] text-purple-200 tracking-tight">{recap.secondInnings.score}</div>
                                <div className="text-xs font-mono text-purple-300/70">({recap.secondInnings.overs} overs)</div>

                                <div className="pt-2 border-t border-purple-500/20 space-y-1 font-mono text-xs">
                                    <div className="text-slate-200">Top Batter: <strong className="text-amber-400">{recap.secondInnings.topBatters[0]?.name}</strong> ({recap.secondInnings.topBatters[0]?.runs})</div>
                                    <div className="text-slate-200">Best Bowler: <strong className="text-cyan-400">{recap.firstInnings.topBowlers[0]?.name}</strong> ({recap.firstInnings.topBowlers[0]?.wickets}/{recap.firstInnings.topBowlers[0]?.runs})</div>
                                </div>
                            </div>
                        </div>

                        {/* Match Result Banner */}
                        <div className="p-4 bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border border-amber-500/40 rounded-2xl flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                <span className="text-sm font-bold text-white tracking-wide">{recap.resultSummary}</span>
                            </div>

                            <Badge className="bg-amber-500 text-slate-950 font-bold font-mono px-3 py-1 flex items-center gap-1">
                                <Award className="w-3.5 h-3.5" /> POTM: {recap.playerOfTheMatch.name}
                            </Badge>
                        </div>
                    </div>
                </Card>
            </div>

            {/* SECTION 2: Multi-Channel Format Generators */}
            <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-3xl shadow-xl backdrop-blur-2xl text-slate-100 space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h2 className="text-base font-bold font-['Syne',sans-serif] text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-purple-400" /> Multi-Channel Copy Generator
                    </h2>
                    <span className="text-xs font-mono text-slate-400">1-Click Copy Ready</span>
                </div>

                <Tabs defaultValue="press" className="space-y-6">
                    <TabsList className="bg-slate-950 border border-white/10 p-1 rounded-xl font-mono text-xs text-slate-400">
                        <TabsTrigger value="press" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white font-bold flex items-center gap-1.5">
                            <Newspaper className="w-3.5 h-3.5" /> Official Press Release
                        </TabsTrigger>
                        <TabsTrigger value="newsletter" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white font-bold flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" /> School Newsletter
                        </TabsTrigger>
                        <TabsTrigger value="x" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white font-bold flex items-center gap-1.5">
                            <Twitter className="w-3.5 h-3.5" /> X / Twitter Post
                        </TabsTrigger>
                        <TabsTrigger value="instagram" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white font-bold flex items-center gap-1.5">
                            <Instagram className="w-3.5 h-3.5" /> Instagram Caption
                        </TabsTrigger>
                    </TabsList>

                    {/* Format 1: Official Press Release */}
                    <TabsContent value="press" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">Article Headline & Media Body</h3>
                            <Button 
                                size="sm" 
                                onClick={() => copyToClipboard(`${recap.generatedContent.pressReleaseHeadline}\n\n${recap.generatedContent.pressReleaseBody}`, 'press')}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs"
                            >
                                {copiedKey === 'press' ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                                {copiedKey === 'press' ? 'Copied Press Release!' : 'Copy Article Text'}
                            </Button>
                        </div>

                        <div className="p-4 bg-slate-950 border border-white/10 rounded-2xl space-y-3 font-mono text-xs text-slate-200 leading-relaxed">
                            <h4 className="text-sm font-bold text-amber-400 font-sans">{recap.generatedContent.pressReleaseHeadline}</h4>
                            <p className="whitespace-pre-line text-slate-300">{recap.generatedContent.pressReleaseBody}</p>
                        </div>
                    </TabsContent>

                    {/* Format 2: School Newsletter */}
                    <TabsContent value="newsletter" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">Weekly Sports Newsletter Snippet</h3>
                            <Button 
                                size="sm" 
                                onClick={() => copyToClipboard(recap.generatedContent.newsletterSnippet, 'newsletter')}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs"
                            >
                                {copiedKey === 'newsletter' ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                                {copiedKey === 'newsletter' ? 'Copied Snippet!' : 'Copy Snippet'}
                            </Button>
                        </div>

                        <div className="p-4 bg-slate-950 border border-white/10 rounded-2xl font-mono text-xs text-slate-200 leading-relaxed">
                            <p className="whitespace-pre-line text-slate-300">{recap.generatedContent.newsletterSnippet}</p>
                        </div>
                    </TabsContent>

                    {/* Format 3: X / Twitter */}
                    <TabsContent value="x" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">Formated X / Twitter Broadcast Post</h3>
                            <Button 
                                size="sm" 
                                onClick={() => copyToClipboard(recap.generatedContent.socialPostX, 'x')}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs"
                            >
                                {copiedKey === 'x' ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                                {copiedKey === 'x' ? 'Copied Tweet!' : 'Copy Tweet'}
                            </Button>
                        </div>

                        <div className="p-4 bg-slate-950 border border-white/10 rounded-2xl font-mono text-xs text-slate-200 leading-relaxed">
                            <p className="whitespace-pre-line text-slate-300">{recap.generatedContent.socialPostX}</p>
                        </div>
                    </TabsContent>

                    {/* Format 4: Instagram */}
                    <TabsContent value="instagram" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-purple-300">Instagram Caption & Hashtags</h3>
                            <Button 
                                size="sm" 
                                onClick={() => copyToClipboard(recap.generatedContent.socialPostInstagramCaption, 'instagram')}
                                className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs"
                            >
                                {copiedKey === 'instagram' ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                                {copiedKey === 'instagram' ? 'Copied Caption!' : 'Copy Instagram Caption'}
                            </Button>
                        </div>

                        <div className="p-4 bg-slate-950 border border-white/10 rounded-2xl font-mono text-xs text-slate-200 leading-relaxed">
                            <p className="whitespace-pre-line text-slate-300">{recap.generatedContent.socialPostInstagramCaption}</p>
                        </div>
                    </TabsContent>
                </Tabs>
            </Card>

            {/* SECTION 3: Key Turning Points Timeline */}
            <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-3xl shadow-xl backdrop-blur-2xl text-slate-100 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2">
                        <Flame className="w-4 h-4" /> Match Momentum Turning Points
                    </h3>
                    <span className="text-xs font-mono text-slate-400">Key Moments Log</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    {recap.turningPoints.map((tp, idx) => (
                        <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-2 relative overflow-hidden">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-purple-400">{tp.over}</span>
                                <Badge className={`text-[9px] font-mono font-bold ${
                                    tp.impact === 'GAME_CHANGER' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                    tp.impact === 'CLUTCH' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                                    'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                }`}>
                                    {tp.impact}
                                </Badge>
                            </div>
                            <div className="font-bold text-white text-xs">{tp.event}</div>
                            <p className="text-slate-400 text-[11px] leading-relaxed">{tp.description}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
