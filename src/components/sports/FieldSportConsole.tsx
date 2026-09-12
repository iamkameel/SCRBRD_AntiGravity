"use client";

import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { D } from '@/lib/design-system';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Play, Pause, Square, Flag, Undo2, Plus, Timer, ShieldAlert, ArrowLeftRight, ListOrdered, Trophy, ChevronLeft } from 'lucide-react';
import { fieldSportService } from '@/lib/services/fieldSportService';
import {
  RULESETS, createMatch, startPeriod, startClock, stopClock, endPeriod, recordScore, recordCard, recordSub, undoLastEvent,
  deriveScore, activeSuspensions, foulTallies, playersOnField, summarize, periodElapsed, formatClock, describeEvent,
  type FieldSport, type FieldSportMatch, type Side,
} from '@/lib/intelligence/fieldSportEngine';

interface Props {
  sport: FieldSport;
  schoolId?: string;
}

const TONE: Record<string, string> = {
  green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25',
  yellow: 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25',
  red: 'bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25',
  grey: 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10',
};

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'team';

export function FieldSportConsole({ sport, schoolId }: Props) {
  const ruleset = RULESETS[sport];
  const [matches, setMatches] = useState<FieldSportMatch[]>([]);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [match, setMatch] = useState<FieldSportMatch | null>(null);
  const [, setTick] = useState(0);
  const [newHome, setNewHome] = useState('');
  const [newAway, setNewAway] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [player, setPlayer] = useState<Record<Side, string>>({ home: '', away: '' });
  const [subOff, setSubOff] = useState<Record<Side, string>>({ home: '', away: '' });
  const [subOn, setSubOn] = useState<Record<Side, string>>({ home: '', away: '' });

  useEffect(() => fieldSportService.subscribeList(all => setMatches(all.filter(m => m.sport === sport)), schoolId), [sport, schoolId]);
  useEffect(() => { setMatchId(null); setMatch(null); }, [sport]);
  useEffect(() => {
    if (!matchId) { setMatch(null); return; }
    return fieldSportService.subscribe(matchId, setMatch);
  }, [matchId]);
  useEffect(() => {
    if (!match?.clock.running) return;
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, [match?.clock.running]);

  const now = Date.now();
  const score = useMemo(() => (match ? deriveScore(match) : null), [match]);
  const suspensions = match ? activeSuspensions(match, now) : [];
  const fouls = match ? foulTallies(match) : [];
  const summary = match?.status === 'FULL_TIME' ? summarize(match) : null;

  const apply = (fn: (m: FieldSportMatch) => FieldSportMatch, okMsg?: string) => {
    if (!match) return;
    try {
      const next = fn(match);
      if (next === match) return;
      fieldSportService.save(next);
      if (okMsg) toast.success(okMsg);
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const createNew = () => {
    if (!newHome.trim() || !newAway.trim()) { toast.error('Both team names are required'); return; }
    const m = createMatch(sport, { teamId: slug(newHome), name: newHome.trim() }, { teamId: slug(newAway), name: newAway.trim() }, { venue: newVenue.trim() || undefined, schoolId });
    fieldSportService.save(m);
    setMatchId(m.id);
    setNewHome(''); setNewAway(''); setNewVenue('');
  };

  const teamName = (side: Side) => (side === 'home' ? match?.home.name : match?.away.name) ?? '';
  const playerRef = (side: Side) => (player[side].trim() ? { name: player[side].trim() } : undefined);

  // ── Match picker / creator ──
  if (!match) {
    return (
      <div className="p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: D.border }}>
          <div>
            <Badge className="bg-amber-500/10 text-amber-300 font-mono text-[9px] mb-2">FIELD / COURT ENGINE</Badge>
            <h3 className="text-2xl font-black uppercase italic text-white" style={{ fontFamily: D.head }}>{ruleset.label} MATCH CONSOLE</h3>
            <p className="text-[11px] text-white/50 font-mono mt-1">
              {ruleset.periods} × {ruleset.periodSec / 60} min {ruleset.periodLabel.toLowerCase()}s · {ruleset.playersOnField} a side · {ruleset.rollingSubs ? 'rolling subs' : `${ruleset.maxSubs} subs`} · {ruleset.scoreTypes.map(s => `${s.label} ${s.points}`).join(' / ')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-black/20 border border-white/10 space-y-3">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>New match</div>
            <input value={newHome} onChange={e => setNewHome(e.target.value)} placeholder="Home team (e.g. 1st XV)" className="h-9 w-full rounded-lg bg-white/5 border border-white/10 px-3 text-xs text-white" aria-label="Home team" />
            <input value={newAway} onChange={e => setNewAway(e.target.value)} placeholder="Away team" className="h-9 w-full rounded-lg bg-white/5 border border-white/10 px-3 text-xs text-white" aria-label="Away team" />
            <input value={newVenue} onChange={e => setNewVenue(e.target.value)} placeholder="Venue (optional)" className="h-9 w-full rounded-lg bg-white/5 border border-white/10 px-3 text-xs text-white" aria-label="Venue" />
            <Button onClick={createNew} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase tracking-wider"><Plus className="h-3.5 w-3.5 mr-1" /> Create match</Button>
          </div>
          <div className="p-5 rounded-2xl bg-black/20 border border-white/10 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>Recent {ruleset.label.toLowerCase()} matches</div>
            {matches.length === 0 && <p className="text-xs text-white/40">None yet — create one to open the console.</p>}
            {matches.map(m => {
              const s = deriveScore(m);
              return (
                <button key={m.id} onClick={() => setMatchId(m.id)} className="w-full text-left p-3 rounded-xl border border-white/10 hover:border-white/25 bg-white/[0.02] flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{m.home.name} <span className="text-white/40">v</span> {m.away.name}</div>
                    <div className="text-[10px] text-white/40 font-mono">{m.status.replace('_', ' ')} · {new Date(m.updatedAt).toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                  </div>
                  <div className="text-lg font-black text-white font-mono">{s.home}–{s.away}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Live console ──
  const live = match.status === 'LIVE';
  const elapsed = periodElapsed(match, now);
  const periodLabel = match.period ? `${ruleset.periodLabel} ${match.period}/${ruleset.periods}` : 'Pre-match';

  return (
    <div className="p-6 md:p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: D.border }}>
        <div className="flex items-center gap-3">
          <button onClick={() => setMatchId(null)} className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white flex items-center justify-center" aria-label="Back to matches"><ChevronLeft className="h-4 w-4" /></button>
          <div>
            <Badge className="bg-amber-500/10 text-amber-300 font-mono text-[9px] mb-1">{ruleset.label.toUpperCase()}</Badge>
            <h3 className="text-xl font-black uppercase italic text-white" style={{ fontFamily: D.head }}>{match.home.name} <span className="text-white/40">v</span> {match.away.name}</h3>
            {match.venue && <p className="text-[10px] text-white/40 font-mono">{match.venue}</p>}
          </div>
        </div>
        <Badge className={cn('font-mono text-[10px]', live ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : match.status === 'FULL_TIME' ? 'bg-white/10 text-white/70 border-white/20' : 'bg-amber-500/15 text-amber-300 border-amber-500/30')}>
          {match.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-3 items-center gap-4 p-6 rounded-2xl bg-black/30 border border-white/10">
        <div className="text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40 truncate">{match.home.name}</div>
          <div className="text-6xl font-black text-white tabular-nums" style={{ fontFamily: D.head }} data-testid="score-home">{score?.home ?? 0}</div>
          <div className="text-[10px] font-mono text-white/40">{playersOnField(match, 'home', now)} on field</div>
        </div>
        <div className="text-center space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40">{periodLabel}</div>
          <div className={cn('text-4xl font-black tabular-nums font-mono', match.clock.running ? 'text-emerald-400' : 'text-white/70')}>{formatClock(elapsed)}</div>
          <div className="text-[10px] font-mono text-white/40">of {formatClock(ruleset.periodSec)}</div>
        </div>
        <div className="text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40 truncate">{match.away.name}</div>
          <div className="text-6xl font-black text-white tabular-nums" style={{ fontFamily: D.head }} data-testid="score-away">{score?.away ?? 0}</div>
          <div className="text-[10px] font-mono text-white/40">{playersOnField(match, 'away', now)} on field</div>
        </div>
      </div>

      {/* Clock controls */}
      <div className="flex flex-wrap gap-2">
        {match.status === 'SCHEDULED' && <Button onClick={() => apply(m => startPeriod(m), 'Kick-off')} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase"><Play className="h-3.5 w-3.5 mr-1" /> Kick-off</Button>}
        {match.status === 'BREAK' && <Button onClick={() => apply(m => startPeriod(m))} className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] uppercase"><Play className="h-3.5 w-3.5 mr-1" /> Start {ruleset.periodLabel.toLowerCase()} {match.period + 1}</Button>}
        {live && !match.clock.running && <Button onClick={() => apply(m => startClock(m))} className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black text-[10px] uppercase"><Play className="h-3.5 w-3.5 mr-1" /> Resume clock</Button>}
        {live && match.clock.running && <Button onClick={() => apply(m => stopClock(m))} className="bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-[10px] uppercase"><Pause className="h-3.5 w-3.5 mr-1" /> Stop clock</Button>}
        {live && <Button onClick={() => apply(m => endPeriod(m))} className="bg-white/5 text-white/70 border border-white/10 font-black text-[10px] uppercase"><Square className="h-3.5 w-3.5 mr-1" /> End {ruleset.periodLabel.toLowerCase()}</Button>}
        {match.status !== 'FULL_TIME' && <Button onClick={() => apply(m => undoLastEvent(m), 'Last event removed')} variant="ghost" className="text-white/50 hover:text-white font-black text-[10px] uppercase"><Undo2 className="h-3.5 w-3.5 mr-1" /> Undo last</Button>}
      </div>

      {/* Suspensions */}
      {suspensions.length > 0 && (
        <div className="p-3 rounded-xl bg-rose-500/[0.05] border border-rose-500/25 flex flex-wrap gap-2 items-center">
          <ShieldAlert className="h-4 w-4 text-rose-400" />
          {suspensions.map((s, i) => (
            <Badge key={i} className="bg-rose-500/15 text-rose-200 border-rose-500/30 font-mono text-[10px]">
              {s.playerName} ({teamName(s.team)}) · {s.label}{s.remainingSec !== null ? ` · ${formatClock(s.remainingSec)} left` : ' · rest of match'}
            </Badge>
          ))}
        </div>
      )}

      {/* Team panels */}
      {match.status !== 'FULL_TIME' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {(['home', 'away'] as Side[]).map(side => (
            <div key={side} className="p-4 rounded-2xl bg-black/20 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{teamName(side)}</span>
                <span className="text-[10px] font-mono text-white/40">{summarize(match).subsUsed[side]}{ruleset.maxSubs !== null ? `/${ruleset.maxSubs}` : ''} subs</span>
              </div>
              <input value={player[side]} onChange={e => setPlayer(p => ({ ...p, [side]: e.target.value }))} placeholder="Player (for scores & cards)" className="h-8 w-full rounded-lg bg-white/5 border border-white/10 px-3 text-xs text-white" aria-label={`${teamName(side)} player`} />
              <div className="flex flex-wrap gap-1.5">
                {ruleset.scoreTypes.map(st => (
                  <Button key={st.code} size="sm" disabled={!live} onClick={() => apply(m => recordScore(m, side, st.code, playerRef(side)))}
                    className="h-8 bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/25 font-black text-[10px] uppercase">
                    {st.label} <span className="ml-1 opacity-70">+{st.points}</span>
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ruleset.cardTypes.map(ct => (
                  <Button key={ct.code} size="sm" disabled={!live} onClick={() => { const p = playerRef(side); if (!p) { toast.error('Enter the player name first'); return; } apply(m => recordCard(m, side, ct.code, p)); }}
                    className={cn('h-8 border font-black text-[10px] uppercase', TONE[ct.tone])}>
                    {ct.label}
                  </Button>
                ))}
              </div>
              <div className="flex gap-1.5 items-center">
                <ArrowLeftRight className="h-3.5 w-3.5 text-white/40 shrink-0" />
                <input value={subOff[side]} onChange={e => setSubOff(p => ({ ...p, [side]: e.target.value }))} placeholder="Off" className="h-8 flex-1 min-w-0 rounded-lg bg-white/5 border border-white/10 px-2 text-xs text-white" aria-label={`${teamName(side)} player off`} />
                <input value={subOn[side]} onChange={e => setSubOn(p => ({ ...p, [side]: e.target.value }))} placeholder="On" className="h-8 flex-1 min-w-0 rounded-lg bg-white/5 border border-white/10 px-2 text-xs text-white" aria-label={`${teamName(side)} player on`} />
                <Button size="sm" onClick={() => { if (!subOff[side].trim() || !subOn[side].trim()) { toast.error('Enter both players'); return; } apply(m => recordSub(m, side, { name: subOff[side].trim() }, { name: subOn[side].trim() })); setSubOff(p => ({ ...p, [side]: '' })); setSubOn(p => ({ ...p, [side]: '' })); }}
                  className="h-8 bg-white/5 text-white/70 border border-white/10 font-black text-[10px] uppercase">Sub</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fouls (basketball) */}
      {fouls.length > 0 && (
        <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
          <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2" style={{ fontFamily: D.mono }}>Fouls (limit {ruleset.foulLimitPerPlayer})</div>
          <div className="flex flex-wrap gap-2">
            {fouls.map((f, i) => (
              <Badge key={i} className={cn('font-mono text-[10px]', f.fouledOut ? 'bg-rose-500/15 text-rose-300 border-rose-500/30' : 'bg-white/5 text-white/70 border-white/10')}>
                {f.playerName} ({teamName(f.team)}) {f.fouls}{f.fouledOut ? ' · FOULED OUT' : ''}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="p-5 rounded-2xl bg-emerald-500/[0.04] border border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-2"><Trophy className="h-4 w-4 text-emerald-400" /><span className="text-sm font-black text-white uppercase">Full time — {summary.result === 'DRAW' ? 'Draw' : `${summary.result === 'HOME' ? match.home.name : match.away.name} win`}</span></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-[9px] font-black uppercase text-white/40 mb-1">By {ruleset.periodLabel.toLowerCase()}</div>
              {summary.periodScores.map(p => <div key={p.period} className="font-mono text-white/70">{ruleset.periodLabel} {p.period}: {p.home}–{p.away}</div>)}
              {summary.leaguePoints && <div className="font-mono text-emerald-300 mt-1">League pts: {summary.leaguePoints.home}–{summary.leaguePoints.away}</div>}
            </div>
            <div>
              <div className="text-[9px] font-black uppercase text-white/40 mb-1">Scorers</div>
              {summary.scorers.length === 0 && <div className="text-white/40">—</div>}
              {summary.scorers.map((s, i) => <div key={i} className="text-white/80">{s.playerName} <span className="text-white/40">({teamName(s.team)})</span> {s.points} pts · {s.count}×</div>)}
            </div>
            <div>
              <div className="text-[9px] font-black uppercase text-white/40 mb-1">Cards</div>
              {summary.cards.length === 0 && <div className="text-white/40">—</div>}
              {summary.cards.map((c, i) => <div key={i} className="text-white/80">{c.label} — {c.playerName} <span className="text-white/40">({teamName(c.team)}, {formatClock(c.matchSec)})</span></div>)}
            </div>
          </div>
        </div>
      )}

      {/* Event log */}
      <div className="p-4 rounded-2xl bg-black/20 border border-white/10">
        <div className="flex items-center gap-2 mb-2"><ListOrdered className="h-4 w-4 text-white/40" /><span className="text-[10px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>Event log</span></div>
        {match.events.length === 0 && <p className="text-xs text-white/40">No events yet.</p>}
        <ul className="space-y-1 max-h-64 overflow-y-auto">
          {[...match.events].reverse().map(e => (
            <li key={e.id} className={cn('text-xs flex gap-3', e.type === 'SCORE' ? 'text-emerald-200' : e.type === 'CARD' ? 'text-amber-200' : 'text-white/60')}>
              <span className="font-mono text-white/30 shrink-0 w-24">{e.period ? `${ruleset.periodLabel[0]}${e.period} ` : ''}{formatClock(e.matchSec - (e.period ? (e.period - 1) * ruleset.periodSec : 0))}</span>
              <span>{describeEvent(match, e)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-2 text-[10px] font-mono text-white/30">
        <Timer className="h-3 w-3" /> Clock and scoreline are derived from the event log; saved to field_sport_matches on every change (kept locally if offline).
        <Flag className="h-3 w-3 ml-auto" />
      </div>
    </div>
  );
}
