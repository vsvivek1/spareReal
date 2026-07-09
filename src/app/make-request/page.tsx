"use client";

import { useState } from "react";

import { addDoc, collection } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

export default function MakeRequestPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [sparePart, setSparePart] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [condition, setCondition] = useState("Used");

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!user) {
      setError("Please log in to post a request.");
      return;
    }

    if (!sparePart.trim()) {
      setError("Enter the spare part you're looking for.");
      return;
    }

    try {
      setLoading(true);

      await addDoc(collection(db, "spareRequests"), {
        brand,
        model,
        year,
        sparePart,
        description,
        budget,
        condition,
        requesterId: user.uid,
        requesterPhone: user.phoneNumber,
        createdAt: new Date().toISOString(),
      });

      setSuccess(true);
      setBrand("");
      setModel("");
      setYear("");
      setSparePart("");
      setDescription("");
      setBudget("");
      setCondition("Used");
    } catch (error) {
      console.log(error);
      setError("Couldn't submit your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gx-page">
      <div className="gx-container">
        <div className="gx-page-header">
          <h1 className="gx-dash-title">Request a Spare Part</h1>
          <p className="gx-dash-sub">
            Tell sellers what you need and they'll reach out to you.
          </p>
        </div>

        <div className="gx-form-card">
          {error && <div className="gx-alert gx-alert-error">{error}</div>}
          {success && (
            <div className="gx-alert gx-alert-success">
              Request posted. Sellers can now find and contact you.
            </div>
          )}

          <div className="gx-field">
            <label className="gx-label">Spare part needed</label>
            <input
              className="gx-input"
              placeholder="e.g. Brake pad"
              value={sparePart}
              onChange={(e) => setSparePart(e.target.value)}
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">Vehicle brand</label>
            <input
              className="gx-input"
              placeholder="e.g. Toyota"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
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
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">Budget (₹)</label>
            <input
              className="gx-input"
              placeholder="e.g. 1500"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
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
            </select>
          </div>

          <div className="gx-field">
            <label className="gx-label">Description</label>
            <textarea
              className="gx-input"
              placeholder="Any extra detail that helps sellers match your request"
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
            {loading ? "Submitting..." : "Submit request"}
          </button>
        </div>
      </div>
    </div>
  );
}
