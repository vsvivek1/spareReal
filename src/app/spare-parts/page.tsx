"use client";

import { Suspense, useEffect, useState } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

import { VEHICLE_MAKES, formatVehicleLabel } from "@/lib/vehicleMakes";

function SparePartsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [tab, setTab] = useState<"buy" | "sell">(
    searchParams.get("tab") === "sell" ? "sell" : "buy"
  );

  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");
  const [make, setMake] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [year, setYear] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "priceLow" | "priceHigh">(
    "newest"
  );

  useEffect(() => {
    const load = async () => {
      try {
        const snapshot = await getDocs(collection(db, "spareListings"));

        const items: any[] = [];
        snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));

        setListings(items);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const changeTab = (next: "buy" | "sell") => {
    setTab(next);
    router.replace(`/spare-parts?tab=${next}`);
  };

  const buyListings = listings
    .filter((item) => {
      const isAvailable = (item.status || "Available") === "Available";

      const haystack = [
        item.title,
        item.make,
        item.model,
        item.year,
        item.vehicle,
        item.partNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesCategory = !category || item.category === category;
      const matchesDistrict = !district || item.district === district;
      const matchesMake = !make || item.make === make;
      const matchesYear = !year || String(item.year) === year;

      const price = Number(item.price);
      const matchesMinPrice = !minPrice || price >= Number(minPrice);
      const matchesMaxPrice = !maxPrice || price <= Number(maxPrice);

      return (
        isAvailable &&
        matchesSearch &&
        matchesCategory &&
        matchesDistrict &&
        matchesMake &&
        matchesYear &&
        matchesMinPrice &&
        matchesMaxPrice
      );
    })
    .sort((a, b) => {
      if (sortBy === "priceLow") return Number(a.price) - Number(b.price);
      if (sortBy === "priceHigh") return Number(b.price) - Number(a.price);
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

  const myListings = user
    ? listings
        .filter((item) => item.sellerId === user.uid)
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        )
    : [];

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-page-header">
          <h1 className="gx-dash-title">Spare parts</h1>
          <p className="gx-dash-sub">
            Buy second-hand parts from sellers near you, or list your own.
          </p>
        </div>

        <div className="gx-tabs" style={{ maxWidth: 360 }}>
          <button
            type="button"
            className={"gx-tab" + (tab === "buy" ? " gx-tab-active" : "")}
            onClick={() => changeTab("buy")}
          >
            Buy
          </button>

          <button
            type="button"
            className={"gx-tab" + (tab === "sell" ? " gx-tab-active" : "")}
            onClick={() => changeTab("sell")}
          >
            Sell
          </button>
        </div>

        {tab === "buy" && (
          <>
            <div
              className="gx-premium-banner"
              style={{ marginBottom: 18, padding: "16px 18px" }}
            >
              <p className="gx-dash-sub" style={{ margin: 0 }}>
                Can&apos;t find the part you need?
              </p>
              <Link href="/make-request">
                <button className="gx-btn gx-btn-outline" style={{ width: "auto" }}>
                  Post a request
                </button>
              </Link>
            </div>

            <div className="gx-filter-bar">
              <input
                className="gx-input"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                className="gx-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                <option>Engine</option>
                <option>Brake</option>
                <option>Electrical</option>
                <option>Tyre</option>
                <option>Suspension</option>
                <option>Body Parts</option>
                <option>Lighting</option>
                <option>Battery</option>
                <option>Accessories</option>
                <option>Scrap – Aluminum</option>
                <option>Scrap – Copper</option>
                <option>Scrap – Steel</option>
                <option>Scrap – Mixed Metal</option>
                <option>Scrap – Other</option>
              </select>

              <select
                className="gx-input"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="">All Districts</option>
                <option>Kozhikode</option>
                <option>Malappuram</option>
                <option>Kannur</option>
                <option>Wayanad</option>
                <option>Ernakulam</option>
                <option>Trivandrum</option>
              </select>

              <select
                className="gx-input"
                value={make}
                onChange={(e) => setMake(e.target.value)}
              >
                <option value="">All Makes</option>
                {VEHICLE_MAKES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>

              <input
                className="gx-input"
                placeholder="Year"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                inputMode="numeric"
              />

              <input
                className="gx-input"
                placeholder="Min price (₹)"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                inputMode="numeric"
              />

              <input
                className="gx-input"
                placeholder="Max price (₹)"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                inputMode="numeric"
              />

              <select
                className="gx-input"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              >
                <option value="newest">Newest first</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>

            {loading ? (
              <div className="gx-page-center">
                <span className="gx-spinner" />
                Loading...
              </div>
            ) : buyListings.length === 0 ? (
              <div className="gx-empty-state">
                <div className="gx-empty-state-icon">📦</div>
                <h2 className="gx-empty-state-title">No listings found</h2>
                <p className="gx-empty-state-text">
                  Try a different search or filter.
                </p>
              </div>
            ) : (
              <div className="gx-grid">
                {buyListings.map((item) => (
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
                      <p className="gx-part-price">
                        ₹{item.price}
                        {item.unitType === "Weight" ? " / kg" : ""}
                      </p>
                      {item.unitType === "Weight" && (
                        <p
                          className="gx-part-meta"
                          style={{ margin: "0 0 8px" }}
                        >
                          {item.quantity} kg available
                        </p>
                      )}

                      <span className="gx-district-tag">
                        📍 {item.district || "Unknown"}
                      </span>

                      <div style={{ marginTop: 12 }}>
                        <Link href={`/listing/${item.id}`}>
                          <button className="gx-btn gx-btn-outline">
                            View details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "sell" && (
          <>
            <div className="gx-premium-banner" style={{ marginBottom: 18 }}>
              <div>
                <h2 className="gx-section-title" style={{ marginBottom: 6 }}>
                  Have a part to sell?
                </h2>
                <p className="gx-dash-sub" style={{ margin: 0 }}>
                  List it in a minute — add photos, price and vehicle details.
                </p>
              </div>

              <Link href="/add-spare">
                <button className="gx-btn gx-btn-primary gx-btn-lg">
                  + List a spare part
                </button>
              </Link>
            </div>

            <div className="gx-section-head">
              <h2 className="gx-section-title">Your listings</h2>
              {myListings.length > 0 && (
                <Link
                  href="/my-account?tab=listings"
                  className="gx-section-link"
                >
                  Manage all
                </Link>
              )}
            </div>

            {loading ? (
              <div className="gx-page-center">
                <span className="gx-spinner" />
                Loading...
              </div>
            ) : !user ? (
              <div className="gx-empty-state">
                <div className="gx-empty-state-icon">🔑</div>
                <h2 className="gx-empty-state-title">Log in to sell</h2>
                <p className="gx-empty-state-text">
                  <Link href="/login" className="gx-section-link">
                    Log in
                  </Link>{" "}
                  to list parts and manage your listings.
                </p>
              </div>
            ) : myListings.length === 0 ? (
              <div className="gx-empty-state">
                <div className="gx-empty-state-icon">🏷️</div>
                <h2 className="gx-empty-state-title">No listings yet</h2>
                <p className="gx-empty-state-text">
                  Your listed parts will show up here.
                </p>
              </div>
            ) : (
              <div className="gx-grid">
                {myListings.map((item) => (
                  <div className="gx-part-card" key={item.id}>
                    <div className="gx-part-image">
                      <img src={item.imageUrl} alt={item.title} />
                      <span className="gx-badge-pill">
                        {item.status || "Available"}
                      </span>
                    </div>

                    <div className="gx-part-body">
                      <h3 className="gx-part-name">{item.title}</h3>
                      <p className="gx-part-meta">
                        {formatVehicleLabel(item)}
                        {item.category ? ` · ${item.category}` : ""}
                      </p>
                      <p className="gx-part-price">
                        ₹{item.price}
                        {item.unitType === "Weight" ? " / kg" : ""}
                      </p>

                      <div style={{ marginTop: 12 }}>
                        <Link href={`/listing/${item.id}`}>
                          <button className="gx-btn gx-btn-outline">
                            View
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SparePartsPage() {
  return (
    <Suspense
      fallback={
        <div className="gx-page">
          <div className="gx-page-center">
            <span className="gx-spinner" />
            Loading...
          </div>
        </div>
      }
    >
      <SparePartsInner />
    </Suspense>
  );
}
