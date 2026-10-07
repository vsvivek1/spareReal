"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

import { getUserProfile } from "@/services/userService";

import { getSellerReviews } from "@/services/reviewService";

import { deleteAccount } from "@/services/authService";

export default function ProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const router = useRouter();

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setDeleteError("");

    try {
      await deleteAccount();
      router.replace("/login");
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Couldn't delete your account. Please try again."
      );
      setDeleting(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      const data = await getUserProfile(user.uid);

      setProfile(data);
      setLoading(false);

      const { average, count } = await getSellerReviews(user.uid);
      setAvgRating(average);
      setReviewCount(count);
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

            {reviewCount > 0 && (
              <div className="gx-rating-summary" style={{ marginBottom: 10 }}>
                ⭐ {avgRating.toFixed(1)}
                <span className="gx-rating-summary-count">
                  ({reviewCount} review{reviewCount === 1 ? "" : "s"})
                </span>
              </div>
            )}

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

          <div className="gx-info-row">
            <span className="gx-info-label">Location</span>
            <span className="gx-info-value">
              {profile?.location
                ? `${profile.location.lat.toFixed(4)}, ${profile.location.lng.toFixed(4)}`
                : "Not set"}
            </span>
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

        <div className="gx-info-card" style={{ marginTop: 32 }}>
          <h2 className="gx-profile-name" style={{ fontSize: 18 }}>
            Delete account
          </h2>

          {deleteError && (
            <div className="gx-alert gx-alert-error">{deleteError}</div>
          )}

          {confirmingDelete ? (
            <>
              <p className="gx-profile-meta">
                This permanently deletes your spareX account and can&apos;t be
                undone. Your profile, spare listings, vehicles, part requests,
                services, sales records, reviews and uploaded photos will be
                removed. Bookings stay visible to the other party with your
                name and phone removed, and upcoming ones are cancelled.
              </p>

              <div className="gx-chip-row" style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="gx-btn gx-btn-danger-outline"
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, delete permanently"}
                </button>

                <button
                  type="button"
                  className="gx-btn gx-btn-secondary"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="gx-profile-meta">
                Permanently remove your account and everything you&apos;ve
                posted on spareX.
              </p>

              <button
                type="button"
                className="gx-btn gx-btn-danger-outline"
                style={{ marginTop: 12 }}
                onClick={() => setConfirmingDelete(true)}
              >
                Delete my account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
