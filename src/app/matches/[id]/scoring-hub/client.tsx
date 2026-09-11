'use client';

import { useState, useEffect, useRef } from 'react';
import { useLiveScore } from '@/hooks/useLiveScore';
import { Match, Person, LiveScoreProjection } from '@/types/firestore';
import { BatsmanProjection, BowlerProjection } from '@/types/scoring';
import {
  recordBallAction,
  updateLivePlayersAction,
  undoLastBallAction,
  endInningsAction,
  startSecondInningsAction,
} from '@/app/actions/matchActions';
import { generateCommentary } from '@/lib/utils/commentaryGenerator';
import Link from 'next/link';

import { ChevronLeft, RotateCcw, Flag, AlertTriangle, Users, Trophy, Loader2, Wifi, WifiOff, X, Check, Play, Pause, Tv, Volume2, VolumeX, Mic, MicOff, Sparkles } from 'lucide-react';
import { BroadcastOverlay } from '@/components/broadcast/BroadcastOverlay';

/* ═══════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════ */
interface ScoringHubClientProps {
  match: Match;
  homePlayers: Person[];
  awayPlayers: Person[];
}
type ExtraType = 'wide' | 'noball' | 'bye' | 'legbye' | null;
type WicketMode = 'bowled' | 'caught' | 'lbw' | 'stumped' | 'run_out' | 'hit_wicket' | null;
type ShotTypeChoice = string | null;
type ScorerMode = 'quick' | 'standard' | 'full';
type ContactQuality = 'middled' | 'edged' | 'missed' | 'lofted' | 'defended' | null;
type ActiveTab = 'score' | 'cards' | 'analysis' | 'history';
type AnalysisSubTab = 'charts' | 'players' | 'signals' | 'intel';

/* ═══════════════════════════════════════════════════════
   DESIGN SYSTEM
═══════════════════════════════════════════════════════ */
const D = {
  base:'#05080f', surf0:'#080c16', surf1:'#0c1220', surf2:'#101829', surf3:'#141e32',
  glass:'rgba(10,14,28,0.75)',
  grad:'linear-gradient(135deg,#4f46e5,#0ea5e9)',
  gradLive:'linear-gradient(135deg,#10b981,#06b6d4)',
  indigo:'#4f46e5', sky:'#0ea5e9', emerald:'#10b981', amber:'#f59e0b',
  rose:'#f43f5e', orange:'#f97316', violet:'#7c3aed', cyan:'#06b6d4',
  textPrimary:'#f0f4ff', textSecondary:'#8892aa', textMuted:'#3d4d66',
  border:'rgba(255,255,255,0.07)', borderMed:'rgba(255,255,255,0.12)',
  sm:'8px', md:'12px', lg:'16px', xl:'20px', xxl:'24px', pill:'9999px',
  mono:"'DM Mono',monospace", head:"'Syne',sans-serif", body:"'DM Sans',sans-serif",
};

/* ═══════════════════════════════════════════════════════
   STADIUM AUDIO & HAPTIC ENGINE
═══════════════════════════════════════════════════════ */
class ScoringAudioEngine {
  private ctx: AudioContext | null = null;
  public soundEnabled: boolean = true;
  public speechEnabled: boolean = false;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    return this.soundEnabled;
  }

  public toggleSpeech() {
    this.speechEnabled = !this.speechEnabled;
    return this.speechEnabled;
  }

  public setSpeechEnabled(enabled: boolean) {
    this.speechEnabled = enabled;
    return this.speechEnabled;
  }

  public playKeyClick() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {}
  }

  public playBoundary4() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.15);

      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, now);
      noiseGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now + 0.04);
    } catch {}
  }

  public playBoundary6() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      [0, 0.08].forEach((offset) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520 + offset * 1000, now + offset);
        osc.frequency.exponentialRampToValueAtTime(1600, now + offset + 0.08);
        gain.gain.setValueAtTime(0.45, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.2);
      });

      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, now);
      noiseGain.gain.linearRampToValueAtTime(0.35, now + 0.15);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      noise.start(now + 0.05);
    } catch {}
  }

  public playWicket() {
    if (!this.soundEnabled) return;
    this.init();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.25);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  public vibrate(pattern: number | number[]) {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try { navigator.vibrate(pattern); } catch {}
    }
  }

  public speak(text: string) {
    if (!this.speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {}
  }
}

export const scoringAudio = new ScoringAudioEngine();

/* ═══════════════════════════════════════════════════════
   2D PITCH LANDING MAP (PitchMap)
═══════════════════════════════════════════════════════ */
interface PitchMapProps {
  onSelectPitchingPoint?: (point: { line: 'off' | 'middle' | 'leg'; length: 'yorker' | 'full' | 'good' | 'short' | 'bouncer'; x: number; y: number }) => void;
  selectedPoint?: { x: number; y: number; length?: string; line?: string } | null;
  pitchLog?: Array<{ x: number; y: number; runs?: number; wicket?: boolean }>;
}

function PitchMap({ onSelectPitchingPoint, selectedPoint, pitchLog = [] }: PitchMapProps) {
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


/* ═══════════════════════════════════════════════════════
   PRIMITIVES
═══════════════════════════════════════════════════════ */
function Lbl({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{fontFamily:D.head,fontSize:'10px',fontWeight:700,letterSpacing:'0.15em',
      textTransform:'uppercase',color:color||D.textMuted}}>{children}</div>
  );
}

function Sep({ my = 12 }: { my?: number }) {
  return <div style={{height:'1px',background:D.border,margin:`${my}px 0`}} />;
}

function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{fontFamily:D.head,fontSize:'9px',fontWeight:700,letterSpacing:'0.12em',
      textTransform:'uppercase',padding:'3px 8px',borderRadius:D.pill,
      background:`${color}1e`,color,border:`1px solid ${color}30`,flexShrink:0}}>{children}</span>
  );
}

function Btn({ children, onClick, disabled, variant = 'primary', full, sx }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  variant?: string; full?: boolean; sx?: React.CSSProperties;
}) {
  const V: Record<string, React.CSSProperties> = {
    primary:{background:disabled?D.surf2:D.grad,color:disabled?D.textMuted:'#fff',border:'none',boxShadow:disabled?'none':'0 4px 24px rgba(79,70,229,.4)'},
    danger:{background:disabled?D.surf2:`linear-gradient(135deg,${D.rose},#dc2626)`,color:disabled?D.textMuted:'#fff',border:'none',boxShadow:disabled?'none':`0 4px 20px ${D.rose}40`},
    ghost:{background:'transparent',color:D.textSecondary,border:`1px solid ${D.border}`},
    tonal:{background:D.surf2,color:D.textPrimary,border:`1px solid ${D.borderMed}`},
    amber:{background:disabled?D.surf2:`${D.amber}1a`,color:disabled?D.textMuted:D.amber,border:`1px solid ${disabled?D.border:D.amber+'44'}`},
  };
  const v = V[variant] || V.primary;
  return (
    <button className="sh-press" disabled={!!disabled} onClick={!disabled?onClick:undefined}
      style={{...v,padding:'12px 20px',borderRadius:D.pill,cursor:disabled?'not-allowed':'pointer',
        fontFamily:D.body,fontSize:'13px',fontWeight:600,width:full?'100%':undefined,
        whiteSpace:'nowrap',opacity:disabled?0.42:1,transition:'all .15s',...sx}}>
      {children}
    </button>
  );
}

