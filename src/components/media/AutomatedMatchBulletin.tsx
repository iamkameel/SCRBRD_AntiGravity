"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Newspaper, Sparkles, Copy, Check, Share2, FileText, Send, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { liveMatchSync, LiveMatchState } from '@/services/liveMatchSync';
import { aiMatchReporter, GeneratedMatchReport } from '@/services/aiMatchReporter';

export function AutomatedMatchBulletin() {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'newsletter' | 'social' | 'coach-notes'>('newsletter');
  const [matchState, setMatchState] = useState<LiveMatchState>(liveMatchSync.getLiveState());
  const [report, setReport] = useState<GeneratedMatchReport>(() => aiMatchReporter.generateReport(liveMatchSync.getLiveState()));
  const [generating, setGenerating] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = liveMatchSync.subscribe(newState => {
      setMatchState(newState);
      setReport(aiMatchReporter.generateReport(newState));
    });
    return () => unsubscribe();
  }, []);

  const handleRegenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setReport(aiMatchReporter.generateReport(matchState));
      setGenerating(false);
    }, 600);
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Newspaper className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-['Syne',sans-serif] tracking-tight">Automated School Match Bulletin Generator</h2>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-mono text-[10px]">
                <Sparkles className="w-3 h-3 mr-1" />
                AI News Engine
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Automated post-match press releases, headmaster&apos;s newsletters, and social media cards.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRegenerate}
            disabled={generating}
            className="border-white/10 text-slate-300 font-mono text-xs hover:bg-white/10"
          >
            <RefreshCw className={cn("w-3.5 h-3.5 mr-1 text-cyan-400", generating && "animate-spin")} />
            {generating ? 'Synthesizing...' : 'Regenerate'}
          </Button>

          <Button
            size="sm"
            onClick={() => handleCopyText(activeTab === 'newsletter' ? report.headmasterPressRelease : report.socialMediaCaptions.instagram)}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-xs font-bold"
          >
            {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'Copied!' : 'Copy Text'}
          </Button>
        </div>
      </div>

      {/* Format Selector */}
      <div className="flex gap-2 border-b border-white/10 pb-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setActiveTab('newsletter')}
          className={cn(
            "text-xs font-mono transition-all",
            activeTab === 'newsletter' ? "bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold" : "bg-slate-950 text-slate-400 border-white/10"
          )}
        >
          <FileText className="w-3.5 h-3.5 mr-1.5" />
          School Weekly Newsletter
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setActiveTab('social')}
          className={cn(
            "text-xs font-mono transition-all",
            activeTab === 'social' ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/40 font-bold" : "bg-slate-950 text-slate-400 border-white/10"
          )}
        >
          <Share2 className="w-3.5 h-3.5 mr-1.5" />
          Social Media Card
        </Button>
      </div>

      {/* Content Display */}
      {activeTab === 'newsletter' && (
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 font-sans text-sm leading-relaxed text-slate-200 whitespace-pre-line shadow-inner space-y-4">
          <div className="font-bold text-amber-400 font-mono text-xs uppercase tracking-wider">{report.title}</div>
          <div>{report.headmasterPressRelease}</div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="max-w-md mx-auto p-6 rounded-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-white/15 shadow-2xl space-y-4 font-mono">
          <div className="flex justify-between items-center border-b border-white/10 pb-3">
            <Badge className="bg-amber-500 text-slate-950 text-[10px] font-bold">1st XI MATCH RESULT</Badge>
            <span className="text-[10px] text-slate-400">SCRBRD AI MEDIA</span>
          </div>

          <div className="space-y-1 font-['Syne',sans-serif]">
            <div className="text-xl font-black text-white">{matchState.battingTeamName}</div>
            <div className="text-2xl font-black text-amber-400 font-mono">{matchState.totalRuns}/{matchState.wickets} <span className="text-sm text-slate-400 font-normal">({matchState.oversCompleted}.{matchState.ballsInOver} ov)</span></div>
          </div>

          <div className="text-xs text-slate-400">def.</div>

          <div className="space-y-1 font-['Syne',sans-serif]">
            <div className="text-lg font-bold text-slate-300">{matchState.bowlingTeamName}</div>
          </div>

          <div className="pt-3 border-t border-white/10 text-xs text-slate-300 space-y-2 font-sans">
            <div className="text-amber-400 font-bold font-mono">⭐ Player of the Match: {report.playerOfTheMatch.name}</div>
            <div className="text-slate-300 text-xs">{report.playerOfTheMatch.performance} — {report.playerOfTheMatch.rationale}</div>
            <div className="pt-2 text-[11px] text-cyan-300 whitespace-pre-line font-mono bg-white/5 p-3 rounded-lg border border-white/5">
              {report.socialMediaCaptions.instagram}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
