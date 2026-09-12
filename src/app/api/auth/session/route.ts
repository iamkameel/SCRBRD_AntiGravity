/**
 * Session endpoint.
 *
 * POST   — exchanges a freshly issued Firebase ID token for an httpOnly
 *          session cookie, which is what every server action verifies.
 * DELETE — clears the cookie and revokes refresh tokens so the session
 *          cannot be resumed on any device.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import {
    SESSION_COOKIE,
    SESSION_MAX_AGE_MS,
    createSessionCookie,
    getSessionUser,
    setUserRoleClaim,
} from '@/lib/auth/session';

export async function POST(request: NextRequest) {
    try {
        const { idToken } = await request.json();
        if (typeof idToken !== 'string' || !idToken) {
            return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
        }

        // Reject anything but a very recently minted token, so a leaked
        // long-lived token cannot be traded for a session.
        const decoded = await adminAuth.verifyIdToken(idToken, true);
        if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
            return NextResponse.json({ error: 'Recent sign-in required' }, { status: 401 });
        }

        // Promote the stored role to a custom claim so later sessions resolve
        // it from the cookie instead of reading users/{uid} on every action.
        if (!decoded.role) {
            try {
                const snap = await adminDb.collection('users').doc(decoded.uid).get();
                const storedRole = snap.exists ? (snap.data()?.role as string) : null;
                if (storedRole) await setUserRoleClaim(decoded.uid, storedRole);
            } catch {
                // Non-fatal: resolveRole falls back to the users document.
            }
        }

        const cookie = await createSessionCookie(idToken);
        const response = NextResponse.json({ success: true });
        response.cookies.set(SESSION_COOKIE, cookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: SESSION_MAX_AGE_MS / 1000,
        });
        return response;
    } catch {
        return NextResponse.json({ error: 'Could not create session' }, { status: 401 });
    }
}

export async function DELETE() {
    const user = await getSessionUser();
    if (user) {
        try {
            await adminAuth.revokeRefreshTokens(user.uid);
        } catch {
            // Clearing the cookie still signs this browser out.
        }
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    return response;
}
