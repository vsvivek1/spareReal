"use client";

import { useState } from "react";

import {
  sendOTP,
  verifyOTP
} from "@/services/authService";
import { MSG91_CAPTCHA_CONTAINER_ID } from "@/lib/msg91Widget";

export default function LoginPage() {

  const [phone,
    setPhone] =
    useState("+919876543210");

  const [otp,
    setOtp] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const handleSendOTP = async () => {

    if (loading)
      return;

    try {

      setLoading(true);

      await sendOTP(phone);

      alert(
        "OTP sent"
      );

    }
    catch (error: any) {

      console.log(
        "Code:",
        error.code
      );

      console.log(
        "Message:",
        error.message
      );

      alert(
        error.code
      );

    }
    finally {

      setLoading(false);

    }
  };

  const handleVerify = async () => {

    try {

      const result =
        await verifyOTP(
          phone,
          otp
        );

      console.log(
        result.user
      );

      alert(
        "Login successful"
      );

    }
    catch (error: any) {

      console.log(
        error
      );

      alert(
        error.code
      );

    }

  };

  return (

    <div
      style={{
        padding: "30px"
      }}
    >

      <div id={MSG91_CAPTCHA_CONTAINER_ID}></div>

      <h1>
        spareX Login
      </h1>

      <br />

      <input
        value={phone}
        placeholder="+919876543210"
        onChange={(e) =>
          setPhone(
            e.target.value
          )
        }
      />

      <br /><br />

      <button
        onClick={
          handleSendOTP
        }
        disabled={
          loading
        }
      >

        {
          loading
            ? "Sending..."
            : "Send OTP"
        }

      </button>

      <br /><br />

      <input
        value={otp}
        placeholder="OTP"
        onChange={(e) =>
          setOtp(
            e.target.value
          )
        }
      />

      <br /><br />

      <button
        onClick={
          handleVerify
        }
      >
        Verify OTP
      </button>

    </div>

  );

}