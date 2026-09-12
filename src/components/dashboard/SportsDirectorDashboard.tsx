"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { D } from '@/lib/design-system';
import {
  ShieldCheck,
  Trophy,
  Users,
  AlertTriangle,
  CheckCircle2,
  UserCheck,
  Lock,
  School as SchoolIcon,
  Phone,
  Printer,
  Bell,
  RefreshCw,
  Radio,
  FlaskConical,
  Loader2,
  CalendarX2,
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboard } from '@/contexts/DashboardContext';
import {
  sportsDirectorService,
  buildFallbackSnapshot,
  isJuniorLabel,
  type DirectorSnapshot,
  type TeamReadinessTelemetry,
} from '@/lib/services/sportsDirectorService';

type SchoolOption = { id: string; name: string; abbreviation?: string; contactEmail?: string };
type DivisionFilter = 'ALL' | 'SENIOR' | 'JUNIOR';

const DEMO_SCHOOL_ID = 'demo-school';

const RISK_LABEL: Record<string, string> = {
  BOWLING_OVERLOAD: 'Fast Bowlers Near Cap',
  CONSECUTIVE_MATCHES: 'Players Doubling Up',
  INJURY_REHAB: 'Active Rehab Restrictions',
};

function transportChip(status: TeamReadinessTelemetry['transportStatus']): { label: string; tone: string } {
  switch (status) {
    case 'BOARDED': return { label: 'Boarded · En Route', tone: 'text-[#22c55e]' };
    case 'BOOKED': return { label: 'Booked', tone: 'text-blue-400' };
    case 'NOT_REQUIRED': return { label: 'Home Fixture', tone: 'text-white/60' };
    default: return { label: 'Not Booked', tone: 'text-rose-400' };
  }
}

function groundChip(status: TeamReadinessTelemetry['groundStatus']): { label: string; tone: string } {
  switch (status) {
    case 'CLEARED': return { label: 'Turf Cleared', tone: 'text-[#22c55e]' };
    case 'HOST_MANAGED': return { label: 'Host Venue', tone: 'text-white/60' };
    case 'PREP_IN_PROGRESS': return { label: 'Prep Ongoing', tone: 'text-amber-400' };
    default: return { label: 'No Log', tone: 'text-rose-400' };
  }
}

function selectionChip(status: TeamReadinessTelemetry['squadStatus']): { label: string; tone: string } {
  switch (status) {
    case 'APPROVED': return { label: 'XI Confirmed', tone: 'text-[#22c55e]' };
    case 'PENDING_CONFIRMATION': return { label: 'Pending Sign-off', tone: 'text-amber-400' };
    default: return { label: 'Not Selected', tone: 'text-rose-400' };
  }
}

