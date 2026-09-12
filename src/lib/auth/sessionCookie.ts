/**
 * The session cookie's name, in its own module so the Edge middleware can
 * import it without pulling in firebase-admin (which cannot run on the Edge
 * runtime). lib/auth/session.ts re-exports it for server code.
 */
export const SESSION_COOKIE = '__scrbrd_session';

/** Firebase caps session cookies at 14 days. */
export const SESSION_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
