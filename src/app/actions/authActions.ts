'use server';

import { getSessionUser } from '@/lib/auth/session';
import { Module, hasModuleAccess } from '@/lib/auth/rbac';

export interface ClientSessionUser {
    uid: string;
    email: string | null;
    /** Highest-privilege role held — what the server authorizes against. */
    role: string;
    tier: number;
    /** Every role this account genuinely holds, for the role switcher. */
    availableRoles: string[];
}

/**
 * The verified caller, for UI that needs to hide what a role cannot do.
 *
 * This is advisory only — it decides what to render. Authorization itself is
 * enforced by requireUser() inside each mutating action, because anything the
 * client decides can be bypassed.
 */
export async function getSessionUserAction(): Promise<ClientSessionUser | null> {
    const user = await getSessionUser();
    if (!user) return null;
    return {
        uid: user.uid,
        email: user.email,
        role: user.role,
        tier: user.tier,
        availableRoles: user.availableRoles,
    };
}

/** Whether the verified caller may reach a module, for conditional rendering. */
export async function canAccessModuleAction(module: Module): Promise<boolean> {
    const user = await getSessionUser();
    return user ? hasModuleAccess(user.role, module) : false;
}
