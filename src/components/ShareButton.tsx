"use client";

import { useState } from "react";

// Shares the current page with the device share sheet; where that's not
// available it copies the link, with WhatsApp as a one-tap alternative.
export default function ShareButton({
  title,
  text,
}: {
  title: string;
  text?: string;
}) {
  const [copied, setCopied] = useState(false);

  const url = typeof window === "undefined" ? "" : window.location.href;
  const message = `${text || title} ${url}`.trim();

  const share = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: text || title, url });
        return;
      } catch {
        // Cancelled: fall through to copy so the tap still does something.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank",
        "noopener,noreferrer"
      );
    }
  };

  return (
    <button
      type="button"
      className="gx-btn gx-btn-outline"
      style={{ width: "auto" }}
      onClick={share}
    >
      {copied ? "✓ Link copied" : "↗ Share"}
    </button>
  );
}
