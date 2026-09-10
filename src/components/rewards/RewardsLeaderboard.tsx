'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Medal, ArrowUpRight, ArrowDownRight, Minus, Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface LeaderboardEntry {
  playerId: string;
  name: string;
  avatarUrl?: string;
  points: number;
  rank: number;
  previousRank: number;
  tier: string;
}

interface RewardsLeaderboardProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
  className?: string;
}

export const RewardsLeaderboard: React.FC<RewardsLeaderboardProps> = ({
  entries,
  currentUserId,
  className = ''
}) => {
  const getRankChangeIcon = (current: number, previous: number) => {
    if (current < previous) return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
    if (current > previous) return <ArrowDownRight className="w-4 h-4 text-rose-400" />;
    return <Minus className="w-4 h-4 text-slate-500" />;
  };

  const getMedalColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-slate-300';
      case 3: return 'text-orange-400';
      default: return 'text-slate-600';
    }
  };

  return (
    <Card className={`glass-card border-white/5 overflow-hidden ${className}`}>
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            Seasonal Leaderboard
          </h3>
          <p className="text-sm text-slate-400">Top performers in the South Division</p>
        </div>
        <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20">
          Season 2024
        </Badge>
      </div>

      <div className="divide-y divide-white/5">
        {entries.map((entry, index) => (
          <motion.div
            key={entry.playerId}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-4 p-4 hover:bg-white/5 transition group ${
              entry.playerId === currentUserId ? 'bg-blue-500/10 border-l-4 border-blue-500' : ''
            }`}
          >
            {/* Rank */}
            <div className="w-8 flex flex-col items-center">
              <span className={`text-lg font-black ${getMedalColor(entry.rank)}`}>
                {entry.rank}
              </span>
              <div className="mt-1">
                {getRankChangeIcon(entry.rank, entry.previousRank)}
              </div>
            </div>

            {/* Avatar */}
            <Avatar className="w-10 h-10 border-2 border-white/10 group-hover:border-blue-500/50 transition">
              <AvatarImage src={entry.avatarUrl} alt={entry.name} />
              <AvatarFallback className="bg-slate-800 text-slate-200 uppercase font-bold">
                {entry.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white truncate">{entry.name}</span>
                {entry.rank <= 3 && <Medal className={`w-3.5 h-3.5 ${getMedalColor(entry.rank)}`} />}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-medium text-slate-500">{entry.tier}</span>
                <div className="w-1 h-1 rounded-full bg-slate-700" />
                <span className="text-xs font-semibold text-blue-400 uppercase tracking-tighter">Prodigy Path</span>
              </div>
            </div>

            {/* Points */}
            <div className="text-right">
              <div className="text-lg font-black text-white">
                {entry.points.toLocaleString()}
              </div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                SCRBRD Points
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-slate-900/50 text-center">
        <button className="text-sm font-bold text-blue-400 hover:text-blue-300 transition flex items-center justify-center gap-2 w-full">
          View Full Rankings
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
};
