import React, { useState, useRef } from 'react';
import { D } from '@/lib/scoring/theme';
import { Lbl } from './primitives';

export const CX = 150, CY = 150, R_IN = 48, R_MID = 96, R_BND = 126;
export const toXY = (deg: number, r: number): [number, number] => [CX + r * Math.sin(deg * Math.PI / 180), CY - r * Math.cos(deg * Math.PI / 180)];
export const arcPath = (s: number, e: number, ro: number, ri: number) => {
  const [ax, ay] = toXY(s, ro); const [bx, by] = toXY(e, ro);
  const [cx, cy] = toXY(s, ri); const [dx, dy] = toXY(e, ri);
  const lg = ((e - s + 360) % 360) > 180 ? 1 : 0;
  return `M${cx} ${cy} L${ax} ${ay} A${ro} ${ro} 0 ${lg} 1 ${bx} ${by} L${dx} ${dy} A${ri} ${ri} 0 ${lg} 0 ${cx} ${cy} Z`;
};
export const piePath = (s: number, e: number, ro: number) => {
  const [ax, ay] = toXY(s, ro); const [bx, by] = toXY(e, ro);
  const lg = ((e - s + 360) % 360) > 180 ? 1 : 0;
  return `M${CX} ${CY} L${ax} ${ay} A${ro} ${ro} 0 ${lg} 1 ${bx} ${by} Z`;
};
export const SEGS = [
  { id: 0, label: 'Fine Leg', short: 'FLG', angle: 27, side: 'leg' },
  { id: 1, label: 'Square Leg', short: 'SQL', angle: 80, side: 'leg' },
  { id: 2, label: 'Mid Wicket', short: 'MWK', angle: 117, side: 'leg' },
  { id: 3, label: 'Mid On', short: 'MON', angle: 148, side: 'leg' },
  { id: 4, label: 'Long On', short: 'LON', angle: 164, side: 'leg' },
  { id: 5, label: 'Straight', short: 'STR', angle: 180, side: 'neutral' },
  { id: 6, label: 'Long Off', short: 'LOF', angle: 196, side: 'off' },
  { id: 7, label: 'Mid Off', short: 'MOF', angle: 212, side: 'off' },
  { id: 8, label: 'Cover', short: 'COV', angle: 243, side: 'off' },
  { id: 9, label: 'Point', short: 'PNT', angle: 280, side: 'off' },
  { id: 10, label: 'Gully', short: 'GUL', angle: 313, side: 'off' },
  { id: 11, label: 'Third Man', short: '3MN', angle: 333, side: 'off' },
] as const;
export const SEG_BOUNDS = SEGS.map((_, i) => {
  const prev = SEGS[(i - 1 + SEGS.length) % SEGS.length];
  const next = SEGS[(i + 1) % SEGS.length];
  const cur = SEGS[i];
  let diff = (cur.angle - prev.angle + 360) % 360;
  const s = (prev.angle + diff / 2 + 360) % 360;
  diff = (next.angle - cur.angle + 360) % 360;
  const e = (cur.angle + diff / 2) % 360;
  return { s, e };
});
export const LK_COLS: { [k: string]: string } = { '4': D.indigo, '6': D.amber, '1-3': D.emerald, '0': D.textMuted, 'W': D.rose, 'extras': D.orange };
export const lineKey = (b: any) => {
  if (b.isWicket || b.type === 'W') return 'W';
  if (b.extraType === 'wide' || b.extraType === 'noball' || b.type === 'Wd' || b.type === 'Nb') return 'extras';
  const runs = b.runs ?? b.value ?? 0;
  if (runs === 6) return '6'; if (runs === 4) return '4'; if (runs === 0) return '0'; return '1-3';
};
export const heatColor = (v: number, mx: number) => {
  if (!mx || !v) return null; const t = v / mx;
  if (t < .25) return `rgba(16,185,129,${.22 + t * 2})`;
  if (t < .5) return `rgba(245,158,11,${.3 + t * 1.2})`;
  if (t < .75) return `rgba(249,115,22,${.38 + t})`;
  return `rgba(244,63,94,${.5 + t * .5})`;
};
export const wagEnd = (angle: number, b: any): [number, number] => {
  const runs = b.runs ?? b.value ?? 0;
  let r;
  if (b.isWicket || b.type === 'W') r = 28;
  else if (runs === 6) r = R_BND + 13;
  else if (runs === 4) r = R_BND - 1;
  else if (runs === 3) r = R_MID - 10;
  else if (runs === 2) r = R_MID - 24;
  else if (runs === 1) r = R_IN + 10;
  else r = R_IN - 16;
  return toXY(angle, r);
};

