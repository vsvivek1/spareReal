"use client";

import { useState } from "react";

import { VEHICLE_MAKES } from "@/lib/vehicleMakes";
import { garageLabel, useGarage } from "@/lib/prefs";

// "My vehicle" strip above the parts list: remember what you drive once,
// then flip a switch to see only parts that fit it.
export default function GarageBar({
  onlyFits,
  onOnlyFitsChange,
}: {
  onlyFits: boolean;
  onOnlyFitsChange: (next: boolean) => void;
}) {
  const { vehicle, setVehicle } = useGarage();

  const [editing, setEditing] = useState(false);
  const [make, setMake] = useState(vehicle?.make || "");
  const [model, setModel] = useState(vehicle?.model || "");
  const [year, setYear] = useState(vehicle?.year || "");

  const save = () => {
    if (!make || !model.trim()) return;
    setVehicle({ make, model: model.trim(), year: year.trim() || undefined });
    setEditing(false);
    onOnlyFitsChange(true);
  };

  if (!vehicle || editing) {
    return (
      <div className="gx-garage-bar">
        <span>🚗 My vehicle</span>

        <select
          className="gx-input"
          value={make}
          onChange={(e) => setMake(e.target.value)}
        >
          <option value="">Make</option>
          {VEHICLE_MAKES.filter((m) => m !== "Other").map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <input
          className="gx-input"
          placeholder="Model, e.g. Swift"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
        />

        <input
          className="gx-input"
          placeholder="Year"
          inputMode="numeric"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ minWidth: 80, flex: "0 1 90px" }}
        />

        <button
          type="button"
          className="gx-btn gx-btn-primary"
          onClick={save}
          disabled={!make || !model.trim()}
        >
          Save
        </button>

        {vehicle && (
          <button
            type="button"
            className="gx-link-btn"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="gx-garage-bar">
      <span>🚗 {garageLabel(vehicle)}</span>

      <label
        style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}
      >
        <input
          type="checkbox"
          checked={onlyFits}
          onChange={(e) => onOnlyFitsChange(e.target.checked)}
        />
        Only parts that fit
      </label>

      <span style={{ flex: 1 }} />

      <button type="button" className="gx-link-btn" onClick={() => setEditing(true)}>
        Change
      </button>
      <button
        type="button"
        className="gx-link-btn"
        onClick={() => {
          setVehicle(null);
          onOnlyFitsChange(false);
        }}
      >
        Remove
      </button>
    </div>
  );
}
