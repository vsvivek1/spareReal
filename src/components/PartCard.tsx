"use client";

import Link from "next/link";

import PartImage from "@/components/PartImage";
import SaveButton from "@/components/SaveButton";

import { formatPrice } from "@/lib/format";
import { formatVehicleLabel } from "@/lib/vehicleMakes";

import type { SellerRating } from "@/services/reviewService";

// One listing in a grid. Used by every browse page so the heart, seller
// rating and price format stay identical everywhere.
export default function PartCard({
  item,
  rating,
  badge,
  cta = "View details",
}: {
  item: any;
  rating?: SellerRating;
  /** Overrides the condition pill, e.g. the status on your own listings. */
  badge?: string;
  cta?: string;
}) {
  const pill = badge ?? item.condition;

  return (
    <div className="gx-part-card">
      <Link href={`/listing/${item.id}`} className="gx-part-image">
        <PartImage src={item.imageUrl} alt={item.title} />
        {pill && <span className="gx-badge-pill">{pill}</span>}
        <SaveButton id={item.id} />
      </Link>

      <div className="gx-part-body">
        <h3 className="gx-part-name">{item.title}</h3>
        <p className="gx-part-meta">
          {formatVehicleLabel(item)}
          {item.category ? ` · ${item.category}` : ""}
        </p>
        <p className="gx-part-price">
          {formatPrice(item.price)}
          {item.unitType === "Weight" ? " / kg" : ""}
        </p>
        {item.unitType === "Weight" && (
          <p className="gx-part-meta" style={{ margin: "0 0 8px" }}>
            {item.quantity} kg available
          </p>
        )}

        <div className="gx-part-tags">
          <span className="gx-district-tag">📍 {item.district || "Unknown"}</span>
          {rating && rating.count > 0 && (
            <span className="gx-district-tag" title="Seller rating">
              ⭐ {rating.average.toFixed(1)} ({rating.count})
            </span>
          )}
        </div>

        <div style={{ marginTop: 12 }}>
          <Link href={`/listing/${item.id}`}>
            <button className="gx-btn gx-btn-outline">{cta}</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
