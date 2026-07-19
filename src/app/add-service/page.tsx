"use client";

import { Suspense, useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { addDoc, collection } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

import { getUserProfile } from "@/services/userService";

import { FIELD_HINTS } from "@/lib/helpContent";

import HelpHint from "@/components/HelpHint";

import { SERVICE_TYPES, getServiceType } from "@/lib/serviceTypes";

function AddServiceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const presetSlug = searchParams.get("type") || "workshop";

  const [slug, setSlug] = useState(
    SERVICE_TYPES.some((t) => t.slug === presetSlug) ? presetSlug : "workshop"
  );
  const [customType, setCustomType] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");

  const [district, setDistrict] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isWorkshop = slug === "workshop";
  const isOther = slug === "other";

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const profile = await getUserProfile(user.uid);
      if (profile?.phone) setPhone(profile.phone);
      if (profile?.district) setDistrict(profile.district);
    };

    loadProfile();
  }, [user]);

  const handleUseLocation = () => {
    setLocationError("");

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Location isn't supported on this device.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setLocation({ lat, lng });

        try {
          const response = await fetch(
            `/api/geocode/reverse?lat=${lat}&lon=${lng}`
          );

          const data = await response.json();

          if (response.ok && data.district) {
            setDistrict(data.district);
          }
        } catch (geocodeError) {
          console.log(geocodeError);
        } finally {
          setLocating(false);
        }
      },
      (geoError) => {
        console.log(geoError);
        setLocationError(
          "Couldn't get your location. Check permissions and try again."
        );
        setLocating(false);
      }
    );
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!user) {
      setError("Please log in to list a service.");
      return;
    }

    if (isOther && !customType.trim()) {
      setError("Enter what kind of service this is.");
      return;
    }

    if (!name.trim()) {
      setError("Enter the service name.");
      return;
    }

    if (!phone.trim()) {
      setError("Enter a contact phone number.");
      return;
    }

    if (!location) {
      setError('Tap "Use my current location" so people can find you nearby.');
      return;
    }

    let capacityNum: number | null = null;

    if (isWorkshop) {
      capacityNum = parseInt(vehicleCapacity, 10);

      if (!Number.isFinite(capacityNum) || capacityNum <= 0) {
        setError("Enter how many vehicles you can take in (1 or more).");
        return;
      }
    }

    const typeLabel = isOther
      ? customType.trim()
      : getServiceType(slug).singular;

    try {
      setLoading(true);

      await addDoc(collection(db, "workshops"), {
        name: name.trim(),
        type: typeLabel,
        typeSlug: slug,
        phone: phone.trim(),
        address: address.trim() || null,
        vehicleCapacity: capacityNum,
        district: district || null,
        lat: location.lat,
        lng: location.lng,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
      });

      setSuccess(true);
      router.push(`/services/${slug}`);
    } catch (submitError) {
      console.log(submitError);
      setError("Couldn't save this service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-page-header">
          <h1 className="gx-dash-title">List my service</h1>
          <p className="gx-dash-sub">
            List your workshop, washing/painting center, petrol pump, tyre
            service — or any other service — so people nearby can find you.
          </p>
        </div>

        <div className="gx-form-card">
          {error && <div className="gx-alert gx-alert-error">{error}</div>}
          {success && (
            <div className="gx-alert gx-alert-success">Service listed.</div>
          )}

          <div className="gx-field">
            <label className="gx-label">Service type</label>
            <select
              className="gx-input"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            >
              {SERVICE_TYPES.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.icon} {t.label}
                </option>
              ))}
              <option value="other">🧰 Other (add your own)</option>
            </select>
          </div>

          {isOther && (
            <div className="gx-field">
              <label className="gx-label">What kind of service?</label>
              <input
                className="gx-input"
                placeholder="e.g. Towing, AC repair, Battery service"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
              />
            </div>
          )}

          <div className="gx-field">
            <label className="gx-label">Name</label>
            <input
              className="gx-input"
              placeholder="e.g. Kotaka Auto Works"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">Contact phone</label>
            <input
              className="gx-input"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">Address / landmark (optional)</label>
            <input
              className="gx-input"
              placeholder="e.g. Near KSRTC bus stand, Kotaka"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          {isWorkshop && (
            <div className="gx-field">
              <label className="gx-label">
                How many vehicles can you take in at once?
              </label>
              <input
                className="gx-input"
                placeholder="e.g. 5"
                value={vehicleCapacity}
                onChange={(e) => setVehicleCapacity(e.target.value)}
                inputMode="numeric"
              />
              <HelpHint text={FIELD_HINTS.addWorkshop.vehicleCapacity} />
            </div>
          )}

          <div className="gx-field">
            <label className="gx-label">Location</label>

            <button
              type="button"
              className="gx-btn gx-btn-outline"
              onClick={handleUseLocation}
              disabled={locating}
              style={{ width: "100%" }}
            >
              {locating && <span className="gx-spinner" />}
              {locating
                ? "Getting location..."
                : location
                ? "📍 Location captured — tap to refresh"
                : "📍 Use my current location"}
            </button>

            <HelpHint text={FIELD_HINTS.addWorkshop.location} />

            {locationError && (
              <div
                className="gx-alert gx-alert-error"
                style={{ marginTop: 10 }}
              >
                {locationError}
              </div>
            )}

            {district && (
              <p className="gx-muted" style={{ marginTop: 8 }}>
                📍 {district}
              </p>
            )}
          </div>

          <button
            type="button"
            className="gx-btn gx-btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <span className="gx-spinner" />}
            {loading ? "Saving..." : "Save service"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddServicePage() {
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
      <AddServiceForm />
    </Suspense>
  );
}
