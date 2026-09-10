import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { D } from '@/lib/scoring/theme';
import { LiveDot } from './primitives';

export function AppTopBar({ matchId, liveScore }: { matchId: string; liveScore: any }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(5,8,15,0.96)', borderBottom: `1px solid ${D.border}`,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link href={`/matches/${matchId}`} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '32px', height: '32px', borderRadius: '50%',
            background: D.surf2, border: `1px solid ${D.border}`,
            color: D.textPrimary, textDecoration: 'none', flexShrink: 0,
          }}>
            <ChevronLeft size={16} />
          </Link>
          {/* SCRBRD Logotype */}
          <div style={{ lineHeight: 1 }}>
            <div style={{
              fontFamily: D.head, fontSize: '17px', fontWeight: 800,
              background: D.grad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>SCRBRD</div>
            <div style={{
              fontFamily: D.head, fontSize: '8px', fontWeight: 700,
              letterSpacing: '0.3em', textTransform: 'uppercase', color: D.textSecondary,
              marginTop: '1px'
            }}>Velocity</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {liveScore?.status === 'live' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', background: `${D.surf2}88`,
              border: `1px solid ${D.border}`, padding: '4px 10px', borderRadius: D.pill,
              fontFamily: D.head, fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: '#f43f5e'
            }}><LiveDot /> LIVE</div>
          )}
          {liveScore?.status === 'innings_break' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', background: `${D.amber}11`,
              border: `1px solid ${D.amber}33`, padding: '4px 10px', borderRadius: D.pill,
              fontFamily: D.head, fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: D.amber
            }}>INNINGS BREAK</div>
          )}
          {liveScore?.status === 'completed' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', background: `${D.emerald}11`,
              border: `1px solid ${D.emerald}33`, padding: '4px 10px', borderRadius: D.pill,
              fontFamily: D.head, fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
              textTransform: 'uppercase', color: D.emerald
            }}>FINAL</div>
          )}
        </div>
      </div>
    </div>
  );
}
