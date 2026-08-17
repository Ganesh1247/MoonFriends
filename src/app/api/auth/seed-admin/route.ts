import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Timestamp } from "firebase-admin/firestore";

const ADMIN_EMAIL = "ganeshkoilada1247@gmail.com";
const ADMIN_PASSWORD = "Ganesh@1247";
const ADMIN_NAME = "Ganesh Koilada";

/**
 * POST /api/auth/seed-admin
 * One-time endpoint to create the admin account.
 * Protected by a secret header: x-seed-secret: moonfriends-seed-2026
 * Run this ONCE after deployment, then this route stays harmless
 * (subsequent calls will update the existing account, not duplicate it).
 */
export async function POST(request: Request) {
  // Simple secret check to prevent accidental or malicious calls
  const secret = request.headers.get("x-seed-secret");
  if (secret !== "moonfriends-seed-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let uid: string;

    // Try to get existing user first
    try {
      const existing = await adminAuth.getUserByEmail(ADMIN_EMAIL);
      uid = existing.uid;
      // Update password in case it changed
      await adminAuth.updateUser(uid, {
        password: ADMIN_PASSWORD,
        displayName: ADMIN_NAME,
      });
    } catch {
      // User doesn't exist — create it
      const created = await adminAuth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        displayName: ADMIN_NAME,
        emailVerified: true,
      });
      uid = created.uid;
    }

    // Set admin custom claim
    await adminAuth.setCustomUserClaims(uid, { role: "admin" });

    // Upsert Firestore profile
    await adminDb.collection("users").doc(uid).set(
      {
        uid,
        email: ADMIN_EMAIL,
        fullName: ADMIN_NAME,
        phone: "",
        role: "admin",
        isActive: true,
        updatedAt: Timestamp.now(),
      },
      { merge: true }
    );

    // Set createdAt only on first write
    const doc = await adminDb.collection("users").doc(uid).get();
    if (!doc.data()?.createdAt) {
      await adminDb.collection("users").doc(uid).update({
        createdAt: Timestamp.now(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Admin account ready: ${ADMIN_EMAIL}`,
      uid,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Seed admin error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
