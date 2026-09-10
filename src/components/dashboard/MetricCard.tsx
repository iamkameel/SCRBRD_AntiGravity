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
      whileHover={onClick ? { scale: 1.02, translateY: -4 } : { scale: 1.01 }}
      className={`relative rounded-3xl overflow-hidden border p-6 transition-all duration-300 group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: D.surf1,
        borderColor: D.border,
        boxShadow: `0 10px 30px -15px ${color}10`,
      }}
      onClick={onClick}
    >
      {/* Strategic Accent Left Bar */}
      <div 
        className="absolute left-0 top-6 bottom-6 w-1 rounded-full opacity-60"
        style={{ background: color }}
      />

      <div className="flex justify-between items-start mb-6">
        {/* Icon Unit */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all group-hover:scale-110"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}30`,
            color: color,
          }}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Sync Indicator */}
        <div 
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: color, boxShadow: `0 0 10px ${color}` }}
        />
      </div>

      <div>
        {/* Value — DM Mono per spec §6.10 */}
        <div
          className="text-3xl font-black italic tracking-tighter mb-1"
          style={{
            fontFamily: D.mono,
            color: D.textPrimary,
          }}
        >
          {value}
        </div>

        {/* Label — Syne uppercase per spec §6.10 */}
        <div
          className="text-[10px] font-black uppercase tracking-[0.2em] mb-1.5"
          style={{ 
            fontFamily: D.head,
            color: D.textMuted,
            opacity: 0.8
          }}
        >
          {label}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p
            className="text-[9px] font-bold uppercase tracking-widest leading-snug"
            style={{
              fontFamily: D.body,
              color: D.textMuted,
              opacity: 0.5,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Background Decorative Element */}
      <div 
        className="absolute -bottom-6 -right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"
        style={{ color }}
      >
        <Icon className="w-24 h-24" />
      </div>
    </motion.div>
  );
}

export default MetricCard;
