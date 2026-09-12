"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Trophy, Shield, MapPin, UserCheck, Layers, AlertTriangle, Radio, FlaskConical, ExternalLink, Activity } from 'lucide-react';
import { D } from '@/lib/design-system';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  SUPPORTED_SPORT_DISCIPLINES, MOCK_SWIMMING_GALA, MOCK_ATHLETICS_MEET, type SportDiscipline,
} from '@/lib/intelligence/multiSportEngine';
import { SwimmingGalaHubView } from '@/components/sports/SwimmingGalaHub';
import { AthleticsMeetHubView } from '@/components/sports/AthleticsMeetHub';
import { FieldSportConsole } from '@/components/sports/FieldSportConsole';
import { useSchoolSelection, DEMO_SCHOOL_ID } from '@/hooks/useSchoolSelection';
import { fieldSportService } from '@/lib/services/fieldSportService';
import { multiSportService, type CricketWindow } from '@/lib/services/multiSportService';
import { facilityEngineService, buildFallbackSnapshot, type FacilitySnapshot } from '@/lib/services/facilityEngineService';
import { detectBookingConflicts, weekOf, toDateKey } from '@/lib/intelligence/turfEngine';
import { FIELD_SPORTS, type FieldSport, type FieldSportMatch } from '@/lib/intelligence/fieldSportEngine';
import { computeChampionship, entriesFromHousePoints, entriesFromFieldSportMatches, entriesFromCricketStandings, type ChampionshipMethod, type ChampionshipRow } from '@/lib/intelligence/championshipEngine';
import { computeStandings } from '@/lib/intelligence/competitionEngine';
import { buildPassports, sessionsFromSwimmingGala, sessionsFromAthleticsMeet, sessionsFromCricket, sessionsFromFieldSportMatches, type AthletePassport } from '@/lib/intelligence/athletePassportEngine';

type Tab = 'engines' | 'passports' | 'facilities' | 'championship';

