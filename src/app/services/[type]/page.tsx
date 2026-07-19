"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import dynamic from "next/dynamic";

import { useAuth } from "@/contexts/AuthContext";

import { getServicesByType, deleteService } from "@/services/workshopService";

import { getServiceType, isKnownSlug } from "@/lib/serviceTypes";

import { distanceKm } from "@/lib/geo";

import { whatsAppLink } from "@/lib/contact";

const WorkshopsMap = dynamic(() => import("@/components/WorkshopsMap"), {
  ssr: false,
});

export default function ServiceTypePage() {
  const params = useParams();
  const slug = String(params.type || "");

  const { user } = useAuth();

  const typeInfo = getServiceType(slug);
  const isWorkshop = slug === "workshop";

  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    try {
      setServices(await getServicesByType(slug));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isKnownSlug(slug)) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

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
    if (!confirm("Remove this listing?")) return;

    setActionId(id);

    try {
      await deleteService(id);
      await load();
    } catch (error) {
      console.log(error);
      alert("Couldn't remove this listing. Please try again.");
    } finally {
      setActionId(null);
    }
  };

  const withDistance = services
    .filter((s) => typeof s.lat === "number" && typeof s.lng === "number")
    .map((s) => ({
      ...s,
      distanceKm: userLocation
        ? distanceKm(userLocation.lat, userLocation.lng, s.lat, s.lng)
        : undefined,
    }));

  const sorted = userLocation
    ? [...withDistance].sort(
        (a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0)
      )
    : withDistance;

  if (!isKnownSlug(slug)) {
    return (
      <div className="gx-page">
        <div className="gx-container">
          <div className="gx-empty-state">
            <div className="gx-empty-state-icon">🤔</div>
            <h2 className="gx-empty-state-title">Unknown service</h2>
            <p className="gx-empty-state-text">
              This service category doesn&apos;t exist.
            </p>
            <Link href="/services">
              <button className="gx-btn gx-btn-primary" style={{ width: "auto", margin: "0 auto" }}>
                Back to Services
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="gx-dash-title">
              {typeInfo.icon} {typeInfo.label}
            </h1>
            <p className="gx-dash-sub">{typeInfo.blurb} near you.</p>
          </div>

          <Link href={`/add-service?type=${slug}`}>
            <button className="gx-btn gx-btn-primary" style={{ width: "auto" }}>
              + List my service
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
            : `📍 Find ${typeInfo.label.toLowerCase()} near me`}
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
            <div className="gx-empty-state-icon">{typeInfo.icon}</div>
            <h2 className="gx-empty-state-title">Nothing listed yet</h2>
            <p className="gx-empty-state-text">
              Be the first to list your {typeInfo.singular.toLowerCase()}.
            </p>

            <Link href={`/add-service?type=${slug}`}>
              <button
                className="gx-btn gx-btn-primary"
                style={{ width: "auto", margin: "0 auto" }}
              >
                + List my service
              </button>
            </Link>
          </div>
        ) : (
          <div className="gx-grid">
            {sorted.map((s) => (
              <div className="gx-part-card" key={s.id}>
                <div className="gx-part-body">
                  <h3 className="gx-part-name">{s.name}</h3>

                  {slug === "other" && s.type && (
                    <span className="gx-badge-pill" style={{ position: "static", display: "inline-block", marginBottom: 8 }}>
                      {s.type}
                    </span>
                  )}

                  <p className="gx-part-meta">
                    {s.address ? `${s.address} · ` : ""}📍{" "}
                    {s.district || "Unknown"}
                  </p>

                  {typeof s.distanceKm === "number" && (
                    <p className="gx-part-price" style={{ fontSize: 16 }}>
                      {s.distanceKm.toFixed(1)} km away
                    </p>
                  )}

                  {isWorkshop && s.vehicleCapacity && (
                    <p className="gx-part-meta">
                      Can take {s.vehicleCapacity} vehicle
                      {s.vehicleCapacity === 1 ? "" : "s"} at once
                    </p>
                  )}

                  <div className="gx-detail-actions" style={{ marginTop: 12 }}>
                    <a href={`tel:${s.phone}`} className="gx-btn gx-btn-primary">
                      📞 Call
                    </a>

                    <a
                      href={whatsAppLink(
                        s.phone,
                        `Hi, I found ${s.name} on spareX and need your service.`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gx-btn gx-btn-outline"
                    >
                      💬 WhatsApp
                    </a>
                  </div>

                  {user?.uid === s.ownerId && (
                    <button
                      className="gx-btn gx-btn-danger-outline"
                      onClick={() => handleDelete(s.id)}
                      disabled={actionId === s.id}
                      style={{ marginTop: 10, width: "100%" }}
                    >
                      {actionId === s.id ? "..." : "Remove listing"}
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
