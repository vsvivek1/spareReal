import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

import { auth } from "@/lib/firebase";

let recaptchaVerifier: RecaptchaVerifier | null = null;

const getRecaptcha = () => {

  if (!recaptchaVerifier) {

    recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      {
        size: "invisible"
      }
    );

    recaptchaVerifier.render();
  }

  return recaptchaVerifier;
};

export const sendOTP = async (
  phone: string
) => {

  const verifier = getRecaptcha();

  return await signInWithPhoneNumber(
    auth,
    phone,
    verifier
  );
};

export const verifyOTP = async (
  confirmationResult: any,
  otp: string
) => {

  return confirmationResult.confirm(
    otp
  );
};