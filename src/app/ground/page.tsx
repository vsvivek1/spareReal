"use client";

import { useEffect, useState } from "react";

import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";

export default function GroundPage() {
  const [activeTab, setActiveTab] = useState("listings");

  const [listings, setListings] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [district, setDistrict] = useState("");

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

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.vehicle?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = !category || item.category === category;
    const matchesDistrict = !district || item.district === district;

    return matchesSearch && matchesCategory && matchesDistrict;
  });

  const filteredRequests = requests.filter((item) => {
    const matchesSearch =
      item.sparePart?.toLowerCase().includes(search.toLowerCase()) ||
      item.brand?.toLowerCase().includes(search.toLowerCase());

    const matchesDistrict = !district || item.district === district;

    return matchesSearch && matchesDistrict;
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
                    <p className="gx-part-price">₹{item.price}</p>

                    <span className="gx-district-tag">
                      📍 {item.district || "Unknown"}
                    </span>

                    <div style={{ marginTop: 12 }}>
                      <button className="gx-btn gx-btn-outline">
                        View details
                      </button>
                    </div>
                  </div>
                </div>
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
                  <p className="gx-request-budget">₹{item.budget}</p>

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

                  <div style={{ marginTop: 14 }}>
                    <button className="gx-btn gx-btn-outline">
                      Contact requester
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
