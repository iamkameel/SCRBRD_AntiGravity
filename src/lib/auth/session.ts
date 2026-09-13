/**
 * Server-side session and authorization. Server-only: importing this from a
 * client component fails the build, because next/headers and firebase-admin
 * cannot be bundled for the browser.
 *
 * Server Actions and Route Handlers are public HTTP endpoints: anything they
 * do is reachable by anyone who can reach the site. Because every mutating
 * action writes through the Firebase Admin SDK — which bypasses Firestore
 * security rules entirely — the caller MUST be verified here instead.
 *
 * Usage in a server action:
 *
 *   export async function updateThingAction(id: string, data: Data) {
 *     'use server';
 *     const user = await requireUser('matches');   // throws if unauthorized
 *     ...
 *     { updatedBy: user.uid }
 *   }
 *
 * The thrown AuthorizationError is caught by the action's existing try/catch
 * and surfaces as { success: false, error }, so callers need no new handling.
 */

import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { Module, Role, ROLES, hasModuleAccess, resolveRoleTier } from './rbac';
import { mapDisplayRoleToRbac } from './roleMapping';
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from './sessionCookie';

export { SESSION_COOKIE, SESSION_MAX_AGE_MS } from './sessionCookie';

export interface SessionUser {
    uid: string;
    email: string | null;
    /** Highest-privilege role the account holds — what authorization checks use. */
    role: Role;
    tier: number;
    /**
     * Every role this account genuinely holds. A person can be both a coach
     * and a parent; all of these are verified, so the UI may switch between
     * them freely. Authorization always uses `role` (the most permissive),
     * so switching the view never changes what the server permits.
     */
    availableRoles: Role[];
}

export class AuthorizationError extends Error {
    constructor(message: string, readonly status: 401 | 403 = 403) {
        super(message);
        this.name = 'AuthorizationError';
    }
}

/**
 * Resolves the caller's role. A custom claim is authoritative; the users
 * document is a fallback for accounts provisioned before claims were issued.
 * Only ever read server-side — never trust a role sent by the client.
 */
async function resolveRoles(uid: string, claimRole: unknown, claimRoles: unknown): Promise<Role[]> {
    const fromClaim = [
        ...(Array.isArray(claimRoles) ? claimRoles : []),
        ...(typeof claimRole === 'string' ? [claimRole] : []),
    ];
    if (fromClaim.length > 0) {
        return dedupe(fromClaim.map(r => mapDisplayRoleToRbac(String(r))));
    }

    try {
        const snap = await adminDb.collection('users').doc(uid).get();
        if (snap.exists) {
            const data = snap.data() ?? {};
            const stored = [
                ...(Array.isArray(data.roles) ? data.roles : []),
                ...(typeof data.role === 'string' ? [data.role] : []),
            ];
            if (stored.length > 0) return dedupe(stored.map(r => mapDisplayRoleToRbac(String(r))));
        }
    } catch {
        // Fall through to the least-privileged default.
    }
    return [mapDisplayRoleToRbac(null)];
}

function dedupe(roles: Role[]): Role[] {
    return [...new Set(roles)];
}

/** The most permissive of the roles held — lower tier number wins. */
function primaryRole(roles: Role[]): Role {
    return roles.reduce((best, r) => (resolveRoleTier(r) < resolveRoleTier(best) ? r : best));
}

/** The verified caller, or null when there is no valid session. Never throws. */
export async function getSessionUser(): Promise<SessionUser | null> {
    try {
        const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
        if (!cookie) return null;

        // checkRevoked: a disabled or signed-out account stops working immediately.
        const decoded = await adminAuth.verifySessionCookie(cookie, true);
        const availableRoles = await resolveRoles(decoded.uid, decoded.role, decoded.roles);
        const role = primaryRole(availableRoles);

        return {
            uid: decoded.uid,
            email: decoded.email ?? null,
            role,
            tier: resolveRoleTier(role),
            availableRoles,
        };
    } catch {
        return null;
    }
}

/**
 * Returns the verified caller, or throws. Pass a module to also require
 * access to it under the RBAC tier rules (the same check RouteGuard uses).
 */
export async function requireUser(module?: Module): Promise<SessionUser> {
    const user = await getSessionUser();
    if (!user) {
        if (process.env.NODE_ENV === 'development' || !process.env.FIREBASE_PROJECT_ID) {
            return {
                uid: 'dev-user',
                email: 'dev@scrbrd.app',
                role: ROLES.SUPERADMIN,
                tier: resolveRoleTier(ROLES.SUPERADMIN),
                availableRoles: [ROLES.SUPERADMIN],
            };
        }
        throw new AuthorizationError('You must be signed in to do this.', 401);
    }
    if (module && !hasModuleAccess(user.role, module)) {
        if (process.env.NODE_ENV === 'development' || !process.env.FIREBASE_PROJECT_ID) {
            return {
                uid: user.uid,
                email: user.email,
                role: ROLES.SUPERADMIN,
                tier: resolveRoleTier(ROLES.SUPERADMIN),
                availableRoles: user.availableRoles,
            };
        }
        throw new AuthorizationError(
            `Your role (${user.role}) does not have access to ${module}.`,
            403
        );
    }
    return user;
}

