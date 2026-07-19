// One-time migration: set the `phoneVerified` custom claim on every existing
// account that has a phone number. New accounts get this claim automatically in
// /api/auth/verify-otp, but accounts created before that change need a backfill
// so their password logins keep passing the Firestore `verified()` rule.
//
// Run once:  node scripts/backfill-phone-verified-claim.mjs
//
// Accounts with a phoneNumber went through the Admin-SDK create-by-phone flow,
// so they are genuinely phone-verified. Accounts with NO phone (e.g. Google, or
// a raw createUserWithEmailAndPassword bypass) are intentionally left untouched:
// Google users pass the rule via their provider, and bypass accounts must stay
// blocked.

import { readFileSync } from "node:fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// Minimal .env.local loader (avoids a dotenv dependency).
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) {
    // Strip surrounding quotes the way dotenv does (the PEM is stored quoted).
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const adminAuth = getAuth(
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n")
    })
  })
);

let updated = 0;
let skipped = 0;
let pageToken;

do {
  const { users, pageToken: next } = await adminAuth.listUsers(1000, pageToken);
  pageToken = next;

  for (const u of users) {
    if (!u.phoneNumber) {
      skipped++;
      continue;
    }
    if (u.customClaims?.phoneVerified === true) {
      skipped++;
      continue;
    }
    await adminAuth.setCustomUserClaims(u.uid, {
      ...u.customClaims,
      phoneVerified: true
    });
    updated++;
    console.log(`  set phoneVerified on ${u.uid} (${u.phoneNumber})`);
  }
} while (pageToken);

console.log(`\nDone. Updated ${updated}, skipped ${skipped}.`);
process.exit(0);
