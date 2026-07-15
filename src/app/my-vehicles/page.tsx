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

export default function MyVehiclesPage() {
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
            <h1 className="gx-dash-title">My Vehicles</h1>
            <p className="gx-dash-sub">
              Vehicles you've registered for parting out — link parts to
              these from Add Spare.
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
              Register a dismantled vehicle to group the parts you pull from
              it.
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
          <div className="gx-grid">
            {vehicles.map((vehicle) => {
              const busy = actionId === vehicle.id;
              const fullyPartedOut = vehicle.status === "Fully Parted Out";

              return (
                <div className="gx-part-card" key={vehicle.id}>
                  {vehicle.photos?.[0] && (
                    <div className="gx-part-image">
                      <img
                        src={vehicle.photos[0]}
                        alt={formatVehicleLabel(vehicle)}
                      />
                    </div>
                  )}

                  <div className="gx-part-body">
                    <h3 className="gx-part-name">
                      {formatVehicleLabel(vehicle)}
                    </h3>

                    <p className="gx-part-meta">
                      {vehicle.availableCount} of {vehicle.partCount} parts
                      available
                    </p>

                    <div className="gx-stock-row">
                      <span className="gx-stock-qty">
                        📍 {vehicle.district || "Unknown"}
                      </span>

                      <span
                        className={
                          "gx-status-badge " +
                          (fullyPartedOut
                            ? "gx-status-soldout"
                            : "gx-status-available")
                        }
                      >
                        {vehicle.status || "Parting Out"}
                      </span>
                    </div>

                    <div className="gx-part-actions">
                      <Link href={`/vehicle/${vehicle.id}`}>
                        <button className="gx-btn gx-btn-outline">
                          View page
                        </button>
                      </Link>

                      <Link href="/add-spare">
                        <button className="gx-btn gx-btn-outline">
                          + Add part
                        </button>
                      </Link>

                      <button
                        className="gx-btn gx-btn-outline"
                        onClick={() => handleToggleStatus(vehicle)}
                        disabled={busy}
                      >
                        {busy
                          ? "..."
                          : fullyPartedOut
                          ? "Mark parting out"
                          : "Mark fully parted out"}
                      </button>

                      <button
                        className="gx-btn gx-btn-danger-outline"
                        onClick={() => handleDelete(vehicle.id)}
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
            })}
          </div>
        )}
      </div>
    </div>
  );
}
