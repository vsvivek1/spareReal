import { NextResponse } from "next/server";

import { adminDb } from "@/lib/firebaseAdmin";
import { getVerifiedUser } from "@/lib/apiAuth";
import {
  bookableDates,
  generateSlots,
  isBookableSlug,
  isPastSlot,
  isValidDate,
  isValidTime,
  slotCapacity,
} from "@/lib/booking";

// Bookings are created here rather than straight from the client so the
// per-slot capacity check and the write happen in one transaction (two people
// can't grab the last bay at once), and so availability can be counted
// without exposing other customers' bookings — the `bookings` collection is
// readable only by the customer and the service owner (see firestore.rules).

const loadService = async (serviceId: string) => {
  const snap = await adminDb.collection("workshops").doc(serviceId).get();
  if (!snap.exists) return null;
  return { id: snap.id, ...snap.data() } as Record<string, any>;
};

const activeBookingsQuery = (serviceId: string, date: string) =>
  adminDb
    .collection("bookings")
    .where("serviceId", "==", serviceId)
    .where("date", "==", date)
    .where("status", "==", "booked");

// GET /api/bookings?serviceId=...&date=YYYY-MM-DD → slot availability.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("serviceId") || "";
  const date = searchParams.get("date") || "";

  if (!serviceId || !isValidDate(date)) {
    return NextResponse.json({ error: "Pick a date." }, { status: 400 });
  }

  try {
    const service = await loadService(serviceId);

    if (!service || !isBookableSlug(service.typeSlug || "workshop")) {
      return NextResponse.json(
        { error: "This service doesn't take bookings." },
        { status: 404 }
      );
    }

    const capacity = slotCapacity(service);
    const snapshot = await activeBookingsQuery(serviceId, date).get();

    const counts: Record<string, number> = {};
    snapshot.forEach((doc) => {
      const time = doc.get("time");
      counts[time] = (counts[time] || 0) + 1;
    });

    const slots = generateSlots(service).map((time) => ({
      time,
      capacity,
      booked: counts[time] || 0,
      past: isPastSlot(date, time),
    }));

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Booking availability failed:", error);
    return NextResponse.json(
      { error: "Couldn't load free slots. Please try again." },
      { status: 500 }
    );
  }
}

// POST /api/bookings { serviceId, date, time, vehicle, note } → { id }
export async function POST(request: Request) {
  const caller = await getVerifiedUser(request);

  if (!caller) {
    return NextResponse.json(
      { error: "Please log in to book a slot." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const serviceId = String(body.serviceId || "");
  const date = body.date;
  const time = body.time;
  const vehicle = String(body.vehicle || "").trim().slice(0, 120);
  const note = String(body.note || "").trim().slice(0, 500);

  if (!serviceId || !isValidDate(date) || !isValidTime(time)) {
    return NextResponse.json({ error: "Pick a date and time." }, { status: 400 });
  }

  if (!vehicle) {
    return NextResponse.json(
      { error: "Tell the workshop which vehicle you're bringing." },
      { status: 400 }
    );
  }

  if (!bookableDates().includes(date) || isPastSlot(date, time)) {
    return NextResponse.json(
      { error: "That time is no longer available. Pick another slot." },
      { status: 400 }
    );
  }

  try {
    const service = await loadService(serviceId);

    if (!service || !isBookableSlug(service.typeSlug || "workshop")) {
      return NextResponse.json(
        { error: "This service doesn't take bookings." },
        { status: 404 }
      );
    }

    if (!generateSlots(service).includes(time)) {
      return NextResponse.json(
        { error: "That time is outside opening hours." },
        { status: 400 }
      );
    }

    if (service.ownerId === caller.uid) {
      return NextResponse.json(
        { error: "You can't book your own service." },
        { status: 400 }
      );
    }

    const profileSnap = await adminDb.collection("users").doc(caller.uid).get();
    const profile = (profileSnap.data() || {}) as Record<string, any>;

    const capacity = slotCapacity(service);
    const bookingRef = adminDb.collection("bookings").doc();

    await adminDb.runTransaction(async (tx) => {
      const existing = await tx.get(
        activeBookingsQuery(serviceId, date).where("time", "==", time)
      );

      if (existing.docs.some((d) => d.get("customerId") === caller.uid)) {
        throw new BookingError("You already have this slot booked.");
      }

      if (existing.size >= capacity) {
        throw new BookingError("That slot just filled up. Pick another time.");
      }

      tx.set(bookingRef, {
        serviceId,
        serviceName: service.name || "",
        serviceType: service.type || "Workshop",
        servicePhone: service.phone || "",
        ownerId: service.ownerId || "",
        customerId: caller.uid,
        customerName: profile.name || caller.name || "spareX user",
        customerPhone: profile.phone || caller.phone_number || "",
        date,
        time,
        vehicle,
        note,
        status: "booked",
        createdAt: new Date().toISOString(),
      });
    });

    return NextResponse.json({ id: bookingRef.id });
  } catch (error) {
    if (error instanceof BookingError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("Booking create failed:", error);
    return NextResponse.json(
      { error: "Couldn't book that slot. Please try again." },
      { status: 500 }
    );
  }
}

class BookingError extends Error {}
