"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";

import { getUserProfile } from "@/services/userService";

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

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

  const roles: string[] =
    profile?.roles || (profile?.role ? [profile.role] : []);

  const initial = profile?.name?.trim()?.charAt(0)?.toUpperCase() || "S";

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-page-header">
          <h1 className="gx-dash-title">My Profile</h1>
          <p className="gx-dash-sub">Your account details on spareX.</p>
        </div>

        <div className="gx-profile-header">
          {profile?.profileImage ? (
            <img
              src={profile.profileImage}
              alt={profile?.name || "Profile"}
              className="gx-avatar"
            />
          ) : (
            <div className="gx-avatar">{initial}</div>
          )}

          <div>
            <h2 className="gx-profile-name">{profile?.name || "—"}</h2>
            <p className="gx-profile-meta">{profile?.phone}</p>

            <div className="gx-chip-row">
              {roles.map((role) => (
                <span className="gx-chip" key={role}>
                  {role}
                </span>
              ))}

              <span
                className={
                  "gx-chip" + (profile?.isPremium ? " gx-chip-gold" : "")
                }
              >
                {profile?.isPremium ? "Premium" : "Free plan"}
              </span>
            </div>
          </div>
        </div>

        <div className="gx-info-card">
          <div className="gx-info-row">
            <span className="gx-info-label">Email</span>
            <span className="gx-info-value">{profile?.email || "—"}</span>
          </div>

          <div className="gx-info-row">
            <span className="gx-info-label">District</span>
            <span className="gx-info-value">{profile?.district || "—"}</span>
          </div>

          <div className="gx-info-row">
            <span className="gx-info-label">Place</span>
            <span className="gx-info-value">{profile?.place || "—"}</span>
          </div>
        </div>

        <Link href="/user/edit">
          <button
            className="gx-btn gx-btn-primary"
            style={{ maxWidth: 560 }}
          >
            Edit profile
          </button>
        </Link>
      </div>
    </div>
  );
}
