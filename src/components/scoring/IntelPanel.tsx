import React, { useState, useEffect, useRef } from 'react';
import { D } from '@/lib/scoring/theme';
import { Lbl, Badge } from './primitives';
import { buildSignals, buildNarratives } from '@/lib/scoring/intelUtils';

export function SignalBar({ label, value, pct, color }: { label: string; value: string | number; pct: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <span style={{ fontFamily: D.head, fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: D.textSecondary }}>{label}</span>
        <span style={{ fontFamily: D.mono, fontSize: '11px', fontWeight: 700, color: D.textPrimary }}>{value}</span>
      </div>
      <div style={{ height: '4px', borderRadius: '2px', background: D.surf0, overflow: 'hidden' }}>
        <div style={{ width: `${Math.max(2, pct)}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width .5s cubic-bezier(.22,1,.36,1)' }} />
      </div>
    </div>
  );
}

export function IntelPanel({ liveScore, overs, target, isChase }: { liveScore: any; overs: number; target?: number; isChase: boolean }) {
  const [idx, setIdx] = useState(0);
  const [auto, setAuto] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const sig = buildSignals(liveScore, overs, target, isChase);
  const cards = buildNarratives(sig);
  
  useEffect(() => {
    if (!auto || !cards || !cards.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => setIdx(p => (p + 1) % Math.max(1, cards.length)), 6200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, cards.length]);
  
  useEffect(() => setIdx(0), [cards.length]);
  
  if (!sig || !cards || !cards.length) return (
    <div style={{ background: D.surf1, borderRadius: D.lg, padding: '18px 20px', border: `1px solid ${D.border}` }}>
      <Lbl>Match Intelligence</Lbl>
      <div style={{ color: D.textMuted, fontSize: '13px', fontFamily: D.body, lineHeight: 1.5, marginTop: '10px' }}>Intelligence builds as the match develops…</div>
    </div>
  );
  
  const card = cards[Math.min(idx, cards.length - 1)];
  const phaseCol = sig.phase === 'POWERPLAY' ? D.emerald : sig.phase === 'MIDDLE' ? D.amber : D.orange;
  
  return (
    <div style={{
      borderRadius: D.lg, overflow: 'hidden', position: 'relative',
      background: `linear-gradient(145deg,${D.surf1},${D.surf2})`,
      border: `1px solid ${card.accent}30`,
      boxShadow: `0 8px 40px rgba(0,0,0,.4),0 0 60px ${card.accent}08`,
      transition: 'border-color .5s,box-shadow .5s'
    }}>
      <div style={{ height: '2px', background: `linear-gradient(90deg,${card.accent},${card.accent}00)` }} />
      <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, flexWrap: 'wrap' }}>
          <Lbl>Intelligence</Lbl>
          <Badge color={phaseCol}>{sig.phase}</Badge>
          <Badge color={sig.pressureColor}>{sig.pressureLabel}</Badge>
          <Badge color={sig.momColor}>{sig.momLabel}</Badge>
        </div>
        <button onClick={() => setAuto(p => !p)} className="sh-press"
          style={{
            padding: '3px 8px', borderRadius: D.pill, cursor: 'pointer', fontFamily: D.head, fontSize: '9px',
            border: `1px solid ${auto ? D.emerald + '44' : D.border}`, background: 'transparent',
            color: auto ? D.emerald : D.textMuted, transition: 'all .2s'
          }}>
          {auto ? '⏸' : '▶'}
        </button>
      </div>
      <div style={{ padding: '16px 18px', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: -10, right: -10, width: '80px', height: '80px', borderRadius: '50%',
          background: `${card.accent}14`, filter: 'blur(28px)', pointerEvents: 'none'
        }} />
        <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 700, color: card.accent, marginBottom: '12px', lineHeight: 1.3 }}>{card.hl}</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {card.chips.map((chip: any, i: number) => (
            <div key={i} style={{
              background: D.surf0, border: `1px solid ${chip.c ? `${chip.c}28` : D.border}`,
              borderRadius: D.md, padding: '8px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '52px', gap: '3px'
            }}>
              <span style={{ fontFamily: D.mono, fontSize: '17px', fontWeight: 500, color: chip.c || D.textPrimary, lineHeight: 1 }}>{chip.v}</span>
              <span style={{ fontFamily: D.head, fontSize: '7.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: D.textMuted }}>{chip.l}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', borderTop: `1px solid ${D.border}`, paddingTop: '12px' }}>
          <SignalBar label="Pressure" value={`${sig.pressure}%`} pct={sig.pressure} color={sig.pressureColor} />
          <SignalBar label="Momentum" value={sig.momLabel} pct={50 + sig.mom / 2} color={sig.momColor} />
          <SignalBar label={sig.reqRr ? 'Req RR' : 'Run Rate'} value={sig.reqRr ?? sig.rr} pct={Math.min(100, ((sig.reqRr || sig.rr) / 18) * 100)} color={sig.reqRr && sig.rrDelta !== null && sig.rrDelta < -1 ? D.rose : D.sky} />
        </div>
      </div>
      <div style={{ padding: '8px 16px', borderTop: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', gap: '8px', background: `${D.surf0}55` }}>
        <div style={{ display: 'flex', gap: '3px', flex: 1 }}>
          {cards.map((_: any, i: number) => (
            <button key={i} onClick={() => { setIdx(i); setAuto(false); }}
              style={{
                width: i === idx ? '16px' : '6px', height: '6px', borderRadius: '4px', border: 'none', cursor: 'pointer', padding: 0,
                background: i === idx ? card.accent : `${D.textMuted}30`, transition: 'all .3s ease'
              }} />
          ))}
        </div>
        <span style={{ color: D.textMuted, fontSize: '9px', fontFamily: D.mono, flexShrink: 0 }}>{idx + 1}/{cards.length}</span>
        {sig.flags.slice(0, 2).map((f: string) => (
          <Badge key={f} color={D.orange}>{f.replace(/_/g, ' ')}</Badge>
        ))}
      </div>
    </div>
  );
}
