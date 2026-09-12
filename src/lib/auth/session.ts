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
import { Module, Role, hasModuleAccess, resolveRoleTier } from './rbac';
import { mapDisplayRoleToRbac } from './roleMapping';
import { SESSION_COOKIE, SESSION_MAX_AGE_MS } from './sessionCookie';

export { SESSION_COOKIE, SESSION_MAX_AGE_MS } from './sessionCookie';

export interface SessionUser {
    uid: string;
    email: string | null;
    role: Role;
    tier: number;
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
async function resolveRole(uid: string, claimRole: unknown): Promise<Role> {
    if (typeof claimRole === 'string' && claimRole.length > 0) {
        return mapDisplayRoleToRbac(claimRole);
    }
    try {
        const snap = await adminDb.collection('users').doc(uid).get();
        return mapDisplayRoleToRbac(snap.exists ? (snap.data()?.role as string) : null);
    } catch {
        return mapDisplayRoleToRbac(null);
    }
}

/** The verified caller, or null when there is no valid session. Never throws. */
export async function getSessionUser(): Promise<SessionUser | null> {
    try {
        const cookie = (await cookies()).get(SESSION_COOKIE)?.value;
        if (!cookie) return null;

        // checkRevoked: a disabled or signed-out account stops working immediately.
        const decoded = await adminAuth.verifySessionCookie(cookie, true);
        const role = await resolveRole(decoded.uid, decoded.role);

        return {
            uid: decoded.uid,
            email: decoded.email ?? null,
            role,
            tier: resolveRoleTier(role),
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
        throw new AuthorizationError('You must be signed in to do this.', 401);
    }
    if (module && !hasModuleAccess(user.role, module)) {
        throw new AuthorizationError(
            `Your role (${user.role}) does not have access to ${module}.`,
            403
        );
    }
    return user;
}

/** Mints a session cookie from a freshly issued Firebase ID token. */
export async function createSessionCookie(idToken: string): Promise<string> {
    return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE_MS });
}

/**
 * Writes the role onto the account as a custom claim, so later sessions
 * resolve it without a Firestore read. Call from an admin-only surface.
 */
export async function setUserRoleClaim(uid: string, displayRole: string): Promise<void> {
    await adminAuth.setCustomUserClaims(uid, { role: mapDisplayRoleToRbac(displayRole) });
}
