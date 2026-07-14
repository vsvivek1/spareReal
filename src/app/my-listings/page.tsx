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

import {
  markListingBooked,
  cancelBooking,
  confirmSale,
} from "@/services/listingService";

import { formatVehicleLabel } from "@/lib/vehicleMakes";

const statusClass: Record<string, string> = {
  Available: "gx-status-available",
  Booked: "gx-status-booked",
  "Sold Out": "gx-status-soldout",
};

export default function MyListingsPage() {
  const { user } = useAuth();

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

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

  const handleMarkBooked = async (id: string) => {
    setActionError("");
    setActionId(id);

    try {
      await markListingBooked(id);
      await loadListings();
    } catch (error) {
      console.log(error);
      setActionError("Couldn't update this listing. Please try again.");
    } finally {
      setActionId(null);
    }
  };

  const handleCancelBooking = async (id: string) => {
    setActionError("");
    setActionId(id);

    try {
      await cancelBooking(id);
      await loadListings();
    } catch (error) {
      console.log(error);
      setActionError("Couldn't update this listing. Please try again.");
    } finally {
      setActionId(null);
    }
  };

  const handleConfirmSale = async (item: any) => {
    setActionError("");

    let soldQuantity = 1;

    if (item.unitType === "Weight") {
      const available = item.quantity ?? 0;

      const input = prompt(
        `How many kg were sold? (${available} kg available)`,
        String(available)
      );

      if (input === null) return;

      soldQuantity = parseFloat(input);

      if (!Number.isFinite(soldQuantity) || soldQuantity <= 0) {
        setActionError("Enter a valid weight in kg.");
        return;
      }

      if (soldQuantity > available) {
        setActionError("You can't sell more than what's in stock.");
        return;
      }
    }

    setActionId(item.id);

    try {
      await confirmSale(
        {
          id: item.id,
          sellerId: item.sellerId,
          title: item.title,
          price: item.price,
          acquisitionCost: item.acquisitionCost,
        },
        soldQuantity
      );
      await loadListings();
    } catch (error) {
      console.log(error);
      setActionError("Couldn't record this sale. Please try again.");
    } finally {
      setActionId(null);
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
              Manage your inventory — stock, bookings, and sales.
            </p>
          </div>

          <Link href="/add-spare">
            <button className="gx-btn gx-btn-primary" style={{ width: "auto" }}>
              + Add Spare
            </button>
          </Link>
        </div>

        {actionError && (
          <div className="gx-alert gx-alert-error">{actionError}</div>
        )}

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
            {listings.map((item) => {
              const status = item.status || "Available";
              const quantity = item.quantity ?? 1;
              const isWeight = item.unitType === "Weight";
              const busy = actionId === item.id;

              return (
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
                      {formatVehicleLabel(item)}
                      {item.category ? ` · ${item.category}` : ""}
                    </p>

                    {item.description && (
                      <p className="gx-part-desc">{item.description}</p>
                    )}

                    <p className="gx-part-price">
                      ₹{item.price}
                      {isWeight ? " / kg" : ""}
                    </p>

                    <div className="gx-stock-row">
                      <span className="gx-stock-qty">
                        {quantity} {isWeight ? "kg" : ""} in stock
                      </span>

                      <span
                        className={
                          "gx-status-badge " +
                          (statusClass[status] || "gx-status-available")
                        }
                      >
                        {status}
                      </span>
                    </div>

                    <div className="gx-part-actions">
                      {status === "Available" && (
                        <button
                          className="gx-btn gx-btn-outline"
                          onClick={() => handleMarkBooked(item.id)}
                          disabled={busy}
                        >
                          {busy ? "..." : "Mark as Booked"}
                        </button>
                      )}

                      {status === "Booked" && (
                        <>
                          <button
                            className="gx-btn gx-btn-primary"
                            onClick={() => handleConfirmSale(item)}
                            disabled={busy}
                          >
                            {busy ? "..." : "Confirm Sale"}
                          </button>

                          <button
                            className="gx-btn gx-btn-outline"
                            onClick={() => handleCancelBooking(item.id)}
                            disabled={busy}
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      <button
                        className="gx-btn gx-btn-danger-outline"
                        onClick={() => handleDelete(item.id)}
                        disabled={busy}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
