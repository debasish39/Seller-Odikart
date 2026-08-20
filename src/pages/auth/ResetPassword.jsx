import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  X,
  Package,
  LockKeyhole,
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
  "https://odikart.in/web-app-manifest-512x512.png";

const SELLER_IMAGE =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    general: "",
  });

  const [success, setSuccess] = useState("");

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
  | PASSWORD STRENGTH
  |--------------------------------------------------------------------------
  */

  const passwordStrength = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: "",
      };
    }

    let score = 0;

    if (password.length >= 8) {
      score++;
    }

    if (/[A-Z]/.test(password)) {
      score++;
    }

    if (/[a-z]/.test(password)) {
      score++;
    }

    if (/[0-9]/.test(password)) {
      score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    }

    let label = "";

    if (score <= 2) {
      label = "Weak";
    } else if (score === 3) {
      label = "Fair";
    } else if (score === 4) {
      label = "Good";
    } else {
      label = "Strong";
    }

    return {
      score,
      label,
    };
  }, [password]);

  /*
  |--------------------------------------------------------------------------
  | PASSWORD CHANGE
  |--------------------------------------------------------------------------
  */

  const handlePasswordChange = (e) => {
    const value = e.target.value;

    setPassword(value);

    setErrors((prev) => ({
      ...prev,
      password: "",
      general: "",
    }));

    setSuccess("");
  };

  /*
  |--------------------------------------------------------------------------
  | CONFIRM PASSWORD CHANGE
  |--------------------------------------------------------------------------
  */

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;

    setConfirmPassword(value);

    setErrors((prev) => ({
      ...prev,
      confirmPassword: "",
      general: "",
    }));

    setSuccess("");
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDATE
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    const nextErrors = {
      password: "",
      confirmPassword: "",
      general: "",
    };

    if (!email || !otp) {
      nextErrors.general =
        "Your password reset session is incomplete. Please request a new reset OTP.";

      setErrors(nextErrors);

      return false;
    }

    if (!password) {
      nextErrors.password =
        "Please enter a new password.";
    } else if (password.length < 8) {
      nextErrors.password =
        "Password must be at least 8 characters long.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword =
        "Please confirm your new password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(nextErrors);

    return (
      !nextErrors.password &&
      !nextErrors.confirmPassword &&
      !nextErrors.general
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RESET PASSWORD
  |--------------------------------------------------------------------------
  */

  const resetPassword = async (e) => {
    e.preventDefault();

    setErrors({
      password: "",
      confirmPassword: "",
      general: "",
    });

    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.put(
        "/auth/reset-password",
        {
          email,
          otp,
          newPassword: password,
        }
      );

      setSuccess(
        response.data?.message ||
          "Password reset successfully."
      );

      /*
      |--------------------------------------------------------------------------
      | Redirect after successful reset
      |--------------------------------------------------------------------------
      */

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        });
      }, 1200);
    } catch (error) {
      console.error(
        "Reset password error:",
        error.response?.data || error
      );

      setErrors({
        password: "",
        confirmPassword: "",
        general:
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to reset your password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | PASSWORD INPUT CLASS
  |--------------------------------------------------------------------------
  */

  const getPasswordInputClass = (hasError) => `
    h-12
    w-full
    rounded-2xl
    border
    bg-zinc-50
    px-4
    pl-11
    pr-12
    text-sm
    font-medium
    text-zinc-950
    outline-none
    transition-all

    placeholder:text-zinc-400

    hover:border-zinc-300

    focus:bg-white
    focus:ring-4

    ${
      hasError
        ? `
          border-red-300
          bg-red-50/30
          focus:border-red-500
          focus:ring-red-500/10
        `
        : `
          border-zinc-200
          focus:border-black
          focus:ring-black/5
        `
    }

    disabled:cursor-not-allowed
    disabled:opacity-60
  `;

  /*
  |--------------------------------------------------------------------------
  | MISSING RESET SESSION
  |--------------------------------------------------------------------------
  */

  if (!email || !otp) {
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

        {/* SESSION ERROR */}

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
              Reset session expired
            </h1>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-zinc-500
              "
            >
              Your password reset information is
              missing or expired. Please request a
              new verification code.
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
          TOP APP BAR
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
              HERO
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
              alt="Odikart Seller Security"
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

                  New password
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
                  Secure your
                  <br />
                  seller account.
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
                  Create a strong password to protect
                  your store, products, orders and
                  seller information.
                </p>

                {/* FEATURES */}

                <div
                  data-aos="fade-up"
                  data-aos-delay="180"
                  className="
                    mt-8
                    grid
                    grid-cols-3
                    gap-3
                  "
                >

                  {[
                    {
                      icon: ShieldCheck,
                      title: "Secure",
                      text: "Account",
                    },
                    {
                      icon: LockKeyhole,
                      title: "Private",
                      text: "Password",
                    },
                    {
                      icon: Package,
                      title: "Protected",
                      text: "Products",
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/35
                          p-4
                          backdrop-blur-xl
                          transition-all
                          duration-300
                          hover:border-white/20
                          hover:bg-black/50
                        "
                      >
                        <div
                          className="
                            flex
                            h-9
                            w-9
                            items-center
                            justify-center
                            rounded-xl
                            bg-white
                            text-black
                            shadow-lg
                          "
                        >
                          <Icon size={17} />
                        </div>

                        <p
                          className="
                            mt-3
                            text-xs
                            font-semibold
                            text-white
                          "
                        >
                          {item.title}
                        </p>

                        <p
                          className="
                            mt-1
                            text-[10px]
                            text-white/50
                          "
                        >
                          {item.text}
                        </p>
                      </div>
                    );
                  })}
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

                  Reset Password
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
                  Create new password
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-zinc-500
                  "
                >
                  Choose a strong password for your
                  Odikart seller account.
                </p>
              </div>

              {/* ACCOUNT */}

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

                <div className="min-w-0">
                  <p
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-wider
                      text-zinc-400
                    "
                  >
                    Account
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
              </div>

              {/* GENERAL ERROR */}

              {errors.general && (
                <div
                  data-aos="fade-down"
                  role="alert"
                  aria-live="assertive"
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-red-200
                    bg-red-50
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
                        bg-red-100
                        text-sm
                        font-bold
                        text-red-600
                      "
                    >
                      !
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="
                          text-sm
                          font-bold
                          text-red-800
                        "
                      >
                        Unable to continue
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-red-600
                        "
                      >
                        {errors.general}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setErrors((prev) => ({
                          ...prev,
                          general: "",
                        }))
                      }
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-lg
                        text-red-400
                        transition
                        hover:bg-red-100
                        hover:text-red-600
                      "
                      aria-label="Dismiss error"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              )}

              {/* SUCCESS */}

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
                        text-sm
                        font-bold
                        text-white
                      "
                    >
                      ✓
                    </div>

                    <div>
                      <p
                        className="
                          text-sm
                          font-bold
                          text-black
                        "
                      >
                        Password updated
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

              {/* FORM */}

              <form
                onSubmit={resetPassword}
                noValidate
                className="
                  mt-7
                  space-y-5
                "
              >

                {/* =================================================
                    NEW PASSWORD
                ================================================= */}

                <div
                  data-aos="fade-up"
                  data-aos-delay="130"
                >
                  <label
                    htmlFor="password"
                    className="
                      mb-2
                      block
                      text-xs
                      font-bold
                      text-zinc-700
                    "
                  >
                    New Password
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={18}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-zinc-400
                      "
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={
                        handlePasswordChange
                      }
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      disabled={loading}
                      aria-invalid={Boolean(
                        errors.password
                      )}
                      aria-describedby={
                        errors.password
                          ? "password-error"
                          : undefined
                      }
                      className={getPasswordInputClass(
                        Boolean(errors.password)
                      )}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (prev) => !prev
                        )
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        flex
                        h-9
                        w-9
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-xl
                        text-zinc-400
                        transition

                        hover:bg-zinc-100
                        hover:text-black
                      "
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {/* INLINE ERROR */}

                  {errors.password && (
                    <p
                      id="password-error"
                      role="alert"
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

                      {errors.password}
                    </p>
                  )}

                  {/* PASSWORD STRENGTH */}

                  {password && (
                    <div className="mt-3">

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                        "
                      >
                        <span
                          className="
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-wider
                            text-zinc-400
                          "
                        >
                          Password strength
                        </span>

                        <span
                          className="
                            text-[10px]
                            font-bold
                            text-zinc-500
                          "
                        >
                          {passwordStrength.label}
                        </span>
                      </div>

                      <div
                        className="
                          mt-2
                          grid
                          grid-cols-5
                          gap-1.5
                        "
                      >
                        {[1, 2, 3, 4, 5].map(
                          (item) => (
                            <div
                              key={item}
                              className={`
                                h-1.5
                                rounded-full
                                transition-all

                                ${
                                  item <=
                                  passwordStrength.score
                                    ? "bg-black"
                                    : "bg-zinc-200"
                                }
                              `}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* REQUIREMENTS */}

                  <div className="mt-3 space-y-1.5">

                    <PasswordRequirement
                      valid={
                        password.length >= 8
                      }
                      text="At least 8 characters"
                    />

                    <PasswordRequirement
                      valid={/[A-Z]/.test(
                        password
                      )}
                      text="One uppercase letter"
                    />

                    <PasswordRequirement
                      valid={/[a-z]/.test(
                        password
                      )}
                      text="One lowercase letter"
                    />

                    <PasswordRequirement
                      valid={/[0-9]/.test(
                        password
                      )}
                      text="One number"
                    />

                    <PasswordRequirement
                      valid={/[^A-Za-z0-9]/.test(
                        password
                      )}
                      text="One special character"
                    />

                  </div>
                </div>

                {/* =================================================
                    CONFIRM PASSWORD
                ================================================= */}

                <div
                  data-aos="fade-up"
                  data-aos-delay="180"
                >
                  <label
                    htmlFor="confirmPassword"
                    className="
                      mb-2
                      block
                      text-xs
                      font-bold
                      text-zinc-700
                    "
                  >
                    Confirm New Password
                  </label>

                  <div className="relative">

                    <LockKeyhole
                      size={18}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-zinc-400
                      "
                    />

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={
                        handleConfirmPasswordChange
                      }
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      disabled={loading}
                      aria-invalid={Boolean(
                        errors.confirmPassword
                      )}
                      aria-describedby={
                        errors.confirmPassword
                          ? "confirm-password-error"
                          : undefined
                      }
                      className={getPasswordInputClass(
                        Boolean(
                          errors.confirmPassword
                        )
                      )}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (prev) => !prev
                        )
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        flex
                        h-9
                        w-9
                        -translate-y-1/2
                        items-center
                        justify-center
                        rounded-xl
                        text-zinc-400
                        transition

                        hover:bg-zinc-100
                        hover:text-black
                      "
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  {/* INLINE ERROR */}

                  {errors.confirmPassword && (
                    <p
                      id="confirm-password-error"
                      role="alert"
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

                      {errors.confirmPassword}
                    </p>
                  )}

                  {/* MATCH MESSAGE */}

                  {!errors.confirmPassword &&
                    confirmPassword && (
                      <p
                        className="
                          mt-2
                          flex
                          items-center
                          gap-1.5
                          text-[11px]
                          font-semibold
                          text-emerald-600
                        "
                      >
                        <span
                          className="
                            flex
                            h-4
                            w-4
                            items-center
                            justify-center
                            rounded-full
                            bg-emerald-100
                            text-[9px]
                            font-bold
                          "
                        >
                          ✓
                        </span>

                        Passwords match
                      </p>
                    )}
                </div>

                {/* =================================================
                    SUBMIT
                ================================================= */}

                <div
                  data-aos="fade-up"
                  data-aos-delay="230"
                  className="pt-1"
                >
                  <button
                    type="submit"
                    disabled={
                      loading ||
                      !password ||
                      !confirmPassword
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

                        Updating password...
                      </>
                    ) : (
                      <>
                        Reset Password

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

              {/* BACK TO LOGIN */}

              <div
                data-aos="fade-up"
                data-aos-delay="280"
                className="
                  mt-7
                  text-center
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate("/login")
                  }
                  className="
                    text-sm
                    font-bold
                    text-zinc-500
                    transition
                    hover:text-black
                  "
                >
                  ← Back to seller login
                </button>
              </div>

              {/* REGISTER */}

              <div
                data-aos="fade-up"
                data-aos-delay="320"
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

/*
|--------------------------------------------------------------------------
| PASSWORD REQUIREMENT
|--------------------------------------------------------------------------
*/

function PasswordRequirement({
  valid,
  text,
}) {
  return (
    <div
      className={`
        flex
        items-center
        gap-2
        text-[10px]
        font-medium
        transition

        ${
          valid
            ? "text-emerald-600"
            : "text-zinc-400"
        }
      `}
    >
      <span
        className={`
          flex
          h-4
          w-4
          items-center
          justify-center
          rounded-full
          text-[9px]

          ${
            valid
              ? "bg-emerald-100"
              : "bg-zinc-100"
          }
        `}
      >
        {valid ? "✓" : "•"}
      </span>

      {text}
    </div>
  );
}

export default ResetPassword;