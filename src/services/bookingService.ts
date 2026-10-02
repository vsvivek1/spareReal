import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

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
  const token = await auth.currentUser?.getIdToken();

  if (!token) throw new Error("Please log in to book a slot.");

  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(booking),
  });
  const data = await response.json();

  if (!response.ok) throw new Error(data.error || "Couldn't book that slot.");

  return data.id as string;
};

const sortBySlot = (a: any, b: any) =>
  `${a.date} ${a.time}` < `${b.date} ${b.time}` ? -1 : 1;

const fetchWhere = async (field: string, uid: string) => {
  const snapshot = await getDocs(
    query(collection(db, "bookings"), where(field, "==", uid))
  );

  return snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as any)
    .sort(sortBySlot);
};

// Bookings I made as a customer.
export const getMyBookings = (uid: string) => fetchWhere("customerId", uid);

// Bookings customers made at services I own.
export const getBookingsForMyServices = (uid: string) =>
  fetchWhere("ownerId", uid);

// Either side can cancel; the rules only allow flipping status to "cancelled".
export const cancelServiceBooking = async (bookingId: string) => {
  await updateDoc(doc(db, "bookings", bookingId), {
    status: "cancelled",
    cancelledAt: new Date().toISOString(),
  });
};
