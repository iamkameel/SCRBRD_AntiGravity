"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { D } from '@/lib/design-system';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Shovel, Leaf, CalendarDays, AlertTriangle, Hammer, ChevronLeft, ChevronRight, RefreshCw, Radio,
  FlaskConical, Loader2, Plus, CheckCircle2, MapPin, Sparkles, Wand2, Clock, ExternalLink,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';
import { facilityEngineService, buildFallbackSnapshot, type FacilitySnapshot } from '@/lib/services/facilityEngineService';
import { createBookingAction } from '@/app/actions/fieldBookingActions';
import { upsertMaintenanceTaskAction, logGroundStatusAction } from '@/app/actions/fieldActions';
import {
  computeTurfHealth, detectBookingConflicts, findUnbookedFixtures, buildPrepSchedule, recommendPitchAllocation,
  bookingsLast7Days, weekOf, weekLoad, toDateKey, addDays, bookingForFixture,
  type UnifiedBooking, type BookingType, type TurfHealth, type FixtureSlot,
} from '@/lib/intelligence/turfEngine';
import type { MaintenanceTask } from '@/types/schema_v4';

const DEMO_SCHOOL_ID = 'demo-school';

const GRADE_TONE: Record<TurfHealth['grade'], string> = {
  A: 'text-[#22c55e]', B: 'text-emerald-300', C: 'text-amber-400', D: 'text-orange-400', F: 'text-rose-400',
};
const TYPE_CHIP: Record<BookingType, string> = {
  Match: 'bg-[#22c55e]/15 text-[#22c55e] border-[#22c55e]/30',
  Practice: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
  Maintenance: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  Event: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30',
};
const PRIORITY_TONE: Record<MaintenanceTask['priority'], string> = {
  Urgent: 'bg-rose-500/15 text-rose-300 border-rose-500/30', High: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
  Medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30', Low: 'bg-white/5 text-white/50 border-white/10',
};

type QuickBook = { fieldId: string; date: string; startTime: string; endTime: string; title: string; type: BookingType; organizer: string; fixtureId?: string };