export function SportsDirectorDashboard() {
  const { user } = useAuth();
  const { filters, setFilters } = useDashboard();

  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [schoolsLoaded, setSchoolsLoaded] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);

  const [snapshot, setSnapshot] = useState<DirectorSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterDivision, setFilterDivision] = useState<DivisionFilter>('ALL');
  const [busyRowId, setBusyRowId] = useState<string | null>(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);

  const actorId = user?.uid ?? 'anonymous';
  const actorName = user?.displayName ?? user?.email ?? 'Sports Director';

  // ── 1. Load schools once ──
  useEffect(() => {
    let cancelled = false;
    sportsDirectorService.listSchools()
      .then(list => { if (!cancelled) setSchools(list as SchoolOption[]); })
      .catch(() => { /* fall through to demo */ })
      .finally(() => { if (!cancelled) setSchoolsLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  // ── 2. Resolve which school to show: dashboard filter → email domain → first → demo ──
  useEffect(() => {
    if (!schoolsLoaded || selectedSchoolId) return;

    if (filters.schoolId && filters.schoolId !== 'all' && schools.some(s => s.id === filters.schoolId)) {
      setSelectedSchoolId(filters.schoolId);
      return;
    }
    const domain = user?.email?.split('@')[1]?.toLowerCase();
    if (domain) {
      const byDomain = schools.find(s => s.contactEmail?.split('@')[1]?.toLowerCase() === domain);
      if (byDomain) { setSelectedSchoolId(byDomain.id); return; }
    }
    setSelectedSchoolId(schools[0]?.id ?? DEMO_SCHOOL_ID);
  }, [schoolsLoaded, schools, filters.schoolId, user?.email, selectedSchoolId]);

  const selectedSchool = useMemo(() => schools.find(s => s.id === selectedSchoolId), [schools, selectedSchoolId]);

  // ── 3. Load the snapshot whenever the school changes ──
  const loadSnapshot = useCallback(async () => {
    if (!selectedSchoolId) return;
    setLoading(true);
    try {
      if (selectedSchoolId === DEMO_SCHOOL_ID) {
        setSnapshot(buildFallbackSnapshot(DEMO_SCHOOL_ID));
      } else {
        setSnapshot(await sportsDirectorService.getExecutiveSnapshot(selectedSchoolId, selectedSchool?.name));
      }
    } finally {
      setLoading(false);
    }
  }, [selectedSchoolId, selectedSchool?.name]);

  useEffect(() => { loadSnapshot(); }, [loadSnapshot]);

  const handleSchoolChange = (id: string) => {
    setSelectedSchoolId(id);
    if (id !== DEMO_SCHOOL_ID) setFilters({ schoolId: id });
  };

  // ── Derived ──
  const metrics = snapshot?.metrics;
  const isFallback = snapshot?.source !== 'live'; // fallback or error → demo dataset, nothing persists
  const isError = snapshot?.source === 'error';

  const filteredTeams = useMemo(() => {
    const rows = snapshot?.readinessGrid ?? [];
    if (filterDivision === 'ALL') return rows;
    return rows.filter(t => {
      const junior = isJuniorLabel(`${t.teamName} ${t.division}`);
      return filterDivision === 'JUNIOR' ? junior : !junior;
    });
  }, [snapshot, filterDivision]);

  const topRiskLabel = useMemo(() => {
    const first = snapshot?.workloadAlerts[0];
    return first ? RISK_LABEL[first.riskType] ?? 'Risks Flagged' : 'No Active Risks';
  }, [snapshot]);

  // ── Actions ──
  const toggleSquadApproval = async (row: TeamReadinessTelemetry) => {
    if (!snapshot) return;
    const approved = row.squadStatus !== 'APPROVED';
    const apply = (grid: TeamReadinessTelemetry[]) =>
      grid.map(r => r.id === row.id ? { ...r, squadStatus: approved ? 'APPROVED' : 'PENDING_CONFIRMATION' } as TeamReadinessTelemetry : r);

    if (isFallback) {
      setSnapshot(prev => prev && { ...prev, readinessGrid: apply(prev.readinessGrid) });
      toast.info('Demo dataset — approval not persisted.');
      return;
    }

    setBusyRowId(row.id);
    const previous = snapshot;
    setSnapshot(prev => prev && { ...prev, readinessGrid: apply(prev.readinessGrid) });
    try {
      await sportsDirectorService.setSquadApproval({
        matchId: row.matchId,
        side: row.side,
        approved,
        schoolId: snapshot.schoolId,
        actorId,
        actorName,
        teamName: row.teamName,
      });
      toast.success(approved ? `${row.teamName} selection locked.` : `${row.teamName} approval revoked.`);
      loadSnapshot(); // re-score with the persisted state
    } catch (err) {
      console.error(err);
      setSnapshot(previous);
      toast.error('Could not update squad approval. Check Firestore permissions.');
    } finally {
      setBusyRowId(null);
    }
  };

  const handleBroadcast = async () => {
    if (!snapshot) return;
    setBroadcasting(true);
    try {
      const result = await sportsDirectorService.broadcastStaffPrompt({ schoolId: snapshot.schoolId, actorId, actorName, snapshot });
      setBroadcastSent(true);
      setTimeout(() => setBroadcastSent(false), 4000);
      toast.success(
        result.outstandingItems.length
          ? `Prompt sent to ${result.recipientCount} staff · ${result.outstandingItems.length} outstanding item(s).`
          : `All-clear sent to ${result.recipientCount} staff.`
      );
    } catch (err) {
      console.error(err);
      toast.error('Broadcast failed.');
    } finally {
      setBroadcasting(false);
    }
  };

  const handleExportBriefing = () => {
    if (!snapshot) return;
    const win = window.open('', '_blank', 'width=1100,height=800');
    if (!win) { toast.error('Pop-up blocked — allow pop-ups to export the briefing.'); return; }
    win.document.open();
    win.document.write(sportsDirectorService.buildBriefingHtml(snapshot));
    win.document.close();
    win.focus();
  };

  // ── Render ──
  if (!snapshot || !metrics) {
    return (
      <div className="rounded-[2.5rem] border border-white/10 bg-[#080808] p-10 flex items-center gap-4 text-white/60">
        <Loader2 className="h-5 w-5 animate-spin text-[#22c55e]" />
        <span className="text-xs font-black uppercase tracking-widest" style={{ fontFamily: D.mono }}>Assembling executive snapshot…</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* ─── EXECUTIVE HEADER STRIP ─── */}
      <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#080808] p-8 md:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.15)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.08)_0%,transparent_50%)]" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[#22c55e]">
                <SchoolIcon className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#22c55e]" style={{ fontFamily: D.mono }}>
                  Institutional Sports Operations
                </span>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter" style={{ fontFamily: D.head }}>
                  {metrics.schoolName} <span className="text-white/40">Director Command</span>
                </h1>
              </div>
            </div>
            <p className="text-xs text-white/50 max-w-xl font-medium">
              Multi-squad operational readiness, safety compliance, coaching staff duty roster, and executive season performance metrics for {metrics.season}.
            </p>

            {/* School selector + data source */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <select
                value={selectedSchoolId ?? ''}
                onChange={e => handleSchoolChange(e.target.value)}
                className="h-8 rounded-lg bg-white/5 border border-white/10 text-white text-[11px] font-bold px-3 focus:outline-none focus:border-[#22c55e]/50"
                style={{ fontFamily: D.mono }}
                aria-label="Select school"
              >
                {schools.map(s => <option key={s.id} value={s.id} className="bg-[#0b0b0b]">{s.name}</option>)}
                <option value={DEMO_SCHOOL_ID} className="bg-[#0b0b0b]">Demo dataset</option>
              </select>

              <Badge
                title={snapshot.error}
                className={`text-[9px] uppercase font-mono gap-1.5 ${isError ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' : isFallback ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/30'}`}
              >
                {isError ? <AlertTriangle className="h-3 w-3" /> : isFallback ? <FlaskConical className="h-3 w-3" /> : <Radio className="h-3 w-3" />}
                {isError ? 'Firestore error — showing demo data' : isFallback ? 'Demo data — no records for this school' : 'Live telemetry'}
              </Badge>

              <button
                onClick={loadSnapshot}
                disabled={loading}
                className="h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 disabled:opacity-50"
                style={{ fontFamily: D.mono }}
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing' : 'Refresh'}
              </button>

              <span className="text-[9px] text-white/30 font-mono">
                {new Date(snapshot.generatedAt).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {isError && (
              <p role="alert" className="text-[10px] font-mono text-rose-300/90 pt-1">{snapshot.error}</p>
            )}
          </div>

          {/* Quick Executive Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleBroadcast}
              disabled={broadcasting}
              className={`rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-widest h-10 transition-all ${
                broadcastSent ? 'bg-[#22c55e] text-black' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
              }`}
            >
              {broadcasting ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Bell className="h-3.5 w-3.5 mr-2 text-[#22c55e]" />}
              {broadcastSent ? 'Broadcast Dispatched!' : 'Broadcast Staff Prompt'}
            </Button>

            <Button
              onClick={handleExportBriefing}
              className="bg-[#22c55e] hover:bg-[#16a34a] text-black font-black uppercase tracking-widest text-[10px] rounded-full px-6 h-10 shadow-[0_0_25px_rgba(34,197,94,0.3)] transition-all"
            >
              <Printer className="h-3.5 w-3.5 mr-2" />
              Export Briefing PDF
            </Button>
          </div>
        </div>

        {/* ─── EXECUTIVE KPI RUNWAY ─── */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/[0.08] transition-opacity ${loading ? 'opacity-50' : ''}`}>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>Active Squads</span>
              <Users className="h-4 w-4 text-[#22c55e]" />
            </div>
            <p className="text-3xl font-black text-white mt-2" style={{ fontFamily: D.head }}>{metrics.totalActiveSquads}</p>
            <p className="text-[10px] font-medium text-white/40 mt-1">{metrics.totalPlayersRegistered} Registered Athletes</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>Institutional Win Rate</span>
              <Trophy className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-3xl font-black text-[#22c55e] mt-2" style={{ fontFamily: D.head }}>{metrics.overallWinRate}%</p>
            <p className="text-[10px] font-bold text-white/50 mt-1">
              {metrics.seasonRecord.wins}W - {metrics.seasonRecord.losses}L - {metrics.seasonRecord.draws}D
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>Weekend Readiness</span>
              <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
            </div>
            <p className="text-3xl font-black text-white mt-2" style={{ fontFamily: D.head }}>{metrics.crossFixtureReadiness}%</p>
            <p className="text-[10px] font-bold text-[#22c55e] mt-1">
              {metrics.clearedFixtures} of {metrics.totalFixtures} Fixtures Cleared
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/40" style={{ fontFamily: D.mono }}>Workload Risks</span>
              <AlertTriangle className={`h-4 w-4 ${metrics.activeWorkloadAlerts ? 'text-rose-400' : 'text-white/30'}`} />
            </div>
            <p className={`text-3xl font-black mt-2 ${metrics.activeWorkloadAlerts ? 'text-rose-400' : 'text-white'}`} style={{ fontFamily: D.head }}>
              {metrics.activeWorkloadAlerts}
            </p>
            <p className={`text-[10px] font-bold mt-1 ${metrics.activeWorkloadAlerts ? 'text-rose-300/80' : 'text-white/40'}`}>{topRiskLabel}</p>
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: MULTI-TEAM OPERATIONAL READINESS MATRIX ─── */}
      <div className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#22c55e]" />
              <h2 className="text-xl font-black text-white uppercase tracking-tight" style={{ fontFamily: D.head }}>
                MULTI-SQUAD MATCH READINESS <span className="text-[#22c55e] italic">MATRIX</span>
              </h2>
            </div>
            <p className="text-xs text-white/40 mt-1">Next fixture per squad — selection, availability, grounds, transport, and staff</p>
          </div>

          <div className="flex items-center gap-2">
            {(['ALL', 'SENIOR', 'JUNIOR'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilterDivision(tab)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                  filterDivision === tab ? 'bg-[#22c55e] text-black shadow-lg shadow-[#22c55e]/20' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'
                }`}
                style={{ fontFamily: D.mono }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className={`space-y-4 transition-opacity ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
          {filteredTeams.length === 0 && (
            <div className="p-8 rounded-2xl border border-dashed border-white/10 text-center space-y-2">
              <CalendarX2 className="h-6 w-6 mx-auto text-white/30" />
              <p className="text-xs font-bold text-white/50">
                {snapshot.readinessGrid.length === 0 ? 'No upcoming fixtures on record for this school.' : 'No squads match this filter.'}
              </p>
            </div>
          )}

          {filteredTeams.map((team) => {
            const isLocked = team.squadStatus === 'APPROVED';
            const isBusy = busyRowId === team.id;
            const sel = selectionChip(team.squadStatus);
            const ground = groundChip(team.groundStatus);
            const transport = transportChip(team.transportStatus);
            const staffGap = team.staffAssigned.umpire === 'Unassigned' || team.staffAssigned.scorer === 'Unassigned' || team.staffAssigned.headCoach === 'Unassigned';
            const scoreTone = team.overallReadinessScore >= 85 ? 'text-[#22c55e]' : team.overallReadinessScore >= 65 ? 'text-amber-400' : 'text-rose-400';

            return (
              <div key={team.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-white text-sm" style={{ fontFamily: D.head }}>
                      {team.teamName.substring(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{team.teamName}</h3>
                        <Badge className="bg-white/5 text-white/50 border-white/10 text-[9px] uppercase font-mono">{team.division}</Badge>
                        {!team.medicalClearance && (
                          <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/30 text-[9px] uppercase font-mono">Medical Flag</Badge>
                        )}
                      </div>
                      <p className="text-xs text-white/40 font-medium mt-0.5">
                        vs {team.opponent} · <span className="text-white/60">{team.venue}</span> ({team.fixtureDate})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-[9px] font-black uppercase tracking-widest text-white/30" style={{ fontFamily: D.mono }}>Readiness Score</div>
                      <div className={`text-xl font-black ${scoreTone}`} style={{ fontFamily: D.head }}>{team.overallReadinessScore}%</div>
                    </div>

                    <Button
                      size="sm"
                      disabled={isBusy}
                      onClick={() => toggleSquadApproval(team)}
                      className={`rounded-xl text-[10px] font-black uppercase tracking-widest px-4 h-9 ${
                        isLocked
                          ? 'bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                      }`}
                    >
                      {isBusy ? (
                        <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                      ) : isLocked ? (
                        <Lock className="h-3 w-3 mr-1.5 text-[#22c55e]" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 mr-1.5 text-amber-300" />
                      )}
                      {isLocked ? 'Squad Locked' : 'Approve Selection'}
                    </Button>
                  </div>
                </div>

                {/* 5-Point Telemetry Status Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/5">
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[8px] font-black text-white/30 uppercase block" style={{ fontFamily: D.mono }}>Selection</span>
                    <span className={`text-[10px] font-bold mt-0.5 block ${sel.tone}`}>{sel.label}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[8px] font-black text-white/30 uppercase block" style={{ fontFamily: D.mono }}>Availability</span>
                    <span className={`text-[10px] font-bold mt-0.5 block ${team.availabilityRate >= 80 ? 'text-white' : 'text-amber-400'}`}>
                      {team.availabilityRate}% Responded
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[8px] font-black text-white/30 uppercase block" style={{ fontFamily: D.mono }}>Ground / Pitch</span>
                    <span className={`text-[10px] font-bold mt-0.5 block ${ground.tone}`}>{ground.label}</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center">
                    <span className="text-[8px] font-black text-white/30 uppercase block" style={{ fontFamily: D.mono }}>Transport</span>
                    <span className={`text-[10px] font-bold mt-0.5 block ${transport.tone}`}>{transport.label}</span>
                  </div>

                  <div
                    className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-center col-span-2 sm:col-span-1"
                    title={`Coach: ${team.staffAssigned.headCoach} · Scorer: ${team.staffAssigned.scorer} · Umpire: ${team.staffAssigned.umpire}`}
                  >
                    <span className="text-[8px] font-black text-white/30 uppercase block" style={{ fontFamily: D.mono }}>Staffing</span>
                    <span className={`text-[10px] font-bold mt-0.5 block ${staffGap ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {staffGap ? 'Action Req.' : 'Staffed'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SECTION 2 & 3: STAFF ROSTER & WORKLOAD WATCHLIST ─── */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transition-opacity ${loading ? 'opacity-50' : ''}`}>
        <div className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-[#22c55e]" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight" style={{ fontFamily: D.head }}>
                STAFF & OFFICIAL <span className="text-[#22c55e] italic">ROSTER</span>
              </h3>
            </div>
            <Badge className="bg-white/5 text-white/50 border-white/10 uppercase font-mono text-[9px]">
              {snapshot.staffRoster.length} ACTIVE STAFF
            </Badge>
          </div>

          <div className="space-y-3">
            {snapshot.staffRoster.length === 0 && (
              <p className="text-xs text-white/40 p-4 rounded-xl border border-dashed border-white/10 text-center">
                No coaches or officials linked to upcoming fixtures.
              </p>
            )}
            {snapshot.staffRoster.map((staff) => (
              <div key={staff.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">{staff.name}</h4>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] uppercase font-mono">{staff.role}</Badge>
                    {staff.status === 'STANDBY' && (
                      <Badge className="bg-white/5 text-white/40 border-white/10 text-[9px] uppercase font-mono">Standby</Badge>
                    )}
                  </div>
                  <p className="text-xs text-white/40 mt-0.5">{staff.teamAssigned} · {staff.contact}</p>
                </div>

                {staff.contact !== '—' && (
                  <a
                    href={staff.contact.includes('@') ? `mailto:${staff.contact}` : `tel:${staff.contact}`}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    aria-label={`Contact ${staff.name}`}
                  >
                    <Phone className="h-3.5 w-3.5 text-[#22c55e]" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-black/40 backdrop-blur-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <h3 className="text-lg font-black text-white uppercase tracking-tight" style={{ fontFamily: D.head }}>
                WORKLOAD & MEDICAL <span className="text-rose-400 italic">SAFETY WATCHLIST</span>
              </h3>
            </div>
            <Badge className="bg-rose-500/10 text-rose-400 border-rose-500/20 uppercase font-mono text-[9px]">
              {snapshot.workloadAlerts.length} RISKS FLAGGED
            </Badge>
          </div>

          <div className="space-y-4">
            {snapshot.workloadAlerts.length === 0 && (
              <p className="text-xs text-white/40 p-4 rounded-xl border border-dashed border-white/10 text-center">
                No active injury restrictions or match-load risks.
              </p>
            )}
            {snapshot.workloadAlerts.map((alertItem) => {
              const tone = alertItem.severity === 'HIGH' ? 'rose' : alertItem.severity === 'MODERATE' ? 'amber' : 'white';
              return (
                <div key={alertItem.id} className={`p-4 rounded-xl space-y-2 border ${tone === 'rose' ? 'bg-rose-500/[0.03] border-rose-500/20' : tone === 'amber' ? 'bg-amber-500/[0.03] border-amber-500/20' : 'bg-white/[0.02] border-white/10'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{alertItem.playerName}</span>
                      <span className="text-[10px] font-mono text-white/40">({alertItem.teamName})</span>
                    </div>
                    <Badge className={`text-[9px] uppercase font-mono ${tone === 'rose' ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : tone === 'amber' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-white/10 text-white/60 border-white/20'}`}>
                      {alertItem.riskType.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  <p className="text-xs text-white/60 leading-relaxed">{alertItem.details}</p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                    <span className="text-white/40 font-mono text-[10px]">Workload: {alertItem.currentWorkload}</span>
                    <span className={`font-bold text-[10px] ${tone === 'rose' ? 'text-rose-300' : tone === 'amber' ? 'text-amber-300' : 'text-white/60'}`}>Limit: {alertItem.recommendedLimit}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