const isFieldSport = (s: SportDiscipline): s is FieldSport => (FIELD_SPORTS as string[]).includes(s);
const LOAD_TONE = { OPTIMAL: 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30', MODERATE_LOAD: 'text-amber-300 bg-amber-500/10 border-amber-500/30', HIGH_OVERLOAD_RISK: 'text-rose-300 bg-rose-500/10 border-rose-500/30' } as const;

/** "KES 1st XI" / "Nash U15A" → "KES" / "Nash" — good enough to group teams under a school/house. */
export const entrantFromTeamName = (_id: string, name: string) =>
  name.replace(/\s+(1st|2nd|3rd|4th|U-?\d{1,2}\s?[A-D]?|Open|Senior|Junior)\b.*$/i, '').replace(/\s+(XI|XV|Squad|Team)$/i, '').trim() || name;

export function MultiSportPlatform() {
  const { schools, schoolId, school, setSchoolId, isDemo } = useSchoolSelection();
  const [selectedSport, setSelectedSport] = useState<SportDiscipline>('CRICKET');
  const [tab, setTab] = useState<Tab>('engines');
  const [fieldMatches, setFieldMatches] = useState<FieldSportMatch[]>([]);
  const [cricket, setCricket] = useState<CricketWindow>({ appearances: [], bowling: [], results: [], teams: [] });
  const [facility, setFacility] = useState<FacilitySnapshot | null>(null);
  const [method, setMethod] = useState<ChampionshipMethod>('PERCENT_OF_LEADER');
  const [selectedAthlete, setSelectedAthlete] = useState<string | null>(null);
  const nowIso = useMemo(() => new Date().toISOString(), []);
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  // ── Data ──
  useEffect(() => fieldSportService.subscribeList(setFieldMatches, isDemo ? undefined : schoolId ?? undefined), [schoolId, isDemo]);
  useEffect(() => {
    if (!schoolId) return;
    if (isDemo) { setCricket({ appearances: [], bowling: [], results: [], teams: [] }); setFacility(buildFallbackSnapshot(DEMO_SCHOOL_ID)); return; }
    let off = false;
    multiSportService.loadCricketWindow(schoolId).then(w => { if (!off) setCricket(w); });
    facilityEngineService.loadSnapshot(schoolId).then(s => { if (!off) setFacility(s); });
    return () => { off = true; };
  }, [schoolId, isDemo]);

  // ── Passports ──
  const passports = useMemo<AthletePassport[]>(() => buildPassports([
    ...sessionsFromSwimmingGala(MOCK_SWIMMING_GALA),
    ...sessionsFromAthleticsMeet(MOCK_ATHLETICS_MEET),
    ...sessionsFromCricket(cricket.appearances, cricket.bowling),
    ...sessionsFromFieldSportMatches(fieldMatches),
  ], nowIso), [cricket, fieldMatches, nowIso]);
  const athlete = passports.find(p => p.key === selectedAthlete) ?? passports[0] ?? null;

  // ── Facilities ──
  const facilityView = useMemo(() => {
    if (!facility) return null;
    const week = new Set(weekOf(todayKey));
    const conflicts = detectBookingConflicts(facility.bookings).filter(c => c.date >= todayKey);
    const thisWeek = facility.bookings.filter(b => week.has(b.date) && b.status !== 'Cancelled').sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
    const fieldName = (id: string) => facility.fields.find(f => f.id === id)?.name ?? id;
    const conflictIds = new Set(conflicts.flatMap(c => [c.a.id, c.b.id]));
    return { conflicts, thisWeek, fieldName, conflictIds };
  }, [facility, todayKey]);

  // ── Championship ──
  const houseEntries = useMemo(() => [
    ...entriesFromHousePoints('SWIMMING', MOCK_SWIMMING_GALA.houses),
    ...entriesFromHousePoints('ATHLETICS', MOCK_ATHLETICS_MEET.houses),
    ...entriesFromFieldSportMatches(fieldMatches.filter(m => MOCK_SWIMMING_GALA.houses.some(h => [m.home.name, m.away.name].some(n => n.toLowerCase().includes(h.houseName.toLowerCase())))), entrantFromTeamName),
  ], [fieldMatches]);
  const schoolEntries = useMemo(() => [
    ...entriesFromCricketStandings(computeStandings(cricket.results), entrantFromTeamName),
    ...entriesFromFieldSportMatches(fieldMatches, entrantFromTeamName),
  ], [cricket.results, fieldMatches]);
  const houseBoard = useMemo(() => computeChampionship(houseEntries, { method }), [houseEntries, method]);
  const schoolBoard = useMemo(() => computeChampionship(schoolEntries, { method }), [schoolEntries, method]);

  const squadCount = (d: SportDiscipline): string => {
    if (d === 'CRICKET') return isDemo ? '—' : String(cricket.teams.length);
    if (isFieldSport(d)) { const n = new Set(fieldMatches.filter(m => m.sport === d).flatMap(m => [m.home.teamId, m.away.teamId])).size; return n ? String(n) : '—'; }
    return d === 'SWIMMING' ? String(MOCK_SWIMMING_GALA.houses.length) : d === 'ATHLETICS' ? String(MOCK_ATHLETICS_MEET.houses.length) : '—';
  };

  const tabs: Array<{ id: Tab; label: string; icon: React.ReactNode; tone: string }> = [
    { id: 'engines', label: 'Sport Engine Consoles', icon: <Trophy className="w-4 h-4" />, tone: D.emerald },
    { id: 'passports', label: 'Cross-Sport Passports', icon: <UserCheck className="w-4 h-4" />, tone: D.amber },
    { id: 'facilities', label: 'Universal Facility Grid', icon: <MapPin className="w-4 h-4" />, tone: D.indigo },
    { id: 'championship', label: 'Championship Shield', icon: <Shield className="w-4 h-4" />, tone: D.sky },
  ];

  return (
    <div className="space-y-10 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="relative p-8 md:p-10 rounded-[3rem] border overflow-hidden shadow-2xl transition-colors" style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col lg:flex-row lg:items-center gap-8 relative z-10">
          <div className="h-20 w-20 rounded-3xl flex items-center justify-center shadow-inner shrink-0" style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
            <Layers className="h-10 w-10 text-emerald-500 dark:text-emerald-400" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] italic text-emerald-600 dark:text-emerald-400">Unified School Sports Operating System</span>
              <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-[9px] font-mono">{SUPPORTED_SPORT_DISCIPLINES.length} SPORT ENGINES</Badge>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic leading-none" style={{ fontFamily: D.head, color: D.textPrimary }}>
              MULTI-SPORT <span className="text-emerald-500 dark:text-emerald-400">PLATFORM ENGINE</span>
            </h1>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <select value={schoolId ?? ''} onChange={e => setSchoolId(e.target.value)} className="h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-slate-900 dark:text-white text-[11px] font-bold px-3 focus:outline-none" style={{ fontFamily: D.mono }} aria-label="Select school">
                {schools.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-[#0b0b0b] text-slate-900 dark:text-white">{s.name}</option>)}
                <option value={DEMO_SCHOOL_ID} className="bg-white dark:bg-[#0b0b0b] text-slate-900 dark:text-white">Demo dataset</option>
              </select>
              <Badge className={cn('text-[9px] uppercase font-mono gap-1.5', isDemo ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30')}>
                {isDemo ? <FlaskConical className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
                {isDemo ? 'Demo · cricket & facilities from demo data' : `Cricket & facilities live · ${school?.name ?? ''}`}
              </Badge>
              <Badge className="text-[9px] uppercase font-mono bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-white/50 border-slate-300 dark:border-white/10">Gala & meet from their engines · field sports from the consoles</Badge>
            </div>
          </div>
          <div className="lg:ml-auto grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border bg-slate-100/80 dark:bg-black/20 text-center min-w-[120px]" style={{ borderColor: D.border }}>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">Athletes tracked</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{passports.length}</div>
            </div>
            <div className="p-4 rounded-2xl border bg-slate-100/80 dark:bg-black/20 text-center min-w-[120px]" style={{ borderColor: D.border }}>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">Overload risks</span>
              <div className={cn('text-2xl font-black font-mono', passports.some(p => p.loadStatus === 'HIGH_OVERLOAD_RISK') ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400')}>{passports.filter(p => p.loadStatus === 'HIGH_OVERLOAD_RISK').length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Discipline bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {SUPPORTED_SPORT_DISCIPLINES.map(sport => {
          const on = sport.id === selectedSport;
          return (
            <button key={sport.id} onClick={() => { setSelectedSport(sport.id); setTab('engines'); }} className={cn('p-4 rounded-2xl border text-center transition-all', on ? 'bg-emerald-500/20 border-emerald-500 dark:border-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-slate-100/70 dark:bg-black/20 border-slate-200 dark:border-white/10 hover:bg-slate-200/60 dark:hover:bg-white/5')}>
              <div className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white mb-1 truncate">{sport.name.split(' (')[0]}</div>
              <div className="flex items-center justify-center gap-1.5">
                <Badge className="text-[8px] font-mono" style={{ background: on ? sport.color : 'rgba(128,128,128,0.15)', color: on ? 'black' : D.textPrimary }}>{sport.season}</Badge>
                <span className="text-[9px] font-mono text-slate-500 dark:text-white/40">{squadCount(sport.id)} sq</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn('flex items-center gap-3 px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all', tab === t.id ? 'shadow-xl' : 'opacity-60 hover:opacity-100')}
            style={{ background: tab === t.id ? t.tone : 'transparent', color: tab === t.id ? (t.id === 'facilities' ? 'white' : 'black') : D.textPrimary }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── ENGINES ── */}
      {tab === 'engines' && (
        <div className="space-y-8">
          {selectedSport === 'CRICKET' && (
            <div className="p-8 rounded-[2.5rem] border space-y-6 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
              <div className="flex items-center justify-between border-b pb-4 gap-4" style={{ borderColor: D.border }}>
                <div>
                  <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono text-[9px] mb-2">FLAGSHIP ENGINE</Badge>
                  <h3 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white" style={{ fontFamily: D.head }}>CRICKET MATCH & SCORING ENGINE</h3>
                  <p className="text-[11px] text-slate-500 dark:text-white/50 font-mono mt-1">{isDemo ? 'Demo school — no live squads' : `${cricket.teams.length} squads · ${cricket.results.length} completed results in the ladder window · ${cricket.appearances.length} XI appearances this week`}</p>
                </div>
                <Link href="/matches"><Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase">Launch scoring hub</Button></Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[['Live scoring', '/live-scoring', 'Ball-by-ball event stream'], ['Director command', '/director', 'Readiness, staff, workload'], ['Broadcast & media', '/media', 'Overlays & highlight clipper'], ['Turf & facilities', '/facilities', 'Bookings, prep, allocation']].map(([t, href, d]) => (
                  <Link key={href} href={href} className="p-5 rounded-2xl bg-slate-100/70 dark:bg-black/20 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/25 space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400 flex items-center gap-1">{t} <ExternalLink className="h-3 w-3" /></span>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{d}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {selectedSport === 'SWIMMING' && <SwimmingGalaHubView />}
          {selectedSport === 'ATHLETICS' && <AthleticsMeetHubView />}
          {isFieldSport(selectedSport) && <FieldSportConsole sport={selectedSport} schoolId={isDemo ? undefined : schoolId ?? undefined} />}
        </div>
      )}

      {/* ── PASSPORTS ── */}
      {tab === 'passports' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 p-6 rounded-[2.5rem] border space-y-4 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: D.border }}>
              <h3 className="text-lg font-black uppercase italic text-slate-900 dark:text-white" style={{ fontFamily: D.head }}>ATHLETE <span style={{ color: D.amber }}>LOAD</span></h3>
              <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 font-mono text-[9px]">TRAILING 7 DAYS</Badge>
            </div>
            {passports.length === 0 && <p className="text-xs text-slate-500 dark:text-white/40">No sessions in the window yet.</p>}
            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {passports.map(p => (
                <button key={p.key} onClick={() => setSelectedAthlete(p.key)} className={cn('w-full text-left p-3 rounded-xl border transition-all', athlete?.key === p.key ? 'bg-amber-500/15 border-amber-500/60' : 'bg-slate-100/60 dark:bg-black/10 border-slate-200 dark:border-white/10 hover:bg-slate-200/50 dark:hover:bg-white/5')}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.name}</span>
                    <Badge className={cn('text-[9px] font-mono border', LOAD_TONE[p.loadStatus])}>{p.loadScore}%</Badge>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-white/40 mt-0.5 truncate">{p.house ? `${p.house} · ` : ''}{p.disciplines.join(' · ')}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2 p-6 rounded-[2.5rem] border space-y-5 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
            {!athlete ? <p className="text-xs text-slate-500 dark:text-white/40">Select an athlete.</p> : (
              <>
                <div className="flex items-center justify-between border-b pb-3 gap-3" style={{ borderColor: D.border }}>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-zinc-400">Student athlete passport</span>
                    <h3 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white" style={{ fontFamily: D.head }}>{athlete.name}</h3>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-white/40">{athlete.house ? `${athlete.house} House · ` : ''}primary {athlete.primary} · {athlete.acuteLoadAU} AU</p>
                  </div>
                  <Badge className={cn('text-xs font-mono border', LOAD_TONE[athlete.loadStatus])}>{athlete.loadStatus.replace(/_/g, ' ')}</Badge>
                </div>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-white/5 overflow-hidden"><div className={cn('h-full', athlete.loadScore >= 75 ? 'bg-rose-500' : athlete.loadScore >= 50 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${athlete.loadScore}%` }} /></div>
                {athlete.alerts.length > 0 && (
                  <ul className="space-y-1">{athlete.alerts.map(a => <li key={a} className="text-xs text-rose-700 dark:text-rose-200 flex gap-2"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-500" />{a}</li>)}</ul>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {athlete.byDiscipline.map(b => (
                    <div key={b.discipline} className="p-4 rounded-2xl border bg-slate-100/80 dark:bg-black/20 space-y-1" style={{ borderColor: D.border }}>
                      <Badge className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-[9px]">{b.discipline}</Badge>
                      <div className="text-sm font-bold text-slate-900 dark:text-white">{b.sessions} session{b.sessions > 1 ? 's' : ''} · {b.minutes} min</div>
                      <div className="text-[10px] font-mono text-slate-500 dark:text-white/40">{b.loadAU} AU</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40 mb-1" style={{ fontFamily: D.mono }}>Sessions</div>
                  <ul className="space-y-1">{athlete.sessions.map((s, i) => <li key={i} className="text-xs text-slate-700 dark:text-white/70 flex gap-3"><span className="font-mono text-slate-400 dark:text-white/30 w-24 shrink-0">{s.date.slice(0, 10)}</span><span className="font-mono text-slate-500 dark:text-white/40 w-20 shrink-0">{s.discipline}</span><span className="truncate">{s.label}</span><span className="ml-auto font-mono text-slate-500 dark:text-white/40 shrink-0">{s.durationMin}m · RPE {s.intensity}</span></li>)}</ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── FACILITIES ── */}
      {tab === 'facilities' && (
        <div className="p-6 md:p-8 rounded-[2.5rem] border space-y-5 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4" style={{ borderColor: D.border }}>
            <h3 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white" style={{ fontFamily: D.head }}>UNIVERSAL FACILITY & GROUND <span style={{ color: D.indigo }}>GRID</span></h3>
            <Link href="/facilities" className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-300 flex items-center gap-1">Open Turf & Facility Engine <ExternalLink className="h-3 w-3" /></Link>
          </div>
          {!facilityView ? <p className="text-xs text-slate-500 dark:text-white/40">Loading grounds…</p> : (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[['Grounds', facility!.fields.length, ''], ['Bookings this week', facilityView.thisWeek.length, ''], ['Clashes', facilityView.conflicts.length, facilityView.conflicts.length ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400']].map(([l, v, tone]) => (
                  <div key={String(l)} className="p-4 rounded-2xl bg-slate-100/80 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-center"><div className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">{l}</div><div className={cn('text-2xl font-black font-mono', tone || 'text-slate-900 dark:text-white')}>{v}</div></div>
                ))}
              </div>
              {facilityView.conflicts.map(c => (
                <div key={c.id} className="p-4 rounded-xl border bg-rose-500/[0.06] border-rose-500/25 text-xs text-slate-800 dark:text-white/70">
                  <b className="text-slate-900 dark:text-white">{facilityView.fieldName(c.fieldId)}</b> · {c.date}: <b className="text-slate-900 dark:text-white/90">{c.a.title}</b> ({c.a.startTime}–{c.a.endTime}) overlaps <b className="text-slate-900 dark:text-white/90">{c.b.title}</b> ({c.b.startTime}–{c.b.endTime}) · <Badge className="bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30 text-[9px] font-mono">{c.kind.replace(/_/g, ' ')}</Badge>
                </div>
              ))}
              <div className="space-y-1">
                {facilityView.thisWeek.length === 0 && <p className="text-xs text-slate-500 dark:text-white/40">Nothing booked this week.</p>}
                {facilityView.thisWeek.map(b => (
                  <div key={b.id} className={cn('p-3 rounded-xl border flex items-center justify-between gap-3 text-xs', facilityView.conflictIds.has(b.id) ? 'border-rose-500/40 bg-rose-500/[0.04]' : 'border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-black/20')}>
                    <div className="min-w-0"><span className="font-bold text-slate-900 dark:text-white">{b.title}</span><span className="text-slate-500 dark:text-white/40 font-mono"> · {facilityView.fieldName(b.fieldId)} · {b.date} {b.startTime}–{b.endTime}</span></div>
                    <Badge className="bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-white/60 border-slate-300 dark:border-white/10 text-[9px] font-mono shrink-0">{b.type}</Badge>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── CHAMPIONSHIP ── */}
      {tab === 'championship' && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-2xl border" style={{ background: D.surf1, borderColor: D.border }}>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40 mr-2" style={{ fontFamily: D.mono }}>Aggregation</span>
            {(['PERCENT_OF_LEADER', 'RANK_POINTS', 'RAW'] as ChampionshipMethod[]).map(m => (
              <button key={m} onClick={() => setMethod(m)} className={cn('px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border', method === m ? 'bg-sky-500/20 text-sky-700 dark:text-sky-200 border-sky-500/50' : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/50 border-slate-200 dark:border-white/10')}>{m.replace(/_/g, ' ')}</button>
            ))}
            <span className="text-[10px] text-slate-500 dark:text-white/40 ml-auto">{method === 'PERCENT_OF_LEADER' ? 'Each discipline scaled to its leader (100) so a 500-point gala cannot outweigh a 12-point league.' : method === 'RANK_POINTS' ? '10-8-6-5-4-3-2-1 by finishing position per discipline.' : 'Raw points summed.'}</span>
          </div>
          <ChampionshipBoard title="Inter-House Shield" accent={D.sky} rows={houseBoard} note="Swimming gala + athletics meet house points, plus any field-sport match between house teams." />
          <ChampionshipBoard title="Inter-School Ladder" accent={D.emerald} rows={schoolBoard} note={isDemo ? 'Cricket standings need a live school; field-sport results from the consoles appear here.' : 'Cricket league points from completed results (last 120 days) + field-sport league points.'} />
        </div>
      )}
    </div>
  );
}

function ChampionshipBoard({ title, accent, rows, note }: { title: string; accent: string; rows: ChampionshipRow[]; note: string }) {
  const disciplines = Array.from(new Set(rows.flatMap(r => Object.keys(r.byDiscipline)))) as SportDiscipline[];
  return (
    <div className="p-6 md:p-8 rounded-[2.5rem] border space-y-4 shadow-2xl" style={{ background: D.surf1, borderColor: D.border }}>
      <div className="flex items-center justify-between border-b pb-3 gap-3" style={{ borderColor: D.border }}>
        <h3 className="text-xl font-black uppercase italic text-slate-900 dark:text-white" style={{ fontFamily: D.head }}>{title.split(' ').slice(0, -1).join(' ')} <span style={{ color: accent }}>{title.split(' ').slice(-1)}</span></h3>
        <Badge className="bg-slate-200/60 dark:bg-white/5 text-slate-600 dark:text-white/50 border-slate-300 dark:border-white/10 font-mono text-[9px]">{rows.length} entrants · {disciplines.length} disciplines</Badge>
      </div>
      <p className="text-[10px] text-slate-500 dark:text-white/40">{note}</p>
      {rows.length === 0 ? <p className="text-xs text-slate-500 dark:text-white/40 p-4 rounded-xl border border-dashed border-slate-300 dark:border-white/10 text-center">No results to aggregate yet.</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-white/40">
              <th className="text-left p-2">#</th><th className="text-left p-2">Entrant</th>
              {disciplines.map(d => <th key={d} className="text-right p-2">{d}</th>)}
              <th className="text-right p-2">Overall</th>
            </tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.entrant} className="border-t border-slate-200/70 dark:border-white/5">
                  <td className="p-2"><span className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-[11px] font-black text-black font-mono" style={{ background: r.color ?? accent }}>{r.rank}</span></td>
                  <td className="p-2 font-bold text-slate-900 dark:text-white">{r.entrant} {r.disciplineWins > 0 && <span className="text-[9px] font-mono text-slate-500 dark:text-white/40">· {r.disciplineWins} win{r.disciplineWins > 1 ? 's' : ''}</span>}</td>
                  {disciplines.map(d => { const c = r.byDiscipline[d]; return <td key={d} className="p-2 text-right font-mono">{c ? <><span className="text-slate-900 dark:text-white font-bold">{c.contribution}</span> <span className="text-slate-400 dark:text-white/30">({c.raw} · #{c.rank})</span></> : <span className="text-slate-300 dark:text-white/20">—</span>}</td>; })}
                  <td className="p-2 text-right font-black text-sky-600 dark:text-sky-300 font-mono text-sm">{r.overallScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-white/30"><Activity className="h-3 w-3" /> contribution (raw · rank)</div>
    </div>
  );
}
