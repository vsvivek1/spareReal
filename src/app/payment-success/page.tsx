"use client";

import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="gx-page">
      <div className="gx-status-wrap">
        <div className="gx-status-card">
          <div className="gx-status-icon gx-status-icon-success">✓</div>

          <h1 className="gx-title">Payment successful</h1>

          <p className="gx-subtitle">
            You're now on the Premium plan. Enjoy unlimited listings, direct
            contact access, and priority visibility.
          </p>

          <Link href="/">
            <button className="gx-btn gx-btn-primary">Go to home</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
