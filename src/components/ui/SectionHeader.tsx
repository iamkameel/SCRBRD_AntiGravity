'use client';

/**
 * SectionHeader — UIX Spec §6.9
 *
 * Fully migrated to D design tokens. High-performance section header
 * with semantic left accent and strategic typography.
 */

import React from 'react';
import { D } from '@/lib/design-system';

interface SectionHeaderProps {
  title: string;
  sub?: string;
  icon?: React.ReactNode;
  color?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function SectionHeader({ title, sub, icon, color = D.indigo, actions, className = '' }: SectionHeaderProps) {
  return (
    <div
      className={`flex items-start justify-between gap-6 mb-8 group ${className}`}
      style={{ fontFamily: D.head }}
    >
      {/* Strategic Left Accent Unit */}
      <div className="flex items-start gap-4 min-w-0">
        <div className="relative shrink-0 mt-1.5">
           <div 
             className="w-1.5 h-10 rounded-full transition-all group-hover:scale-y-110"
             style={{ 
               background: color,
               boxShadow: `0 0 15px ${color}30`
             }}
           />
           <div 
             className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-background"
             style={{ background: color }}
           />
        </div>

        <div className="min-w-0 pt-0.5">
          <div className="flex items-center gap-3">
            {icon && <div className="shrink-0">{icon}</div>}
            <h2
              className="text-2xl font-black italic tracking-tighter uppercase leading-none truncate"
              style={{
                fontFamily: D.head,
                color: D.textPrimary,
              }}
            >
              {title}
            </h2>
          </div>
          {sub && (
            <p
              className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-50 truncate"
              style={{
                fontFamily: D.body,
                color: D.textMuted,
              }}
            >
              {sub}
            </p>
          )}
        </div>
      </div>

      {/* Strategic Action Hub */}
      {actions && (
        <div className="shrink-0 flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

export default SectionHeader;
