import {
  collection,
  doc,
  runTransaction,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export const markListingBooked = async (listingId: string) => {
  await updateDoc(doc(db, "spareListings", listingId), {
    status: "Booked",
  });
};

export const cancelBooking = async (listingId: string) => {
  await updateDoc(doc(db, "spareListings", listingId), {
    status: "Available",
  });
};

// Finalizes a sale for one unit: decrements the listing's remaining
// quantity, flips it to "Sold Out" once stock hits zero, and writes a
// sales record (used by the seller dashboard for revenue/profit).
// Runs as a transaction so a race between two "confirm sale" taps
// can't double-decrement the same unit of stock.
export const confirmSale = async (listing: {
  id: string;
  sellerId: string;
  title: string;
  price: number | string;
  acquisitionCost?: number | null;
}) => {
  const listingRef = doc(db, "spareListings", listing.id);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(listingRef);

    if (!snapshot.exists()) {
      throw new Error("This listing no longer exists.");
    }

    const currentQuantity = snapshot.data().quantity ?? 0;
    const remaining = Math.max(currentQuantity - 1, 0);

    transaction.update(listingRef, {
      quantity: remaining,
      status: remaining > 0 ? "Available" : "Sold Out",
    });

    const saleRef = doc(collection(db, "sales"));

    transaction.set(saleRef, {
      listingId: listing.id,
      sellerId: listing.sellerId,
      title: listing.title,
      price: Number(listing.price) || 0,
      acquisitionCost:
        listing.acquisitionCost === undefined
          ? null
          : listing.acquisitionCost,
      quantity: 1,
      soldAt: new Date().toISOString(),
    });
  });
};
