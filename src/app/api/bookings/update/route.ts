import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebaseAdmin";
import { getVerifiedUser } from "@/lib/apiAuth";

// POST /api/bookings/update { id, action } → { status }
// action "cancel": the customer or the service owner cancels a booking.
// action "complete": the service owner marks the job as done.
// Only bookings that are still "booked" can change.
export async function POST(request: Request) {
  const caller = await getVerifiedUser(request);

  if (!caller) {
    return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  const action = body.action;

  if (!id || (action !== "cancel" && action !== "complete")) {
    return NextResponse.json({ error: "Unknown booking action." }, { status: 400 });
  }

  const ref = adminDb.collection("bookings").doc(id);

  try {
    const status = await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const booking = snap.data();

      const isCustomer = booking?.customerId === caller.uid;
      const isOwner = !!booking?.ownerId && booking.ownerId === caller.uid;

      if (!booking || !(isCustomer || isOwner)) {
        throw new UpdateError("Booking not found.", 404);
      }

      if (action === "complete" && !isOwner) {
        throw new UpdateError("Only the workshop can mark a booking done.", 403);
      }

      if (booking.status !== "booked") {
        throw new UpdateError("This booking was already closed.", 409);
      }

      const now = new Date().toISOString();

      if (action === "cancel") {
        tx.update(ref, {
          status: "cancelled",
          cancelledAt: now,
          cancelledBy: isOwner ? "owner" : "customer",
        });
        return "cancelled";
      }

      tx.update(ref, { status: "completed", completedAt: now });
      return "completed";
    });

    return NextResponse.json({ status });
  } catch (error) {
    if (error instanceof UpdateError) {
      return NextResponse.json({ error: error.message }, { status: error.code });
    }

    console.error("Booking update failed:", error);
    return NextResponse.json(
      { error: "Couldn't update this booking. Please try again." },
      { status: 500 }
    );
  }
}

class UpdateError extends Error {
  constructor(
    message: string,
    public code: number
  ) {
    super(message);
  }
}
