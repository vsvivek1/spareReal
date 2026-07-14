"use client";

import { useEffect, useRef, useState } from "react";

import imageCompression from "browser-image-compression";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { addDoc, collection } from "firebase/firestore";

import { storage, db } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

import { getUserProfile } from "@/services/userService";

import { VEHICLE_MAKES } from "@/lib/vehicleMakes";

export default function AddSparePage() {
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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [detecting, setDetecting] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Engine");
  const [make, setMake] = useState("");
  const [customMake, setCustomMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [price, setPrice] = useState("");
  const [unitType, setUnitType] = useState<"Piece" | "Weight">("Piece");
  const [quantity, setQuantity] = useState("1");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("Used");

  useEffect(() => {

    if (cameraOpen && videoRef.current && streamRef.current) {

      videoRef.current.srcObject = streamRef.current;

    }

  }, [cameraOpen]);

  useEffect(() => {

    return () => {

      streamRef.current?.getTracks().forEach((track) => track.stop());

    };

  }, []);

  const detectSpareFromImage = async (file: File) => {

    setDetecting(true);

    try {

      const dataUrl: string = await new Promise((resolve, reject) => {

        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);

      });

      const [prefix, base64] = dataUrl.split(",");
      const mediaType = prefix.match(/data:(.*);base64/)?.[1] || "image/jpeg";

      const response = await fetch("/api/detect-spare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, mediaType }),
      });

      const data = await response.json();

      if (response.ok) {

        setTitle(data.title);
        setCategory(data.category);

        if (data.make) {

          if (VEHICLE_MAKES.includes(data.make)) {
            setMake(data.make);
          } else {
            setMake("Other");
            setCustomMake(data.make);
          }

        }

        if (data.model) {

          setModel(data.model);

        }

      }

    } catch (err) {

      console.log(err);

    } finally {

      setDetecting(false);

    }

  };

  const handleImage = (e: any) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    detectSpareFromImage(file);
  };

  const handleOpenCamera = async () => {

    setCameraError("");

    try {

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;
      setCameraOpen(true);

    } catch (err) {

      console.log(err);
      setCameraError("Couldn't access the camera. Check permissions and try again.");

    }

  };

  const handleCloseCamera = () => {

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);

  };

  const handleCapturePhoto = () => {

    const video = videoRef.current;

    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(

      (blob) => {

        if (!blob) return;

        const file = new File([blob], `spare-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        setImage(file);
        setImagePreview(URL.createObjectURL(file));
        detectSpareFromImage(file);
        handleCloseCamera();

      },

      "image/jpeg",
      0.9

    );

  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!user) {
      setError("Please log in to add a listing.");
      return;
    }

    if (!image) {
      setError("Select a photo for your listing.");
      return;
    }

    if (!title.trim()) {
      setError("Enter a title.");
      return;
    }

    const quantityNum =
      unitType === "Weight" ? parseFloat(quantity) : parseInt(quantity, 10);

    if (!Number.isFinite(quantityNum) || quantityNum <= 0) {
      setError(
        unitType === "Weight"
          ? "Enter a valid weight in kg (greater than 0)."
          : "Enter a valid quantity (1 or more)."
      );
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

    try {
      setLoading(true);

      const compressedFile = await imageCompression(image, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      });

      const fileName = `spare-images/${user.uid}_${Date.now()}.jpg`;

      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, compressedFile);

      const imageUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "spareListings"), {
        title,
        category,
        make: resolvedMake || null,
        model: model.trim() || null,
        year: year || null,
        price,
        unitType,
        quantity: quantityNum,
        acquisitionCost: acquisitionCost
          ? parseFloat(acquisitionCost)
          : null,
        description,
        condition,
        status: "Available",
        imageUrl,
        district: sellerDistrict || null,
        sellerId: user.uid,
        sellerPhone: user.phoneNumber,
        createdAt: new Date().toISOString(),
      });

      setSuccess(true);
      setTitle("");
      setMake("");
      setCustomMake("");
      setModel("");
      setYear("");
      setPrice("");
      setUnitType("Piece");
      setQuantity("1");
      setAcquisitionCost("");
      setDescription("");
      setCondition("Used");
      setCategory("Engine");
      setImage(null);
      setImagePreview("");
    } catch (error) {
      console.log(error);
      setError("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-page-header">
          <h1 className="gx-dash-title">Add Spare Part</h1>
          <p className="gx-dash-sub">List a part you have for sale.</p>
        </div>

        <div className="gx-form-card">
          {error && <div className="gx-alert gx-alert-error">{error}</div>}
          {success && (
            <div className="gx-alert gx-alert-success">
              Listing added successfully.
            </div>
          )}

          {cameraOpen && (
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 1000,
                background: "#000",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ flex: 1, width: "100%", objectFit: "cover" }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 16,
                  padding: 20,
                }}
              >
                <button
                  type="button"
                  className="gx-btn gx-btn-outline"
                  onClick={handleCloseCamera}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="gx-btn gx-btn-primary"
                  onClick={handleCapturePhoto}
                >
                  📷 Capture
                </button>
              </div>
            </div>
          )}

          <div className="gx-upload">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImage}
              style={{ display: "none" }}
            />

            {imagePreview ? (
              <div className="gx-upload-preview">
                <img src={imagePreview} alt="Preview" />
                <button
                  type="button"
                  className="gx-upload-preview-change"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change photo
                </button>
              </div>
            ) : (
              <div
                className="gx-upload-box"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="gx-upload-box-icon">📷</div>
                <div className="gx-upload-box-text">
                  Tap to add a photo
                </div>
              </div>
            )}

            <button
              type="button"
              className="gx-btn gx-btn-outline"
              onClick={handleOpenCamera}
              style={{ marginTop: 10, width: "100%" }}
            >
              📷 Open camera
            </button>

            {cameraError && (
              <div className="gx-alert gx-alert-error" style={{ marginTop: 10 }}>
                {cameraError}
              </div>
            )}

            {detecting && (
              <p className="gx-muted" style={{ marginTop: 10 }}>
                <span className="gx-spinner" /> Identifying the part...
              </p>
            )}
          </div>

          <div className="gx-field">
            <label className="gx-label">Title</label>
            <input
              className="gx-input"
              placeholder="e.g. Front brake pad set"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">Category</label>
            <select
              className="gx-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Engine</option>
              <option>Brake</option>
              <option>Electrical</option>
              <option>Tyre</option>
              <option>Suspension</option>
              <option>Body Parts</option>
              <option>Lighting</option>
              <option>Battery</option>
              <option>Oil & Fluids</option>
              <option>Accessories</option>
              <option>Scrap – Aluminum</option>
              <option>Scrap – Copper</option>
              <option>Scrap – Steel</option>
              <option>Scrap – Mixed Metal</option>
              <option>Scrap – Other</option>
            </select>
          </div>

          <div className="gx-field">
            <label className="gx-label">Vehicle make</label>
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
            <label className="gx-label">
              {unitType === "Weight" ? "Price (₹ per kg)" : "Price (₹)"}
            </label>
            <input
              className="gx-input"
              placeholder={unitType === "Weight" ? "e.g. 45" : "e.g. 1200"}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">Sold by</label>
            <div className="gx-role-group">
              <button
                type="button"
                className={
                  "gx-role-option" +
                  (unitType === "Piece" ? " gx-role-option-active" : "")
                }
                onClick={() => {
                  setUnitType("Piece");
                  setQuantity("1");
                }}
              >
                Piece
              </button>

              <button
                type="button"
                className={
                  "gx-role-option" +
                  (unitType === "Weight" ? " gx-role-option-active" : "")
                }
                onClick={() => {
                  setUnitType("Weight");
                  setQuantity("");
                }}
              >
                Weight (kg) — for scrap/bulk lots
              </button>
            </div>
          </div>

          <div className="gx-field">
            <label className="gx-label">
              {unitType === "Weight"
                ? "Quantity in stock (kg)"
                : "Quantity in stock"}
            </label>
            <input
              className="gx-input"
              placeholder={unitType === "Weight" ? "e.g. 250" : "e.g. 1"}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              inputMode="decimal"
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">
              Acquisition cost (₹, optional)
            </label>
            <input
              className="gx-input"
              placeholder="What you paid for it — helps track profit"
              value={acquisitionCost}
              onChange={(e) => setAcquisitionCost(e.target.value)}
              inputMode="numeric"
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">Condition</label>
            <select
              className="gx-input"
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            >
              <option>New</option>
              <option>Used</option>
              <option>Refurbished</option>
              <option>Damaged</option>
            </select>
          </div>

          <div className="gx-field">
            <label className="gx-label">Description</label>
            <textarea
              className="gx-input"
              placeholder="Condition details, reason for selling, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ height: 110, resize: "vertical" }}
            />
          </div>

          <button
            type="button"
            className="gx-btn gx-btn-primary"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <span className="gx-spinner" />}
            {loading ? "Uploading..." : "Submit listing"}
          </button>
        </div>
      </div>
    </div>
  );
}
