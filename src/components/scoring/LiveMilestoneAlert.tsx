'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Sparkles, Trophy, Star, X } from 'lucide-react';
import { LiveMilestoneTrigger } from '@/services/recognition/RecognitionService';
import { D } from '@/lib/design-system';

interface LiveMilestoneAlertProps {
  trigger: LiveMilestoneTrigger | null;
  onDismiss: () => void;
}

export const LiveMilestoneAlert: React.FC<LiveMilestoneAlertProps> = ({ trigger, onDismiss }) => {
  if (!trigger) return null;

  const isLegendary = trigger.celebrationLevel === 'LEGENDARY';
  const isSuper = trigger.celebrationLevel === 'SUPER_MILESTONE';

  const bgGradient = isLegendary
    ? 'from-amber-600 via-amber-500 to-yellow-500'
    : isSuper
    ? 'from-emerald-600 via-teal-500 to-cyan-500'
    : 'from-indigo-600 via-purple-600 to-pink-600';

  const borderColor = isLegendary ? '#f59e0b' : isSuper ? '#10b981' : '#6366f1';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: -20 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl p-8 border"
          style={{ background: D.surf1, borderColor }}
        >
          {/* Animated Glow Backdrop */}
          <div className={`absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-r ${bgGradient} opacity-20 blur-3xl animate-pulse`} />
          <div className={`absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-r ${bgGradient} opacity-20 blur-3xl animate-pulse`} />

          {/* Close Button */}
          <button
            onClick={onDismiss}
            aria-label="Dismiss milestone alert"
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            {/* Celebration Badge Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${bgGradient} p-0.5 shadow-xl flex items-center justify-center`}
            >
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-4xl">
                {trigger.badgeEmoji}
              </div>
            </motion.div>

            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/10 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                OFFICIAL SCRBRD MILESTONE UNLOCKED
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase" style={{ fontFamily: D.head }}>
                {trigger.toastTitle}
              </h3>
            </div>

            <p className="text-sm text-slate-300 max-w-sm">
              {trigger.toastDescription}
            </p>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-white/10 w-full text-left flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Achieved In</div>
                <div className="text-xs font-semibold text-white">Live Competition Match</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Record Type</div>
                <div className="text-xs font-semibold text-amber-400">{trigger.milestone.milestoneType} Milestone</div>
              </div>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={onDismiss}
                className="flex-1 py-3 px-6 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg transition-all"
              >
                Continue Live Scoring
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
