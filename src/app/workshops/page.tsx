"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import dynamic from "next/dynamic";

import { useAuth } from "@/contexts/AuthContext";

import { getAllWorkshops, deleteWorkshop } from "@/services/workshopService";

import { distanceKm } from "@/lib/geo";

import { whatsAppLink } from "@/lib/contact";

const WorkshopsMap = dynamic(() => import("@/components/WorkshopsMap"), {
  ssr: false,
});

export default function WorkshopsPage() {
  const { user } = useAuth();

  const [workshops, setWorkshops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [actionId, setActionId] = useState<string | null>(null);

  const loadWorkshops = async () => {
    try {
      setWorkshops(await getAllWorkshops());
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkshops();
  }, []);

  const handleFindNearMe = () => {
    setLocationError("");

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Location isn't supported on this device.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocating(false);
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

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Remove this workshop listing?");

    if (!confirmDelete) return;

    setActionId(id);

    try {
      await deleteWorkshop(id);
      await loadWorkshops();
    } catch (error) {
      console.log(error);
      alert("Couldn't remove this workshop. Please try again.");
    } finally {
      setActionId(null);
    }
  };

  const withDistance = workshops
    .filter((w) => typeof w.lat === "number" && typeof w.lng === "number")
    .map((w) => ({
      ...w,
      distanceKm: userLocation
        ? distanceKm(userLocation.lat, userLocation.lng, w.lat, w.lng)
        : undefined,
    }));

  const sorted = userLocation
    ? [...withDistance].sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
    : withDistance;

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
        <div className="gx-page-header-row">
          <div>
            <h1 className="gx-dash-title">Workshops</h1>
            <p className="gx-dash-sub">
              Repair and dismantling workshops — find one nearby if
              you&apos;ve broken down or need somewhere to send a vehicle.
            </p>
          </div>

          <Link href="/add-workshop">
            <button className="gx-btn gx-btn-primary" style={{ width: "auto" }}>
              + Register Workshop
            </button>
          </Link>
        </div>

        <button
          type="button"
          className="gx-btn gx-btn-outline"
          onClick={handleFindNearMe}
          disabled={locating}
          style={{ width: "100%", marginBottom: 16 }}
        >
          {locating && <span className="gx-spinner" />}
          {locating
            ? "Getting your location..."
            : userLocation
            ? "📍 Location set — tap to refresh"
            : "📍 Find workshops near me"}
        </button>

        {locationError && (
          <div className="gx-alert gx-alert-error">{locationError}</div>
        )}

        {userLocation && sorted.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <WorkshopsMap userLocation={userLocation} workshops={sorted} />
          </div>
        )}

        {sorted.length === 0 ? (
          <div className="gx-empty-state">
            <div className="gx-empty-state-icon">🔧</div>
            <h2 className="gx-empty-state-title">No workshops listed yet</h2>
            <p className="gx-empty-state-text">
              Be the first to register your workshop.
            </p>

            <Link href="/add-workshop">
              <button
                className="gx-btn gx-btn-primary"
                style={{ width: "auto", margin: "0 auto" }}
              >
                + Register Workshop
              </button>
            </Link>
          </div>
        ) : (
          <div className="gx-grid">
            {sorted.map((w) => (
              <div className="gx-part-card" key={w.id}>
                <div className="gx-part-body">
                  <h3 className="gx-part-name">{w.name}</h3>

                  <p className="gx-part-meta">
                    {w.address ? `${w.address} · ` : ""}📍{" "}
                    {w.district || "Unknown"}
                  </p>

                  {typeof w.distanceKm === "number" && (
                    <p className="gx-part-price" style={{ fontSize: 16 }}>
                      {w.distanceKm.toFixed(1)} km away
                    </p>
                  )}

                  <p className="gx-part-meta">
                    Can take {w.vehicleCapacity} vehicle
                    {w.vehicleCapacity === 1 ? "" : "s"} at once
                  </p>

                  <div className="gx-detail-actions" style={{ marginTop: 12 }}>
                    <a href={`tel:${w.phone}`} className="gx-btn gx-btn-primary">
                      📞 Call
                    </a>

                    <a
                      href={whatsAppLink(
                        w.phone,
                        `Hi, I found ${w.name} on spareX and need help with a vehicle.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gx-btn gx-btn-outline"
                    >
                      💬 WhatsApp
                    </a>
                  </div>

                  {user?.uid === w.ownerId && (
                    <button
                      className="gx-btn gx-btn-danger-outline"
                      onClick={() => handleDelete(w.id)}
                      disabled={actionId === w.id}
                      style={{ marginTop: 10, width: "100%" }}
                    >
                      {actionId === w.id ? "..." : "Remove listing"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
