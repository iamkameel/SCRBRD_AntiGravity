import React from 'react';
import { Person } from '@/types/firestore';
import { D } from '@/lib/scoring/theme';
import { Lbl, Badge, Sep } from './primitives';
import { fmtOv, getPlayerName, SR, Econ } from './utils';

export function TabsCards({ liveScore, allPlayers, strikerId, nonStrikerId, bowlerId }: {
  liveScore: any; allPlayers: Person[]; strikerId?: string | null; nonStrikerId?: string | null; bowlerId?: string | null;
}) {
  const batsmen = (liveScore?.batsmen || []) as any[];
  const bowlers = (liveScore?.bowlers || []) as any[];
  const inn = liveScore?.currentInnings;
  const fow = (liveScore?.fallOfWickets ?? liveScore?.currentInnings?.fallOfWickets ?? []) as any[];
  const parts = (liveScore?.partnerships ?? []) as any[];
  
  const headerRow = (headers: string[]) => (
    <div style={{ display: 'grid', gridTemplateColumns: headers.map((_, i) => i === 0 ? '1fr' : 'auto').join(' '), gap: '4px 10px',
      padding: '5px 4px', borderBottom: `1px solid ${D.border}`, marginBottom: '4px' }}>
      {headers.map((h, i) => (
        <div key={i} style={{ fontFamily: D.head, fontSize: '8px', fontWeight: 700, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: D.textMuted, textAlign: i === 0 ? 'left' : 'right' }}>{h}</div>
      ))}
    </div>
  );
  
  const isAtCrease = (id: string) => id === strikerId || id === nonStrikerId;
  const isStriker = (id: string) => id === strikerId;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Batting */}
      <div style={{ borderRadius: D.lg, overflow: 'hidden', border: `1px solid ${D.border}`, background: D.surf1 }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lbl>Batting</Lbl>
          {inn && <Badge color={D.emerald}>{inn.runs ?? 0}/{inn.wickets ?? 0} ({fmtOv(inn.balls ?? 0)} ov)</Badge>}
        </div>
        <div style={{ padding: '8px 12px 12px' }}>
          {headerRow(['Batter', 'R', 'B', '4s', '6s', 'SR'])}
          {batsmen.map((b: any) => {
            const atC = isAtCrease(b.playerId);
            const str = isStriker(b.playerId);
            const col = b.isOut ? D.textMuted : atC ? D.textPrimary : D.textSecondary;
            const rowBg = str ? `${D.emerald}08` : atC ? `${D.sky}06` : 'transparent';
            const lhb = b.battingStyle === 'left-hand';
            return (
              <div key={b.playerId} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto auto',
                gap: '4px 10px', padding: '8px 4px', background: rowBg, borderBottom: `1px solid ${D.border}22`,
                alignItems: 'center', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', minWidth: 0 }}>
                  {atC && <span className={str ? 'sh-live-dot' : undefined} style={{ width: '6px', height: '6px', flexShrink: 0, borderRadius: '50%', background: str ? D.emerald : D.sky }} />}
                  {!atC && <span style={{ width: '6px', flexShrink: 0 }} />}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: atC ? 700 : 500, color: col,
                      textDecoration: b.isOut ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getPlayerName(allPlayers, b.playerId)}
                    </div>
                    {b.isOut && b.dismissal && <div style={{ fontFamily: D.body, fontSize: '9px', color: D.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.dismissal}</div>}
                    {!b.isOut && !atC && <div style={{ fontFamily: D.body, fontSize: '9px', color: D.textMuted, fontStyle: 'italic' }}>batting</div>}
                  </div>
                  {lhb && <span style={{ fontFamily: D.head, fontSize: '7px', fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase', padding: '1px 4px', borderRadius: '3px',
                    border: `1px solid ${D.violet}44`, color: D.violet, flexShrink: 0 }}>LHB</span>}
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 700, color: col, textAlign: 'right' }}>
                  {b.runs ?? 0}
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right', minWidth: '24px' }}>
                  {b.ballsFaced ?? 0}
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right', minWidth: '18px' }}>
                  {b.fours ?? 0}
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: b.sixes > 0 ? D.amber : D.textMuted, textAlign: 'right', minWidth: '18px' }}>
                  {b.sixes ?? 0}
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '11px',
                  color: (b.ballsFaced ?? 0) > 0 && (b.runs / b.ballsFaced * 100) >= 150 ? D.emerald : (b.ballsFaced ?? 0) > 0 && (b.runs / b.ballsFaced * 100) <= 60 ? D.rose : D.textMuted,
                  textAlign: 'right', minWidth: '30px' }}>
                  {SR(b.runs ?? 0, b.ballsFaced ?? 0)}
                </div>
              </div>
            );
          })}
          {batsmen.length === 0 && <p style={{ color: D.textMuted, fontSize: '12px', textAlign: 'center', padding: '12px 0' }}>No batters yet</p>}
          {inn && <>
            <Sep my={8} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', padding: '0 4px' }}>
              {[
                { l: 'Extras', v: `${inn.extras ?? 0}` },
                { l: 'Total', v: `${inn.runs ?? 0}/${inn.wickets ?? 0}` },
                { l: 'Overs', v: fmtOv(inn.balls ?? 0) },
              ].map(item => (
                <div key={item.l} style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: D.head, fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: D.textMuted }}>{item.l}</div>
                  <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 700, color: D.textPrimary, marginTop: '2px' }}>{item.v}</div>
                </div>
              ))}
            </div>
          </>}
        </div>
      </div>
      
      {/* Partnerships */}
      {parts.length > 0 && (
        <div style={{ borderRadius: D.lg, overflow: 'hidden', border: `1px solid ${D.border}`, background: D.surf1 }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}` }}><Lbl>Partnerships</Lbl></div>
          <div style={{ padding: '8px 12px 12px' }}>
            {parts.map((p: any, i: number) => {
              const total = p.runs ?? 0;
              const p1c = p.player1Runs ?? 0; const p2c = p.player2Runs ?? 0; const psum = p1c + p2c || 1;
              return (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getPlayerName(allPlayers, p.player1Id)} & {getPlayerName(allPlayers, p.player2Id)}
                    </span>
                    <span style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 700, color: D.textPrimary, flexShrink: 0, marginLeft: '8px' }}>
                      {total}({p.balls ?? 0})
                    </span>
                  </div>
                  <div style={{ height: '5px', borderRadius: '3px', background: D.surf3, overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: (p1c / psum * 100) + '%', background: `linear-gradient(90deg,${D.sky},${D.sky}99)`, borderRadius: '3px 0 0 3px' }} />
                    <div style={{ width: (p2c / psum * 100) + '%', background: `linear-gradient(90deg,${D.violet}99,${D.violet})`, borderRadius: '0 3px 3px 0' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* FoW */}
      {fow.length > 0 && (
        <div style={{ borderRadius: D.lg, overflow: 'hidden', border: `1px solid ${D.border}`, background: D.surf1 }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}` }}><Lbl>Fall of Wickets</Lbl></div>
          <div style={{ padding: '8px 14px 12px', display: 'flex', flexWrap: 'wrap', gap: '6px 10px' }}>
            {fow.map((w: any, i: number) => (
              <div key={i} style={{ display: 'flex', gap: '4px', alignItems: 'baseline' }}>
                <span style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 700, color: D.rose }}>{w.score ?? 0}</span>
                <span style={{ fontFamily: D.head, fontSize: '9px', color: D.textMuted }}>({fmtOv(w.balls ?? 0)} ov)</span>
                {i < fow.length - 1 && <span style={{ color: D.border }}>·</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Bowling */}
      <div style={{ borderRadius: D.lg, overflow: 'hidden', border: `1px solid ${D.border}`, background: D.surf1 }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${D.border}` }}><Lbl>Bowling</Lbl></div>
        <div style={{ padding: '8px 12px 12px' }}>
          {headerRow(['Bowler', 'O', 'R', 'W', 'Econ'])}
          {bowlers.map((b: any) => {
            const isCurr = b.playerId === bowlerId;
            return (
              <div key={b.playerId} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto',
                gap: '4px 10px', padding: '8px 4px', borderBottom: `1px solid ${D.border}22`, alignItems: 'center',
                background: isCurr ? `${D.sky}06` : 'transparent', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflow: 'hidden', minWidth: 0 }}>
                  {isCurr && <span className="sh-live-dot" style={{ width: '5px', height: '5px', borderRadius: '50%', background: D.sky, boxShadow: `0 0 5px ${D.sky}`, flexShrink: 0 }} />}
                  <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: isCurr ? 700 : 500,
                    color: isCurr ? D.textPrimary : D.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {getPlayerName(allPlayers, b.playerId)}
                  </div>
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right', minWidth: '28px' }}>{b.overs ?? 0}</div>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: D.textMuted, textAlign: 'right', minWidth: '22px' }}>{b.runsConceded ?? 0}</div>
                <div style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 700, color: (b.wickets ?? 0) > 0 ? D.rose : D.textSecondary, textAlign: 'right', minWidth: '18px' }}>{b.wickets ?? 0}</div>
                <div style={{ fontFamily: D.mono, fontSize: '11px', color: (b.economy ?? 0) < 6 ? D.emerald : (b.economy ?? 0) > 10 ? D.rose : D.amber, textAlign: 'right', minWidth: '30px' }}>
                  {b.economy != null ? b.economy.toFixed(2) : Econ(b.runsConceded ?? 0, ((b.overs ?? 0)) * 6)}
                </div>
              </div>
            );
          })}
          {bowlers.length === 0 && <p style={{ color: D.textMuted, fontSize: '12px', textAlign: 'center', padding: '12px 0' }}>No bowling data yet</p>}
        </div>
      </div>
    </div>
  );
}
