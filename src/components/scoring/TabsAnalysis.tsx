import React, { useState } from 'react';
import { Person } from '@/types/firestore';
import { D } from '@/lib/scoring/theme';
import { Lbl, Badge } from './primitives';
import { getPlayerName } from './utils';
import { buildSignals } from '@/lib/scoring/intelUtils';
import { WagonWheelField } from './WagonWheelField';
import { IntelPanel, SignalBar } from './IntelPanel';
import { PitchMap } from '@/components/charts/PitchMap';

export type AnalysisSubTab = 'charts' | 'players' | 'signals' | 'intel';

function ManhattanChart({ liveScore }: { liveScore: any }) {
  const ovs: any[] = (liveScore?.overSummaries || liveScore?.overHistory || []);
  if (!ovs.length) return <p style={{ color: D.textMuted, fontSize: '12px', textAlign: 'center', padding: '16px' }}>No over data yet</p>;
  const maxR = Math.max(...ovs.map((o: any) => o.runs ?? o.totalRuns ?? 0), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '80px', padding: '0 4px' }}>
      {ovs.map((o: any, i: number) => {
        const r = o.runs ?? o.totalRuns ?? 0;
        const wk = (o.wickets ?? o.totalWickets ?? 0) > 0;
        const h = Math.max(4, Math.round((r / maxR) * 72));
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
            {wk && <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: D.rose }} />
            </div>}
            <div style={{ width: '100%', borderRadius: '3px 3px 2px 2px', height: `${h}px`, background: wk ? D.rose : r >= 12 ? D.amber : r >= 8 ? D.emerald : D.sky,
              minHeight: '4px', transition: 'height .3s ease' }} />
            {i % 5 === 0 && <span style={{ fontFamily: D.mono, fontSize: '7px', color: D.textMuted }}>{i + 1}</span>}
          </div>
        );
      })}
    </div>
  );
}

