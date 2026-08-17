import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

/**
 * GET /api/auth/debug
 * Temporary endpoint to verify Firebase Admin SDK is working on Vercel.
 * DELETE THIS ROUTE after confirming auth works.
 */
export async function GET() {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (!raw) {
      return NextResponse.json({ ok: false, step: "env_missing", detail: "FIREBASE_SERVICE_ACCOUNT_KEY is not set" });
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ ok: false, step: "json_parse", detail: "Service account key is not valid JSON" });
    }

    const requiredFields = ["type", "project_id", "private_key", "client_email"];
    const missing = requiredFields.filter((f) => !parsed[f]);
    if (missing.length > 0) {
      return NextResponse.json({ ok: false, step: "missing_fields", detail: `Missing: ${missing.join(", ")}` });
    }

    const hasEscapedNewlines = parsed.private_key.includes("\\n");
    const hasRealNewlines = parsed.private_key.includes("\n");

    await adminAuth.listUsers(1);

    return NextResponse.json({
      ok: true,
      project_id: parsed.project_id,
      client_email: parsed.client_email,
      private_key_starts: parsed.private_key.substring(0, 40),
      hasEscapedNewlines,
      hasRealNewlines,
      detail: "Admin SDK initialized and working",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ ok: false, step: "admin_sdk", detail: message });
  }
}
