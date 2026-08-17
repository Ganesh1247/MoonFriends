import { NextResponse } from 'next/server';
import { createSessionCookie, destroySessionCookie } from '@/lib/firebase/auth-session';
import { adminAuth } from '@/lib/firebase/admin';

/**
 * POST /api/auth/session
 * Create a session cookie from a Firebase ID token.
 */
export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify the ID token first
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Create session cookie
    await createSessionCookie(idToken);

    return NextResponse.json({
      success: true,
      uid: decodedToken.uid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Session creation error:', message);
    return NextResponse.json(
      { error: 'Failed to create session', detail: message },
      { status: 401 }
    );
  }
}

/**
 * DELETE /api/auth/session
 * Destroy the session cookie (logout).
 */
export async function DELETE() {
  try {
    await destroySessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Session destruction error:', error);
    return NextResponse.json(
      { error: 'Failed to destroy session' },
      { status: 500 }
    );
  }
}
