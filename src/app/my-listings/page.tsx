"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

export default function MyListingsPage() {
  const { user } = useAuth();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadListings = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "spareListings"),
        where("sellerId", "==", user.uid)
      );

      const snapshot = await getDocs(q);

      const items: any[] = [];

      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });

      setListings(items);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, [user]);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this listing?");

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "spareListings", id));
      loadListings();
    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="gx-page">
        <div className="gx-page-center">
          <span className="gx-spinner" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-page-header-row">
          <div>
            <h1 className="gx-dash-title">My Listings</h1>
            <p className="gx-dash-sub">
              Spare parts you&apos;ve listed for sale.
            </p>
          </div>

          <Link href="/add-spare">
            <button className="gx-btn gx-btn-primary" style={{ width: "auto" }}>
              + Add Spare
            </button>
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="gx-empty-state">
            <div className="gx-empty-state-icon">📦</div>
            <h2 className="gx-empty-state-title">No listings yet</h2>
            <p className="gx-empty-state-text">
              List your first spare part to start reaching buyers.
            </p>

            <Link href="/add-spare">
              <button
                className="gx-btn gx-btn-primary"
                style={{ width: "auto", margin: "0 auto" }}
              >
                + Add Spare
              </button>
            </Link>
          </div>
        ) : (
          <div className="gx-grid">
            {listings.map((item) => (
              <div className="gx-part-card" key={item.id}>
                <div className="gx-part-image">
                  <img src={item.imageUrl} alt={item.title} />
                  {item.condition && (
                    <span className="gx-badge-pill">{item.condition}</span>
                  )}
                </div>

                <div className="gx-part-body">
                  <h3 className="gx-part-name">{item.title}</h3>
                  <p className="gx-part-meta">
                    {item.vehicle}
                    {item.category ? ` · ${item.category}` : ""}
                  </p>

                  {item.description && (
                    <p className="gx-part-desc">{item.description}</p>
                  )}

                  <p className="gx-part-price">₹{item.price}</p>

                  <div className="gx-part-actions">
                    <button className="gx-btn gx-btn-outline">Edit</button>

                    <button
                      className="gx-btn gx-btn-danger-outline"
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
