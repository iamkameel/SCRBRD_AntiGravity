import type { Innings, Rankings } from "@/types/firestore";
import { Zap } from "lucide-react";
import { D } from "@/lib/scoring/theme";

interface ScorecardTableProps {
  innings: Innings;
  teamName: string;
  allPlayers: Array<{ id: string; firstName: string; lastName: string }>;
  playerImpact?: Rankings.PlayerMatchImpact[];
}

export function ScorecardTable({ innings, teamName, allPlayers, playerImpact = [] }: ScorecardTableProps) {
  const getPlayerName = (playerId: string) => {
    const player = allPlayers.find(p => p.id === playerId);
    return player ? `${player.firstName} ${player.lastName}` : 'Unknown';
  };

  const getPlayerImpact = (playerId: string) => {
    return playerImpact.find(pi => pi.personId === playerId);
  };

  const batsmen = innings.batsmen || [];
  const bowlers = innings.bowlers || [];
  const extras = innings.extras || { wides: 0, noballs: 0, byes: 0, legbyes: 0 };
  const totalExtras = (extras.wides || 0) + (extras.noballs || 0) + (extras.byes || 0) + (extras.legbyes || 0);
  const totalRuns = innings.runs || 0;
  const totalWickets = innings.wickets || 0;
  const totalOvers = innings.overs || 0;

  const Lbl = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontFamily: D.head, fontSize: '10px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: D.textMuted }}>{children}</div>
  );

  const HeaderRow = ({ headers }: { headers: string[] }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto auto auto auto auto auto', gap: '16px', padding: '12px 16px', borderBottom: `1px solid ${D.border}`, background: `${D.surf2}44` }}>
      {headers.map((h, i) => (
        <div key={i} style={{ fontFamily: D.head, fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: D.textMuted, textAlign: i === 0 || i === 1 ? 'left' : 'right' }}>{h}</div>
      ))}
    </div>
  );

  const BowlingHeaderRow = ({ headers }: { headers: string[] }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto auto auto', gap: '16px', padding: '12px 16px', borderBottom: `1px solid ${D.border}`, background: `${D.surf2}44` }}>
      {headers.map((h, i) => (
        <div key={i} style={{ fontFamily: D.head, fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: D.textMuted, textAlign: i === 0 ? 'left' : 'right' }}>{h}</div>
      ))}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Batting Card */}
      <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${D.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: `${D.surf2}22` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Lbl>{teamName} Batting</Lbl>
          </div>
          <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 700, color: D.emerald }}>
            {totalRuns}/{totalWickets} <span style={{ color: D.textMuted, fontSize: '11px', fontWeight: 400 }}>({totalOvers} ov)</span>
          </div>
        </div>
        
        <HeaderRow headers={['Batsman', 'Dismissal', 'R', 'B', '4s', '6s', 'SR', 'Imp']} />
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {batsmen.map((batsman, idx) => {
            const impact = getPlayerImpact(batsman.playerId)?.battingImpact;
            return (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto auto auto auto auto auto', gap: '16px', padding: '12px 16px', borderBottom: `1px solid ${D.border}44`, alignItems: 'center' }}>
                <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>{getPlayerName(batsman.playerId)}</div>
                <div style={{ fontFamily: D.body, fontSize: '11px', color: D.textSecondary }}>{batsman.isOut ? (batsman.dismissal || 'out') : <span style={{ color: D.emerald, fontWeight: 700 }}>not out</span>}</div>
                <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 700, textAlign: 'right', color: D.textPrimary, minWidth: '24px' }}>{batsman.runs}</div>
                <div style={{ fontFamily: D.mono, fontSize: '12px', textAlign: 'right', color: D.textSecondary, minWidth: '24px' }}>{batsman.ballsFaced}</div>
                <div style={{ fontFamily: D.mono, fontSize: '12px', textAlign: 'right', color: D.textSecondary, minWidth: '18px' }}>{batsman.fours || 0}</div>
                <div style={{ fontFamily: D.mono, fontSize: '12px', textAlign: 'right', color: (batsman.sixes || 0) > 0 ? D.amber : D.textSecondary, minWidth: '18px' }}>{batsman.sixes || 0}</div>
                <div style={{ fontFamily: D.mono, fontSize: '12px', textAlign: 'right', color: D.textSecondary, minWidth: '40px' }}>{batsman.strikeRate?.toFixed(1) || '0.0'}</div>
                <div style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 700, textAlign: 'right', color: D.amber, minWidth: '32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                  <Zap className="w-2.5 h-2.5" />
                  {impact?.toFixed(1) || '0.0'}
                </div>
              </div>
            );
          })}
          
          {/* Extras and Total */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: '16px', padding: '12px 16px', background: `${D.surf2}44`, alignItems: 'center' }}>
            <div style={{ fontFamily: D.head, fontSize: '12px', fontWeight: 700, color: D.textMuted }}>Extras</div>
            <div style={{ fontFamily: D.body, fontSize: '10px', color: D.textMuted }}>w {extras.wides || 0}, nb {extras.noballs || 0}, b {extras.byes || 0}, lb {extras.legbyes || 0}</div>
            <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 700, textAlign: 'right', color: D.textPrimary, gridColumn: 3 }}>{totalExtras}</div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: '16px', padding: '16px', background: `${D.emerald}11`, borderTop: `1px solid ${D.emerald}33` }}>
            <div style={{ fontFamily: D.head, fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: D.emerald }}>Total</div>
            <div style={{ fontFamily: D.body, fontSize: '12px', fontWeight: 500, color: D.textSecondary }}>{totalOvers} Overs</div>
            <div style={{ fontFamily: D.mono, fontSize: '18px', fontWeight: 800, textAlign: 'right', color: D.emerald }}>{totalRuns}/{totalWickets}</div>
          </div>
        </div>
      </div>

      {/* Bowling Card */}
      <div style={{ background: D.surf1, borderRadius: D.xl, border: `1px solid ${D.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${D.border}`, background: `${D.surf2}22` }}>
          <Lbl>Bowling</Lbl>
        </div>
        
        <BowlingHeaderRow headers={['Bowler', 'O', 'M', 'R', 'W', 'Econ', 'Imp']} />
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {bowlers.map((bowler, idx) => {
            const impact = getPlayerImpact(bowler.playerId)?.bowlingImpact;
            return (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto auto auto', gap: '16px', padding: '12px 16px', borderBottom: `1px solid ${D.border}44`, alignItems: 'center' }}>
                <div style={{ fontFamily: D.head, fontSize: '13px', fontWeight: 700, color: D.textPrimary }}>{getPlayerName(bowler.playerId)}</div>
                <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 700, textAlign: 'right', color: D.textPrimary, minWidth: '24px' }}>{bowler.overs?.toFixed(1) || '0.0'}</div>
                <div style={{ fontFamily: D.mono, fontSize: '12px', textAlign: 'right', color: D.textSecondary, minWidth: '18px' }}>{bowler.maidens || 0}</div>
                <div style={{ fontFamily: D.mono, fontSize: '12px', textAlign: 'right', color: D.textSecondary, minWidth: '24px' }}>{bowler.runsConceded}</div>
                <div style={{ fontFamily: D.mono, fontSize: '14px', fontWeight: 700, textAlign: 'right', color: D.rose, minWidth: '18px' }}>{bowler.wickets || 0}</div>
                <div style={{ fontFamily: D.mono, fontSize: '12px', textAlign: 'right', color: D.textSecondary, minWidth: '40px' }}>{bowler.economy?.toFixed(1) || '0.0'}</div>
                <div style={{ fontFamily: D.mono, fontSize: '12px', fontWeight: 700, textAlign: 'right', color: D.sky, minWidth: '32px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '2px' }}>
                  <Zap className="w-2.5 h-2.5" />
                  {impact?.toFixed(1) || '0.0'}
                </div>
              </div>
            );
          })}
          {bowlers.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', color: D.textMuted, fontFamily: D.body }}>No bowling data available</div>
          )}
        </div>
      </div>
    </div>
  );
}
