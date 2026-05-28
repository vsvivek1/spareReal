"use client";

import { useState } from "react";
import { sendOTP, verifyOTP } from "@/services/authService";

export default function LoginPage() {

  const [phone, setPhone] =
    useState("+919496010722");

  const [otp, setOtp] =
    useState("");

  const [confirmationResult,
    setConfirmationResult] =
    useState<any>(null);

  const handleSendOTP = async () => {

    try {

      const result =
        await sendOTP(phone);

      setConfirmationResult(result);

      alert("OTP sent");

    } catch (error) {

      console.log(error);

    }
  };

  const handleVerify = async () => {

    try {

      const user =
        await verifyOTP(
          confirmationResult,
          otp
        );

      console.log(user);

      alert("Login success");

    } catch (error: unknown) {

      if (error instanceof Error) {
        console.log(
          error.message
        );
      }

    }
  };

  return (

    <div style={{ padding: "20px" }}>

      <h1>spareX Login</h1>

      <input
        value={phone}
        onChange={(e) =>
          setPhone(e.target.value)
        }
        placeholder="+919496010722"
      />

      <button
        onClick={handleSendOTP}
      >
        Send OTP
      </button>

      <br /><br />

      <input
        value={otp}
        onChange={(e) =>
          setOtp(e.target.value)
        }
        placeholder="OTP"
      />

      <button
        onClick={handleVerify}
      >
        Verify OTP
      </button>

      <div id="recaptcha-container"></div>

    </div>

  );
}