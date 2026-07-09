"use client";

import { useRef, useState } from "react";

import imageCompression from "browser-image-compression";

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { addDoc, collection } from "firebase/firestore";

import { storage, db } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

export default function AddSparePage() {
  const { user } = useAuth();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Engine");
  const [vehicle, setVehicle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [condition, setCondition] = useState("Used");

  const handleImage = (e: any) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
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
        vehicle,
        price,
        description,
        condition,
        imageUrl,
        sellerId: user.uid,
        sellerPhone: user.phoneNumber,
        createdAt: new Date().toISOString(),
      });

      setSuccess(true);
      setTitle("");
      setVehicle("");
      setPrice("");
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
            </select>
          </div>

          <div className="gx-field">
            <label className="gx-label">Vehicle</label>
            <input
              className="gx-input"
              placeholder="e.g. Toyota Innova"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">Price (₹)</label>
            <input
              className="gx-input"
              placeholder="e.g. 1200"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
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
