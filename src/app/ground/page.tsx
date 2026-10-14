"use client";

import { useEffect, useState } from "react";


import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { VEHICLE_MAKES } from "@/lib/vehicleMakes";

import { whatsAppLink } from "@/lib/contact";
import { formatPrice, matchesSearch } from "@/lib/format";
import PartCard from "@/components/PartCard";

export default function GroundPage() {
  const [activeTab, setActiveTab] = useState("listings");

  const [listings, setListings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
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
    const loadData = async () => {
      try {
        const listingSnapshot = await getDocs(
          collection(db, "spareListings")
        );

        const listingItems: any[] = [];

        listingSnapshot.forEach((doc) => {
          listingItems.push({ id: doc.id, ...doc.data() });
        });

        setListings(listingItems);

        const requestSnapshot = await getDocs(
          collection(db, "spareRequests")
        );

        const requestItems: any[] = [];

        requestSnapshot.forEach((doc) => {
          requestItems.push({ id: doc.id, ...doc.data() });
        });

        setRequests(requestItems);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredListings = listings
    .filter((item) => {
      const isAvailable = (item.status || "Available") === "Available";

      const matchesQuery = matchesSearch(search, [
        item.title,
        item.make,
        item.model,
        item.year,
        item.vehicle,
        item.partNumber,
      ]);

      const matchesCategory = !category || item.category === category;
      const matchesDistrict = !district || item.district === district;
      const matchesMake = !make || item.make === make;
      const matchesYear = !year || String(item.year) === year;

      const price = Number(item.price);
      const matchesMinPrice = !minPrice || price >= Number(minPrice);
      const matchesMaxPrice = !maxPrice || price <= Number(maxPrice);

      return (
        isAvailable &&
        matchesQuery &&
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

  const filteredRequests = requests.filter((item) => {
    const matchesQuery = matchesSearch(search, [
      item.sparePart,
      item.brand,
      item.vehicle,
    ]);

    const matchesDistrict = !district || item.district === district;

    return matchesQuery && matchesDistrict;
  });

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
        <div className="gx-page-header">
          <h1 className="gx-dash-title">Ground</h1>
          <p className="gx-dash-sub">
            Every listing and request from the community, in one feed.
          </p>
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

        <div className="gx-tabs" style={{ maxWidth: 360 }}>
          <button
            type="button"
            className={
              "gx-tab" + (activeTab === "listings" ? " gx-tab-active" : "")
            }
            onClick={() => setActiveTab("listings")}
          >
            Listings
          </button>

          <button
            type="button"
            className={
              "gx-tab" +
              (activeTab === "requirements" ? " gx-tab-active" : "")
            }
            onClick={() => setActiveTab("requirements")}
          >
            Requirements
          </button>
        </div>

        {activeTab === "listings" &&
          (filteredListings.length === 0 ? (
            <div className="gx-empty-state">
              <div className="gx-empty-state-icon">📦</div>
              <h2 className="gx-empty-state-title">No listings found</h2>
              <p className="gx-empty-state-text">
                Try a different search or filter.
              </p>
            </div>
          ) : (
            <div className="gx-grid">
              {filteredListings.map((item) => (
                <PartCard key={item.id} item={item} />
              ))}
            </div>
          ))}

        {activeTab === "requirements" &&
          (filteredRequests.length === 0 ? (
            <div className="gx-empty-state">
              <div className="gx-empty-state-icon">🔍</div>
              <h2 className="gx-empty-state-title">No requests found</h2>
              <p className="gx-empty-state-text">
                Try a different search or filter.
              </p>
            </div>
          ) : (
            <div className="gx-grid">
              {filteredRequests.map((item) => (
                <div className="gx-request-card" key={item.id}>
                  <h3 className="gx-request-title">{item.sparePart}</h3>
                  <p className="gx-part-meta" style={{ marginBottom: 10 }}>
                    {item.brand} {item.model}
                  </p>
                  <p className="gx-request-budget">{formatPrice(item.budget)}</p>

                  <div className="gx-request-meta-row">
                    <span className="gx-request-meta-label">Year</span>
                    <span className="gx-request-meta-value">
                      {item.year}
                    </span>
                  </div>

                  <div className="gx-request-meta-row">
                    <span className="gx-request-meta-label">Condition</span>
                    <span className="gx-request-meta-value">
                      {item.condition}
                    </span>
                  </div>

                  <div className="gx-request-meta-row">
                    <span className="gx-request-meta-label">District</span>
                    <span className="gx-request-meta-value">
                      {item.district || "Unknown"}
                    </span>
                  </div>

                  {item.description && (
                    <p className="gx-request-desc">{item.description}</p>
                  )}

                  {item.requesterPhone && (
                    <div className="gx-detail-actions" style={{ marginTop: 14 }}>
                      <a
                        href={`tel:${item.requesterPhone}`}
                        className="gx-btn gx-btn-outline"
                      >
                        📞 Call
                      </a>

                      <a
                        href={whatsAppLink(
                          item.requesterPhone,
                          `Hi, I saw your spareX request for ${item.sparePart}. I might have it.`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gx-btn gx-btn-outline"
                      >
                        💬 WhatsApp
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
