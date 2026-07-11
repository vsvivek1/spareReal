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

// Finalizes a sale: decrements the listing's remaining quantity by
// soldQuantity (1 unit for piece-sold items; a chosen kg amount for
// weight-sold scrap/bulk lots), flips it to "Sold Out" once stock
// hits zero, and writes a sales record (used by the seller dashboard
// for revenue/profit). Runs as a transaction so a race between two
// "confirm sale" taps can't double-decrement the same stock.
export const confirmSale = async (
  listing: {
    id: string;
    sellerId: string;
    title: string;
    price: number | string;
    acquisitionCost?: number | null;
  },
  soldQuantity: number = 1
) => {
  const listingRef = doc(db, "spareListings", listing.id);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(listingRef);

    if (!snapshot.exists()) {
      throw new Error("This listing no longer exists.");
    }

    const currentQuantity = snapshot.data().quantity ?? 0;
    const remaining = Math.max(currentQuantity - soldQuantity, 0);

    transaction.update(listingRef, {
      quantity: remaining,
      status: remaining > 0 ? "Available" : "Sold Out",
    });

    const unitPrice = Number(listing.price) || 0;
    const hasCost =
      listing.acquisitionCost !== undefined &&
      listing.acquisitionCost !== null;

    const saleRef = doc(collection(db, "sales"));

    transaction.set(saleRef, {
      listingId: listing.id,
      sellerId: listing.sellerId,
      title: listing.title,
      unitPrice,
      quantity: soldQuantity,
      totalAmount: unitPrice * soldQuantity,
      acquisitionCost: hasCost ? listing.acquisitionCost : null,
      totalCost: hasCost ? (listing.acquisitionCost as number) * soldQuantity : null,
      soldAt: new Date().toISOString(),
    });
  });
};
