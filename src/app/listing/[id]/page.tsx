"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import Link from "next/link";

import { doc, getDoc } from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useAuth } from "@/contexts/AuthContext";

import { getUserProfile } from "@/services/userService";

import { getSellerReviews, submitReview } from "@/services/reviewService";

import { formatVehicleLabel } from "@/lib/vehicleMakes";

import { whatsAppLink } from "@/lib/contact";

const statusClass: Record<string, string> = {
  Available: "gx-status-available",
  Booked: "gx-status-booked",
  "Sold Out": "gx-status-soldout",
};

function StarRow({
  value,
  onChange,
}: {
  value: number;
  onChange?: (n: number) => void;
}) {
  return (
    <div className="gx-star-row">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={"gx-star-btn" + (n <= value ? " filled" : "")}
          onClick={onChange ? () => onChange(n) : undefined}
          style={{ cursor: onChange ? "pointer" : "default" }}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user } = useAuth();

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [reviews, setReviews] = useState<any[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const loadReviews = async (sellerId: string) => {
    const { reviews, average, count } = await getSellerReviews(sellerId);
    setReviews(reviews);
    setAvgRating(average);
    setReviewCount(count);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const snapshot = await getDoc(doc(db, "spareListings", id));

        if (!snapshot.exists()) {
          setNotFound(true);
          return;
        }

        const data = { id: snapshot.id, ...snapshot.data() } as any;
        setListing(data);

        // Reviews failing to load should never hide the listing itself.
        loadReviews(data.sellerId);
      } catch (error) {
        console.log(error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  const handleSubmitReview = async () => {
    setReviewError("");
    setReviewSuccess(false);

    if (!user) {
      setReviewError("Please log in to leave a review.");
      return;
    }

    if (myRating === 0) {
      setReviewError("Pick a star rating.");
      return;
    }

    try {
      setSubmitting(true);

      const profile = await getUserProfile(user.uid);

      await submitReview({
        sellerId: listing.sellerId,
        raterId: user.uid,
        raterName: profile?.name || "spareX user",
        rating: myRating,
        comment: myComment.trim(),
        listingId: listing.id,
      });

      setReviewSuccess(true);
      setMyRating(0);
      setMyComment("");
      await loadReviews(listing.sellerId);
    } catch (error) {
      console.log(error);
      setReviewError(
        error instanceof Error
          ? error.message
          : "Couldn't submit your review. Please try again."
      );
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

  if (notFound || !listing) {
    return (
      <div className="gx-page">
        <div className="gx-status-wrap">
          <div className="gx-status-card">
            <div className="gx-status-icon gx-status-icon-neutral">🔍</div>
            <h1 className="gx-title">Listing not found</h1>
            <p className="gx-subtitle">
              This listing may have been sold or removed.
            </p>
            <button
              className="gx-btn gx-btn-primary"
              onClick={() => router.push("/ground")}
            >
              Back to browse
            </button>
          </div>
        </div>
      </div>
    );
  }

  const status = listing.status || "Available";
  const unit = listing.unitType === "Weight" ? "kg" : "pc";
  const quantity = listing.quantity ?? 1;
  const isOwnListing = user?.uid === listing.sellerId;

  return (
    <div className="gx-page">
      <div className="gx-container" style={{ maxWidth: 920 }}>
        <button
          className="gx-back-link"
          onClick={() => router.back()}
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          ← Back
        </button>

        <div className="gx-detail-grid">
          <div className="gx-detail-image">
            <img src={listing.imageUrl} alt={listing.title} />
            {listing.condition && (
              <span className="gx-badge-pill">{listing.condition}</span>
            )}
          </div>

          <div className="gx-detail-info">
            <span
              className={
                "gx-status-badge " +
                (statusClass[status] || "gx-status-available")
              }
            >
              {status}
            </span>

            <h1 className="gx-detail-title">{listing.title}</h1>

            <p className="gx-detail-meta">
              {formatVehicleLabel(listing)}
              {listing.category ? ` · ${listing.category}` : ""}
              {listing.district ? ` · 📍 ${listing.district}` : ""}
            </p>

            {listing.vehicleId && (
              <Link
                href={`/vehicle/${listing.vehicleId}`}
                className="gx-location-hint"
                style={{ display: "inline-block", marginBottom: 14 }}
              >
                See other parts from this vehicle →
              </Link>
            )}

            <p className="gx-detail-price">
              ₹{listing.price}
              {listing.unitType === "Weight" ? "/kg" : ""}
              <span>
                {" "}
                · {quantity} {unit} available
              </span>
            </p>

            {listing.description && (
              <p className="gx-detail-desc">{listing.description}</p>
            )}

            <div className="gx-seller-card">
              <div className="gx-seller-card-label">Seller</div>
              <div className="gx-seller-card-phone">
                {listing.sellerPhone || "Not available"}
              </div>

              {reviewCount > 0 ? (
                <div
                  className="gx-rating-summary"
                  style={{ marginBottom: 14 }}
                >
                  ⭐ {avgRating.toFixed(1)}
                  <span className="gx-rating-summary-count">
                    ({reviewCount} review{reviewCount === 1 ? "" : "s"})
                  </span>
                </div>
              ) : (
                <p
                  className="gx-location-hint"
                  style={{ marginTop: 0, marginBottom: 14 }}
                >
                  No reviews yet
                </p>
              )}

              {listing.sellerPhone && status === "Available" && (
                <div className="gx-detail-actions">
                  <a
                    href={`tel:${listing.sellerPhone}`}
                    className="gx-btn gx-btn-primary"
                  >
                    📞 Call Seller
                  </a>

                  <a
                    href={whatsAppLink(
                      listing.sellerPhone,
                      `Hi, I'm interested in your spareX listing: ${listing.title}`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="gx-btn gx-btn-outline"
                  >
                    💬 WhatsApp
                  </a>
                </div>
              )}

              {status !== "Available" && (
                <p className="gx-location-hint" style={{ marginTop: 10 }}>
                  This item is {status.toLowerCase()} and not currently
                  available to contact about.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="gx-review-section">
          <div className="gx-section-head">
            <h2 className="gx-section-title">Seller reviews</h2>
          </div>

          {!isOwnListing && (
            <div className="gx-review-form">
              {reviewError && (
                <div className="gx-alert gx-alert-error">{reviewError}</div>
              )}
              {reviewSuccess && (
                <div className="gx-alert gx-alert-success">
                  Thanks for the feedback!
                </div>
              )}

              <label
                className="gx-label"
                style={{ display: "block", marginBottom: 8 }}
              >
                Rate this seller
              </label>

              <StarRow value={myRating} onChange={setMyRating} />

              <textarea
                className="gx-input"
                placeholder="Optional — how was the part/dealing with this seller?"
                value={myComment}
                onChange={(e) => setMyComment(e.target.value)}
                style={{ height: 80, resize: "vertical", marginTop: 12 }}
              />

              <button
                type="button"
                className="gx-btn gx-btn-primary"
                onClick={handleSubmitReview}
                disabled={submitting}
                style={{ marginTop: 12, width: "auto" }}
              >
                {submitting && <span className="gx-spinner" />}
                {submitting ? "Submitting..." : "Submit review"}
              </button>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="gx-location-hint">
              This seller hasn't been reviewed yet.
            </p>
          ) : (
            <div>
              {reviews.map((review) => (
                <div className="gx-review-card" key={review.id}>
                  <div className="gx-review-head">
                    <span className="gx-review-name">
                      {review.raterName}
                    </span>
                    <span className="gx-review-date">
                      {new Date(review.createdAt).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </span>
                  </div>

                  <StarRow value={review.rating} />

                  {review.comment && (
                    <p className="gx-review-comment">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