export function WagonWheelField({ ballLog = [], shotCoords, onAim, viewMode, onViewMode, hiddenLines, onToggleLine }: {
  ballLog?: any[]; shotCoords: { angle: number; distance: number } | null; onAim?: (c: { angle: number; distance: number }) => void;
  viewMode: 'wagon' | 'heatmap'; onViewMode: (m: 'wagon' | 'heatmap') => void;
  hiddenLines: Set<string>; onToggleLine: (k: string) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hov, setHov] = useState<number | null>(null);
  const segRuns = Array(12).fill(0);
  ballLog.forEach((b: any) => { if (b.seg != null) segRuns[b.seg] += (b.runs ?? b.value ?? 0); });
  const maxR = Math.max(...segRuns, 1);
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onAim) return;
    const svg = svgRef.current; if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 300 - CX;
    const y = ((e.clientY - rect.top) / rect.height) * 300 - CY;
    const dist = Math.sqrt(x * x + y * y);
    if (dist < 8 || dist > R_BND + 20) return;
    let angle = Math.atan2(x, -y) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    const distance = Math.min(100, Math.round((dist / (R_BND + 4)) * 100));
    onAim({ angle: Math.round(angle), distance });
  };
  const visLines = ballLog.filter((b: any) => b.seg != null && !hiddenLines.has(lineKey(b)));
  const aimXY = shotCoords ? toXY(shotCoords.angle, (shotCoords.distance / 100) * (R_BND + 4)) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Lbl>Field Map</Lbl>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '2px', background: D.surf3, borderRadius: D.pill, padding: '3px' }}>
          {(['wagon', 'heatmap'] as const).map(m => (
            <button key={m} onClick={() => onViewMode(m)} className="sh-press" style={{
              padding: '4px 12px', borderRadius: D.pill, border: 'none', cursor: 'pointer',
              background: viewMode === m ? D.grad : 'transparent',
              color: viewMode === m ? '#fff' : D.textMuted,
              fontFamily: D.head, fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', transition: 'all .25s',
            }}>{m === 'wagon' ? 'Wheel' : 'Heat'}</button>
          ))}
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: '280px', margin: '0 auto', aspectRatio: '1', userSelect: 'none' }}>
        <svg ref={svgRef} viewBox="0 0 300 300" style={{ width: '100%', height: '100%', display: 'block', cursor: onAim ? 'crosshair' : 'default' }} onClick={handleClick}>
          <defs>
            <radialGradient id="gField" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0d1f10" /><stop offset="100%" stopColor="#050e07" />
            </radialGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
          </defs>
          <circle cx={CX} cy={CY} r={R_BND + 4} fill="url(#gField)" />
          <circle cx={CX} cy={CY} r={R_BND + 1} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
          {/* Outer segments */}
          {SEGS.map((seg, i) => {
            const hv = hov === seg.id;
            const fill = viewMode === 'heatmap' ? (heatColor(segRuns[seg.id], maxR) || 'rgba(255,255,255,0.02)') : hv ? 'rgba(14,165,233,.15)' : 'rgba(255,255,255,0.02)';
            return (<path key={`b${seg.id}`} d={arcPath(SEG_BOUNDS[i].s, SEG_BOUNDS[i].e, R_BND, R_MID)} fill={fill}
              stroke="rgba(255,180,50,0.15)" strokeWidth="0.5"
              onMouseEnter={() => setHov(seg.id)} onMouseLeave={() => setHov(null)} />);
          })}
          <circle cx={CX} cy={CY} r={R_MID} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="4 4" />
          {/* Infield segments */}
          {SEGS.map((seg, i) => (
            <path key={`o${seg.id}`} d={arcPath(SEG_BOUNDS[i].s, SEG_BOUNDS[i].e, R_MID, R_IN)}
              fill={hov === seg.id ? 'rgba(14,165,233,.12)' : 'transparent'}
              stroke="rgba(255,255,255,0.03)" strokeWidth="0.4"
              onMouseEnter={() => setHov(seg.id)} onMouseLeave={() => setHov(null)} />
          ))}
          <circle cx={CX} cy={CY} r={R_IN} fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" strokeDasharray="2 5" />
          {SEGS.map((seg, i) => (
            <path key={`i${seg.id}`} d={piePath(SEG_BOUNDS[i].s, SEG_BOUNDS[i].e, R_IN)}
              fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="0.4"
              onMouseEnter={() => setHov(seg.id)} onMouseLeave={() => setHov(null)} />
          ))}
          {/* Spokes */}
          {SEG_BOUNDS.map((b, i) => {
            const [xa, ya] = toXY(b.s, R_BND + 1);
            return <line key={`sp${i}`} x1={CX} y1={CY} x2={xa} y2={ya} stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" style={{ pointerEvents: 'none' }} />;
          })}
          {/* Shot lines */}
          {viewMode === 'wagon' && visLines.map((b: any, i: number) => {
            if (b.seg == null) return null;
            const [ex, ey] = wagEnd(SEGS[b.seg].angle, b);
            const col = LK_COLS[lineKey(b)];
            const runs = b.runs ?? b.value ?? 0;
            const w = runs === 6 ? 2.5 : runs === 4 ? 2 : 1.2;
            return (<line key={`wl${i}`} x1={CX} y1={CY} x2={ex} y2={ey} stroke={col} strokeWidth={w}
              opacity={runs === 0 ? 0.22 : 0.75} strokeLinecap="round" className="sh-wagon-line" style={{ animationDelay: `${i * .02}s` }} />);
          })}
          {viewMode === 'wagon' && visLines.filter((b: any) => (b.runs ?? b.value ?? 0) >= 4).map((b: any, i: number) => {
            if (b.seg == null) return null;
            const [ex, ey] = wagEnd(SEGS[b.seg].angle, b);
            return (<circle key={`dt${i}`} cx={ex} cy={ey} r={(b.runs ?? b.value ?? 0) === 6 ? 5 : 3.5}
              fill={LK_COLS[lineKey(b)]} opacity="0.95" style={{ pointerEvents: 'none', filter: (b.runs ?? b.value ?? 0) === 6 ? 'url(#glow)' : 'none' }} />);
          })}
          {/* Heatmap run counts */}
          {viewMode === 'heatmap' && SEGS.map(seg => {
            if (!segRuns[seg.id]) return null;
            const [lx, ly] = toXY(seg.angle, (R_IN + R_MID) / 2 + 14);
            return (<text key={`hr${seg.id}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fontFamily="'DM Mono',monospace" fontWeight="600"
              fill="rgba(255,255,255,0.7)" style={{ pointerEvents: 'none' }}>{segRuns[seg.id]}</text>);
          })}
          {/* Pitch */}
          <rect x={CX - 4} y={CY - 16} width={8} height={32} rx="2" fill="#8a7a50" stroke="rgba(200,170,80,0.4)" strokeWidth="0.7" style={{ pointerEvents: 'none' }} />
          <line x1={CX - 5.5} y1={CY - 12} x2={CX + 5.5} y2={CY - 12} stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" style={{ pointerEvents: 'none' }} />
          <line x1={CX - 5.5} y1={CY + 12} x2={CX + 5.5} y2={CY + 12} stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" style={{ pointerEvents: 'none' }} />
          {[-2.8, 0, 2.8].map(x => (
            <rect key={`st${x}`} x={CX + x - 0.6} y={CY - 17} width={1.2} height={5} rx="0.4" fill="rgba(255,255,255,0.85)" style={{ pointerEvents: 'none' }} />
          ))}
          <circle cx={CX} cy={CY - 11} r="3" fill="#34d399" stroke="rgba(255,255,255,0.3)" strokeWidth="0.7" style={{ pointerEvents: 'none' }} />
          {/* Segment labels */}
          {SEGS.map(seg => {
            const [lx, ly] = toXY(seg.angle, (R_IN + R_MID) / 2 + 2);
            return (<text key={`lb${seg.id}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fontFamily="'Syne',sans-serif" fontWeight={hov === seg.id ? '700' : '400'}
              fill={hov === seg.id ? '#7dd3fc' : 'rgba(255,255,255,0.28)'} style={{ pointerEvents: 'none' }}>{seg.short}</text>);
          })}
          {/* OFF / LEG */}
          <text x={14} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="6"
            fontFamily="'Syne',sans-serif" letterSpacing="1" fill="rgba(255,255,255,0.15)"
            transform={`rotate(-90,14,${CY})`} style={{ pointerEvents: 'none' }}>OFF</text>
          <text x={286} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="6"
            fontFamily="'Syne',sans-serif" letterSpacing="1" fill="rgba(255,255,255,0.15)"
            transform={`rotate(90,286,${CY})`} style={{ pointerEvents: 'none' }}>LEG</text>
          {/* Aim preview */}
          {aimXY && (
            <>
              <line x1={CX} y1={CY} x2={aimXY[0]} y2={aimXY[1]}
                stroke={D.emerald} strokeWidth="1.5" strokeDasharray="5 3" opacity="0.7" style={{ pointerEvents: 'none' }} />
              <circle cx={aimXY[0]} cy={aimXY[1]} r="5" fill={D.emerald} opacity="0.9"
                style={{ pointerEvents: 'none', filter: `drop-shadow(0 0 6px ${D.emerald})` }} />
            </>
          )}
        </svg>
      </div>
      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', flexWrap: 'wrap' }}>
        {Object.entries(LK_COLS).map(([k, col]) => {
          const off = hiddenLines.has(k);
          return (<button key={k} onClick={() => onToggleLine(k)} className="sh-press" style={{
            display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: D.pill,
            cursor: 'pointer', background: off ? 'transparent' : `${col}12`,
            border: `1px solid ${off ? D.border : `${col}38`}`, opacity: off ? 0.3 : 1, transition: 'all .2s',
          }}>
            <div style={{ width: '10px', height: '2px', borderRadius: '2px', background: off ? D.textMuted : col }} />
            <span style={{ color: off ? D.textMuted : D.textSecondary, fontSize: '9px', fontFamily: D.head, fontWeight: 600, letterSpacing: '0.05em' }}>{k}</span>
          </button>);
        })}
      </div>
      {shotCoords && (
        <div style={{ textAlign: 'center', fontSize: '11px', color: D.emerald, fontFamily: D.mono }}>
          Aimed {shotCoords.angle}° · {shotCoords.distance}% · {SEGS.reduce((closest, s) => {
            const diff = Math.abs(((shotCoords.angle - s.angle) + 360) % 360);
            const cdiff = Math.abs(((shotCoords.angle - closest.angle) + 360) % 360);
            return diff < cdiff ? s : closest;
          }, SEGS[0]).label}
        </div>
      )}
    </div>
  );
}
