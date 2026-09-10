import React from 'react';
import { D } from '@/lib/scoring/theme';
import { SHOT_CATEGORIES } from './constants';
import { X, RotateCcw } from 'lucide-react';
import { Lbl } from './primitives';

interface HubScoringProps {
  runs: number | null;
  setRuns: (r: number | null) => void;
  wicketType: string | null;
  setWicketType: (w: string | null) => void;
  extraType: string | null;
  setExtraType: (e: string | null) => void;
  extraRuns: number;
  penaltyRuns: number;
  setPenaltyRuns: (p: number | ((prev: number) => number)) => void;
  shotType: string | null;
  setShotType: (s: string | null) => void;
  shotCoords: { angle: number; distance: number } | null;
  setShotCoords: (c: { angle: number; distance: number } | null) => void;
  setFielderId: (id: string | null) => void;
  setShowWicketSheet: (v: boolean) => void;
  setShowExtrasSheet: (v: boolean) => void;
  setShowShotSheet: (v: boolean) => void;
  handleRecord: () => void;
  handleUndo: () => void;
  canRecord: boolean;
  submitting: boolean;
  currentOverLength: number;
}

export function HubScoring({
  runs, setRuns, wicketType, setWicketType, extraType, setExtraType, extraRuns, penaltyRuns, setPenaltyRuns,
  shotType, setShotType, shotCoords, setShotCoords, setFielderId,
  setShowWicketSheet, setShowExtrasSheet, setShowShotSheet,
  handleRecord, handleUndo, canRecord, submitting, currentOverLength
}: HubScoringProps) {
  return (
    <div style={{ background: D.surf1, border: `1px solid ${D.border}`, borderRadius: D.lg, padding: '18px 16px' }}>
      <Lbl>Record Ball</Lbl>
      <div style={{ height: '12px' }} />

      {/* Runs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '7px', marginBottom: '10px' }}>
        {[0, 1, 2, 3, 4, 6].map(r => {
          const sel = runs === r && !wicketType;
          const col = r === 6 ? D.violet : r === 4 ? D.indigo : r > 0 ? D.emerald : D.textMuted;
          return (
            <button key={r} onClick={() => { setRuns(r); setWicketType(null); setExtraType(null); }} className="sh-press"
              style={{
                padding: '15px 0', borderRadius: D.lg, border: `2px solid ${sel ? col : D.border}`,
                background: sel ? `${col}18` : D.surf2, color: sel ? col : D.textPrimary,
                fontFamily: D.mono, fontSize: '19px', fontWeight: 700, cursor: 'pointer',
                boxShadow: sel ? `0 0 12px ${col}25` : 'none', transition: 'all .15s'
              }}>
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
        <span>{shotType ? `🏏 ${SHOT_CATEGORIES.flatMap((c: any) => c.shots).find((s: any) => s.id === shotType)?.label || shotType}` : '🏏 Shot type (optional)'}</span>
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

      {/* Record + Undo */}
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
        <button onClick={handleUndo} disabled={submitting || currentOverLength === 0} className="sh-press" style={{
          padding: '15px 16px', borderRadius: D.lg, background: D.surf2, border: `1px solid ${D.border}`,
          color: D.textMuted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <RotateCcw size={17} />
        </button>
      </div>
    </div>
  );
}
