'use client';

/**
 * KPICard — UIX Spec §6.10
 *
 * Coloured left bar + DM Mono value (28px, accent colour) + Syne label + trend.
 *
 * Usage:
 *   <KPICard label="Win Rate" value="74%" sub="Season 2026" color="#10b981" trend={+8} />
 */

import React from 'react';
import { D } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string | React.ReactNode;
  color?: string;
  trend?: number;
  className?: string;
  onClick?: () => void;
}

export function KPICard({ label, value, sub, icon, color = D.indigo, trend, className, onClick }: KPICardProps) {
  return (
    <div
      className={cn(
        'card-hover relative overflow-hidden rounded-[14px] p-4 border',
        onClick && 'cursor-pointer',
        className,
      )}
      style={{
        background: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
        borderLeftColor: color,
        borderLeftWidth: 3,
      }}
      onClick={onClick}
    >
      {/* Icon */}
      {icon && (
        <div className="text-xl mb-2" aria-hidden="true">
          {icon}
        </div>
      )}

      {/* Value — DM Mono, accent colour */}
      <div
        className="text-3xl leading-none font-bold mb-1"
        style={{ fontFamily: D.mono, color }}
      >
        {value}
      </div>

      {/* Label — Syne, uppercase, muted */}
      <div
        className="label-scrbrd mb-1"
        style={{ color: 'hsl(var(--muted-foreground))' }}
      >
        {label}
      </div>

      {/* Sub + trend row */}
      <div className="flex items-center gap-2 flex-wrap">
        {sub && (
          <span
            className="text-[11px]"
            style={{ fontFamily: D.body, color: 'hsl(var(--muted-foreground))' }}
          >
            {sub}
          </span>
        )}
        {trend !== undefined && (
          <span
            className="text-[10px] font-semibold"
            style={{
              fontFamily: D.head,
              color: trend >= 0 ? D.emerald : D.rose,
            }}
          >
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  );
}

export default KPICard;
