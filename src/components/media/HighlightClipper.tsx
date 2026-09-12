"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Scissors, Clapperboard, Radio, Film, Download, Copy, Check, Trash2, Send,
  MapPin, Sparkles, Timer, Youtube, FileSpreadsheet, ListVideo, Wand2,
} from 'lucide-react';
import { liveMatchSync, LiveMatchState, LiveBallEvent } from '@/services/liveMatchSync';
import { highlightService } from '@/lib/services/highlightService';
import {
  KIND_META,
  buildHighlightReel,
  clipToOverlayAlert,
  createManualClip,
  detectHighlightsForBall,
  exportCsvMarkers,
  exportEdl,
  exportYouTubeChapters,
  formatDuration,
  formatTimecode,
  resyncClips,
  seedFromRecentBalls,
  type ClipStatus,
  type HighlightClip,
  type StreamSync,
} from '@/lib/intelligence/highlightEngine';

const STATUS_STYLE: Record<ClipStatus, string> = {
  QUEUED: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  CLIPPED: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
  PUBLISHED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  DISCARDED: 'bg-rose-500/10 text-rose-400/70 border-rose-500/20 line-through',
};

const PRIORITY_DOT: Record<1 | 2 | 3, string> = { 1: 'bg-amber-400', 2: 'bg-indigo-400', 3: 'bg-slate-500' };

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function download(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function HighlightClipper() {
  const [live, setLive] = useState<LiveMatchState>(liveMatchSync.getLiveState());
  const [clips, setClips] = useState<HighlightClip[]>([]);
  const [sync, setSync] = useState<StreamSync>({ streamStartIso: null, scorerLagSec: 4 });
  const [budgetSec, setBudgetSec] = useState(120);
  const [manualTitle, setManualTitle] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [showDiscarded, setShowDiscarded] = useState(false);

  // Balls we've already evaluated, so a re-render never double-detects.
  const seenBallIds = useRef<Set<string>>(new Set(liveMatchSync.getLiveState().recentBalls.map(b => b.id)));
  const prevState = useRef<LiveMatchState>(liveMatchSync.getLiveState());
  const syncRef = useRef(sync);
  syncRef.current = sync;

  const fixtureId = live.fixtureId;

  // ── Live feed → auto-detect ──
  useEffect(() => {
    const unsub = liveMatchSync.subscribe((next: LiveMatchState) => {
      const before = prevState.current;
      const fresh: LiveBallEvent[] = next.recentBalls.filter(b => !seenBallIds.current.has(b.id)).reverse(); // oldest first
      fresh.forEach(b => seenBallIds.current.add(b.id));
      if (fresh.length && before.fixtureId === next.fixtureId) {
        const detected = fresh.flatMap(b => detectHighlightsForBall(b, before, next, syncRef.current));
        detected.forEach(c => highlightService.add(c));
        if (detected.length) toast(`${detected.length} highlight${detected.length > 1 ? 's' : ''} auto-marked`, { description: detected.map(c => c.title).join(' · ') });
      }
      prevState.current = next;
      setLive(next);
    });
    return () => unsub();
  }, []);

  // ── Persistence subscription ──
  useEffect(() => highlightService.subscribe(fixtureId, setClips), [fixtureId]);

  // ── Re-derive stream offsets whenever sync changes ──
  useEffect(() => {
    if (!clips.length) return;
    const resynced = resyncClips(clips, sync);
    const changed = resynced.some((c, i) => c.streamOffsetSec !== clips[i].streamOffsetSec);
    if (changed) highlightService.replaceAll(fixtureId, resynced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sync.streamStartIso, sync.scorerLagSec]);

  // ── Derived ──
  const visible = useMemo(
    () => clips.filter(c => showDiscarded || c.status !== 'DISCARDED').sort((a, b) => (b.streamOffsetSec ?? 0) - (a.streamOffsetSec ?? 0) || b.detectedAt.localeCompare(a.detectedAt)),
    [clips, showDiscarded]
  );
  const { reel, totalSec } = useMemo(() => buildHighlightReel(clips, budgetSec), [clips, budgetSec]);
  const reelIds = useMemo(() => new Set(reel.map(c => c.id)), [reel]);
  const synced = !!sync.streamStartIso;
  const counts = useMemo(() => ({
    total: clips.filter(c => c.status !== 'DISCARDED').length,
    published: clips.filter(c => c.status === 'PUBLISHED').length,
  }), [clips]);

  // ── Actions ──
  const markStreamStartNow = () => setSync(s => ({ ...s, streamStartIso: new Date().toISOString() }));

  const markMoment = () => {
    const clip = createManualClip(fixtureId, manualTitle.trim(), sync, live);
    highlightService.add(clip);
    setManualTitle('');
    toast.success('Moment marked', { description: `${clip.over} ov · ${formatTimecode(clip.streamOffsetSec)}` });
  };

  const seedDemo = () => {
    const seeded = seedFromRecentBalls(live, sync);
    if (!seeded.length) { toast.info('No boundary or wicket balls in the live buffer to seed from.'); return; }
    seeded.forEach(c => highlightService.add(c));
    toast.success(`Seeded ${seeded.length} highlights from the recent-ball buffer`);
  };

  const simulateBall = () => {
    const roll = Math.random();
    const isWicket = roll < 0.15;
    const runs = isWicket ? 0 : roll < 0.35 ? 6 : roll < 0.6 ? 4 : roll < 0.8 ? 1 : 0;
    const nextBall = live.ballsInOver >= 5 ? 1 : live.ballsInOver + 1;
    const ev: LiveBallEvent = {
      id: `sim-${Date.now()}`,
      overNumber: live.ballsInOver >= 5 ? live.oversCompleted + 1 : live.oversCompleted,
      ballNumber: nextBall,
      strikerName: live.striker.name,
      bowlerName: live.currentBowler.name,
      runsOffBat: runs, extraRuns: 0, totalRuns: runs,
      isWicket, wicketType: isWicket ? 'Caught' : undefined,
      dismissedPlayerName: isWicket ? live.striker.name : undefined,
      shotZone: runs >= 4 ? ['cover', 'midwicket', 'long-on', 'fine leg'][Math.floor(Math.random() * 4)] : undefined,
      commentary: '', timestamp: new Date().toISOString(),
    };
    liveMatchSync.addBallEvent(ev, fixtureId);
  };

  const setStatus = (clip: HighlightClip, status: ClipStatus) => highlightService.setStatus(clip, status);
  const pushToOverlay = (clip: HighlightClip) => {
    liveMatchSync.updateMatchState({ activeMilestoneAlert: clipToOverlayAlert(clip) });
    toast.success('Pushed to broadcast overlay', { description: clip.title });
  };

  const copy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  const reelTitle = `${live.homeTeamName} v ${live.awayTeamName} — Highlights`;
  const exportChapters = () => copy('yt', exportYouTubeChapters(reel, reelTitle));
  const exportCsv = () => download(`${fixtureId}-markers.csv`, exportCsvMarkers(reel.length ? reel : clips), 'text/csv');
  const exportEdlFile = () => download(`${fixtureId}-highlights.edl`, exportEdl(reel, reelTitle));

  return (
    <Card className="p-6 bg-slate-900/90 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-white font-['Syne',sans-serif] tracking-tight">Highlight Clipper</h2>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-mono text-[10px]">Auto-Marking</Badge>
              <Badge variant="outline" className={cn('font-mono text-[10px] gap-1', live.connectionStatus === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20')}>
                <Radio className="w-3 h-3" /> {live.connectionStatus}
              </Badge>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Boundaries, wickets and milestones from the live feed become clip markers on the stream timeline. Export to YouTube chapters, CSV markers or an EDL.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span><b className="text-white">{counts.total}</b> clips</span>
          <span>·</span>
          <span><b className="text-emerald-400">{counts.published}</b> published</span>
        </div>
      </div>

      {/* Stream sync + capture controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Timer className="w-3.5 h-3.5" /> Stream Sync</span>
            <Badge variant="outline" className={cn('font-mono text-[9px]', synced ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20')}>
              {synced ? 'SYNCED' : 'NOT SYNCED'}
            </Badge>
          </div>
          <div className="flex gap-2">
            <input
              type="datetime-local"
              value={toLocalInput(sync.streamStartIso)}
              onChange={e => setSync(s => ({ ...s, streamStartIso: e.target.value ? new Date(e.target.value).toISOString() : null }))}
              className="flex-1 h-8 rounded-lg bg-slate-900 border border-white/10 px-2 text-xs font-mono text-white"
              aria-label="Stream start time"
            />
            <Button size="sm" variant="outline" onClick={markStreamStartNow} className="h-8 text-[10px] font-mono bg-slate-950 border-white/10 text-slate-300">Now</Button>
          </div>
          <label className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            Scorer lag
            <span className="flex items-center gap-2">
              <input type="range" min={0} max={20} value={sync.scorerLagSec} onChange={e => setSync(s => ({ ...s, scorerLagSec: Number(e.target.value) }))} className="w-24 accent-amber-400" />
              <b className="text-white w-8 text-right">{sync.scorerLagSec}s</b>
            </span>
          </label>
          <p className="text-[10px] text-slate-500">Set when you hit “Start Streaming” in OBS. Lag = how far the scorer trails the pictures.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Mark a Moment</span>
          <div className="flex gap-2">
            <input
              value={manualTitle}
              onChange={e => setManualTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && markMoment()}
              placeholder="e.g. Diving catch at point"
              className="flex-1 h-8 rounded-lg bg-slate-900 border border-white/10 px-2 text-xs text-white placeholder:text-slate-600"
            />
            <Button size="sm" onClick={markMoment} className="h-8 bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono text-[10px] font-bold">
              <MapPin className="w-3 h-3 mr-1" /> Mark
            </Button>
          </div>
          <p className="text-[10px] text-slate-500">
            Stamps now at {live.oversCompleted}.{live.ballsInOver} ov · {live.striker.name} on strike.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-3">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Wand2 className="w-3.5 h-3.5" /> Feed Tools</span>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={simulateBall} className="h-8 text-[10px] font-mono bg-slate-950 border-white/10 text-slate-300">
              <Sparkles className="w-3 h-3 mr-1" /> Simulate Ball
            </Button>
            <Button size="sm" variant="outline" onClick={seedDemo} className="h-8 text-[10px] font-mono bg-slate-950 border-white/10 text-slate-300">
              <ListVideo className="w-3 h-3 mr-1" /> Seed from Buffer
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowDiscarded(v => !v)} className="h-8 text-[10px] font-mono bg-slate-950 border-white/10 text-slate-300">
              {showDiscarded ? 'Hide' : 'Show'} discarded
            </Button>
          </div>
          <p className="text-[10px] text-slate-500">Simulate pushes a ball through the same bus the scorer uses, so detection is exercised end-to-end.</p>
        </div>
      </div>

      {/* Clip list */}
      <div className="space-y-2">
        <div className="text-xs font-mono uppercase text-slate-400 flex items-center gap-2"><Clapperboard className="w-3.5 h-3.5" /> Clip Markers</div>
        {visible.length === 0 && (
          <div className="p-8 rounded-xl border border-dashed border-white/10 text-center text-xs text-slate-500">
            Nothing marked yet. Boundaries and wickets from the live feed will appear here automatically.
          </div>
        )}
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {visible.map(clip => {
            const meta = KIND_META[clip.kind];
            const inReel = reelIds.has(clip.id);
            return (
              <div key={clip.id} className={cn('p-3 rounded-xl border bg-slate-950/50 flex flex-col md:flex-row md:items-center gap-3 transition-colors', inReel ? 'border-amber-500/30' : 'border-white/10')}>
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="text-xl leading-none shrink-0" title={meta.label}>{meta.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('w-1.5 h-1.5 rounded-full', PRIORITY_DOT[clip.priority])} title={`Priority ${clip.priority}`} />
                      <span className="text-sm font-bold text-white truncate">{clip.title}</span>
                      <Badge variant="outline" className={cn('font-mono text-[9px]', STATUS_STYLE[clip.status])}>{clip.status}</Badge>
                      {clip.source === 'MANUAL' && <Badge variant="outline" className="font-mono text-[9px] bg-white/5 text-slate-400 border-white/10">MANUAL</Badge>}
                      {inReel && <Badge variant="outline" className="font-mono text-[9px] bg-amber-500/10 text-amber-400 border-amber-500/30">IN REEL</Badge>}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{clip.description}</p>
                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{clip.over} ov</span>
                      <span>·</span>
                      <span className={synced ? 'text-cyan-300' : ''}>{formatTimecode(clip.clipStartSec)} → {formatTimecode(clip.clipEndSec)}</span>
                      <span>·</span>
                      <span>{formatDuration(clip.durationSec)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <select
                    value={clip.status}
                    onChange={e => setStatus(clip, e.target.value as ClipStatus)}
                    className="h-7 rounded-md bg-slate-900 border border-white/10 text-[10px] font-mono text-slate-300 px-1.5"
                    aria-label="Clip status"
                  >
                    {(['QUEUED', 'CLIPPED', 'PUBLISHED', 'DISCARDED'] as ClipStatus[]).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Button size="sm" variant="ghost" onClick={() => pushToOverlay(clip)} title="Push to broadcast overlay" className="h-7 w-7 p-0 text-indigo-300 hover:text-indigo-200 hover:bg-indigo-500/10">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => highlightService.remove(clip)} title="Delete marker" className="h-7 w-7 p-0 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reel builder + exports */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">Highlight Reel</span>
            <span className="text-[11px] font-mono text-slate-400">{reel.length} clips · {formatDuration(totalSec)} of {formatDuration(budgetSec)}</span>
          </div>
          <label className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            Budget
            <input type="range" min={30} max={600} step={15} value={budgetSec} onChange={e => setBudgetSec(Number(e.target.value))} className="w-40 accent-amber-400" />
            <b className="text-white w-14 text-right">{formatDuration(budgetSec)}</b>
          </label>
        </div>

        {/* Timeline strip */}
        <div className="h-3 rounded-full bg-slate-800 overflow-hidden flex">
          {reel.map(c => (
            <div
              key={c.id}
              title={`${c.title} · ${formatDuration(c.durationSec)}`}
              style={{ width: `${(c.durationSec / Math.max(budgetSec, 1)) * 100}%` }}
              className={cn('h-full border-r border-slate-950/60', c.priority === 1 ? 'bg-amber-400' : c.priority === 2 ? 'bg-indigo-400' : 'bg-slate-500')}
            />
          ))}
        </div>

        {!synced && (
          <p className="text-[10px] text-rose-300/80 font-mono">Set the stream start time to place clips on the timeline — the reel and exports need it.</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={!reel.length} onClick={exportChapters} className="h-8 text-[10px] font-mono bg-slate-950 border-white/10 text-slate-300">
            {copied === 'yt' ? <Check className="w-3 h-3 mr-1 text-emerald-400" /> : <Youtube className="w-3 h-3 mr-1" />}
            {copied === 'yt' ? 'Chapters copied' : 'Copy YouTube chapters'}
          </Button>
          <Button size="sm" variant="outline" disabled={!clips.length} onClick={exportCsv} className="h-8 text-[10px] font-mono bg-slate-950 border-white/10 text-slate-300">
            <FileSpreadsheet className="w-3 h-3 mr-1" /> CSV markers
          </Button>
          <Button size="sm" variant="outline" disabled={!reel.length} onClick={exportEdlFile} className="h-8 text-[10px] font-mono bg-slate-950 border-white/10 text-slate-300">
            <Download className="w-3 h-3 mr-1" /> EDL (CMX3600)
          </Button>
          <Button size="sm" variant="outline" disabled={!reel.length} onClick={() => copy('list', reel.map(c => `${formatTimecode(c.clipStartSec)}–${formatTimecode(c.clipEndSec)}  ${c.title}`).join('\n'))} className="h-8 text-[10px] font-mono bg-slate-950 border-white/10 text-slate-300">
            {copied === 'list' ? <Check className="w-3 h-3 mr-1 text-emerald-400" /> : <Copy className="w-3 h-3 mr-1" />}
            Copy cut list
          </Button>
        </div>
      </div>
    </Card>
  );
}
