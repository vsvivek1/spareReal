"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

import {
  bookableDates,
  formatDateLabel,
  formatTimeLabel,
  isBookableSlug,
} from "@/lib/booking";

import {
  createBooking,
  getSlotAvailability,
  type SlotAvailability,
} from "@/services/bookingService";

export default function BookSlotPage() {
  const params = useParams();
  const id = String(params.id || "");
  const router = useRouter();

  const { user } = useAuth();

  const dates = bookableDates();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [date, setDate] = useState(dates[0]);
  const [slots, setSlots] = useState<SlotAvailability[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [time, setTime] = useState("");

  const [vehicle, setVehicle] = useState("");
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "workshops", id));
        setService(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      } catch (loadError) {
        console.log(loadError);
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  useEffect(() => {
    if (!service) return;

    const loadSlots = async () => {
      setSlotsLoading(true);
      setTime("");
      setError("");

      try {
        setSlots(await getSlotAvailability(id, date));
      } catch (slotError) {
        setSlots([]);
        setError(
          slotError instanceof Error ? slotError.message : "Couldn't load slots."
        );
      } finally {
        setSlotsLoading(false);
      }
    };

    loadSlots();
  }, [service, id, date]);

  const handleBook = async () => {
    setError("");

    if (!user) {
      router.push("/login");
      return;
    }

    if (!time) {
      setError("Pick a time slot.");
      return;
    }

    if (!vehicle.trim()) {
      setError("Tell them which vehicle you're bringing.");
      return;
    }

    try {
      setSubmitting(true);
      await createBooking({ serviceId: id, date, time, vehicle, note });
      router.push("/my-account?tab=bookings");
    } catch (bookError) {
      setError(
        bookError instanceof Error
          ? bookError.message
          : "Couldn't book that slot. Please try again."
      );

      // Someone may have taken it meanwhile — refresh the grid.
      getSlotAvailability(id, date).then(setSlots).catch(() => {});
    } finally {
      setSubmitting(false);
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

  if (!service || !isBookableSlug(service.typeSlug || "workshop")) {
    return (
      <div className="gx-page">
        <div className="gx-container">
          <div className="gx-empty-state">
            <div className="gx-empty-state-icon">📅</div>
            <h2 className="gx-empty-state-title">Booking not available</h2>
            <p className="gx-empty-state-text">
              This service doesn&apos;t take slot bookings.
            </p>
            <Link href="/services">
              <button
                className="gx-btn gx-btn-primary"
                style={{ width: "auto", margin: "0 auto" }}
              >
                Back to Services
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = user?.uid === service.ownerId;

  return (
    <div className="gx-page">
      <div className="gx-container" style={{ maxWidth: 720 }}>
        <div className="gx-page-header">
          <h1 className="gx-dash-title">📅 Book a slot</h1>
          <p className="gx-dash-sub">
            {service.name}
            {service.district ? ` · ${service.district}` : ""}
          </p>
        </div>

        <div className="gx-form-card">
          <div className="gx-field">
            <label className="gx-label">Day</label>
            <div className="gx-role-group">
              {dates.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={
                    "gx-role-option" + (d === date ? " gx-role-option-active" : "")
                  }
                  onClick={() => setDate(d)}
                >
                  {formatDateLabel(d)}
                </button>
              ))}
            </div>
          </div>

          <div className="gx-field">
            <label className="gx-label">Time</label>

            {slotsLoading ? (
              <p className="gx-muted">
                <span className="gx-spinner" /> Checking free slots...
              </p>
            ) : slots.length === 0 ? (
              <p className="gx-muted">No slots on this day.</p>
            ) : (
              <div className="gx-role-group">
                {slots.map((s) => {
                  const left = s.capacity - s.booked;
                  const disabled = s.past || left <= 0;

                  return (
                    <button
                      key={s.time}
                      type="button"
                      disabled={disabled}
                      className={
                        "gx-role-option" +
                        (s.time === time ? " gx-role-option-active" : "")
                      }
                      style={disabled ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                      onClick={() => setTime(s.time)}
                    >
                      {formatTimeLabel(s.time)}
                      {!s.past && (
                        <span style={{ display: "block", fontSize: 11, fontWeight: 500 }}>
                          {left <= 0 ? "Full" : `${left} free`}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="gx-field">
            <label className="gx-label">Your vehicle</label>
            <input
              className="gx-input"
              placeholder="e.g. Maruti Swift 2016, KL-07-AB-1234"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
            />
          </div>

          <div className="gx-field">
            <label className="gx-label">What needs doing? (optional)</label>
            <textarea
              className="gx-input"
              placeholder="e.g. General service, brake noise"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{ height: 90, resize: "vertical" }}
            />
          </div>

          {error && <div className="gx-alert gx-alert-error">{error}</div>}

          {isOwner ? (
            <div className="gx-alert gx-alert-error">
              This is your own service, so you can&apos;t book it.
            </div>
          ) : (
            <button
              className="gx-btn gx-btn-primary"
              onClick={handleBook}
              disabled={submitting}
            >
              {submitting && <span className="gx-spinner" />}
              {!user
                ? "Log in to book"
                : time
                ? `Book ${formatDateLabel(date)}, ${formatTimeLabel(time)}`
                : "Book this slot"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
