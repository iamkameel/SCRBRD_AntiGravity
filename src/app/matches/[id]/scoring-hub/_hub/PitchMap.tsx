import React, { memo } from 'react';
import { D } from './design';
import { Lbl } from './primitives';
import { scoringAudio } from './audio';

interface PitchMapProps {
  onSelectPitchingPoint?: (point: { line: 'off' | 'middle' | 'leg'; length: 'yorker' | 'full' | 'good' | 'short' | 'bouncer'; x: number; y: number }) => void;
  selectedPoint?: { x: number; y: number; length?: string; line?: string } | null;
  pitchLog?: Array<{ x: number; y: number; runs?: number; wicket?: boolean }>;
}

function PitchMapImpl({ onSelectPitchingPoint, selectedPoint, pitchLog = [] }: PitchMapProps) {
  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * 160;
    const svgY = ((e.clientY - rect.top) / rect.height) * 360;

    const clampedX = Math.max(25, Math.min(135, svgX));
    const clampedY = Math.max(30, Math.min(330, svgY));

    let line: 'off' | 'middle' | 'leg' = 'middle';
    if (clampedX < 62) line = 'off';
    else if (clampedX > 98) line = 'leg';

    const distFromBatter = 330 - clampedY;
    let length: 'yorker' | 'full' | 'good' | 'short' | 'bouncer' = 'good';
    if (distFromBatter < 45) length = 'yorker';
    else if (distFromBatter < 110) length = 'full';
    else if (distFromBatter < 185) length = 'good';
    else if (distFromBatter < 255) length = 'short';
    else length = 'bouncer';

    if (onSelectPitchingPoint) {
      onSelectPitchingPoint({ line, length, x: clampedX, y: clampedY });
      scoringAudio.playKeyClick();
      scoringAudio.vibrate(15);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '280px' }}>
        <Lbl>Pitch Landing Map</Lbl>
        <span style={{ fontSize: '10px', fontFamily: D.mono, color: D.emerald }}>
          {selectedPoint ? `${selectedPoint.length?.toUpperCase()} · ${selectedPoint.line?.toUpperCase()}` : 'Tap pitch to plot'}
        </span>
      </div>

      <div style={{ width: '100%', maxWidth: '240px', aspectRatio: '160/360', background: 'radial-gradient(ellipse at center, #1b261b 0%, #0d150e 100%)', borderRadius: D.md, border: `1px solid ${D.borderMed}`, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
        <svg viewBox="0 0 160 360" onClick={handleClick} style={{ width: '100%', height: '100%', display: 'block' }}>
          <rect x="0" y="0" width="160" height="360" fill="#142016" />
          <rect x="25" y="20" width="110" height="320" fill="#7a6946" opacity="0.85" rx="4" />

          {/* Crease lines */}
          <line x1="25" y1="50" x2="135" y2="50" stroke="#fff" strokeWidth="1.5" opacity="0.8" />
          <line x1="45" y1="30" x2="45" y2="50" stroke="#fff" strokeWidth="1" opacity="0.8" />
          <line x1="115" y1="30" x2="115" y2="50" stroke="#fff" strokeWidth="1" opacity="0.8" />

          <line x1="25" y1="310" x2="135" y2="310" stroke="#fff" strokeWidth="1.5" opacity="0.8" />
          <line x1="45" y1="310" x2="45" y2="330" stroke="#fff" strokeWidth="1" opacity="0.8" />
          <line x1="115" y1="310" x2="115" y2="330" stroke="#fff" strokeWidth="1" opacity="0.8" />

          {/* Stumps */}
          {[-4, 0, 4].map(dx => (
            <circle key={`top-${dx}`} cx={80 + dx} cy={35} r="1.5" fill="#f59e0b" />
          ))}
          {[-4, 0, 4].map(dx => (
            <circle key={`bot-${dx}`} cx={80 + dx} cy={325} r="1.5" fill="#f59e0b" />
          ))}

          {/* Length Zone Dividers */}
          <line x1="25" y1="285" x2="135" y2="285" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
          <line x1="25" y1="220" x2="135" y2="220" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
          <line x1="25" y1="145" x2="135" y2="145" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />
          <line x1="25" y1="75" x2="135" y2="75" stroke="rgba(255,255,255,0.15)" strokeDasharray="3 3" />

          {/* Line Dividers */}
          <line x1="62" y1="20" x2="62" y2="340" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 4" />
          <line x1="98" y1="20" x2="98" y2="340" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 4" />

          {/* Zone Labels */}
          <text x="14" y="300" fontSize="7" fontFamily="'Syne',sans-serif" fill="rgba(255,255,255,0.35)">YORKER</text>
          <text x="14" y="255" fontSize="7" fontFamily="'Syne',sans-serif" fill="rgba(255,255,255,0.35)">FULL</text>
          <text x="14" y="185" fontSize="7" fontFamily="'Syne',sans-serif" fill="rgba(255,255,255,0.35)">GOOD</text>
          <text x="14" y="110" fontSize="7" fontFamily="'Syne',sans-serif" fill="rgba(255,255,255,0.35)">SHORT</text>
          <text x="14" y="50" fontSize="7" fontFamily="'Syne',sans-serif" fill="rgba(255,255,255,0.35)">BOUNCER</text>

          {/* Line Labels */}
          <text x="43" y="14" textAnchor="middle" fontSize="6.5" fontFamily="'Syne',sans-serif" fill="rgba(255,255,255,0.4)">OFF</text>
          <text x="80" y="14" textAnchor="middle" fontSize="6.5" fontFamily="'Syne',sans-serif" fill="rgba(255,255,255,0.4)">MID</text>
          <text x="117" y="14" textAnchor="middle" fontSize="6.5" fontFamily="'Syne',sans-serif" fill="rgba(255,255,255,0.4)">LEG</text>

          {/* Historical Pitch Points */}
          {pitchLog.map((p, idx) => (
            <circle key={idx} cx={p.x} cy={p.y} r={p.wicket ? 4 : 3} fill={p.wicket ? D.rose : p.runs === 4 ? D.amber : p.runs === 6 ? D.indigo : D.emerald} opacity="0.65" />
          ))}

          {/* Currently Selected Landing Point */}
          {selectedPoint && (
            <g>
              <circle cx={selectedPoint.x} cy={selectedPoint.y} r="7" fill={D.emerald} opacity="0.3" className="sh-live-glow" />
              <circle cx={selectedPoint.x} cy={selectedPoint.y} r="4" fill={D.emerald} stroke="#fff" strokeWidth="1.5" />
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}

export const PitchMap = memo(PitchMapImpl);
