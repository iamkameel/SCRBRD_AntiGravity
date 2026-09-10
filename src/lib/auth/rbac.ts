/**
 * Role-Based Access Control (RBAC) System
 * Based on the SCRBRD CricketOS Platform Dossier
 * 17 Roles | 6 Tiers | 30 Modules
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

// 3. The 30 Navigation Modules & Base Access Rules (Max Tier Allowed)
export const MODULES = {
    dashboard: 6,
    matches: 5,
    competitions: 4,
    leagues: 4,
    squad: 4,
    profiles: 4,
    analytics: 4,
    skills: 4,
    training: 4,
    fitness: 4,
    injuries: 4,
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

    // Specific Module Exceptions (Parent Hub exclusively for parents)
    if (module === 'parenthub') {
        return role === ROLES.PARENT || userTier <= 2; // Parents + Core platform ops
    }

    // Default RBAC check: lower tier number implies higher access scope
    // If the user's tier is less than or equal to the maximum allowed tier for the module, grant access.
    const maxAllowedTier = MODULES[module];
    return userTier <= maxAllowedTier;
}

/**
 * Returns the permitted modules for a specific role (for rendering Sidebars).
 */
export function getPermittedModules(role: Role): Module[] {
    return (Object.keys(MODULES) as Module[]).filter(mod => hasModuleAccess(role, mod));
}
