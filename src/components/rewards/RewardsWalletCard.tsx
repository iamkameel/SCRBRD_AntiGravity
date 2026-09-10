'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Trophy, Target, ChevronRight, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RewardsWallet } from '@/types/rewards';

interface RewardsWalletCardProps {
  wallet: RewardsWallet;
  playerName?: string;
  className?: string;
}

export const RewardsWalletCard: React.FC<RewardsWalletCardProps> = ({
  wallet,
  playerName = 'Player',
  className = ''
}) => {
  const progression = (wallet.lifetimePointsEarned / wallet.nextTierThreshold) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`relative group ${className}`}
    >
      {/* Background Mesh Gradient Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
      
      <Card className="relative overflow-hidden glass-morphism-premium border-white/10 p-6 flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Rewards Wallet</h3>
              <p className="text-xl font-bold text-white">{playerName}</p>
            </div>
          </div>
          <Badge variant="outline" className={`
            px-3 py-1 text-xs font-bold uppercase tracking-widest border-2
            ${wallet.currentTier === 'Prodigy' ? 'text-purple-400 border-purple-500/50 bg-purple-500/10' : 
              wallet.currentTier === 'Platinum' ? 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10' :
              wallet.currentTier === 'Gold' ? 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10' :
              wallet.currentTier === 'Silver' ? 'text-slate-300 border-slate-400/50 bg-slate-400/10' :
              'text-orange-400 border-orange-500/50 bg-orange-500/10'}
          `}>
            {wallet.currentTier}
          </Badge>
        </div>

        {/* Balance Section */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black text-white tracking-tighter">
              {wallet.totalPointsBalance.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-slate-500">PTS</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
            <TrendingUp className="w-3 h-3" />
            <span>+{wallet.lifetimePointsEarned.toLocaleString()} Total Lifetime Earnings</span>
          </div>
        </div>

        {/* Progression Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-widest text-slate-400">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>{wallet.currentTier}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-blue-400" />
              <span>{wallet.nextTierThreshold.toLocaleString()} for next level</span>
            </div>
          </div>
          
          <div className="relative pt-1">
            <Progress value={progression} className="h-2.5 bg-slate-800/50" />
            {/* Shimmer Effect on Progress */}
            <div className="absolute top-1 left-0 w-full h-2.5 overflow-hidden rounded-full pointer-events-none">
              <div className="w-full h-full animate-shimmer" />
            </div>
          </div>
          
          <p className="text-[10px] text-center text-slate-500 font-medium">
            Next Milestone at <span className="text-blue-400">{wallet.nextTierThreshold.toLocaleString()}</span> points
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 pt-2">
          <button className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-semibold transition flex items-center justify-center gap-2 group/btn">
            History
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover/btn:translate-x-0.5 transition" />
          </button>
          <button className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-600/20 transition flex items-center justify-center gap-2">
            Rewards Store
          </button>
        </div>
      </Card>
    </motion.div>
  );
};
