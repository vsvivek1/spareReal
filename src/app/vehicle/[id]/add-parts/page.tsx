"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import imageCompression from "browser-image-compression";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { addDoc, collection } from "firebase/firestore";

import { storage, db } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

import { getUserProfile } from "@/services/userService";

import { getVehicle, getVehicleListings } from "@/services/vehicleService";

import { formatVehicleLabel } from "@/lib/vehicleMakes";

import {
  DonorKind,
  PART_CATEGORIES,
  donorPartsFor,
  guessDonorKind,
} from "@/lib/donorParts";

import RequireLogin from "@/components/RequireLogin";

type Pick = {
  name: string;
  category: string;
  price: string;
  condition: string;
  photo?: File;
  preview?: string;
};

const keyOf = (name: string) => name.trim().toLowerCase();

// List many parts from one donor vehicle in one go: tick what you have,
// optionally add a price and photo, and every listing is created with
// the vehicle's make, model and year and linked back to it.
function AddPartsFromVehicle() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params?.id as string;

  const [vehicle, setVehicle] = useState<any>(null);
  const [listedKeys, setListedKeys] = useState<Set<string>>(new Set());
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(true);

  const [kind, setKind] = useState<DonorKind>("car");
  const [picks, setPicks] = useState<Record<string, Pick>>({});
  const [customParts, setCustomParts] = useState<Pick[]>([]);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("Body Parts");

  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data: any = await getVehicle(id);
        setVehicle(data);

        if (data) {
          setKind(guessDonorKind(data.make));

          const listings = await getVehicleListings(id);
          setListedKeys(new Set(listings.map((l: any) => keyOf(l.title || ""))));
        }

        if (user) {
          const profile = await getUserProfile(user.uid);
          setDistrict(profile?.district || "");
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id, user]);

  const groups = useMemo(() => {
    const all = [...donorPartsFor(kind), ...customParts];
    return PART_CATEGORIES.map((category) => ({
      category,
      parts: all.filter((p) => p.category === category),
    })).filter((g) => g.parts.length > 0);
  }, [kind, customParts]);

  const pickedList = Object.values(picks);

  const toggle = (part: { name: string; category: string }) => {
    const key = keyOf(part.name);
    setPicks((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key];
      else next[key] = { ...part, price: "", condition: "Used" };
      return next;
    });
  };

  const updatePick = (key: string, patch: Partial<Pick>) =>
    setPicks((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  const addCustom = () => {
    const name = customName.trim();
    if (!name) return;

    const key = keyOf(name);
    const exists =
      donorPartsFor(kind).some((p) => keyOf(p.name) === key) ||
      customParts.some((p) => keyOf(p.name) === key);

    const part = { name, category: customCategory, price: "", condition: "Used" };

    if (!exists) setCustomParts((prev) => [...prev, part]);
    if (!listedKeys.has(key)) {
      setPicks((prev) => ({ ...prev, [key]: prev[key] || part }));
    }
    setCustomName("");
  };

  const handleSubmit = async () => {
    setError("");

    if (!user || !vehicle) return;

    if (pickedList.length === 0) {
      setError("Tick at least one part.");
      return;
    }

    const bad = pickedList.find(
      (p) => p.price && (!/^\d+(\.\d+)?$/.test(p.price.trim()) || Number(p.price) <= 0)
    );
    if (bad) {
      setError(`Check the price for "${bad.name}". Use numbers only, or leave it blank.`);
      return;
    }

    setSaving(true);

    const label = formatVehicleLabel(vehicle);
    const reason = vehicle.acquisitionReason
      ? ` (${String(vehicle.acquisitionReason).toLowerCase()})`
      : "";
    const fallbackPhoto = vehicle.photos?.[0] || null;

    const failed: Record<string, Pick> = {};
    let done = 0;

    for (const pick of pickedList) {
      setProgress(`Listing ${done + 1} of ${pickedList.length}...`);

      try {
        let photoUrl: string | null = null;

        if (pick.photo) {
          const compressed = await imageCompression(pick.photo, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1200,
            useWebWorker: true,
          });
          const storageRef = ref(
            storage,
            `spare-images/${user.uid}_${Date.now()}_${done}.jpg`
          );
          await uploadBytes(storageRef, compressed);
          photoUrl = await getDownloadURL(storageRef);
        }

        await addDoc(collection(db, "spareListings"), {
          title: pick.name,
          category: pick.category,
          make: vehicle.make || null,
          model: vehicle.model || null,
          year: vehicle.year || null,
          partNumber: null,
          vehicleId: id,
          price: pick.price.trim(),
          unitType: "Piece",
          quantity: 1,
          acquisitionCost: null,
          description: `Removed from a ${label}${reason}.`,
          condition: pick.condition,
          status: "Available",
          imageUrl: photoUrl || fallbackPhoto,
          photos: photoUrl ? [photoUrl] : fallbackPhoto ? [fallbackPhoto] : [],
          district: district || vehicle.district || null,
          sellerId: user.uid,
          sellerPhone: user.phoneNumber,
          createdAt: new Date().toISOString(),
        });

        done++;
      } catch (err) {
        console.log(err);
        failed[keyOf(pick.name)] = pick;
      }
    }

    setSaving(false);
    setProgress("");

    if (Object.keys(failed).length === 0) {
      router.push(`/vehicle/${id}?added=${done}`);
      return;
    }

    setPicks(failed);
    setListedKeys((prev) => {
      const next = new Set(prev);
      pickedList.forEach((p) => {
        if (!failed[keyOf(p.name)]) next.add(keyOf(p.name));
      });
      return next;
    });
    setError(
      `${done} listed. ${Object.keys(failed).length} couldn't be saved and are still ticked. Please try again.`
    );
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

  const notMine = !vehicle || vehicle.sellerId !== user?.uid;

  if (notMine || vehicle.vehicleType === "Personal") {
    return (
      <div className="gx-page">
        <div className="gx-container">
          <div className="gx-empty-state">
            <div className="gx-empty-state-icon">🚗</div>
            <h2 className="gx-empty-state-title">
              {!vehicle
                ? "Vehicle not found"
                : notMine
                ? "This isn't your vehicle"
                : "This is your own vehicle"}
            </h2>
            <p className="gx-empty-state-text">
              {notMine
                ? "Only the seller who added a vehicle can list parts from it."
                : "Parts can be listed from vehicles you're parting out. Add the donor vehicle first."}
            </p>
            <Link href="/add-vehicle">
              <button
                className="gx-btn gx-btn-primary"
                style={{ width: "auto", margin: "0 auto" }}
              >
                + Add your vehicle
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gx-page">
      <div className="gx-container">
        <Link href={`/vehicle/${id}`} className="gx-back-link">
          ← {formatVehicleLabel(vehicle)}
        </Link>

        <div className="gx-page-header">
          <h1 className="gx-dash-title">List parts from this vehicle</h1>
          <p className="gx-dash-sub">
            Tick every part you have from your {formatVehicleLabel(vehicle)}.
            Price and photo are optional. Each part gets its own listing,
            linked to this vehicle.
          </p>
        </div>

        <div className="gx-form-card">
          <div className="gx-field">
            <label className="gx-label">Parts list for</label>
            <div className="gx-role-group">
              {(["car", "bike"] as DonorKind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  className={
                    "gx-role-option" + (kind === k ? " gx-role-option-active" : "")
                  }
                  onClick={() => setKind(k)}
                >
                  {k === "car" ? "Car / jeep / van" : "Bike / scooter"}
                </button>
              ))}
            </div>
          </div>

          {groups.map((group) => (
            <div className="gx-pick-group" key={group.category}>
              <h3 className="gx-pick-group-title">{group.category}</h3>

              {group.parts.map((part) => {
                const key = keyOf(part.name);
                const listed = listedKeys.has(key);
                const pick = picks[key];

                return (
                  <div
                    key={key}
                    className={"gx-pick-row" + (pick ? " gx-pick-row-on" : "")}
                  >
                    <label
                      className={"gx-pick-head" + (listed ? " gx-pick-done" : "")}
                    >
                      <input
                        type="checkbox"
                        checked={!!pick}
                        disabled={listed || saving}
                        onChange={() => toggle(part)}
                      />
                      {part.name}
                      {listed && <span className="gx-pick-tag">Listed</span>}
                    </label>

                    {pick && (
                      <div className="gx-pick-details">
                        <input
                          className="gx-input"
                          placeholder="Price ₹ (optional)"
                          inputMode="numeric"
                          value={pick.price}
                          onChange={(e) => updatePick(key, { price: e.target.value })}
                        />

                        <select
                          className="gx-input"
                          value={pick.condition}
                          onChange={(e) =>
                            updatePick(key, { condition: e.target.value })
                          }
                        >
                          <option>Used</option>
                          <option>Refurbished</option>
                          <option>Damaged</option>
                          <option>New</option>
                        </select>

                        <label className="gx-btn gx-btn-outline" style={{ margin: 0 }}>
                          {pick.preview ? (
                            <img
                              src={pick.preview}
                              alt=""
                              className="gx-pick-thumb"
                            />
                          ) : (
                            "📷 Photo"
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                updatePick(key, {
                                  photo: file,
                                  preview: URL.createObjectURL(file),
                                });
                              }
                              e.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          <div className="gx-field">
            <label className="gx-label">Something not on the list?</label>
            <div className="gx-pick-details" style={{ padding: 0 }}>
              <input
                className="gx-input"
                placeholder="e.g. Roof rails"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
              />
              <select
                className="gx-input"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              >
                {PART_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <button
                type="button"
                className="gx-btn gx-btn-outline"
                onClick={addCustom}
                disabled={!customName.trim()}
              >
                + Add
              </button>
            </div>
          </div>

          <p className="gx-muted">
            Parts without a photo show the vehicle&apos;s photo. Need a part
            number, quantity or more detail?{" "}
            <Link href={`/add-spare?vehicle=${id}`}>Add it on its own</Link>.
          </p>

          <div className="gx-pick-footer">
            {error && <div className="gx-alert gx-alert-error">{error}</div>}

            <button
              type="button"
              className="gx-btn gx-btn-primary"
              onClick={handleSubmit}
              disabled={saving || pickedList.length === 0}
            >
              {saving && <span className="gx-spinner" />}
              {saving
                ? progress
                : pickedList.length === 0
                ? "Tick the parts you have"
                : `List ${pickedList.length} part${pickedList.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddPartsFromVehiclePage() {
  return (
    <RequireLogin message="Log in to list parts from your vehicle.">
      <AddPartsFromVehicle />
    </RequireLogin>
  );
}
