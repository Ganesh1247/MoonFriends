import { cookies } from 'next/headers';
import { adminAuth } from './admin';

const SESSION_COOKIE_NAME = '__session';
const SESSION_EXPIRY_DAYS = 5;

/**
 * Create a session cookie from a Firebase ID token.
 * Called after client-side login to establish server-side session.
 */
export async function createSessionCookie(idToken: string): Promise<string> {
  const expiresIn = SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 5 days in ms

  const sessionCookie = await adminAuth.createSessionCookie(idToken, {
    expiresIn,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return sessionCookie;
}

/**
 * Verify the session cookie and return the decoded claims.
 * Returns null if the session is invalid or expired.
 */
export async function verifySessionCookie() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await adminAuth.verifySessionCookie(
      sessionCookie,
      true // Check if revoked
    );

    return decodedClaims;
  } catch {
    return null;
  }
}

/**
 * Get the current authenticated user with their role.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const claims = await verifySessionCookie();
  if (!claims) return null;

  try {
    const userRecord = await adminAuth.getUser(claims.uid);
    return {
      uid: claims.uid,
      email: claims.email || '',
      displayName: userRecord.displayName || '',
      role: (claims.role as string) || 'volunteer',
      photoURL: userRecord.photoURL || '',
    };
  } catch {
    return null;
  }
}

/**
 * Destroy the session cookie (logout).
 */
export async function destroySessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Require authentication. Throws if not authenticated.
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

/**
 * Require a specific role. Throws if unauthorized.
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Unauthorized. Required role: ${allowedRoles.join(' or ')}`);
  }
  return user;
}
