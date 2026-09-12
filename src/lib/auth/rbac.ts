/**
 * Role-Based Access Control (RBAC) System
 * Based on the SCRBRD CricketOS Platform Dossier
 * 17 Roles | 6 Tiers | 31 Modules
 */

// 1. All 17 User Roles
export const ROLES = {
    // Tier 1 - Platform
    SUPERADMIN: 'superadmin',
    PLATFORMOPS: 'platformops',
    // Tier 2 - Competition
    LEAGUEADMIN: 'leagueadmin',
    TOURNAMENTDIRECTOR: 'tournamentdirector',
    // Tier 3 - School
    SPORTSMASTER: 'sportsmaster',
    SCHOOLADMIN: 'schooladmin',
    MEDICALOFFICER: 'medicalofficer',
    SCHOOLSTAFF: 'schoolstaff',
    // Tier 4 - Coaching
    COACH: 'coach',
    COACHSUPPORT: 'coachsupport',
    // Match & Ground Operations
    MATCHOFFICIAL: 'matchofficial',
    GROUNDSKEEPER: 'groundskeeper',
    DRIVER: 'driver',
    SELECTOR: 'selector',
    // Tier 5 - Participant
    PLAYER: 'player',
    ADULTPLAYER: 'adultplayer',
    PARENT: 'parent',
    // Tier 6 - External
    SCOUT: 'scout',
    EXTERNAL: 'external',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// 2. The 6 Permission Tiers
export const ROLE_TIERS: Record<Role, number> = {
    [ROLES.SUPERADMIN]: 1,
    [ROLES.PLATFORMOPS]: 1,
    [ROLES.LEAGUEADMIN]: 2,
    [ROLES.TOURNAMENTDIRECTOR]: 2,
    [ROLES.SPORTSMASTER]: 3,
    [ROLES.SCHOOLADMIN]: 3,
    [ROLES.MEDICALOFFICER]: 3,
    [ROLES.SCHOOLSTAFF]: 3,
    [ROLES.COACH]: 4,
    [ROLES.COACHSUPPORT]: 4,
    [ROLES.MATCHOFFICIAL]: 4,
    [ROLES.GROUNDSKEEPER]: 4,
    [ROLES.DRIVER]: 4,
    [ROLES.SELECTOR]: 4,
    [ROLES.PLAYER]: 5,
    [ROLES.ADULTPLAYER]: 5,
    [ROLES.PARENT]: 5,
    [ROLES.SCOUT]: 6,
    [ROLES.EXTERNAL]: 6,
};

// 3. The 31 Navigation Modules & Base Access Rules (Max Tier Allowed)
export const MODULES = {
    dashboard: 6,
    matches: 5,
    scoring: 4,        // Live Scorer Console — Scorer, Coach, Admin, Match Official
    competitions: 4,
    leagues: 4,
    squad: 4,
    profiles: 4,
    analytics: 4,
    skills: 4,
    training: 4,
    fitness: 4,
    injuries: 4,
    medical: 3,        // confidential medical & concussion RTP hub
    logistics: 4,
    calendar: 5,
    fields: 4,
    staff: 3,
    notifications: 6,
    settings: 3,
    management: 3,
    rulebook: 4,
    pitchdeck: 2,
    advertising: 3,
    rewards: 5,
    passport: 4,
    talent: 4,
    powerindex: 3,
    parenthub: 5,
    myprofile: 6,
    school: 3,
    newsfeed: 6,
    inbox: 6,
    media: 4,        // broadcast overlays, highlight clipper, bulletins
} as const;

export type Module = keyof typeof MODULES;

// 4. Access Resolution Logic
export function resolveRoleTier(role: Role): number {
    return ROLE_TIERS[role] || 6;
}

/**
 * Validates if a user role has access to a specific module.
 */
export function hasModuleAccess(role: Role, module: Module): boolean {
    const userTier = resolveRoleTier(role);

    // 1. Scoring Console exclusively for operational scoring roles
    if (module === 'scoring') {
        const allowedScoringRoles: Role[] = [
            ROLES.SUPERADMIN,
            ROLES.PLATFORMOPS,
            ROLES.LEAGUEADMIN,
            ROLES.TOURNAMENTDIRECTOR,
            ROLES.SPORTSMASTER,
            ROLES.SCHOOLADMIN,
            ROLES.COACH,
            ROLES.COACHSUPPORT,
            ROLES.MATCHOFFICIAL,
            ROLES.SELECTOR
        ];
        return allowedScoringRoles.includes(role);
    }

    // 2. Groundskeeper & Facilities Hub
    if (module === 'fields') {
        const allowedFieldRoles: Role[] = [
            ROLES.SUPERADMIN,
            ROLES.PLATFORMOPS,
            ROLES.LEAGUEADMIN,
            ROLES.TOURNAMENTDIRECTOR,
            ROLES.SPORTSMASTER,
            ROLES.SCHOOLADMIN,
            ROLES.SCHOOLSTAFF,
            ROLES.COACH,
            ROLES.COACHSUPPORT,
            ROLES.GROUNDSKEEPER
        ];
        return allowedFieldRoles.includes(role);
    }

    // 3. Logistics & Fleet Operations Hub
    if (module === 'logistics') {
        const allowedLogisticsRoles: Role[] = [
            ROLES.SUPERADMIN,
            ROLES.PLATFORMOPS,
            ROLES.LEAGUEADMIN,
            ROLES.TOURNAMENTDIRECTOR,
            ROLES.SPORTSMASTER,
            ROLES.SCHOOLADMIN,
            ROLES.SCHOOLSTAFF,
            ROLES.COACH,
            ROLES.COACHSUPPORT,
            ROLES.DRIVER
        ];
        return allowedLogisticsRoles.includes(role);
    }

    // 4. Medical Hub
    if (module === 'medical') {
        const allowedMedicalRoles: Role[] = [
            ROLES.SUPERADMIN,
            ROLES.PLATFORMOPS,
            ROLES.SPORTSMASTER,
            ROLES.SCHOOLADMIN,
            ROLES.MEDICALOFFICER
        ];
        return allowedMedicalRoles.includes(role);
    }

    // 5. Parent Hub exclusively for parents & platform ops
    if (module === 'parenthub') {
        return role === ROLES.PARENT || userTier <= 2;
    }

    // Default RBAC check: lower tier number implies higher access scope
    const maxAllowedTier = MODULES[module];
    return userTier <= maxAllowedTier;
}

/**
 * Returns the permitted modules for a specific role (for rendering Sidebars).
 */
export function getPermittedModules(role: Role): Module[] {
    return (Object.keys(MODULES) as Module[]).filter(mod => hasModuleAccess(role, mod));
}

