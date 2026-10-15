"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { VEHICLE_MAKES, formatVehicleLabel } from "@/lib/vehicleMakes";
import { matchesSearch } from "@/lib/format";
import { fitsVehicle, useGarage } from "@/lib/prefs";

import GarageBar from "@/components/GarageBar";
import PartImage from "@/components/PartImage";

// Vehicles dealers bought whole and are selling for parts. One donor
// often has the exact panel, lamp or ECU you need even before the
// dealer has listed it, so buyers can browse by vehicle, not just part.
export default function DonorVehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [make, setMake] = useState("");
  const [onlyFits, setOnlyFits] = useState(false);

  const { vehicle: myVehicle } = useGarage();

  useEffect(() => {
    const load = async () => {
      try {
        const [vehicleSnap, listingSnap] = await Promise.all([
          getDocs(collection(db, "vehicles")),
          getDocs(
            query(collection(db, "spareListings"), where("vehicleId", "!=", null))
          ),
        ]);

        const available: Record<string, number> = {};
        listingSnap.forEach((d) => {
          const data = d.data();
          if ((data.status || "Available") === "Available") {
            available[data.vehicleId] = (available[data.vehicleId] || 0) + 1;
          }
        });

        const items: any[] = [];
        vehicleSnap.forEach((d) => {
          const data: any = d.data();
          // Legacy records predate vehicleType and were always donors.
          if (data.vehicleType === "Personal") return;
          if (data.status === "Fully Parted Out") return;
          items.push({ id: d.id, ...data, availableCount: available[d.id] || 0 });
        });

        items.sort((a, b) =>
          String(b.createdAt || "").localeCompare(String(a.createdAt || ""))
        );

        setVehicles(items);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const shown = vehicles.filter(
    (v) =>
      (!make || v.make === make) &&
      (!onlyFits || fitsVehicle(v, myVehicle)) &&
      matchesSearch(search, [v.make, v.model, v.year, v.district, v.color])
  );

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-page-header">
          <h1 className="gx-dash-title">Donor vehicles</h1>
          <p className="gx-dash-sub">
            Whole vehicles dealers are selling for parts. Open one to see
            every part still available from it, or ask the dealer for one
            they haven&apos;t listed yet.
          </p>
        </div>

        <GarageBar
          onlyFits={onlyFits}
          onOnlyFitsChange={setOnlyFits}
          fitsLabel="Only my vehicle's model"
        />

        <div className="gx-filter-bar">
          <input
            className="gx-input"
            placeholder="Search model, year, district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="gx-input"
            value={make}
            onChange={(e) => setMake(e.target.value)}
          >
            <option value="">All makes</option>
            {VEHICLE_MAKES.filter((m) => m !== "Other").map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="gx-page-center">
            <span className="gx-spinner" />
            Loading...
          </div>
        ) : shown.length === 0 ? (
          <div className="gx-empty-state">
            <div className="gx-empty-state-icon">🚗</div>
            <h2 className="gx-empty-state-title">No donor vehicles found</h2>
            <p className="gx-empty-state-text">
              {vehicles.length === 0
                ? "No dealer has added a donor vehicle yet."
                : "Try another make, or clear the search."}
            </p>
            <Link href="/spare-parts">
              <button
                className="gx-btn gx-btn-outline"
                style={{ width: "auto", margin: "0 auto" }}
              >
                Browse all parts
              </button>
            </Link>
          </div>
        ) : (
          <div className="gx-grid">
            {shown.map((v) => (
              <div className="gx-part-card" key={v.id}>
                <Link href={`/vehicle/${v.id}`} className="gx-part-image">
                  <PartImage src={v.photos?.[0]} alt={formatVehicleLabel(v)} />
                </Link>

                <div className="gx-part-body">
                  <h3 className="gx-part-name">{formatVehicleLabel(v)}</h3>
                  <p className="gx-part-meta">
                    {v.availableCount > 0
                      ? `${v.availableCount} part${v.availableCount === 1 ? "" : "s"} listed`
                      : "Ask the dealer for parts"}
                    {v.acquisitionReason ? ` · ${v.acquisitionReason}` : ""}
                  </p>

                  <div className="gx-part-tags">
                    <span className="gx-district-tag">
                      📍 {v.district || "Unknown"}
                    </span>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <Link href={`/vehicle/${v.id}`}>
                      <button className="gx-btn gx-btn-outline">See parts</button>
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
