'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Flame, Sparkles, Award, Timer, Medal, Zap, Target } from 'lucide-react';
import { MOCK_ATHLETICS_MEET, AthleticsMeet, AthleticsEvent } from '@/lib/intelligence/multiSportEngine';

export function AthleticsMeetHubView() {
    const [meet, setMeet] = useState<AthleticsMeet>(MOCK_ATHLETICS_MEET);
    const [selectedEventId, setSelectedEventId] = useState<string>(meet.events[0]?.eventId || '');

    const activeEvent = meet.events.find(e => e.eventId === selectedEventId) || meet.events[0];

    return (
        <div className="space-y-6 font-sans text-zinc-900 dark:text-[#f0f4ff]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-['Syne',sans-serif] tracking-tight text-zinc-900 dark:text-white">Track & Field Athletics Meet Engine</h1>
                        <p className="text-xs text-zinc-500 dark:text-slate-400 font-mono">{meet.title} • {meet.venueName}</p>
                    </div>
                </div>

                <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-mono text-xs px-3 py-1 flex items-center gap-1.5 animate-pulse">
                    <Zap className="w-3.5 h-3.5" /> LIVE TRACK & FIELD ACTIVE
                </Badge>
            </div>

            {/* Championship Standings */}
            <Card className="p-6 bg-white dark:bg-slate-900/90 border border-zinc-200 dark:border-white/10 rounded-3xl shadow-xl backdrop-blur-2xl text-zinc-900 dark:text-slate-100 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/10 pb-3">
                    <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        <Trophy className="w-4 h-4" /> Athletics Championship Points Standings
                    </h2>
                    <span className="text-xs font-mono text-zinc-500 dark:text-slate-400">Victor Ludorum Race</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {meet.houses.map((house) => (
                        <div key={house.houseName} className="p-4 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-2xl space-y-2 relative overflow-hidden">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-sm font-['Syne',sans-serif]" style={{ color: house.color }}>{house.houseName} House</span>
                                <span className="text-xl font-black font-mono text-zinc-900 dark:text-white">{house.totalPoints} <span className="text-[10px] text-zinc-500 dark:text-slate-400 font-normal">pts</span></span>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 dark:text-slate-400">
                                <span>🥇 {house.goldCount}</span>
                                <span>🥈 {house.silverCount}</span>
                                <span>🥉 {house.bronzeCount}</span>
                                {house.recordsBrokenCount > 0 && (
                                    <Badge variant="outline" className="border-amber-500/30 text-amber-600 dark:text-amber-400 text-[9px] px-1.5 py-0">
                                        ⚡ {house.recordsBrokenCount} REC
                                    </Badge>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Event Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Event Selector */}
                <div className="md:col-span-4 space-y-3">
                    <h3 className="text-xs font-mono font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider">Meet Events ({meet.events.length})</h3>
                    <div className="space-y-2">
                        {meet.events.map((ev) => (
                            <button
                                key={ev.eventId}
                                onClick={() => setSelectedEventId(ev.eventId)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all space-y-1 font-mono text-xs ${
                                    selectedEventId === ev.eventId
                                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-950 dark:text-white shadow-lg font-bold'
                                        : 'bg-white dark:bg-slate-900/80 border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">{ev.eventName}</span>
                                    <Badge className="text-[9px] bg-zinc-200 dark:bg-white/10 text-zinc-700 dark:text-slate-300 border-zinc-300 dark:border-white/10">
                                        {ev.category}
                                    </Badge>
                                </div>
                                <div className="text-[10px] text-zinc-500 dark:text-slate-400">Record: {ev.schoolRecord} ({ev.recordHolder})</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Event Results Console */}
                <div className="md:col-span-8">
                    <Card className="p-6 bg-white dark:bg-slate-900/90 border border-zinc-200 dark:border-white/10 rounded-3xl shadow-xl backdrop-blur-2xl text-zinc-900 dark:text-slate-100 space-y-6">
                        <div className="flex justify-between items-start border-b border-zinc-200 dark:border-white/10 pb-4">
                            <div>
                                <div className="text-xs font-mono text-amber-600 dark:text-amber-400 uppercase tracking-wider">{activeEvent?.category} Event Leaderboard</div>
                                <h3 className="text-lg font-bold font-['Syne',sans-serif] text-zinc-900 dark:text-white">{activeEvent?.eventName}</h3>
                                <p className="text-xs text-zinc-500 dark:text-slate-400 font-mono">School Record: <strong className="text-amber-600 dark:text-amber-400">{activeEvent?.schoolRecord}</strong> ({activeEvent?.recordHolder})</p>
                            </div>
                        </div>

                        {/* Leaderboard Table */}
                        <div className="space-y-3 font-mono text-xs">
                            <div className="grid grid-cols-12 gap-2 text-[10px] text-zinc-500 dark:text-slate-400 font-bold uppercase pb-1 border-b border-zinc-200 dark:border-white/5">
                                <div className="col-span-1">Rank</div>
                                <div className="col-span-4">Athlete</div>
                                <div className="col-span-2">House</div>
                                <div className="col-span-3">Best Mark / Time</div>
                                <div className="col-span-2 text-right">Points</div>
                            </div>

                            {activeEvent?.results.map((res) => (
                                <div key={res.swimmerOrAthleteName} className="grid grid-cols-12 gap-2 items-center p-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-xl">
                                    <div className="col-span-1 font-bold text-amber-600 dark:text-amber-400">#{res.place}</div>
                                    <div className="col-span-4 font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                                        {res.swimmerOrAthleteName}
                                        {res.bestMark > parseFloat(activeEvent.schoolRecord) && activeEvent.category === 'FIELD' && (
                                            <Badge className="bg-amber-500 text-slate-950 font-bold text-[9px] px-1 py-0 animate-bounce">
                                                🚨 RECORD
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="col-span-2 text-zinc-600 dark:text-slate-300">{res.houseOrSchool}</div>
                                    <div className="col-span-3 font-bold text-cyan-600 dark:text-cyan-400">
                                        {typeof res.attempts[0] === 'string' ? res.attempts[0] : `${res.bestMark}m`}
                                    </div>
                                    <div className="col-span-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                        +{res.points} pts
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

