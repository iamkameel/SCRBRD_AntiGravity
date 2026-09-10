import React from 'react';
import { Person } from '@/types/firestore';
import { D } from '@/lib/scoring/theme';
import { Lbl } from './primitives';
import { getPlayerName } from './utils';

export function TabsHistory({ liveScore, allPlayers }: { liveScore: any; allPlayers: Person[] }) {
  const history: any[] = [...(liveScore?.ballHistory || liveScore?.eventLog || [])].reverse();
  
  if (!history.length) return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '28px', marginBottom: '10px' }}>📋</div>
      <Lbl>Ball-by-ball log appears here</Lbl>
    </div>
  );

  function BallDot({ runs, isW, extraType }: { runs: number; isW: boolean; extraType?: string | null }) {
    const col = isW ? D.rose : extraType === 'wide' || extraType === 'noball' ? D.amber : runs === 6 ? D.violet : runs === 4 ? D.indigo : runs === 0 ? D.surf3 : D.emerald;
    const txt = isW ? 'W' : extraType === 'wide' ? `${runs}W` : extraType === 'noball' ? `${runs}N` : extraType === 'bye' ? `${runs}B` : extraType === 'legbye' ? `${runs}L` : runs === 0 ? '•' : String(runs);
    return (
      <div style={{
        width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: D.mono, fontSize: '11px', fontWeight: 700, flexShrink: 0,
        background: isW || runs === 6 ? `${col}22` : runs === 4 ? `${col}1a` : `${col}11`,
        color: col, border: `1.5px solid ${col}44`, animation: 'chipPop .25s ease both'
      }}>
        {txt}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '90px' }}>
      {history.map((b: any, i: number) => {
        const runs = b.runs ?? b.value ?? 0;
        const isW = !!(b.isWicket || b.type === 'W');
        
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
            borderRadius: D.md, background: isW ? `${D.rose}08` : i % 2 === 0 ? D.surf1 : D.surf0,
            border: `1px solid ${isW ? D.rose + '20' : D.border}`
          }}>
            <BallDot runs={runs} isW={isW} extraType={b.extraType} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: D.body, fontSize: '12px', color: D.textPrimary, fontWeight: isW ? 700 : 400,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {getPlayerName(allPlayers, b.strikerId)} {isW ? `(wicket!)` : runs > 0 ? `scores ${runs}` : 'dot'}
              </div>
              {b.bowlerId && <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted, marginTop: '1px' }}>
                b. {getPlayerName(allPlayers, b.bowlerId)}
                {b.extraType && ` · ${b.extraType}`}
                {b.shotType && ` · ${b.shotType}`}
              </div>}
            </div>
            <div style={{ fontFamily: D.head, fontSize: '8px', color: D.textMuted, textAlign: 'right', flexShrink: 0 }}>
              {b.inningsNumber === 2 ? '2nd' : '1st'} · {b.overNumber !== undefined ? `${b.overNumber}.${b.ballNumber}` : ''} ov
            </div>
          </div>
        );
      })}
    </div>
  );
}
