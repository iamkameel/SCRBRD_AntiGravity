'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Waves, Trophy, Flame, Sparkles, Award, Timer, CheckCircle, AlertCircle, Medal, RefreshCw } from 'lucide-react';
import { MOCK_SWIMMING_GALA, SwimmingGala, SwimmingEvent } from '@/lib/intelligence/multiSportEngine';

export function SwimmingGalaHubView() {
    const [gala, setGala] = useState<SwimmingGala>(MOCK_SWIMMING_GALA);
    const [selectedEventId, setSelectedEventId] = useState<string>(gala.events[0]?.eventId || '');
    const [laneTimes, setLaneTimes] = useState<Record<number, string>>({
        1: '00:59.80',
        2: '00:58.20', // Record breaking time!
        3: '01:00.15',
        4: '01:01.40',
    });

    const activeEvent = gala.events.find(e => e.eventId === selectedEventId) || gala.events[0];

    const handleTimeChange = (lane: number, val: string) => {
        setLaneTimes(prev => ({ ...prev, [lane]: val }));
    };

    const submitEventResults = () => {
        if (!activeEvent) return;

        // Parse and rank times
        const updatedLanes = activeEvent.lanes.map(l => {
            const timeStr = laneTimes[l.lane] || l.finalTime || l.seedTime;
            return {
                ...l,
                finalTime: timeStr,
            };
        });

        // Simple sort by time string
        updatedLanes.sort((a, b) => (a.finalTime || '').localeCompare(b.finalTime || ''));

        // Assign place, points, record status
        const pointsTable = [10, 8, 6, 4];
        let recordCountIncrement = 0;

        const rankedLanes = updatedLanes.map((l, idx) => {
            const place = idx + 1;
            const points = pointsTable[idx] || 2;
            const isRecordBroken = l.finalTime ? l.finalTime < activeEvent.schoolRecord : false;
            if (isRecordBroken) recordCountIncrement++;

            return {
                ...l,
                place,
                pointsAwarded: points,
                isRecordBroken,
            };
        });

        // Update Gala state
        const updatedEvents = gala.events.map(ev => {
            if (ev.eventId === activeEvent.eventId) {
                return { ...ev, status: 'COMPLETED' as const, lanes: rankedLanes };
            }
            return ev;
        });

        setGala(prev => ({ ...prev, events: updatedEvents }));
    };

    return (
        <div className="space-y-6 font-sans text-zinc-900 dark:text-[#f0f4ff]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                        <Waves className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold font-['Syne',sans-serif] tracking-tight text-zinc-900 dark:text-white">Aquatics & Swimming Gala Engine</h1>
                        <p className="text-xs text-zinc-500 dark:text-slate-400 font-mono">{gala.title} • {gala.venueName}</p>
                    </div>
                </div>

                <Badge className="bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-mono text-xs px-3 py-1 flex items-center gap-1.5 animate-pulse">
                    <Timer className="w-3.5 h-3.5" /> LIVE TIMEKEEPING ACTIVE
                </Badge>
            </div>

            {/* Inter-House Points Standings */}
            <Card className="p-6 bg-white dark:bg-slate-900/90 border border-zinc-200 dark:border-white/10 rounded-3xl shadow-xl backdrop-blur-2xl text-zinc-900 dark:text-slate-100 space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-200 dark:border-white/10 pb-3">
                    <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                        <Trophy className="w-4 h-4" /> Inter-House Gala Championship Standings
                    </h2>
                    <span className="text-xs font-mono text-zinc-500 dark:text-slate-400">4 Houses Competing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {gala.houses.map((house) => (
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

            {/* Event Timekeeper & Live Results Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Event Selector List */}
                <div className="md:col-span-4 space-y-3">
                    <h3 className="text-xs font-mono font-bold text-zinc-500 dark:text-slate-400 uppercase tracking-wider">Gala Events ({gala.events.length})</h3>
                    <div className="space-y-2">
                        {gala.events.map((ev) => (
                            <button
                                key={ev.eventId}
                                onClick={() => setSelectedEventId(ev.eventId)}
                                className={`w-full text-left p-4 rounded-2xl border transition-all space-y-1 font-mono text-xs ${
                                    selectedEventId === ev.eventId
                                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-950 dark:text-white shadow-lg font-bold'
                                        : 'bg-white dark:bg-slate-900/80 border-zinc-200 dark:border-white/5 text-zinc-700 dark:text-slate-300 hover:bg-zinc-100 dark:hover:bg-slate-800'
                                }`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold">{ev.eventName}</span>
                                    <Badge className={`text-[9px] ${
                                        ev.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' :
                                        'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30'
                                    }`}>
                                        {ev.status}
                                    </Badge>
                                </div>
                                <div className="text-[10px] text-zinc-500 dark:text-slate-400">Record: {ev.schoolRecord} ({ev.recordHolder})</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Live Timekeeper Console */}
                <div className="md:col-span-8">
                    <Card className="p-6 bg-white dark:bg-slate-900/90 border border-zinc-200 dark:border-white/10 rounded-3xl shadow-xl backdrop-blur-2xl text-zinc-900 dark:text-slate-100 space-y-6">
                        <div className="flex justify-between items-start border-b border-zinc-200 dark:border-white/10 pb-4">
                            <div>
                                <div className="text-xs font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Active Race Console</div>
                                <h3 className="text-lg font-bold font-['Syne',sans-serif] text-zinc-900 dark:text-white">{activeEvent?.eventName}</h3>
                                <p className="text-xs text-zinc-500 dark:text-slate-400 font-mono">School Record: <strong className="text-amber-600 dark:text-amber-400">{activeEvent?.schoolRecord}</strong> ({activeEvent?.recordHolder})</p>
                            </div>

                            <Button onClick={submitEventResults} className="bg-cyan-600 hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-600 text-white dark:text-slate-950 font-bold font-mono text-xs">
                                <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Submit & Rank Race
                            </Button>
                        </div>

                        {/* Lane Inputs / Results Table */}
                        <div className="space-y-3 font-mono text-xs">
                            <div className="grid grid-cols-12 gap-2 text-[10px] text-zinc-500 dark:text-slate-400 font-bold uppercase pb-1 border-b border-zinc-200 dark:border-white/5">
                                <div className="col-span-1">Lane</div>
                                <div className="col-span-4">Swimmer</div>
                                <div className="col-span-2">House</div>
                                <div className="col-span-3">Time Input</div>
                                <div className="col-span-2 text-right">Place / Pts</div>
                            </div>

                            {activeEvent?.lanes.map((lane) => (
                                <div key={lane.lane} className="grid grid-cols-12 gap-2 items-center p-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5 rounded-xl">
                                    <div className="col-span-1 font-bold text-cyan-600 dark:text-cyan-400">L{lane.lane}</div>
                                    <div className="col-span-4 font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                                        {lane.swimmerName}
                                        {lane.isRecordBroken && (
                                            <Badge className="bg-amber-500 text-slate-950 font-bold text-[9px] px-1 py-0 animate-bounce">
                                                🚨 NEW REC
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="col-span-2 text-zinc-600 dark:text-slate-300">{lane.houseOrSchool}</div>
                                    <div className="col-span-3">
                                        <Input 
                                            value={laneTimes[lane.lane] || lane.finalTime || lane.seedTime} 
                                            onChange={(e) => handleTimeChange(lane.lane, e.target.value)}
                                            className="h-8 bg-white dark:bg-slate-950 border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white font-mono text-xs"
                                        />
                                    </div>
                                    <div className="col-span-2 text-right">
                                        {lane.place ? (
                                            <span className="font-bold text-amber-600 dark:text-amber-400">#{lane.place} ({lane.pointsAwarded} pts)</span>
                                        ) : (
                                            <span className="text-zinc-400 dark:text-slate-500">Pending</span>
                                        )}
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

