'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Menu,
  X,
  Bell,
  Activity,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Command,
  User,
  ShieldCheck,
} from 'lucide-react';
import { navGroups, dashboardLink } from '@/lib/nav-links';
import CollapsibleNavGroup from './CollapsibleNavGroup';
import { GlobalNotificationCenter } from './GlobalNotificationCenter';
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { state, toggleSidebar, isMobile, openMobile, setOpenMobile } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  const DashboardIcon = dashboardLink.icon;
  const isDashboardActive = pathname === dashboardLink.href;

  const triggerCommandPalette = () => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
    );
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <>
      {/* Mobile Floating Menu Toggle Button */}
      <button
        onClick={() => setOpenMobile(!openMobile)}
        className="lg:hidden fixed top-3 left-4 z-50 p-2.5 rounded-xl border shadow-2xl transition-all active:scale-95 flex items-center justify-center"
        style={{
          background: D.surf1,
          borderColor: D.border,
          color: D.textPrimary,
        }}
        aria-label="Toggle mobile navigation"
      >
        {openMobile ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Strategic Mobile Overlay */}
      <AnimatePresence>
        {isMobile && openMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-30 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setOpenMobile(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Sidebar Command Navigation Rail */}
      <nav
        className={`
          fixed inset-y-0 left-0 z-40 flex flex-col overflow-y-auto overflow-x-hidden
          transition-all duration-300 ease-in-out shadow-2xl border-r select-none
          ${isCollapsed ? 'w-[80px]' : 'w-[260px]'}
          ${openMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: D.surf1,
          borderColor: D.border,
        }}
      >
        {/* --- BRAND HEADER & DESKTOP COLLAPSE TOGGLE --- */}
        <div className="flex items-center justify-between px-4 py-5 shrink-0 border-b border-white/5 gap-2">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="p-2 rounded-xl flex items-center justify-center shrink-0 shadow-inner"
                style={{ background: D.surf2, border: `1px solid ${D.border}` }}
              >
                <Image
                  src="/images/scrbrd-logo.png"
                  alt="SCRBRD"
                  width={100}
                  height={24}
                  priority
                  className="object-contain"
                />
              </div>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/home"
                  className="mx-auto w-10 h-10 rounded-xl flex items-center justify-center shadow-lg font-black text-indigo-400 text-sm tracking-tighter"
                  style={{ background: `${D.indigo}20`, border: `1px solid ${D.indigo}40` }}
                >
                  S
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold">
                SCRBRD OS Command Hub
              </TooltipContent>
            </Tooltip>
          )}

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors shrink-0"
            title={isCollapsed ? 'Expand Navigation (⌘B)' : 'Collapse Navigation (⌘B)'}
          >
            {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        </div>

        {/* --- QUICK ACTION SCORER CTA & SEARCH LAUNCHER --- */}
        <div className="p-3 shrink-0 flex flex-col gap-2 border-b border-white/5">
          {/* Live Scoring Action Button */}
          {!isCollapsed ? (
            <Link
              href="/matches/add"
              onClick={handleLinkClick}
              className="w-full relative group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${D.indigo}, #4f46e5)`,
                color: 'white',
              }}
            >
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-400"></span>
                </span>
                <span className="tracking-wider uppercase font-extrabold text-[10px]" style={{ fontFamily: D.head }}>
                  Live Match Scorer
                </span>
              </div>
              <Sparkles size={14} className="opacity-80 group-hover:scale-125 transition-transform" />
            </Link>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/matches/add"
                  onClick={handleLinkClick}
                  className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-white shadow-lg transition-transform active:scale-90 relative"
                  style={{ background: D.rose }}
                >
                  <Activity size={18} />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold text-xs">
                Launch Live Match Scorer
              </TooltipContent>
            </Tooltip>
          )}

          {/* Quick Search & Command Palette Trigger */}
          {!isCollapsed ? (
            <button
              onClick={triggerCommandPalette}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 bg-black/10 dark:bg-white/5 border border-white/5 text-[11px] font-medium transition-colors"
            >
              <div className="flex items-center gap-2">
                <Search size={14} />
                <span>Quick Search...</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-black/20 text-slate-400 border border-white/10 flex items-center gap-0.5">
                <Command size={10} />K
              </kbd>
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={triggerCommandPalette}
                  className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
                >
                  <Search size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold text-xs">
                Command Palette (⌘K)
              </TooltipContent>
            </Tooltip>
          )}

          {/* Nav Links In-Menu Filter Input (Expanded Mode) */}
          {!isCollapsed && (
            <div className="relative mt-1">
              <input
                type="text"
                placeholder="Filter menu..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-[11px] bg-slate-900/40 text-slate-200 placeholder-slate-500 border border-white/5 focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-[10px]"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* --- GLOBAL NAVIGATION GROUPS MATRIX --- */}
        <div className="flex flex-col gap-1 flex-1 px-3 py-3">
          {/* Main Dashboard Link */}
          {!isCollapsed ? (
            <Link
              href={dashboardLink.href}
              onClick={handleLinkClick}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 font-semibold
                ${isDashboardActive ? 'shadow-sm' : 'hover:bg-black/5 dark:hover:bg-white/5'}
              `}
              style={{
                background: isDashboardActive ? `${D.indigo}20` : 'transparent',
                color: isDashboardActive ? D.indigo : D.textMuted,
                border: isDashboardActive ? `1px solid ${D.indigo}40` : '1px solid transparent',
              }}
            >
              {isDashboardActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                  style={{ background: D.indigo }}
                />
              )}
              <div
                className={`p-1.5 rounded-lg transition-all ${
                  isDashboardActive ? 'shadow-md' : 'opacity-70 group-hover:opacity-100'
                }`}
              >
                {DashboardIcon && <DashboardIcon size={16} style={{ color: isDashboardActive ? D.indigo : 'inherit' }} />}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider" style={{ fontFamily: D.head }}>
                {dashboardLink.label}
              </span>
            </Link>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={dashboardLink.href}
                  onClick={handleLinkClick}
                  className={`
                    w-10 h-10 mx-auto rounded-xl flex items-center justify-center transition-all
                    ${isDashboardActive ? 'bg-indigo-500/20 text-indigo-400 font-bold shadow-md' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}
                  `}
                >
                  {DashboardIcon && <DashboardIcon size={18} />}
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold text-xs">
                {dashboardLink.label}
              </TooltipContent>
            </Tooltip>
          )}

          <div className="h-2" />

          {/* Navigation Groups */}
          <div className="space-y-1">
            {navGroups.map((group) => (
              <CollapsibleNavGroup
                key={group.key}
                group={group}
                isCollapsed={isCollapsed}
                filterQuery={filterQuery}
                onLinkClick={handleLinkClick}
              />
            ))}
          </div>
        </div>

        {/* --- FOOTER & PERSONA TELEMETRY CARD --- */}
        <div className="mt-auto p-3 shrink-0 border-t border-white/5 flex flex-col gap-2">
          {/* Notifications Center Bell Toggle */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-2 py-1.5 rounded-xl bg-black/5 dark:bg-white/5">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold text-xs">
                  {user?.email ? user.email.slice(0, 2).toUpperCase() : 'CO'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-bold text-slate-200 truncate">
                    {user?.displayName || user?.email?.split('@')[0] || 'Head Coach'}
                  </span>
                  <span className="text-[9px] font-semibold text-emerald-400 tracking-wider uppercase flex items-center gap-1">
                    <ShieldCheck size={10} /> Head Coach
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="relative p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={16} />
                <span
                  className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-slate-900 animate-pulse"
                  style={{ background: D.rose }}
                />
              </button>
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setIsNotificationsOpen(true)}
                  className="w-10 h-10 mx-auto rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors relative"
                >
                  <Bell size={18} />
                  <span
                    className="absolute top-2 right-2 w-2 h-2 rounded-full ring-2 ring-slate-900 animate-pulse"
                    style={{ background: D.rose }}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-bold text-xs">
                Notifications Hub
              </TooltipContent>
            </Tooltip>
          )}

          {/* OS Latency Telemetry */}
          {!isCollapsed && (
            <div className="px-2 py-1 flex items-center justify-between text-[9px] font-mono text-slate-400 opacity-75">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SCRBRD OS v2.4
              </span>
              <span>60ms · STABLE</span>
            </div>
          )}
        </div>

        {/* Global Notification Drawer */}
        <GlobalNotificationCenter
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />
      </nav>
    </>
  );
}
