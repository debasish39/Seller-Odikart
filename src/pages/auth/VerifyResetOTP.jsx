import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Mail,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import AOS from "aos";
import "aos/dist/aos.css";

import api from "../../services/api";

/*
|--------------------------------------------------------------------------
| ODikart Seller Portal
|--------------------------------------------------------------------------
*/

const ODIKART_LOGO =
  "https://odikart.in/web-app-manifest-192x192.png";

const SELLER_IMAGE =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85";

function VerifyResetOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [resendCooldown, setResendCooldown] =
    useState(0);

  /*
  |--------------------------------------------------------------------------
  | AOS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    AOS.init({
      duration: 500,
      easing: "ease-out-cubic",
      once: true,
      offset: 15,
    });

    return () => {
      AOS.refreshHard();
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | RESEND COOLDOWN
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendCooldown((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  /*
  |--------------------------------------------------------------------------
  | OTP CHANGE
  |--------------------------------------------------------------------------
  */

  const handleOTPChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);

    /*
     * Clear inline error as soon as
     * the user starts correcting OTP.
     */

    setError("");
    setSuccess("");
  };

  /*
  |--------------------------------------------------------------------------
  | VERIFY OTP
  |--------------------------------------------------------------------------
  */

  const verifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    /*
    |--------------------------------------------------------------------------
    | EMAIL VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!email) {
      setError(
        "Email address is missing. Please request a new password reset OTP."
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | OTP VALIDATION
    |--------------------------------------------------------------------------
    */

    if (!otp) {
      setError(
        "Please enter the verification OTP."
      );

      return;
    }

    if (otp.length !== 6) {
      setError(
        "Please enter the complete 6-digit OTP."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/verify-reset-otp",
        {
          email,
          otp,
        }
      );

      setSuccess(
        response.data?.message ||
          "OTP verified successfully."
      );

      /*
      |--------------------------------------------------------------------------
      | Keep email + OTP for reset password.
      |--------------------------------------------------------------------------
      */

      setTimeout(() => {
        navigate("/reset-password", {
          replace: true,
          state: {
            email,
            otp,
          },
        });
      }, 600);
    } catch (error) {
      console.error(
        "Verify reset OTP error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESEND OTP
  |--------------------------------------------------------------------------
  */

  const resendOTP = async () => {
    if (!email) {
      setError(
        "Email address is missing. Please request a new password reset."
      );

      return;
    }

    if (resendCooldown > 0) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setResending(true);

      const response = await api.post(
        "/auth/forgot-password",
        {
          email,
        }
      );

      setSuccess(
        response.data?.message ||
          "A new password reset OTP has been sent."
      );

      setOtp("");

      /*
      |--------------------------------------------------------------------------
      | Prevent repeated requests.
      |--------------------------------------------------------------------------
      */

      setResendCooldown(30);
    } catch (error) {
      console.error(
        "Resend reset OTP error:",
        error.response?.data || error
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to resend OTP. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CHANGE EMAIL
  |--------------------------------------------------------------------------
  */

  const changeEmail = () => {
    navigate("/forgot-password");
  };

  /*
  |--------------------------------------------------------------------------
  | OTP INPUT STYLE
  |--------------------------------------------------------------------------
  */

  const otpInputClass = `
    h-16
    w-full
    rounded-2xl
    border
    bg-zinc-50
    px-5
    text-center
    text-2xl
    font-bold
    tracking-[0.5em]
    text-zinc-950
    outline-none
    transition-all

    placeholder:text-zinc-300
    placeholder:tracking-[0.5em]

    disabled:cursor-not-allowed
    disabled:opacity-60

    focus:ring-4

    ${
      error
        ? `
          border-red-300
          bg-red-50/30
          focus:border-red-500
          focus:ring-red-500/10
        `
        : `
          border-zinc-200
          focus:border-black
          focus:bg-white
          focus:ring-black/5
        `
    }
  `;

  /*
  |--------------------------------------------------------------------------
  | MISSING EMAIL
  |--------------------------------------------------------------------------
  */

  if (!email) {
    return (
      <div
        className="
          min-h-screen
          bg-[#f5f5f5]
          text-zinc-950
        "
      >
        {/* HEADER */}

        <header
          className="
            sticky
            top-0
            z-50
            border-b
            border-zinc-200
            bg-white/95
            backdrop-blur-xl
          "
        >
          <div
            className="
              mx-auto
              flex
              h-[64px]
              max-w-7xl
              items-center
              justify-between
              px-4
              sm:h-[72px]
              sm:px-6
              lg:px-8
            "
          >
            {/* BRAND */}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="
                flex
                items-center
                gap-3
                rounded-2xl
                transition
                active:scale-[0.98]
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-xl
                  bg-white
                  ring-1
                  ring-zinc-200
                  sm:h-11
                  sm:w-11
                "
              >
                <img
                  src={ODIKART_LOGO}
                  alt="Odikart"
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />
              </div>

              <div className="text-left">
                <p
                  className="
                    text-sm
                    font-bold
                    tracking-tight
                    text-black
                  "
                >
                  Odikart
                </p>

                <p
                  className="
                    text-[10px]
                    font-medium
                    text-zinc-500
                  "
                >
                  Seller Portal
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/login")
              }
              className="
                rounded-full
                border
                border-zinc-200
                bg-white
                px-4
                py-2
                text-xs
                font-semibold
                text-black
                transition

                hover:border-black
                hover:bg-black
                hover:text-white
              "
            >
              Back to Login
            </button>
          </div>
        </header>

        {/* SESSION CARD */}

        <main
          className="
            flex
            min-h-[calc(100vh-64px)]
            items-center
            justify-center
            px-4
            py-10
            sm:min-h-[calc(100vh-72px)]
          "
        >
          <div
            data-aos="zoom-in"
            className="
              w-full
              max-w-md
              rounded-[28px]
              border
              border-zinc-200
              bg-white
              p-7
              text-center
              shadow-[0_20px_60px_rgba(0,0,0,0.08)]
              sm:p-10
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-zinc-100
                text-black
              "
            >
              <ShieldCheck size={30} />
            </div>

            <h1
              className="
                mt-6
                text-2xl
                font-semibold
                tracking-tight
                text-black
              "
            >
              Reset session not found
            </h1>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-zinc-500
              "
            >
              Your password reset session is
              missing. Please request a new
              verification code.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/forgot-password",
                  {
                    replace: true,
                  }
                )
              }
              className="
                mt-7
                flex
                min-h-12
                w-full
                items-center
                justify-center
                gap-2
                rounded-full
                bg-black
                px-5
                py-3
                text-sm
                font-bold
                text-white
                transition

                hover:bg-zinc-800
                active:scale-[0.98]

                focus:outline-none
                focus:ring-4
                focus:ring-black/10
              "
            >
              Request New OTP

              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/login", {
                  replace: true,
                })
              }
              className="
                mt-5
                text-sm
                font-bold
                text-zinc-500
                transition
                hover:text-black
              "
            >
              ← Back to login
            </button>
          </div>
        </main>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | MAIN UI
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="
        min-h-screen
        bg-[#f5f5f5]
        text-zinc-950
      "
    >
      {/* =========================================================
          HEADER
      ========================================================= */}

      <header
        className="
          sticky
          top-0
          z-50
          border-b
          border-zinc-200
          bg-white/95
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[64px]
            max-w-7xl
            items-center
            justify-between
            px-4
            sm:h-[72px]
            sm:px-6
            lg:px-8
          "
        >
          {/* BRAND */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="
              group
              flex
              items-center
              gap-3
              rounded-2xl
              transition
              active:scale-[0.98]
            "
          >
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                overflow-hidden
                rounded-xl
                bg-white
                ring-1
                ring-zinc-200
                sm:h-11
                sm:w-11
              "
            >
              <img
                src={ODIKART_LOGO}
                alt="Odikart"
                className="
                  h-full
                  w-full
                  object-cover
                "
              />
            </div>

            <div className="text-left">
              <p
                className="
                  text-sm
                  font-bold
                  tracking-tight
                  text-black
                  sm:text-[15px]
                "
              >
                Odikart
              </p>

              <p
                className="
                  text-[10px]
                  font-medium
                  text-zinc-500
                  sm:text-[11px]
                "
              >
                Seller Portal
              </p>
            </div>
          </button>

          {/* LOGIN */}

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="
              rounded-full
              border
              border-zinc-200
              bg-white
              px-4
              py-2
              text-xs
              font-semibold
              text-black
              transition

              hover:border-black
              hover:bg-black
              hover:text-white

              active:scale-95

              sm:px-5
              sm:py-2.5
              sm:text-sm
            "
          >
            Back to Login
          </button>
        </div>
      </header>

      {/* =========================================================
          MAIN
      ========================================================= */}

      <main
        className="
          mx-auto
          w-full
          max-w-7xl
          px-3
          py-4
          sm:px-6
          sm:py-8
          lg:px-8
          lg:py-10
        "
      >
        <div
          className="
            grid
            gap-5
            lg:grid-cols-[minmax(0,1fr)_500px]
            lg:items-stretch
          "
        >
          {/* =====================================================
              HERO PANEL
          ===================================================== */}

          <section
            data-aos="fade-up"
            className="
              relative
              hidden
              min-h-[650px]
              overflow-hidden
              rounded-[32px]
              bg-black
              lg:block
            "
          >
            <img
              src={SELLER_IMAGE}
              alt="Odikart Password Reset Verification"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                object-center
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-black/55
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black/95
                via-black/50
                to-black/10
              "
            />

            {/* Decorative circles */}

            <div
              className="
                absolute
                -right-32
                -top-32
                h-96
                w-96
                rounded-full
                border
                border-white/10
              "
            />

            <div
              className="
                absolute
                -right-16
                -top-16
                h-64
                w-64
                rounded-full
                border
                border-white/10
              "
            />

            <div
              className="
                absolute
                -bottom-40
                -left-32
                h-96
                w-96
                rounded-full
                border
                border-white/10
              "
            />

            <div
              className="
                relative
                z-10
                flex
                min-h-[650px]
                flex-col
                justify-between
                p-8
                sm:p-10
              "
            >
              {/* BRAND */}

              <div
                data-aos="fade-right"
                className="
                  flex
                  items-center
                  justify-between
                "
              >
                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-2xl
                      bg-white
                      shadow-xl
                    "
                  >
                    <img
                      src={ODIKART_LOGO}
                      alt="Odikart"
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />
                  </div>

                  <div>
                    <p
                      className="
                        text-sm
                        font-bold
                        text-white
                      "
                    >
                      Odikart Seller
                    </p>

                    <p
                      className="
                        text-xs
                        text-white/60
                      "
                    >
                      Seller Portal
                    </p>
                  </div>
                </div>

                <div
                  className="
                    hidden
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/15
                    bg-black/30
                    px-3
                    py-1.5
                    backdrop-blur-xl
                    sm:flex
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-white
                    "
                  />

                  <span
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-white
                    "
                  >
                    Secure
                  </span>
                </div>
              </div>

              {/* HERO CONTENT */}

              <div
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <span
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-white/15
                    bg-black/30
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-white/80
                    backdrop-blur-xl
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-white
                    "
                  />

                  Email verification
                </span>

                <h1
                  className="
                    mt-6
                    max-w-xl
                    text-4xl
                    font-semibold
                    leading-[1.02]
                    tracking-[-0.045em]
                    text-white
                    sm:text-5xl
                  "
                >
                  Verify your
                  <br />
                  reset request.
                </h1>

                <p
                  className="
                    mt-5
                    max-w-md
                    text-sm
                    leading-7
                    text-white/70
                    sm:text-[15px]
                  "
                >
                  We've sent a temporary verification
                  code to your registered email address.
                  Enter it here to continue securely.
                </p>
              </div>

              {/* STEPS */}

              <div
                data-aos="fade-up"
                data-aos-delay="180"
                className="
                  rounded-2xl
                  border
                  border-white/10
                  bg-black/35
                  p-5
                  backdrop-blur-xl
                "
              >
                <p
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.18em]
                    text-white/40
                  "
                >
                  Password recovery
                </p>

                <div className="mt-5 space-y-4">

                  {/* STEP 1 */}

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        text-xs
                        font-bold
                        text-black
                      "
                    >
                      ✓
                    </div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-white
                      "
                    >
                      Email submitted
                    </p>
                  </div>

                  <div
                    className="
                      ml-4
                      h-4
                      w-px
                      bg-white/10
                    "
                  />

                  {/* STEP 2 */}

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        text-xs
                        font-bold
                        text-black
                        shadow-lg
                      "
                    >
                      2
                    </div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-white
                      "
                    >
                      Verify OTP
                    </p>
                  </div>

                  <div
                    className="
                      ml-4
                      h-4
                      w-px
                      bg-white/10
                    "
                  />

                  {/* STEP 3 */}

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-8
                        w-8
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-white/10
                        bg-white/10
                        text-xs
                        font-bold
                        text-white/40
                      "
                    >
                      3
                    </div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-white/40
                      "
                    >
                      Create password
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =====================================================
              FORM PANEL
          ===================================================== */}

          <section
            data-aos="fade-up"
            data-aos-delay="80"
            className="
              flex
              items-center
              rounded-[28px]
              border
              border-zinc-200
              bg-white
              px-5
              py-7
              shadow-[0_8px_35px_rgba(0,0,0,0.06)]
              sm:px-8
              sm:py-10
              lg:px-10
            "
          >
            <div className="mx-auto w-full max-w-md">

              {/* MOBILE LOGO */}

              <div
                className="
                  mb-7
                  flex
                  items-center
                  gap-3
                  lg:hidden
                "
              >
                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-2xl
                    bg-black
                  "
                >
                  <img
                    src={ODIKART_LOGO}
                    alt="Odikart"
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                  />
                </div>

                <div>
                  <p
                    className="
                      text-sm
                      font-bold
                      text-black
                    "
                  >
                    Odikart Seller
                  </p>

                  <p
                    className="
                      text-xs
                      text-zinc-400
                    "
                  >
                    Password Recovery
                  </p>
                </div>
              </div>

              {/* HEADER */}

              <div data-aos="fade-up">

                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    bg-zinc-100
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.16em]
                    text-black
                  "
                >
                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-black
                    "
                  />

                  Verify Reset
                </div>

                <h2
                  className="
                    mt-5
                    text-3xl
                    font-semibold
                    tracking-[-0.035em]
                    text-black
                    sm:text-4xl
                  "
                >
                  Check your email
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-zinc-500
                  "
                >
                  Enter the 6-digit code we sent to
                  verify your password reset request.
                </p>
              </div>

              {/* EMAIL CARD */}

              <div
                data-aos="fade-up"
                data-aos-delay="80"
                className="
                  mt-7
                  flex
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-zinc-50
                  p-4
                "
              >
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-black
                    shadow-sm
                  "
                >
                  <Mail size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-zinc-400
                    "
                  >
                    Code sent to
                  </p>

                  <p
                    className="
                      mt-1
                      truncate
                      text-sm
                      font-bold
                      text-zinc-800
                    "
                  >
                    {email}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={changeEmail}
                  className="
                    shrink-0
                    text-xs
                    font-bold
                    text-black
                    transition
                    hover:text-zinc-500
                  "
                >
                  Change
                </button>
              </div>

              {/* SUCCESS MESSAGE */}

              {success && (
                <div
                  data-aos="fade-down"
                  role="status"
                  aria-live="polite"
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-zinc-200
                    bg-zinc-50
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      items-start
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-black
                        text-white
                      "
                    >
                      <CheckCircle2 size={17} />
                    </div>

                    <div className="min-w-0">
                      <p
                        className="
                          text-sm
                          font-bold
                          text-black
                        "
                      >
                        Verification successful
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-zinc-600
                        "
                      >
                        {success}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  OTP FORM
              ================================================= */}

              <form
                onSubmit={verifyOTP}
                noValidate
                className="mt-7"
              >
                <label
                  htmlFor="otp"
                  className="
                    mb-3
                    block
                    text-xs
                    font-bold
                    text-zinc-700
                  "
                >
                  Verification Code
                </label>

                {/* OTP INPUT */}

                <div
                  data-aos="fade-up"
                  data-aos-delay="120"
                >
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={handleOTPChange}
                    placeholder="000000"
                    autoFocus
                    disabled={loading}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                      error
                        ? "otp-error"
                        : undefined
                    }
                    className={otpInputClass}
                  />
                </div>

                {/* INLINE ERROR */}

                {error && (
                  <p
                    id="otp-error"
                    role="alert"
                    aria-live="assertive"
                    className="
                      mt-2
                      flex
                      items-center
                      gap-1.5
                      text-[11px]
                      font-medium
                      text-red-600
                    "
                  >
                    <span
                      className="
                        flex
                        h-4
                        w-4
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-red-100
                        text-[9px]
                        font-bold
                        text-red-600
                      "
                    >
                      !
                    </span>

                    {error}

                    <button
                      type="button"
                      onClick={() =>
                        setError("")
                      }
                      className="
                        ml-auto
                        flex
                        h-5
                        w-5
                        items-center
                        justify-center
                        rounded-md
                        text-red-400
                        transition
                        hover:bg-red-50
                        hover:text-red-600
                      "
                      aria-label="Dismiss error"
                    >
                      <X size={13} />
                    </button>
                  </p>
                )}

                {/* COUNTER */}

                <div
                  data-aos="fade-up"
                  data-aos-delay="150"
                  className="
                    mt-3
                    flex
                    items-center
                    justify-between
                  "
                >
                  <p
                    className="
                      text-[11px]
                      text-zinc-400
                    "
                  >
                    Enter the 6-digit code
                  </p>

                  <p
                    className="
                      text-[11px]
                      font-semibold
                      text-zinc-400
                    "
                  >
                    {otp.length}/6
                  </p>
                </div>

                {/* OTP DOT INDICATOR */}

                <div
                  className="
                    mt-4
                    flex
                    justify-center
                    gap-2
                  "
                >
                  {[0, 1, 2, 3, 4, 5].map(
                    (index) => (
                      <span
                        key={index}
                        className={`
                          h-1.5
                          w-6
                          rounded-full
                          transition-all
                          duration-200

                          ${
                            otp.length > index
                              ? error
                                ? "bg-red-500"
                                : "bg-black"
                              : "bg-zinc-200"
                          }
                        `}
                      />
                    )
                  )}
                </div>

                {/* VERIFY BUTTON */}

                <div
                  data-aos="fade-up"
                  data-aos-delay="190"
                  className="mt-6"
                >
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !email ||
                      otp.length !== 6
                    }
                    className="
                      group
                      relative
                      flex
                      min-h-12
                      w-full
                      items-center
                      justify-center
                      gap-2
                      overflow-hidden
                      rounded-full
                      bg-black
                      px-5
                      py-3.5
                      text-sm
                      font-bold
                      text-white
                      shadow-[0_8px_20px_rgba(0,0,0,0.15)]
                      transition-all

                      hover:bg-zinc-800
                      hover:shadow-[0_10px_25px_rgba(0,0,0,0.2)]

                      active:scale-[0.98]

                      focus:outline-none
                      focus:ring-4
                      focus:ring-black/10

                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {/* SHINE */}

                    <span
                      className="
                        absolute
                        inset-0
                        -translate-x-full
                        bg-gradient-to-r
                        from-transparent
                        via-white/10
                        to-transparent
                        transition-transform
                        duration-700
                        group-hover:translate-x-full
                      "
                    />

                    {loading ? (
                      <>
                        <span
                          className="
                            h-4
                            w-4
                            animate-spin
                            rounded-full
                            border-2
                            border-white/30
                            border-t-white
                          "
                        />

                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Continue

                        <ArrowRight
                          size={17}
                          className="
                            transition-transform
                            group-hover:translate-x-1
                          "
                        />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* =================================================
                  RESEND
              ================================================= */}

              <div
                data-aos="fade-up"
                data-aos-delay="230"
                className="
                  mt-7
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-zinc-50
                  p-4
                  text-center
                "
              >
                <p
                  className="
                    text-xs
                    text-zinc-500
                  "
                >
                  Didn't receive the code?
                </p>

                <button
                  type="button"
                  onClick={resendOTP}
                  disabled={
                    resending ||
                    resendCooldown > 0
                  }
                  className="
                    mt-2
                    inline-flex
                    items-center
                    gap-2
                    text-sm
                    font-bold
                    text-black
                    transition

                    hover:text-zinc-500

                    disabled:cursor-not-allowed
                    disabled:text-zinc-400
                  "
                >
                  {resending ? (
                    <>
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-zinc-300
                          border-t-black
                        "
                      />

                      Sending...
                    </>
                  ) : resendCooldown > 0 ? (
                    <>
                      <RefreshCw size={15} />

                      Resend OTP in{" "}
                      {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw size={15} />

                      Resend OTP

                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>

              {/* BACK */}

              <div
                data-aos="fade-up"
                data-aos-delay="270"
                className="
                  mt-7
                  border-t
                  border-zinc-100
                  pt-6
                  text-center
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/forgot-password"
                    )
                  }
                  className="
                    text-sm
                    font-bold
                    text-zinc-500
                    transition
                    hover:text-black
                  "
                >
                  ← Back to forgot password
                </button>
              </div>

              {/* REGISTER */}

              <div
                data-aos="fade-up"
                data-aos-delay="310"
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-zinc-50
                  p-4
                  text-center
                "
              >
                <p
                  className="
                    text-xs
                    text-zinc-500
                  "
                >
                  Don't have a seller account?
                </p>

                <Link
                  to="/register"
                  className="
                    mt-1.5
                    inline-flex
                    items-center
                    gap-1.5
                    text-sm
                    font-bold
                    text-black
                    transition
                    hover:text-zinc-500
                  "
                >
                  Become a Seller

                  <ArrowRight size={15} />
                </Link>
              </div>

              {/* SECURITY */}

              <div
                className="
                  mt-6
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[10px]
                  text-zinc-400
                "
              >
                <ShieldCheck size={13} />

                Secure password recovery
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default VerifyResetOTP;