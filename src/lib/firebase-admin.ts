// Firebase Admin SDK Configuration (Server-side only)
//
// Credentials come from the environment and nowhere else. There is deliberately
// no embedded fallback key: a fallback means a misconfigured deployment starts
// up and fails later in a confusing way, and any key committed to source must
// be treated as compromised the moment it lands in history.
//
// Required in .env.local (never committed):
//   FIREBASE_ADMIN_PROJECT_ID
//   FIREBASE_ADMIN_CLIENT_EMAIL
//   FIREBASE_ADMIN_PRIVATE_KEY   "-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----\n"
import admin from 'firebase-admin';

function readCredentials() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;

  const missing = [
    !projectId && 'FIREBASE_ADMIN_PROJECT_ID',
    !clientEmail && 'FIREBASE_ADMIN_CLIENT_EMAIL',
    !privateKey && 'FIREBASE_ADMIN_PRIVATE_KEY',
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new Error(
      `Firebase Admin credentials missing: ${missing.join(', ')}. ` +
      `Add them to .env.local — see .env.local.example. ` +
      `Never commit a service-account key.`
    );
  }

  return {
    projectId: projectId as string,
    clientEmail: clientEmail as string,
    // Env vars carry literal \n sequences; the SDK needs real newlines.
    privateKey: (privateKey as string).replace(/\\n/g, '\n'),
  };
}

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(readCredentials()) });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();

export default admin;
