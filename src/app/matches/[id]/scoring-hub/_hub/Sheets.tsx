/* Bottom sheets and drawers for ball entry, player selection and audit. */

import { useState } from 'react';
import type { Person } from '@/types/firestore';
import { D, SHOT_CATEGORIES, type ExtraType, type WicketMode, type ScorerMode, type ShotTypeChoice, type ContactQuality } from './design';
import { Lbl, Sep, Btn, Sheet } from './primitives';

export function ShotSelectorSheet({onSelect,onClose,current}:{onSelect:(s:string)=>void;onClose:()=>void;current?:string|null}) {
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

export function WicketSheet({fieldingPlayers,onConfirm,onClose}:{
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

export function ExtrasSheet({onConfirm,onClose}:{onConfirm:(t:ExtraType,r:number)=>void;onClose:()=>void}) {
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

export function PlayerSheet({title,players,excludeIds,onSelect,onClose}:{title:string;players:Person[];excludeIds:string[];onSelect:(id:string)=>void;onClose:()=>void}) {
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

export function ScorerModeSwitcher({ mode, onChange }: { mode: ScorerMode; onChange: (m: ScorerMode) => void }) {
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

export function EnrichmentDrawer({
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

export function BallAuditEditSheet({
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