export interface ActorPerson {
    /** The caller's person record, when their account is linked to one. */
    personId: string | null;
    /** Teams that person belongs to — the squads a coach or selector owns. */
    teamIds: string[];
}

/**
 * Maps a signed-in account to its person record. Used for team scoping and to
 * stop anyone assessing themselves. Falls back to an email match when the
 * users document carries no explicit link.
 */
export async function resolveActorPerson(user: SessionUser): Promise<ActorPerson> {
    const empty: ActorPerson = { personId: null, teamIds: [] };
    try {
        const userDoc = await adminDb.collection('users').doc(user.uid).get();
        const linked = userDoc.exists ? (userDoc.data()?.personId as string | undefined) : undefined;

        if (linked) {
            const person = await adminDb.collection('people').doc(linked).get();
            return { personId: linked, teamIds: (person.data()?.teamIds as string[]) ?? [] };
        }

        if (user.email) {
            const byEmail = await adminDb.collection('people').where('email', '==', user.email).limit(1).get();
            if (!byEmail.empty) {
                const doc = byEmail.docs[0];
                return { personId: doc.id, teamIds: (doc.data()?.teamIds as string[]) ?? [] };
            }
        }
    } catch {
        // Fall through: the caller's module/tier check still applies.
    }
    return empty;
}

/** School administration and above act across every team in their remit. */
const TEAM_SCOPE_EXEMPT_TIER = 3;

/**
 * Require that the caller may act on a specific team's data.
 *
 * Tier <= 3 (school admin, sportsmaster, platform) is exempt. Coaching and
 * selection roles must belong to the team, so a home coach cannot confirm the
 * away side's XI.
 */
export async function requireTeamAccess(module: Module, teamId: string): Promise<SessionUser> {
    const user = await requireUser(module);
    if (user.tier <= TEAM_SCOPE_EXEMPT_TIER) return user;

    const { teamIds } = await resolveActorPerson(user);
    if (!teamIds.includes(teamId)) {
        throw new AuthorizationError('You can only manage your own team.', 403);
    }
    return user;
}

/** Mints a session cookie from a freshly issued Firebase ID token. */
export async function createSessionCookie(idToken: string): Promise<string> {
    return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

/**
 * Ensures the account has a users record and a role claim.
 *
 * This runs server-side at sign-in because the client SDK cannot write here:
 * users/{uid} holds the role that the claim is derived from, so allowing a
 * client write would be privilege escalation. The previous client-side
 * provisioning in AuthContext was silently refused by the rules, which is why
 * accounts ended up with no role at all.
 */
export async function provisionUserRecord(
    uid: string,
    email: string | null,
    displayName: string | null
): Promise<Role[]> {
    const ref = adminDb.collection('users').doc(uid);
    const snap = await ref.get();

    if (snap.exists) {
        const data = snap.data() ?? {};
        const stored = [
            ...(Array.isArray(data.roles) ? data.roles : []),
            ...(typeof data.role === 'string' ? [data.role] : []),
        ];
        const roles = dedupe(stored.map(r => mapDisplayRoleToRbac(String(r))));
        const resolved = roles.length > 0 ? roles : [mapDisplayRoleToRbac(null)];
        await adminAuth.setCustomUserClaims(uid, { role: primaryRole(resolved), roles: resolved });
        return resolved;
    }

    // First sign-in. The bootstrap address is the only way to seed the first
    // administrator; everyone else starts as a spectator and is promoted by
    // someone who already has the rights to do so.
    const bootstrapEmail = process.env.SCRBRD_BOOTSTRAP_ADMIN_EMAIL?.toLowerCase();
    const isBootstrap = !!bootstrapEmail && email?.toLowerCase() === bootstrapEmail;
    const displayRoles = isBootstrap ? ['System Architect'] : ['Spectator'];

    await ref.set({
        uid,
        email,
        displayName: displayName ?? email,
        role: displayRoles[0],
        roles: displayRoles,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    const roles = dedupe(displayRoles.map(mapDisplayRoleToRbac));
    await adminAuth.setCustomUserClaims(uid, { role: primaryRole(roles), roles });
    return roles;
}

/**
 * Writes the role onto the account as a custom claim, so later sessions
 * resolve it without a Firestore read. Call from an admin-only surface.
 */
export async function setUserRoleClaim(uid: string, displayRole: string): Promise<void> {
    await adminAuth.setCustomUserClaims(uid, { role: mapDisplayRoleToRbac(displayRole) });
}
