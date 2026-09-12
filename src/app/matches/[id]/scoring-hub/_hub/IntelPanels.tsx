import { memo, useEffect, useRef, useState } from 'react';
import { D } from './design';
import { Lbl, Badge, SignalBar } from './primitives';
import { buildSignals, buildNarratives, fmtOv } from './helpers';

function DynamicBarImpl({liveScore,overs,target,isChase}:{liveScore:any;overs:number;target?:number;isChase:boolean}) {
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

export const DynamicBar = memo(DynamicBarImpl);

function IntelPanelImpl({liveScore,overs,target,isChase}:{liveScore:any;overs:number;target?:number;isChase:boolean}) {
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

export const IntelPanel = memo(IntelPanelImpl);
