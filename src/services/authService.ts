import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithCredential,
  signInWithEmailAndPassword,
  updatePassword,
  EmailAuthProvider,
  ConfirmationResult
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import { normalizePhone, getUserByUsername } from "@/services/userService";

let recaptchaVerifier: RecaptchaVerifier | null = null;

// Firebase Auth has no native "username" concept, so every phone-verified
// account is also linked to a synthetic email credential (this address) —
// that's what lets username+password sign-in work without a custom backend.
export const phoneToPseudoEmail = (phone: string) => {

  return `${normalizePhone(phone)}@sparex.app.local`;

};

// Accepts "9496010722" or "+919496010722" and returns E.164 (+91XXXXXXXXXX).
export const formatPhoneE164 = (raw: string) => {

  const trimmed = raw.trim();

  if (trimmed.startsWith("+")) {

    return "+" + trimmed.replace(/\D/g, "");

  }

  const digits = trimmed.replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {

    return "+" + digits;

  }

  return "+91" + digits;

};

const resetRecaptcha = () => {

  try {

    recaptchaVerifier?.clear();

  } catch {

    // ignore — element may already be gone
  }

  recaptchaVerifier = null;

};

const getRecaptcha = () => {

  if (!recaptchaVerifier) {

    recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {

          resetRecaptcha();

        }
      }
    );

  }

  return recaptchaVerifier;

};

const friendlyAuthError = (error: unknown, fallback: string) => {

  const code =
    (error as { code?: string })?.code || "";

  const messages: Record<string, string> = {

    "auth/invalid-phone-number":
      "That phone number doesn't look right.",

    "auth/too-many-requests":
      "Too many attempts. Please try again later.",

    "auth/invalid-verification-code":
      "That code isn't right. Check it and try again.",

    "auth/code-expired":
      "This code expired. Send a new one.",

    "auth/invalid-credential":
      "Incorrect username or password.",

    "auth/wrong-password":
      "Incorrect username or password.",

    "auth/user-not-found":
      "Incorrect username or password.",

    "auth/weak-password":
      "Choose a stronger password (at least 6 characters).",

    "auth/network-request-failed":
      "Network error. Check your connection and try again."

  };

  return new Error(messages[code] || fallback);

};

export const sendOTP = async (
  phone: string
): Promise<ConfirmationResult> => {

  const formattedPhone = formatPhoneE164(phone);

  try {

    const verifier = getRecaptcha();

    return await signInWithPhoneNumber(
      auth,
      formattedPhone,
      verifier
    );

  } catch (error) {

    // A failed attempt can leave the widget in a broken state —
    // rebuild it so the next "send OTP" tap actually works.
    resetRecaptcha();

    throw friendlyAuthError(
      error,
      "Couldn't send the code. Please try again."
    );

  }

};

export const verifyOTP = async (
  confirmationResult: ConfirmationResult,
  otp: string
) => {

  try {

    return await confirmationResult.confirm(otp);

  } catch (error) {

    throw friendlyAuthError(
      error,
      "Couldn't verify that code. Please try again."
    );

  }

};

// First-time setup: attach a username+password credential to the
// phone-verified account that's currently signed in.
export const setAccountPassword = async (
  phone: string,
  password: string
) => {

  const currentUser = auth.currentUser;

  if (!currentUser) {

    throw new Error("You need to verify your phone first.");

  }

  const pseudoEmail = phoneToPseudoEmail(phone);

  try {

    const credential = EmailAuthProvider.credential(
      pseudoEmail,
      password
    );

    await linkWithCredential(currentUser, credential);

  } catch (error) {

    const code = (error as { code?: string })?.code;

    // Already linked (e.g. resetting password later) — just update it.
    if (
      code === "auth/provider-already-linked" ||
      code === "auth/email-already-in-use"
    ) {

      await updatePassword(currentUser, password);

      return;

    }

    throw friendlyAuthError(
      error,
      "Couldn't set your password. Please try again."
    );

  }

};

export const loginWithPassword = async (
  username: string,
  password: string
) => {

  const account = await getUserByUsername(username) as { phone?: string } | null;

  if (!account?.phone) {

    throw new Error("Incorrect username or password.");

  }

  try {

    return await signInWithEmailAndPassword(
      auth,
      phoneToPseudoEmail(account.phone),
      password
    );

  } catch (error) {

    throw friendlyAuthError(
      error,
      "Incorrect username or password."
    );

  }

};

// Forgot-password flow: caller already verified an SMS OTP (which signs
// the user into their linked account), so this just sets the new password.
export const resetPasswordAfterOtp = async (
  newPassword: string
) => {

  const currentUser = auth.currentUser;

  if (!currentUser) {

    throw new Error("Please verify the SMS code first.");

  }

  try {

    await updatePassword(currentUser, newPassword);

  } catch (error) {

    throw friendlyAuthError(
      error,
      "Couldn't update your password. Please try again."
    );

  }

};
