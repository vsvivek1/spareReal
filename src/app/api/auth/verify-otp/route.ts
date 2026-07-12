import { NextResponse } from "next/server";
import { formatPhoneE164 } from "@/services/authService";
import { adminAuth } from "@/lib/firebaseAdmin";

// The client already ran phone verification through the MSG91 widget and
// got back a JWT access-token — this route is the trust boundary: it must
// independently confirm that token with MSG91 (never trust the client's
// say-so) before minting a Firebase session.
export async function POST(request: Request) {

  const { accessToken, phone } = await request.json();

  if (!accessToken || !phone) {

    return NextResponse.json(
      { error: "Enter the 4-digit code." },
      { status: 400 }
    );

  }

  try {

    const response = await fetch(
      "https://control.msg91.com/api/v5/widget/verifyAccessToken",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authkey: process.env.MSG91_AUTH_KEY,
          "access-token": accessToken
        })
      }
    );

    const data = await response.json();

    if (data.type !== "success") {

      return NextResponse.json(
        { error: data.message || "That code isn't right. Check it and try again." },
        { status: 400 }
      );

    }

    const e164Phone = formatPhoneE164(phone);

    let uid: string;

    try {

      const existing = await adminAuth.getUserByPhoneNumber(e164Phone);
      uid = existing.uid;

    } catch (lookupError) {

      const code = (lookupError as { code?: string })?.code;

      if (code !== "auth/user-not-found") {

        throw lookupError;

      }

      try {

        const created = await adminAuth.createUser({ phoneNumber: e164Phone });
        uid = created.uid;

      } catch (createError) {

        // Lost a race with a concurrent verify for the same number —
        // the winner already created the account, so just fetch it.
        const createCode = (createError as { code?: string })?.code;

        if (createCode !== "auth/phone-number-already-exists") {

          throw createError;

        }

        const existing = await adminAuth.getUserByPhoneNumber(e164Phone);
        uid = existing.uid;

      }

    }

    const customToken = await adminAuth.createCustomToken(uid);

    return NextResponse.json({ customToken });

  } catch (error) {

    console.error("MSG91 verify-otp failed:", error);

    return NextResponse.json(
      { error: "Couldn't verify that code. Please try again." },
      { status: 502 }
    );

  }

}
