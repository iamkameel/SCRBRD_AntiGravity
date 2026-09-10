'use client';

/**
 * MetricCard — UIX Spec §6.10
 *
 * Fully migrated to D design tokens. High-performance bento grid component
 * with semantic accents, DM Mono values, and Syne labels.
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { D } from '@/lib/design-system';
import { motion } from "framer-motion";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  subtitle?: string;
  color?: string;
  className?: string;
  onClick?: () => void;
}

export function MetricCard({ 
  icon: Icon, 
  label, 
  value, 
  subtitle, 
  color = D.indigo, 
  className = '', 
  onClick 
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={onClick ? { scale: 1.02, translateY: -2 } : { scale: 1.01 }}
      className={`relative rounded-2xl overflow-hidden border p-5 transition-all duration-300 group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: D.surf1,
        borderColor: D.border,
        boxShadow: `0 4px 20px -10px ${color}15`,
      }}
      onClick={onClick}
    >
      {/* Strategic Accent Left Bar */}
      <div 
        className="absolute left-0 top-4 bottom-4 w-1 rounded-full opacity-60"
        style={{ background: color }}
      />

      <div className="flex justify-between items-start mb-4">
        {/* Icon Unit */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}25`,
            color: color,
          }}
        >
          <Icon className="w-4 h-4" />
        </div>

        {/* Sync Indicator */}
        <div 
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: color, boxShadow: `0 0 8px ${color}` }}
        />
      </div>

      <div>
        {/* Value — DM Mono per spec §6.10 */}
        <div
          className="text-2xl font-bold tracking-tight mb-1"
          style={{
            fontFamily: D.mono,
            color: D.textPrimary,
          }}
        >
          {value}
        </div>

        {/* Label — Open Sans per refined visual hierarchy */}
        <div
          className="text-xs font-semibold tracking-normal mb-0.5 text-slate-200"
          style={{ 
            fontFamily: D.sans,
          }}
        >
          {label}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p
            className="text-[11px] font-normal tracking-normal leading-snug opacity-60"
            style={{
              fontFamily: D.sans,
              color: D.textMuted,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Background Decorative Element */}
      <div 
        className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none"
        style={{ color }}
      >
        <Icon className="w-20 h-20" />
      </div>
    </motion.div>
  );
}

export default MetricCard;
