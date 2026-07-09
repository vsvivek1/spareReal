"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";

import { getUserProfile } from "@/services/userService";

export default function SubscriptionPage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      const data = await getUserProfile(user.uid);

      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, [user]);

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

  const isPremium = Boolean(profile?.isPremium);

  return (
    <div className="gx-page">
      <div className="gx-status-wrap">
        <div className="gx-status-card">
          <div
            className={
              "gx-status-icon " +
              (isPremium ? "gx-status-icon-success" : "gx-status-icon-neutral")
            }
          >
            {isPremium ? "⭐" : "🆓"}
          </div>

          <h1 className="gx-title">
            {isPremium ? "You're on Premium" : "You're on the Free plan"}
          </h1>

          <p className="gx-subtitle">
            {isPremium
              ? "Enjoy unlimited listings, direct contact access, and featured visibility."
              : "Upgrade any time to unlock unlimited listings and priority visibility."}
          </p>

          <div className="gx-chip-row" style={{ justifyContent: "center", marginBottom: 24 }}>
            <span className={"gx-chip" + (isPremium ? " gx-chip-gold" : "")}>
              {isPremium ? "Premium" : "Free plan"}
            </span>
          </div>

          <Link href="/pricing">
            <button className="gx-btn gx-btn-primary">
              {isPremium ? "Manage plan" : "Upgrade to Premium"}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
