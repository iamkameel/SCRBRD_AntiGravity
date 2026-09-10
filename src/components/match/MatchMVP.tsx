/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Person, Rankings } from '@/types/firestore';
import { Trophy, Zap, TrendingUp, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface MatchMVPProps {
    mvp: Rankings.PlayerMatchImpact;
    player?: Person;
}

export function MatchMVP({ mvp, player }: MatchMVPProps) {
    const playerName = player ? `${player.firstName} ${player.lastName}` : 'Match Performer';
    
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card variant="glass" className="relative overflow-hidden bg-gradient-to-br from-fox-gold/20 via-black/40 to-fox-blue/20 border-fox-gold/30 backdrop-blur-xl">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Trophy className="w-32 h-32 text-fox-gold" />
                </div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fox-gold to-transparent" />

                <CardContent className="p-6 relative z-10">
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        {/* Player Avatar Placeholder */}
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-fox-gold to-yellow-500 p-1 shadow-xl shadow-fox-gold/20 shrink-0">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border-2 border-black">
                                {player?.profileImageUrl ? (
                                    <img src={player.profileImageUrl} alt={playerName} className="w-full h-full object-cover" />
                                ) : (
                                    <Star className="w-10 h-10 text-fox-gold" />
                                )}
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <Badge className="bg-fox-gold text-black font-black uppercase tracking-widest text-[10px] px-2 py-0">
                                    Impact MVP
                                </Badge>
                                <span className="text-fox-gold flex items-center gap-1 text-xs font-bold uppercase tracking-tighter">
                                    <Zap className="w-3 h-3 fill-current" /> {mvp.totalImpact.toFixed(1)} Impact
                                </span>
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                                {playerName}
                            </h2>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                                <ImpactStat label="Batting" value={mvp.battingImpact} color="text-fox-gold" />
                                <ImpactStat label="Bowling" value={mvp.bowlingImpact} color="text-fox-blue" />
                                <ImpactStat label="Fielding" value={mvp.fieldingImpact} color="text-emerald-400" />
                            </div>
                        </div>

                        <div className="shrink-0 text-center px-6 py-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Impact Rating</div>
                            <div className="text-4xl font-black text-fox-gold">
                                {Math.min(99, Math.floor(mvp.totalImpact * 5)).toFixed(0)}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold justify-center">
                                <TrendingUp className="w-3 h-3" /> Peak Form
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function ImpactStat({ label, value, color }: { label: string, value: number, color: string }) {
    if (value === 0) return null;
    return (
        <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">{label}</div>
            <div className={`text-lg font-black leading-none ${color}`}>
                {value > 0 ? '+' : ''}{value.toFixed(1)}
            </div>
        </div>
    );
}
