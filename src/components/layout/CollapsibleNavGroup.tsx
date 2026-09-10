'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import type { NavGroup } from '@/lib/nav-links';
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapsibleNavGroupProps {
  group: NavGroup;
}

export default function CollapsibleNavGroup({ group }: CollapsibleNavGroupProps) {
  const [isOpen, setIsOpen] = useState(group.defaultOpen ?? false);
  const pathname = usePathname();
  const GroupIcon = group.icon;

  const hasActiveLink = group.links.some(link => pathname === link.href);

  return (
    <div className="flex flex-col gap-1">
      {/* Strategic Group Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl
          transition-all duration-300 group/nav
          ${isOpen ? 'bg-black/5 dark:bg-white/5' : 'hover:bg-black/5 dark:hover:bg-white/5'}
          ${hasActiveLink ? 'text-indigo-500' : ''}
        `}
        style={{
          color: hasActiveLink ? D.indigo : D.textMuted,
        }}
      >
        <div className="flex items-center gap-3.5">
          <div className={`p-1.5 rounded-lg transition-all ${hasActiveLink ? "bg-indigo-500/10 shadow-sm" : "group-hover/nav:bg-black/5 opacity-50"}`}>
            {GroupIcon && <GroupIcon size={16} style={{ color: hasActiveLink ? D.indigo : 'inherit' }} />}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ fontFamily: D.head }}>
             {group.label}
          </span>
        </div>
        <motion.div
           animate={{ rotate: isOpen ? 180 : 0 }}
           transition={{ duration: 0.3, ease: "anticipate" }}
           className="opacity-40"
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      {/* Group Links Matrix */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "anticipate" }}
            className="overflow-hidden"
          >
            <ul className="flex flex-col gap-1 py-1 pl-6 pr-2">
              {group.links.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                
                return (
                  <li key={link.key}>
                    <Link 
                      href={link.href}
                      className={`
                        relative flex items-center gap-3.5 px-4 py-2.5 rounded-xl
                        transition-all duration-300 group/link
                        ${isActive 
                          ? 'shadow-[0_4px_12px_rgba(0,0,0,0.1)]' 
                          : 'hover:bg-black/5 dark:hover:bg-white/5'}
                      `}
                      style={{
                        background: isActive ? D.surf2 : 'transparent',
                        color: isActive ? D.indigo : D.textMuted,
                        border: isActive ? `1px solid ${D.border}` : '1px solid transparent'
                      }}
                    >
                      {isActive && (
                         <div 
                           className="absolute left-1.5 w-1 h-3 rounded-full shadow-sm" 
                           style={{ background: D.gradMain }}
                         />
                      )}
                      
                      {Icon && (
                        <Icon 
                          size={13} 
                          className={`transition-all duration-300 ${isActive ? "opacity-100 scale-110" : "opacity-30 group-hover/link:opacity-60"}`}
                        />
                      )}
                      
                      <span className={`text-[10px] uppercase tracking-widest leading-none ${isActive ? 'font-bold' : 'font-medium opacity-70'}`}>
                        {link.label}
                      </span>
                      
                      {link.badge && (
                        <span 
                           className="ml-auto text-[8px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tighter shadow-sm animate-pulse"
                           style={{ background: D.rose, color: 'white' }}
                        >
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
