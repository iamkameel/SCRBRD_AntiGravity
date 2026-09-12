import React, { memo, useRef, useState } from 'react';
import { D } from './design';
import { Lbl } from './primitives';
import { CX, CY, R_IN, R_MID, R_BND, toXY, arcPath, piePath, SEGS, SEG_BOUNDS, LK_COLS, lineKey, heatColor, wagEnd } from './field';

function WagonWheelImpl({ballLog=[],shotCoords,onAim,viewMode,onViewMode,hiddenLines,onToggleLine}:{
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

export const WagonWheel = memo(WagonWheelImpl);
