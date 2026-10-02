import type { DecodedIdToken } from "firebase-admin/auth";

import { adminAuth } from "@/lib/firebaseAdmin";

// Server-side mirror of verified() in firestore.rules: the caller must send a
// Firebase ID token (Authorization: Bearer <token>) for an account that passed
// phone verification or signed in with Google. Returns null otherwise.
export const getVerifiedUser = async (
  request: Request
): Promise<DecodedIdToken | null> => {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);

    const verified =
      decoded.phoneVerified === true ||
      decoded.firebase?.sign_in_provider === "google.com";

    return verified ? decoded : null;
  } catch {
    return null;
  }
};
