"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ConfirmationResult } from "firebase/auth";
import { signOut } from "firebase/auth";

import { sendOTP, verifyOTP, resetPasswordAfterOtp } from "@/services/authService";
import { auth } from "@/lib/firebase";

const RESEND_SECONDS = 30;

export default function ForgotPasswordPage() {

  const router = useRouter();

  const [step, setStep] = useState<"phone" | "otp" | "password" | "done">(
    "phone"
  );
  const [error, setError] = useState("");

  const [phone, setPhone] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {

    if (resendIn <= 0) return;

    const timer = setInterval(() => {

      setResendIn((value) => value - 1);

    }, 1000);

    return () => clearInterval(timer);

  }, [resendIn]);

  const handleSendOtp = async () => {

    setError("");

    if (!phone.trim()) {

      setError("Enter the phone number on your account.");
      return;

    }

    try {

      setSendingOtp(true);

      const result = await sendOTP(phone);

      setConfirmationResult(result);
      setOtpDigits(["", "", "", "", "", ""]);
      setResendIn(RESEND_SECONDS);
      setStep("otp");

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

      setStep("password");

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

  const handleSetPassword = async () => {

    setError("");

    if (newPassword.length < 6) {

      setError("Password must be at least 6 characters.");
      return;

    }

    if (newPassword !== confirmPassword) {

      setError("Passwords don't match.");
      return;

    }

    try {

      setSaving(true);

      await resetPasswordAfterOtp(newPassword);

      setStep("done");

      await signOut(auth);

      setTimeout(() => router.push("/login"), 1500);

    } catch (err) {

      setError(
        err instanceof Error
          ? err.message
          : "Couldn't update your password. Please try again."
      );

    } finally {

      setSaving(false);

    }

  };

  return (

    <div className="gx-shell">

      <div className="gx-card">

        <div className="gx-badge">S</div>

        <h1 className="gx-title">Reset your password</h1>

        <p className="gx-subtitle">
          {step === "phone" &&
            "Enter the phone number linked to your account. We'll text you a code."}
          {step === "otp" && `Enter the 6-digit code sent to ${phone}.`}
          {step === "password" && "Choose a new password."}
          {step === "done" && "Password updated. Redirecting to login..."}
        </p>

        {error && <div className="gx-alert gx-alert-error">{error}</div>}

        {step === "phone" && (

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

          </>

        )}

        {step === "otp" && (

          <>

            <div className="gx-field">

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
              {verifyingOtp ? "Verifying..." : "Verify code"}

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

            </div>

          </>

        )}

        {step === "password" && (

          <>

            <div className="gx-field">

              <label className="gx-label">New password</label>

              <input
                className="gx-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
              />

            </div>

            <div className="gx-field">

              <label className="gx-label">Confirm password</label>

              <input
                className="gx-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                onKeyDown={(e) => {

                  if (e.key === "Enter") handleSetPassword();

                }}
              />

            </div>

            <button
              type="button"
              className="gx-btn gx-btn-primary"
              onClick={handleSetPassword}
              disabled={saving}
            >

              {saving && <span className="gx-spinner" />}
              {saving ? "Saving..." : "Update password"}

            </button>

          </>

        )}

        {step === "done" && (

          <div className="gx-alert gx-alert-success">
            All set — you can log in with your new password.
          </div>

        )}

        <div className="gx-links-row">

          <a href="/login" className="gx-link">
            Back to login
          </a>

        </div>

        <div id="recaptcha-container"></div>

      </div>

    </div>

  );

}
