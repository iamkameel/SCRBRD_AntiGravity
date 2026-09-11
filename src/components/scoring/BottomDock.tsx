import React from 'react';
import { D } from '@/lib/design-system';

export type ActiveTab = 'score' | 'cards' | 'analysis' | 'history';

export function BottomDock({ active, onChange }: { active: ActiveTab; onChange: (t: ActiveTab) => void }) {
  const tabs: Array<{ id: ActiveTab; label: string; icon: string }> = [
    { id: 'score', label: 'Score', icon: '🏏' },
    { id: 'cards', label: 'Cards', icon: '📋' },
    { id: 'analysis', label: 'Analysis', icon: '📊' },
    { id: 'history', label: 'History', icon: '🕐' }
  ];

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(5,8,15,0.92)', backdropFilter: 'blur(28px) saturate(1.8)', WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
      borderTop: `1px solid ${D.borderMed}`, boxShadow: '0 -16px 64px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.06)',
      display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', paddingBottom: 'max(env(safe-area-inset-bottom), 10px)'
    }}>
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)} className="sh-press" style={{
            border: 'none', background: 'transparent', padding: '10px 4px 6px',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            transition: 'all .2s'
          }}>
            {on ? (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                background: D.grad, borderRadius: D.pill, padding: '6px 20px',
                boxShadow: `0 2px 16px rgba(79,70,229,.4)`, minWidth: '70px'
              }}>
                <span style={{ fontSize: '15px', lineHeight: 1 }}>{t.icon}</span>
                <span style={{
                  fontFamily: D.head, fontSize: '8px', fontWeight: 800, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: '#fff'
                }}>{t.label}</span>
              </div>
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                minWidth: '70px', padding: '6px 20px'
              }}>
                <span style={{ fontSize: '15px', lineHeight: 1, opacity: .4 }}>{t.icon}</span>
                <span style={{
                  fontFamily: D.head, fontSize: '8px', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: D.textMuted
                }}>{t.label}</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
