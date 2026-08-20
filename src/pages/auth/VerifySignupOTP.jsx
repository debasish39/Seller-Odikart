import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  Mail,
  ShieldCheck,
  Clock3,
  Package,
  BarChart3,
  RefreshCw,
  X,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

import api from "../../services/api";

const ODIKART_LOGO =
  "https://odikart.in/web-app-manifest-192x192.png";

const SELLER_IMAGE =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85";

function VerifySignupOTP() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";
  const role = location.state?.role || "user";

  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [resendCooldown, setResendCooldown] = useState(0);

  /* =====================================================
     AOS
  ===================================================== */

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

  /* =====================================================
     RESEND TIMER
  ===================================================== */

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  /* =====================================================
     EMAIL CHECK
  ===================================================== */

  useEffect(() => {
    if (!email) {
      setError(
        "Email address is missing. Please register again."
      );
    }
  }, [email]);

  /* =====================================================
     OTP CHANGE
  ===================================================== */

  const handleOTPChange = (e) => {
    const value = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);
    setError("");
    setSuccess("");
  };

  /* =====================================================
     VERIFY SIGNUP OTP
  ===================================================== */

  const verifyOTP = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError(
        "Your email address is missing. Please register again."
      );
      return;
    }

    if (!otp) {
      setError("Please enter the verification OTP.");
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
        "/auth/verify-signup-otp",
        {
          email,
          otp,
        }
      );

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error(
          "Invalid verification response from server."
        );
      }

      /* =================================================
         SAVE AUTH DATA
      ================================================= */

      localStorage.setItem("token", token);

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      localStorage.setItem(
        "role",
        user.role
      );

      setSuccess(
        response.data?.message ||
          "Account verified successfully. Redirecting..."
      );

      /* =================================================
         SELLER FLOW
      ================================================= */

      if (
        role === "seller" ||
        user.role === "seller"
      ) {
        setTimeout(() => {
          navigate("/seller/complete-profile", {
            replace: true,
          });
        }, 700);

        return;
      }

      /* =================================================
         NORMAL USER FLOW
      ================================================= */

      setTimeout(() => {
        navigate("/", {
          replace: true,
        });
      }, 700);
    } catch (error) {
      console.error(
        "Verify signup OTP error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "OTP verification failed. Please check the OTP and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RESEND SIGNUP OTP
  ===================================================== */

  const resendOTP = async () => {
    if (!email) {
      setError(
        "Email address is missing. Please register again."
      );
      return;
    }

    if (resendCooldown > 0 || resending) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      setResending(true);

      const response = await api.post(
        "/auth/resend-signup-otp",
        {
          email,
        }
      );

      setSuccess(
        response.data?.message ||
          "A new OTP has been sent to your email."
      );

      setOtp("");

      // Prevent spam requests
      setResendCooldown(30);
    } catch (error) {
      console.error(
        "Resend signup OTP error:",
        error
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

  /* =====================================================
     CHANGE EMAIL
  ===================================================== */

  const changeEmail = () => {
    navigate("/register");
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-zinc-950">

      {/* =====================================================
          TOP APP BAR
      ===================================================== */}

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

          {/* REGISTER */}

          <Link
            to="/register"
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
            Become a Seller
          </Link>
        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

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
              DESKTOP HERO
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

            {/* BACKGROUND */}

            <img
              src={SELLER_IMAGE}
              alt="Odikart Seller Verification"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                object-center
              "
            />

            {/* DARK OVERLAY */}

            <div
              className="
                absolute
                inset-0
                bg-black/55
              "
            />

            {/* GRADIENT */}

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

            {/* DECORATIVE CIRCLES */}

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

            {/* CONTENT */}

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

                {/* STATUS */}

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

                {/* BADGE */}

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

                  Secure verification
                </span>

                {/* TITLE */}

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
                  account.
                </h1>

                {/* DESCRIPTION */}

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
                  Enter the verification code sent
                  to your email address to securely
                  complete your Odikart seller
                  registration.
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
                      text: "OTP access",
                    },
                    {
                      icon: Package,
                      title: "Products",
                      text: "Manage stock",
                    },
                    {
                      icon: BarChart3,
                      title: "Analytics",
                      text: "Track sales",
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
              VERIFY OTP PANEL
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
                    OTP Verification
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

                  Verify Signup
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
                  Verify your email
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-zinc-500
                  "
                >
                  Enter the 6-digit verification
                  code we sent to your email.
                </p>
              </div>

              {/* EMAIL CARD */}

              <div
                data-aos="fade-up"
                data-aos-delay="100"
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
                    OTP sent to
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
                    {email || "Email not available"}
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

              {/* ERROR */}

              {error && (
                <div
                  data-aos="fade-down"
                  role="alert"
                  aria-live="assertive"
                  className="
                    mt-5
                    rounded-2xl
                    border
                    border-zinc-200
                    bg-zinc-50
                    p-4
                  "
                >
                  <div className="flex items-start gap-3">
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
                      !
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="
                          text-sm
                          font-bold
                          text-black
                        "
                      >
                        Verification failed
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-zinc-600
                        "
                      >
                        {error}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setError("")}
                      className="
                        flex
                        h-7
                        w-7
                        items-center
                        justify-center
                        rounded-lg
                        text-zinc-400
                        transition
                        hover:bg-white
                        hover:text-black
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
                  <div className="flex items-start gap-3">
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
                        Success
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

              {/* OTP FORM */}

              <form
                onSubmit={verifyOTP}
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
                  Verification code
                </label>

                {/* OTP INPUT */}

                <div
                  data-aos="fade-up"
                  data-aos-delay="150"
                  className="relative"
                >
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={handleOTPChange}
                    placeholder="000000"
                    autoFocus
                    disabled={loading}
                    className="
                      h-16
                      w-full
                      rounded-2xl
                      border
                      border-zinc-200
                      bg-zinc-50
                      px-5
                      text-center
                      text-2xl
                      font-bold
                      tracking-[0.5em]
                      text-black
                      outline-none
                      transition
                      placeholder:text-zinc-300
                      placeholder:tracking-[0.5em]
                      hover:border-zinc-300
                      focus:border-black
                      focus:bg-white
                      focus:ring-4
                      focus:ring-black/5
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  />
                </div>

                {/* OTP COUNTER */}

                <div
                  data-aos="fade-up"
                  data-aos-delay="180"
                  className="
                    mt-3
                    flex
                    items-center
                    justify-between
                  "
                >
                  <p className="text-[11px] text-zinc-400">
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

                {/* VERIFY BUTTON */}

                <div
                  data-aos="fade-up"
                  data-aos-delay="220"
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

              {/* RESEND */}

              <div
                data-aos="fade-up"
                data-aos-delay="260"
                className="mt-6 text-center"
              >
                <p className="text-xs text-zinc-400">
                  Didn't receive the code?
                </p>

                <button
                  type="button"
                  onClick={resendOTP}
                  disabled={
                    resending ||
                    resendCooldown > 0 ||
                    !email
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
                      <Clock3 size={15} />

                      Resend OTP in{" "}
                      {resendCooldown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw size={15} />

                      Resend OTP
                    </>
                  )}
                </button>
              </div>

              {/* BACK TO REGISTER */}

              <div
                data-aos="fade-up"
                data-aos-delay="300"
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
                  onClick={() => navigate("/register")}
                  className="
                    text-sm
                    font-bold
                    text-zinc-500
                    transition
                    hover:text-black
                  "
                >
                  ← Back to registration
                </button>
              </div>

              {/* LOGIN */}

              <div
                data-aos="fade-up"
                data-aos-delay="340"
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
                <p className="text-xs text-zinc-500">
                  Already have an account?
                </p>

                <Link
                  to="/login"
                  className="
                    mt-1.5
                    inline-flex
                    items-center
                    gap-1
                    text-sm
                    font-bold
                    text-black
                    transition
                    hover:text-zinc-500
                  "
                >
                  Sign in

                  <ArrowRight size={15} />
                </Link>
              </div>

              {/* FOOTER */}

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

                Secure seller registration
              </div>

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default VerifySignupOTP;