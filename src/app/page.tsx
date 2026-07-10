"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";

import { getUserProfile } from "@/services/userService";

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
    title: "Trusted workshops",
    text: "Book service at rated garages without leaving the app.",
  },
  {
    icon: "⚡",
    title: "Fast connections",
    text: "Message sellers directly and close the deal the same day.",
  },
];

const spareParts = [
  {
    name: "Brake Pad",
    image:
      "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?q=80&w=1200&auto=format&fit=crop",
    vehicle: "Toyota Innova",
    price: 1200,
  },
  {
    name: "Battery",
    image:
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=1200&auto=format&fit=crop",
    vehicle: "Swift",
    price: 4500,
  },
  {
    name: "Engine Oil",
    image:
      "https://images.unsplash.com/photo-1635764706066-8e47cfb8d78b?q=80&w=1200&auto=format&fit=crop",
    vehicle: "Hyundai i20",
    price: 900,
  },
  {
    name: "Headlight",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop",
    vehicle: "Fortuner",
    price: 3200,
  },
  {
    name: "Tyre",
    image:
      "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=1200&auto=format&fit=crop",
    vehicle: "Baleno",
    price: 5800,
  },
  {
    name: "Suspension",
    image:
      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1200&auto=format&fit=crop",
    vehicle: "Honda City",
    price: 7600,
  },
];

const workshops = [
  {
    name: "AutoFix Workshop",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=1200&auto=format&fit=crop",
    rating: "4.5",
  },
  {
    name: "City Garage",
    image:
      "https://images.unsplash.com/photo-1517524206127-48bbd363f3d7?q=80&w=1200&auto=format&fit=crop",
    rating: "4.2",
  },
  {
    name: "Premium Motors",
    image:
      "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?q=80&w=1200&auto=format&fit=crop",
    rating: "4.8",
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

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
            parts and trusted workshops, so you can find the right part, at
            the right price, near you.
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
              <button className="gx-btn gx-btn-primary">
                Create profile
              </button>
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

        <input className="gx-search" placeholder="Search spare parts..." />

        <div className="gx-section-head">
          <h2 className="gx-section-title">Latest spare parts</h2>
          <Link href="/ground" className="gx-section-link">
            View all
          </Link>
        </div>

        <div className="gx-grid">
          {spareParts.map((item, index) => (
            <div className="gx-part-card" key={index}>
              <div className="gx-part-image">
                <img src={item.image} alt={item.name} />
                <span className="gx-badge-pill">Used</span>
              </div>

              <div className="gx-part-body">
                <h3 className="gx-part-name">{item.name}</h3>
                <p className="gx-part-meta">{item.vehicle}</p>
                <p className="gx-part-price">₹{item.price}</p>

                <button className="gx-btn gx-btn-outline">
                  View details
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="gx-section-head">
          <h2 className="gx-section-title">Nearby workshops</h2>
        </div>

        <div className="gx-workshop-row">
          {workshops.map((item, index) => (
            <div className="gx-workshop-card" key={index}>
              <div className="gx-workshop-image">
                <img src={item.image} alt={item.name} />
              </div>

              <div className="gx-workshop-body">
                <h3 className="gx-workshop-name">{item.name}</h3>
                <p className="gx-workshop-loc">Kozhikode</p>
                <div className="gx-rating">⭐ {item.rating}</div>

                <button
                  className="gx-btn gx-btn-outline"
                  style={{ padding: "10px 14px", fontSize: "13.5px" }}
                >
                  View workshop
                </button>
              </div>
            </div>
          ))}
        </div>

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
