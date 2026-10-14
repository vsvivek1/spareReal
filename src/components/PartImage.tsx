"use client";

import { useState } from "react";

// Listing photo that falls back to a placeholder when the listing has no
// photo or the image fails to load, instead of a broken-image icon.
export default function PartImage({
  src,
  alt,
}: {
  src?: string | null;
  alt?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="gx-part-image-placeholder" role="img" aria-label={alt || "No photo"}>
        🔧
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || ""}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
