'use client';

/**
 * StatusDot — UIX Spec §6.4
 *
 * Semantic status indicator with optional pulse animation.
 *
 * Usage:
 *   <StatusDot status="live" />       // Pulsing emerald dot
 *   <StatusDot status="upcoming" />   // Sky dot
 *   <StatusDot status="complete" />   // Muted dot
 *   <StatusDot status="scheduled" />  // Amber dot
 */

import React from 'react';
import { D } from '@/lib/design-system';

type StatusType = 'live' | 'upcoming' | 'complete' | 'scheduled' | 'warning' | 'error';

interface StatusDotProps {
  status: StatusType;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<StatusType, { color: string; label: string; pulse: boolean }> = {
  live:      { color: D.emerald, label: 'Live',      pulse: true  },
  upcoming:  { color: D.sky,     label: 'Upcoming',  pulse: false },
  complete:  { color: D.textMuted, label: 'Complete', pulse: false },
  scheduled: { color: D.amber,   label: 'Scheduled', pulse: false },
  warning:   { color: D.amber,   label: 'Warning',   pulse: false },
  error:     { color: D.rose,    label: 'Error',     pulse: true  },
};

export function StatusDot({ status, size = 8, showLabel = false, className = '' }: StatusDotProps) {
  const { color, label, pulse } = STATUS_CONFIG[status] ?? STATUS_CONFIG.upcoming;

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} aria-label={label}>
      {/* Dot with optional pulse */}
      <span className="relative inline-flex" style={{ width: size, height: size }}>
        <span
          className="inline-block rounded-full"
          style={{ width: size, height: size, background: color }}
        />
        {pulse && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-75"
            style={{ background: color }}
            aria-hidden="true"
          />
        )}
      </span>

      {/* Optional label */}
      {showLabel && (
        <span
          className="text-[10px] font-bold uppercase tracking-wider"
          style={{ fontFamily: D.head, color }}
        >
          {label}
        </span>
      )}
    </span>
  );
}

export default StatusDot;
