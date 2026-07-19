"use client";

// Registering a workshop is now part of the generic "List my service" flow.
// Redirect old links to it with the Workshop type preselected.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddWorkshopRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/add-service?type=workshop");
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
