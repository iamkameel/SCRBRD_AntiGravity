'use client';

import { useMemo } from 'react';
import { ROLES, Role, Module, hasModuleAccess, resolveRoleTier, MODULES } from './rbac';
import { usePermissionView } from '@/contexts/PermissionViewContext';

// Helper to convert simulated display names to our static ROLES keys
const mapSimulatedToRole = (simulated: string): Role => {
    const normalized = simulated.toLowerCase().replace(/[\s-]/g, '_');

    // Administrative
    if (normalized === 'system_architect') return ROLES.PLATFORMOPS;
    if (normalized === 'admin') return ROLES.SUPERADMIN;
    if (normalized === 'sportsmaster') return ROLES.SPORTSMASTER;
    if (normalized === 'school_admin') return ROLES.SCHOOLADMIN;

    // Team Staff
    if (normalized === 'coach') return ROLES.COACH;
    if (normalized === 'assistant_coach') return ROLES.COACHSUPPORT;
    if (normalized === 'team_manager') return ROLES.SCHOOLSTAFF;
    if (normalized === 'captain') return ROLES.PLAYER;

    // Players & Spectators
    if (normalized === 'player') return ROLES.PLAYER;
    if (normalized === 'guardian') return ROLES.PARENT;
    if (normalized === 'spectator') return ROLES.EXTERNAL;

    // Support & Medical
    if (normalized === 'trainer') return ROLES.MEDICALOFFICER;
    if (normalized === 'physiotherapist') return ROLES.MEDICALOFFICER;
    if (normalized === 'doctor') return ROLES.MEDICALOFFICER;
    if (normalized === 'first_aid') return ROLES.MEDICALOFFICER;

    // Officials & Ground Staff
    if (normalized === 'umpire') return ROLES.MATCHOFFICIAL;
    if (normalized === 'scorer') return ROLES.MATCHOFFICIAL;
    if (normalized === 'grounds_keeper') return ROLES.SCHOOLSTAFF;
    if (normalized === 'driver') return ROLES.EXTERNAL;

    return ROLES.EXTERNAL; // Default fallback
}

/**
 * A hook to access the current user's role and RBAC permissions.
 * Currently uses the simulator context.
 * Future transition: Hook into Firebase Auth / NextAuth Context.
 */
export function usePermissions() {
    const { currentRole } = usePermissionView();

    const role = useMemo(() => mapSimulatedToRole(currentRole), [currentRole]);
    const tier = resolveRoleTier(role);

    const canAccess = useMemo(() => {
        return (module: Module) => hasModuleAccess(role, module);
    }, [role]);

    // Expose permitted modules for navigation mapping
    const permittedModules = useMemo(() => {
        return (Object.keys(MODULES) as Module[]).filter(mod => hasModuleAccess(role, mod));
    }, [role]);

    return {
        role,
        tier,
        canAccess,
        permittedModules
    };
}
