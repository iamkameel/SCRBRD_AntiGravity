/**
 * Maps the human-readable role stored on a user record ("System Architect",
 * "Coach") to the RBAC role keys used by lib/auth/rbac.
 *
 * Shared by the server session layer and the client permission hook so a role
 * resolves identically on both sides of the boundary.
 */

import { ROLES, Role } from './rbac';

export function mapDisplayRoleToRbac(displayRole: string | null | undefined): Role {
    if (!displayRole) return ROLES.EXTERNAL;
    const normalized = displayRole.toLowerCase().replace(/[\s-]/g, '_');

    switch (normalized) {
        // Administrative
        case 'system_architect': return ROLES.PLATFORMOPS;
        case 'admin': return ROLES.SUPERADMIN;
        case 'sportsmaster': return ROLES.SPORTSMASTER;
        case 'school_admin': return ROLES.SCHOOLADMIN;

        // Team staff
        case 'coach': return ROLES.COACH;
        case 'assistant_coach': return ROLES.COACHSUPPORT;
        case 'team_manager': return ROLES.SCHOOLSTAFF;
        case 'captain': return ROLES.SELECTOR;

        // Players & spectators
        case 'player': return ROLES.PLAYER;
        case 'guardian': return ROLES.PARENT;
        case 'spectator': return ROLES.EXTERNAL;

        // Support & medical
        case 'trainer':
        case 'physiotherapist':
        case 'doctor':
        case 'first_aid': return ROLES.MEDICALOFFICER;

        // Officials & ground staff
        case 'umpire':
        case 'scorer': return ROLES.MATCHOFFICIAL;
        case 'grounds_keeper': return ROLES.GROUNDSKEEPER;
        case 'driver': return ROLES.DRIVER;

        default:
            // An RBAC key may already be stored (e.g. from a custom claim).
            if ((Object.values(ROLES) as string[]).includes(normalized)) return normalized as Role;
            return ROLES.EXTERNAL;
    }
}
