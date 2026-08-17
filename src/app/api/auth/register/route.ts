import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

/**
 * POST /api/auth/register
 * Called immediately after client-side createUserWithEmailAndPassword.
 * Verifies the ID token, saves the user profile to Firestore,
 * and sets the "volunteer" custom claim.
 */
export async function POST(request: Request) {
  try {
    const { idToken, fullName, phone } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "ID token is required" }, { status: 400 });
    }

    // Verify the Firebase ID token
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Set volunteer custom claim
    await adminAuth.setCustomUserClaims(uid, { role: "volunteer" });

    // Save user profile in Firestore
    await adminDb.collection("users").doc(uid).set({
      uid,
      email: decoded.email || "",
      fullName: fullName || decoded.name || "",
      phone: phone || "",
      role: "volunteer",
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Registration error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
