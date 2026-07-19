"use client";

// Workshops are now a category under Services. Keep this route working for
// old links/bookmarks by redirecting to the Workshop services page.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function WorkshopsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/services/workshop");
  }, [router]);

  return (
    <div className="gx-page">
      <div className="gx-page-center">
        <span className="gx-spinner" />
        Redirecting...
      </div>
    </div>
  );
}
