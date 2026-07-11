import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

export const submitReview = async (review: {
  sellerId: string;
  raterId: string;
  raterName: string;
  rating: number;
  comment: string;
  listingId?: string;
}) => {
  if (review.raterId === review.sellerId) {
    throw new Error("You can't review your own listing.");
  }

  await addDoc(collection(db, "reviews"), {
    ...review,
    createdAt: new Date().toISOString(),
  });
};

// Reviews are a nice-to-have layer on top of the listing — if this
// fails (e.g. rules not yet published, network hiccup) the listing
// itself should still render, just without reviews. Never throw.
export const getSellerReviews = async (sellerId: string) => {
  try {
    const q = query(
      collection(db, "reviews"),
      where("sellerId", "==", sellerId)
    );

    const snapshot = await getDocs(q);

    const reviews: any[] = [];

    snapshot.forEach((doc) => {
      reviews.push({ id: doc.id, ...doc.data() });
    });

    reviews.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

    const average =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
          reviews.length;

    return { reviews, average, count: reviews.length };
  } catch (error) {
    console.log(error);
    return { reviews: [], average: 0, count: 0 };
  }
};
