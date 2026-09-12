'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import type { NavGroup } from '@/lib/nav-links';
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CollapsibleNavGroupProps {
  group: NavGroup;
  isCollapsed?: boolean;
  filterQuery?: string;
  onLinkClick?: () => void;
}

export default function CollapsibleNavGroup({
  group,
  isCollapsed = false,
  filterQuery = '',
  onLinkClick,
}: CollapsibleNavGroupProps) {
  const [isOpen, setIsOpen] = useState(group.defaultOpen ?? false);
  const pathname = usePathname();
  const GroupIcon = group.icon;

  const accent = D.indigo;

  // Filter links based on query
  const filteredLinks = group.links.filter((link) =>
    filterQuery
      ? link.label.toLowerCase().includes(filterQuery.toLowerCase()) ||
        group.label.toLowerCase().includes(filterQuery.toLowerCase())
      : true
  );

  const hasActiveLink = group.links.some((link) => pathname === link.href || pathname.startsWith(link.href + '/'));

  useEffect(() => { if (hasActiveLink) setIsOpen(true); }, [hasActiveLink]);

  // Auto-expand group if filter matches and query is not empty
  useEffect(() => {
    if (filterQuery && filteredLinks.length > 0) {
      setIsOpen(true);
    }
  }, [filterQuery, filteredLinks.length]);

  if (filteredLinks.length === 0) {
    return null;
  }

  // --- COLLAPSED MINI-RAIL MODE (80px wide) ---
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label={group.label}
              aria-expanded={isOpen}
              className={`
                w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-sm
                ${hasActiveLink ? 'scale-105 ring-2 ring-offset-1 ring-offset-background' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}
              `}
              style={{
                background: hasActiveLink ? `${accent}20` : 'transparent',
                borderColor: hasActiveLink ? accent : 'transparent',
                color: hasActiveLink ? accent : D.textMuted,
              }}
              onClick={() => setIsOpen(!isOpen)}
            >
              {GroupIcon && <GroupIcon size={18} />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-semibold text-xs py-1.5 px-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: accent }} />
              <span>{group.label}</span>
              <span className="text-[10px] opacity-60">({group.links.length})</span>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Collapsed Sub-links Icons */}
        {isOpen && (
          <div className="flex flex-col items-center gap-1 py-1 w-full border-t border-white/5 my-1">
            {filteredLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              const Icon = link.icon;
              return (
                <Tooltip key={link.key}>
                  <TooltipTrigger asChild>
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={onLinkClick}
                      className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all
                        ${isActive ? 'bg-primary/15 text-primary font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}
                      `}
                    >
                      {Icon && <Icon size={15} />}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs font-medium">
                    {link.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- EXPANDED MODE (260px wide) ---
  return (
    <div className="flex flex-col gap-1 my-0.5">
      {/* Group Header Button */}
      <button
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl
          transition-all duration-200 group/nav text-left select-none
          ${isOpen ? 'bg-black/5 dark:bg-white/5' : 'hover:bg-black/5 dark:hover:bg-white/5'}
        `}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`p-1.5 rounded-lg transition-all ${
              hasActiveLink ? 'shadow-sm' : 'opacity-70 group-hover/nav:opacity-100'
            }`}
            style={{
              background: hasActiveLink ? `${accent}20` : 'transparent',
              color: hasActiveLink ? accent : D.textMuted,
            }}
          >
            {GroupIcon && <GroupIcon size={16} />}
          </div>
          <span
            className="text-[13px] font-medium truncate"
            style={{
              color: hasActiveLink ? accent : D.textMuted,
              fontFamily: D.head,
            }}
          >
            {group.label}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md text-slate-400 dark:text-slate-500 bg-black/5 dark:bg-white/5"
          >
            {filteredLinks.length}
          </span>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="text-slate-400 group-hover/nav:text-slate-200"
          >
            <ChevronDown size={14} />
          </motion.div>
        </div>
      </button>

      {/* Accordion Links */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <ul className="flex flex-col gap-0.5 py-1 pl-4 pr-1 border-l-2 ml-4 border-slate-200/40 dark:border-slate-800/60">
              {filteredLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                const Icon = link.icon;

                return (
                  <li key={link.key}>
                    <Link
                      href={link.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={onLinkClick}
                      className={`
                        relative flex items-center gap-3 px-3 py-2 rounded-xl
                        transition-all duration-200 group/link
                        ${isActive ? 'shadow-sm font-semibold' : 'hover:bg-black/5 dark:hover:bg-white/5'}
                      `}
                      style={{
                        background: isActive ? `${accent}15` : 'transparent',
                        color: isActive ? accent : D.textMuted,
                        border: isActive ? `1px solid ${accent}30` : '1px solid transparent',
                      }}
                    >
                      {isActive && (
                        <div
                          className="absolute -left-[17px] top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full shadow-sm"
                          style={{ background: accent }}
                        />
                      )}

                      {Icon && (
                        <Icon
                          size={14}
                          className={`transition-all shrink-0 ${
                            isActive ? 'scale-110 opacity-100' : 'opacity-65 group-hover/link:opacity-100'
                          }`}
                          style={{ color: isActive ? accent : 'inherit' }}
                        />
                      )}

                      <span className="text-[13px] font-normal truncate">
                        {link.label}
                      </span>

                      {link.badge && (
                        <span
                          className="ml-auto text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse shadow-sm"
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
