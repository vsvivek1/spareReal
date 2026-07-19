// Security-rules test for the phone-verification gate added in firestore.rules.
// Runs entirely against the Firestore emulator — never touches production.
//
//   npm run test:rules
//
// Verifies that only genuinely-verified users can write: a phone-verified
// account (the `phoneVerified` custom claim, set server-side in
// /api/auth/verify-otp) or a Google sign-in. A raw `password`-provider account
// with no claim — the createUserWithEmailAndPassword bypass — must be denied.

import { readFileSync } from "node:fs";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails
} from "@firebase/rules-unit-testing";
import { doc, setDoc, updateDoc } from "firebase/firestore";

const testEnv = await initializeTestEnvironment({
  projectId: "sparex-rules-test",
  firestore: { rules: readFileSync("firestore.rules", "utf8") }
});

// Auth contexts mirroring each way a token can reach the rules.
const phoneUser = testEnv.authenticatedContext("phoneUser", {
  phoneVerified: true
}).firestore();

const phoneUser2 = testEnv.authenticatedContext("phoneUser2", {
  phoneVerified: true
}).firestore();

const googleUser = testEnv.authenticatedContext("googleUser", {
  firebase: { sign_in_provider: "google.com", identities: {} }
}).firestore();

// The bypass: signed in via email/password but never phone-verified.
const unverified = testEnv.authenticatedContext("attacker", {
  firebase: { sign_in_provider: "password", identities: {} }
}).firestore();

const anon = testEnv.unauthenticatedContext().firestore();

let failures = 0;
async function check(name, promise) {
  try {
    await promise;
    console.log("  ✓", name);
  } catch (e) {
    failures++;
    console.error("  ✗", name, "—", e.message);
  }
}

console.log("spareListings — create");
await check(
  "phone-verified user CAN create own listing",
  assertSucceeds(setDoc(doc(phoneUser, "spareListings/l1"), { sellerId: "phoneUser", title: "Alternator" }))
);
await check(
  "Google user CAN create own listing",
  assertSucceeds(setDoc(doc(googleUser, "spareListings/l2"), { sellerId: "googleUser", title: "Radiator" }))
);
await check(
  "unverified password account CANNOT create (the bypass)",
  assertFails(setDoc(doc(unverified, "spareListings/l3"), { sellerId: "attacker", title: "Fake" }))
);
await check(
  "anonymous CANNOT create",
  assertFails(setDoc(doc(anon, "spareListings/l4"), { sellerId: "nobody", title: "Nope" }))
);

console.log("spareListings — update ownership");
// Seed a listing owned by phoneUser with rules bypassed.
await testEnv.withSecurityRulesDisabled(async (ctx) => {
  await setDoc(doc(ctx.firestore(), "spareListings/owned"), { sellerId: "phoneUser", title: "Owned" });
});
await check(
  "owner (verified) CAN update own listing",
  assertSucceeds(updateDoc(doc(phoneUser, "spareListings/owned"), { title: "Updated" }))
);
await check(
  "another verified user CANNOT update someone else's listing",
  assertFails(updateDoc(doc(phoneUser2, "spareListings/owned"), { title: "Hijacked" }))
);

console.log("reviews — create");
await check(
  "phone-verified user CAN create a valid review",
  assertSucceeds(setDoc(doc(phoneUser, "reviews/r1"), { raterId: "phoneUser", sellerId: "someSeller", rating: 5 }))
);
await check(
  "unverified account CANNOT create a review",
  assertFails(setDoc(doc(unverified, "reviews/r2"), { raterId: "attacker", sellerId: "someSeller", rating: 5 }))
);
await check(
  "verified user CANNOT review themselves",
  assertFails(setDoc(doc(phoneUser, "reviews/r3"), { raterId: "phoneUser", sellerId: "phoneUser", rating: 5 }))
);

await testEnv.cleanup();

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log("\nAll rules tests passed.");
process.exit(0);
