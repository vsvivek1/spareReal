"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/contexts/AuthContext";

import { currentPath, loginHref } from "@/lib/loginRedirect";

// Shows a log-in prompt instead of the page for signed-out visitors, so
// nobody fills in a whole form only to be told to log in at the end.
// After signing in they come straight back here.
export default function RequireLogin({
  children,
  message = "Log in to continue.",
}: {
  children: React.ReactNode;
  message?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

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

  if (!user) {
    return (
      <div className="gx-page">
        <div className="gx-container">
          <div className="gx-empty-state">
            <div className="gx-empty-state-icon">🔑</div>
            <h2 className="gx-empty-state-title">Log in first</h2>
            <p className="gx-empty-state-text">{message}</p>
            <button
              type="button"
              className="gx-btn gx-btn-primary"
              style={{ width: "auto", margin: "0 auto" }}
              onClick={() => router.push(loginHref(currentPath()))}
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
