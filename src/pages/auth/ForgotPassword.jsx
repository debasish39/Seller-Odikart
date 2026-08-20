import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  ArrowRight,
  Mail,
  ShieldCheck,
  Clock3,
  Store,
  Package,
  BarChart3,
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
  "https://odikart.in/web-app-manifest-512x512.png";

const SELLER_IMAGE =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
  | EMAIL CHANGE
  |--------------------------------------------------------------------------
  */

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDATE EMAIL
  |--------------------------------------------------------------------------
  */

  const validateEmail = () => {
    const value = email.trim();

    if (!value) {
      setError("Email address is required.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  /*
  |--------------------------------------------------------------------------
  | SEND RESET OTP
  |--------------------------------------------------------------------------
  */

  const sendOTP = async (e) => {
    e.preventDefault();

    setError("");

    if (!validateEmail()) {
      return;
    }

    try {
      setLoading(true);

      const cleanEmail = email
        .trim()
        .toLowerCase();

      const response = await api.post(
        "/auth/forgot-password",
        {
          email: cleanEmail,
        }
      );

      navigate("/verify-reset-otp", {
        state: {
          email: cleanEmail,
          message:
            response.data?.message ||
            "Password reset OTP sent successfully.",
        },
      });
    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setError(
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to send reset OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | UI
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

            {/* BACKGROUND IMAGE */}

            <img
              src={SELLER_IMAGE}
              alt="Odikart Seller Account Recovery"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
                object-center
              "
            />

            {/* OVERLAY */}

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

              {/* HERO TEXT */}

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

                  Account recovery
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
                  Get back to
                  <br />
                  your store.
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
                  Forgot your password? No problem.
                  We'll send a secure verification
                  code to your registered email so
                  you can create a new password.
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
                      text: "Recovery",
                    },
                    {
                      icon: Package,
                      title: "Products",
                      text: "Protected",
                    },
                    {
                      icon: BarChart3,
                      title: "Business",
                      text: "Continues",
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
                    Account Recovery
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

                  Password Recovery
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
                  Forgot your password?
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-zinc-500
                  "
                >
                  Enter your registered email
                  address and we'll send you a
                  verification code to reset your
                  password.
                </p>
              </div>

              {/* ERROR */}

           

              {/* FORM */}

              <form
                onSubmit={sendOTP}
                noValidate
                className="mt-8"
              >

                {/* EMAIL */}

                <div
                  data-aos="fade-up"
                  data-aos-delay="100"
                >
                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-xs
                      font-bold
                      text-zinc-700
                    "
                  >
                    Registered email address
                  </label>

                  <div className="relative">

                    <Mail
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
                      id="email"
                      name="email"
                      type="email"
                      inputMode="email"
                      placeholder="seller@example.com"
                      value={email}
                      onChange={handleEmailChange}
                      autoComplete="email"
                      autoFocus
                      required
                      aria-invalid={Boolean(error)}
                      className="
                        h-12
                        w-full
                        rounded-2xl
                        border
                        border-zinc-200
                        bg-zinc-50
                        pl-11
                        pr-4
                        text-sm
                        font-medium
                        text-black
                        outline-none
                        transition

                        placeholder:text-zinc-400

                        hover:border-zinc-300

                        focus:border-black
                        focus:bg-white
                        focus:ring-4
                        focus:ring-black/5
                      "
                    />
                  </div>

                  {error ? (
                    <p
                      id="email-error"
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
        text-[10px]
        font-bold
        text-red-600
      "
                      >
                        !
                      </span>

                      {error}
                    </p>
                  ) : (
                    <p
                      className="
      mt-2
      text-[11px]
      leading-5
      text-zinc-400
    "
                    >
                      Use the email address associated
                      with your Odikart seller account.
                    </p>
                  )}
                </div>

                {/* SEND BUTTON */}

                <div
                  data-aos="fade-up"
                  data-aos-delay="160"
                  className="mt-6"
                >
                  <button
                    type="submit"
                    disabled={loading}
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

                        Sending verification code...
                      </>
                    ) : (
                      <>
                        Send verification code

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

              {/* WHAT HAPPENS NEXT */}

              <div
                data-aos="fade-up"
                data-aos-delay="220"
                className="
                  mt-6
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
                    <ShieldCheck size={17} />
                  </div>

                  <div>
                    <p
                      className="
                        text-xs
                        font-bold
                        text-black
                      "
                    >
                      What happens next?
                    </p>

                    <div className="mt-3 space-y-2.5">

                      <div
                        className="
                          flex
                          items-center
                          gap-2.5
                        "
                      >
                        <span
                          className="
                            flex
                            h-5
                            w-5
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-white
                            text-[9px]
                            font-bold
                            text-black
                            shadow-sm
                          "
                        >
                          1
                        </span>

                        <p
                          className="
                            text-[11px]
                            text-zinc-500
                          "
                        >
                          We'll send an OTP to your
                          email.
                        </p>
                      </div>

                      <div
                        className="
                          flex
                          items-center
                          gap-2.5
                        "
                      >
                        <span
                          className="
                            flex
                            h-5
                            w-5
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-white
                            text-[9px]
                            font-bold
                            text-black
                            shadow-sm
                          "
                        >
                          2
                        </span>

                        <p
                          className="
                            text-[11px]
                            text-zinc-500
                          "
                        >
                          Enter the OTP to verify
                          your identity.
                        </p>
                      </div>

                      <div
                        className="
                          flex
                          items-center
                          gap-2.5
                        "
                      >
                        <span
                          className="
                            flex
                            h-5
                            w-5
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-white
                            text-[9px]
                            font-bold
                            text-black
                            shadow-sm
                          "
                        >
                          3
                        </span>

                        <p
                          className="
                            text-[11px]
                            text-zinc-500
                          "
                        >
                          Create your new password.
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              </div>

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
                  onClick={() => navigate("/login")}
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
                data-aos-delay="330"
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
                    gap-1
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

              {/* SECURITY FOOTER */}

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

export default ForgotPassword;