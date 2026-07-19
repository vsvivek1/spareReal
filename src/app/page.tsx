"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { collection, getDocs } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

import { getUserProfile } from "@/services/userService";

import { getServicesByType } from "@/services/workshopService";

import { formatVehicleLabel } from "@/lib/vehicleMakes";

const features = [
  {
    icon: "🔧",
    title: "Verified spare parts",
    text: "Every listing is checked for condition and fit before it goes live.",
  },
  {
    icon: "🏷️",
    title: "Fair, transparent pricing",
    text: "Compare parts across sellers and pick the best deal near you.",
  },
  {
    icon: "🛠️",
    title: "Trusted services",
    text: "Find rated workshops, washing, painting, tyre service and more.",
  },
  {
    icon: "⚡",
    title: "Fast connections",
    text: "Message sellers directly and close the deal the same day.",
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  const [listings, setListings] = useState<any[]>([]);
  const [nearbyWorkshops, setNearbyWorkshops] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setCheckingProfile(false);
        return;
      }

      const data = await getUserProfile(user.uid);

      setProfile(data);
      setCheckingProfile(false);
    };

    if (!loading) {
      loadProfile();
    }
  }, [user, loading]);

  // Real listings + nearby services for the logged-in home feed.
  useEffect(() => {
    const loadFeed = async () => {
      try {
        const snapshot = await getDocs(collection(db, "spareListings"));

        const items: any[] = [];
        snapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));

        setListings(items);
      } catch (error) {
        console.log(error);
      }

      try {
        setNearbyWorkshops((await getServicesByType("workshop")).slice(0, 3));
      } catch (error) {
        console.log(error);
      }
    };

    if (user) loadFeed();
  }, [user]);

  const newListings = listings
    .filter((item) => {
      const isAvailable = (item.status || "Available") === "Available";

      const haystack = [
        item.title,
        item.make,
        item.model,
        item.year,
        item.vehicle,
        item.partNumber,
        item.category,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return isAvailable && haystack.includes(search.toLowerCase());
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    )
    .slice(0, 8);

  if (loading || checkingProfile) {
    return (
      <div className="gx-page">
        <div className="gx-page-center">
          <span className="gx-spinner" />
          {loading ? "Loading..." : "Checking your profile..."}
        </div>
      </div>
    );
  }

  // Not logged in — marketing hero
  if (!user) {
    return (
      <div className="gx-page">
        <div className="gx-hero">
          <div className="gx-hero-eyebrow">Second-hand spare marketplace</div>

          <h1 className="gx-hero-title">
            Quality used spare parts,
            <br />
            <span className="gx-accent">without the runaround.</span>
          </h1>

          <p className="gx-hero-subtitle">
            spareX connects you with verified sellers of second-hand vehicle
            parts and trusted services, so you can find the right part, at the
            right price, near you.
          </p>

          <div className="gx-hero-actions">
            <Link href="/login">
              <button className="gx-btn gx-btn-primary gx-btn-lg">
                Get started
              </button>
            </Link>

            <Link href="/ground">
              <button className="gx-btn gx-btn-outline gx-btn-lg">
                Browse spare parts
              </button>
            </Link>
          </div>
        </div>

        <div className="gx-feature-grid">
          {features.map((feature) => (
            <div className="gx-feature-card" key={feature.title}>
              <div className="gx-feature-icon">{feature.icon}</div>
              <h3 className="gx-feature-title">{feature.title}</h3>
              <p className="gx-feature-text">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Logged in but no profile yet
  if (!profile) {
    return (
      <div className="gx-page">
        <div className="gx-empty-wrap">
          <div className="gx-card" style={{ textAlign: "center" }}>
            <div className="gx-badge" style={{ margin: "0 auto 18px" }}>
              S
            </div>

            <h1 className="gx-title">Complete your registration</h1>

            <p className="gx-subtitle">
              Create your profile to start browsing and listing spare parts.
            </p>

            <Link href="/user/register">
              <button className="gx-btn gx-btn-primary">Create profile</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-dash-header">
          <div>
            <h1 className="gx-dash-title">Welcome back, {profile.name}</h1>
            <p className="gx-dash-sub">
              Here&apos;s what&apos;s new on spareX today.
            </p>
          </div>

          <div className="gx-chip-group">
            <div className="gx-chip-row">
              <span className="gx-chip-label">Registered as</span>
              {(profile.roles || (profile.role ? [profile.role] : [])).map(
                (role: string) => (
                  <span className="gx-chip" key={role}>
                    ✓ {role}
                  </span>
                )
              )}
            </div>

            <div className="gx-chip-row">
              <span
                className={
                  "gx-chip" + (profile.isPremium ? " gx-chip-gold" : "")
                }
              >
                {profile.isPremium ? "Premium" : "Free plan"}
              </span>
            </div>
          </div>
        </div>

        <input
          className="gx-search"
          placeholder="Search spare parts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="gx-section-head">
          <h2 className="gx-section-title">New listings</h2>
          <Link href="/ground" className="gx-section-link">
            View all
          </Link>
        </div>

        {newListings.length === 0 ? (
          <div className="gx-empty-state">
            <div className="gx-empty-state-icon">📦</div>
            <h2 className="gx-empty-state-title">
              {search ? "No matching listings" : "No listings yet"}
            </h2>
            <p className="gx-empty-state-text">
              {search
                ? "Try a different search."
                : "Be the first to list a spare part."}
            </p>
          </div>
        ) : (
          <div className="gx-grid">
            {newListings.map((item) => (
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

        <div className="gx-section-head">
          <h2 className="gx-section-title">Nearby workshops</h2>
          <Link href="/services" className="gx-section-link">
            All services
          </Link>
        </div>

        {nearbyWorkshops.length === 0 ? (
          <div className="gx-empty-state">
            <div className="gx-empty-state-icon">🔧</div>
            <h2 className="gx-empty-state-title">No workshops listed yet</h2>
            <p className="gx-empty-state-text">
              <Link href="/add-service?type=workshop" className="gx-section-link">
                List your workshop
              </Link>{" "}
              to be the first.
            </p>
          </div>
        ) : (
          <div className="gx-workshop-row">
            {nearbyWorkshops.map((item) => (
              <div className="gx-workshop-card" key={item.id}>
                <div className="gx-workshop-body">
                  <h3 className="gx-workshop-name">{item.name}</h3>
                  <p className="gx-workshop-loc">
                    📍 {item.district || "Unknown"}
                  </p>

                  <Link href="/services/workshop">
                    <button
                      className="gx-btn gx-btn-outline"
                      style={{ padding: "10px 14px", fontSize: "13.5px" }}
                    >
                      View workshop
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!profile.isPremium && (
          <div className="gx-premium-banner">
            <div>
              <h2 className="gx-section-title" style={{ marginBottom: 14 }}>
                Upgrade to Premium
              </h2>

              <ul className="gx-premium-list">
                <li>✓ Direct contact access</li>
                <li>✓ Unlimited photos</li>
                <li>✓ Featured listings</li>
                <li>✓ Priority visibility</li>
              </ul>
            </div>

            <Link href="/pricing">
              <button className="gx-btn gx-btn-primary gx-btn-lg">
                Upgrade now
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
