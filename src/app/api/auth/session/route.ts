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
    provisionUserRecord,
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

        // Create the users record and role claim if this account has none.
        // Must happen server-side: the rules deny client writes to users/{uid}
        // because the role stored there is what the claim is derived from.
        try {
            await provisionUserRecord(decoded.uid, decoded.email ?? null, decoded.name ?? null);
        } catch (e) {
            console.error('[auth] provisioning failed', e);
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
