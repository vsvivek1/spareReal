import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebaseAdmin";
import { getVerifiedUser } from "@/lib/apiAuth";

// GET /api/bookings/mine → { mine, incoming }
// "mine" are bookings the caller made as a customer; "incoming" are bookings
// customers made at services the caller owns. Read through the Admin SDK so
// the web and mobile apps don't depend on the published firestore.rules.

const sortBySlot = (a: any, b: any) =>
  `${a.date} ${a.time}` < `${b.date} ${b.time}` ? -1 : 1;

const bookingsWhere = async (field: string, uid: string) => {
  const snapshot = await adminDb
    .collection("bookings")
    .where(field, "==", uid)
    .get();

  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as any)
    .sort(sortBySlot);
};

export async function GET(request: Request) {
  const caller = await getVerifiedUser(request);

  if (!caller) {
    return NextResponse.json(
      { error: "Please log in to see your bookings." },
      { status: 401 }
    );
  }

  try {
    const [mine, incoming] = await Promise.all([
      bookingsWhere("customerId", caller.uid),
      bookingsWhere("ownerId", caller.uid),
    ]);

    return NextResponse.json({ mine, incoming });
  } catch (error) {
    console.error("Booking list failed:", error);
    return NextResponse.json(
      { error: "Couldn't load your bookings. Please try again." },
      { status: 500 }
    );
  }
}
