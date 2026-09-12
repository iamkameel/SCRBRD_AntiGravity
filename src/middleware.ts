import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/sessionCookie';

/**
 * Route protection.
 *
 * Presence of the session cookie is checked here; its *signature* is verified
 * in each server action and route handler via requireUser(). Middleware runs on
 * the Edge runtime, which cannot load firebase-admin, so this is deliberately a
 * cheap gate that keeps anonymous visitors out of the app shell — never the
 * thing that authorizes a read or a write.
 */

const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/features',
    '/ecosystem',
    '/pitch-deck',
];

const PUBLIC_PREFIXES = [
    '/api/auth/',   // sign-in must be reachable without a session
    '/browse-',     // public league/division browsing
];

function isPublic(pathname: string): boolean {
    if (PUBLIC_ROUTES.includes(pathname)) return true;
    return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    if (isPublic(pathname)) return NextResponse.next();
    if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname + search);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    // Everything except Next internals, the auth endpoints and static assets.
    matcher: ['/((?!_next/static|_next/image|favicon.ico|images/|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|txt|xml)$).*)'],
};