export function TabsAnalysis({ liveScore, allPlayers, overs, target, isChase }: {
  liveScore: any; allPlayers: Person[]; overs: number; target?: number; isChase: boolean;
}) {
  const [subTab, setSubTab] = useState<AnalysisSubTab>('charts');
  const [wagonView, setWagonView] = useState<'wagon' | 'heatmap'>('wagon');
  const [wagonCoords, setWagonCoords] = useState<{ angle: number; distance: number } | null>(null);
  const [hiddenLines, setHiddenLines] = useState<Set<string>>(new Set());
  
  const onToggleLine = (k: string) => {
    setHiddenLines(prev => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });
  };
  
  const wagonBallLog = liveScore?.innings1?.overs?.flatMap((o: any) => o.balls) || [];

  const TABS: Array<{ id: AnalysisSubTab; label: string }> = [
    { id: 'charts', label: 'Charts' }, { id: 'players', label: 'Players' }, { id: 'signals', label: 'Signals' }, { id: 'intel', label: 'Intel' }
  ];
  const sig = buildSignals(liveScore, overs, target, isChase);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Subtab navigation */}
      <div style={{ display: 'flex', gap: '4px', background: D.surf2, borderRadius: D.pill, padding: '4px', overflow: 'auto' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} className="sh-press" style={{
            flex: '0 0 auto', padding: '7px 16px', borderRadius: D.pill, border: 'none', cursor: 'pointer',
            background: subTab === t.id ? D.grad : 'transparent', fontFamily: D.head,
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: subTab === t.id ? '#fff' : D.textMuted, transition: 'all .2s', whiteSpace: 'nowrap',
          }}>{t.label}</button>
        ))}
      </div>

      {subTab === 'charts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ borderRadius: D.lg, border: `1px solid ${D.border}`, background: D.surf1, padding: '14px 16px' }}>
            <Lbl>Run Rate Per Over (Manhattan)</Lbl>
            <div style={{ height: '12px' }} />
            <ManhattanChart liveScore={liveScore} />
          </div>
          <div style={{ borderRadius: D.lg, border: `1px solid ${D.border}`, background: D.surf1, padding: '14px 16px' }}>
            <Lbl>Shot Distribution</Lbl>
            <div style={{ height: '12px' }} />
            <WagonWheelField ballLog={wagonBallLog} shotCoords={wagonCoords} onAim={setWagonCoords}
              viewMode={wagonView} onViewMode={setWagonView} hiddenLines={hiddenLines} onToggleLine={onToggleLine} />
          </div>
          <div style={{ borderRadius: D.lg, border: `1px solid ${D.border}`, background: D.surf1, padding: '14px 16px', overflow: 'hidden' }}>
            <Lbl>Pitch Map Analysis</Lbl>
            <div style={{ height: '12px' }} />
            <div className="dark">
              <PitchMap deliveries={wagonBallLog.map((b: any) => ({
                length: b?.length || 'Good',
                line: b?.line || 'Off Stump',
                runs: b.runsOffBat || 0,
                isWicket: !!b.wicket
              }))} />
            </div>
          </div>
        </div>
      )}

      {subTab === 'players' && (
        <div>
          {/* Batting leaders */}
          <div style={{ borderRadius: D.lg, border: `1px solid ${D.border}`, background: D.surf1, padding: '14px 16px', marginBottom: '12px' }}>
            <Lbl>Top Scorers</Lbl>
            <div style={{ height: '10px' }} />
            {[...(liveScore?.batsmen || [])].sort((a: any, b: any) => (b.runs ?? 0) - (a.runs ?? 0)).slice(0, 5).map((b: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '20px', fontFamily: D.mono, fontSize: '12px', color: D.textMuted, flexShrink: 0, textAlign: 'center' }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 600, color: D.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getPlayerName(allPlayers, b.playerId)}</div>
                  <div style={{ height: '3px', background: D.surf3, borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', background: D.grad, width: `${Math.min(100, (b.runs ?? 0) / Math.max(...(liveScore?.batsmen || [{ runs: 1 }]).map((x: any) => x.runs ?? 0), 1) * 100)}%` }} />
                  </div>
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 700, color: D.textPrimary, flexShrink: 0 }}>{b.runs ?? 0}</div>
                <div style={{ fontFamily: D.mono, fontSize: '10px', color: D.textMuted, flexShrink: 0 }}>({b.ballsFaced ?? 0})</div>
              </div>
            ))}
            {!liveScore?.batsmen?.length && <p style={{ color: D.textMuted, fontSize: '12px', textAlign: 'center', padding: '10px 0' }}>No batting data</p>}
          </div>
          {/* Bowling leaders */}
          <div style={{ borderRadius: D.lg, border: `1px solid ${D.border}`, background: D.surf1, padding: '14px 16px' }}>
            <Lbl>Top Wicket Takers</Lbl>
            <div style={{ height: '10px' }} />
            {[...(liveScore?.bowlers || [])].sort((a: any, b: any) => (b.wickets ?? 0) - (a.wickets ?? 0) || (a.runsConceded ?? 999) - (b.runsConceded ?? 999)).slice(0, 5).map((b: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ width: '20px', fontFamily: D.mono, fontSize: '12px', color: D.textMuted, flexShrink: 0, textAlign: 'center' }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 600, color: D.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getPlayerName(allPlayers, b.playerId)}</div>
                  <div style={{ fontFamily: D.mono, fontSize: '9px', color: D.textMuted, marginTop: '2px' }}>{b.overs ?? 0} ov · {b.runsConceded ?? 0}r · econ {b.economy?.toFixed(2) ?? '—'}</div>
                </div>
                <div style={{ fontFamily: D.mono, fontSize: '13px', fontWeight: 700, color: b.wickets > 0 ? D.rose : D.textMuted, flexShrink: 0 }}>{b.wickets ?? 0}W</div>
              </div>
            ))}
            {!liveScore?.bowlers?.length && <p style={{ color: D.textMuted, fontSize: '12px', textAlign: 'center', padding: '10px 0' }}>No bowling data</p>}
          </div>
        </div>
      )}

      {subTab === 'signals' && sig && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ borderRadius: D.lg, border: `1px solid ${D.border}`, background: D.surf1, padding: '16px' }}>
            <Lbl>Signal Dashboard</Lbl>
            <div style={{ height: '14px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <SignalBar label="Pressure" value={`${sig.pressure}%`} pct={sig.pressure} color={sig.pressureColor} />
              <SignalBar label="Momentum" value={sig.momLabel} pct={50 + sig.mom / 2} color={sig.momColor} />
              {sig.reqRr != null && <SignalBar label="Required RR" value={sig.reqRr.toFixed(2)} pct={Math.min(100, sig.reqRr / 18 * 100)} color={sig.rrDelta !== null && sig.rrDelta < 0 ? D.rose : D.emerald} />}
              <SignalBar label="Run Rate" value={sig.rr.toFixed(2)} pct={Math.min(100, sig.rr / 18 * 100)} color={D.sky} />
              <SignalBar label="Dot Ball %" value={`${sig.dotsL6}/6 last 6`} pct={sig.dotsL6 / 6 * 100} color={sig.dotsL6 >= 4 ? D.rose : sig.dotsL6 >= 2 ? D.amber : D.emerald} />
              <SignalBar label="Boundary Rate" value={`${sig.bndsL6}/6 last 6`} pct={sig.bndsL6 / 6 * 100} color={D.indigo} />
            </div>
          </div>
          {sig.flags.length > 0 && (
            <div style={{ borderRadius: D.lg, border: `1px solid ${D.orange}30`, background: `${D.orange}08`, padding: '14px 16px' }}>
              <Lbl color={D.orange}>Active Signals</Lbl>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                {sig.flags.map((f: string) => <Badge key={f} color={D.orange}>{f.replace(/_/g, ' ')}</Badge>)}
              </div>
            </div>
          )}
          <div style={{ borderRadius: D.lg, border: `1px solid ${D.border}`, background: D.surf1, padding: '14px 16px' }}>
            <Lbl>Phase Stats</Lbl>
            <div style={{ height: '10px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              {[
                { l: 'Phase', v: sig.phase }, { l: 'Dots/12', v: sig.dotsL12 }, { l: 'Bnds/12', v: sig.bndsL12 },
                { l: 'Last 6', v: `${sig.runsL6}r` }, { l: 'Wkts/12', v: sig.wktsL12 }, { l: 'Projected', v: sig.projected ?? '—' },
              ].map(item => (
                <div key={item.l} style={{ textAlign: 'center', background: D.surf2, borderRadius: D.md, padding: '8px' }}>
                  <div style={{ fontFamily: D.mono, fontSize: '15px', fontWeight: 500, color: D.textPrimary, lineHeight: 1 }}>{item.v}</div>
                  <div style={{ fontFamily: D.head, fontSize: '7px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: D.textMuted, marginTop: '4px' }}>{item.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {subTab === 'intel' && (
        <IntelPanel liveScore={liveScore} overs={overs} target={target} isChase={isChase} />
      )}
    </div>
  );
}
