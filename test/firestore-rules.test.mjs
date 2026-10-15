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
import { addDoc, collection, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

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

await check(
  "verified user CANNOT create a listing in someone else's name",
  assertFails(setDoc(doc(phoneUser2, "spareListings/l5"), { sellerId: "phoneUser", title: "Spoofed" }))
);
await check(
  "owner CANNOT hand their listing to another seller",
  assertFails(updateDoc(doc(phoneUser, "spareListings/owned"), { sellerId: "phoneUser2" }))
);

console.log("donor vehicles");
await check(
  "verified user CAN add own donor vehicle",
  assertSucceeds(setDoc(doc(phoneUser, "vehicles/v1"), { sellerId: "phoneUser", make: "Maruti Suzuki", model: "Swift", vehicleType: "Scrap" }))
);
await check(
  "verified user CANNOT add a vehicle in someone else's name",
  assertFails(setDoc(doc(phoneUser2, "vehicles/v2"), { sellerId: "phoneUser", make: "Tata", model: "Nexon" }))
);
await check(
  "unverified account CANNOT add a vehicle",
  assertFails(setDoc(doc(unverified, "vehicles/v3"), { sellerId: "attacker", make: "Tata", model: "Nexon" }))
);
await check(
  "anyone CAN read a donor vehicle",
  assertSucceeds(getDoc(doc(anon, "vehicles/v1")))
);
await check(
  "another user CANNOT edit someone's vehicle",
  assertFails(updateDoc(doc(phoneUser2, "vehicles/v1"), { status: "Fully Parted Out" }))
);
await check(
  "owner CAN mark own vehicle fully parted out",
  assertSucceeds(updateDoc(doc(phoneUser, "vehicles/v1"), { status: "Fully Parted Out" }))
);
await check(
  "seller CAN list a part from own donor vehicle",
  assertSucceeds(setDoc(doc(phoneUser, "spareListings/dv1"), { sellerId: "phoneUser", title: "Headlight, left", vehicleId: "v1" }))
);
await check(
  "seller CANNOT list a part against another dealer's vehicle",
  assertFails(setDoc(doc(phoneUser2, "spareListings/dv2"), { sellerId: "phoneUser2", title: "Bonnet", vehicleId: "v1" }))
);
await check(
  "seller CANNOT link a part to a vehicle that doesn't exist",
  assertFails(setDoc(doc(phoneUser, "spareListings/dv3"), { sellerId: "phoneUser", title: "Bonnet", vehicleId: "missing" }))
);
await check(
  "seller CAN edit a part linked to own vehicle",
  assertSucceeds(updateDoc(doc(phoneUser, "spareListings/dv1"), { price: "1500" }))
);
await testEnv.withSecurityRulesDisabled(async (ctx) => {
  await setDoc(doc(ctx.firestore(), "vehicles/other"), { sellerId: "phoneUser2", make: "Tata", model: "Nexon" });
});
await check(
  "seller CANNOT move own listing onto another dealer's vehicle",
  assertFails(updateDoc(doc(phoneUser, "spareListings/dv1"), { vehicleId: "other" }))
);
await check(
  "seller CAN unlink own listing from a vehicle",
  assertSucceeds(updateDoc(doc(phoneUser, "spareListings/dv1"), { vehicleId: null }))
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

console.log("users — privacy and premium");
await check(
  "verified user CAN create own profile as free",
  assertSucceeds(setDoc(doc(phoneUser, "users/phoneUser"), { name: "A", phone: "9000000001", isPremium: false }))
);
await check(
  "verified user CANNOT create own profile as premium",
  assertFails(setDoc(doc(phoneUser2, "users/phoneUser2"), { name: "B", phone: "9000000002", isPremium: true }))
);
await check(
  "user CAN read own profile",
  assertSucceeds(getDoc(doc(phoneUser, "users/phoneUser")))
);
await check(
  "another user CANNOT read someone's profile (phone number)",
  assertFails(getDoc(doc(phoneUser2, "users/phoneUser")))
);
await check(
  "anonymous CANNOT read profiles",
  assertFails(getDoc(doc(anon, "users/phoneUser")))
);
await check(
  "user CAN edit own profile fields",
  assertSucceeds(updateDoc(doc(phoneUser, "users/phoneUser"), { name: "A2" }))
);
await check(
  "user CANNOT upgrade themselves to premium",
  assertFails(updateDoc(doc(phoneUser, "users/phoneUser"), { isPremium: true }))
);

console.log("bookings");
await testEnv.withSecurityRulesDisabled(async (ctx) => {
  await setDoc(doc(ctx.firestore(), "bookings/b1"), {
    customerId: "phoneUser", ownerId: "googleUser", status: "booked", date: "2026-10-10", time: "10:00"
  });
  await setDoc(doc(ctx.firestore(), "bookings/b2"), {
    customerId: "phoneUser", ownerId: "googleUser", status: "booked", date: "2026-10-10", time: "11:00"
  });
});
await check(
  "clients CANNOT create bookings directly (API only)",
  assertFails(addDoc(collection(phoneUser, "bookings"), { customerId: "phoneUser", ownerId: "googleUser", status: "booked" }))
);
await check(
  "customer CAN read own booking",
  assertSucceeds(getDoc(doc(phoneUser, "bookings/b1")))
);
await check(
  "service owner CAN read booking at their service",
  assertSucceeds(getDoc(doc(googleUser, "bookings/b1")))
);
await check(
  "stranger CANNOT read a booking",
  assertFails(getDoc(doc(phoneUser2, "bookings/b1")))
);
await check(
  "customer CANNOT move a booking to another time",
  assertFails(updateDoc(doc(phoneUser, "bookings/b1"), { time: "12:00" }))
);
await check(
  "customer CAN cancel own booking",
  assertSucceeds(updateDoc(doc(phoneUser, "bookings/b1"), { status: "cancelled", cancelledAt: "now" }))
);
await check(
  "cancelled booking CANNOT be reopened",
  assertFails(updateDoc(doc(phoneUser, "bookings/b1"), { status: "booked" }))
);
await check(
  "owner CAN cancel a booking at their service",
  assertSucceeds(updateDoc(doc(googleUser, "bookings/b2"), { status: "cancelled" }))
);

await testEnv.cleanup();

if (failures > 0) {
  console.error(`\n${failures} test(s) failed.`);
  process.exit(1);
}
console.log("\nAll rules tests passed.");
process.exit(0);
