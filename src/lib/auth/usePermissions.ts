'use client';

import { useMemo } from 'react';
import { Module, hasModuleAccess, MODULES } from './rbac';
import { usePermissionView } from '@/contexts/PermissionViewContext';

/**
 * The current user's role and what it may reach.
 *
 * The role comes from the verified session (resolved server-side), never from
 * a client-selected value — an administrator may preview a *lower* privileged
 * role, but nothing here can widen access. This decides what to render;
 * requireUser() in each server action is what actually enforces it.
 */
export function usePermissions() {
    const { effectiveRole: role, tier, loading } = usePermissionView();

    const canAccess = useMemo(
        () => (module: Module) => hasModuleAccess(role, module),
        [role]
    );

    const permittedModules = useMemo(
        () => (Object.keys(MODULES) as Module[]).filter(mod => hasModuleAccess(role, mod)),
        [role]
    );

    return {
        role,
        tier,
        canAccess,
        permittedModules,
        /** Permissions are not yet known; render restricted UI until false. */
        loading,
    };
}
