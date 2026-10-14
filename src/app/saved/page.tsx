"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";

import PartCard from "@/components/PartCard";

import { useSavedListings } from "@/lib/prefs";

import { getSellerRatings, type SellerRating } from "@/services/reviewService";

export default function SavedPage() {
  const { savedIds } = useSavedListings();

  const [items, setItems] = useState<any[]>([]);
  const [ratings, setRatings] = useState<Record<string, SellerRating>>({});
  const [loading, setLoading] = useState(true);

  // Load each saved listing once; removing a heart just hides it.
  const key = savedIds.join(",");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const ids = key ? key.split(",") : [];

      const snaps = await Promise.all(
        ids.map((id) => getDoc(doc(db, "spareListings", id)).catch(() => null))
      );

      if (cancelled) return;

      setItems(
        snaps
          .filter((s): s is NonNullable<typeof s> => !!s && s.exists())
          .map((s) => ({ id: s.id, ...s.data() }))
      );
      setLoading(false);
    };

    load();
    getSellerRatings().then((r) => !cancelled && setRatings(r));

    return () => {
      cancelled = true;
    };
  }, [key]);

  const visible = items.filter((item) => savedIds.includes(item.id));

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-page-header">
          <h1 className="gx-dash-title">Saved parts</h1>
          <p className="gx-dash-sub">
            Parts you hearted, kept on this device.
          </p>
        </div>

        {loading && savedIds.length > 0 ? (
          <div className="gx-page-center">
            <span className="gx-spinner" />
            Loading...
          </div>
        ) : visible.length === 0 ? (
          <div className="gx-empty-state">
            <div className="gx-empty-state-icon">♡</div>
            <h2 className="gx-empty-state-title">Nothing saved yet</h2>
            <p className="gx-empty-state-text">
              Tap the heart on any part to keep it here.
            </p>
            <Link href="/spare-parts">
              <button
                className="gx-btn gx-btn-primary"
                style={{ width: "auto", margin: "0 auto" }}
              >
                Browse parts
              </button>
            </Link>
          </div>
        ) : (
          <div className="gx-grid">
            {visible.map((item) => (
              <PartCard
                key={item.id}
                item={item}
                rating={ratings[item.sellerId]}
                badge={
                  (item.status || "Available") !== "Available"
                    ? item.status
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
