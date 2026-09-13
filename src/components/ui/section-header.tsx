'use client';

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
      className={`flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 group ${className}`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="relative shrink-0 mt-1">
           <div 
             className="w-1 h-7 rounded-full transition-all group-hover:scale-y-110 opacity-80"
             style={{ 
               background: color,
               boxShadow: `0 0 10px ${color}30`
             }}
           />
        </div>

        <div className="min-w-0 pt-0.5">
          <div className="flex items-center gap-2.5">
            {icon && <div className="shrink-0">{icon}</div>}
            <h2
              className="text-2xl md:text-3xl font-semibold tracking-tight text-foreground"
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
              className="text-sm font-normal leading-relaxed mt-2"
              style={{
                fontFamily: D.sans,
                color: D.textMuted,
              }}
            >
              {sub}
            </p>
          )}
        </div>
      </div>

      {actions && (
        <div className="shrink-0 flex flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}

export default SectionHeader;
