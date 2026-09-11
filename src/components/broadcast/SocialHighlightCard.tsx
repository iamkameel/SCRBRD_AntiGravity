"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { D } from '@/lib/design-system';
import { Share2, Download, Award, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface SocialHighlightProps {
  playerName?: string;
  milestoneTitle?: string;
  statsSummary?: string;
  schoolName?: string;
  opponentName?: string;
  matchResult?: string;
}

export function SocialHighlightCard({
  playerName = "LIAM PETERSON",
  milestoneTitle = "PLAYER OF THE MATCH",
  statsSummary = "52* (34) & 3/18 (4.0)",
  schoolName = "GRIQUAS HIGH 1ST XI",
  opponentName = "ST. ANDREW'S COLLEGE",
  matchResult = "Griquas won by 4 runs"
}: SocialHighlightProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Graphic Preview Canvas (Square 1:1 Aspect Ratio) */}
      <div className="relative w-full aspect-square max-w-md mx-auto rounded-3xl bg-gradient-to-br from-[#0c0f17] via-[#05070a] to-[#121824] border border-white/10 overflow-hidden shadow-2xl p-8 flex flex-col justify-between group">
        {/* Background Decorative Energy Lines */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl" />

        {/* Top Header */}
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <Badge className="bg-primary/20 text-primary border-primary/40 px-3 py-1 font-black text-[9px] tracking-widest uppercase mb-2">
              Official Match Graphic
            </Badge>
            <h4 className="text-xs font-black text-white/50 tracking-widest uppercase">{schoolName}</h4>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Center Hero Stats */}
        <div className="relative z-10 text-center space-y-3">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-4 py-1.5 rounded-full text-primary font-black text-xs uppercase tracking-widest"
          >
            <Award className="w-4 h-4" /> {milestoneTitle}
          </motion.div>

          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter" style={{ fontFamily: D.syne }}>
            {playerName}
          </h2>

          <div className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-4 max-w-xs mx-auto">
            <p className="text-2xl font-black text-primary tracking-tighter" style={{ fontFamily: D.head }}>
              {statsSummary}
            </p>
          </div>
        </div>

        {/* Bottom Match Context */}
        <div className="relative z-10 flex justify-between items-end pt-4 border-t border-white/10">
          <div>
            <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Fixture vs {opponentName}</p>
            <p className="text-xs font-bold text-emerald-400">{matchResult}</p>
          </div>
          <span className="text-[9px] font-black text-white/30 tracking-widest uppercase">SCRBRD OS</span>
        </div>
      </div>

      {/* Export Action Controls */}
      <div className="flex justify-center gap-4">
        <Button 
          onClick={handleShare}
          className="bg-primary hover:bg-primary/90 text-black font-black uppercase tracking-widest rounded-2xl gap-2 h-12 px-6 shadow-lg shadow-primary/20"
        >
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          {copied ? 'Graphic Copied!' : 'Export Highlight'}
        </Button>
        <Button 
          variant="outline"
          className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold rounded-2xl gap-2 h-12 px-6"
        >
          <Download className="w-4 h-4" /> Download 1080p
        </Button>
      </div>
    </div>
  );
}
