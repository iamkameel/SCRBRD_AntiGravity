"use client";

import Link from 'next/link';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { D } from '@/lib/design-system';
import { motion } from 'framer-motion';

interface ManagementCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  badge?: string;
}

export default function ManagementCard({ 
  icon: Icon, 
  title, 
  description, 
  href,
  badge
}: ManagementCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={href} className="block group">
        <div 
          className="relative rounded-3xl p-8 transition-all duration-300 border overflow-hidden shadow-2xl group"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          {/* Hardware Aesthetic Background Detail */}
          <div 
            className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.1] transition-all duration-500 group-hover:scale-125"
            style={{ color: D.indigo }}
          >
            <Icon className="h-24 w-24" />
          </div>
          
          <div className="flex flex-col gap-6 relative z-10">
            <div className="flex justify-between items-start w-full">
              {/* Icon Unit */}
              <div 
                className="flex items-center justify-center w-14 h-14 rounded-2xl shadow-inner border transition-all group-hover:scale-110"
                style={{ background: D.surf2, borderColor: `${D.indigo}30`, color: D.indigo }}
              >
                <Icon className="w-7 h-7" />
              </div>

              {/* Badge */}
              {badge && (
                <span 
                  className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest animate-pulse border shadow-lg"
                  style={{ background: `${D.rose}15`, borderColor: `${D.rose}30`, color: D.rose }}
                >
                  {badge}
                </span>
              )}

              {/* Action Indicator */}
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center border transition-all group-hover:translate-x-1"
                style={{ background: D.surf2, borderColor: D.border, color: D.textMuted }}
              >
                <ChevronRight size={18} className="group-hover:text-indigo-500 transition-colors" />
              </div>
            </div>
   
            {/* Content Unit */}
            <div className="flex-1 min-w-0">
              <h3 
                className="text-lg font-black tracking-tight uppercase italic mb-2 group-hover:text-indigo-500 transition-colors"
                style={{ fontFamily: D.head, color: D.textPrimary }}
              >
                {title}
              </h3>
              <p 
                className="text-[11px] font-bold tracking-widest uppercase leading-snug opacity-40 group-hover:opacity-80 transition-opacity"
                style={{ color: D.textMuted }}
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
