"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";

import {
  getUserVehicles,
  getVehicleListings,
  deleteVehicle,
  markVehicleFullyPartedOut,
  markVehiclePartingOut,
} from "@/services/vehicleService";

import { formatVehicleLabel } from "@/lib/vehicleMakes";

function VehicleCard({
  vehicle,
  busy,
  onDelete,
  onToggleStatus,
}: {
  vehicle: any;
  busy: boolean;
  onDelete: (id: string) => void;
  onToggleStatus: (vehicle: any) => void;
}) {
  const isPersonal = vehicle.vehicleType === "Personal";
  const fullyPartedOut = vehicle.status === "Fully Parted Out";

  return (
    <div className="gx-part-card">
      {vehicle.photos?.[0] && (
        <div className="gx-part-image">
          <img src={vehicle.photos[0]} alt={formatVehicleLabel(vehicle)} />
        </div>
      )}

      <div className="gx-part-body">
        <h3 className="gx-part-name">{formatVehicleLabel(vehicle)}</h3>

        {!isPersonal && (
          <p className="gx-part-meta">
            {vehicle.availableCount} of {vehicle.partCount} parts available
          </p>
        )}

        <div className="gx-stock-row">
          <span className="gx-stock-qty">
            📍 {vehicle.district || "Unknown"}
          </span>

          {!isPersonal && (
            <span
              className={
                "gx-status-badge " +
                (fullyPartedOut ? "gx-status-soldout" : "gx-status-available")
              }
            >
              {vehicle.status || "Parting Out"}
            </span>
          )}
        </div>

        <div className="gx-part-actions">
          <Link href={`/vehicle/${vehicle.id}`}>
            <button className="gx-btn gx-btn-outline">View page</button>
          </Link>

          {!isPersonal && (
            <>
              <Link href="/add-spare">
                <button className="gx-btn gx-btn-outline">+ Add part</button>
              </Link>

              <button
                className="gx-btn gx-btn-outline"
                onClick={() => onToggleStatus(vehicle)}
                disabled={busy}
              >
                {busy
                  ? "..."
                  : fullyPartedOut
                  ? "Mark parting out"
                  : "Mark fully parted out"}
              </button>
            </>
          )}

          <button
            className="gx-btn gx-btn-danger-outline"
            onClick={() => onDelete(vehicle.id)}
            disabled={busy || vehicle.partCount > 0}
            title={
              vehicle.partCount > 0
                ? "Delete or unlink its listed parts first"
                : undefined
            }
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VehiclesTab() {
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const loadVehicles = async () => {
    try {
      if (!user) {
        setLoading(false);
        return;
      }

      const items = await getUserVehicles(user.uid);

      const withCounts = await Promise.all(
        items.map(async (vehicle: any) => {
          const listings = await getVehicleListings(vehicle.id);
          return {
            ...vehicle,
            partCount: listings.length,
            availableCount: listings.filter(
              (l: any) => (l.status || "Available") === "Available"
            ).length,
          };
        })
      );

      setVehicles(withCounts);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, [user]);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Delete this vehicle record?");

    if (!confirmDelete) return;

    setActionError("");
    setActionId(id);

    try {
      await deleteVehicle(id);
      await loadVehicles();
    } catch (error) {
      console.log(error);
      setActionError(
        error instanceof Error
          ? error.message
          : "Couldn't delete this vehicle."
      );
    } finally {
      setActionId(null);
    }
  };

  const handleToggleStatus = async (vehicle: any) => {
    setActionError("");
    setActionId(vehicle.id);

    try {
      if (vehicle.status === "Fully Parted Out") {
        await markVehiclePartingOut(vehicle.id);
      } else {
        await markVehicleFullyPartedOut(vehicle.id);
      }
      await loadVehicles();
    } catch (error) {
      console.log(error);
      setActionError("Couldn't update this vehicle. Please try again.");
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return (
      <div className="gx-page-center">
        <span className="gx-spinner" />
        Loading...
      </div>
    );
  }

  // Legacy records predate vehicleType and were always parting-out
  // vehicles, so treat anything not explicitly "Personal" as scrap.
  const scrapVehicles = vehicles.filter((v) => v.vehicleType !== "Personal");
  const personalVehicles = vehicles.filter((v) => v.vehicleType === "Personal");

  return (
    <div>
      <div className="gx-page-header-row">
        <div>
          <h2 className="gx-part-name" style={{ fontSize: 20 }}>
            My Vehicles
          </h2>
          <p className="gx-dash-sub" style={{ margin: 0 }}>
            Vehicles you use, and vehicles you&apos;re parting out for sale.
          </p>
        </div>

        <Link href="/add-vehicle">
          <button className="gx-btn gx-btn-primary" style={{ width: "auto" }}>
            + Add Vehicle
          </button>
        </Link>
      </div>

      {actionError && (
        <div className="gx-alert gx-alert-error">{actionError}</div>
      )}

      {vehicles.length === 0 ? (
        <div className="gx-empty-state">
          <div className="gx-empty-state-icon">🚗</div>
          <h2 className="gx-empty-state-title">No vehicles yet</h2>
          <p className="gx-empty-state-text">
            Register a vehicle you use, or one you&apos;re parting out for
            sale.
          </p>

          <Link href="/add-vehicle">
            <button
              className="gx-btn gx-btn-primary"
              style={{ width: "auto", margin: "0 auto" }}
            >
              + Add Vehicle
            </button>
          </Link>
        </div>
      ) : (
        <>
          <h3 className="gx-part-name" style={{ fontSize: 16, marginBottom: 10 }}>
            Vehicles I&apos;m parting out ({scrapVehicles.length})
          </h3>

          {scrapVehicles.length === 0 ? (
            <p className="gx-location-hint" style={{ marginBottom: 20 }}>
              None yet — parts you list can be linked to a vehicle here.
            </p>
          ) : (
            <div className="gx-grid" style={{ marginBottom: 28 }}>
              {scrapVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  busy={actionId === vehicle.id}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          )}

          <h3 className="gx-part-name" style={{ fontSize: 16, marginBottom: 10 }}>
            Vehicles I use ({personalVehicles.length})
          </h3>

          {personalVehicles.length === 0 ? (
            <p className="gx-location-hint">
              None yet — register a vehicle you drive for your own records.
            </p>
          ) : (
            <div className="gx-grid">
              {personalVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  busy={actionId === vehicle.id}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
