'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/lib/auth/usePermissions';
import { Module } from '@/lib/auth/rbac';

interface RouteGuardProps {
  children: ReactNode;
  module: Module;
  fallbackRoute?: string;
}

/**
 * RouteGuard
 * Enforces RBAC protection for a given feature module.
 * Wraps page content and redirects unauthorized users.
 * 
 * Usage:
 * <RouteGuard module="injuries">
 *   <InjuryDashboard />
 * </RouteGuard>
 */
export function RouteGuard({ 
  children, 
  module, 
  fallbackRoute = '/unauthorized' 
}: RouteGuardProps) {
  const router = useRouter();
  const { canAccess } = usePermissions();

  const isAuthorized = canAccess(module);

  useEffect(() => {
    if (!isAuthorized) {
      router.push(fallbackRoute);
    }
  }, [isAuthorized, fallbackRoute, router]);

  if (!isAuthorized) {
    return null; // Prevents protected content from flashing before redirect
  }

  return <>{children}</>;
}
