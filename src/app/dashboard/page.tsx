"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="gx-page">
      <div className="gx-status-wrap">
        <div className="gx-status-card">
          <div className="gx-status-icon gx-status-icon-neutral">🚧</div>

          <h1 className="gx-title">Dashboard coming soon</h1>

          <p className="gx-subtitle">
            Seller analytics and insights are on the way. In the meantime,
            check your listings and requests.
          </p>

          <Link href="/my-listings">
            <button className="gx-btn gx-btn-primary">
              View my listings
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
