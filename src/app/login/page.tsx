"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ConfirmationResult } from "firebase/auth";

import {
  sendOTP,
  verifyOTP,
  loginWithPassword
} from "@/services/authService";

import { useAuth } from "@/contexts/AuthContext";

const RESEND_SECONDS = 30;

export default function LoginPage() {

  const router = useRouter();
  const { user, loading } = useAuth();

  const [mode, setMode] = useState<"password" | "otp">("password");
  const [error, setError] = useState("");

  // password mode
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  // otp mode
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {

    if (!loading && user) {

      router.push("/");

    }

  }, [user, loading, router]);

  useEffect(() => {

    if (resendIn <= 0) return;

    const timer = setInterval(() => {

      setResendIn((value) => value - 1);

    }, 1000);

    return () => clearInterval(timer);

  }, [resendIn]);

  const switchMode = (nextMode: "password" | "otp") => {

    setMode(nextMode);
    setError("");

  };

  const handlePasswordLogin = async () => {

    setError("");

    if (!username.trim() || !password) {

      setError("Enter your username and password.");
      return;

    }

    try {

      setLoggingIn(true);

      await loginWithPassword(username, password);

      router.push("/");

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Couldn't log you in. Please try again."
      );

    } finally {

      setLoggingIn(false);

    }

  };

  const handleSendOtp = async () => {

    setError("");

    if (!phone.trim()) {

      setError("Enter your phone number.");
      return;

    }

    try {

      setSendingOtp(true);

      const result = await sendOTP(phone);

      setConfirmationResult(result);
      setOtpDigits(["", "", "", "", "", ""]);
      setResendIn(RESEND_SECONDS);

      setTimeout(() => otpInputRefs.current[0]?.focus(), 50);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Couldn't send the code. Please try again."
      );

    } finally {

      setSendingOtp(false);

    }

  };

  const handleOtpDigitChange = (index: number, rawValue: string) => {

    const value = rawValue.replace(/\D/g, "").slice(-1);

    setOtpDigits((prev) => {

      const next = [...prev];
      next[index] = value;
      return next;

    });

    if (value && index < 5) {

      otpInputRefs.current[index + 1]?.focus();

    }

  };

  const handleOtpKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {

    if (event.key === "Backspace" && !otpDigits[index] && index > 0) {

      otpInputRefs.current[index - 1]?.focus();

    }

  };

  const handleVerifyOtp = async () => {

    setError("");

    const otp = otpDigits.join("");

    if (!confirmationResult || otp.length !== 6) {

      setError("Enter the 6-digit code.");
      return;

    }

    try {

      setVerifyingOtp(true);

      await verifyOTP(confirmationResult, otp);

      router.push("/");

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Couldn't verify that code. Please try again."
      );

    } finally {

      setVerifyingOtp(false);

    }

  };

  return (

    <div className="gx-shell">

      <div className="gx-card">

        <div className="gx-badge">S</div>

        <h1 className="gx-title">Welcome to spareX</h1>

        <p className="gx-subtitle">
          {mode === "password"
            ? "Log in with your username and password."
            : "New here? Verify your phone number to get started."}
        </p>

        <div className="gx-tabs">

          <button
            type="button"
            className={
              "gx-tab" +
              (mode === "password" ? " gx-tab-active" : "")
            }
            onClick={() => switchMode("password")}
          >
            Log in
          </button>

          <button
            type="button"
            className={
              "gx-tab" +
              (mode === "otp" ? " gx-tab-active" : "")
            }
            onClick={() => switchMode("otp")}
          >
            New user
          </button>

        </div>

        {error && (

          <div className="gx-alert gx-alert-error">
            {error}
          </div>

        )}

        {mode === "password" && (

          <>

            <div className="gx-field">

              <label className="gx-label">Username</label>

              <input
                className="gx-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourusername"
                autoComplete="username"
                autoCapitalize="none"
              />

            </div>

            <div className="gx-field">

              <label className="gx-label">Password</label>

              <div className="gx-input-group">

                <input
                  className="gx-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onKeyDown={(e) => {

                    if (e.key === "Enter") handlePasswordLogin();

                  }}
                />

                <button
                  type="button"
                  className="gx-input-icon-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? "🙈" : "👁"}
                </button>

              </div>

            </div>

            <button
              type="button"
              className="gx-btn gx-btn-primary"
              onClick={handlePasswordLogin}
              disabled={loggingIn}
            >

              {loggingIn && <span className="gx-spinner" />}
              {loggingIn ? "Logging in..." : "Log in"}

            </button>

            <div className="gx-links-row">

              <a href="/forgot-password" className="gx-link">
                Forgot password?
              </a>

              <button
                type="button"
                className="gx-link"
                onClick={() => switchMode("otp")}
              >
                First time here?
              </button>

            </div>

          </>

        )}

        {mode === "otp" && !confirmationResult && (

          <>

            <div className="gx-field">

              <label className="gx-label">Phone number</label>

              <input
                className="gx-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9496010722"
                inputMode="tel"
                autoComplete="tel"
              />

            </div>

            <button
              type="button"
              className="gx-btn gx-btn-primary"
              onClick={handleSendOtp}
              disabled={sendingOtp}
            >

              {sendingOtp && <span className="gx-spinner" />}
              {sendingOtp ? "Sending..." : "Send OTP"}

            </button>

            <div className="gx-links-row">

              <button
                type="button"
                className="gx-link"
                onClick={() => switchMode("password")}
              >
                Already have a password? Log in
              </button>

            </div>

          </>

        )}

        {mode === "otp" && confirmationResult && (

          <>

            <div className="gx-field">

              <label className="gx-label">
                Enter the 6-digit code sent to {phone}
              </label>

              <div className="gx-otp-row">

                {otpDigits.map((digit, index) => (

                  <input
                    key={index}
                    ref={(el) => {
                      otpInputRefs.current[index] = el;
                    }}
                    className="gx-otp-box"
                    value={digit}
                    onChange={(e) =>
                      handleOtpDigitChange(index, e.target.value)
                    }
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    inputMode="numeric"
                    maxLength={1}
                  />

                ))}

              </div>

            </div>

            <button
              type="button"
              className="gx-btn gx-btn-primary"
              onClick={handleVerifyOtp}
              disabled={verifyingOtp}
            >

              {verifyingOtp && <span className="gx-spinner" />}
              {verifyingOtp ? "Verifying..." : "Verify & continue"}

            </button>

            <div className="gx-links-row">

              <button
                type="button"
                className="gx-link"
                onClick={handleSendOtp}
                disabled={resendIn > 0 || sendingOtp}
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
              </button>

              <button
                type="button"
                className="gx-link"
                onClick={() => setConfirmationResult(null)}
              >
                Change number
              </button>

            </div>

          </>

        )}

        <div id="recaptcha-container"></div>

      </div>

    </div>

  );

}
