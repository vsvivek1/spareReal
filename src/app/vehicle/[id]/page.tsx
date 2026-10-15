"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

import { getVehicle, getVehicleListings } from "@/services/vehicleService";

import { formatVehicleLabel } from "@/lib/vehicleMakes";

import { whatsAppLink } from "@/lib/contact";
import { matchesSearch } from "@/lib/format";
import { fitsVehicle, garageLabel, useGarage } from "@/lib/prefs";
import PartCard from "@/components/PartCard";
import ShareButton from "@/components/ShareButton";

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [vehicle, setVehicle] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState("");
  const [addedCount, setAddedCount] = useState(0);

  const { user } = useAuth();
  const { vehicle: myVehicle } = useGarage();

  useEffect(() => {
    const added = Number(
      new URLSearchParams(window.location.search).get("added") || 0
    );
    if (added > 0) {
      setAddedCount(added);
      // Keep shared links clean of the one-off success flag.
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getVehicle(id);

        if (!data) {
          setNotFound(true);
          return;
        }

        setVehicle(data);
        setListings(await getVehicleListings(id));
      } catch (error) {
        console.log(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

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

  if (notFound || !vehicle) {
    return (
      <div className="gx-page">
        <div className="gx-status-wrap">
          <div className="gx-status-card">
            <div className="gx-status-icon gx-status-icon-neutral">🔍</div>
            <h1 className="gx-title">Vehicle not found</h1>
            <p className="gx-subtitle">
              This vehicle record may have been removed.
            </p>
            <button
              className="gx-btn gx-btn-primary"
              onClick={() => router.push("/ground")}
            >
              Back to browse
            </button>
          </div>
        </div>
      </div>
    );
  }

  const availableListings = listings.filter(
    (item) => (item.status || "Available") === "Available"
  );

  const shownListings = availableListings.filter((item) =>
    matchesSearch(search, [item.title, item.category, item.condition])
  );

  const label = formatVehicleLabel(vehicle);
  const isOwner = !!user && user.uid === vehicle.sellerId;
  const isDonor = vehicle.vehicleType !== "Personal";
  const fitsMine =
    !!myVehicle && !!vehicle.make && fitsVehicle(vehicle, myVehicle);

  return (
    <div className="gx-page">
      <div className="gx-container" style={{ maxWidth: 920 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <button
            className="gx-back-link"
            onClick={() => router.back()}
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            ← Back
          </button>

          <ShareButton
            title={label}
            text={`Parts from a ${label} on spareX`}
          />
        </div>

        {addedCount > 0 && (
          <div className="gx-alert gx-alert-success">
            {addedCount} part{addedCount === 1 ? "" : "s"} listed from this
            vehicle.
          </div>
        )}

        <div className="gx-page-header">
          <h1 className="gx-dash-title">{label}</h1>
          <p className="gx-dash-sub">
            {isDonor ? "Donor vehicle · " : ""}
            {vehicle.status || "Parting Out"}
            {vehicle.district ? ` · 📍 ${vehicle.district}` : ""}
          </p>
          {fitsMine && myVehicle && (
            <p className="gx-dash-sub" style={{ color: "var(--gx-success)" }}>
              ✓ Same vehicle as yours ({garageLabel(myVehicle)})
            </p>
          )}
        </div>

        {isOwner && isDonor && (
          <div className="gx-premium-banner" style={{ marginBottom: 20 }}>
            <p className="gx-dash-sub" style={{ margin: 0 }}>
              {listings.length} part{listings.length === 1 ? "" : "s"} listed
              from this vehicle, {availableListings.length} still available.
            </p>
            <Link href={`/vehicle/${id}/add-parts`}>
              <button className="gx-btn gx-btn-primary" style={{ width: "auto" }}>
                + List more parts
              </button>
            </Link>
          </div>
        )}

        {vehicle.photos?.length > 0 && (
          <div className="gx-photo-grid" style={{ marginBottom: 20 }}>
            {vehicle.photos.map((src: string) => (
              <div className="gx-photo-thumb" key={src}>
                <img src={src} alt={label} />
              </div>
            ))}
          </div>
        )}

        <div className="gx-seller-card" style={{ marginBottom: 28 }}>
          <div className="gx-seller-card-label">Vehicle details</div>

          <div className="gx-request-meta-row">
            <span className="gx-request-meta-label">Color</span>
            <span className="gx-request-meta-value">
              {vehicle.color || "Not specified"}
            </span>
          </div>

          <div className="gx-request-meta-row">
            <span className="gx-request-meta-label">Odometer</span>
            <span className="gx-request-meta-value">
              {vehicle.odometer ? `${vehicle.odometer} km` : "Not specified"}
            </span>
          </div>

          <div className="gx-request-meta-row">
            <span className="gx-request-meta-label">VIN</span>
            <span className="gx-request-meta-value">
              {vehicle.vin || "Not specified"}
            </span>
          </div>

          <div className="gx-request-meta-row">
            <span className="gx-request-meta-label">Reason</span>
            <span className="gx-request-meta-value">
              {vehicle.acquisitionReason || "Not specified"}
            </span>
          </div>

          {vehicle.sellerPhone && (
            <div className="gx-detail-actions" style={{ marginTop: 14 }}>
              <a
                href={`tel:${vehicle.sellerPhone}`}
                className="gx-btn gx-btn-primary"
              >
                📞 Call Seller
              </a>

              <a
                href={whatsAppLink(
                  vehicle.sellerPhone,
                  `Hi, I'm interested in parts from your spareX vehicle: ${label}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="gx-btn gx-btn-outline"
              >
                💬 WhatsApp
              </a>
            </div>
          )}
        </div>

        <div className="gx-section-head">
          <h2 className="gx-section-title">
            Parts available from this vehicle
          </h2>
        </div>

        {availableListings.length > 6 && (
          <div className="gx-filter-bar">
            <input
              className="gx-input"
              placeholder={`Search ${availableListings.length} parts from this vehicle...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {availableListings.length === 0 ? (
          <div className="gx-empty-state">
            <div className="gx-empty-state-icon">📦</div>
            <h2 className="gx-empty-state-title">No parts listed yet</h2>
            <p className="gx-empty-state-text">
              {isOwner
                ? "Tick the parts you have from this vehicle to list them all at once."
                : "The seller hasn't listed parts from this vehicle yet. Ask them on WhatsApp, they may still have what you need."}
            </p>
          </div>
        ) : shownListings.length === 0 ? (
          <div className="gx-empty-state">
            <div className="gx-empty-state-icon">🔍</div>
            <h2 className="gx-empty-state-title">No match</h2>
            <p className="gx-empty-state-text">
              Not listed, but the seller may still have it. Ask them on
              WhatsApp.
            </p>
          </div>
        ) : (
          <div className="gx-grid">
            {shownListings.map((item) => (
              <PartCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