function SignalBar({ label, value, pct, color }: { label: string; value: string | number; pct: number; color: string }) {
  return (
    <div style={{animation:'barSlide .3s ease both'}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
        <Lbl>{label}</Lbl>
        <span style={{fontFamily:D.mono,fontSize:'11px',color}}>{value}</span>
      </div>
      <div style={{height:'3px',borderRadius:'2px',background:D.surf3,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${Math.min(100,Math.max(0,pct))}%`,background:color,borderRadius:'2px',transition:'width .8s ease'}} />
      </div>
    </div>
  );
}

function Sheet({ children, title, accent, onClose }: { children: React.ReactNode; title?: string; accent?: string; onClose: () => void }) {
  return (
    <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
      <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(3,5,12,.75)',backdropFilter:'blur(6px)',WebkitBackdropFilter:'blur(6px)'}} />
      <div className="sh-slide-up" style={{position:'relative',background:D.glass,backdropFilter:'blur(28px) saturate(1.8)',
        WebkitBackdropFilter:'blur(28px) saturate(1.8)',border:`1px solid ${D.borderMed}`,
        borderBottom:'none',borderRadius:`${D.xxl} ${D.xxl} 0 0`,
        boxShadow:'0 -32px 80px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.1)',
        maxHeight:'92vh',display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',justifyContent:'center',paddingTop:'12px',paddingBottom:'4px',flexShrink:0}}>
          <div style={{width:'36px',height:'4px',borderRadius:'2px',background:D.borderMed}} />
        </div>
        {title && (
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 24px 4px',flexShrink:0}}>
            <div style={{fontFamily:D.head,fontSize:'18px',fontWeight:700,color:accent||D.textPrimary}}>{title}</div>
            <button onClick={onClose} style={{background:'transparent',border:'none',color:D.textMuted,fontSize:'22px',cursor:'pointer',lineHeight:1,padding:'4px 6px'}}>&times;</button>
          </div>
        )}
        <div style={{overflow:'auto',padding:'0 24px 32px'}}>{children}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FIELD GEOMETRY
═══════════════════════════════════════════════════════ */
const CX=150,CY=150,R_IN=48,R_MID=96,R_BND=126;
const toXY=(deg:number,r:number):[number,number]=>[CX+r*Math.sin(deg*Math.PI/180),CY-r*Math.cos(deg*Math.PI/180)];
const arcPath=(s:number,e:number,ro:number,ri:number)=>{
  const[ax,ay]=toXY(s,ro);const[bx,by]=toXY(e,ro);
  const[cx,cy]=toXY(s,ri);const[dx,dy]=toXY(e,ri);
  const lg=((e-s+360)%360)>180?1:0;
  return `M${cx} ${cy} L${ax} ${ay} A${ro} ${ro} 0 ${lg} 1 ${bx} ${by} L${dx} ${dy} A${ri} ${ri} 0 ${lg} 0 ${cx} ${cy} Z`;
};
const piePath=(s:number,e:number,ro:number)=>{
  const[ax,ay]=toXY(s,ro);const[bx,by]=toXY(e,ro);
  const lg=((e-s+360)%360)>180?1:0;
  return `M${CX} ${CY} L${ax} ${ay} A${ro} ${ro} 0 ${lg} 1 ${bx} ${by} Z`;
};
const SEGS=[
  {id:0,label:'Fine Leg',short:'FLG',angle:27,side:'leg'},
  {id:1,label:'Square Leg',short:'SQL',angle:80,side:'leg'},
  {id:2,label:'Mid Wicket',short:'MWK',angle:117,side:'leg'},
  {id:3,label:'Mid On',short:'MON',angle:148,side:'leg'},
  {id:4,label:'Long On',short:'LON',angle:164,side:'leg'},
  {id:5,label:'Straight',short:'STR',angle:180,side:'neutral'},
  {id:6,label:'Long Off',short:'LOF',angle:196,side:'off'},
  {id:7,label:'Mid Off',short:'MOF',angle:212,side:'off'},
  {id:8,label:'Cover',short:'COV',angle:243,side:'off'},
  {id:9,label:'Point',short:'PNT',angle:280,side:'off'},
  {id:10,label:'Gully',short:'GUL',angle:313,side:'off'},
  {id:11,label:'Third Man',short:'3MN',angle:333,side:'off'},
] as const;
const SEG_BOUNDS=SEGS.map((_,i)=>{
  const prev=SEGS[(i-1+SEGS.length)%SEGS.length];
  const next=SEGS[(i+1)%SEGS.length];
  const cur=SEGS[i];
  let diff=(cur.angle-prev.angle+360)%360;
  const s=(prev.angle+diff/2+360)%360;
  diff=(next.angle-cur.angle+360)%360;
  const e=(cur.angle+diff/2)%360;
  return{s,e};
});
const LK_COLS:{[k:string]:string}={'4':D.indigo,'6':D.amber,'1-3':D.emerald,'0':D.textMuted,'W':D.rose,'extras':D.orange};
const lineKey=(b:any)=>{
  if(b.isWicket||b.type==='W')return'W';
  if(b.extraType==='wide'||b.extraType==='noball'||b.type==='Wd'||b.type==='Nb')return'extras';
  const runs=b.runs??b.value??0;
  if(runs===6)return'6';if(runs===4)return'4';if(runs===0)return'0';return'1-3';
};
const heatColor=(v:number,mx:number)=>{
  if(!mx||!v)return null;const t=v/mx;
  if(t<.25)return`rgba(16,185,129,${.22+t*2})`;
  if(t<.5)return`rgba(245,158,11,${.3+t*1.2})`;
  if(t<.75)return`rgba(249,115,22,${.38+t})`;
  return`rgba(244,63,94,${.5+t*.5})`;
};
const wagEnd=(angle:number,b:any):[number,number]=>{
  const runs=b.runs??b.value??0;
  let r;
  if(b.isWicket||b.type==='W')r=28;
  else if(runs===6)r=R_BND+13;
  else if(runs===4)r=R_BND-1;
  else if(runs===3)r=R_MID-10;
  else if(runs===2)r=R_MID-24;
  else if(runs===1)r=R_IN+10;
  else r=R_IN-16;
  return toXY(angle,r);
};

/* ═══════════════════════════════════════════════════════
   SHOT CATEGORIES
═══════════════════════════════════════════════════════ */
const SHOT_CATEGORIES=[
  {cat:'Attacking',color:D.amber,shots:[
    {id:'drive',label:'Drive'},{id:'pull',label:'Pull'},{id:'hook',label:'Hook'},
    {id:'cut',label:'Cut'},{id:'sweep',label:'Sweep'},{id:'ramp',label:'Ramp/Scoop'},
    {id:'flick',label:'Flick'},{id:'glance',label:'Glance'},{id:'loft',label:'Lofted Drive'},
    {id:'slog',label:'Slog'},
  ]},
  {cat:'Defensive',color:D.sky,shots:[
    {id:'fwd_def',label:'Forward Def'},{id:'back_def',label:'Back Def'},{id:'padded',label:'Padded Away'},
  ]},
  {cat:'Edge / Contact',color:D.violet,shots:[
    {id:'inside_edge',label:'Inside Edge'},{id:'outside_edge',label:'Outside Edge'},
    {id:'top_edge',label:'Top Edge'},{id:'leading_edge',label:'Leading Edge'},
    {id:'missed',label:'Missed / Beat'},{id:'leave',label:'Leave (deliberate)'},
    {id:'hit_body',label:'Hit Body'},{id:'hit_glove',label:'Hit Glove'},
  ]},
  {cat:'Unusual',color:D.orange,shots:[
    {id:'reverse_sweep',label:'Reverse Sweep'},{id:'switch_hit',label:'Switch Hit'},
    {id:'paddle',label:'Paddle'},{id:'lap',label:'Lap'},
  ]},
];

/* ═══════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════ */
function getPlayerName(players: Person[], id: string | null | undefined): string {
  if (!id) return '—';
  const p = players.find(x => x.id === id);
  return p ? `${p.firstName} ${p.lastName}` : id.slice(0, 8);
}
function fmtOv(balls: number): string { return `${Math.floor(balls/6)}.${balls%6}`; }
function crrVal(runs: number, balls: number): number { return balls > 0 ? (runs/balls)*6 : 0; }
function crrStr(runs: number, balls: number): string { return crrVal(runs,balls).toFixed(2); }
function rrrStr(target: number|undefined, runs: number, balls: number, maxBalls: number): string|null {
  if (!target) return null;
  const rem = target - runs; const remB = maxBalls - balls;
  if (remB <= 0) return '—';
  return ((rem/remB)*6).toFixed(2);
}
const SR=(r:number,b:number)=>b===0?'—':((r/b)*100).toFixed(1);
const Econ=(r:number,b:number)=>b===0?'—':((r/(b/6))).toFixed(2);

/* ═══════════════════════════════════════════════════════
   INTELLIGENCE ENGINE
═══════════════════════════════════════════════════════ */
function getPhase(balls:number,overs:number):string{
  const ov=Math.floor(balls/6)+1;
  if(overs<=10)return ov<=3?'POWERPLAY':ov<=7?'MIDDLE':'DEATH';
  if(overs<=20)return ov<=6?'POWERPLAY':ov<=15?'MIDDLE':'DEATH';
  return ov<=10?'POWERPLAY':ov<=40?'MIDDLE':'DEATH';
}

function buildSignals(liveScore:any,overs:number,target:number|undefined,isChase:boolean){
  if(!liveScore?.currentInnings)return null;
  const{runs=0,wickets=0,balls=0}=liveScore.currentInnings||{};
  const maxBalls=overs*6;
  const rr=balls>0?(runs/(balls/6)):0;
  const reqRr=isChase&&target&&balls<maxBalls?((target-runs)/((maxBalls-balls)/6)):null;
  const rrDelta=reqRr!=null?rr-reqRr:null;
  const projected=balls>0?Math.round(runs/(balls/maxBalls)):0;
  const ballLog:any[]=liveScore.currentOver||[];
  const l6=ballLog.slice(-6),l12=ballLog.slice(-12);
  const ll6=l6.filter((b:any)=>b.extraType!=='wide'&&b.extraType!=='noball');
  const ll12=l12.filter((b:any)=>b.extraType!=='wide'&&b.extraType!=='noball');
  const dotsL6=ll6.filter((b:any)=>!b.runs&&!b.isWicket).length;
  const dotsL12=ll12.filter((b:any)=>!b.runs&&!b.isWicket).length;
  const bndsL6=l6.filter((b:any)=>b.runs===4||b.runs===6).length;
  const bndsL12=l12.filter((b:any)=>b.runs===4||b.runs===6).length;
  const wktsL12=l12.filter((b:any)=>b.isWicket).length;
  const runsL6=l6.reduce((s:number,b:any)=>s+(b.runs||0),0);
  const lastBndIdx=[...ballLog].reverse().findIndex((b:any)=>b.runs===4||b.runs===6);
  const bndDrought=lastBndIdx===-1?balls:lastBndIdx;
  let pressure=30;
  if(dotsL6>=4)pressure+=18;if(dotsL12>=8)pressure+=10;
  if(wktsL12>=2)pressure+=22;if(wktsL12>=3)pressure+=12;
  if(bndDrought>=18)pressure+=10;
  if(reqRr!=null&&reqRr-rr>2)pressure+=15;
  if(reqRr!=null&&reqRr-rr>4)pressure+=10;
  pressure=Math.min(100,Math.max(0,pressure));
  const pLbl=pressure<26?'LOW':pressure<51?'MED':pressure<76?'HIGH':'EXTREME';
  const pCol=pressure<26?D.emerald:pressure<51?D.amber:pressure<76?D.orange:D.rose;
  let mom=0;
  const recentRR=ll12.length>0?(runsL6/(ll12.length/6)):0;
  mom+=(recentRR-rr)*10;mom-=wktsL12*18;mom+=bndsL12*8;
  mom=Math.min(100,Math.max(-100,mom));
  const mLbl=mom>20?'BAT':mom<-20?'BOWL':'EVEN';
  const mCol=mom>20?D.emerald:mom<-20?D.rose:D.amber;
  const phase=getPhase(balls,overs);
  const flags:string[]=[];
  if(isChase&&reqRr&&rrDelta&&rrDelta>0.5)flags.push('CHASE_ON_TRACK');
  if(isChase&&reqRr&&rrDelta&&rrDelta<-1&&maxBalls-balls>18)flags.push('CHASE_BEHIND');
  if(wktsL12>=2)flags.push('COLLAPSE_RISK');
  if(runsL6>=12||bndsL6>=2)flags.push('BOWLER_UNDER_PUMP');
  if(bndDrought>=18)flags.push('BOUNDARY_DROUGHT');
  if(phase==='DEATH')flags.push('DEATH_OVERS');
  return{rr:+rr.toFixed(2),reqRr:reqRr?+reqRr.toFixed(2):null,rrDelta:rrDelta?+rrDelta.toFixed(2):null,
    projected,dotsL6,dotsL12,bndsL6,bndsL12,wktsL12,runsL6,bndDrought,
    pressure,pressureLabel:pLbl,pressureColor:pCol,mom:+mom.toFixed(0),momLabel:mLbl,momColor:mCol,
    phase,flags,runs,wickets,balls,overs,maxBalls,isChase,target};
}

function buildNarratives(sig:any):{type:string;pri:number;hl:string;chips:{l:string;v:any;c?:string}[];accent:string;icon:string}[]{
  if(!sig)return[];
  const n:any[]=[];
  const push=(type:string,pri:number,hl:string,chips:any[],accent:string,icon:string)=>n.push({type,pri,hl,chips,accent,icon});
  if(sig.isChase&&sig.reqRr!=null){
    const need=(sig.target||0)-sig.runs;const ballsLeft=sig.maxBalls-sig.balls;
    if(sig.rrDelta<-1)push('CHASE_BEHIND',83,`Need ${need} off ${ballsLeft} balls`,
      [{l:'RRR',v:sig.reqRr,c:D.rose},{l:'CRR',v:sig.rr},{l:'Behind',v:'+'+Math.abs(sig.rrDelta).toFixed(1),c:D.rose}],D.rose,'🎯');
    else push('CHASE_ON_TRACK',66,`${need} from ${ballsLeft} — on track`,
      [{l:'RRR',v:sig.reqRr,c:D.emerald},{l:'CRR',v:sig.rr,c:D.emerald}],D.emerald,'✅');
  }
  if(sig.pressure>=75)push('PRESSURE',80,sig.pressureLabel==='EXTREME'?'Under extreme pressure':'Batting under pressure',
    [{l:'Dots/6',v:sig.dotsL6,c:sig.pressureColor},{l:'Score',v:sig.pressure+'%',c:sig.pressureColor}],sig.pressureColor,'🔥');
  if(Math.abs(sig.mom)>40)push('MOMENTUM',70,sig.momLabel==='BAT'?'Bat dominating':'Bowlers wrestling back',
    [{l:'Last 6',v:sig.runsL6+'r'},{l:'Bnds/12',v:sig.bndsL12},{l:'Wkts/12',v:sig.wktsL12}],sig.momColor,sig.momLabel==='BAT'?'💥':'⚡');
  if(sig.flags.includes('COLLAPSE_RISK'))push('COLLAPSE',78,`${sig.wktsL12} wickets in last 12 balls`,
    [{l:'Wickets',v:sig.wktsL12,c:D.rose}],D.rose,'📉');
  if(sig.flags.includes('BOUNDARY_DROUGHT')&&!sig.flags.includes('PRESSURE'))push('DROUGHT',52,
    `Boundary drought — ${sig.bndDrought} balls`,
    [{l:'Drought',v:sig.bndDrought+'b',c:D.amber},{l:'Dots/6',v:sig.dotsL6}],D.amber,'🌵');
  if(!sig.isChase&&sig.balls>=24)push('PROJECTION',38,`At this rate: ${sig.projected} projected`,
    [{l:'RR',v:sig.rr},{l:'Phase',v:sig.phase}],D.violet,'📊');
  push('RUN_RATE',10,`Run rate: ${sig.rr} rpo`,
    [{l:'Runs',v:sig.runs},{l:'Overs',v:fmtOv(sig.balls)},{l:'Proj',v:sig.projected}],D.sky,'📈');
  return n.sort((a:any,b:any)=>b.pri-a.pri);
}

/* ═══════════════════════════════════════════════════════
   DYNAMIC BAR
═══════════════════════════════════════════════════════ */
function DynamicBar({liveScore,overs,target,isChase}:{liveScore:any;overs:number;target?:number;isChase:boolean}) {
  const[cardIdx,setCardIdx]=useState(0);
  const[animKey,setAnimKey]=useState(0);
  const timerRef=useRef<NodeJS.Timeout|null>(null);
  const sig=buildSignals(liveScore,overs,target,isChase);
  const cards=buildNarratives(sig);
  useEffect(()=>{
    if(!cards.length)return;
    timerRef.current=setInterval(()=>{setCardIdx(p=>(p+1)%cards.length);setAnimKey(k=>k+1);},7000);
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[cards.length,sig?.balls]);
  if(!sig||!cards.length)return null;
  const card=cards[Math.min(cardIdx,cards.length-1)]||cards[0];
  const rrCol=isChase?(sig.rrDelta!=null&&sig.rrDelta<-1?D.rose:D.emerald):D.sky;
  const phaseCol=sig.phase==='POWERPLAY'?D.emerald:sig.phase==='MIDDLE'?D.amber:D.orange;
  return (
    <div style={{position:'sticky',top:'49px',zIndex:95,background:`linear-gradient(180deg,${D.base}f8 0%,${D.base}e0 100%)`,
      backdropFilter:'blur(16px)',WebkitBackdropFilter:'blur(16px)',borderBottom:`1px solid ${D.border}`}}>
      <div style={{display:'grid',gridTemplateColumns:'auto 1fr auto',alignItems:'stretch',minHeight:'52px'}}>
        {/* Left — RR */}
        <div style={{display:'flex',alignItems:'center',borderRight:`1px solid ${D.border}`,padding:'0 12px',gap:0,flexShrink:0}}>
          <div style={{textAlign:'center',padding:'0 8px',borderRight:`1px solid ${D.border}66`}}>
            <div style={{fontFamily:D.mono,fontSize:'18px',fontWeight:500,color:rrCol,lineHeight:1}}>{sig.rr}</div>
            <div style={{fontFamily:D.head,fontSize:'7px',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:D.textMuted,marginTop:'2px'}}>CRR</div>
          </div>
          {isChase&&sig.reqRr!=null&&(
            <div style={{textAlign:'center',padding:'0 8px',borderRight:`1px solid ${D.border}66`}}>
              <div style={{fontFamily:D.mono,fontSize:'18px',fontWeight:500,color:sig.rrDelta!==null&&sig.rrDelta<-1?D.rose:sig.rrDelta!==null&&sig.rrDelta>0.5?D.emerald:D.amber,lineHeight:1}}>{sig.reqRr}</div>
              <div style={{fontFamily:D.head,fontSize:'7px',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:D.textMuted,marginTop:'2px'}}>RRR</div>
            </div>
          )}
          <div style={{padding:'0 8px',display:'flex',flexDirection:'column',alignItems:'center',gap:'3px'}}>
            <div style={{fontFamily:D.head,fontSize:'8px',fontWeight:700,color:phaseCol,letterSpacing:'0.08em',textTransform:'uppercase',
              padding:'2px 7px',borderRadius:D.pill,border:`1px solid ${phaseCol}33`,background:phaseCol+'10'}}>{sig.phase}</div>
            <div style={{fontFamily:D.mono,fontSize:'8px',color:D.textMuted}}>{fmtOv(sig.balls)} ov</div>
          </div>
        </div>
        {/* Centre — narrative */}
        <div key={animKey} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 12px',overflow:'hidden',animation:'fadeIn .4s ease both'}}>
          {card.icon&&<span style={{fontSize:'14px',flexShrink:0}}>{card.icon}</span>}
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontFamily:D.head,fontSize:'11px',fontWeight:700,color:card.accent,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',lineHeight:1.2}}>{card.hl}</div>
            <div style={{display:'flex',gap:'8px',marginTop:'4px',flexWrap:'nowrap',overflow:'hidden'}}>
              {card.chips.slice(0,3).map((chip:any,i:number)=>(
                <div key={i} style={{display:'flex',alignItems:'baseline',gap:'3px',flexShrink:0}}>
                  <span style={{fontFamily:D.mono,fontSize:'12px',fontWeight:500,color:chip.c||D.textPrimary,lineHeight:1}}>{chip.v}</span>
                  <span style={{fontFamily:D.head,fontSize:'7px',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:D.textMuted}}>{chip.l}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Right — micro bars */}
        <div style={{display:'flex',alignItems:'center',gap:'6px',borderLeft:`1px solid ${D.border}`,padding:'0 10px',flexShrink:0}}>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',width:'34px'}}>
            <div style={{width:'100%',height:'4px',background:D.surf3,borderRadius:'4px',overflow:'hidden'}}>
              <div style={{height:'100%',borderRadius:'4px',width:Math.min(100,Math.max(0,50+sig.mom/2))+'%',background:sig.momColor,transition:'width .5s ease'}} />
            </div>
            <span style={{fontFamily:D.head,fontSize:'7px',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:sig.momColor}}>{sig.momLabel}</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',width:'34px'}}>
            <div style={{width:'100%',height:'4px',background:D.surf3,borderRadius:'4px',overflow:'hidden'}}>
              <div style={{height:'100%',borderRadius:'4px',width:sig.pressure+'%',background:sig.pressureColor,transition:'width .5s ease'}} />
            </div>
            <span style={{fontFamily:D.head,fontSize:'7px',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',color:sig.pressureColor}}>{sig.pressureLabel}</span>
          </div>
          {cards.length>1&&(
            <div style={{display:'flex',flexDirection:'column',gap:'3px'}}>
              {cards.slice(0,5).map((_:any,i:number)=>(
                <button key={i} onClick={()=>{setCardIdx(i);setAnimKey(k=>k+1);}}
                  style={{width:i===cardIdx?'12px':'4px',height:'4px',borderRadius:'4px',border:'none',padding:0,cursor:'pointer',
                    background:i===cardIdx?(cards[i]?.accent||D.indigo):`${D.textMuted}30`,transition:'all .25s'}} />
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{height:'1.5px',background:`linear-gradient(90deg,${card.accent},${card.accent}55,transparent)`,transition:'background .5s'}} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   INTEL PANEL
═══════════════════════════════════════════════════════ */
function IntelPanel({liveScore,overs,target,isChase}:{liveScore:any;overs:number;target?:number;isChase:boolean}) {
  const[idx,setIdx]=useState(0);
  const[auto,setAuto]=useState(true);
  const timerRef=useRef<NodeJS.Timeout|null>(null);
  const sig=buildSignals(liveScore,overs,target,isChase);
  const cards=buildNarratives(sig);
  useEffect(()=>{
    if(!auto||!cards.length){if(timerRef.current)clearInterval(timerRef.current);return;}
    timerRef.current=setInterval(()=>setIdx(p=>(p+1)%Math.max(1,cards.length)),6200);
    return()=>{if(timerRef.current)clearInterval(timerRef.current);};
  },[auto,cards.length]);
  useEffect(()=>setIdx(0),[cards.length]);
  if(!sig||!cards.length)return(
    <div style={{background:D.surf1,borderRadius:D.lg,padding:'18px 20px',border:`1px solid ${D.border}`}}>
      <Lbl>Match Intelligence</Lbl>
      <div style={{color:D.textMuted,fontSize:'13px',fontFamily:D.body,lineHeight:1.5,marginTop:'10px'}}>Intelligence builds as the match develops…</div>
    </div>
  );
  const card=cards[Math.min(idx,cards.length-1)];
  const phaseCol=sig.phase==='POWERPLAY'?D.emerald:sig.phase==='MIDDLE'?D.amber:D.orange;
  return (
    <div style={{borderRadius:D.lg,overflow:'hidden',position:'relative',
      background:`linear-gradient(145deg,${D.surf1},${D.surf2})`,
      border:`1px solid ${card.accent}30`,
      boxShadow:`0 8px 40px rgba(0,0,0,.4),0 0 60px ${card.accent}08`,
      transition:'border-color .5s,box-shadow .5s'}}>
      <div style={{height:'2px',background:`linear-gradient(90deg,${card.accent},${card.accent}00)`}} />
      <div style={{padding:'12px 16px',borderBottom:`1px solid ${D.border}`,display:'flex',alignItems:'center',gap:'8px',flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:'6px',flex:1,flexWrap:'wrap'}}>
          <Lbl>Intelligence</Lbl>
          <Badge color={phaseCol}>{sig.phase}</Badge>
          <Badge color={sig.pressureColor}>{sig.pressureLabel}</Badge>
          <Badge color={sig.momColor}>{sig.momLabel}</Badge>
        </div>
        <button onClick={()=>setAuto(p=>!p)} className="sh-press"
          style={{padding:'3px 8px',borderRadius:D.pill,cursor:'pointer',fontFamily:D.head,fontSize:'9px',
            border:`1px solid ${auto?D.emerald+'44':D.border}`,background:'transparent',
            color:auto?D.emerald:D.textMuted,transition:'all .2s'}}>
          {auto?'⏸':'▶'}
        </button>
      </div>
      <div style={{padding:'16px 18px',position:'relative'}}>
        <div style={{position:'absolute',top:-10,right:-10,width:'80px',height:'80px',borderRadius:'50%',
          background:`${card.accent}14`,filter:'blur(28px)',pointerEvents:'none'}} />
        <div style={{fontFamily:D.head,fontSize:'14px',fontWeight:700,color:card.accent,marginBottom:'12px',lineHeight:1.3}}>{card.hl}</div>
        <div style={{display:'flex',gap:'8px',flexWrap:'wrap',marginBottom:'14px'}}>
          {card.chips.map((chip:any,i:number)=>(
            <div key={i} style={{background:D.surf0,border:`1px solid ${chip.c?`${chip.c}28`:D.border}`,
              borderRadius:D.md,padding:'8px 12px',display:'flex',flexDirection:'column',alignItems:'center',minWidth:'52px',gap:'3px'}}>
              <span style={{fontFamily:D.mono,fontSize:'17px',fontWeight:500,color:chip.c||D.textPrimary,lineHeight:1}}>{chip.v}</span>
              <span style={{fontFamily:D.head,fontSize:'7.5px',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:D.textMuted}}>{chip.l}</span>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px',borderTop:`1px solid ${D.border}`,paddingTop:'12px'}}>
          <SignalBar label="Pressure" value={`${sig.pressure}%`} pct={sig.pressure} color={sig.pressureColor}/>
          <SignalBar label="Momentum" value={sig.momLabel} pct={50+sig.mom/2} color={sig.momColor}/>
          <SignalBar label={sig.reqRr?'Req RR':'Run Rate'} value={sig.reqRr??sig.rr} pct={Math.min(100,(sig.reqRr||sig.rr)/18*100)} color={sig.reqRr&&sig.rrDelta!==null&&sig.rrDelta<-1?D.rose:D.sky}/>
        </div>
      </div>
      <div style={{padding:'8px 16px',borderTop:`1px solid ${D.border}`,display:'flex',alignItems:'center',gap:'8px',background:`${D.surf0}55`}}>
        <div style={{display:'flex',gap:'3px',flex:1}}>
          {cards.map((_:any,i:number)=>(
            <button key={i} onClick={()=>{setIdx(i);setAuto(false);}}
              style={{width:i===idx?'16px':'6px',height:'6px',borderRadius:'4px',border:'none',cursor:'pointer',padding:0,
                background:i===idx?card.accent:`${D.textMuted}30`,transition:'all .3s ease'}} />
          ))}
        </div>
        <span style={{color:D.textMuted,fontSize:'9px',fontFamily:D.mono,flexShrink:0}}>{idx+1}/{cards.length}</span>
        {sig.flags.slice(0,2).map((f:string)=>(
          <Badge key={f} color={D.orange}>{f.replace(/_/g,' ')}</Badge>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   WAGON WHEEL
═══════════════════════════════════════════════════════ */
function WagonWheel({ballLog=[],shotCoords,onAim,viewMode,onViewMode,hiddenLines,onToggleLine}:{
  ballLog?:any[];shotCoords:{angle:number;distance:number}|null;onAim:(c:{angle:number;distance:number})=>void;
  viewMode:'wagon'|'heatmap';onViewMode:(m:'wagon'|'heatmap')=>void;
  hiddenLines:Set<string>;onToggleLine:(k:string)=>void;
}) {
  const svgRef=useRef<SVGSVGElement>(null);
  const[hov,setHov]=useState<number|null>(null);
  const segRuns=Array(12).fill(0);
  ballLog.forEach((b:any)=>{if(b.seg!=null)segRuns[b.seg]+=(b.runs??b.value??0);});
  const maxR=Math.max(...segRuns,1);
  const handleClick=(e:React.MouseEvent<SVGSVGElement>)=>{
    const svg=svgRef.current;if(!svg)return;
    const rect=svg.getBoundingClientRect();
    const x=((e.clientX-rect.left)/rect.width)*300-CX;
    const y=((e.clientY-rect.top)/rect.height)*300-CY;
    const dist=Math.sqrt(x*x+y*y);
    if(dist<8||dist>R_BND+20)return;
    let angle=Math.atan2(x,-y)*180/Math.PI;
    if(angle<0)angle+=360;
    const distance=Math.min(100,Math.round((dist/(R_BND+4))*100));
    onAim({angle:Math.round(angle),distance});
  };
  const visLines=ballLog.filter((b:any)=>b.seg!=null&&!hiddenLines.has(lineKey(b)));
  const aimXY=shotCoords?toXY(shotCoords.angle,(shotCoords.distance/100)*(R_BND+4)):null;
  return (
    <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
        <Lbl>Field Map</Lbl>
        <div style={{marginLeft:'auto',display:'flex',gap:'2px',background:D.surf3,borderRadius:D.pill,padding:'3px'}}>
          {(['wagon','heatmap'] as const).map(m=>(
            <button key={m} onClick={()=>onViewMode(m)} className="sh-press" style={{
              padding:'4px 12px',borderRadius:D.pill,border:'none',cursor:'pointer',
              background:viewMode===m?D.grad:'transparent',
              color:viewMode===m?'#fff':D.textMuted,
              fontFamily:D.head,fontSize:'9px',fontWeight:700,letterSpacing:'0.06em',
              textTransform:'uppercase',transition:'all .25s',
            }}>{m==='wagon'?'Wheel':'Heat'}</button>
          ))}
        </div>
      </div>
      <div style={{width:'100%',maxWidth:'280px',margin:'0 auto',aspectRatio:'1',userSelect:'none'}}>
        <svg ref={svgRef} viewBox="0 0 300 300" style={{width:'100%',height:'100%',display:'block',cursor:'crosshair'}} onClick={handleClick}>
          <defs>
            <radialGradient id="gField" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0d1f10"/><stop offset="100%" stopColor="#050e07"/>
            </radialGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="2" result="blur"/>
              <feComposite in="SourceGraphic" in2="blur" operator="over"/></filter>
          </defs>
          <circle cx={CX} cy={CY} r={R_BND+4} fill="url(#gField)"/>
          <circle cx={CX} cy={CY} r={R_BND+1} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"/>
          {/* Outer segments */}
          {SEGS.map((seg,i)=>{
            const hv=hov===seg.id;
            const fill=viewMode==='heatmap'?(heatColor(segRuns[seg.id],maxR)||'rgba(255,255,255,0.02)'):hv?'rgba(14,165,233,.15)':'rgba(255,255,255,0.02)';
            return(<path key={`b${seg.id}`} d={arcPath(SEG_BOUNDS[i].s,SEG_BOUNDS[i].e,R_BND,R_MID)} fill={fill}
              stroke="rgba(255,180,50,0.15)" strokeWidth="0.5"
              onMouseEnter={()=>setHov(seg.id)} onMouseLeave={()=>setHov(null)}/>);
          })}
          <circle cx={CX} cy={CY} r={R_MID} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="4 4"/>
          {/* Infield segments */}
          {SEGS.map((seg,i)=>(
            <path key={`o${seg.id}`} d={arcPath(SEG_BOUNDS[i].s,SEG_BOUNDS[i].e,R_MID,R_IN)}
              fill={hov===seg.id?'rgba(14,165,233,.12)':'transparent'}
              stroke="rgba(255,255,255,0.03)" strokeWidth="0.4"
              onMouseEnter={()=>setHov(seg.id)} onMouseLeave={()=>setHov(null)}/>
          ))}
          <circle cx={CX} cy={CY} r={R_IN} fill="rgba(0,0,0,0.2)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.8" strokeDasharray="2 5"/>
          {SEGS.map((seg,i)=>(
            <path key={`i${seg.id}`} d={piePath(SEG_BOUNDS[i].s,SEG_BOUNDS[i].e,R_IN)}
              fill="transparent" stroke="rgba(255,255,255,0.02)" strokeWidth="0.4"
              onMouseEnter={()=>setHov(seg.id)} onMouseLeave={()=>setHov(null)}/>
          ))}
          {/* Spokes */}
          {SEG_BOUNDS.map((b,i)=>{
            const[xa,ya]=toXY(b.s,R_BND+1);
            return <line key={`sp${i}`} x1={CX} y1={CY} x2={xa} y2={ya} stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" style={{pointerEvents:'none'}}/>;
          })}
          {/* Shot lines */}
          {viewMode==='wagon'&&visLines.map((b:any,i:number)=>{
            if(b.seg==null)return null;
            const[ex,ey]=wagEnd(SEGS[b.seg].angle,b);
            const col=LK_COLS[lineKey(b)];
            const runs=b.runs??b.value??0;
            const w=runs===6?2.5:runs===4?2:1.2;
            return(<line key={`wl${i}`} x1={CX} y1={CY} x2={ex} y2={ey} stroke={col} strokeWidth={w}
              opacity={runs===0?0.22:0.75} strokeLinecap="round" className="sh-wagon-line" style={{animationDelay:`${i*.02}s`}}/>);
          })}
          {viewMode==='wagon'&&visLines.filter((b:any)=>(b.runs??b.value??0)>=4).map((b:any,i:number)=>{
            if(b.seg==null)return null;
            const[ex,ey]=wagEnd(SEGS[b.seg].angle,b);
            return(<circle key={`dt${i}`} cx={ex} cy={ey} r={(b.runs??b.value??0)===6?5:3.5}
              fill={LK_COLS[lineKey(b)]} opacity="0.95" style={{pointerEvents:'none',filter:(b.runs??b.value??0)===6?'url(#glow)':'none'}}/>);
          })}
          {/* Heatmap run counts */}
          {viewMode==='heatmap'&&SEGS.map(seg=>{
            if(!segRuns[seg.id])return null;
            const[lx,ly]=toXY(seg.angle,(R_IN+R_MID)/2+14);
            return(<text key={`hr${seg.id}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              fontSize="8" fontFamily="'DM Mono',monospace" fontWeight="600"
              fill="rgba(255,255,255,0.7)" style={{pointerEvents:'none'}}>{segRuns[seg.id]}</text>);
          })}
          {/* Pitch */}
          <rect x={CX-4} y={CY-16} width={8} height={32} rx="2" fill="#8a7a50" stroke="rgba(200,170,80,0.4)" strokeWidth="0.7" style={{pointerEvents:'none'}}/>
          <line x1={CX-5.5} y1={CY-12} x2={CX+5.5} y2={CY-12} stroke="rgba(255,255,255,0.6)" strokeWidth="0.8" style={{pointerEvents:'none'}}/>
          <line x1={CX-5.5} y1={CY+12} x2={CX+5.5} y2={CY+12} stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" style={{pointerEvents:'none'}}/>
          {[-2.8,0,2.8].map(x=>(
            <rect key={`st${x}`} x={CX+x-0.6} y={CY-17} width={1.2} height={5} rx="0.4" fill="rgba(255,255,255,0.85)" style={{pointerEvents:'none'}}/>
          ))}
          <circle cx={CX} cy={CY-11} r="3" fill="#34d399" stroke="rgba(255,255,255,0.3)" strokeWidth="0.7" style={{pointerEvents:'none'}}/>
          {/* Segment labels */}
          {SEGS.map(seg=>{
            const[lx,ly]=toXY(seg.angle,(R_IN+R_MID)/2+2);
            return(<text key={`lb${seg.id}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
              fontSize="7" fontFamily="'Syne',sans-serif" fontWeight={hov===seg.id?'700':'400'}
              fill={hov===seg.id?'#7dd3fc':'rgba(255,255,255,0.28)'} style={{pointerEvents:'none'}}>{seg.short}</text>);
          })}
          {/* OFF / LEG */}
          <text x={14} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="6"
            fontFamily="'Syne',sans-serif" letterSpacing="1" fill="rgba(255,255,255,0.15)"
            transform={`rotate(-90,14,${CY})`} style={{pointerEvents:'none'}}>OFF</text>
          <text x={286} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="6"
            fontFamily="'Syne',sans-serif" letterSpacing="1" fill="rgba(255,255,255,0.15)"
            transform={`rotate(90,286,${CY})`} style={{pointerEvents:'none'}}>LEG</text>
          {/* Aim preview */}
          {aimXY&&(
            <>
              <line x1={CX} y1={CY} x2={aimXY[0]} y2={aimXY[1]}
                stroke={D.emerald} strokeWidth="1.5" strokeDasharray="5 3" opacity="0.7" style={{pointerEvents:'none'}}/>
              <circle cx={aimXY[0]} cy={aimXY[1]} r="5" fill={D.emerald} opacity="0.9"
                style={{pointerEvents:'none',filter:`drop-shadow(0 0 6px ${D.emerald})`}}/>
            </>
          )}
        </svg>
      </div>
      {/* Legend */}
      <div style={{display:'flex',justifyContent:'center',gap:'5px',flexWrap:'wrap'}}>
        {Object.entries(LK_COLS).map(([k,col])=>{
          const off=hiddenLines.has(k);
          return(<button key={k} onClick={()=>onToggleLine(k)} className="sh-press" style={{
            display:'flex',alignItems:'center',gap:'4px',padding:'3px 8px',borderRadius:D.pill,
            cursor:'pointer',background:off?'transparent':`${col}12`,
            border:`1px solid ${off?D.border:`${col}38`}`,opacity:off?0.3:1,transition:'all .2s',
          }}>
            <div style={{width:'10px',height:'2px',borderRadius:'2px',background:off?D.textMuted:col}}/>
            <span style={{color:off?D.textMuted:D.textSecondary,fontSize:'9px',fontFamily:D.head,fontWeight:600,letterSpacing:'0.05em'}}>{k}</span>
          </button>);
        })}
      </div>
      {shotCoords&&(
        <div style={{textAlign:'center',fontSize:'11px',color:D.emerald,fontFamily:D.mono}}>
          Aimed {shotCoords.angle}° · {shotCoords.distance}% · {SEGS.reduce((closest,s)=>{
            const diff=Math.abs(((shotCoords.angle-s.angle)+360)%360);
            const cdiff=Math.abs(((shotCoords.angle-closest.angle)+360)%360);
            return diff<cdiff?s:closest;
          },SEGS[0]).label}
        </div>
      )}
    </div>
  );
}
/* ═══════════════════════════════════════════════════════
   BALL CHIP
═══════════════════════════════════════════════════════ */
function BallDot({runs,isW,extraType}:{runs:number;isW:boolean;extraType?:string|null}) {
  const col=isW?D.rose:extraType==='wide'||extraType==='noball'?D.amber:runs===6?D.violet:runs===4?D.indigo:runs===0?D.surf3:D.emerald;
  const txt=isW?'W':extraType==='wide'?`${runs}W`:extraType==='noball'?`${runs}N`:extraType==='bye'?`${runs}B`:extraType==='legbye'?`${runs}L`:runs===0?'•':String(runs);
  return(
    <div style={{width:'34px',height:'34px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:D.mono,fontSize:'11px',fontWeight:700,flexShrink:0,
      background:isW||runs===6?`${col}22`:runs===4?`${col}1a`:`${col}11`,
      color:col,border:`1.5px solid ${col}44`,animation:'chipPop .25s ease both'}}>
      {txt}
    </div>
  );
}

function LiveDot() {
  return(
    <span className="sh-live-dot" style={{width:'6px',height:'6px',borderRadius:'50%',
      background:'#f43f5e',display:'inline-block',flexShrink:0,boxShadow:'0 0 6px #f43f5e'}} />
  );
}

/* ═══════════════════════════════════════════════════════
   RICH SCORECARD
═══════════════════════════════════════════════════════ */
function RichScorecardPanel({liveScore,allPlayers,strikerId,nonStrikerId,bowlerId}:{
  liveScore:any;allPlayers:Person[];strikerId?:string|null;nonStrikerId?:string|null;bowlerId?:string|null;
}) {
  const batsmen=(liveScore?.batsmen||[]) as any[];
  const bowlers=(liveScore?.bowlers||[]) as any[];
  const inn=liveScore?.currentInnings;
  const fow=(liveScore?.fallOfWickets??liveScore?.currentInnings?.fallOfWickets??[]) as any[];
  const parts=(liveScore?.partnerships??[]) as any[];
  const headerRow=(headers:string[])=>(
    <div style={{display:'grid',gridTemplateColumns:headers.map((_,i)=>i===0?'1fr':'auto').join(' '),gap:'4px 10px',
      padding:'5px 4px',borderBottom:`1px solid ${D.border}`,marginBottom:'4px'}}>
      {headers.map((h,i)=>(
        <div key={i} style={{fontFamily:D.head,fontSize:'8px',fontWeight:700,letterSpacing:'0.12em',
          textTransform:'uppercase',color:D.textMuted,textAlign:i===0?'left':'right'}}>{h}</div>
      ))}
    </div>
  );
  const isAtCrease=(id:string)=>id===strikerId||id===nonStrikerId;
  const isStriker=(id:string)=>id===strikerId;
  return(
    <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
      {/* Batting */}
      <div style={{borderRadius:D.lg,overflow:'hidden',border:`1px solid ${D.border}`,background:D.surf1}}>
        <div style={{padding:'12px 16px',borderBottom:`1px solid ${D.border}`,display:'flex',alignItems:'center',gap:'8px'}}>
          <Lbl>Batting</Lbl>
          {inn&&<Badge color={D.emerald}>{inn.runs??0}/{inn.wickets??0} ({fmtOv(inn.balls??0)} ov)</Badge>}
        </div>
        <div style={{padding:'8px 12px 12px'}}>
          {headerRow(['Batter','R','B','4s','6s','SR'])}
          {batsmen.map((b:any)=>{
            const atC=isAtCrease(b.playerId);
            const str=isStriker(b.playerId);
            const col=b.isOut?D.textMuted:atC?D.textPrimary:D.textSecondary;
            const rowBg=str?`${D.emerald}08`:atC?`${D.sky}06`:'transparent';
            const lhb=b.battingStyle==='left-hand';
            return(
              <div key={b.playerId} style={{display:'grid',gridTemplateColumns:'1fr auto auto auto auto auto',
                gap:'4px 10px',padding:'8px 4px',background:rowBg,borderBottom:`1px solid ${D.border}22`,
                alignItems:'center',borderRadius:'4px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'6px',overflow:'hidden',minWidth:0}}>
                  {atC&&<span className={str?'sh-live-dot':undefined} style={{width:'6px',height:'6px',flexShrink:0,borderRadius:'50%',background:str?D.emerald:D.sky}}/>}
                  {!atC&&<span style={{width:'6px',flexShrink:0}}/>}
                  <div style={{minWidth:0}}>
                    <div style={{fontFamily:D.body,fontSize:'12px',fontWeight:atC?700:500,color:col,
                      textDecoration:b.isOut?'line-through':'none',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {getPlayerName(allPlayers,b.playerId)}
                    </div>
                    {b.isOut&&b.dismissal&&<div style={{fontFamily:D.body,fontSize:'9px',color:D.textMuted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{b.dismissal}</div>}
                    {!b.isOut&&!atC&&<div style={{fontFamily:D.body,fontSize:'9px',color:D.textMuted,fontStyle:'italic'}}>batting</div>}
                  </div>
                  {lhb&&<span style={{fontFamily:D.head,fontSize:'7px',fontWeight:700,letterSpacing:'0.1em',
                    textTransform:'uppercase',padding:'1px 4px',borderRadius:'3px',
                    border:`1px solid ${D.violet}44`,color:D.violet,flexShrink:0}}>LHB</span>}
                </div>
                <div style={{fontFamily:D.mono,fontSize:'12px',fontWeight:700,color:col,textAlign:'right'}}>
                  {b.runs??0}
                </div>
                <div style={{fontFamily:D.mono,fontSize:'11px',color:D.textMuted,textAlign:'right',minWidth:'24px'}}>
                  {b.ballsFaced??0}
                </div>
                <div style={{fontFamily:D.mono,fontSize:'11px',color:D.textMuted,textAlign:'right',minWidth:'18px'}}>
                  {b.fours??0}
                </div>
                <div style={{fontFamily:D.mono,fontSize:'11px',color:b.sixes>0?D.amber:D.textMuted,textAlign:'right',minWidth:'18px'}}>
                  {b.sixes??0}
                </div>
                <div style={{fontFamily:D.mono,fontSize:'11px',
                  color:(b.ballsFaced??0)>0&&(b.runs/b.ballsFaced*100)>=150?D.emerald:(b.ballsFaced??0)>0&&(b.runs/b.ballsFaced*100)<=60?D.rose:D.textMuted,
                  textAlign:'right',minWidth:'30px'}}>
                  {SR(b.runs??0,b.ballsFaced??0)}
                </div>
              </div>
            );
          })}
          {batsmen.length===0&&<p style={{color:D.textMuted,fontSize:'12px',textAlign:'center',padding:'12px 0'}}>No batters yet</p>}
          {inn&&<>
            <Sep my={8}/>
            <div style={{display:'flex',justifyContent:'flex-end',gap:'16px',padding:'0 4px'}}>
              {[
                {l:'Extras',v:`${inn.extras??0}`},
                {l:'Total',v:`${inn.runs??0}/${inn.wickets??0}`},
                {l:'Overs',v:fmtOv(inn.balls??0)},
              ].map(item=>(
                <div key={item.l} style={{textAlign:'right'}}>
                  <div style={{fontFamily:D.head,fontSize:'8px',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:D.textMuted}}>{item.l}</div>
                  <div style={{fontFamily:D.mono,fontSize:'13px',fontWeight:700,color:D.textPrimary,marginTop:'2px'}}>{item.v}</div>
                </div>
              ))}
            </div>
          </>}
        </div>
      </div>
      {/* Partnerships */}
      {parts.length>0&&(
        <div style={{borderRadius:D.lg,overflow:'hidden',border:`1px solid ${D.border}`,background:D.surf1}}>
          <div style={{padding:'12px 16px',borderBottom:`1px solid ${D.border}`}}><Lbl>Partnerships</Lbl></div>
          <div style={{padding:'8px 12px 12px'}}>
            {parts.map((p:any,i:number)=>{
              const total=p.runs??0;const pct=inn?.runs?Math.min(100,Math.round(total/inn.runs*100)):0;
              const p1c=p.player1Runs??0;const p2c=p.player2Runs??0;const psum=p1c+p2c||1;
              return(
                <div key={i} style={{marginBottom:'10px'}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
                    <span style={{fontFamily:D.body,fontSize:'11px',color:D.textSecondary,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {getPlayerName(allPlayers,p.player1Id)} & {getPlayerName(allPlayers,p.player2Id)}
                    </span>
                    <span style={{fontFamily:D.mono,fontSize:'12px',fontWeight:700,color:D.textPrimary,flexShrink:0,marginLeft:'8px'}}>
                      {total}({p.balls??0})
                    </span>
                  </div>
                  <div style={{height:'5px',borderRadius:'3px',background:D.surf3,overflow:'hidden',display:'flex'}}>
                    <div style={{width:(p1c/psum*100)+'%',background:`linear-gradient(90deg,${D.sky},${D.sky}99)`,borderRadius:'3px 0 0 3px'}}/>
                    <div style={{width:(p2c/psum*100)+'%',background:`linear-gradient(90deg,${D.violet}99,${D.violet})`,borderRadius:'0 3px 3px 0'}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* FoW */}
      {fow.length>0&&(
        <div style={{borderRadius:D.lg,overflow:'hidden',border:`1px solid ${D.border}`,background:D.surf1}}>
          <div style={{padding:'12px 16px',borderBottom:`1px solid ${D.border}`}}><Lbl>Fall of Wickets</Lbl></div>
          <div style={{padding:'8px 14px 12px',display:'flex',flexWrap:'wrap',gap:'6px 10px'}}>
            {fow.map((w:any,i:number)=>(
              <div key={i} style={{display:'flex',gap:'4px',alignItems:'baseline'}}>
                <span style={{fontFamily:D.mono,fontSize:'13px',fontWeight:700,color:D.rose}}>{w.score??0}</span>
                <span style={{fontFamily:D.head,fontSize:'9px',color:D.textMuted}}>({fmtOv(w.balls??0)} ov)</span>
                {i<fow.length-1&&<span style={{color:D.border}}>·</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Bowling */}
      <div style={{borderRadius:D.lg,overflow:'hidden',border:`1px solid ${D.border}`,background:D.surf1}}>
        <div style={{padding:'12px 16px',borderBottom:`1px solid ${D.border}`}}><Lbl>Bowling</Lbl></div>
        <div style={{padding:'8px 12px 12px'}}>
          {headerRow(['Bowler','O','R','W','Econ'])}
          {bowlers.map((b:any)=>{
            const isCurr=b.playerId===bowlerId;
            return(
              <div key={b.playerId} style={{display:'grid',gridTemplateColumns:'1fr auto auto auto auto',
                gap:'4px 10px',padding:'8px 4px',borderBottom:`1px solid ${D.border}22`,alignItems:'center',
                background:isCurr?`${D.sky}06`:'transparent',borderRadius:'4px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'5px',overflow:'hidden',minWidth:0}}>
                  {isCurr&&<span className="sh-live-dot" style={{width:'5px',height:'5px',borderRadius:'50%',background:D.sky,boxShadow:`0 0 5px ${D.sky}`,flexShrink:0}}/>}
                  <div style={{fontFamily:D.body,fontSize:'12px',fontWeight:isCurr?700:500,
                    color:isCurr?D.textPrimary:D.textSecondary,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {getPlayerName(allPlayers,b.playerId)}
                  </div>
                </div>
                <div style={{fontFamily:D.mono,fontSize:'11px',color:D.textMuted,textAlign:'right',minWidth:'28px'}}>{b.overs??0}</div>
                <div style={{fontFamily:D.mono,fontSize:'11px',color:D.textMuted,textAlign:'right',minWidth:'22px'}}>{b.runsConceded??0}</div>
                <div style={{fontFamily:D.mono,fontSize:'12px',fontWeight:700,color:(b.wickets??0)>0?D.rose:D.textSecondary,textAlign:'right',minWidth:'18px'}}>{b.wickets??0}</div>
                <div style={{fontFamily:D.mono,fontSize:'11px',color:(b.economy??0)<6?D.emerald:(b.economy??0)>10?D.rose:D.amber,textAlign:'right',minWidth:'30px'}}>
                  {b.economy!=null?b.economy.toFixed(2):Econ(b.runsConceded??0,((b.overs??0))*6)}
                </div>
              </div>
            );
          })}
          {bowlers.length===0&&<p style={{color:D.textMuted,fontSize:'12px',textAlign:'center',padding:'12px 0'}}>No bowling data yet</p>}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ANALYSIS PANEL
═══════════════════════════════════════════════════════ */
function ManhattanChart({liveScore}:{liveScore:any}) {
  const ovs:any[]=(liveScore?.overSummaries||liveScore?.overHistory||[]);
  if(!ovs.length)return<p style={{color:D.textMuted,fontSize:'12px',textAlign:'center',padding:'16px'}}>No over data yet</p>;
  const maxR=Math.max(...ovs.map((o:any)=>o.runs??o.totalRuns??0),1);
  return(
    <div style={{display:'flex',alignItems:'flex-end',gap:'4px',height:'80px',padding:'0 4px'}}>
      {ovs.map((o:any,i:number)=>{
        const r=o.runs??o.totalRuns??0;
        const wk=(o.wickets??o.totalWickets??0)>0;
        const h=Math.max(4,Math.round((r/maxR)*72));
        return(
          <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'2px'}}>
            {wk&&<div style={{width:'100%',display:'flex',justifyContent:'center'}}>
              <div style={{width:'4px',height:'4px',borderRadius:'50%',background:D.rose}}/>
            </div>}
            <div style={{width:'100%',borderRadius:'3px 3px 2px 2px',height:`${h}px`,background:wk?D.rose:r>=12?D.amber:r>=8?D.emerald:D.sky,
              minHeight:'4px',transition:'height .3s ease'}}/>
            {i%5===0&&<span style={{fontFamily:D.mono,fontSize:'7px',color:D.textMuted}}>{i+1}</span>}
          </div>
        );
      })}
    </div>
  );
}

function AnalysisPanel({liveScore,subTab,onSubTab,allPlayers,overs,target,isChase,wagonBallLog,wagonCoords,onWagonAim,wagonView,onWagonView,hiddenLines,onToggleLine}:{
  liveScore:any;subTab:AnalysisSubTab;onSubTab:(t:AnalysisSubTab)=>void;allPlayers:Person[];
  overs:number;target?:number;isChase:boolean;
  wagonBallLog:any[];wagonCoords:{angle:number;distance:number}|null;onWagonAim:(c:{angle:number;distance:number})=>void;
  wagonView:'wagon'|'heatmap';onWagonView:(m:'wagon'|'heatmap')=>void;
  hiddenLines:Set<string>;onToggleLine:(k:string)=>void;
}) {
  const TABS:Array<{id:AnalysisSubTab;label:string}>=[ {id:'charts',label:'Charts'},{id:'players',label:'Players'},{id:'signals',label:'Signals'},{id:'intel',label:'Intel'} ];
  const sig=buildSignals(liveScore,overs,target,isChase);
  const ci=liveScore?.currentInnings;
  return(
    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
      <div style={{display:'flex',gap:'4px',background:D.surf2,borderRadius:D.pill,padding:'4px',overflow:'auto'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>onSubTab(t.id)} className="sh-press" style={{
            flex:'0 0 auto',padding:'7px 16px',borderRadius:D.pill,border:'none',cursor:'pointer',
            background:subTab===t.id?D.grad:'transparent',fontFamily:D.head,
            fontSize:'10px',fontWeight:700,letterSpacing:'0.06em',textTransform:'uppercase',
            color:subTab===t.id?'#fff':D.textMuted,transition:'all .2s',whiteSpace:'nowrap',
          }}>{t.label}</button>
        ))}
      </div>
      {subTab==='charts'&&(
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          <div style={{borderRadius:D.lg,border:`1px solid ${D.border}`,background:D.surf1,padding:'14px 16px'}}>
            <Lbl>Run Rate Per Over (Manhattan)</Lbl>
            <div style={{height:'12px'}}/>
            <ManhattanChart liveScore={liveScore}/>
          </div>
          <div style={{borderRadius:D.lg,border:`1px solid ${D.border}`,background:D.surf1,padding:'14px 16px'}}>
            <Lbl>Shot Distribution</Lbl>
            <div style={{height:'12px'}}/>
            <WagonWheel ballLog={wagonBallLog} shotCoords={wagonCoords} onAim={onWagonAim}
              viewMode={wagonView} onViewMode={onWagonView} hiddenLines={hiddenLines} onToggleLine={onToggleLine}/>
          </div>
        </div>
      )}
      {subTab==='players'&&(
        <div>
          {/* Batting leaders */}
          <div style={{borderRadius:D.lg,border:`1px solid ${D.border}`,background:D.surf1,padding:'14px 16px',marginBottom:'12px'}}>
            <Lbl>Top Scorers</Lbl>
            <div style={{height:'10px'}}/>
            {[...(liveScore?.batsmen||[])].sort((a:any,b:any)=>(b.runs??0)-(a.runs??0)).slice(0,5).map((b:any,i:number)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                <div style={{width:'20px',fontFamily:D.mono,fontSize:'12px',color:D.textMuted,flexShrink:0,textAlign:'center'}}>{i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:D.body,fontSize:'12px',fontWeight:600,color:D.textPrimary,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{getPlayerName(allPlayers,b.playerId)}</div>
                  <div style={{height:'3px',background:D.surf3,borderRadius:'2px',marginTop:'4px',overflow:'hidden'}}>
                    <div style={{height:'100%',borderRadius:'2px',background:D.grad,width:`${Math.min(100,(b.runs??0)/Math.max(...(liveScore?.batsmen||[{runs:1}]).map((x:any)=>x.runs??0),1)*100)}%`}}/>
                  </div>
                </div>
                <div style={{fontFamily:D.mono,fontSize:'13px',fontWeight:700,color:D.textPrimary,flexShrink:0}}>{b.runs??0}</div>
                <div style={{fontFamily:D.mono,fontSize:'10px',color:D.textMuted,flexShrink:0}}>({b.ballsFaced??0})</div>
              </div>
            ))}
            {!liveScore?.batsmen?.length&&<p style={{color:D.textMuted,fontSize:'12px',textAlign:'center',padding:'10px 0'}}>No batting data</p>}
          </div>
          {/* Bowling leaders */}
          <div style={{borderRadius:D.lg,border:`1px solid ${D.border}`,background:D.surf1,padding:'14px 16px'}}>
            <Lbl>Top Wicket Takers</Lbl>
            <div style={{height:'10px'}}/>
            {[...(liveScore?.bowlers||[])].sort((a:any,b:any)=>(b.wickets??0)-(a.wickets??0)||(a.runsConceded??999)-(b.runsConceded??999)).slice(0,5).map((b:any,i:number)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
                <div style={{width:'20px',fontFamily:D.mono,fontSize:'12px',color:D.textMuted,flexShrink:0,textAlign:'center'}}>{i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontFamily:D.body,fontSize:'12px',fontWeight:600,color:D.textPrimary,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{getPlayerName(allPlayers,b.playerId)}</div>
                  <div style={{fontFamily:D.mono,fontSize:'9px',color:D.textMuted,marginTop:'2px'}}>{b.overs??0} ov · {b.runsConceded??0}r · econ {b.economy?.toFixed(2)??'—'}</div>
                </div>
                <div style={{fontFamily:D.mono,fontSize:'13px',fontWeight:700,color:b.wickets>0?D.rose:D.textMuted,flexShrink:0}}>{b.wickets??0}W</div>
              </div>
            ))}
            {!liveScore?.bowlers?.length&&<p style={{color:D.textMuted,fontSize:'12px',textAlign:'center',padding:'10px 0'}}>No bowling data</p>}
          </div>
        </div>
      )}
      {subTab==='signals'&&sig&&(
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          <div style={{borderRadius:D.lg,border:`1px solid ${D.border}`,background:D.surf1,padding:'16px'}}>
            <Lbl>Signal Dashboard</Lbl>
            <div style={{height:'14px'}}/>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <SignalBar label="Pressure" value={`${sig.pressure}%`} pct={sig.pressure} color={sig.pressureColor}/>
              <SignalBar label="Momentum" value={sig.momLabel} pct={50+sig.mom/2} color={sig.momColor}/>
              {sig.reqRr!=null&&<SignalBar label="Required RR" value={sig.reqRr} pct={Math.min(100,sig.reqRr/18*100)} color={sig.rrDelta!==null&&sig.rrDelta<0?D.rose:D.emerald}/>}
              <SignalBar label="Run Rate" value={sig.rr} pct={Math.min(100,sig.rr/18*100)} color={D.sky}/>
              <SignalBar label="Dot Ball %" value={`${sig.dotsL6}/6 last 6`} pct={sig.dotsL6/6*100} color={sig.dotsL6>=4?D.rose:sig.dotsL6>=2?D.amber:D.emerald}/>
              <SignalBar label="Boundary Rate" value={`${sig.bndsL6}/6 last 6`} pct={sig.bndsL6/6*100} color={D.indigo}/>
            </div>
          </div>
          {sig.flags.length>0&&(
            <div style={{borderRadius:D.lg,border:`1px solid ${D.orange}30`,background:`${D.orange}08`,padding:'14px 16px'}}>
              <Lbl color={D.orange}>Active Signals</Lbl>
              <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginTop:'10px'}}>
                {sig.flags.map((f:string)=><Badge key={f} color={D.orange}>{f.replace(/_/g,' ')}</Badge>)}
              </div>
            </div>
          )}
          <div style={{borderRadius:D.lg,border:`1px solid ${D.border}`,background:D.surf1,padding:'14px 16px'}}>
            <Lbl>Phase Stats</Lbl>
            <div style={{height:'10px'}}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'10px'}}>
              {[
                {l:'Phase',v:sig.phase},{l:'Dots/12',v:sig.dotsL12},{l:'Bnds/12',v:sig.bndsL12},
                {l:'Last 6',v:`${sig.runsL6}r`},{l:'Wkts/12',v:sig.wktsL12},{l:'Projected',v:sig.projected},
              ].map(item=>(
                <div key={item.l} style={{textAlign:'center',background:D.surf2,borderRadius:D.md,padding:'8px'}}>
                  <div style={{fontFamily:D.mono,fontSize:'15px',fontWeight:500,color:D.textPrimary,lineHeight:1}}>{item.v}</div>
                  <div style={{fontFamily:D.head,fontSize:'7px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.08em',color:D.textMuted,marginTop:'4px'}}>{item.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {subTab==='intel'&&(
        <IntelPanel liveScore={liveScore} overs={overs} target={target} isChase={isChase}/>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   HISTORY TAB
═══════════════════════════════════════════════════════ */
function HistoryPanel({liveScore,allPlayers,onAuditBall}:{liveScore:any;allPlayers:Person[];onAuditBall:(b:any)=>void}) {
  const history:any[]=[...(liveScore?.ballHistory||liveScore?.eventLog||[])].reverse();
  if(!history.length)return(
    <div style={{textAlign:'center',padding:'40px 20px'}}>
      <div style={{fontSize:'28px',marginBottom:'10px'}}>📋</div>
      <Lbl>Ball-by-ball log appears here</Lbl>
    </div>
  );
  return(
    <div style={{display:'flex',flexDirection:'column',gap:'4px'}}>
      {history.map((b:any,i:number)=>{
        const runs=b.runs??b.value??0;
        const isW=!!(b.isWicket||b.type==='W');
        return(
          <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 14px',
            borderRadius:D.md,background:isW?`${D.rose}08`:i%2===0?D.surf1:D.surf0,
            border:`1px solid ${isW?D.rose+'20':D.border}`}}>
            <BallDot runs={runs} isW={isW} extraType={b.extraType}/>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:D.body,fontSize:'12px',color:D.textPrimary,fontWeight:isW?700:400,
                overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                {getPlayerName(allPlayers,b.strikerId)} {isW?`(wicket!)`:runs>0?`scores ${runs}`:'dot'}
                {b.audited && <span style={{fontSize:'9px',color:D.violet,marginLeft:'6px',fontWeight:700}}>[Audited]</span>}
              </div>
              {b.bowlerId&&<div style={{fontFamily:D.body,fontSize:'10px',color:D.textMuted,marginTop:'1px'}}>
                b. {getPlayerName(allPlayers,b.bowlerId)}
                {b.extraType&&` · ${b.extraType}`}
                {b.shotType&&` · ${b.shotType}`}
              </div>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <div style={{fontFamily:D.head,fontSize:'8px',color:D.textMuted,textAlign:'right',flexShrink:0}}>
                {b.inningsNumber===2?'2nd':'1st'} · {b.overNumber!==undefined?`${b.overNumber}.${b.ballNumber}`:''} ov
              </div>
              <button onClick={()=>onAuditBall(b)} className="sh-press" title="Audit / Correct Delivery" style={{
                padding:'4px 8px',borderRadius:D.pill,background:D.surf2,border:`1px solid ${D.border}`,
                color:D.textMuted,fontSize:'9px',fontFamily:D.head,fontWeight:700,cursor:'pointer'
              }}>
                ✏️ Edit
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SHEETS
═══════════════════════════════════════════════════════ */
function ShotSelectorSheet({onSelect,onClose,current}:{onSelect:(s:string)=>void;onClose:()=>void;current?:string|null}) {
  return(
    <Sheet title="Shot Type" accent={D.amber} onClose={onClose}>
      <div style={{marginTop:'6px',display:'flex',flexDirection:'column',gap:'14px',paddingTop:'8px'}}>
        {SHOT_CATEGORIES.map(cat=>(
          <div key={cat.cat}>
            <Lbl color={cat.color}>{cat.cat}</Lbl>
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px',marginTop:'8px'}}>
              {cat.shots.map(shot=>{
                const active=current===shot.id;
                return(
                  <button key={shot.id} onClick={()=>onSelect(shot.id)} className="sh-press" style={{
                    padding:'7px 14px',borderRadius:D.pill,cursor:'pointer',fontFamily:D.body,
                    fontSize:'12px',fontWeight:600,transition:'all .15s',whiteSpace:'nowrap',
                    background:active?`${cat.color}22`:'transparent',
                    border:`1.5px solid ${active?cat.color:D.border}`,
                    color:active?cat.color:D.textSecondary,
                  }}>
                    {active&&'✓ '}{shot.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {current&&(
          <Btn variant="ghost" full sx={{marginTop:'6px'}} onClick={()=>onSelect('')}>Clear selection</Btn>
        )}
      </div>
    </Sheet>
  );
}

function WicketSheet({fieldingPlayers,onConfirm,onClose}:{
  fieldingPlayers:Person[];onConfirm:(t:WicketMode,fId?:string)=>void;onClose:()=>void;
}) {
  const[mode,setMode]=useState<WicketMode>(null);
  const[fId,setFId]=useState<string|null>(null);
  const needsFielder=mode==='caught'||mode==='run_out'||mode==='stumped';
  const types:Array<{id:WicketMode;label:string;icon:string}>=[
    {id:'bowled',label:'Bowled',icon:'🎯'},{id:'caught',label:'Caught',icon:'🙌'},
    {id:'lbw',label:'LBW',icon:'🦵'},{id:'stumped',label:'Stumped',icon:'🧤'},
    {id:'run_out',label:'Run Out',icon:'🏃'},{id:'hit_wicket',label:'Hit Wicket',icon:'💥'},
  ];
  return(
    <Sheet title="Wicket" accent={D.rose} onClose={onClose}>
      <div style={{paddingTop:'12px',display:'flex',flexDirection:'column',gap:'10px'}}>
        <Lbl>Type</Lbl>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'4px'}}>
          {types.map(t=>{
            const active=mode===t.id;
            return(
              <button key={t.id!} onClick={()=>setMode(t.id)} className="sh-press" style={{
                padding:'12px',borderRadius:D.lg,cursor:'pointer',fontFamily:D.body,fontSize:'13px',fontWeight:600,
                background:active?`${D.rose}18`:'transparent',
                border:`1.5px solid ${active?D.rose:D.border}`,color:active?D.rose:D.textSecondary,
                display:'flex',alignItems:'center',gap:'8px',transition:'all .15s',
              }}>
                <span style={{fontSize:'16px'}}>{t.icon}</span>{t.label}
              </button>
            );
          })}
        </div>
        {needsFielder&&mode&&(
          <>
            <Sep/>
            <Lbl color={D.rose}>{mode==='stumped'?'Stumper':'Fielder (optional)'}</Lbl>
            <div style={{display:'flex',flexDirection:'column',gap:'5px',maxHeight:'160px',overflowY:'auto'}}>
              {fieldingPlayers.map(p=>(
                <button key={p.id} onClick={()=>setFId(p.id===fId?null:p.id!)} className="sh-press" style={{
                  display:'flex',alignItems:'center',gap:'10px',padding:'10px 12px',borderRadius:D.md,
                  cursor:'pointer',fontFamily:D.body,fontSize:'12px',
                  background:fId===p.id?`${D.rose}12`:'transparent',
                  border:`1px solid ${fId===p.id?D.rose:D.border}`,color:fId===p.id?D.rose:D.textSecondary,
                }}>
                  <div style={{width:'8px',height:'8px',borderRadius:'50%',flexShrink:0,
                    background:fId===p.id?D.rose:D.border,border:`1.5px solid ${fId===p.id?D.rose+'88':D.border}`}}/>
                  {p.firstName} {p.lastName}
                </button>
              ))}
            </div>
          </>
        )}
        <Btn variant="danger" disabled={!mode} onClick={()=>mode&&onConfirm(mode,fId||undefined)} full sx={{marginTop:'6px'}}>
          Confirm Wicket{fId&&mode==='caught'?` (c. ${fieldingPlayers.find(p=>p.id===fId)?.firstName||fId})`:fId&&mode==='stumped'?` (st. ${fieldingPlayers.find(p=>p.id===fId)?.firstName||fId})`:''}
        </Btn>
      </div>
    </Sheet>
  );
}

function ExtrasSheet({onConfirm,onClose}:{onConfirm:(t:ExtraType,r:number)=>void;onClose:()=>void}) {
  const[type,setType]=useState<ExtraType>(null);
  const[r,setR]=useState(1);
  const types:Array<{id:ExtraType;label:string;icon:string;desc:string}>=[
    {id:'wide',label:'Wide',icon:'🚫',desc:'+1 min. (no ball faced)'},{id:'noball',label:'No Ball',icon:'🔴',desc:'+1 min. (free hit next)'},
    {id:'bye',label:'Bye',icon:'👟',desc:'Runs to batting team'},{id:'legbye',label:'Leg Bye',icon:'🦵',desc:'Ball hit pad'},
  ];
  return(
    <Sheet title="Extras" accent={D.amber} onClose={onClose}>
      <div style={{paddingTop:'12px',display:'flex',flexDirection:'column',gap:'10px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
          {types.map(t=>{
            const active=type===t.id;
            return(
              <button key={t.id!} onClick={()=>setType(active?null:t.id)} className="sh-press" style={{
                padding:'12px',borderRadius:D.lg,cursor:'pointer',fontFamily:D.body,fontSize:'12px',fontWeight:600,
                background:active?`${D.amber}15`:'transparent',
                border:`1.5px solid ${active?D.amber:D.border}`,textAlign:'left',
                color:active?D.amber:D.textSecondary,transition:'all .15s',
              }}>
                <div style={{fontSize:'18px',marginBottom:'4px'}}>{t.icon}</div>
                <div style={{fontWeight:700}}>{t.label}</div>
                <div style={{fontSize:'9px',color:D.textMuted,marginTop:'2px',lineHeight:1.3}}>{t.desc}</div>
              </button>
            );
          })}
        </div>
        {type&&(
          <>
            <Sep/>
            <Lbl>Runs scored off this extra</Lbl>
            <div style={{display:'flex',gap:'6px',flexWrap:'wrap'}}>
              {[0,1,2,3,4,5,6].map(n=>(
                <button key={n} onClick={()=>setR(n)} className="sh-press" style={{
                  width:'38px',height:'38px',borderRadius:'50%',cursor:'pointer',
                  fontFamily:D.mono,fontSize:'14px',fontWeight:700,
                  background:r===n?`${D.amber}20`:'transparent',
                  border:`1.5px solid ${r===n?D.amber:D.border}`,color:r===n?D.amber:D.textSecondary,
                }}>{n}</button>
              ))}
            </div>
          </>
        )}
        <Btn variant="amber" disabled={!type} onClick={()=>type&&onConfirm(type,r)} full sx={{marginTop:'6px'}}>
          Confirm {type&&`· ${type} +${r}`}
        </Btn>
      </div>
    </Sheet>
  );
}

function PlayerSheet({title,players,excludeIds,onSelect,onClose}:{title:string;players:Person[];excludeIds:string[];onSelect:(id:string)=>void;onClose:()=>void}) {
  const[q,setQ]=useState('');
  const filtered=players.filter(p=>!excludeIds.includes(p.id||'')&&`${p.firstName} ${p.lastName}`.toLowerCase().includes(q.toLowerCase()));
  return(
    <Sheet title={title} accent={D.sky} onClose={onClose}>
      <div style={{marginTop:'8px'}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search player…"
          style={{width:'100%',padding:'10px 14px',borderRadius:D.pill,background:D.surf2,
            border:`1px solid ${D.border}`,color:D.textPrimary,fontFamily:D.body,fontSize:'13px',
            outline:'none',marginBottom:'10px'}}/>
        <div style={{display:'flex',flexDirection:'column',gap:'5px',maxHeight:'280px',overflowY:'auto'}}>
          {filtered.length===0&&<p style={{color:D.textMuted,fontSize:'12px',textAlign:'center',padding:'12px'}}>No players found</p>}
          {filtered.map(p=>(
            <button key={p.id} onClick={()=>onSelect(p.id!)} className="sh-press" style={{
              display:'flex',alignItems:'center',gap:'10px',padding:'12px 14px',borderRadius:D.lg,
              cursor:'pointer',fontFamily:D.body,fontSize:'13px',fontWeight:600,
              background:`${D.sky}00`,border:`1px solid ${D.border}`,color:D.textPrimary,
              textAlign:'left',transition:'all .15s',
            }}>
              <div style={{width:'32px',height:'32px',borderRadius:'50%',flexShrink:0,
                background:`${D.sky}18`,border:`1.5px solid ${D.sky}30`,
                display:'flex',alignItems:'center',justifyContent:'center',
                fontFamily:D.head,fontSize:'11px',fontWeight:700,color:D.sky}}>
                {(p.firstName?.[0]||'?')+(p.lastName?.[0]||'')}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.firstName} {p.lastName}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
/* ═══════════════════════════════════════════════════════
   3-PHASE SCORING UTILITIES & MODES
═══════════════════════════════════════════════════════ */
function ScorerModeSwitcher({ mode, onChange }: { mode: ScorerMode; onChange: (m: ScorerMode) => void }) {
  const modes: Array<{ id: ScorerMode; label: string; icon: string; desc: string }> = [
    { id: 'quick', label: 'Quick', icon: '⚡', desc: 'Score only · Fast Parents/Volunteers' },
    { id: 'standard', label: 'Standard', icon: '🎯', desc: 'Score + Wagon Wheel' },
    { id: 'full', label: 'Full OS', icon: '🚀', desc: 'Score + Wagon + Contact + Audit' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: D.surf2, borderRadius: D.pill, padding: '3px', border: `1px solid ${D.border}` }}>
      {modes.map(m => {
        const active = mode === m.id;
        return (
          <button key={m.id} onClick={() => onChange(m.id)} className="sh-press" title={m.desc} style={{
            padding: '5px 12px', borderRadius: D.pill, border: 'none', cursor: 'pointer',
            background: active ? D.grad : 'transparent',
            color: active ? '#fff' : D.textMuted,
            fontFamily: D.head, fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em',
            textTransform: 'uppercase', transition: 'all .25s', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <span>{m.icon}</span> {m.label}
          </button>
        );
      })}
    </div>
  );
}

function EnrichmentDrawer({
  isOpen, onClose, onSave, fieldingPlayers,
  shotType, setShotType, shotCoords, setShotCoords,
  contactQuality, setContactQuality, commentary, setCommentary, fielderId, setFielderId,
}: {
  isOpen: boolean; onClose: () => void; onSave: () => void; fieldingPlayers: Person[];
  shotType: ShotTypeChoice; setShotType: (s: ShotTypeChoice) => void;
  shotCoords: { angle: number; distance: number } | null; setShotCoords: (c: { angle: number; distance: number } | null) => void;
  contactQuality: ContactQuality; setContactQuality: (q: ContactQuality) => void;
  commentary: string; setCommentary: (c: string) => void;
  fielderId: string | null; setFielderId: (id: string | null) => void;
}) {
  if (!isOpen) return null;
  const qualities: Array<{ id: ContactQuality; label: string; icon: string }> = [
    { id: 'middled', label: 'Middled', icon: '🌟' },
    { id: 'edged', label: 'Edged', icon: '😬' },
    { id: 'missed', label: 'Missed', icon: '❌' },
    { id: 'lofted', label: 'Lofted', icon: '🚀' },
    { id: 'defended', label: 'Defended', icon: '🛡️' },
  ];

  return (
    <Sheet title="Phase 2 Delivery Enrichment" accent={D.sky} onClose={onClose}>
      <div style={{ paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ fontSize: '11px', color: D.textMuted, fontFamily: D.body }}>
          Enrich delivery details asynchronously without interrupting live scoring.
        </div>

        {/* Contact Quality */}
        <div>
          <Lbl>Contact Quality</Lbl>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
            {qualities.map(q => {
              const active = contactQuality === q.id;
              return (
                <button key={q.id!} onClick={() => setContactQuality(active ? null : q.id)} className="sh-press" style={{
                  padding: '6px 12px', borderRadius: D.pill, cursor: 'pointer', fontFamily: D.body, fontSize: '11px', fontWeight: 600,
                  background: active ? `${D.sky}22` : 'transparent',
                  border: `1.5px solid ${active ? D.sky : D.border}`,
                  color: active ? D.sky : D.textSecondary, transition: 'all .15s',
                }}>
                  {q.icon} {q.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fielder Assignment */}
        {fieldingPlayers.length > 0 && (
          <div>
            <Lbl>Involved Fielder</Lbl>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px', maxHeight: '100px', overflowY: 'auto' }}>
              {fieldingPlayers.map(p => {
                const active = fielderId === p.id;
                return (
                  <button key={p.id} onClick={() => setFielderId(active ? null : p.id!)} className="sh-press" style={{
                    padding: '5px 10px', borderRadius: D.pill, cursor: 'pointer', fontFamily: D.body, fontSize: '11px', fontWeight: 500,
                    background: active ? `${D.emerald}22` : 'transparent',
                    border: `1px solid ${active ? D.emerald : D.border}`,
                    color: active ? D.emerald : D.textSecondary,
                  }}>
                    {p.firstName} {p.lastName[0]}.
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Commentary Note */}
        <div>
          <Lbl>Commentary / Scorer Note</Lbl>
          <input
            value={commentary}
            onChange={e => setCommentary(e.target.value)}
            placeholder="e.g. Crisp drive through extra cover..."
            style={{
              width: '100%', marginTop: '6px', padding: '10px 14px', borderRadius: D.md,
              background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary,
              fontFamily: D.body, fontSize: '12px', outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <Btn variant="ghost" full onClick={onClose}>Skip / Close</Btn>
          <Btn variant="primary" full onClick={onSave}>Save Enrichment</Btn>
        </div>
      </div>
    </Sheet>
  );
}

function BallAuditEditSheet({
  ball,
  onSave,
  onClose,
}: {
  ball: any;
  onSave: (updatedBall: any) => void;
  onClose: () => void;
}) {
  const [runs, setRuns] = useState<number>(ball.runs ?? ball.value ?? 0);
  const [extraType, setExtraType] = useState<ExtraType>(ball.extraType ?? null);
  const [wicketType, setWicketType] = useState<WicketMode>(ball.wicketType ?? (ball.isWicket ? 'bowled' : null));
  const [commentary, setCommentary] = useState<string>(ball.commentaryText ?? ball.commentary ?? '');

  return (
    <Sheet title="Phase 3 Delivery Audit & Edit" accent={D.violet} onClose={onClose}>
      <div style={{ paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '11px', color: D.textMuted, fontFamily: D.body }}>
          Correct historical delivery records with audit tracking.
        </div>
        <div>
          <Lbl>Runs Off Bat</Lbl>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            {[0, 1, 2, 3, 4, 6].map(r => (
              <button key={r} onClick={() => setRuns(r)} className="sh-press" style={{
                flex: 1, padding: '10px 0', borderRadius: D.md, fontFamily: D.mono, fontSize: '14px', fontWeight: 700,
                background: runs === r ? `${D.violet}22` : 'transparent',
                border: `1.5px solid ${runs === r ? D.violet : D.border}`,
                color: runs === r ? D.violet : D.textSecondary, cursor: 'pointer',
              }}>{r}</button>
            ))}
          </div>
        </div>
        <div>
          <Lbl>Wicket Status</Lbl>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
            {['none', 'bowled', 'caught', 'lbw', 'stumped', 'run_out'].map(w => {
              const active = (w === 'none' && !wicketType) || wicketType === w;
              return (
                <button key={w} onClick={() => setWicketType(w === 'none' ? null : (w as WicketMode))} className="sh-press" style={{
                  padding: '6px 12px', borderRadius: D.pill, fontFamily: D.body, fontSize: '11px', fontWeight: 600,
                  background: active ? `${D.rose}22` : 'transparent',
                  border: `1.5px solid ${active ? D.rose : D.border}`,
                  color: active ? D.rose : D.textSecondary, cursor: 'pointer', textTransform: 'capitalize',
                }}>{w.replace('_', ' ')}</button>
              );
            })}
          </div>
        </div>
        <div>
          <Lbl>Commentary / Audit Note</Lbl>
          <input value={commentary} onChange={e => setCommentary(e.target.value)} placeholder="Reason for correction..."
            style={{ width: '100%', marginTop: '6px', padding: '10px 14px', borderRadius: D.md, background: D.surf2, border: `1px solid ${D.border}`, color: D.textPrimary, fontSize: '12px', outline: 'none' }} />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
          <Btn variant="ghost" full onClick={onClose}>Cancel</Btn>
          <Btn variant="primary" full onClick={() => onSave({ ...ball, runs, extraType, wicketType, isWicket: !!wicketType, commentaryText: commentary, audited: true })}>Save Audit Correction</Btn>
        </div>
      </div>
    </Sheet>
  );
}

/* ═══════════════════════════════════════════════════════
   GLASS CARD HELPER
═══════════════════════════════════════════════════════ */
function GlassCard({children,sx,onClick}:{children:React.ReactNode;sx?:React.CSSProperties;onClick?:()=>void}) {
  return(
    <div onClick={onClick} style={{background:D.surf1,border:`1px solid ${D.border}`,borderRadius:D.lg,
      backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',cursor:onClick?'pointer':undefined,...sx}}>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   BOTTOM NAV
═══════════════════════════════════════════════════════ */
function BottomNav({active,onChange}:{active:ActiveTab;onChange:(t:ActiveTab)=>void}) {
  const tabs:Array<{id:ActiveTab;label:string;icon:string}>=[{id:'score',label:'Score',icon:'🏏'},{id:'cards',label:'Cards',icon:'📋'},{id:'analysis',label:'Analysis',icon:'📊'},{id:'history',label:'History',icon:'🕐'}];
  return(
    <div style={{position:'fixed',bottom:0,left:0,right:0,zIndex:100,
      background:'rgba(5,8,15,0.92)',backdropFilter:'blur(28px) saturate(1.8)',WebkitBackdropFilter:'blur(28px) saturate(1.8)',
      borderTop:`1px solid ${D.borderMed}`,boxShadow:'0 -16px 64px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.06)',
      display:'grid',gridTemplateColumns:'repeat(4,1fr)',paddingBottom:'max(env(safe-area-inset-bottom),10px)'}}>
      {tabs.map(t=>{
        const on=active===t.id;
        return(
          <button key={t.id} onClick={()=>onChange(t.id)} style={{border:'none',background:'transparent',padding:'10px 4px 6px',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',transition:'all .2s'}}>
            {on
              ?<div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',background:D.grad,borderRadius:D.pill,padding:'6px 20px',boxShadow:`0 2px 16px rgba(79,70,229,.4)`,minWidth:'70px'}}>
                  <span style={{fontSize:'15px',lineHeight:1}}>{t.icon}</span>
                  <span style={{fontFamily:D.head,fontSize:'8px',fontWeight:800,letterSpacing:'0.1em',textTransform:'uppercase',color:'#fff'}}>{t.label}</span>
                </div>
              :<div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'70px',padding:'6px 20px'}}>
                  <span style={{fontSize:'15px',lineHeight:1,opacity:.4}}>{t.icon}</span>
                  <span style={{fontFamily:D.head,fontSize:'8px',fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:D.textMuted}}>{t.label}</span>
                </div>
            }
          </button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export function ScoringHubClient({ match, homePlayers, awayPlayers }: ScoringHubClientProps) {
  const allPlayers = [...homePlayers, ...awayPlayers];
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.key >= '0' && e.key <= '6' && e.key !== '5') {
        setRuns(parseInt(e.key, 10));
        scoringAudio.playKeyClick();
      } else if (e.key === 'w' || e.key === 'W') {
        setShowWicketSheet(true);
        scoringAudio.playKeyClick();
      } else if (e.key === 'e' || e.key === 'E') {
        setShowEnrichmentDrawer(true);
        scoringAudio.playKeyClick();
      } else if (e.key === 'b' || e.key === 'B') {
        setShowBroadcast(prev => !prev);
      } else if (e.key === 's' || e.key === 'S') {
        setSoundActive(scoringAudio.toggleSound());
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

  // Build wagon wheel ball log from ball history with segment inference
  const wagonBallLog: any[] = (liveScore?.ballHistory || []).map((b: any) => ({
    ...b,
    seg: b.shotZone != null ? b.shotZone : b.shotCoordinates?.angle != null
      ? SEGS.reduce((ci2: number, s, i) => {
          const diff = Math.abs(((b.shotCoordinates.angle - s.angle) + 360) % 360);
          const cdiff = Math.abs(((b.shotCoordinates.angle - SEGS[ci2].angle) + 360) % 360);
          return diff < cdiff ? i : ci2;
        }, 0)
      : null,
  }));

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

  function handleToggleLine(k: string) {
    setHiddenLines(prev => { const s = new Set(prev); s.has(k) ? s.delete(k) : s.add(k); return s; });
  }

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
                <Lbl>Record Ball</Lbl>
                <div style={{ height: '12px' }} />

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
