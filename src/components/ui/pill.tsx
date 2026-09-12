'use client';

/**
 * Pill — UIX Spec §6.7
 *
 * Inline filter chip. Background: color+15, border: color+28.
 * Interactive when onClick provided — cursor changes to pointer.
 *
 * Usage:
 *   <Pill color="#0ea5e9" onClick={handler} active>T20</Pill>
 *   <Pill color="#6366f1">All</Pill>
 */

import React from 'react';
import { D } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface PillProps {
  color?: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function Pill({ color = D.indigo, active = false, onClick, children, className }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-3 py-0.5 border transition-all duration-150',
        onClick ? 'cursor-pointer' : 'cursor-default',
        className,
      )}
      style={{
        fontFamily: D.body,
        fontSize: 11,
        fontWeight: active ? 600 : 400,
        borderRadius: D.pill,
        background: active ? `${color}18` : 'transparent',
        borderColor: active ? `${color}55` : 'rgba(255,255,255,0.12)',
        color: active ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
      }}
    >
      {children}
    </button>
  );
}

/**
 * PillGroup — convenience wrapper for a set of filter pills
 *
 * Usage:
 *   <PillGroup options={['all','live','upcoming']} value={filter} onValueChange={setFilter} color="#6366f1" />
 */
interface PillGroupProps {
  options: string[];
  value: string;
  onValueChange: (v: string) => void;
  color?: string;
  className?: string;
  formatLabel?: (v: string) => string;
}

export function PillGroup({ options, value, onValueChange, color = D.indigo, className, formatLabel }: PillGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((opt) => (
        <Pill
          key={opt}
          color={color}
          active={value === opt}
          onClick={() => onValueChange(opt)}
        >
          {formatLabel ? formatLabel(opt) : opt.charAt(0).toUpperCase() + opt.slice(1)}
        </Pill>
      ))}
    </div>
  );
}

export default Pill;
