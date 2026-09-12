/* Small presentational building blocks used across the scoring hub. */

import React from 'react';
import { D, type ActiveTab } from './design';

export function Lbl({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{fontFamily:D.head,fontSize:'10px',fontWeight:700,letterSpacing:'0.15em',
      textTransform:'uppercase',color:color||D.textMuted}}>{children}</div>
  );
}

export function Sep({ my = 12 }: { my?: number }) {
  return <div style={{height:'1px',background:D.border,margin:`${my}px 0`}} />;
}

export function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span style={{fontFamily:D.head,fontSize:'9px',fontWeight:700,letterSpacing:'0.12em',
      textTransform:'uppercase',padding:'3px 8px',borderRadius:D.pill,
      background:`${color}1e`,color,border:`1px solid ${color}30`,flexShrink:0}}>{children}</span>
  );
}

export function Btn({ children, onClick, disabled, variant = 'primary', full, sx }: {
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

export function SignalBar({ label, value, pct, color }: { label: string; value: string | number; pct: number; color: string }) {
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

export function Sheet({ children, title, accent, onClose }: { children: React.ReactNode; title?: string; accent?: string; onClose: () => void }) {
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

export function BallDot({runs,isW,extraType}:{runs:number;isW:boolean;extraType?:string|null}) {
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

export function LiveDot() {
  return(
    <span className="sh-live-dot" style={{width:'6px',height:'6px',borderRadius:'50%',
      background:'#f43f5e',display:'inline-block',flexShrink:0,boxShadow:'0 0 6px #f43f5e'}} />
  );
}

export function GlassCard({children,sx,onClick}:{children:React.ReactNode;sx?:React.CSSProperties;onClick?:()=>void}) {
  return(
    <div onClick={onClick} style={{background:D.surf1,border:`1px solid ${D.border}`,borderRadius:D.lg,
      backdropFilter:'blur(12px)',WebkitBackdropFilter:'blur(12px)',cursor:onClick?'pointer':undefined,...sx}}>
      {children}
    </div>
  );
}

export function BottomNav({active,onChange}:{active:ActiveTab;onChange:(t:ActiveTab)=>void}) {
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
