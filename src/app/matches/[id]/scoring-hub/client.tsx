'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLiveScore } from '@/hooks/useLiveScore';
import { Match, Person } from '@/types/firestore';
import {
  recordBallAction,
  updateLivePlayersAction,
  undoLastBallAction,
  endInningsAction,
  startSecondInningsAction,
} from '@/app/actions/matchActions';
import { generateCommentary } from '@/lib/utils/commentaryGenerator';
import Link from 'next/link';
import { ChevronLeft, RotateCcw, Flag, AlertTriangle, Users, Trophy, Loader2, Wifi, WifiOff, X, Sparkles, Tv, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { BroadcastOverlay } from '@/components/broadcast/BroadcastOverlay';

import { D, SHOT_CATEGORIES, type ExtraType, type WicketMode, type ShotTypeChoice, type ScorerMode, type ContactQuality, type ActiveTab, type AnalysisSubTab } from './_hub/design';
import { scoringAudio } from './_hub/audio';
import { inferSegment } from './_hub/field';
import { getPlayerName, fmtOv, crrStr, rrrStr, Econ, buildSignals } from './_hub/helpers';
import { Lbl, Btn, BallDot, LiveDot, GlassCard, BottomNav } from './_hub/primitives';
import { PitchMap } from './_hub/PitchMap';
import { WagonWheel } from './_hub/WagonWheel';
import { DynamicBar } from './_hub/IntelPanels';
import { RichScorecardPanel } from './_hub/RichScorecardPanel';
import { AnalysisPanel } from './_hub/AnalysisPanel';
import { HistoryPanel } from './_hub/HistoryPanel';
import { ShotSelectorSheet, WicketSheet, ExtrasSheet, PlayerSheet, ScorerModeSwitcher, EnrichmentDrawer, BallAuditEditSheet } from './_hub/Sheets';

interface ScoringHubClientProps {
  match: Match;
  homePlayers: Person[];
  awayPlayers: Person[];
}

export function ScoringHubClient({ match, homePlayers, awayPlayers }: ScoringHubClientProps) {
  const allPlayers = useMemo(() => [...homePlayers, ...awayPlayers], [homePlayers, awayPlayers]);
  const { liveScore, loading, connected } = useLiveScore(match.id ?? null);

  /* ── Scoring state ── */
  const [scorerMode, setScorerMode] = useState<ScorerMode>('standard');
  const [showQuickMaps, setShowQuickMaps] = useState(false);
  const [contactQuality, setContactQuality] = useState<ContactQuality>(null);
  const [commentary, setCommentary] = useState<string>('');
  const [showEnrichmentDrawer, setShowEnrichmentDrawer] = useState(false);
  const [auditingBall, setAuditingBall] = useState<any | null>(null);

  const [runs, setRuns] = useState<number | null>(null);
  const [extraType, setExtraType] = useState<ExtraType>(null);
  const [extraRuns, setExtraRuns] = useState(1);
  const [wicketType, setWicketType] = useState<WicketMode>(null);
  const [fielderId, setFielderId] = useState<string | null>(null);
  const [shotType, setShotType] = useState<ShotTypeChoice>(null);
  const [penaltyRuns, setPenaltyRuns] = useState(0);
  const [shotCoords, setShotCoords] = useState<{ angle: number; distance: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<{label:string;color:string;emoji:string}|null>(null);
  const [freeHit, setFreeHit] = useState(false);
  const [cardsInnings, setCardsInnings] = useState<1|2>(1);

  /* ── Navigation ── */
  const [activeTab, setActiveTab] = useState<ActiveTab>('score');
  const [analysisSubTab, setAnalysisSubTab] = useState<AnalysisSubTab>('charts');

  /* ── Wagon wheel state ── */
  const [wagonView, setWagonView] = useState<'wagon'|'heatmap'>('wagon');
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());

  /* ── Sheet state ── */
  const [showWicketSheet, setShowWicketSheet] = useState(false);
  const [showExtrasSheet, setShowExtrasSheet] = useState(false);
  const [showStrikerSheet, setShowStrikerSheet] = useState(false);
  const [showNonStrikerSheet, setShowNonStrikerSheet] = useState(false);
  const [showBowlerSheet, setShowBowlerSheet] = useState(false);
  const [showEndInningsConfirm, setShowEndInningsConfirm] = useState(false);
  const [showShotSheet, setShowShotSheet] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showEnrichment, setShowEnrichment] = useState(false);
  const [pitchCoords, setPitchCoords] = useState<{ line: 'off' | 'middle' | 'leg'; length: 'yorker' | 'full' | 'good' | 'short' | 'bouncer'; x: number; y: number } | null>(null);
  const [soundActive, setSoundActive] = useState(true);
  const [speechActive, setSpeechActive] = useState(false);

  /* ── Keyboard Shortcuts ── */
  const handleRecordRef = useRef<() => void>();
  const handleUndoRef = useRef<() => void>();
  const canRecordRef = useRef(false);

  useEffect(() => {
    handleRecordRef.current = handleRecord;
    handleUndoRef.current = handleUndo;
    canRecordRef.current = canRecord;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName);
      if (isInput) return;

      if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        handleUndoRef.current?.();
        return;
      }

      if (e.key >= '0' && e.key <= '6') {
        setRuns(parseInt(e.key, 10));
        setWicketType(null);
        setExtraType(null);
        scoringAudio.playKeyClick();
      } else if (e.key === 'w' || e.key === 'W') {
        setShowWicketSheet(true);
        scoringAudio.playKeyClick();
      } else if (e.key === 'x' || e.key === 'X') {
        setShowExtrasSheet(true);
        scoringAudio.playKeyClick();
      } else if (e.key === 'e' || e.key === 'E') {
        setShowEnrichmentDrawer(true);
        scoringAudio.playKeyClick();
      } else if (e.key === 'z' || e.key === 'Z') {
        handleUndoRef.current?.();
        scoringAudio.playKeyClick();
      } else if (e.key === 'b' || e.key === 'B') {
        setShowBroadcast(prev => !prev);
      } else if (e.key === 's' || e.key === 'S') {
        setSoundActive(scoringAudio.toggleSound());
      } else if (e.key === 'm' || e.key === 'M') {
        setScorerMode(prev => prev === 'quick' ? 'standard' : prev === 'standard' ? 'full' : 'quick');
        scoringAudio.playKeyClick();
      } else if ((e.key === 'Enter' || e.key === ' ') && canRecordRef.current) {
        e.preventDefault();
        handleRecordRef.current?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  /* ── Derived ── */
  const ci = liveScore?.currentInnings;
  const cp = liveScore?.currentPlayers;
  const striker = liveScore?.batsmen?.find((b: any) => b.playerId === cp?.strikerId);
  const nonStriker = liveScore?.batsmen?.find((b: any) => b.playerId === cp?.nonStrikerId);
  const bowler = liveScore?.bowlers?.find((b: any) => b.playerId === cp?.bowlerId);
  const currentOver = liveScore?.currentOver || [];
  const isInningsBreak = liveScore?.status === 'innings_break';
  const isComplete = liveScore?.status === 'completed';
  const battingTeamId = ci?.battingTeamId;
  const battingPlayers = battingTeamId === match.homeTeamId ? homePlayers : awayPlayers;
  const fieldingPlayers = battingTeamId === match.homeTeamId ? awayPlayers : homePlayers;
  const outBatsmenIds = liveScore?.batsmen?.filter((b: any) => b.isOut).map((b: any) => b.playerId) || [];
  const canRecord = !!(cp?.strikerId && cp?.bowlerId && runs !== null && !submitting && !isInningsBreak && !isComplete);
  const isChase = (liveScore?.inningsNumber || 1) === 2;
  const target = ci?.target;
  const overs = match.overs || 20;

  // Wagon-wheel ball log with segment inference — memoised so the memo'd
  // WagonWheel/AnalysisPanel only re-render when the ball history changes.
  const ballHistory = liveScore?.ballHistory;
  const wagonBallLog: any[] = useMemo(() => (ballHistory || []).map((b: any) => ({
    ...b,
    seg: b.shotZone != null ? b.shotZone : b.shotCoordinates?.angle != null ? inferSegment(b.shotCoordinates.angle) : null,
  })), [ballHistory]);

  /* ── Auto-prompt ── */
  useEffect(() => {
    if (!liveScore || loading) return;
    if (!cp?.strikerId) setShowStrikerSheet(true);
    else if (!cp?.bowlerId) setShowBowlerSheet(true);
  }, [cp?.strikerId, cp?.bowlerId, liveScore, loading]);

  /* ── Record ball ── */
  async function handleRecord() {
    if (!canRecord || !cp?.strikerId || !cp?.bowlerId) return;
    setSubmitting(true);
    try {
      const strikerObj = allPlayers.find(p => p.id === cp.strikerId);
      const bowlerObj = allPlayers.find(p => p.id === cp.bowlerId);
      const fielderObj = fielderId ? allPlayers.find(p => p.id === fielderId) : null;
      
      let zoneName: string | undefined;
      if (shotCoords && typeof shotCoords.angle === 'number') {
        const norm = ((shotCoords.angle % 360) + 360) % 360;
        if (norm >= 337.5 || norm < 22.5) zoneName = 'MID_OFF';
        else if (norm >= 22.5 && norm < 67.5) zoneName = 'COVER';
        else if (norm >= 67.5 && norm < 112.5) zoneName = 'POINT';
        else if (norm >= 112.5 && norm < 157.5) zoneName = 'THIRD_MAN';
        else if (norm >= 157.5 && norm < 202.5) zoneName = 'FINE_LEG';
        else if (norm >= 202.5 && norm < 247.5) zoneName = 'SQUARE_LEG';
        else if (norm >= 247.5 && norm < 292.5) zoneName = 'MID_WICKET';
        else if (norm >= 292.5 && norm < 337.5) zoneName = 'LONG_ON';
      }

      const autoCommentary = commentary.trim() || generateCommentary({
        runs: runs ?? 0,
        isWide: extraType === 'wide',
        isNoBall: extraType === 'noball',
        isDismissal: !!wicketType,
        dismissalType: wicketType ?? undefined,
        batsmanName: strikerObj ? `${strikerObj.firstName ? strikerObj.firstName[0] + '. ' : ''}${strikerObj.lastName}` : "Batter",
        bowlerName: bowlerObj ? `${bowlerObj.firstName ? bowlerObj.firstName[0] + '. ' : ''}${bowlerObj.lastName}` : "Bowler",
        fielderName: fielderObj ? `${fielderObj.firstName ? fielderObj.firstName[0] + '. ' : ''}${fielderObj.lastName}` : undefined,
        shotZone: zoneName,
        shotType: shotType ?? undefined,
        contactQuality: contactQuality ?? undefined,
        pitchLength: pitchCoords?.length,
        pitchLine: pitchCoords?.line ? `${pitchCoords.line} stump` : undefined,
        isPowerplay: (liveScore?.currentInnings?.overs ?? 0) < 6,
        isDeathOver: (liveScore?.currentInnings?.overs ?? 0) >= 16,
      });


      const result = await recordBallAction(match.id!, {
        runs: runs ?? 0,
        isWicket: !!wicketType,
        wicketType: wicketType ?? undefined,
        extraType: extraType ?? undefined,
        extraRuns: extraType ? extraRuns : 0,
        penaltyRuns: penaltyRuns > 0 ? penaltyRuns : undefined,
        strikerId: cp.strikerId,
        nonStrikerId: cp.nonStrikerId,
        bowlerId: cp.bowlerId,
        fielderIds: fielderId ? [fielderId] : undefined,
        dismissedPlayerId: wicketType ? cp.strikerId : undefined,
        shotCoordinates: shotCoords ?? undefined,
        shotType: shotType ?? undefined,
        commentary: autoCommentary,
      });

      if (result.success) {
        // Determine overlay event & trigger stadium audio/haptics/speech
        if (wicketType) {
          setOverlay({label:'WICKET',color:D.rose,emoji:'🎯'});
          scoringAudio.playWicket();
          scoringAudio.vibrate([100, 50, 100, 50, 150]);
          scoringAudio.speak("Wicket! Out!");
        } else if (runs === 6) {
          setOverlay({label:'SIX!',color:D.amber,emoji:'💥'});
          scoringAudio.playBoundary6();
          scoringAudio.vibrate([40, 60, 40]);
          scoringAudio.speak("Six runs! Magnificent shot!");
        } else if (runs === 4) {
          setOverlay({label:'FOUR!',color:D.indigo,emoji:'🏏'});
          scoringAudio.playBoundary4();
          scoringAudio.vibrate([30, 40]);
          scoringAudio.speak("Four runs through the boundary!");
        } else if (result.milestone) {
          const ms = String(result.milestone);
          const isCentury = ms.toLowerCase().includes('100') || ms.toLowerCase().includes('century');
          const isFifty = ms.toLowerCase().includes('50') || ms.toLowerCase().includes('fifty');
          const isFiveFor = ms.toLowerCase().includes('5') && ms.toLowerCase().includes('wicket');
          setOverlay({label: isCentury?'CENTURY!':isFifty?'FIFTY!':isFiveFor?'FIVE-FOR!':ms.toUpperCase(), color:D.violet, emoji: isCentury?'💯':isFifty?'⭐':'🏆'});
          scoringAudio.playBoundary6();
          scoringAudio.speak(`Milestone! ${ms}`);
        } else {
          scoringAudio.playKeyClick();
          scoringAudio.vibrate(15);
          if (runs && runs > 0) scoringAudio.speak(`${runs} run${runs > 1 ? 's' : ''}`);
        }
        setTimeout(()=>setOverlay(null),1800);
        // Free hit tracking
        if (extraType === 'noball') setFreeHit(true);
        else setFreeHit(false);
        const label = wicketType ? '🎯 Wicket!' : runs === 6 ? '💥 Six!' : runs === 4 ? '🏏 Four!' : result.milestone ? `🎉 ${result.milestone}!` : `${runs} run${runs !== 1 ? 's' : ''}`;
        setFeedback(label);
        setTimeout(() => setFeedback(null), 1800);
        setRuns(null); setExtraType(null); setExtraRuns(1); setWicketType(null);
        setFielderId(null); setShotType(null); setPenaltyRuns(0); setShotCoords(null);
        if (wicketType) { setFreeHit(false); setShowStrikerSheet(true); }
        if (result.isOverComplete) setShowBowlerSheet(true);
      }
    } catch {
      setFeedback('Error recording ball');
      setTimeout(() => setFeedback(null), 2200);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUndo() {
    if (!match.id || submitting) return;
    setSubmitting(true);
    await undoLastBallAction(match.id, 'Manual undo');
    setSubmitting(false);
  }

  async function handleEndInnings() {
    if (!match.id) return;
    setSubmitting(true);
    await endInningsAction(match.id);
    setSubmitting(false);
    setShowEndInningsConfirm(false);
  }

  async function handleSelectStriker(id: string) { await updateLivePlayersAction(match.id!, { strikerId: id }); setShowStrikerSheet(false); }
  async function handleSelectNonStriker(id: string) { await updateLivePlayersAction(match.id!, { nonStrikerId: id }); setShowNonStrikerSheet(false); }
  async function handleSelectBowler(id: string) { await updateLivePlayersAction(match.id!, { bowlerId: id }); setShowBowlerSheet(false); }

  async function handleWicketConfirm(type: WicketMode, fId?: string) {
    setWicketType(type); setFielderId(fId ?? null); setRuns(prev => prev ?? 0); setShowWicketSheet(false);
  }

  function handleExtrasConfirm(type: ExtraType, r: number) {
    setExtraType(type); setExtraRuns(r);
    if (type === 'wide' || type === 'noball') setRuns(r);
    setShowExtrasSheet(false);
  }

  const handleToggleLine = useCallback((k: string) => {
    setHiddenLines(prev => { const s = new Set(prev); s.has(k) ? s.delete(k) : s.add(k); return s; });
  }, []);

  /* ── Loading ── */
  if (loading && !liveScore) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: D.base }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={36} color={D.emerald} style={{ animation: 'spin 1s linear infinite', display: 'block', margin: '0 auto 14px' }} />
          <p style={{ color: D.textMuted, fontFamily: D.body, fontSize: '13px' }}>Loading Scoring Hub…</p>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <div style={{ background: D.base, minHeight: '100vh', paddingBottom: '80px' }}>

      {/* ── STICKY HEADER ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(5,8,15,0.96)', borderBottom: `1px solid ${D.border}`,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link href={`/matches/${match.id}`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '50%',
              background: D.surf2, border: `1px solid ${D.border}`,
              color: D.textPrimary, textDecoration: 'none', flexShrink: 0,
            }}>
              <ChevronLeft size={16} />
            </Link>
            {/* SCRBRD Logotype */}
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontFamily: D.head, fontSize: '17px', fontWeight: 800,
                background: D.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px' }}>SCRBRD</div>
              <div style={{ fontFamily: D.head, fontSize: '8px', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: D.textMuted, marginTop: '1px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                {match.homeTeamName} <span style={{color:D.textMuted,fontWeight:400}}>vs</span> {match.awayTeamName} · {match.matchType || 'T20'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ScorerModeSwitcher mode={scorerMode} onChange={setScorerMode} />
            <button 
              onClick={() => setSoundActive(scoringAudio.toggleSound())}
              className="sh-press"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px', borderRadius: '50%',
                background: soundActive ? D.surf2 : `${D.rose}18`, border: `1px solid ${soundActive ? D.border : D.rose}`,
                color: soundActive ? D.textPrimary : D.rose, cursor: 'pointer', transition: 'all 0.2s',
              }}
              title="Toggle Audio Effects (S)"
            >
              {soundActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
            <button 
              onClick={() => {
                const next = !speechActive;
                setSpeechActive(next);
                scoringAudio.setSpeechEnabled(next);
              }}
              className="sh-press"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px', borderRadius: '50%',
                background: speechActive ? D.grad : D.surf2, border: `1px solid ${speechActive ? 'transparent' : D.border}`,
                color: speechActive ? '#fff' : D.textMuted, cursor: 'pointer', transition: 'all 0.2s',
              }}
              title="Toggle Voice Commentary"
            >
              {speechActive ? <Mic size={14} /> : <MicOff size={14} />}
            </button>
            <button 
              onClick={() => setShowBroadcast(!showBroadcast)}
              className="sh-press"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px', borderRadius: '50%',
                background: showBroadcast ? D.grad : D.surf2, border: `1px solid ${showBroadcast ? 'transparent' : D.border}`,
                color: showBroadcast ? '#fff' : D.textPrimary, cursor: 'pointer', transition: 'all 0.2s',
              }}
              title="Toggle Broadcast Overlay (B)"
            >
              <Tv size={14} />
            </button>
            {/* Compact live score pill */}
            {liveScore?.currentInnings && (
              <div style={{ display:'flex', alignItems:'center', gap:'5px',
                padding:'4px 10px', borderRadius:D.pill,
                background:D.surf2, border:`1px solid ${D.borderMed}` }}>
                <span style={{ fontFamily:D.mono, fontSize:'13px', fontWeight:700, color:D.textPrimary }}>
                  {liveScore.currentInnings.runs ?? 0}/{liveScore.currentInnings.wickets ?? 0}
                </span>
                <span style={{ fontFamily:D.mono, fontSize:'10px', color:D.textMuted }}>
                  ({fmtOv(liveScore.currentInnings.balls ?? 0)})
                </span>
              </div>
            )}
            {connected ? <Wifi size={12} color={D.emerald} /> : <WifiOff size={12} color={D.rose} />}
            {liveScore?.status === 'live' && (
              <div className="sh-live-glow" style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 8px', borderRadius: '9999px',
                background: `${D.rose}18`, border: `1px solid ${D.rose}40`,
              }}>
                <LiveDot />
                <span style={{ fontFamily: D.head, fontSize: '8px', fontWeight: 700,
                  letterSpacing: '0.12em', color: D.rose }}>LIVE</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── DYNAMIC INTELLIGENCE BAR ── */}
      {liveScore?.status === 'live' && (
        <DynamicBar liveScore={liveScore} overs={overs} target={target} isChase={isChase} />
      )}

      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

        {/* ══════════════════ SCORE TAB ══════════════════ */}
        {activeTab === 'score' && (
          <>
            {/* Score Hero */}
            {(() => {
              const sig = buildSignals(liveScore, overs, target, isChase);
              const phaseCol = sig?.phase === 'POWERPLAY' ? D.emerald : sig?.phase === 'MIDDLE' ? D.amber : D.orange;
              return (
                <GlassCard sx={{ padding: '22px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)',
                    width: '200px', height: '200px', borderRadius: '50%',
                    background: `radial-gradient(${D.emerald}12,transparent 70%)`, pointerEvents: 'none' }} />
                  {/* Innings label + badges */}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'8px', flexWrap:'wrap' }}>
                    <div style={{ fontFamily: D.head, fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em',
                      textTransform: 'uppercase', color: D.textMuted }}>
                      {liveScore?.inningsNumber === 2 ? '2nd' : '1st'} Innings · {ci?.battingTeamId === match.homeTeamId ? match.homeTeamName : match.awayTeamName}
                    </div>
                    {sig?.phase && (
                      <div style={{ fontFamily:D.head, fontSize:'8px', fontWeight:800, textTransform:'uppercase',
                        letterSpacing:'0.1em', padding:'2px 8px', borderRadius:D.pill,
                        background:`${phaseCol}18`, border:`1px solid ${phaseCol}33`, color:phaseCol }}>
                        {sig.phase}
                      </div>
                    )}
                    {freeHit && (
                      <div style={{ fontFamily:D.head, fontSize:'8px', fontWeight:800, textTransform:'uppercase',
                        letterSpacing:'0.1em', padding:'2px 9px', borderRadius:D.pill,
                        background:`${D.violet}22`, border:`1px solid ${D.violet}44`, color:D.violet,
                        animation:'dotPulse 1.2s ease-in-out infinite' }}>
                        FREE HIT
                      </div>
                    )}
                  </div>
                  <div className="sh-score-anim" key={ci?.runs} style={{ fontFamily: D.head, fontSize: '64px', fontWeight: 800,
                    letterSpacing: '-3px', lineHeight: 1, color: D.textPrimary }}>
                    {ci?.runs ?? 0}<span style={{ color: D.textMuted, fontSize: '36px', letterSpacing: '-1px' }}>/{ci?.wickets ?? 0}</span>
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '13px', color: D.textSecondary, marginTop: '8px' }}>
                    {fmtOv(ci?.balls ?? 0)} overs · CRR {crrStr(ci?.runs ?? 0, ci?.balls ?? 0)}
                    {isChase && ci?.target && (
                      <span style={{ color: D.amber }}> · RRR {rrrStr(ci.target, ci.runs ?? 0, ci.balls ?? 0, overs * 6)}</span>
                    )}
                  </div>
                  {isChase && ci?.target && (
                    <div style={{ marginTop: '10px', display: 'inline-flex', alignItems: 'center', gap: '8px',
                      padding: '7px 14px', borderRadius: D.pill, background: `${D.amber}12`,
                      border: `1px solid ${D.amber}30` }}>
                      <span style={{ fontFamily: D.head, fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.1em', color: D.amber }}>Target</span>
                      <span style={{ fontFamily: D.mono, fontSize: '15px', fontWeight: 700, color: D.amber }}>{ci.target}</span>
                      <span style={{ fontFamily: D.body, fontSize: '11px', color: D.textMuted }}>
                        Need {(ci.target - (ci.runs ?? 0))} off {Math.max(0, overs * 6 - (ci.balls ?? 0))} balls
                      </span>
                    </div>
                  )}
                </GlassCard>
              );
            })()}

            {/* Current Over */}
            <GlassCard sx={{ padding: '14px 16px' }}>
              <Lbl>This Over</Lbl>
              <div style={{ display: 'flex', gap: '7px', alignItems: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
                {currentOver.length === 0
                  ? <span style={{ color: D.textMuted, fontSize: '12px', fontFamily: D.body }}>No balls yet</span>
                  : currentOver.map((b: any, i: number) => (
                    <BallDot key={i} runs={b.runs ?? 0} isW={!!b.isWicket} extraType={b.extraType} />
                  ))
                }
              </div>
            </GlassCard>

            {/* At Crease */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <GlassCard sx={{ padding: '13px 14px', cursor: 'pointer', borderColor: `${D.emerald}25` }}
                onClick={() => setShowStrikerSheet(true)}>
                <div style={{ fontSize: '9px', color: D.emerald, fontFamily: D.head, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="sh-live-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: D.emerald, boxShadow: `0 0 5px ${D.emerald}` }} />
                  Striker
                </div>
                <div style={{ fontFamily: D.body, fontWeight: 700, fontSize: '13px', marginBottom: '3px', color: D.textPrimary,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getPlayerName(allPlayers, cp?.strikerId)}
                </div>
                {striker && (
                  <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.textSecondary }}>
                    {striker.runs}<span style={{ fontSize: '10px', color: D.textMuted }}>({striker.ballsFaced})</span>
                    <span style={{ marginLeft: '5px', color: striker.strikeRate > 150 ? D.emerald : D.textMuted, fontSize: '10px' }}>
                      {striker.strikeRate?.toFixed(0)} SR
                    </span>
                  </div>
                )}
              </GlassCard>
              <GlassCard sx={{ padding: '13px 14px', cursor: 'pointer' }} onClick={() => setShowNonStrikerSheet(true)}>
                <div style={{ fontSize: '9px', color: D.textMuted, fontFamily: D.head, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '5px' }}>
                  ○ Non-Striker
                </div>
                <div style={{ fontFamily: D.body, fontWeight: 700, fontSize: '13px', marginBottom: '3px', color: D.textPrimary,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {getPlayerName(allPlayers, cp?.nonStrikerId)}
                </div>
                {nonStriker && (
                  <div style={{ fontFamily: D.mono, fontSize: '12px', color: D.textMuted }}>
                    {nonStriker.runs}<span style={{ fontSize: '10px' }}>({nonStriker.ballsFaced})</span>
                  </div>
                )}
              </GlassCard>
            </div>

            {/* Bowler */}
            <GlassCard sx={{ padding: '13px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              onClick={() => setShowBowlerSheet(true)}>
              <div>
                <div style={{ fontSize: '9px', color: D.sky, fontFamily: D.head, fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>Bowling</div>
                <div style={{ fontFamily: D.body, fontWeight: 700, fontSize: '13px', color: D.textPrimary }}>
                  {getPlayerName(allPlayers, cp?.bowlerId)}
                </div>
              </div>
              {bowler && (
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right' }}>
                  <div style={{ color: D.textPrimary, fontWeight: 700, fontSize: '13px' }}>{bowler.wickets}W–{bowler.runsConceded}</div>
                  <div>{bowler.overs} ov · {Econ(bowler.runsConceded, Math.round(parseFloat(String(bowler.overs || 0)) * 6))} econ</div>
                </div>
              )}
            </GlassCard>

            {/* Partnership Mini-Card */}
            {(() => {
              const part = liveScore?.partnership;
              if (!part || !cp?.strikerId) return null;
              const pRuns = (part as any).runs ?? 0;
              const pBalls = (part as any).balls ?? 0;
              const p1c = (part as any).player1Runs ?? 0; const p2c = (part as any).player2Runs ?? 0; const psum = p1c + p2c || 1;
              const pRR = pBalls > 0 ? ((pRuns / pBalls) * 6).toFixed(2) : '—';
              return (
                <GlassCard sx={{ padding: '12px 16px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px', minWidth:0 }}>
                      <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:D.sky, flexShrink:0, boxShadow:`0 0 5px ${D.sky}` }} />
                      <div style={{ fontFamily:D.body, fontSize:'12px', fontWeight:600, color:D.textSecondary, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {getPlayerName(allPlayers, (part as any).player1Id)} &amp; {getPlayerName(allPlayers, (part as any).player2Id)}
                      </div>
                    </div>
                    <div style={{ display:'flex', gap:'12px', flexShrink:0 }}>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontFamily:D.mono, fontSize:'14px', fontWeight:700, color:D.textPrimary }}>{pRuns}</div>
                        <div style={{ fontFamily:D.head, fontSize:'7px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:D.textMuted }}>runs</div>
                      </div>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontFamily:D.mono, fontSize:'14px', fontWeight:700, color:D.textMuted }}>{pBalls}</div>
                        <div style={{ fontFamily:D.head, fontSize:'7px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:D.textMuted }}>balls</div>
                      </div>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontFamily:D.mono, fontSize:'14px', fontWeight:700, color:D.sky }}>{pRR}</div>
                        <div style={{ fontFamily:D.head, fontSize:'7px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:D.textMuted }}>RR</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop:'8px', height:'3px', borderRadius:'3px', background:D.surf3, overflow:'hidden', display:'flex' }}>
                    <div style={{ width:(p1c/psum*100)+'%', background:`linear-gradient(90deg,${D.sky},${D.sky}88)`, borderRadius:'3px 0 0 3px' }} />
                    <div style={{ width:(p2c/psum*100)+'%', background:`linear-gradient(90deg,${D.violet}88,${D.violet})`, borderRadius:'0 3px 3px 0' }} />
                  </div>
                  <div style={{ fontFamily:D.head, fontSize:'7px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:D.textMuted, textAlign:'center', marginTop:'4px' }}>Active Partnership</div>
                </GlassCard>
              );
            })()}

            {/* Innings Break */}
            {isInningsBreak && (
              <GlassCard sx={{ padding: '28px 20px', textAlign: 'center', borderColor: `${D.amber}30` }}>
                <Trophy size={32} color={D.amber} style={{ marginBottom: '12px' }} />
                <div style={{ fontFamily: D.head, fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Innings Complete</div>
                <div style={{ color: D.textMuted, marginBottom: '20px', fontFamily: D.body, fontSize: '14px' }}>
                  {liveScore?.innings1?.runs}/{liveScore?.innings1?.wickets} · Target: <strong style={{ color: D.amber }}>{ci?.target}</strong>
                </div>
                <Btn variant="amber" full onClick={async () => { await startSecondInningsAction(match.id!); setShowStrikerSheet(true); }}>
                  Start 2nd Innings →
                </Btn>
              </GlassCard>
            )}

            {/* Ball Input Panel */}
            {!isInningsBreak && !isComplete && (
              <GlassCard sx={{ padding: '18px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '6px' }}>
                  <Lbl>Record Ball</Lbl>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: D.mono, fontSize: '10px', color: D.textMuted, background: D.surf2, padding: '3px 8px', borderRadius: D.pill, border: `1px solid ${D.border}` }}>
                    <span>⌨️ Hotkeys:</span>
                    <span style={{ color: D.emerald, fontWeight: 700 }}>0–6</span>
                    <span>·</span>
                    <span style={{ color: D.rose, fontWeight: 700 }}>W</span>
                    <span>Wicket ·</span>
                    <span style={{ color: D.amber, fontWeight: 700 }}>X</span>
                    <span>Extra ·</span>
                    <span style={{ color: D.sky, fontWeight: 700 }}>Z</span>
                    <span>Undo ·</span>
                    <span style={{ color: D.violet, fontWeight: 700 }}>Enter</span>
                  </div>
                </div>

                {/* Runs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '7px', marginBottom: '10px' }}>
                  {[0, 1, 2, 3, 4, 6].map(r => {
                    const sel = runs === r && !wicketType;
                    const col = r === 6 ? D.violet : r === 4 ? D.indigo : r > 0 ? D.emerald : D.textMuted;
                    return (
                      <button key={r} onClick={() => { setRuns(r); setWicketType(null); setExtraType(null); }} className="sh-press"
                        style={{ padding: '15px 0', borderRadius: D.lg, border: `2px solid ${sel ? col : D.border}`,
                          background: sel ? `${col}18` : D.surf2, color: sel ? col : D.textPrimary,
                          fontFamily: D.mono, fontSize: '19px', fontWeight: 700, cursor: 'pointer',
                          boxShadow: sel ? `0 0 12px ${col}25` : 'none', transition: 'all .15s' }}>
                        {r}
                      </button>
                    );
                  })}
                </div>

                {/* Action row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '7px', marginBottom: '12px' }}>
                  <button onClick={() => setShowWicketSheet(true)} className="sh-press" style={{
                    padding: '12px 6px', borderRadius: D.lg, cursor: 'pointer', fontFamily: D.body, fontSize: '12px', fontWeight: 700,
                    background: wicketType ? `${D.rose}18` : 'transparent',
                    border: `1.5px solid ${wicketType ? D.rose : D.border}`, color: wicketType ? D.rose : D.textSecondary,
                    transition: 'all .15s',
                  }}>
                    {wicketType ? `W · ${wicketType.replace('_', ' ')}` : '⚡ Wicket'}
                  </button>
                  <button onClick={() => setShowExtrasSheet(true)} className="sh-press" style={{
                    padding: '12px 6px', borderRadius: D.lg, cursor: 'pointer', fontFamily: D.body, fontSize: '12px', fontWeight: 700,
                    background: extraType ? `${D.amber}12` : 'transparent',
                    border: `1.5px solid ${extraType ? D.amber : D.border}`, color: extraType ? D.amber : D.textSecondary,
                    transition: 'all .15s',
                  }}>
                    {extraType ? `${extraType} +${extraRuns}` : '+ Extras'}
                  </button>
                  <button onClick={() => setPenaltyRuns(p => p === 5 ? 0 : 5)} className="sh-press" style={{
                    padding: '12px 6px', borderRadius: D.lg, cursor: 'pointer', fontFamily: D.body, fontSize: '12px', fontWeight: 700,
                    background: penaltyRuns > 0 ? `${D.orange}12` : 'transparent',
                    border: `1.5px solid ${penaltyRuns > 0 ? D.orange : D.border}`, color: penaltyRuns > 0 ? D.orange : D.textSecondary,
                    transition: 'all .15s',
                  }}>
                    {penaltyRuns > 0 ? `+${penaltyRuns} Pen` : 'Penalty'}
                  </button>
                </div>

                {/* Shot type */}
                <button onClick={() => setShowShotSheet(true)} className="sh-press" style={{
                  width: '100%', padding: '10px 14px', borderRadius: D.lg, cursor: 'pointer', fontFamily: D.body, fontSize: '12px', fontWeight: 600,
                  background: shotType ? `${D.amber}10` : 'transparent', border: `1.5px solid ${shotType ? D.amber : D.border}`,
                  color: shotType ? D.amber : D.textMuted, textAlign: 'left', marginBottom: '12px', transition: 'all .15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span>{shotType ? `🏏 ${SHOT_CATEGORIES.flatMap(c => c.shots).find(s => s.id === shotType)?.label || shotType}` : '🏏 Shot type (optional)'}</span>
                  {shotType && <X size={13} onClick={e => { e.stopPropagation(); setShotType(null); }} />}
                </button>

                {/* Active chips */}
                {(wicketType || extraType || penaltyRuns > 0 || shotCoords) && (
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    {wicketType && (
                      <button onClick={() => { setWicketType(null); setFielderId(null); }} className="sh-press" style={{
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: D.pill, cursor: 'pointer',
                        background: `${D.rose}18`, border: `1px solid ${D.rose}30`, color: D.rose, fontFamily: D.body, fontSize: '11px', fontWeight: 600,
                      }}>Wicket: {wicketType} <X size={11} /></button>
                    )}
                    {extraType && (
                      <button onClick={() => setExtraType(null)} className="sh-press" style={{
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: D.pill, cursor: 'pointer',
                        background: `${D.amber}12`, border: `1px solid ${D.amber}30`, color: D.amber, fontFamily: D.body, fontSize: '11px', fontWeight: 600,
                      }}>{extraType} +{extraRuns} <X size={11} /></button>
                    )}
                    {penaltyRuns > 0 && (
                      <button onClick={() => setPenaltyRuns(0)} className="sh-press" style={{
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: D.pill, cursor: 'pointer',
                        background: `${D.orange}12`, border: `1px solid ${D.orange}30`, color: D.orange, fontFamily: D.body, fontSize: '11px', fontWeight: 600,
                      }}>+{penaltyRuns} pen <X size={11} /></button>
                    )}
                    {shotCoords && (
                      <button onClick={() => setShotCoords(null)} className="sh-press" style={{
                        display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: D.pill, cursor: 'pointer',
                        background: `${D.emerald}12`, border: `1px solid ${D.emerald}30`, color: D.emerald, fontFamily: D.body, fontSize: '11px', fontWeight: 600,
                      }}>Aimed {shotCoords.angle}° <X size={11} /></button>
                    )}
                  </div>
                )}

                {/* Full OS Inline Telemetry (in Full OS mode) */}
                {scorerMode === 'full' && (
                  <div style={{
                    background: `${D.violet}0A`,
                    border: `1px solid ${D.violet}30`,
                    borderRadius: D.md,
                    padding: '12px',
                    marginBottom: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: D.violet }}>
                        🚀 Full OS Telemetry
                      </span>
                      <span style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted }}>Inline Contact & Commentary</span>
                    </div>

                    {/* Contact Quality Selector */}
                    <div>
                      <div style={{ fontSize: '10px', fontFamily: D.head, fontWeight: 700, color: D.textSecondary, marginBottom: '6px' }}>
                        Contact Quality
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {[
                          { id: 'middled', label: 'Middled', icon: '⚡' },
                          { id: 'edged', label: 'Edged', icon: '💥' },
                          { id: 'missed', label: 'Beaten', icon: '💨' },
                          { id: 'lofted', label: 'Lofted', icon: '🚀' },
                          { id: 'defended', label: 'Defended', icon: '🛡️' },
                        ].map(q => {
                          const active = contactQuality === q.id;
                          return (
                            <button
                              key={q.id}
                              onClick={() => setContactQuality(active ? null : (q.id as ContactQuality))}
                              className="sh-press"
                              type="button"
                              style={{
                                padding: '4px 10px',
                                borderRadius: D.pill,
                                border: active ? `1px solid ${D.violet}` : `1px solid ${D.border}`,
                                background: active ? D.violet : D.surf2,
                                color: active ? '#fff' : D.textMuted,
                                fontSize: '10px',
                                fontFamily: D.head,
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                            >
                              {q.icon} {q.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Live Commentary Input */}
                    <div>
                      <input
                        type="text"
                        placeholder="Custom commentary / ball note..."
                        value={commentary}
                        onChange={e => setCommentary(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: D.md,
                          background: D.surf2,
                          border: `1px solid ${D.border}`,
                          color: D.textPrimary,
                          fontSize: '11px',
                          fontFamily: D.body,
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Record + Enrich + Undo */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleRecord} disabled={!canRecord} className="sh-press" style={{
                    flex: 1, padding: '15px', borderRadius: D.lg,
                    background: canRecord ? D.gradLive : D.surf2, border: 'none',
                    color: canRecord ? '#fff' : D.textMuted, fontWeight: 800, fontSize: '15px',
                    cursor: canRecord ? 'pointer' : 'not-allowed', fontFamily: D.body,
                    boxShadow: canRecord ? '0 4px 24px rgba(16,185,129,.35)' : 'none', transition: 'all .2s',
                    letterSpacing: '-0.2px',
                  }}>
                    {submitting ? '…' : runs !== null ? `Record Ball · ${runs}r` : 'Record Ball'}
                  </button>
                  <button onClick={() => setShowEnrichmentDrawer(true)} className="sh-press" title="Phase 2 Enrichment (E)" style={{
                    padding: '15px 14px', borderRadius: D.lg, background: `${D.sky}15`, border: `1px solid ${D.sky}35`,
                    color: D.sky, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    fontFamily: D.head, fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap',
                  }}>
                    <Sparkles size={15} /> Enrich
                  </button>
                  <button onClick={handleUndo} disabled={submitting || currentOver.length === 0} className="sh-press" style={{
                    padding: '15px 16px', borderRadius: D.lg, background: D.surf2, border: `1px solid ${D.border}`,
                    color: D.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <RotateCcw size={17} />
                  </button>
                </div>
              </GlassCard>
            )}

            {/* ════════ SIDE-BY-SIDE INTERACTIVE MAPS (Pitch Landing Map & Field Map / Wagon Wheel) ════════ */}
            {(scorerMode !== 'quick' || showQuickMaps) && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px',
                alignItems: 'stretch',
              }}>
                {/* Pitch Landing Map (22-yard interactive pitch) */}
                <GlassCard sx={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <PitchMap selectedPoint={pitchCoords} onSelectPitchingPoint={setPitchCoords} />
                </GlassCard>

                {/* Field Map (Wagon Wheel in score tab) */}
                <GlassCard sx={{ padding: '16px 16px 22px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <WagonWheel ballLog={wagonBallLog} shotCoords={shotCoords} onAim={setShotCoords}
                    viewMode={wagonView} onViewMode={setWagonView} hiddenLines={hiddenLines} onToggleLine={handleToggleLine} />
                </GlassCard>
              </div>
            )}

            {scorerMode === 'quick' && !showQuickMaps && (
              <button 
                onClick={() => setShowQuickMaps(true)}
                className="sh-press"
                type="button"
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: D.lg,
                  background: D.surf1,
                  border: `1px dashed ${D.border}`,
                  color: D.textSecondary,
                  fontFamily: D.head,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <span>📍</span> Show Pitch Landing & Field Maps (Side-by-Side)
              </button>
            )}

            {/* End Innings */}
            {!isInningsBreak && !isComplete && liveScore?.status === 'live' && (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowEndInningsConfirm(true)} className="sh-press" style={{
                  flex: 1, padding: '13px', borderRadius: D.lg, background: `${D.rose}10`, border: `1px solid ${D.rose}30`,
                  color: D.rose, fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: D.body,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                }}>
                  <Flag size={14} /> End Innings
                </button>
                <button onClick={() => setShowStrikerSheet(true)} className="sh-press" style={{
                  padding: '13px 16px', borderRadius: D.lg, background: D.surf2, border: `1px solid ${D.border}`,
                  color: D.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontFamily: D.body,
                }}>
                  <Users size={14} /> Players
                </button>
              </div>
            )}

            {/* Match complete */}
            {isComplete && liveScore?.result && (
              <GlassCard sx={{ padding: '28px 20px', textAlign: 'center', borderColor: `${D.emerald}30` }}>
                <Trophy size={36} color={D.emerald} style={{ marginBottom: '12px' }} />
                <div style={{ fontFamily: D.head, fontSize: '22px', fontWeight: 800, marginBottom: '8px' }}>Match Complete</div>
                <div style={{ color: D.textMuted, fontFamily: D.body }}>{liveScore.result.resultText}</div>
              </GlassCard>
            )}
          </>
        )}

        {/* ══════════════════ CARDS TAB ══════════════════ */}
        {activeTab === 'cards' && (() => {
          const has2ndInn = !!(liveScore?.innings2 || (liveScore?.inningsNumber ?? 1) >= 2);
          const inn2data = liveScore?.innings2;
          // Build a liveScore-compatible view for the selected innings — cast as any to merge types
          const viewScore: any = cardsInnings === 2 && inn2data
            ? { ...liveScore, batsmen: inn2data.batsmen, bowlers: inn2data.bowlers,
                partnership: inn2data.partnerships?.[inn2data.partnerships.length-1] ?? liveScore?.partnership,
                fallOfWickets: inn2data.fallOfWickets,
                currentInnings: { ...liveScore?.currentInnings, battingTeamId: inn2data.battingTeamId, bowlingTeamId: inn2data.bowlingTeamId,
                  runs: inn2data.runs, wickets: inn2data.wickets, overs: inn2data.overs, balls: inn2data.balls, runRate: inn2data.runRate } }
            : liveScore;
          const allBatsmenIds = new Set((viewScore?.batsmen || []).map((b:any) => b.playerId));
          const allTeamPlayers = (liveScore?.currentInnings?.battingTeamId === match.homeTeamId ? homePlayers : awayPlayers);
          const dnb = allTeamPlayers.filter(p => !allBatsmenIds.has(p.id));
          return (
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {/* Innings sub-tabs */}
              <div style={{ display:'flex', gap:'4px', background:D.surf2, borderRadius:D.pill, padding:'4px', overflow:'auto' }}>
                <button onClick={()=>setCardsInnings(1)} className="sh-press" style={{
                  flex:'0 0 auto', padding:'7px 20px', borderRadius:D.pill, border:'none', cursor:'pointer',
                  background:cardsInnings===1?D.grad:'transparent', fontFamily:D.head,
                  fontSize:'10px', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase',
                  color:cardsInnings===1?'#fff':D.textMuted, transition:'all .2s',
                }}>Inn 1</button>
                <button onClick={()=>setCardsInnings(2)} disabled={!has2ndInn} className="sh-press" style={{
                  flex:'0 0 auto', padding:'7px 20px', borderRadius:D.pill, border:'none', cursor:'pointer',
                  background:cardsInnings===2?D.grad:'transparent', fontFamily:D.head,
                  fontSize:'10px', fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase',
                  color:cardsInnings===2?'#fff':(!has2ndInn?D.textMuted+'55':D.textMuted), transition:'all .2s',
                  opacity:has2ndInn?1:0.4,
                }}>Inn 2</button>
              </div>
              <RichScorecardPanel liveScore={viewScore} allPlayers={allPlayers}
                strikerId={cardsInnings === (liveScore?.inningsNumber ?? 1) ? cp?.strikerId : null}
                nonStrikerId={cardsInnings === (liveScore?.inningsNumber ?? 1) ? cp?.nonStrikerId : null}
                bowlerId={cardsInnings === (liveScore?.inningsNumber ?? 1) ? cp?.bowlerId : null} />
              {/* Did Not Bat */}
              {dnb.length > 0 && (
                <div style={{ borderRadius:D.lg, border:`1px solid ${D.border}`, background:D.surf1 }}>
                  <div style={{ padding:'12px 16px', borderBottom:`1px solid ${D.border}` }}><Lbl>Did Not Bat</Lbl></div>
                  <div style={{ padding:'10px 14px', display:'flex', flexWrap:'wrap', gap:'6px 10px' }}>
                    {dnb.map((p:any) => (
                      <span key={p.id} style={{ fontFamily:D.body, fontSize:'12px', color:D.textMuted }}>
                        {p.firstName} {p.lastName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ══════════════════ ANALYSIS TAB ══════════════════ */}
        {activeTab === 'analysis' && (
          <AnalysisPanel liveScore={liveScore} subTab={analysisSubTab} onSubTab={setAnalysisSubTab}
            allPlayers={allPlayers} overs={overs} target={target} isChase={isChase}
            wagonBallLog={wagonBallLog} wagonCoords={shotCoords} onWagonAim={setShotCoords}
            wagonView={wagonView} onWagonView={setWagonView}
            hiddenLines={hiddenLines} onToggleLine={handleToggleLine} />
        )}

        {/* ══════════════════ HISTORY TAB ══════════════════ */}
        {activeTab === 'history' && (
          <HistoryPanel liveScore={liveScore} allPlayers={allPlayers} onAuditBall={setAuditingBall} />
        )}
      </div>

      {/* ── EVENT OVERLAY ── */}
      {overlay && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 500,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: `${overlay.color}15`, backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)',
          pointerEvents: 'none', animation: 'fadeIn .15s ease',
        }}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            background: `linear-gradient(135deg,${overlay.color}28,${overlay.color}10)`,
            border: `2px solid ${overlay.color}50`, borderRadius: '24px',
            padding: '40px 56px', boxShadow: `0 0 80px ${overlay.color}40,0 32px 80px rgba(0,0,0,.6)`,
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            animation: 'slideUp .22s cubic-bezier(.22,1,.36,1) both',
          }}>
            <span style={{ fontSize: '48px', lineHeight: 1 }}>{overlay.emoji}</span>
            <div style={{
              fontFamily: D.head, fontSize: '42px', fontWeight: 900, letterSpacing: '-1px',
              color: overlay.color, lineHeight: 1,
              textShadow: `0 0 40px ${overlay.color}88`,
            }}>{overlay.label}</div>
          </div>
        </div>
      )}
      {/* ── FEEDBACK TOAST ── */}
      {feedback && !overlay && (
        <div style={{
          position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)',
          background: D.gradLive, color: '#fff', padding: '10px 22px', borderRadius: D.pill,
          fontWeight: 700, fontSize: '14px', zIndex: 300, animation: 'toastIn .28s ease',
          boxShadow: `0 8px 32px ${D.emerald}40`, fontFamily: D.body, whiteSpace: 'nowrap',
        }}>
          {feedback}
        </div>
      )}

      {/* ── BOTTOM NAV ── */}
      <BottomNav active={activeTab} onChange={setActiveTab} />

      {/* ── END INNINGS CONFIRM ── */}
      {showEndInningsConfirm && (
        <div onClick={() => setShowEndInningsConfirm(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end',
            background: 'rgba(3,5,12,.75)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}>
          <div className="sh-slide-up" onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: '500px', margin: '0 auto',
              background: D.glass, backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
              border: `1px solid ${D.borderMed}`, borderBottom: 'none',
              borderRadius: `${D.xxl} ${D.xxl} 0 0`, padding: '28px 24px 36px', textAlign: 'center' }}>
            <AlertTriangle size={32} color={D.amber} style={{ marginBottom: '12px' }} />
            <div style={{ fontFamily: D.head, fontSize: '20px', fontWeight: 800, marginBottom: '8px' }}>End Innings?</div>
            <div style={{ color: D.textMuted, marginBottom: '24px', fontFamily: D.body }}>
              {ci?.runs}/{ci?.wickets} in {fmtOv(ci?.balls ?? 0)} overs
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Btn variant="ghost" full onClick={() => setShowEndInningsConfirm(false)}>Cancel</Btn>
              <Btn variant="danger" full onClick={handleEndInnings}>End Innings</Btn>
            </div>
          </div>
        </div>
      )}

      {/* ── SHEETS ── */}
      {showWicketSheet && <WicketSheet fieldingPlayers={fieldingPlayers} onConfirm={handleWicketConfirm} onClose={() => setShowWicketSheet(false)} />}
      {showExtrasSheet && <ExtrasSheet onConfirm={handleExtrasConfirm} onClose={() => setShowExtrasSheet(false)} />}
      {showShotSheet && <ShotSelectorSheet current={shotType} onSelect={s => { setShotType(s || null); setShowShotSheet(false); }} onClose={() => setShowShotSheet(false)} />}
      {showStrikerSheet && (
        <PlayerSheet title="Select Striker" players={battingPlayers}
          excludeIds={[...outBatsmenIds, cp?.nonStrikerId].filter(Boolean) as string[]}
          onSelect={handleSelectStriker} onClose={() => setShowStrikerSheet(false)} />
      )}
      {showNonStrikerSheet && (
        <PlayerSheet title="Select Non-Striker" players={battingPlayers}
          excludeIds={[...outBatsmenIds, cp?.strikerId].filter(Boolean) as string[]}
          onSelect={handleSelectNonStriker} onClose={() => setShowNonStrikerSheet(false)} />
      )}
      {showBowlerSheet && (
        <PlayerSheet title="Select Bowler" players={fieldingPlayers} excludeIds={[]}
          onSelect={handleSelectBowler} onClose={() => setShowBowlerSheet(false)} />
      )}
      {showEnrichmentDrawer && (
        <EnrichmentDrawer
          isOpen={showEnrichmentDrawer}
          onClose={() => setShowEnrichmentDrawer(false)}
          onSave={() => {
            setShowEnrichmentDrawer(false);
            setFeedback('⚡ Delivery enriched!');
            setTimeout(() => setFeedback(null), 1800);
            setContactQuality(null);
            setCommentary('');
          }}
          fieldingPlayers={fieldingPlayers}
          shotType={shotType} setShotType={setShotType}
          shotCoords={shotCoords} setShotCoords={setShotCoords}
          contactQuality={contactQuality} setContactQuality={setContactQuality}
          commentary={commentary} setCommentary={setCommentary}
          fielderId={fielderId} setFielderId={setFielderId}
        />
      )}
      {auditingBall && (
        <BallAuditEditSheet
          ball={auditingBall}
          onClose={() => setAuditingBall(null)}
          onSave={(updatedBall) => {
            setAuditingBall(null);
            setFeedback('✅ Delivery audit saved');
            setTimeout(() => setFeedback(null), 1800);
          }}
        />
      )}

      {showBroadcast && liveScore && (
        <BroadcastOverlay 
          score={ci?.runs?.toString() || "0"}
          wickets={ci?.wickets || 0}
          overs={fmtOv(ci?.balls || 0)}
          batterName={getPlayerName(allPlayers, cp?.strikerId)}
          batterRuns={striker?.runs || 0}
          batterBalls={striker?.ballsFaced || 0}
          bowlerName={getPlayerName(allPlayers, cp?.bowlerId)}
          bowlerFigures={`${fmtOv(bowler?.ballsBowled || 0)}-${bowler?.maidens || 0}-${bowler?.runsConceded || 0}-${bowler?.wickets || 0}`}
        />
      )}
    </div>
  );
}
