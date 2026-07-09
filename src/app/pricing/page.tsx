"use client";

import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="gx-page">
      <div className="gx-container" style={{ textAlign: "center" }}>
        <div className="gx-page-header">
          <h1 className="gx-dash-title">Simple, transparent pricing</h1>
          <p className="gx-dash-sub">
            Upgrade when you're ready to sell more, faster.
          </p>
        </div>

        <div className="gx-plan-grid">
          <div className="gx-plan-card">
            <p className="gx-plan-name">Free</p>
            <p className="gx-plan-price">
              ₹0<span>/month</span>
            </p>
            <p className="gx-plan-sub">Everything you need to get started.</p>

            <ul className="gx-plan-features">
              <li>✓ Browse all spare parts &amp; workshops</li>
              <li>✓ Post requests for parts you need</li>
              <li>✓ List up to 5 spare parts</li>
              <li>✓ Standard listing visibility</li>
            </ul>

            <button className="gx-btn gx-btn-outline" disabled>
              Current plan
            </button>
          </div>

          <div className="gx-plan-card gx-plan-card-featured">
            <span className="gx-plan-badge">Popular</span>

            <p className="gx-plan-name">Premium</p>
            <p className="gx-plan-price">
              ₹299<span>/month</span>
            </p>
            <p className="gx-plan-sub">
              For active sellers who want more reach.
            </p>

            <ul className="gx-plan-features">
              <li>✓ Direct contact access to buyers</li>
              <li>✓ Unlimited photos per listing</li>
              <li>✓ Featured, priority-visibility listings</li>
              <li>✓ Unlimited spare part listings</li>
            </ul>

            <Link href="/payment-success">
              <button className="gx-btn gx-btn-primary">Upgrade now</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
