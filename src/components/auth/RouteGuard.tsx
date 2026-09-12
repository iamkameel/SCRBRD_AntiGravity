'use client';

import { useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldOff } from 'lucide-react';
import { usePermissions } from '@/lib/auth/usePermissions';
import { MODULES, type Module } from '@/lib/auth/rbac';

interface RouteGuardProps {
  children: ReactNode;
  module: Module;
  /** 'inline' renders an access-denied panel in place (default); 'redirect' pushes to `fallbackRoute`. */
  mode?: 'inline' | 'redirect';
  fallbackRoute?: string;
  /** Shown in the denied panel so the user knows what they were trying to reach. */
  label?: string;
}

/**
 * RouteGuard — enforces the unified RBAC module tiers (lib/auth/rbac) on a page.
 *
 * <RouteGuard module="school" label="Director Command">
 *   <SportsDirectorDashboard />
 * </RouteGuard>
 *
 * Note: usePermissions currently resolves the role from the Permission View
 * simulator (PermissionViewContext) — the same source the sidebar uses — so
 * this gate is exactly as strict as the navigation.
 */
export function RouteGuard({ children, module, mode = 'inline', fallbackRoute = '/home', label }: RouteGuardProps) {
  const router = useRouter();
  const { canAccess, role, tier } = usePermissions();
  const isAuthorized = canAccess(module);

  useEffect(() => {
    if (!isAuthorized && mode === 'redirect') router.push(fallbackRoute);
  }, [isAuthorized, mode, fallbackRoute, router]);

  if (isAuthorized) return <>{children}</>;
  if (mode === 'redirect') return null;

  return (
    <div role="alert" className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="rounded-[2rem] border border-rose-500/20 bg-rose-500/[0.04] p-8 md:p-10 space-y-4 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <ShieldOff className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Access restricted</h1>
        <p className="text-sm text-white/60">
          {label ? <><b className="text-white/80">{label}</b> is</> : 'This page is'} limited to tier {MODULES[module]} roles and above.
          Your current role (<span className="font-mono text-white/80">{role}</span>, tier {tier}) doesn&apos;t include it.
        </p>
        <p className="text-xs text-white/40">Switch role in the Permission View, or ask your school admin for access.</p>
        <Link href={fallbackRoute} className="inline-flex h-10 items-center rounded-full bg-white/5 border border-white/10 px-6 text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
