"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import imageCompression from "browser-image-compression";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { addDoc, collection } from "firebase/firestore";

import { storage, db } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

import { getUserProfile } from "@/services/userService";

import { VEHICLE_MAKES } from "@/lib/vehicleMakes";

import { FIELD_HINTS } from "@/lib/helpContent";

import HelpHint from "@/components/HelpHint";

const MAX_PHOTOS = 8;

const ACQUISITION_REASONS = [
  "Accident",
  "Scrap / end-of-life",
  "Flood damage",
  "Other",
];

export default function AddVehiclePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [sellerDistrict, setSellerDistrict] = useState("");

  useEffect(() => {
    const loadDistrict = async () => {
      if (!user) return;
      const profile = await getUserProfile(user.uid);
      setSellerDistrict(profile?.district || "");
    };

    loadDistrict();
  }, [user]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [make, setMake] = useState("");
  const [customMake, setCustomMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");
  const [color, setColor] = useState("");
  const [odometer, setOdometer] = useState("");
  const [acquisitionReason, setAcquisitionReason] = useState("Scrap / end-of-life");

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const remainingSlots = MAX_PHOTOS - photos.length;
    const accepted = files.slice(0, remainingSlots);

    setPhotos((prev) => [...prev, ...accepted]);
    setPhotoPreviews((prev) => [
      ...prev,
      ...accepted.map((file) => URL.createObjectURL(file)),
    ]);

    e.target.value = "";
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!user) {
      setError("Please log in to add a vehicle.");
      return;
    }

    if (photos.length === 0) {
      setError("Add at least one photo of the vehicle.");
      return;
    }

    if (!make) {
      setError("Select the vehicle make.");
      return;
    }

    if (!model.trim()) {
      setError("Enter the model.");
      return;
    }

    const currentYear = new Date().getFullYear();

    if (
      year &&
      (!/^\d{4}$/.test(year) ||
        Number(year) < 1980 ||
        Number(year) > currentYear + 1)
    ) {
      setError(`Enter a valid year between 1980 and ${currentYear + 1}.`);
      return;
    }

    const resolvedMake = make === "Other" ? customMake.trim() : make;

    if (!resolvedMake) {
      setError("Enter the make.");
      return;
    }

    try {
      setLoading(true);

      const photoUrls: string[] = [];

      for (let i = 0; i < photos.length; i++) {
        const compressedFile = await imageCompression(photos[i], {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        });

        const fileName = `vehicle-images/${user.uid}_${Date.now()}_${i}.jpg`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, compressedFile);
        photoUrls.push(await getDownloadURL(storageRef));
      }

      await addDoc(collection(db, "vehicles"), {
        make: resolvedMake,
        model: model.trim(),
        year: year || null,
        vin: vin.trim() || null,
        color: color.trim() || null,
        odometer: odometer ? Number(odometer) : null,
        acquisitionReason,
        photos: photoUrls,
        district: sellerDistrict || null,
        status: "Parting Out",
        sellerId: user.uid,
        sellerPhone: user.phoneNumber,
        createdAt: new Date().toISOString(),
      });

      setSuccess(true);
      setMake("");
      setCustomMake("");
      setModel("");
      setYear("");
      setVin("");
      setColor("");
      setOdometer("");
      setAcquisitionReason("Scrap / end-of-life");
      setPhotos([]);
      setPhotoPreviews([]);

      router.push("/my-vehicles");
    } catch (error) {
      console.log(error);
      setError("Couldn't save this vehicle. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-page-header">
          <h1 className="gx-dash-title">Add Vehicle</h1>
          <p className="gx-dash-sub">
            Register a dismantled vehicle so every part you list from it can
            be grouped together for buyers.
          </p>
        </div>

        <div className="gx-form-card">
          {error && <div className="gx-alert gx-alert-error">{error}</div>}
          {success && (
            <div className="gx-alert gx-alert-success">
              Vehicle added. You can now link parts to it from Add Spare.
            </div>
          )}

          <div className="gx-field">
            <label className="gx-label">Photos</label>

            <div className="gx-photo-grid">
              {photoPreviews.map((src, index) => (
                <div className="gx-photo-thumb" key={src}>
                  <img src={src} alt={`Vehicle photo ${index + 1}`} />
                  <button
                    type="button"
                    className="gx-photo-thumb-remove"
                    onClick={() => handleRemovePhoto(index)}
                    aria-label="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ))}

              {photos.length < MAX_PHOTOS && (
                <div
                  className="gx-upload-box gx-photo-add"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="gx-upload-box-icon">📷</div>
                  <div className="gx-upload-box-text">Add photo</div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleAddPhotos}
              style={{ display: "none" }}
            />

            <p className="gx-muted" style={{ marginTop: 8 }}>
              {photos.length}/{MAX_PHOTOS} photos
            </p>

            <HelpHint text={FIELD_HINTS.addVehicle.photos} />
          </div>

          <div className="gx-field">
            <label className="gx-label">Make</label>
            <select
              className="gx-input"
              value={make}
              onChange={(e) => setMake(e.target.value)}
            >
              <option value="">Select make</option>
              {VEHICLE_MAKES.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>

            {make === "Other" && (
              <input
                className="gx-input"
                placeholder="Enter the make"
                value={customMake}
                onChange={(e) => setCustomMake(e.target.value)}
                style={{ marginTop: 8 }}
              />
            )}
          </div>

          <div className="gx-field">
            <label className="gx-label">Model</label>
            <input
              className="gx-input"
              placeholder="e.g. Innova"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">Year</label>
            <input
              className="gx-input"
              placeholder="e.g. 2018"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">VIN / chassis number (optional)</label>
            <input
              className="gx-input"
              placeholder="e.g. MA3ERLF1S00123456"
              value={vin}
              onChange={(e) => setVin(e.target.value)}
            />
            <HelpHint text={FIELD_HINTS.addVehicle.vin} />
          </div>

          <div className="gx-field">
            <label className="gx-label">Color (optional)</label>
            <input
              className="gx-input"
              placeholder="e.g. White"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">Odometer, km (optional)</label>
            <input
              className="gx-input"
              placeholder="e.g. 85000"
              value={odometer}
              onChange={(e) => setOdometer(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">Why it's being parted out</label>
            <select
              className="gx-input"
              value={acquisitionReason}
              onChange={(e) => setAcquisitionReason(e.target.value)}
            >
              {ACQUISITION_REASONS.map((reason) => (
                <option key={reason}>{reason}</option>
              ))}
            </select>
            <HelpHint text={FIELD_HINTS.addVehicle.acquisitionReason} />
          </div>

          <button
            type="button"
            className="gx-btn gx-btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <span className="gx-spinner" />}
            {loading ? "Saving..." : "Save vehicle"}
          </button>
        </div>
      </div>
    </div>
  );
}
