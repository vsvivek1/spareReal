import { NextResponse } from "next/server";
import type { DocumentData, DocumentReference } from "firebase-admin/firestore";

import { adminAuth, adminDb, adminStorage } from "@/lib/firebaseAdmin";
import { isPastSlot } from "@/lib/booking";

// In-app account deletion (Google Play / App Store requirement). Called by the
// website and the mobile app with the signed-in user's Firebase ID token.
//
// What happens to the caller's data:
// - Deleted: their profile (users/{uid}), spare listings, vehicles, part
//   requests, sales records, services (workshops), reviews they wrote and
//   reviews about them, and their uploaded photos in Storage.
// - Anonymized, not deleted: bookings. A booking is shared with the other
//   party (the customer or the service owner), so deleting it would silently
//   erase the other person's record. Instead the deleted user's name, phone,
//   vehicle and note are scrubbed, their uid is cleared, and any upcoming
//   booking is cancelled so the other side sees it won't happen.
// - Finally the Firebase Auth account itself is deleted.
//
// Every step is idempotent, so if something fails part-way the user can just
// try again.

// Collections whose documents belong to one user, keyed by this field.
const OWNED: [collection: string, field: string][] = [
  ["spareListings", "sellerId"],
  ["vehicles", "sellerId"],
  ["spareRequests", "requesterId"],
  ["sales", "sellerId"],
  ["workshops", "ownerId"],
  ["reviews", "raterId"],
  ["reviews", "sellerId"],
];

// Photos are uploaded as <folder>/<uid>_<timestamp>_<i>.jpg (add-spare,
// add-vehicle, and the mobile app's createListing).
const STORAGE_PREFIXES = (uid: string) => [
  `spare-images/${uid}_`,
  `vehicle-images/${uid}_`,
];

const deleteUserData = async (uid: string) => {
  const toDelete = new Map<string, DocumentReference>();
  toDelete.set(`users/${uid}`, adminDb.collection("users").doc(uid));

  for (const [collection, field] of OWNED) {
    const snapshot = await adminDb
      .collection(collection)
      .where(field, "==", uid)
      .get();
    snapshot.docs.forEach((d) => toDelete.set(d.ref.path, d.ref));
  }

  const [asCustomer, asOwner] = await Promise.all([
    adminDb.collection("bookings").where("customerId", "==", uid).get(),
    adminDb.collection("bookings").where("ownerId", "==", uid).get(),
  ]);

  const now = new Date().toISOString();
  const cancelIfUpcoming = (data: DocumentData) =>
    data.status === "booked" &&
    typeof data.date === "string" &&
    typeof data.time === "string" &&
    !isPastSlot(data.date, data.time)
      ? { status: "cancelled", cancelledAt: now }
      : {};

  const writer = adminDb.bulkWriter();
  // BulkWriter.close() doesn't reject when individual writes fail, so collect
  // each write's own promise and fail the request if any of them did.
  const writes: Promise<unknown>[] = [];

  toDelete.forEach((ref) => writes.push(writer.delete(ref)));

  asCustomer.docs.forEach((d) =>
    writes.push(writer.update(d.ref, {
      ...cancelIfUpcoming(d.data()),
      customerId: "",
      customerName: "Deleted user",
      customerPhone: "",
      vehicle: "",
      note: "",
    }))
  );

  asOwner.docs.forEach((d) =>
    writes.push(writer.update(d.ref, {
      ...cancelIfUpcoming(d.data()),
      ownerId: "",
      servicePhone: "",
    }))
  );

  const settled = Promise.allSettled(writes);
  await writer.close();

  const failed = (await settled).find((r) => r.status === "rejected");
  if (failed) throw (failed as PromiseRejectedResult).reason;
};

const deleteUserFiles = async (uid: string) => {
  const bucket = adminStorage.bucket();
  await Promise.all(
    STORAGE_PREFIXES(uid).map((prefix) => bucket.deleteFiles({ prefix }))
  );
};

// POST /api/account/delete (Authorization: Bearer <Firebase ID token>)
export async function POST(request: Request) {
  const header = request.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  // Any signed-in account may delete itself, so this deliberately doesn't use
  // getVerifiedUser (which also requires phone/Google verification).
  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(token, true)).uid;
  } catch {
    return NextResponse.json(
      { error: "Please log in again to delete your account." },
      { status: 401 }
    );
  }

  try {
    await deleteUserData(uid);
    await deleteUserFiles(uid);

    try {
      await adminAuth.deleteUser(uid);
    } catch (error) {
      if ((error as { code?: string })?.code !== "auth/user-not-found") {
        throw error;
      }
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("Account deletion failed:", uid, error);
    return NextResponse.json(
      { error: "Couldn't delete your account. Please try again." },
      { status: 500 }
    );
  }
}
