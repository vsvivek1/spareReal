"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { signInWithGoogle } from "@/services/authService";

import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {

  const router = useRouter();
  const { user, loading } = useAuth();

  const [error, setError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {

    if (!loading && user) {

      router.push("/");

    }

  }, [user, loading, router]);

  const handleGoogleSignIn = async () => {

    setError("");

    try {

      setGoogleLoading(true);

      await signInWithGoogle();

      router.push("/");

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Couldn't sign in with Google. Please try again."
      );

    } finally {

      setGoogleLoading(false);

    }

  };

  return (

    <div className="gx-shell">

      <div className="gx-card">

        <div className="gx-badge">S</div>

        <h1 className="gx-title">Welcome to spareX</h1>

        <p className="gx-subtitle">
          Sign in with Google to get started.
        </p>

        {error && (

          <div className="gx-alert gx-alert-error">
            {error}
          </div>

        )}

        <button
          type="button"
          className="gx-btn gx-btn-primary"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
        >

          {googleLoading && <span className="gx-spinner" />}
          {googleLoading ? "Signing in..." : "Continue with Google"}

        </button>

      </div>

    </div>

  );

}
