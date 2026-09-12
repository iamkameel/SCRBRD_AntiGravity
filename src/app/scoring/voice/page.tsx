'use client';

import React, { useState } from 'react';
import { 
  Mic, 
  Radio, 
  Zap, 
  Volume2, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldAlert, 
  Play, 
  Pause,
  Award,
  Activity,
  History,
  CornerDownLeft,
  ChevronRight
} from 'lucide-react';
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VoiceScoringConsole } from '@/components/scoring/VoiceScoringConsole';
import { toast } from 'sonner';

interface RecordedBallEvent {
  id: string;
  over: string;
  runs: number;
  extras?: number;
  extrasType?: 'wide' | 'noball' | 'bye' | 'legbye';
  isWicket?: boolean;
  wicketType?: string;
  shotType?: string;
  transcript: string;
  confidence: number;
  timestamp: string;
}

export default function VoiceScoringPage() {
  const [matchScore, setMatchScore] = useState({
    runs: 142,
    wickets: 3,
    overs: 16.4,
    ballsInOver: 4,
    currentOver: 17,
    striker: 'Tristan Stubbs (64*)',
    nonStriker: 'Dewald Brevis (28*)',
    bowler: 'L. Marais (3.4-0-32-1)',
  });

  const [ballHistory, setBallHistory] = useState<RecordedBallEvent[]>([
    {
      id: 'b-1',
      over: '16.4',
      runs: 4,
      shotType: 'Cover Drive',
      transcript: 'Four runs through cover point',
      confidence: 96,
      timestamp: '11:42 AM'
    },
    {
      id: 'b-2',
      over: '16.3',
      runs: 1,
      shotType: 'Single',
      transcript: 'Single pushed to long off',
      confidence: 98,
      timestamp: '11:41 AM'
    },
    {
      id: 'b-3',
      over: '16.2',
      runs: 0,
      transcript: 'Dot ball left outside off stump',
      confidence: 94,
      timestamp: '11:40 AM'
    },
    {
      id: 'b-4',
      over: '16.1',
      runs: 6,
      shotType: 'Pull Shot',
      transcript: 'Six runs over square leg maximum',
      confidence: 99,
      timestamp: '11:39 AM'
    }
  ]);

  const handleRecordBall = (ballData: {
    runs: number;
    extras?: number;
    extrasType?: 'wide' | 'noball' | 'bye' | 'legbye';
    isWicket?: boolean;
    wicketType?: string;
    shotType?: string;
    zoneName?: string;
  }) => {
    const nextBallsInOver = (matchScore.ballsInOver + 1) % 6;
    const isOverComplete = nextBallsInOver === 0;
    const newOverFloat = isOverComplete 
      ? Math.floor(matchScore.overs) + 1 
      : Math.floor(matchScore.overs) + (nextBallsInOver / 10);

    // Update match score
    setMatchScore(prev => ({
      ...prev,
      runs: prev.runs + ballData.runs + (ballData.extras || 0),
      wickets: prev.wickets + (ballData.isWicket ? 1 : 0),
      ballsInOver: nextBallsInOver,
      overs: Number(newOverFloat.toFixed(1))
    }));

    // Construct transcript simulation
    let desc = `${ballData.runs} run${ballData.runs !== 1 ? 's' : ''}`;
    if (ballData.isWicket) desc = `Wicket (${ballData.wicketType || 'Out'})`;
    if (ballData.extrasType) desc = `Extra ${ballData.extrasType.toUpperCase()} (${ballData.runs} runs)`;
    if (ballData.shotType) desc += ` via ${ballData.shotType}`;

    const event: RecordedBallEvent = {
      id: `ball-${Date.now()}`,
      over: `${Math.floor(matchScore.overs)}.${matchScore.ballsInOver + 1}`,
      runs: ballData.runs,
      extras: ballData.extras,
      extrasType: ballData.extrasType,
      isWicket: ballData.isWicket,
      wicketType: ballData.wicketType,
      shotType: ballData.shotType,
      transcript: desc,
      confidence: Math.floor(Math.random() * 10) + 90,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setBallHistory(prev => [event, ...prev]);
  };

  const handleUndo = () => {
    if (ballHistory.length === 0) return;
    const last = ballHistory[0];
    setBallHistory(prev => prev.slice(1));

    setMatchScore(prev => ({
      ...prev,
      runs: Math.max(0, prev.runs - last.runs - (last.extras || 0)),
      wickets: Math.max(0, prev.wickets - (last.isWicket ? 1 : 0)),
    }));
    toast.info(`Undid ball ${last.over}`);
  };

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto p-4 md:p-8">
      {/* Strategic Header */}
      <div 
        className="relative p-8 md:p-10 rounded-[3rem] border overflow-hidden shadow-2xl"
        style={{ background: D.surf1, borderColor: D.border }}
      >
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradLive }} />
        <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
          <div 
            className="h-20 w-20 rounded-3xl flex items-center justify-center shadow-inner" 
            style={{ background: D.surf2, border: `1px solid ${D.border}` }}
          >
            <Mic className="h-10 w-10 text-rose-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-rose-400">
                HANDS-FREE SCORING INTELLIGENCE
              </span>
              <Badge className="bg-rose-500/10 text-rose-300 border border-rose-500/20 text-[9px] font-mono">
                NATURAL LANGUAGE PARSER
              </Badge>
            </div>
            <h1 
              className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none text-white" 
              style={{ fontFamily: D.head }}
            >
              VOICE SCORING <span className="text-rose-400">& QUICK CONSOLE</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] mt-3 opacity-60 italic" style={{ color: D.textMuted }}>
              REAL-TIME AUDIO EVENT STREAMING • CONTINUOUS PARSING • ONE-TOUCH FALLBACK OVERRIDES • AUDIT TRAILS
            </p>
          </div>

          {/* Score Summary Badge */}
          <div className="lg:ml-auto flex items-center gap-4 p-4 rounded-3xl bg-black/40 border border-white/10">
            <div>
              <span className="text-[9px] font-black uppercase text-zinc-400 block font-mono">LIVE SCORECARD</span>
              <div className="text-3xl font-black text-white font-mono">
                {matchScore.runs}/{matchScore.wickets} <span className="text-xs text-emerald-400">({matchScore.overs} overs)</span>
              </div>
            </div>
            <Button 
              onClick={handleUndo}
              variant="outline"
              size="sm"
              className="text-xs font-mono border-white/10 hover:border-amber-500/50 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Undo Ball
            </Button>
          </div>
        </div>
      </div>

      {/* Main Grid: Voice Console + Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (7 Cols): Voice Input Console & Waveform */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Voice Component */}
          <VoiceScoringConsole onRecordBall={handleRecordBall} onUndo={handleUndo} />

          {/* Quick Manual Scoring Grid (Fallback) */}
          <div className="p-6 rounded-[2.5rem] border bg-black/30 space-y-4" style={{ borderColor: D.border }}>
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Manual Quick-Action Overrides
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">1-Touch Scorer Backup</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              <button
                onClick={() => handleRecordBall({ runs: 0 })}
                className="p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500 text-white font-mono font-black text-sm transition-all"
              >
                0 Dot
              </button>
              <button
                onClick={() => handleRecordBall({ runs: 1 })}
                className="p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500 text-white font-mono font-black text-sm transition-all"
              >
                1 Run
              </button>
              <button
                onClick={() => handleRecordBall({ runs: 2 })}
                className="p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500 text-white font-mono font-black text-sm transition-all"
              >
                2 Runs
              </button>
              <button
                onClick={() => handleRecordBall({ runs: 3 })}
                className="p-3 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500 text-white font-mono font-black text-sm transition-all"
              >
                3 Runs
              </button>
              <button
                onClick={() => handleRecordBall({ runs: 4, shotType: 'Boundary 4' })}
                className="p-3 rounded-xl bg-indigo-950 border border-indigo-500/30 hover:border-indigo-400 text-indigo-300 font-mono font-black text-sm transition-all"
              >
                4 Four
              </button>
              <button
                onClick={() => handleRecordBall({ runs: 6, shotType: 'Maximum 6' })}
                className="p-3 rounded-xl bg-purple-950 border border-purple-500/30 hover:border-purple-400 text-purple-300 font-mono font-black text-sm transition-all"
              >
                6 Six
              </button>
              <button
                onClick={() => handleRecordBall({ runs: 0, isWicket: true, wicketType: 'Bowled' })}
                className="p-3 rounded-xl bg-rose-950 border border-rose-500/30 hover:border-rose-400 text-rose-300 font-mono font-black text-sm transition-all col-span-4 sm:col-span-1"
              >
                W Wicket
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Live Event Stream & Confidence Monitor */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-[2.5rem] border bg-black/40 space-y-6 shadow-2xl" style={{ borderColor: D.border }}>
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 font-mono">PARSED AUDIO AUDIT TRAIL</span>
                <h3 className="text-xl font-black uppercase italic text-white" style={{ fontFamily: D.head }}>
                  VOICE EVENT STREAM
                </h3>
              </div>
              <History className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              <AnimatePresence>
                {ballHistory.map((ball) => (
                  <motion.div
                    key={ball.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white/10 text-white font-mono text-[10px]">
                          Over {ball.over}
                        </Badge>
                        <span className="text-xs font-mono font-bold text-white">
                          {ball.transcript}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400">
                        {ball.confidence}% Conf.
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                      <span>Recorded at {ball.timestamp}</span>
                      <span className="text-zinc-400">Status: Dispatched to Match Engine</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
