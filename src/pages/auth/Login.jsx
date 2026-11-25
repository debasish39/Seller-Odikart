import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  ArrowRight,
  Store,
  Package,
  BarChart3,
  ShieldCheck,
  X,
  Smartphone,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

import AOS from "aos";
import "aos/dist/aos.css";

import api from "../../services/api";

import {
  sendPhoneOTP,
  verifyPhoneOTP,
  resetRecaptcha,
} from "../../phoneAuth";

const ODIKART_LOGO = "https://seller.odikart.in/icon-512.png";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // AOS
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: "ease-out-cubic",
      once: true,
      offset: 20,
    });

    return () => AOS.refreshHard();
  }, []);

  // Automatically clear error
  useEffect(() => {
    if (!serverError) return;

    const timer = setTimeout(() => {
      setServerError("");
    }, 6000);

    return () => clearTimeout(timer);
  }, [serverError]);

  // Send OTP
  const sendLoginOTP = async () => {
    setServerError("");

    const cleaned = phoneNumber.replace(/\D/g, "");

    const normalizedPhone =
      cleaned.length === 10
        ? `+91${cleaned}`
        : cleaned.length === 12 && cleaned.startsWith("91")
        ? `+${cleaned}`
        : phoneNumber.trim();

    if (!/^\+[1-9]\d{7,14}$/.test(normalizedPhone)) {
      setServerError(
        "Enter a valid phone number with country code (+91)."
      );
      return;
    }

    try {
      setOtpLoading(true);

      const result = await sendPhoneOTP(normalizedPhone);

      setConfirmationResult(result);
      setPhoneNumber(normalizedPhone);
      setOtpSent(true);
      setForm((prev) => ({ ...prev, otp: "" }));
      setServerError("");
    } catch (error) {
      const errorMessages = {
        "auth/invalid-phone-number": "The phone number is invalid.",
        "auth/too-many-requests":
          "Too many attempts. Please try again later.",
        "auth/quota-exceeded":
          "SMS quota exceeded. Please try again later.",
      };

      setServerError(
        errorMessages[error.code] ||
          error.message ||
          "Unable to send OTP. Please try again."
      );

      resetRecaptcha();
    } finally {
      setOtpLoading(false);
    }
  };

  // Login success
  const handleSellerLoginSuccess = (token, user) => {
    if (!token || !user) {
      setServerError(
        "Login succeeded, but the server returned incomplete account data."
      );
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setServerError("");
    navigate("/seller/dashboard", { replace: true });
  };

  // Verify OTP
  const verifyLoginOTP = async () => {
    setServerError("");

    const otp = form.otp.trim();

    if (!confirmationResult) {
      setServerError("Please request a new OTP first.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setServerError("Enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const { firebaseToken } = await verifyPhoneOTP(
        confirmationResult,
        otp
      );

      const response = await api.post(
        "/auth/firebase-phone-login",
        { app: "seller" },
        {
          headers: {
            Authorization: `Bearer ${firebaseToken}`,
          },
        }
      );

      const { token, user } = response.data;

      handleSellerLoginSuccess(token, user);
    } catch (error) {
      const firebaseMessages = {
        "auth/invalid-verification-code":
          "Incorrect OTP. Please check and try again.",
        "auth/code-expired":
          "OTP expired. Please request a new one.",
      };

      setServerError(
        firebaseMessages[error.code] ||
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Phone verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  // Form submit
  const login = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!otpSent) {
      await sendLoginOTP();
      return;
    }

    await verifyLoginOTP();
  };

  // Change number
  const changeNumber = () => {
    resetRecaptcha();
    setOtpSent(false);
    setConfirmationResult(null);
    setForm({ otp: "" });
    setServerError("");
  };

  return (
    <div className="min-h-screen bg-[#F4F7FF] text-slate-900">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-200/30 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-indigo-200/30 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-blue-100/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-3"
          >
            <div className="h-11 w-11 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
              <img
                src={ODIKART_LOGO}
                alt="Odikart"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="text-left">
              <p className="text-[17px] font-extrabold tracking-tight text-slate-900">
                Odikart
              </p>
              <p className="text-[11px] font-medium text-slate-500">
                Seller Portal
              </p>
            </div>
          </button>

          {/* Register */}
          <Link
            to="/register"
            className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100 sm:px-5 sm:text-sm"
          >
            Become a Seller
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-7xl items-center px-4 py-6 sm:px-6 sm:py-10 lg:px-8">

        <div className="grid w-full overflow-hidden rounded-[32px] border border-white bg-white shadow-[0_25px_80px_rgba(37,99,235,0.10)] lg:grid-cols-[1.05fr_0.95fr]">

          {/* Left Hero */}
          <section
            data-aos="fade-right"
            className="relative hidden min-h-[720px] overflow-hidden lg:flex"
          >
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1D4ED8] via-[#2563EB] to-[#4F46E5]" />

            {/* Decorative shapes */}
            <div className="absolute -right-24 -top-24 h-[400px] w-[400px] rounded-full border border-white/10 bg-white/[0.04]" />
            <div className="absolute -bottom-32 -left-24 h-[420px] w-[420px] rounded-full border border-white/10 bg-white/[0.04]" />

            <div className="absolute right-20 top-28 h-52 w-52 rounded-full bg-blue-300/20 blur-3xl" />
            <div className="absolute bottom-40 right-0 h-60 w-60 rounded-full bg-indigo-300/20 blur-3xl" />

            {/* Hero Content */}
            <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">

              {/* Brand */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white p-1 shadow-xl shadow-blue-950/20">
                  <img
                    src={ODIKART_LOGO}
                    alt="Odikart"
                    className="h-full w-full rounded-xl object-cover"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-white">
                    Odikart Seller
                  </p>
                  <p className="text-xs text-blue-100/70">
                    Seller workspace
                  </p>
                </div>
              </div>

              {/* Hero message */}
              <div className="max-w-lg">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-md">
                  <Sparkles size={14} className="text-blue-100" />
                  <span className="text-[11px] font-semibold text-white">
                    Your business, one step ahead
                  </span>
                </div>

                <h1 className="text-5xl font-bold leading-[1.1] tracking-[-0.05em] text-white xl:text-6xl">
                  Grow your
                  <br />
                  business with
                  <br />
                  <span className="text-blue-100">
                    Odikart.
                  </span>
                </h1>

                <p className="mt-6 max-w-md text-sm leading-7 text-blue-50/80">
                  Your products. Your orders. Your growth.
                  Manage your entire selling journey from one
                  powerful workspace.
                </p>

                {/* Features */}
                <div className="mt-10 grid grid-cols-3 gap-3">
                  {[
                    {
                      icon: BarChart3,
                      title: "Analytics",
                      subtitle: "Track growth",
                    },
                    {
                      icon: Package,
                      title: "Products",
                      subtitle: "Manage inventory",
                    },
                    {
                      icon: Store,
                      title: "Store",
                      subtitle: "Build business",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="rounded-2xl border border-white/10 bg-white/[0.10] p-4 backdrop-blur-lg transition hover:bg-white/[0.15]"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-lg">
                          <Icon size={18} />
                        </div>

                        <p className="mt-4 text-xs font-bold text-white">
                          {item.title}
                        </p>

                        <p className="mt-1 text-[10px] text-blue-100/70">
                          {item.subtitle}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Trust */}
                <div className="mt-8 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-white text-[10px] font-bold text-blue-700">
                      O
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-100 text-[10px] font-bold text-blue-700">
                      S
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-blue-500 bg-indigo-100 text-[10px] font-bold text-indigo-700">
                      +
                    </div>
                  </div>

                  <p className="text-xs text-blue-100/80">
                    Built for sellers. Designed for growth.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <p className="text-[11px] text-blue-100/60">
                  © Odikart Seller Portal
                </p>

                <div className="flex items-center gap-2 text-[11px] font-medium text-blue-100/80">
                  <ShieldCheck size={14} />
                  Secure platform
                </div>
              </div>
            </div>
          </section>

          {/* Right Login Panel */}
          <section
            data-aos="fade-left"
            className="flex min-h-[650px] items-center justify-center px-5 py-9 sm:px-10 lg:px-12 xl:px-16"
          >
            <div className="w-full max-w-[440px]">

              {/* Mobile Brand */}
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="h-12 w-12 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-blue-100">
                  <img
                    src={ODIKART_LOGO}
                    alt="Odikart"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <p className="font-extrabold text-slate-900">
                    Odikart Seller
                  </p>
                  <p className="text-xs text-slate-500">
                    Seller Portal
                  </p>
                </div>
              </div>

              {/* Login Heading */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-[11px] font-bold text-blue-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  {otpSent ? "PHONE VERIFICATION" : "SELLER LOGIN"}
                </div>

                <h2 className="mt-5 text-3xl font-bold tracking-[-0.045em] text-slate-900 sm:text-4xl">
                  {otpSent ? "Verify your number" : "Welcome back"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {otpSent
                    ? "Enter the verification code to securely access your seller account."
                    : "Sign in to your Odikart seller account and continue growing your business."}
                </p>
              </div>

              {/* Error */}
              {serverError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    !
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-red-800">
                      Unable to sign in
                    </p>
                    <p className="mt-1 text-xs leading-5 text-red-700">
                      {serverError}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setServerError("")}
                    aria-label="Dismiss error"
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400 transition hover:bg-red-100"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}

              {/* Form */}
              <form
                onSubmit={login}
                noValidate
                className="mt-8 space-y-5"
              >

                {/* Phone Step */}
                {!otpSent ? (
                  <>
                    <div>
                      <label
                        htmlFor="seller-phone"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Registered mobile number
                      </label>

                      <div className="relative">
                        <div className="pointer-events-none absolute left-4 top-1/2 flex -translate-y-1/2 items-center gap-2 text-slate-400">
                          <Smartphone size={18} />
                        </div>

                        <input
                          id="seller-phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            setServerError("");
                          }}
                          placeholder="Enter your mobile number"
                          className="h-[58px] w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                        />
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        Use the mobile number linked to your seller account.
                      </p>
                    </div>

                    {/* OTP Info */}
                    <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                        <Smartphone size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Login with phone OTP
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          We'll send a secure verification code to your mobile number.
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* OTP Sent */}
                    <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                          <CheckCircle2 size={19} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            Verification code sent
                          </p>

                          <p className="mt-1 break-all text-xs text-slate-500">
                            Sent to {phoneNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* OTP Input */}
                    <div>
                      <label
                        htmlFor="otp"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                      >
                        Enter 6-digit OTP
                      </label>

                      <input
                        id="otp"
                        type="text"
                        name="otp"
                        inputMode="numeric"
                        maxLength={6}
                        autoComplete="one-time-code"
                        placeholder="000000"
                        value={form.otp}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6);

                          setForm((prev) => ({
                            ...prev,
                            otp: value,
                          }));

                          setServerError("");
                        }}
                        className="h-[64px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-center text-2xl font-bold tracking-[0.45em] text-blue-700 outline-none transition-all placeholder:text-slate-300 hover:border-blue-200 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                      />

                      <div className="mt-4 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={changeNumber}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-blue-600"
                        >
                          <ArrowLeft size={13} />
                          Change number
                        </button>

                        <button
                          type="button"
                          onClick={sendLoginOTP}
                          disabled={otpLoading}
                          className="text-xs font-bold text-blue-600 transition hover:text-indigo-700 disabled:opacity-50"
                        >
                          {otpLoading ? "Sending..." : "Resend OTP"}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* reCAPTCHA */}
                <div id="recaptcha-container" />

                {/* Security Card */}
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <ShieldCheck size={19} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Secure seller access
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Only approved and KYC-verified seller accounts can access the Odikart Seller Portal.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || otpLoading}
                  className="group relative flex h-[56px] w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-600/25 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute inset-0 bg-white/0 transition group-hover:bg-white/10" />

                  <span className="relative">
                    {loading
                      ? "Verifying your account..."
                      : otpLoading
                      ? "Sending verification code..."
                      : !otpSent
                      ? "Send verification code"
                      : "Verify & Sign In"}
                  </span>

                  {!loading && !otpLoading && (
                    <ArrowRight
                      size={17}
                      className="relative transition-transform group-hover:translate-x-1"
                    />
                  )}
                </button>

                {/* Register */}
                <div className="pt-1 text-center text-sm text-slate-500">
                  Don't have an Odikart account?{" "}
                  <Link
                    to="/register"
                    className="font-bold text-blue-600 transition hover:text-indigo-700"
                  >
                    Become a Seller
                  </Link>
                </div>

                {/* Customer note */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                      <ShoppingBag size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Already an Odikart customer?
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        You don't need another account. Apply for seller access using your existing Odikart account.
                      </p>
                    </div>
                  </div>
                </div>
              </form>

              {/* Footer */}
              <div className="mt-7 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck size={13} />
                Your information is protected and encrypted.
              </div>

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Login;