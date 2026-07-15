"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import Link from "next/link";

import { getVehicle, getVehicleListings } from "@/services/vehicleService";

import { formatVehicleLabel } from "@/lib/vehicleMakes";

import { whatsAppLink } from "@/lib/contact";

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [vehicle, setVehicle] = useState<any>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

  return (
    <div className="gx-page">
      <div className="gx-container" style={{ maxWidth: 920 }}>
        <button
          className="gx-back-link"
          onClick={() => router.back()}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          ← Back
        </button>

        <div className="gx-page-header">
          <h1 className="gx-dash-title">{formatVehicleLabel(vehicle)}</h1>
          <p className="gx-dash-sub">
            {vehicle.status || "Parting Out"}
            {vehicle.district ? ` · 📍 ${vehicle.district}` : ""}
          </p>
        </div>

        {vehicle.photos?.length > 0 && (
          <div className="gx-photo-grid" style={{ marginBottom: 20 }}>
            {vehicle.photos.map((src: string) => (
              <div className="gx-photo-thumb" key={src}>
                <img src={src} alt={formatVehicleLabel(vehicle)} />
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
                  `Hi, I'm interested in parts from your spareX vehicle: ${formatVehicleLabel(
                    vehicle
                  )}`
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

        {availableListings.length === 0 ? (
          <div className="gx-empty-state">
            <div className="gx-empty-state-icon">📦</div>
            <h2 className="gx-empty-state-title">No parts listed yet</h2>
            <p className="gx-empty-state-text">
              The seller hasn't listed any parts from this vehicle yet.
            </p>
          </div>
        ) : (
          <div className="gx-grid">
            {availableListings.map((item) => (
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
                    {item.category}
                  </p>
                  <p className="gx-part-price">
                    ₹{item.price}
                    {item.unitType === "Weight" ? " / kg" : ""}
                  </p>

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
      </div>
    </div>
  );
}
