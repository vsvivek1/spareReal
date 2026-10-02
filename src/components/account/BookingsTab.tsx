"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { useAuth } from "@/contexts/AuthContext";

import { formatDateLabel, formatTimeLabel, todayIST } from "@/lib/booking";
import { whatsAppLink } from "@/lib/contact";

import {
  cancelServiceBooking,
  getBookingsForMyServices,
  getMyBookings,
} from "@/services/bookingService";

export default function BookingsTab() {
  const { user } = useAuth();

  const [mine, setMine] = useState<any[]>([]);
  const [incoming, setIncoming] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const [myBookings, serviceBookings] = await Promise.all([
        getMyBookings(user.uid),
        getBookingsForMyServices(user.uid),
      ]);
      setMine(myBookings);
      setIncoming(serviceBookings);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;

    setActionId(id);

    try {
      await cancelServiceBooking(id);
      await load();
    } catch (error) {
      console.log(error);
      alert("Couldn't cancel this booking. Please try again.");
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

  const today = todayIST();

  const renderCard = (b: any, asOwner: boolean) => {
    const upcoming = b.status === "booked" && b.date >= today;
    const contactPhone = asOwner ? b.customerPhone : b.servicePhone;

    return (
      <div className="gx-request-card" key={b.id}>
        <h3 className="gx-request-title">
          {asOwner ? b.customerName : b.serviceName}
        </h3>

        <p className="gx-part-meta">
          📅 {formatDateLabel(b.date)} · {formatTimeLabel(b.time)}
          {asOwner ? ` · ${b.serviceName}` : ""}
        </p>
        <p className="gx-part-meta">🚗 {b.vehicle}</p>
        {b.note && <p className="gx-request-desc">{b.note}</p>}

        <span
          className={
            "gx-status-badge " +
            (b.status === "cancelled" ? "gx-status-soldout" : "gx-status-available")
          }
          style={{ position: "static", display: "inline-block", marginTop: 6 }}
        >
          {b.status === "cancelled" ? "Cancelled" : upcoming ? "Booked" : "Done"}
        </span>

        {upcoming && (
          <div className="gx-detail-actions" style={{ marginTop: 12 }}>
            {contactPhone && (
              <a
                href={whatsAppLink(
                  contactPhone,
                  `Hi, about the spareX booking on ${formatDateLabel(b.date)} at ${formatTimeLabel(b.time)}.`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="gx-btn gx-btn-outline"
              >
                💬 WhatsApp
              </a>
            )}
            <button
              className="gx-btn gx-btn-danger-outline"
              onClick={() => handleCancel(b.id)}
              disabled={actionId === b.id}
            >
              {actionId === b.id ? "..." : "Cancel"}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="gx-section-title" style={{ marginTop: 8 }}>
        My bookings
      </h2>

      {mine.length === 0 ? (
        <div className="gx-empty-state">
          <div className="gx-empty-state-icon">📅</div>
          <h2 className="gx-empty-state-title">No bookings yet</h2>
          <p className="gx-empty-state-text">
            Book a slot at a workshop, washing or painting center.
          </p>
          <Link href="/services">
            <button
              className="gx-btn gx-btn-primary"
              style={{ width: "auto", margin: "0 auto" }}
            >
              Find a service
            </button>
          </Link>
        </div>
      ) : (
        <div className="gx-grid">{mine.map((b) => renderCard(b, false))}</div>
      )}

      {incoming.length > 0 && (
        <>
          <h2 className="gx-section-title" style={{ marginTop: 28 }}>
            Bookings at my services
          </h2>
          <div className="gx-grid">
            {incoming.map((b) => renderCard(b, true))}
          </div>
        </>
      )}
    </div>
  );
}
