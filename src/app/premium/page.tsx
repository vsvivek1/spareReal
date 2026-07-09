"use client";

import Link from "next/link";

export default function PremiumPage() {
  return (
    <div className="gx-page">
      <div className="gx-status-wrap">
        <div className="gx-status-card">
          <div className="gx-status-icon gx-status-icon-neutral">⭐</div>

          <h1 className="gx-title">Sell smarter with Premium</h1>

          <p className="gx-subtitle">
            Get seen first, get contacted faster, and list without limits.
          </p>

          <ul
            className="gx-plan-features"
            style={{ textAlign: "left", marginBottom: 24 }}
          >
            <li>✓ Direct contact access to buyers</li>
            <li>✓ Unlimited photos per listing</li>
            <li>✓ Featured, priority-visibility listings</li>
            <li>✓ Unlimited spare part listings</li>
          </ul>

          <Link href="/pricing">
            <button className="gx-btn gx-btn-primary">See plans</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
