"use client";

// MSG91's OTP widget attaches these as globals once its script has loaded
// and finished setup — there's no npm package, it's a script-tag SDK.
// `exposeMethods: true` puts the widget in headless mode so we drive our
// own OTP-box UI instead of its default popup.
declare global {

  interface Window {

    initSendOTP?: (config: {
      widgetId: string;
      tokenAuth: string;
      exposeMethods: boolean;
      captchaRenderId?: string;
      success?: (data: unknown) => void;
      failure?: (error: unknown) => void;
    }) => void;

    sendOtp?: (
      identifier: string,
      success: (data: { message?: string }) => void,
      failure: (error: { message?: string }) => void
    ) => void;

    verifyOtp?: (
      otp: string,
      success: (data: { message: string }) => void,
      failure: (error: { message?: string }) => void
    ) => void;

  }

}

// The widget renders its own captcha into this container as part of
// initialization — pages using sendOTP/verifyOTP must render a
// <div id={MSG91_CAPTCHA_CONTAINER_ID}> for it to attach to.
export const MSG91_CAPTCHA_CONTAINER_ID = "msg91-captcha-container";

let scriptLoadPromise: Promise<void> | null = null;

// Mirrors MSG91's own recommended loader: try their primary domain, fall
// back to the secondary one if it's blocked/unreachable.
const loadWidgetScript = (): Promise<void> => {

  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {

    const urls = [
      "https://verify.msg91.com/otp-provider.js",
      "https://verify.phone91.com/otp-provider.js"
    ];

    let index = 0;

    const attempt = () => {

      const script = document.createElement("script");
      script.src = urls[index];
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {

        index += 1;

        if (index < urls.length) {

          attempt();

        } else {

          reject(new Error("Couldn't load the OTP service. Check your connection and try again."));

        }

      };

      document.head.appendChild(script);

    };

    attempt();

  });

  return scriptLoadPromise;

};

let initPromise: Promise<void> | null = null;

const ensureInitialized = (): Promise<void> => {

  if (initPromise) return initPromise;

  initPromise = loadWidgetScript().then(() => {

    window.initSendOTP!({
      widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID!,
      tokenAuth: process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH!,
      exposeMethods: true,
      captchaRenderId: MSG91_CAPTCHA_CONTAINER_ID,
      success: () => {},
      failure: () => {}
    });

  });

  return initPromise;

};

// The widget's captcha setup finishes asynchronously after initSendOTP
// returns, so sendOtp/verifyOtp aren't attached to window immediately —
// poll briefly instead of assuming they're ready on the same tick.
const waitForGlobal = <T,>(getter: () => T | undefined, timeoutMs = 8000): Promise<T> => {

  return new Promise((resolve, reject) => {

    const startedAt = Date.now();

    const tick = () => {

      const value = getter();

      if (value) {

        resolve(value);
        return;

      }

      if (Date.now() - startedAt > timeoutMs) {

        reject(new Error("The OTP widget isn't ready yet. Please try again."));
        return;

      }

      setTimeout(tick, 150);

    };

    tick();

  });

};

// identifier: phone with country code, no "+" (e.g. "919496010722").
export const sendOtpViaWidget = async (identifier: string): Promise<void> => {

  await ensureInitialized();

  const sendOtp = await waitForGlobal(() => window.sendOtp);

  return new Promise((resolve, reject) => {

    sendOtp(
      identifier,
      () => resolve(),
      (error) => reject(
        new Error(error?.message || "Couldn't send the code. Please try again.")
      )
    );

  });

};

// Resolves with the JWT access-token the backend must verify server-side.
export const verifyOtpViaWidget = async (otp: string): Promise<string> => {

  const verifyOtp = await waitForGlobal(() => window.verifyOtp);

  return new Promise((resolve, reject) => {

    verifyOtp(
      otp,
      (data) => resolve(data.message),
      (error) => reject(
        new Error(error?.message || "That code isn't right. Check it and try again.")
      )
    );

  });

};
