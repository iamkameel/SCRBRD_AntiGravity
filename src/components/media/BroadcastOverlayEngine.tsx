"use client";

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Tv, 
  Copy, 
  Check, 
  Radio, 
  Sparkles, 
  Zap, 
  Sliders, 
  Layers, 
  Eye, 
  Play, 
  Flame, 
  ShieldCheck, 
  ExternalLink,
  Settings2,
  Volume2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { D } from '@/lib/design-system';
import { liveMatchSync, LiveMatchState } from '@/services/liveMatchSync';
import { OverlayGraphic, liveStateToOverlay, OVERLAY_MODES, type OverlayMode, type OverlayState } from '@/components/broadcast/OverlayModes';

export type { OverlayState };

export function BroadcastOverlayEngine() {
  const [live, setLive] = useState<LiveMatchState>(liveMatchSync.getLiveState());
  const [mode, setMode] = useState<OverlayMode>('lower-third');
  const [chromaKeyMode, setChromaKeyMode] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [sponsorBrand, setSponsorBrand] = useState<'Standard Bank' | 'Investec' | 'Discovery' | 'None'>('Standard Bank');
  const [streamResolution, setStreamResolution] = useState<'1080p' | '4K'>('1080p');
  const [syncDelayMs, setSyncDelayMs] = useState<number>(0);
  const [simulatingEvent, setSimulatingEvent] = useState<string | null>(null);

  useEffect(() => liveMatchSync.subscribe(setLive), []);

  const overlay = liveStateToOverlay(live, mode);
  const obsUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/broadcast/${live.fixtureId}?mode=${mode}${chromaKeyMode ? '&chroma=1' : ''}${sponsorBrand !== 'None' ? `&sponsor=${encodeURIComponent(sponsorBrand)}` : ''}`
    : '';

  const handleCopyObsUrl = () => {
    navigator.clipboard.writeText(obsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateEvent = (type: 'FOUR' | 'SIX' | 'WICKET' | 'MILESTONE') => {
    setSimulatingEvent(type);
    let runs = 0;
    let isWicket = false;
    let wicketType: string | undefined = undefined;

    if (type === 'FOUR') runs = 4;
    if (type === 'SIX') runs = 6;
    if (type === 'WICKET') {
      isWicket = true;
      wicketType = 'Caught at Long-On';
    }

    const nextBall = live.ballsInOver >= 5 ? 1 : live.ballsInOver + 1;
    const overNum = live.ballsInOver >= 5 ? live.oversCompleted + 1 : live.oversCompleted;

    const ballEv = {
      id: `sim-b-${Date.now()}`,
      overNumber: overNum,
      ballNumber: nextBall,
      strikerName: live.striker.name,
      bowlerName: live.currentBowler.name,
      runsOffBat: runs,
      extraRuns: 0,
      totalRuns: runs,
      isWicket,
      wicketType,
      dismissedPlayerName: isWicket ? live.striker.name : undefined,
      commentary: isWicket ? `WICKET! ${live.striker.name} ${wicketType}` : runs === 6 ? `SIX! Huge hit over the boundary by ${live.striker.name}!` : runs === 4 ? `FOUR! Driven cleanly through the cover gap by ${live.striker.name}.` : `Dot ball bowled by ${live.currentBowler.name}.`,
      timestamp: new Date().toISOString()
    };

    liveMatchSync.addBallEvent(ballEv, live.fixtureId);

    if (type === 'MILESTONE') {
      liveMatchSync.updateMatchState({
        activeMilestoneAlert: {
          id: `ms-${Date.now()}`,
          type: 'FIFTY',
          title: '50 RUN MILESTONE',
          description: `${live.striker.name.toUpperCase()} reaches half century!`,
          timestamp: new Date().toLocaleTimeString()
        }
      });
    }

    setTimeout(() => setSimulatingEvent(null), 1500);
  };

  return (
    <Card 
      className="p-6 md:p-8 border rounded-3xl shadow-2xl space-y-6"
      style={{ background: D.surf1, borderColor: D.border }}
    >
      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b pb-6" style={{ borderColor: D.border }}>
        <div className="flex items-center gap-4">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner"
            style={{ background: D.surf2, borderColor: D.border }}
          >
            <Tv className="w-7 h-7 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tight" style={{ fontFamily: D.head }}>
                TV-GRADE BROADCAST OVERLAY STUDIO
              </h2>
              <Badge className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
                OBS / vMIX SOURCE READY
              </Badge>
              <Badge className={cn('font-mono text-[10px] gap-1.5', live.connectionStatus === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-zinc-800 text-zinc-400')}>
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> {live.connectionStatus}
              </Badge>
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              REAL-TIME GRAPHICS ENGINE • ULTRA-LOW LATENCY WEBSOCKET FEED • AUTOMATED SPONSOR WATERMARKS
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            onClick={() => setChromaKeyMode(!chromaKeyMode)}
            className={cn('text-xs font-mono font-bold transition-all px-4 py-2 rounded-xl border', chromaKeyMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-black text-zinc-400 border-white/10')}
          >
            Chroma Key (Green Screen): {chromaKeyMode ? 'ON (#00FF00)' : 'OFF'}
          </Button>

          <Button 
            size="sm" 
            onClick={handleCopyObsUrl} 
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold px-5 py-2 rounded-xl gap-2 shadow-lg"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {copied ? 'OBS URL Copied!' : 'Copy OBS Browser Source URL'}
          </Button>
        </div>
      </div>

      {/* Production Controls Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-black/30 border" style={{ borderColor: D.border }}>
        {/* Sponsor Watermark Selector */}
        <div>
          <label className="text-[10px] font-mono text-zinc-400 block mb-1">Title Sponsor Watermark</label>
          <select
            value={sponsorBrand}
            onChange={e => setSponsorBrand(e.target.value as any)}
            className="w-full p-2.5 rounded-xl bg-black border border-white/10 text-xs text-white font-mono"
          >
            <option value="Standard Bank">Standard Bank (Title Partner)</option>
            <option value="Investec">Investec (Broadcast Partner)</option>
            <option value="Discovery">Discovery Vitality</option>
            <option value="None">No Sponsor Branding</option>
          </select>
        </div>

        {/* Resolution Format */}
        <div>
          <label className="text-[10px] font-mono text-zinc-400 block mb-1">Canvas Stream Output</label>
          <select
            value={streamResolution}
            onChange={e => setStreamResolution(e.target.value as any)}
            className="w-full p-2.5 rounded-xl bg-black border border-white/10 text-xs text-white font-mono"
          >
            <option value="1080p">1080p Full HD (1920x1080 @ 60fps)</option>
            <option value="4K">4K Ultra HD (3840x2160 @ 60fps)</option>
          </select>
        </div>

        {/* Sync Delay Offset */}
        <div>
          <label className="text-[10px] font-mono text-zinc-400 block mb-1">Audio/Video Sync Delay ({syncDelayMs}ms)</label>
          <input 
            type="range" 
            min={0} 
            max={500} 
            step={25}
            value={syncDelayMs}
            onChange={e => setSyncDelayMs(parseInt(e.target.value))}
            className="w-full accent-indigo-400 mt-2"
          />
        </div>

        {/* Live OBS Target URL */}
        <div className="flex flex-col justify-center">
          <span className="text-[10px] font-mono text-zinc-400 block">OBS Browser Target</span>
          <a 
            href={obsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 font-mono hover:underline truncate flex items-center gap-1 mt-1"
          >
            Open Live Canvas <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Graphics Mode Switcher */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block">SELECT BROADCAST OVERLAY GRAPHIC MODE</span>
        <div className="flex flex-wrap gap-2">
          {OVERLAY_MODES.map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                'px-4 py-2.5 rounded-xl text-xs font-mono font-black uppercase tracking-wider transition-all border',
                mode === m ? 'bg-amber-500 text-black border-amber-400 shadow-lg' : 'bg-black/40 text-zinc-400 border-white/10 hover:text-white'
              )}
            >
              {m.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Real-Time Live Viewport Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-400" /> LIVE BROADCAST VIEWPORT PREVIEW (16:9 1080p)
          </span>
          <span className="text-[10px] text-emerald-400 font-bold">
            {sponsorBrand !== 'None' ? `WATERMARK ACTIVE: ${sponsorBrand.toUpperCase()}` : 'NO WATERMARK'}
          </span>
        </div>

        <div className={cn(
          'w-full h-96 rounded-3xl relative overflow-hidden border border-white/10 flex flex-col justify-end p-8 transition-all shadow-2xl',
          chromaKeyMode ? 'bg-[#00FF00]' : 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60'
        )}>
          {!chromaKeyMode && (
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />
          )}

          {/* Top Sponsor Watermark Banner */}
          {sponsorBrand !== 'None' && !chromaKeyMode && (
            <div className="absolute top-6 right-8 bg-black/80 border border-white/10 backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-3">
              <span className="text-[9px] font-mono text-zinc-400">BROADCAST POWERED BY</span>
              <span className="text-xs font-black text-amber-400 font-mono uppercase tracking-wider">{sponsorBrand}</span>
            </div>
          )}

          {/* Graphic Overlay Component */}
          {mode === 'hero' ? (
            <div className="text-center text-xs font-mono text-zinc-300 p-8 bg-slate-950/80 rounded-2xl border border-white/10 max-w-xl mx-auto space-y-2">
              <b className="text-white text-base block font-bold">Hero Skewed Milestone Overlay</b>
              <p className="text-zinc-400">
                The hero overlay renders a full-screen lower third with animated milestone banners on 50s, 100s, and 5-wicket spells. Open the live OBS URL to view in full resolution.
              </p>
            </div>
          ) : (
            <OverlayGraphic state={overlay} />
          )}
        </div>
      </div>

      {/* Live Event Test Simulator Bar */}
      <div className="p-6 rounded-2xl bg-black/40 border space-y-3" style={{ borderColor: D.border }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> LIVE BROADCAST GRAPHICS STRESS TEST SIMULATOR
          </span>
          <span className="text-[10px] font-mono text-zinc-400">Trigger simulated match events to test overlay transitions</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button 
            size="sm" 
            onClick={() => handleSimulateEvent('FOUR')}
            disabled={!!simulatingEvent}
            className="bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 text-xs font-mono font-bold rounded-xl"
          >
            Simulate 4 Boundary
          </Button>

          <Button 
            size="sm" 
            onClick={() => handleSimulateEvent('SIX')}
            disabled={!!simulatingEvent}
            className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs font-mono font-bold rounded-xl"
          >
            Simulate 6 Boundary
          </Button>

          <Button 
            size="sm" 
            onClick={() => handleSimulateEvent('WICKET')}
            disabled={!!simulatingEvent}
            className="bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 text-xs font-mono font-bold rounded-xl"
          >
            Simulate Wicket Event
          </Button>

          <Button 
            size="sm" 
            onClick={() => handleSimulateEvent('MILESTONE')}
            disabled={!!simulatingEvent}
            className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/30 text-xs font-mono font-bold rounded-xl"
          >
            Simulate 50 Milestone
          </Button>
        </div>
      </div>
    </Card>
  );
}
