"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tv, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { liveMatchSync, LiveMatchState } from '@/services/liveMatchSync';
import { OverlayGraphic, liveStateToOverlay, OVERLAY_MODES, type OverlayMode, type OverlayState } from '@/components/broadcast/OverlayModes';

export type { OverlayState };

/**
 * Producer-side control surface for the OBS / vMix browser source.
 * The preview below renders the *same* OverlayGraphic component the
 * /broadcast/[matchId] page renders, driven by the same live bus.
 */
export function BroadcastOverlayEngine() {
  const [live, setLive] = useState<LiveMatchState>(liveMatchSync.getLiveState());
  const [mode, setMode] = useState<OverlayMode>('lower-third');
  const [chromaKeyMode, setChromaKeyMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => liveMatchSync.subscribe(setLive), []);

  const overlay = liveStateToOverlay(live, mode);
  const obsUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/broadcast/${live.fixtureId}?mode=${mode}${chromaKeyMode ? '&chroma=1' : ''}`
    : '';

  const handleCopyObsUrl = () => {
    navigator.clipboard.writeText(obsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white font-['Syne',sans-serif] tracking-tight">Broadcast & Stream Overlay Engine</h2>
              <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 font-mono text-[10px]">OBS / vMix Ready</Badge>
              <Badge variant="outline" className={cn('font-mono text-[10px]', live.connectionStatus === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>
                {live.connectionStatus}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Real-time graphic overlays for live school match streaming & video production.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setChromaKeyMode(!chromaKeyMode)}
            className={cn('text-xs font-mono transition-all', chromaKeyMode ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-slate-950 text-slate-400 border-white/10')}
          >
            Chroma Key (Green Screen): {chromaKeyMode ? 'ON' : 'OFF'}
          </Button>
          <Button size="sm" onClick={handleCopyObsUrl} className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs">
            {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
            {copied ? 'URL Copied!' : 'Copy OBS Browser Source URL'}
          </Button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex flex-wrap gap-2">
        {OVERLAY_MODES.map(m => (
          <Button
            key={m}
            size="sm"
            variant="outline"
            onClick={() => setMode(m)}
            className={cn('text-xs font-mono uppercase tracking-wider transition-all', mode === m ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-bold' : 'bg-slate-950 text-slate-400 border-white/10')}
          >
            {m.replace('-', ' ')}
          </Button>
        ))}
      </div>

      {/* Broadcast Preview */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase text-slate-400 flex items-center justify-between gap-4">
          <span>Live Broadcast Viewport Preview</span>
          <span className="text-[10px] text-indigo-400 truncate" title={obsUrl}>{obsUrl || '1920 x 1080 (16:9 HD)'}</span>
        </div>

        <div className={cn(
          'w-full h-80 rounded-2xl relative overflow-hidden border border-white/10 flex flex-col justify-end p-6 transition-all',
          chromaKeyMode ? 'bg-[#00FF00]' : 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40'
        )}>
          {!chromaKeyMode && (
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />
          )}
          {mode === 'hero' ? (
            <div className="text-center text-xs font-mono text-slate-400 p-6 bg-slate-950/70 rounded-xl border border-white/10">
              <b className="text-white">Hero</b> is the full-screen skewed lower-third with the milestone banner.
              It only renders on the OBS source page — open the URL above to preview it.
            </div>
          ) : (
            <OverlayGraphic state={overlay} />
          )}
        </div>
      </div>
    </Card>
  );
}
