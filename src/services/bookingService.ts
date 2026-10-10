import { auth } from "@/lib/firebase";

export type SlotAvailability = {
  time: string;
  capacity: number;
  booked: number;
  past: boolean;
};

export const getSlotAvailability = async (
  serviceId: string,
  date: string
): Promise<SlotAvailability[]> => {
  const response = await fetch(
    `/api/bookings?serviceId=${encodeURIComponent(serviceId)}&date=${date}`
  );
  const data = await response.json();

  if (!response.ok) throw new Error(data.error || "Couldn't load free slots.");

  return data.slots;
};

export const createBooking = async (booking: {
  serviceId: string;
  date: string;
  time: string;
  vehicle: string;
  note: string;
}) => {
  if (!auth.currentUser) throw new Error("Please log in to book a slot.");

  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(booking),
  });
  const data = await response.json();

  if (!response.ok) throw new Error(data.error || "Couldn't book that slot.");

  return data.id as string;
};

const authHeaders = async () => {
  const token = await auth.currentUser?.getIdToken();

  if (!token) throw new Error("Please log in first.");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// Bookings I made as a customer, and bookings customers made at services I
// own. Loaded through the API (Admin SDK), not straight from Firestore.
export const getAllMyBookings = async (): Promise<{
  mine: any[];
  incoming: any[];
}> => {
  const response = await fetch("/api/bookings/mine", {
    headers: await authHeaders(),
  });
  const data = await response.json();

  if (!response.ok) throw new Error(data.error || "Couldn't load bookings.");

  return data;
};

const updateBooking = async (id: string, action: "cancel" | "complete") => {
  const response = await fetch("/api/bookings/update", {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ id, action }),
  });
  const data = await response.json();

  if (!response.ok) throw new Error(data.error || "Couldn't update booking.");
};

// Either side can cancel a booking that's still open.
export const cancelServiceBooking = (bookingId: string) =>
  updateBooking(bookingId, "cancel");

// The service owner marks the job as done.
export const completeServiceBooking = (bookingId: string) =>
  updateBooking(bookingId, "complete");
