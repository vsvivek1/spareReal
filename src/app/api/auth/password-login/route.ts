import { NextResponse } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebaseAdmin";

// Username + password login. The username → phone lookup has to happen
// server-side now that `users` docs aren't world-readable (they hold phone
// numbers). The password is checked by Firebase Auth's own REST endpoint,
// then we hand back a custom token, so the client never learns which phone
// number a username belongs to.
// Mirrors normalizeUsername / phoneToPseudoEmail in the client services,
// which can't be imported here without pulling in the client Firebase SDK.
const normalizeUsername = (value: string) => value.trim().toLowerCase();

const pseudoEmailForPhone = (phone: string) => {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length === 11) digits = digits.slice(1);
  return `${digits}@sparex.app.local`;
};

export async function POST(request: Request) {
  const { username, password } = await request.json().catch(() => ({}));

  const invalid = NextResponse.json(
    { error: "Incorrect username or password." },
    { status: 401 }
  );

  const normalized = normalizeUsername(String(username || ""));

  if (!normalized || !password) return invalid;

  try {
    const snapshot = await adminDb
      .collection("users")
      .where("username", "==", normalized)
      .limit(1)
      .get();

    const phone = snapshot.empty ? "" : snapshot.docs[0].get("phone");

    if (!phone) return invalid;

    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: pseudoEmailForPhone(phone),
          password: String(password),
          returnSecureToken: true,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.localId) {
      if (String(data?.error?.message || "").startsWith("TOO_MANY_ATTEMPTS")) {
        return NextResponse.json(
          { error: "Too many attempts. Wait a bit and try again." },
          { status: 429 }
        );
      }

      return invalid;
    }

    const customToken = await adminAuth.createCustomToken(data.localId);

    return NextResponse.json({ customToken });
  } catch (error) {
    console.error("password-login failed:", error);

    return NextResponse.json(
      { error: "Couldn't log you in. Please try again." },
      { status: 502 }
    );
  }
}
