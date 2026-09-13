'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Activity, Bell, CircleHelp, PanelLeftClose, PanelLeftOpen, Search, X, Zap } from 'lucide-react';
import { navGroups, dashboardLink } from '@/lib/nav-links';
import CollapsibleNavGroup from './CollapsibleNavGroup';
import { GlobalNotificationCenter } from './GlobalNotificationCenter';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/lib/auth/usePermissions';
import { navKeyToModuleMap } from '@/lib/nav-permissions';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const { canAccess } = usePermissions();
  const visibleGroups = navGroups.map(group => ({...group, links: group.links.filter(link => { const rbacModule = navKeyToModuleMap[link.key]; return rbacModule ? canAccess(rbacModule) : false; })})).filter(group => group.links.length > 0);
  const { user, userRole } = useAuth();
  const { state, toggleSidebar, isMobile, openMobile, setOpenMobile } = useSidebar();
  const collapsed = !isMobile && state === 'collapsed';
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');
  const DashboardIcon = dashboardLink.icon;
  const close = () => setOpenMobile(false);

  useEffect(() => {
    if (!openMobile || !isMobile) return;
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(navRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])') ?? []).filter(element => element.offsetParent !== null);
    focusable()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMobile(false);
      if (event.key !== 'Tab') return;
      const nodes = focusable();
      const first = nodes[0], last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => { document.removeEventListener('keydown', onKeyDown); document.body.style.overflow = previousOverflow; previous?.focus(); };
  }, [openMobile, isMobile, setOpenMobile]);

  return (
    <>
      {openMobile && <button aria-label="Close navigation" onClick={close} className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm md:hidden" />}
      <nav ref={navRef} aria-label="Main navigation" inert={isMobile && !openMobile ? true : undefined} className={cn('fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-[width,transform] duration-200', collapsed ? 'w-20' : 'w-[260px]', openMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0')}>
        <div className="flex h-20 shrink-0 items-center justify-between gap-2 px-4 border-b border-border/40">
          <Link href="/home" onClick={close} aria-label="SCRBRD dashboard" className="flex items-center gap-2">
            {collapsed ? (
              <Image
                src="/images/scrbrd-logo.png"
                alt="SCRBRD Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain shrink-0"
                priority
              />
            ) : (
              <Image
                src="/images/scrbrd-logo.png"
                alt="SCRBRD Logo"
                width={160}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            )}
          </Link>
          {!collapsed && (
            <button onClick={isMobile ? close : toggleSidebar} aria-label={isMobile ? 'Close navigation' : 'Collapse navigation'} className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary">
              {isMobile ? <X size={18}/> : <PanelLeftClose size={16}/>}
            </button>
          )}
        </div>
        {collapsed && <button onClick={toggleSidebar} aria-label="Expand navigation" className="mx-auto mb-4 mt-2 rounded-xl p-2 text-muted-foreground hover:bg-secondary"><PanelLeftOpen size={18}/></button>}
        {canAccess("scoring") && <div className="px-4 pt-3 pb-4">
          <Link href="/scoring-hub" onClick={close} title="Live scoring" className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-2 text-sm font-semibold text-primary-foreground hover:opacity-90"><Activity size={18}/>{!collapsed && 'Live scoring'}</Link>
        </div>}
        {!collapsed && <div className="relative mx-4 mb-3">
          <Search size={15} className="absolute left-3 top-3.5 text-muted-foreground"/>
          <input aria-label="Filter navigation" value={filterQuery} onChange={e => setFilterQuery(e.target.value)} placeholder="Find a workspace…" className="h-11 w-full rounded-xl border border-border bg-secondary/50 pl-9 pr-8 text-sm placeholder:text-muted-foreground"/>
          {filterQuery && <button onClick={() => setFilterQuery('')} aria-label="Clear navigation filter" className="absolute right-2 top-3 text-muted-foreground"><X size={16}/></button>}
        </div>}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
          <Link href={dashboardLink.href} onClick={close} aria-current={pathname === dashboardLink.href ? 'page' : undefined} title="Dashboard" className={cn('mb-4 flex min-h-12 items-center gap-3 rounded-xl px-3.5 text-sm font-medium', collapsed && 'justify-center px-0', pathname === dashboardLink.href ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-secondary')}>
            {DashboardIcon && <DashboardIcon size={19}/>} {!collapsed && 'Dashboard'}
          </Link>
          {!collapsed && <p className="px-3.5 pb-2 text-[10px] font-semibold uppercase tracking-[.18em] text-muted-foreground">Workspace</p>}
          {visibleGroups.map(group => <CollapsibleNavGroup key={group.key} group={group} isCollapsed={collapsed} filterQuery={filterQuery} onLinkClick={close}/>)}
          {filterQuery && !visibleGroups.some(group => group.label.toLowerCase().includes(filterQuery.toLowerCase()) || group.links.some(link => link.label.toLowerCase().includes(filterQuery.toLowerCase()))) && <p role="status" className="p-4 text-sm text-muted-foreground">No workspaces found. Try a different name.</p>}
        </div>
        <div className="shrink-0 space-y-3 border-t border-border p-4">
          <Link href="/help" onClick={close} title="Help & support" className="flex items-center gap-3 rounded-xl p-2 text-sm text-muted-foreground hover:bg-secondary"><CircleHelp size={18}/>{!collapsed && 'Help & support'}</Link>
          <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-2">
            {!collapsed && <><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 font-semibold text-primary">{(user?.displayName || user?.email || 'G').slice(0,1).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{user?.displayName || user?.email?.split('@')[0] || 'Guest'}</p><p className="truncate text-xs text-muted-foreground">{user ? userRole || 'Member' : 'Explore SCRBRD'}</p></div></>}
            <button onClick={() => setNotificationsOpen(true)} aria-label="Open notifications" className="rounded-lg p-2 text-muted-foreground hover:bg-secondary"><Bell size={18}/></button>
          </div>
        </div>
      </nav>
      <GlobalNotificationCenter isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)}/>
    </>
  );
}