function dayLabel(key: string): { dow: string; dom: string } {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return { dow: dt.toLocaleDateString('en-ZA', { weekday: 'short' }), dom: dt.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' }) };
}

export function FacilityCommandCenter() {
  const { user } = useAuth();
  const { filters, setFilters } = useDashboard();

  const [schools, setSchools] = useState<{ id: string; name: string; contactEmail?: string }[]>([]);
  const [schoolsLoaded, setSchoolsLoaded] = useState(false);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [snap, setSnap] = useState<FacilitySnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayKey] = useState(() => toDateKey(new Date()));
  const [weekAnchor, setWeekAnchor] = useState(() => toDateKey(new Date()));
  const [quick, setQuick] = useState<QuickBook | null>(null);
  const [logModal, setLogModal] = useState<{ fieldId: string; conditionStatus: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Unplayable'; pitchReadiness: number; outfieldReadiness: number; equipmentReadiness: number; cleggValue: number; moistureLevel: number; grassLength: number; notes: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);


  // ── School resolution (dashboard filter → email domain → first → demo) ──
  useEffect(() => {
    let off = false;
    facilityEngineService.listSchools()
      .then(l => { if (!off) setSchools(l); })
      .catch(() => { })
      .finally(() => { if (!off) setSchoolsLoaded(true); });
    return () => { off = true; };
  }, []);

  useEffect(() => {
    if (!schoolsLoaded || schoolId) return;
    if (filters.schoolId && filters.schoolId !== 'all' && schools.some(s => s.id === filters.schoolId)) { setSchoolId(filters.schoolId); return; }
    const domain = user?.email?.split('@')[1]?.toLowerCase();
    const byDomain = domain ? schools.find(s => s.contactEmail?.split('@')[1]?.toLowerCase() === domain) : undefined;
    setSchoolId(byDomain?.id ?? schools[0]?.id ?? DEMO_SCHOOL_ID);
  }, [schoolsLoaded, schools, filters.schoolId, user?.email, schoolId]);

  const load = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      setSnap(schoolId === DEMO_SCHOOL_ID ? buildFallbackSnapshot(schoolId) : await facilityEngineService.loadSnapshot(schoolId));
    } finally { setLoading(false); }
  }, [schoolId]);
  useEffect(() => { load(); }, [load]);

  // ── Derived intelligence ──
  const fieldName = useCallback((id: string | null) => snap?.fields.find(f => f.id === id)?.name ?? '—', [snap]);

  const health = useMemo<Record<string, TurfHealth>>(() => {
    if (!snap) return {};
    return Object.fromEntries(snap.fields.map(f => [f.id, computeTurfHealth(f, snap.logsByField[f.id] ?? [], bookingsLast7Days(snap.bookings, f.id, todayKey), todayKey)]));
  }, [snap, todayKey]);

  const conflicts = useMemo(() => snap ? detectBookingConflicts(snap.bookings).filter(c => c.date >= todayKey) : [], [snap, todayKey]);
  const unbooked = useMemo(() => snap ? findUnbookedFixtures(snap.fixtures, snap.bookings) : [], [snap]);
  const allocation = useMemo(() => snap ? recommendPitchAllocation(snap.unallocatedFixtures, snap.fields, health, snap.bookings) : [], [snap, health]);
  const prep = useMemo(() => {
    if (!snap) return [];
    return snap.fixtures
      .filter(f => f.fieldId && f.date >= todayKey && f.date <= addDays(todayKey, 10))
      .map(f => buildPrepSchedule(f, snap.fields.find(x => x.id === f.fieldId)!, snap.maintenance, todayKey))
      .sort((a, b) => a.fixture.date.localeCompare(b.fixture.date));
  }, [snap, todayKey]);
  const openTasks = useMemo(() => (snap?.maintenance ?? []).filter(t => t.status !== 'COMPLETED' && t.status !== 'CANCELLED')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate)), [snap]);

  const week = useMemo(() => weekOf(weekAnchor), [weekAnchor]);
  const conflictBookingIds = useMemo(() => new Set(conflicts.flatMap(c => [c.a.id, c.b.id])), [conflicts]);

  const kpis = useMemo(() => {
    const scores = Object.values(health).map(h => h.score);
    return {
      fields: snap?.fields.length ?? 0,
      avg: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      matchReady: Object.values(health).filter(h => h.grade === 'A' || h.grade === 'B').length,
      issues: conflicts.length + unbooked.length + (snap?.unallocatedFixtures.length ?? 0),
      overdue: openTasks.filter(t => t.dueDate < todayKey).length,
    };
  }, [health, conflicts, unbooked, snap, openTasks, todayKey]);

  // ── Actions ──
  const isDemo = snap?.source !== 'live'; // fallback or error → demo dataset, nothing persists
  const isError = snap?.source === 'error';

  const addLocalBooking = (b: Omit<UnifiedBooking, 'id'>) =>
    setSnap(prev => prev && { ...prev, bookings: [...prev.bookings, { ...b, id: `local-${Date.now()}` }] });

  const submitBooking = async (q: QuickBook) => {
    if (!snap) return;
    const payload: Omit<UnifiedBooking, 'id'> = { ...q, status: 'Confirmed', source: q.fixtureId ? 'fixture' : 'field' };
    if (isDemo) { addLocalBooking(payload); toast.info('Demo dataset — booking kept locally.'); setQuick(null); return; }
    setBusy('book');
    try {
      const res = await createBookingAction(q.fieldId, { date: q.date, startTime: q.startTime, endTime: q.endTime, title: q.title, organizer: q.organizer, type: q.type, status: 'Confirmed', fixtureId: q.fixtureId });
      if (!res.success) throw new Error(res.error);
      toast.success(`Booked ${fieldName(q.fieldId)} · ${q.date} ${q.startTime}–${q.endTime}`);
      setQuick(null);
      load();
    } catch (e) {
      toast.error(`Booking failed: ${(e as Error).message}`);
    } finally { setBusy(null); }
  };

  const bookFixture = (f: FixtureSlot, fieldId = f.fieldId) => {
    const b = bookingForFixture(f, fieldId);
    if (!b) return;
    setQuick({ fieldId: b.fieldId, date: b.date, startTime: b.startTime, endTime: b.endTime, title: b.title, type: 'Match', organizer: 'Fixtures', fixtureId: f.matchId });
  };

  const applyAllocation = async (f: FixtureSlot, fieldId: string) => {
    if (!snap) return;
    if (isDemo) {
      setSnap(prev => prev && {
        ...prev,
        unallocatedFixtures: prev.unallocatedFixtures.filter(x => x.matchId !== f.matchId),
        fixtures: [...prev.fixtures, { ...f, fieldId }],
        bookings: [...prev.bookings, { ...bookingForFixture(f, fieldId)!, id: `local-${Date.now()}` }],
      });
      toast.info(`Demo — ${f.title} placed on ${fieldName(fieldId)} locally.`);
      return;
    }
    setBusy(f.matchId);
    try {
      await facilityEngineService.assignFixtureToField(f.matchId, fieldId);
      const b = bookingForFixture(f, fieldId)!;
      const res = await createBookingAction(fieldId, { date: b.date, startTime: b.startTime, endTime: b.endTime, title: b.title, organizer: 'Fixtures', type: 'Match', status: 'Confirmed', fixtureId: f.matchId });
      if (!res.success) throw new Error(res.error);
      toast.success(`${f.title} → ${fieldName(fieldId)} (booked)`);
      load();
    } catch (e) {
      toast.error(`Could not allocate: ${(e as Error).message}`);
    } finally { setBusy(null); }
  };

  const completeTask = async (t: MaintenanceTask) => {
    if (!snap) return;
    const done = { ...t, status: 'COMPLETED' as const, completedAt: new Date().toISOString() };
    setSnap(prev => prev && { ...prev, maintenance: prev.maintenance.map(x => x.id === t.id ? done : x) });
    if (isDemo) return;
    const res = await upsertMaintenanceTaskAction({ id: t.id, status: 'COMPLETED', completedAt: done.completedAt } as Partial<MaintenanceTask>);
    if (!res.success) { toast.error('Could not update task'); load(); } else toast.success(`Completed: ${t.title}`);
  };

  // ── Render ──
  if (!snap) {
    return (
      <div className="rounded-[2.5rem] border border-white/10 bg-[#080808] p-10 flex items-center gap-4 text-white/60">
        <Loader2 className="h-5 w-5 animate-spin text-[#22c55e]" />
        <span className="text-xs font-black uppercase tracking-widest" style={{ fontFamily: D.mono }}>Surveying grounds…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ─── HEADER ─── */}
      <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#080808] p-8 md:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.15)_0%,transparent_60%)]" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[#22c55e]"><Shovel className="h-6 w-6" /></div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#22c55e]" style={{ fontFamily: D.mono }}>Grounds Operations</span>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter" style={{ fontFamily: D.head }}>
                  Turf & Facility <span className="text-white/40">Engine</span>
                </h1>
              </div>
            </div>
            <p className="text-xs text-white/50 max-w-xl font-medium">
              Turf health across every ground, booking clashes, fixtures with no booking, pitch-prep countdowns and wear-balanced allocation.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <select
                value={schoolId ?? ''} onChange={e => { setSchoolId(e.target.value); if (e.target.value !== DEMO_SCHOOL_ID) setFilters({ schoolId: e.target.value }); }}
                className="h-8 rounded-lg bg-white/5 border border-white/10 text-white text-[11px] font-bold px-3 focus:outline-none focus:border-[#22c55e]/50" style={{ fontFamily: D.mono }} aria-label="Select school"
              >
                {schools.map(s => <option key={s.id} value={s.id} className="bg-[#0b0b0b]">{s.name}</option>)}
                <option value={DEMO_SCHOOL_ID} className="bg-[#0b0b0b]">Demo dataset</option>
              </select>
              <Badge title={snap.error} className={cn('text-[9px] uppercase font-mono gap-1.5', isError ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' : isDemo ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30')}>
                {isError ? <AlertTriangle className="h-3 w-3" /> : isDemo ? <FlaskConical className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
                {isError ? 'Firestore error — showing demo data' : isDemo ? 'Demo data — no fields for this school' : 'Live'}
              </Badge>
              <button onClick={load} disabled={loading} className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50" style={{ fontFamily: D.mono }}>
                <RefreshCw className={cn('h-3 w-3', loading && 'animate-spin')} /> Refresh
              </button>
            </div>
            {isError && <p role="alert" className="text-[10px] font-mono text-rose-300/90 pt-1">{snap.error}</p>}
          </div>
          <Button onClick={() => setQuick({ fieldId: snap.fields[0]?.id ?? '', date: todayKey, startTime: '15:00', endTime: '17:00', title: '', type: 'Practice', organizer: '' })}
            className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-black uppercase tracking-widest text-[10px] rounded-full px-6 h-10 shadow-[0_0_25px_rgba(34,197,94,0.3)]">
            <Plus className="h-3.5 w-3.5 mr-2" /> New Booking
          </Button>
        </div>

        {/* KPIs */}
        <div className={cn('grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-8 border-t border-white/[0.08]', loading && 'opacity-50')}>
          {[
            { label: 'Grounds', value: kpis.fields, sub: `${kpis.matchReady} match-ready`, icon: <MapPin className="h-4 w-4 text-[#22c55e]" /> },
            { label: 'Avg Turf Health', value: `${kpis.avg}`, sub: `Avg grade ${kpis.avg ? (kpis.avg >= 90 ? 'A' : kpis.avg >= 80 ? 'B' : kpis.avg >= 65 ? 'C' : kpis.avg >= 50 ? 'D' : 'F') : '—'}`, icon: <Leaf className="h-4 w-4 text-[#22c55e]" /> },
            { label: 'Booking Issues', value: kpis.issues, sub: `${conflicts.length} clashes · ${unbooked.length} unbooked · ${snap.unallocatedFixtures.length} unallocated`, icon: <AlertTriangle className={cn('h-4 w-4', kpis.issues ? 'text-rose-400' : 'text-white/30')} />, tone: kpis.issues ? 'text-rose-400' : 'text-white' },
            { label: 'Fixtures (14d)', value: snap.fixtures.length + snap.unallocatedFixtures.length, sub: `${prep.length} in prep window`, icon: <CalendarDays className="h-4 w-4 text-indigo-400" /> },
            { label: 'Open Maintenance', value: openTasks.length, sub: `${kpis.overdue} overdue`, icon: <Hammer className={cn('h-4 w-4', kpis.overdue ? 'text-amber-400' : 'text-white/30')} />, tone: kpis.overdue ? 'text-amber-400' : 'text-white' },
          ].map(k => (
            <div key={k.label} className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
              <div className="flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>{k.label}</span>{k.icon}</div>
              <p className={cn('text-3xl font-black mt-2', k.tone ?? 'text-white')} style={{ fontFamily: D.head }}>{k.value}</p>
              <p className="text-[10px] font-medium text-white/40 mt-1">{k.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── TURF HEALTH GRID ─── */}
      <section className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-6 md:p-8 space-y-5">
        <div className="flex items-center gap-2">
          <Leaf className="h-4 w-4 text-[#22c55e]" />
          <h2 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: D.head }}>TURF <span className="text-[#22c55e] italic">HEALTH</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {snap.fields.map(f => {
            const h = health[f.id];
            const wk = weekLoad(snap.bookings, f.id, week);
            const next = snap.fixtures.filter(x => x.fieldId === f.id && x.date >= todayKey).sort((a, b) => a.date.localeCompare(b.date))[0];
            return (
              <div key={f.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{f.name}</h3>
                    <p className="text-[10px] text-white/40 font-mono truncate">{f.pitchType ?? 'Turf'} · {f.fieldSize ?? '—'}{f.floodlights ? ' · Lights' : ''}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={cn('text-3xl font-black leading-none', GRADE_TONE[h.grade])} style={{ fontFamily: D.head }}>{h.score}</div>
                    <div className={cn('text-[10px] font-black uppercase', GRADE_TONE[h.grade])}>Grade {h.grade}</div>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden"><div className={cn('h-full rounded-full', h.grade === 'A' || h.grade === 'B' ? 'bg-[#22c55e]' : h.grade === 'C' ? 'bg-amber-400' : 'bg-rose-400')} style={{ width: `${h.score}%` }} /></div>
                <p className="text-[11px] font-bold text-white/70">{h.label}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {h.factors.filter(x => ['condition', 'pitch', 'moisture', 'freshness', 'wear', 'outfield'].includes(x.key)).map(x => (
                    <div key={x.key} className="p-1.5 rounded-lg bg-black/40 border border-white/5 text-center" title={x.note}>
                      <div className="text-[7px] font-black uppercase text-white/30 truncate" style={{ fontFamily: D.mono }}>{x.label.split(' ')[0]}</div>
                      <div className={cn('text-[11px] font-bold', x.score >= 80 ? 'text-white' : x.score >= 60 ? 'text-amber-400' : 'text-rose-400')}>{x.score}</div>
                    </div>
                  ))}
                </div>
                {h.risks.length > 0 && (
                  <ul className="space-y-1">{h.risks.slice(0, 2).map(r => <li key={r} className="text-[10px] text-rose-300/90 flex gap-1.5"><AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />{r}</li>)}</ul>
                )}
                <div className="flex items-center justify-between text-[10px] font-mono text-white/40 pt-2 border-t border-white/5">
                  <span>{wk.count} bookings · {wk.hours}h this week</span>
                  {next ? <span className="text-white/60">Next: {dayLabel(next.date).dow} {dayLabel(next.date).dom}</span> : <span>No fixture</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setLogModal({
                    fieldId: f.id,
                    conditionStatus: 'Excellent',
                    pitchReadiness: h.factors.find(x => x.key === 'pitch')?.score ?? 85,
                    outfieldReadiness: h.factors.find(x => x.key === 'outfield')?.score ?? 90,
                    equipmentReadiness: 95,
                    cleggValue: 88,
                    moistureLevel: 18,
                    grassLength: 6,
                    notes: ''
                  })} className="flex-1 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1"><FlaskConical className="h-3 w-3" /> Log Pitch</button>
                  <button onClick={() => setQuick({ fieldId: f.id, date: todayKey, startTime: '15:00', endTime: '17:00', title: '', type: 'Practice', organizer: '' })} className="flex-1 h-8 rounded-lg bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1"><Plus className="h-3 w-3" /> Book</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── WEEK BOOKING GRID ─── */}
      <section className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-6 md:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-indigo-400" />
            <h2 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: D.head }}>BOOKING <span className="text-indigo-400 italic">GRID</span></h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekAnchor(addDays(weekAnchor, -7))} className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white flex items-center justify-center"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setWeekAnchor(todayKey)} className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase" style={{ fontFamily: D.mono }}>{dayLabel(week[0]).dom} – {dayLabel(week[6]).dom}</button>
            <button onClick={() => setWeekAnchor(addDays(weekAnchor, 7))} className="h-8 w-8 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white flex items-center justify-center"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[860px] grid" style={{ gridTemplateColumns: '180px repeat(7, minmax(0, 1fr))' }}>
            <div />
            {week.map(d => { const l = dayLabel(d); const isToday = d === todayKey; return (
              <div key={d} className={cn('px-2 pb-2 text-center', isToday && 'text-[#22c55e]')}>
                <div className="text-[9px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>{l.dow}</div>
                <div className={cn('text-xs font-bold', isToday ? 'text-[#22c55e]' : 'text-white/70')}>{l.dom}</div>
              </div>
            ); })}
            {snap.fields.map(f => (
              <div key={f.id} className="contents">
                <div className="p-2 border-t border-white/5 text-xs font-bold text-white/80 truncate flex items-center gap-2">
                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', health[f.id].grade <= 'B' ? 'bg-[#22c55e]' : health[f.id].grade === 'C' ? 'bg-amber-400' : 'bg-rose-400')} />
                  <span className="truncate">{f.name}</span>
                </div>
                {week.map(d => {
                  const cell = snap.bookings.filter(b => b.fieldId === f.id && b.date === d && b.status !== 'Cancelled').sort((a, b) => a.startTime.localeCompare(b.startTime));
                  return (
                    <div key={d} onClick={() => setQuick({ fieldId: f.id, date: d, startTime: '15:00', endTime: '17:00', title: '', type: 'Practice', organizer: '' })}
                      className="p-1 border-t border-l border-white/5 min-h-[56px] space-y-1 cursor-pointer hover:bg-white/[0.02]">
                      {cell.map(b => (
                        <div key={b.id} onClick={e => e.stopPropagation()} title={`${b.title}\n${b.startTime}–${b.endTime}${b.organizer ? `\n${b.organizer}` : ''}`}
                          className={cn('px-1.5 py-1 rounded-md border text-[9px] leading-tight', TYPE_CHIP[b.type], conflictBookingIds.has(b.id) && 'ring-1 ring-rose-400')}>
                          <div className="font-mono opacity-80">{b.startTime}–{b.endTime}</div>
                          <div className="font-bold truncate">{b.title}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-[9px] font-mono">
          {(Object.keys(TYPE_CHIP) as BookingType[]).map(t => <span key={t} className={cn('px-2 py-0.5 rounded border', TYPE_CHIP[t])}>{t}</span>)}
          <span className="px-2 py-0.5 rounded border border-rose-400 text-rose-300">ring = clash</span>
        </div>
      </section>

      {/* ─── ISSUES + ALLOCATION ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight" style={{ fontFamily: D.head }}>CLASHES & <span className="text-rose-400 italic">GAPS</span></h3>
            </div>
            <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 uppercase font-mono text-[9px]">{conflicts.length + unbooked.length} issues</Badge>
          </div>
          {conflicts.length === 0 && unbooked.length === 0 && <p className="text-xs text-white/40 p-4 rounded-xl border border-dashed border-white/10 text-center">No booking clashes and every fixture is booked.</p>}
          {conflicts.map(c => (
            <div key={c.id} className={cn('p-4 rounded-xl border space-y-1.5', c.severity === 'HIGH' ? 'bg-rose-500/[0.04] border-rose-500/25' : 'bg-amber-500/[0.04] border-amber-500/25')}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-white">{fieldName(c.fieldId)} · {dayLabel(c.date).dow} {dayLabel(c.date).dom}</span>
                <Badge className={cn('text-[9px] uppercase font-mono', c.severity === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30')}>{c.kind.replace(/_/g, ' ')}</Badge>
              </div>
              <p className="text-xs text-white/60"><b className="text-white/80">{c.a.title}</b> ({c.a.startTime}–{c.a.endTime}) overlaps <b className="text-white/80">{c.b.title}</b> ({c.b.startTime}–{c.b.endTime}) by {c.overlapMinutes} min.</p>
              <p className="text-[10px] text-white/40 font-mono">{c.kind === 'MAINTENANCE_DURING_MATCH' ? 'Move the maintenance window or the match will start on an unprepared surface.' : c.kind === 'DOUBLE_MATCH' ? 'Two matches cannot share a square — reallocate one.' : 'Shorten or move one of the sessions.'}</p>
            </div>
          ))}
          {unbooked.map(f => (
            <div key={f.matchId} className="p-4 rounded-xl border bg-indigo-500/[0.04] border-indigo-500/25 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{f.title}</div>
                <div className="text-[10px] text-white/50 font-mono">{fieldName(f.fieldId)} · {dayLabel(f.date).dow} {dayLabel(f.date).dom} · {f.startTime}–{f.endTime} · no booking holds the ground</div>
              </div>
              <Button size="sm" onClick={() => bookFixture(f)} className="h-8 rounded-lg bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 hover:bg-indigo-500/30 text-[10px] font-black uppercase shrink-0"><CheckCircle2 className="h-3 w-3 mr-1" /> Book it</Button>
            </div>
          ))}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wand2 className="h-4 w-4 text-[#22c55e]" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight" style={{ fontFamily: D.head }}>PITCH <span className="text-[#22c55e] italic">ALLOCATION</span></h3>
            </div>
            <Badge className="bg-white/5 text-white/50 border-white/10 uppercase font-mono text-[9px]">{snap.unallocatedFixtures.length} unallocated</Badge>
          </div>
          <p className="text-[10px] text-white/40">Home fixtures with no ground yet, ranked by turf health, existing load (max 3 matches/ground/week), rest days and floodlights.</p>
          {allocation.length === 0 && <p className="text-xs text-white/40 p-4 rounded-xl border border-dashed border-white/10 text-center">Every home fixture in the next 14 days has a ground.</p>}
          {allocation.map(r => (
            <div key={r.fixture.matchId} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{r.fixture.title}</div>
                  <div className="text-[10px] text-white/50 font-mono">{dayLabel(r.fixture.date).dow} {dayLabel(r.fixture.date).dom} · {r.fixture.startTime}–{r.fixture.endTime}</div>
                </div>
                {r.recommendedFieldId ? (
                  <Button size="sm" disabled={busy === r.fixture.matchId} onClick={() => applyAllocation(r.fixture, r.recommendedFieldId!)} className="h-8 rounded-lg bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 hover:bg-[#22c55e]/25 text-[10px] font-black uppercase shrink-0">
                    {busy === r.fixture.matchId ? <Loader2 className="h-3 w-3 animate-spin" /> : <><Sparkles className="h-3 w-3 mr-1" /> {fieldName(r.recommendedFieldId)}</>}
                  </Button>
                ) : <Badge className="bg-rose-500/10 text-rose-300 border-rose-500/30 text-[9px] uppercase font-mono">No ground</Badge>}
              </div>
              <p className="text-[10px] text-white/50">{r.reason}</p>
              {r.alternatives.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {r.alternatives.map(a => (
                    <button key={a.fieldId} disabled={a.score < 0 || busy === r.fixture.matchId} onClick={() => applyAllocation(r.fixture, a.fieldId)} title={a.reason}
                      className={cn('px-2 py-0.5 rounded border text-[9px] font-mono', a.score < 0 ? 'border-white/5 text-white/25 line-through' : 'border-white/10 text-white/60 hover:text-white')}>
                      {fieldName(a.fieldId)}{a.score >= 0 ? ` · ${Math.round(a.score)}` : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      </div>

      {/* ─── PREP COUNTDOWN + MAINTENANCE ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <h3 className="text-lg font-black text-white uppercase tracking-tight" style={{ fontFamily: D.head }}>PITCH PREP <span className="text-amber-400 italic">COUNTDOWN</span></h3>
          </div>
          {prep.length === 0 && <p className="text-xs text-white/40 p-4 rounded-xl border border-dashed border-white/10 text-center">No fixtures on your grounds in the next 10 days.</p>}
          {prep.map(s => (
            <div key={s.fixture.matchId} className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white truncate">{s.fixture.title}</div>
                  <div className="text-[10px] text-white/50 font-mono">{fieldName(s.fieldId)} · {dayLabel(s.fixture.date).dow} {dayLabel(s.fixture.date).dom}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className={cn('text-xl font-black', s.overdueCount ? 'text-rose-400' : s.completion === 100 ? 'text-[#22c55e]' : 'text-amber-400')} style={{ fontFamily: D.head }}>{s.completion}%</div>
                  {s.overdueCount > 0 && <div className="text-[9px] font-black uppercase text-rose-400">{s.overdueCount} overdue</div>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {s.tasks.map(t => (
                  <div key={t.key} className={cn('px-2 py-1.5 rounded-lg border text-[10px] flex items-center gap-2',
                    t.status === 'DONE' ? 'border-[#22c55e]/20 text-white/40 line-through' : t.status === 'OVERDUE' ? 'border-rose-500/30 text-rose-300 bg-rose-500/[0.04]' : t.status === 'DUE_TODAY' ? 'border-amber-500/30 text-amber-300 bg-amber-500/[0.04]' : 'border-white/5 text-white/60')}>
                    {t.status === 'DONE' ? <CheckCircle2 className="h-3 w-3 text-[#22c55e] shrink-0" /> : <span className="w-3 h-3 rounded-full border border-current shrink-0" />}
                    <span className="truncate flex-1">{t.label}</span>
                    <span className="font-mono opacity-60 shrink-0">T-{t.offsetDays}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hammer className="h-4 w-4 text-amber-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight" style={{ fontFamily: D.head }}>MAINTENANCE <span className="text-amber-400 italic">QUEUE</span></h3>
            </div>
            <Badge className="bg-white/5 text-white/50 border-white/10 uppercase font-mono text-[9px]">{openTasks.length} open</Badge>
          </div>
          {openTasks.length === 0 && <p className="text-xs text-white/40 p-4 rounded-xl border border-dashed border-white/10 text-center">Queue is clear.</p>}
          {openTasks.map(t => {
            const overdue = t.dueDate < todayKey;
            return (
              <div key={t.id} className={cn('p-3 rounded-xl border flex items-center gap-3', overdue ? 'bg-rose-500/[0.03] border-rose-500/20' : 'bg-white/[0.02] border-white/10')}>
                <button onClick={() => completeTask(t)} className="w-5 h-5 rounded-md border border-white/20 hover:border-[#22c55e] hover:bg-[#22c55e]/20 shrink-0" aria-label="Mark complete" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white truncate">{t.title}</span>
                    <Badge className={cn('text-[9px] uppercase font-mono', PRIORITY_TONE[t.priority])}>{t.priority}</Badge>
                    {t.status === 'IN_PROGRESS' && <Badge className="text-[9px] uppercase font-mono bg-indigo-500/15 text-indigo-300 border-indigo-500/30">In progress</Badge>}
                  </div>
                  <div className={cn('text-[10px] font-mono', overdue ? 'text-rose-300' : 'text-white/40')}>{fieldName(t.fieldId)} · {t.taskType} · due {dayLabel(t.dueDate).dow} {dayLabel(t.dueDate).dom}{overdue ? ' · OVERDUE' : ''}</div>
                </div>
              </div>
            );
          })}
        </section>
      </div>

      {/* ─── QUICK BOOK DIALOG ─── */}
      <Dialog open={!!quick} onOpenChange={o => !o && setQuick(null)}>
        <DialogContent className="bg-[#0b0b0b] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: D.head }}>{quick?.fixtureId ? 'Book ground for fixture' : 'New booking'}</DialogTitle>
            <DialogDescription className="text-white/50 text-xs">Conflicts are checked against everything already on the grid.</DialogDescription>
          </DialogHeader>
          {quick && (() => {
            const clash = snap.bookings.filter(b => b.fieldId === quick.fieldId && b.date === quick.date && b.status !== 'Cancelled' && b.startTime < quick.endTime && quick.startTime < b.endTime);
            const inputCls = 'h-9 w-full rounded-lg bg-white/5 border border-white/10 px-3 text-xs text-white focus:outline-none focus:border-[#22c55e]/50';
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 col-span-2"><span className="text-[9px] font-black uppercase text-white/40" style={{ fontFamily: D.mono }}>Ground</span>
                    <select value={quick.fieldId} onChange={e => setQuick({ ...quick, fieldId: e.target.value })} className={inputCls}>{snap.fields.map(f => <option key={f.id} value={f.id} className="bg-[#0b0b0b]">{f.name} · {health[f.id].grade}</option>)}</select></label>
                  <label className="space-y-1 col-span-2"><span className="text-[9px] font-black uppercase text-white/40" style={{ fontFamily: D.mono }}>Title</span>
                    <input value={quick.title} onChange={e => setQuick({ ...quick, title: e.target.value })} placeholder="U15A practice" className={inputCls} /></label>
                  <label className="space-y-1"><span className="text-[9px] font-black uppercase text-white/40" style={{ fontFamily: D.mono }}>Date</span>
                    <input type="date" value={quick.date} onChange={e => setQuick({ ...quick, date: e.target.value })} className={inputCls} /></label>
                  <label className="space-y-1"><span className="text-[9px] font-black uppercase text-white/40" style={{ fontFamily: D.mono }}>Type</span>
                    <select value={quick.type} onChange={e => setQuick({ ...quick, type: e.target.value as BookingType })} className={inputCls}>{(Object.keys(TYPE_CHIP) as BookingType[]).map(t => <option key={t} value={t} className="bg-[#0b0b0b]">{t}</option>)}</select></label>
                  <label className="space-y-1"><span className="text-[9px] font-black uppercase text-white/40" style={{ fontFamily: D.mono }}>Start</span>
                    <input type="time" value={quick.startTime} onChange={e => setQuick({ ...quick, startTime: e.target.value })} className={inputCls} /></label>
                  <label className="space-y-1"><span className="text-[9px] font-black uppercase text-white/40" style={{ fontFamily: D.mono }}>End</span>
                    <input type="time" value={quick.endTime} onChange={e => setQuick({ ...quick, endTime: e.target.value })} className={inputCls} /></label>
                  <label className="space-y-1 col-span-2"><span className="text-[9px] font-black uppercase text-white/40" style={{ fontFamily: D.mono }}>Organiser</span>
                    <input value={quick.organizer} onChange={e => setQuick({ ...quick, organizer: e.target.value })} placeholder="Coach / department" className={inputCls} /></label>
                </div>
                {clash.length > 0 && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-200 space-y-0.5">
                    <div className="font-bold flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> Overlaps {clash.length} existing booking{clash.length > 1 ? 's' : ''}</div>
                    {clash.map(b => <div key={b.id} className="font-mono opacity-80">{b.startTime}–{b.endTime} {b.title}</div>)}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-1">
                  <Button variant="ghost" onClick={() => setQuick(null)} className="text-white/60">Cancel</Button>
                  <Button disabled={!quick.title || !quick.fieldId || quick.startTime >= quick.endTime || busy === 'book'} onClick={() => submitBooking(quick)}
                    className={cn('font-black uppercase text-[10px] tracking-wider', clash.length ? 'bg-rose-500 hover:bg-rose-400 text-white' : 'bg-[#22c55e] hover:bg-[#16a34a] text-black')}>
                    {busy === 'book' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : clash.length ? 'Book anyway' : 'Confirm booking'}
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Groundskeeper Telemetry Modal */}
      <Dialog open={!!logModal} onOpenChange={o => !o && setLogModal(null)}>
        <DialogContent className="bg-[#0b0b0b] border-white/10 text-white sm:max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: D.head }}>Log Groundskeeper Telemetry</DialogTitle>
            <DialogDescription className="text-white/50 text-xs">
              Record Clegg Impact Value, moisture level, grass height, and readiness to update field health and match readiness protocols.
            </DialogDescription>
          </DialogHeader>
          {logModal && (() => {
            const inputCls = 'h-9 w-full rounded-lg bg-white/5 border border-white/10 px-3 text-xs text-white focus:outline-none focus:border-amber-500/50';
            const fName = snap.fields.find(f => f.id === logModal.fieldId)?.name ?? 'Field';
            return (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold block">{fName}</span>
                    <span className="text-[10px] text-amber-300/70 font-mono">Current Status: {logModal.conditionStatus}</span>
                  </div>
                  <FlaskConical className="h-5 w-5 text-amber-400" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1 col-span-2">
                    <span className="text-[9px] font-black uppercase text-white/40" style={{ fontFamily: D.mono }}>Condition Status</span>
                    <select value={logModal.conditionStatus} onChange={e => setLogModal({ ...logModal, conditionStatus: e.target.value as any })} className={inputCls}>
                      <option value="Excellent" className="bg-[#0b0b0b]">Excellent (Match-Ready)</option>
                      <option value="Good" className="bg-[#0b0b0b]">Good (Playable)</option>
                      <option value="Fair" className="bg-[#0b0b0b]">Fair (Inspection Required)</option>
                      <option value="Poor" className="bg-[#0b0b0b]">Poor (Heavy Wear)</option>
                      <option value="Unplayable" className="bg-[#0b0b0b]">Unplayable (Waterlogged / Damaged)</option>
                    </select>
                  </label>
                  <label className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-white/40" style={{ fontFamily: D.mono }}>Clegg Impact Value (CIV)</span>
                    <input type="number" value={logModal.cleggValue} onChange={e => setLogModal({ ...logModal, cleggValue: Number(e.target.value) })} className={inputCls} placeholder="85-95" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-white/40" style={{ fontFamily: D.mono }}>Moisture Content (%)</span>
                    <input type="number" value={logModal.moistureLevel} onChange={e => setLogModal({ ...logModal, moistureLevel: Number(e.target.value) })} className={inputCls} placeholder="12-22%" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-white/40" style={{ fontFamily: D.mono }}>Grass Cut Height (mm)</span>
                    <input type="number" value={logModal.grassLength} onChange={e => setLogModal({ ...logModal, grassLength: Number(e.target.value) })} className={inputCls} placeholder="6mm" />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-white/40" style={{ fontFamily: D.mono }}>Pitch Readiness Score (0-100)</span>
                    <input type="number" value={logModal.pitchReadiness} onChange={e => setLogModal({ ...logModal, pitchReadiness: Number(e.target.value) })} className={inputCls} />
                  </label>
                  <label className="space-y-1 col-span-2">
                    <span className="text-[9px] font-black uppercase text-white/40" style={{ fontFamily: D.mono }}>Groundskeeper & Agronomy Notes</span>
                    <input value={logModal.notes} onChange={e => setLogModal({ ...logModal, notes: e.target.value })} placeholder="e.g., Heavy roller applied; pitch mown to 6mm for weekend 1st XI derby." className={inputCls} />
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                  <Button variant="ghost" onClick={() => setLogModal(null)} className="text-white/60">Cancel</Button>
                  <Button disabled={busy === 'log'} onClick={async () => {
                    setBusy('log');
                    try {
                      const res = await logGroundStatusAction({
                        fieldId: logModal.fieldId,
                        conditionStatus: logModal.conditionStatus,
                        pitchReadiness: logModal.pitchReadiness,
                        outfieldReadiness: logModal.outfieldReadiness,
                        equipmentReadiness: logModal.equipmentReadiness,
                        loggedByPersonId: user?.uid || 'head-groundskeeper-id',
                        moistureLevel: logModal.moistureLevel,
                        grassCover: 90,
                        notes: `[CIV: ${logModal.cleggValue} | Cut: ${logModal.grassLength}mm] ${logModal.notes}`
                      });
                      if (res.success) {
                        toast.success(`Ground status recorded for ${fName}`);
                        setLogModal(null);
                        load();
                      } else {
                        toast.error(res.error || 'Failed to log ground status');
                      }
                    } catch (e: any) {
                      toast.error(e.message || 'Error logging status');
                    } finally {
                      setBusy(null);
                    }
                  }} className="bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-[10px] tracking-wider">
                    {busy === 'log' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Save Telemetry Entry'}
                  </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
