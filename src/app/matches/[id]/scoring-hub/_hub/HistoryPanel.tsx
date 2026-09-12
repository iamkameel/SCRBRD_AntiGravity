import { memo } from 'react';
import type { Person } from '@/types/firestore';
import { D } from './design';
import { Lbl, BallDot } from './primitives';
import { getPlayerName } from './helpers';

function HistoryPanelImpl({liveScore,allPlayers,onAuditBall}:{liveScore:any;allPlayers:Person[];onAuditBall:(b:any)=>void}) {
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

export const HistoryPanel = memo(HistoryPanelImpl);
