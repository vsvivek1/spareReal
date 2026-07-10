"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

import { getUserProfile, updateUserProfile } from "@/services/userService";

export default function EditPage() {
  const router = useRouter();

  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [place, setPlace] = useState("");

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [roles, setRoles] = useState<string[]>(["Buyer"]);

  const toggleRole = (option: string) => {
    setRoles((prev) =>
      prev.includes(option)
        ? prev.filter((item) => item !== option)
        : [...prev, option]
    );
  };

  const handleUseLocation = () => {
    setLocationError("");

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Location isn't supported on this device.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
      },
      (geoError) => {
        setLocationError(
          geoError.code === geoError.PERMISSION_DENIED
            ? "Location permission denied."
            : "Couldn't get your location. Please try again."
        );
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      const data = await getUserProfile(user.uid);

      if (data) {
        setName(data.name || "");
        setPhone(data.phone || "");
        setEmail(data.email || "");
        setDistrict(data.district || "");
        setPlace(data.place || "");
        setLocation(data.location || null);
        setRoles(data.roles || (data.role ? [data.role] : ["Buyer"]));
      }

      setLoading(false);
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    try {
      if (!user) return;

      setSaving(true);

      await updateUserProfile(user.uid, {
        name,
        phone,
        email,
        district,
        place,
        location,
        roles,
      });

      router.push("/user/profile");
    } catch (error) {
      console.log(error);
    } finally {
      setSaving(false);
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
        <div className="gx-page-header">
          <h1 className="gx-dash-title">Edit Profile</h1>
          <p className="gx-dash-sub">Keep your details up to date.</p>
        </div>

        <div className="gx-form-card">
          <div className="gx-field">
            <label className="gx-label">Name</label>
            <input
              className="gx-input"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">Phone</label>
            <input className="gx-input" value={phone} disabled />
          </div>

          <div className="gx-field">
            <label className="gx-label">Email</label>
            <input
              className="gx-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">District</label>
            <input
              className="gx-input"
              placeholder="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">Place</label>
            <input
              className="gx-input"
              placeholder="Place"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">Location</label>

            <button
              type="button"
              className="gx-btn gx-btn-outline"
              onClick={handleUseLocation}
              disabled={locating}
            >
              {locating && <span className="gx-spinner" />}
              {locating
                ? "Getting location..."
                : location
                ? "📍 Location saved — tap to refresh"
                : "📍 Use my current location"}
            </button>

            {location && (
              <p className="gx-location-hint">
                Saved: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </p>
            )}

            {locationError && (
              <p className="gx-location-hint gx-location-hint-error">
                {locationError}
              </p>
            )}
          </div>

          <div className="gx-field">
            <label className="gx-label">
              Registered as (select all that apply)
            </label>

            <div className="gx-role-group">
              {["Buyer", "Seller", "Workshop", "Wholesale Dealer"].map((option) => (
                <button
                  key={option}
                  type="button"
                  className={
                    "gx-role-option" +
                    (roles.includes(option) ? " gx-role-option-active" : "")
                  }
                  onClick={() => toggleRole(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="gx-form-actions">
            <button
              type="button"
              className="gx-btn gx-btn-outline"
              onClick={() => router.push("/user/profile")}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="button"
              className="gx-btn gx-btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving && <span className="gx-spinner" />}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
