import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

import { auth } from "./firebase";

// ==================================================
// SHARED reCAPTCHA STATE
// ==================================================

let recaptchaVerifier = null;
let recaptchaWidgetId = null;
let recaptchaInitPromise = null;
let confirmationResult = null;

// ==================================================
// SETUP reCAPTCHA (SINGLETON)
// ==================================================

export const setupRecaptcha = async () => {
  // Reuse existing verifier
  if (recaptchaVerifier) {
    return recaptchaVerifier;
  }

  // Prevent concurrent initialization
  if (recaptchaInitPromise) {
    return recaptchaInitPromise;
  }

  recaptchaInitPromise = (async () => {
    try {
      const container = document.getElementById(
        "recaptcha-container"
      );

      if (!container) {
        throw new Error(
          "reCAPTCHA container is missing from the DOM."
        );
      }

      recaptchaVerifier = new RecaptchaVerifier(
        auth,
        container,
        {
          size: "invisible",

          callback: () => {
            console.log("reCAPTCHA verified");
          },

          "expired-callback": () => {
            console.log("reCAPTCHA expired");
          },

          "error-callback": () => {
            console.warn("reCAPTCHA error");
          },
        }
      );

      recaptchaWidgetId = await recaptchaVerifier.render();

      console.log("reCAPTCHA initialized successfully");

      return recaptchaVerifier;
    } catch (error) {
      console.error(
        "reCAPTCHA initialization failed:",
        error
      );

      try {
        recaptchaVerifier?.clear();
      } catch {}

      recaptchaVerifier = null;
      recaptchaWidgetId = null;

      throw error;
    } finally {
      recaptchaInitPromise = null;
    }
  })();

  return recaptchaInitPromise;
};

// ==================================================
// RESET reCAPTCHA
// ==================================================

export const resetRecaptcha = () => {
  try {
    if (
      recaptchaWidgetId !== null &&
      window.grecaptcha?.reset
    ) {
      window.grecaptcha.reset(recaptchaWidgetId);
      console.log("reCAPTCHA reset");
    }
  } catch (error) {
    console.warn("reCAPTCHA reset failed:", error);
  }
};

// ==================================================
// DESTROY reCAPTCHA (FULL CLEANUP)
// ==================================================

export const destroyRecaptcha = () => {
  try {
    recaptchaVerifier?.clear();
  } catch (error) {
    console.warn("reCAPTCHA destroy failed:", error);
  }

  recaptchaVerifier = null;
  recaptchaWidgetId = null;
  recaptchaInitPromise = null;
  confirmationResult = null;
};

// ==================================================
// SEND PHONE OTP
// ==================================================

export const sendPhoneOTP = async (phoneNumber) => {
  try {
    const verifier = await setupRecaptcha();

    const result = await signInWithPhoneNumber(
      auth,
      phoneNumber,
      verifier
    );

    confirmationResult = result;

    console.log("OTP sent successfully");

    return result;
  } catch (error) {
    console.error("Firebase phone OTP error:", error);

    // Reset CAPTCHA for another attempt
    resetRecaptcha();

    throw error;
  }
};

// ==================================================
// VERIFY PHONE OTP
// ==================================================

export const verifyPhoneOTP = async (
  result,
  otp
) => {
  try {
    const confirmation = result || confirmationResult;

    if (!confirmation) {
      throw new Error(
        "OTP verification session is missing. Please request a new OTP."
      );
    }

    const verifiedUser = await confirmation.confirm(otp);

    const firebaseToken =
      await verifiedUser.user.getIdToken();

    console.log("Phone OTP verified successfully");

    return {
      firebaseToken,
      user: verifiedUser.user,
    };
  } catch (error) {
    console.error("OTP verification failed:", error);
    throw error;
  }
};