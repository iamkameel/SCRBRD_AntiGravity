'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Bell, Zap, Activity } from 'lucide-react';
import { navGroups, dashboardLink } from '@/lib/nav-links';
import CollapsibleNavGroup from './CollapsibleNavGroup';
import { GlobalNotificationCenter } from './GlobalNotificationCenter';
import { D } from '@/lib/design-system';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const DashboardIcon = dashboardLink.icon;
  const isActive = pathname === dashboardLink.href;

  return (
    <>
      {/* Mobile Menu Button — UIX Spec §12.3 */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-3 left-6 z-50 p-2.5 rounded-xl border shadow-2xl transition-all active:scale-95"
        style={{
          background: D.surf1,
          borderColor: D.border,
          color: D.textPrimary,
        }}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Strategic Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-30 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.6)' }}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — UIX Spec §8.2 — The Command Column */}
      <nav
        className={`
          fixed h-screen z-40 flex flex-col overflow-y-auto overflow-x-hidden
          transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          w-[260px] shadow-[20px_0_50px_rgba(0,0,0,0.1)]
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: D.surf1,
          borderRight: `1px solid ${D.border}`,
          padding: '32px 0',
        }}
      >
        {/* Brand Identity & Alerts Hub */}
        <div className="flex items-center justify-between px-6 mb-12 shrink-0">
          <div className="flex-1">
             <div 
               className="p-1.5 rounded-xl inline-block shadow-inner"
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}
             >
                <Image
                  src="/images/scrbrd-logo.png"
                  alt="SCRBRD"
                  width={110}
                  height={28}
                  priority
                  style={{ objectFit: 'contain' }}
                />
             </div>
          </div>
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 group shadow-lg"
            style={{
              width: 40,
              height: 40,
              background: D.surf2,
              border: `1px solid ${D.border}`,
              color: D.textMuted,
            }}
            aria-label="Notifications"
          >
            <Bell size={18} className="group-hover:text-indigo-500 transition-colors" />
            <span
              className="absolute top-2.5 right-2.5 rounded-full ring-2 ring-background animate-pulse"
              style={{ width: 7, height: 7, background: D.rose }}
              aria-hidden="true"
            />
          </button>
        </div>

        <GlobalNotificationCenter
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
        />

        {/* Global Navigation Matrix */}
        <div className="flex flex-col gap-1.5 flex-1 px-4">
          <div className="px-4 mb-3">
             <span className="text-[10px] font-semibold uppercase tracking-[0.25em] opacity-40" style={{ color: D.textMuted }}>Command Center</span>
          </div>

          <Link
            href={dashboardLink.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className="group relative flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-300"
            style={{
              background: isActive ? `${D.indigo}10` : 'transparent',
              color: isActive ? D.indigo : D.textMuted,
            }}
          >
            {isActive && (
              <motion.div 
                layoutId="sidebar-active"
                className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-full shadow-[0_0_10px_rgba(var(--indigo-rgb),0.5)]"
                style={{ background: D.indigo }}
              />
            )}
            <div className={`p-2 rounded-lg transition-all ${isActive ? 'shadow-lg bg-indigo-500/10' : 'group-hover:bg-black/5'}`}>
               {DashboardIcon && <DashboardIcon size={18} />}
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ fontFamily: D.head }}>
               {dashboardLink.label}
            </span>
          </Link>

          <div className="h-4" />

          <div onClick={() => setIsMobileMenuOpen(false)} className="space-y-1">
            {navGroups.map((group) => (
              <CollapsibleNavGroup key={group.key} group={group} />
            ))}
          </div>
        </div>

        {/* OS Core Status Hub — bottom (UIX Spec §8.2) */}
        <div className="mt-auto px-6 pb-2 shrink-0">
          <div
            className="p-4 rounded-2xl flex flex-col gap-3 shadow-2xl border"
            style={{
              background: D.surf2,
              borderColor: D.border,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: D.emerald }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: D.emerald }}></span>
                </div>
                <span
                  className="text-[9px] font-black uppercase tracking-[0.2em] italic"
                  style={{ color: D.textPrimary }}
                >
                  SCRBRD OS <span className="opacity-40 font-bold ml-1">v2.4</span>
                </span>
              </div>
              <div 
                className="px-2 py-0.5 rounded-md text-[8px] font-black tracking-widest border border-white/5 shadow-inner"
                style={{ background: `${D.emerald}10`, color: D.emerald }}
              >
                STABLE
              </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: D.surf3 }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-full" 
                      style={{ background: `linear-gradient(90deg, ${D.indigo}, ${D.emerald})` }} 
                    />
                </div>
                <span className="text-[8px] font-black uppercase tracking-tighter opacity-40 shrink-0" style={{ color: D.textMuted, fontFamily: D.mono }}>
                    60ms LATENCY
                </span>
            </div>

            <div className="flex items-center gap-2 opacity-20 pt-1">
              <div className="h-px flex-1" style={{ background: D.border }} />
              <Activity size={10} style={{ color: D.textMuted }} />
              <div className="h-px flex-1" style={{ background: D.border }} />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
