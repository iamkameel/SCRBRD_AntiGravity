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
          className="relative rounded-2xl p-6 transition-all duration-300 border overflow-hidden shadow-lg group hover:border-indigo-500/30"
          style={{ background: D.surf1, borderColor: D.border }}
        >
          {/* Hardware Aesthetic Background Detail */}
          <div 
            className="absolute top-0 right-0 p-5 opacity-[0.02] group-hover:opacity-[0.06] transition-all duration-500 group-hover:scale-110 pointer-events-none"
            style={{ color: D.indigo }}
          >
            <Icon className="h-20 w-20" />
          </div>
          
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex justify-between items-center w-full">
              {/* Icon Unit */}
              <div 
                className="flex items-center justify-center w-11 h-11 rounded-xl shadow-inner border transition-all group-hover:scale-105"
                style={{ background: D.surf2, borderColor: `${D.indigo}30`, color: D.indigo }}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex items-center gap-3">
                {/* Badge */}
                {badge && (
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border"
                    style={{ background: `${D.rose}15`, borderColor: `${D.rose}30`, color: D.rose }}
                  >
                    {badge}
                  </span>
                )}

                {/* Action Indicator */}
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center border transition-all group-hover:translate-x-1"
                  style={{ background: D.surf2, borderColor: D.border, color: D.textMuted }}
                >
                  <ChevronRight size={16} className="group-hover:text-indigo-400 transition-colors" />
                </div>
              </div>
            </div>
   
            {/* Content Unit */}
            <div className="flex-1 min-w-0">
              <h3 
                className="text-base font-semibold tracking-tight text-white mb-1 group-hover:text-indigo-400 transition-colors"
                style={{ fontFamily: D.head }}
              >
                {title}
              </h3>
              <p 
                className="text-xs font-normal text-slate-400 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity"
                style={{ fontFamily: D.sans }}
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
