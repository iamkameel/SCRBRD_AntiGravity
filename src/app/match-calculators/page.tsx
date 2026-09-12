'use client';

import { useState } from 'react';
import { calculateDlsParScore, getLiveDlsState, DLS_G50_DEFAULT, DLS_T20_DEFAULT } from '@/lib/cricket/dlsEngine';
import { calculateNRR } from '@/lib/competitions/nrrEngine';
import { Shield, Calculator, CloudRain, Zap, Trophy, RefreshCw, BarChart2, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const D = {
  bg: '#07090e',
  surf1: '#0c0f17',
  surf2: '#141923',
  surf3: '#1c2230',
  border: 'rgba(255,255,255,0.07)',
  head: "'Outfit', sans-serif",
  mono: "'JetBrains Mono', monospace",
  sans: "'Inter', sans-serif",
  indigo: '#6366f1',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  sky: '#0284c7',
};

export default function MatchCalculatorsPage() {
  const [activeTab, setActiveTab] = useState<'dls' | 'nrr' | 'target'>('dls');

  // DLS State
  const [matchFormat, setMatchFormat] = useState<number>(50);
  const [team1Runs, setTeam1Runs] = useState<number>(245);
  const [team2Overs, setTeam2Overs] = useState<number>(24.2);
  const [team2Wickets, setTeam2Wickets] = useState<number>(3);
  const [team2Runs, setTeam2Runs] = useState<number>(138);
  const [oversLost1, setOversLost1] = useState<number>(0);
  const [oversLost2, setOversLost2] = useState<number>(5);

  // NRR State
  const [nrrRunsScored, setNrrRunsScored] = useState<number>(1250);
  const [nrrOversFaced, setNrrOversFaced] = useState<number>(250);
  const [nrrRunsConceded, setNrrRunsConceded] = useState<number>(1120);
  const [nrrOversBowled, setNrrOversBowled] = useState<number>(248.4);

  // Calculate live DLS result
  const dlsResult = getLiveDlsState(
    team1Runs,
    team2Runs,
    matchFormat,
    team2Overs,
    team2Wickets,
    oversLost1,
    oversLost2
  );

  // Calculate NRR result
  const nrrResult = calculateNRR(
    nrrRunsScored,
    nrrOversFaced,
    nrrRunsConceded,
    nrrOversBowled
  );

  return (
    <div style={{ minHeight: '100vh', background: D.bg, color: '#f3f5ef', padding: '32px 24px', fontFamily: D.sans }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ padding: '6px', borderRadius: '10px', background: `${D.amber}1a`, border: `1px solid ${D.amber}33`, color: D.amber }}>
                <Calculator size={20} />
              </span>
              <h1 style={{ fontFamily: D.head, fontSize: '24px', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>
                Match Engine Calculators
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: '#8892aa' }}>
              Official Duckworth-Lewis-Stern (DLS) Par Score, Net Run Rate (NRR) & Revised Target Engines
            </p>
          </div>

          <Link href="/matches" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '9999px', background: D.surf2, border: `1px solid ${D.border}`, color: '#fff', fontSize: '12px', fontFamily: D.head, fontWeight: 700, textDecoration: 'none' }}>
            <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Matches
          </Link>
        </div>

        {/* Calculator Tabs */}
        <div style={{ display: 'flex', gap: '8px', padding: '4px', background: D.surf1, borderRadius: '16px', border: `1px solid ${D.border}`, marginBottom: '32px', maxWidth: '420px' }}>
          {[
            { id: 'dls', label: 'DLS Par Score', icon: CloudRain, color: D.amber },
            { id: 'nrr', label: 'Net Run Rate (NRR)', icon: BarChart2, color: D.emerald },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: active ? D.surf3 : 'transparent',
                  color: active ? '#fff' : '#8892aa',
                  fontFamily: D.head,
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: active ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
                }}
              >
                <Icon size={15} style={{ color: active ? tab.color : '#8892aa' }} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === 'dls' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Input Panel */}
            <div style={{ background: D.surf1, borderRadius: '24px', border: `1px solid ${D.border}`, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <CloudRain size={18} style={{ color: D.amber }} />
                <h2 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                  DLS Par Score & Rain Delay Input
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontFamily: D.mono, color: '#8892aa', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                    MATCH FORMAT (TOTAL OVERS)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[50, 40, 35, 20].map(ov => (
                      <button
                        key={ov}
                        onClick={() => setMatchFormat(ov)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: `1px solid ${matchFormat === ov ? D.amber : D.border}`,
                          background: matchFormat === ov ? `${D.amber}1a` : D.surf2,
                          color: matchFormat === ov ? D.amber : '#fff',
                          fontFamily: D.mono,
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {ov} Overs
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontFamily: D.mono, color: '#8892aa', display: 'block', marginBottom: '6px' }}>
                      1ST INNINGS TOTAL RUNS
                    </label>
                    <input
                      type="number"
                      value={team1Runs}
                      onChange={e => setTeam1Runs(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: D.surf2, border: `1px solid ${D.border}`, color: '#fff', fontFamily: D.mono, fontSize: '14px', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontFamily: D.mono, color: '#8892aa', display: 'block', marginBottom: '6px' }}>
                      2ND INNINGS CURRENT RUNS
                    </label>
                    <input
                      type="number"
                      value={team2Runs}
                      onChange={e => setTeam2Runs(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: D.surf2, border: `1px solid ${D.border}`, color: '#fff', fontFamily: D.mono, fontSize: '14px', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontFamily: D.mono, color: '#8892aa', display: 'block', marginBottom: '6px' }}>
                      OVERS BOWLED IN 2ND INN
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={team2Overs}
                      onChange={e => setTeam2Overs(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: D.surf2, border: `1px solid ${D.border}`, color: '#fff', fontFamily: D.mono, fontSize: '14px', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontFamily: D.mono, color: '#8892aa', display: 'block', marginBottom: '6px' }}>
                      WICKETS LOST IN 2ND INN
                    </label>
                    <input
                      type="number"
                      max={9}
                      min={0}
                      value={team2Wickets}
                      onChange={e => setTeam2Wickets(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: D.surf2, border: `1px solid ${D.border}`, color: '#fff', fontFamily: D.mono, fontSize: '14px', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontFamily: D.mono, color: '#8892aa', display: 'block', marginBottom: '6px' }}>
                      OVERS LOST IN 1ST INN
                    </label>
                    <input
                      type="number"
                      value={oversLost1}
                      onChange={e => setOversLost1(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: D.surf2, border: `1px solid ${D.border}`, color: '#fff', fontFamily: D.mono, fontSize: '14px', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontFamily: D.mono, color: '#8892aa', display: 'block', marginBottom: '6px' }}>
                      OVERS LOST IN 2ND INN
                    </label>
                    <input
                      type="number"
                      value={oversLost2}
                      onChange={e => setOversLost2(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: D.surf2, border: `1px solid ${D.border}`, color: '#fff', fontFamily: D.mono, fontSize: '14px', fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live DLS Telemetry Telemetry Display */}
            <div style={{ background: D.surf1, borderRadius: '24px', border: `1px solid ${D.border}`, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Zap size={18} style={{ color: D.amber }} />
                    <h2 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                      DLS Telemetry Output
                    </h2>
                  </div>

                  <span style={{ fontSize: '10px', fontFamily: D.mono, padding: '4px 8px', borderRadius: '9999px', background: `${dlsResult.isParScoreAhead ? D.emerald : D.rose}1a`, border: `1px solid ${dlsResult.isParScoreAhead ? D.emerald : D.rose}33`, color: dlsResult.isParScoreAhead ? D.emerald : D.rose, fontWeight: 700 }}>
                    {dlsResult.isParScoreAhead ? 'AHEAD OF PAR' : 'BEHIND PAR'}
                  </span>
                </div>

                {/* Big Par Display */}
                <div style={{ background: D.surf2, borderRadius: '20px', border: `1px solid ${D.border}`, padding: '24px', textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '11px', fontFamily: D.mono, color: '#8892aa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    PAR SCORE AT {team2Overs} OVERS ({team2Wickets} WKS DOWN)
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '48px', fontWeight: 800, color: dlsResult.isParScoreAhead ? D.emerald : D.amber, lineHeight: 1 }}>
                    {dlsResult.parScore}
                  </div>
                  <div style={{ fontSize: '13px', fontFamily: D.head, fontWeight: 600, color: '#fff', marginTop: '10px' }}>
                    {dlsResult.statusText}
                  </div>
                </div>

                {/* Target & Resources */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: D.surf3, borderRadius: '16px', padding: '16px', border: `1px solid ${D.border}` }}>
                    <div style={{ fontSize: '10px', fontFamily: D.mono, color: '#8892aa', textTransform: 'uppercase' }}>REVISED TARGET</div>
                    <div style={{ fontSize: '24px', fontFamily: D.mono, fontWeight: 800, color: D.amber, marginTop: '4px' }}>
                      {dlsResult.targetRuns}
                    </div>
                    <div style={{ fontSize: '11px', color: '#8892aa', marginTop: '2px' }}>
                      in {dlsResult.revisedOversTeam2} overs
                    </div>
                  </div>

                  <div style={{ background: D.surf3, borderRadius: '16px', padding: '16px', border: `1px solid ${D.border}` }}>
                    <div style={{ fontSize: '10px', fontFamily: D.mono, color: '#8892aa', textTransform: 'uppercase' }}>RESOURCES REMAINING</div>
                    <div style={{ fontSize: '24px', fontFamily: D.mono, fontWeight: 800, color: D.sky, marginTop: '4px' }}>
                      {dlsResult.r2Percentage}%
                    </div>
                    <div style={{ fontSize: '11px', color: '#8892aa', marginTop: '2px' }}>
                      R1: {dlsResult.r1Percentage}%
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '12px 16px', borderRadius: '12px', background: `${D.indigo}1a`, border: `1px solid ${D.indigo}33`, color: D.indigo, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>Standard G50 = {matchFormat <= 20 ? DLS_T20_DEFAULT : DLS_G50_DEFAULT} runs baseline. Rules verified for official school competitions.</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'nrr' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ background: D.surf1, borderRadius: '24px', border: `1px solid ${D.border}`, padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <BarChart2 size={18} style={{ color: D.emerald }} />
                <h2 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                  Net Run Rate (NRR) Inputs
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontFamily: D.mono, color: '#8892aa', display: 'block', marginBottom: '6px' }}>TOTAL RUNS SCORED</label>
                    <input
                      type="number"
                      value={nrrRunsScored}
                      onChange={e => setNrrRunsScored(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: D.surf2, border: `1px solid ${D.border}`, color: '#fff', fontFamily: D.mono, fontSize: '14px', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontFamily: D.mono, color: '#8892aa', display: 'block', marginBottom: '6px' }}>OVERS FACED</label>
                    <input
                      type="number"
                      step="0.1"
                      value={nrrOversFaced}
                      onChange={e => setNrrOversFaced(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: D.surf2, border: `1px solid ${D.border}`, color: '#fff', fontFamily: D.mono, fontSize: '14px', fontWeight: 700 }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontFamily: D.mono, color: '#8892aa', display: 'block', marginBottom: '6px' }}>TOTAL RUNS CONCEDED</label>
                    <input
                      type="number"
                      value={nrrRunsConceded}
                      onChange={e => setNrrRunsConceded(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: D.surf2, border: `1px solid ${D.border}`, color: '#fff', fontFamily: D.mono, fontSize: '14px', fontWeight: 700 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontFamily: D.mono, color: '#8892aa', display: 'block', marginBottom: '6px' }}>OVERS BOWLED</label>
                    <input
                      type="number"
                      step="0.1"
                      value={nrrOversBowled}
                      onChange={e => setNrrOversBowled(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', background: D.surf2, border: `1px solid ${D.border}`, color: '#fff', fontFamily: D.mono, fontSize: '14px', fontWeight: 700 }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: D.surf1, borderRadius: '24px', border: `1px solid ${D.border}`, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <Trophy size={18} style={{ color: D.emerald }} />
                  <h2 style={{ fontFamily: D.head, fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                    Calculated Net Run Rate
                  </h2>
                </div>

                <div style={{ background: D.surf2, borderRadius: '20px', border: `1px solid ${D.border}`, padding: '24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontFamily: D.mono, color: '#8892aa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                    OFFICIAL NET RUN RATE (NRR)
                  </div>
                  <div style={{ fontFamily: D.mono, fontSize: '48px', fontWeight: 800, color: nrrResult >= 0 ? D.emerald : D.rose, lineHeight: 1 }}>
                    {nrrResult >= 0 ? `+${nrrResult.toFixed(3)}` : nrrResult.toFixed(3)}
                  </div>
                </div>
              </div>

              <div style={{ padding: '12px 16px', borderRadius: '12px', background: `${D.emerald}1a`, border: `1px solid ${D.emerald}33`, color: D.emerald, fontSize: '12px' }}>
                Formula: (Runs Scored / Overs Faced) - (Runs Conceded / Overs Bowled). All-out innings use full over allocation.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
