import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Mail,
  Smartphone,
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
  "https://odikart.in/web-app-manifest-192x192.png";

const SELLER_IMAGE =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85";

function LoginOTP() {
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
  | CHANGE
  |--------------------------------------------------------------------------
  */

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
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
  | SEND OTP
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

      const cleanEmail = email.trim().toLowerCase();

      const response = await api.post("/auth/signin-otp", {
        email: cleanEmail,
      });

      navigate("/verify-login-otp", {
        state: {
          email: cleanEmail,
          message:
            response.data?.message ||
            "OTP sent successfully.",
        },
      });
    } catch (error) {
      console.error(
        "Seller OTP login error:",
        error
      );

      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INPUT CLASS
  |--------------------------------------------------------------------------
  */

  const inputClass = `
    h-12
    w-full
    rounded-2xl
    border
    bg-zinc-50
    px-4
    text-sm
    font-medium
    text-zinc-950
    outline-none
    transition-all
    placeholder:text-zinc-400

    hover:border-zinc-300

    focus:bg-white
    focus:border-black
    focus:ring-4
    focus:ring-black/5

    ${
      error
        ? `
          border-black
          bg-zinc-50
          focus:ring-black/10
        `
        : `
          border-zinc-200
        `
    }
  `;

  /*
  |--------------------------------------------------------------------------
  | ERROR MESSAGE
  |--------------------------------------------------------------------------
  */

  const InputError = () => {
    if (!error) {
      return null;
    }

    return (
      <p
        id="email-error"
        className="
          mt-1.5
          flex
          items-center
          gap-1.5
          text-[11px]
          font-medium
          text-red-500
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
            bg-red-500
            text-[9px]
            font-bold
            text-white
          "
        >
          !
        </span>

        {error}
      </p>
    );
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

            {/* BACKGROUND IMAGE */}

            <img
              src={SELLER_IMAGE}
              alt="Odikart Seller Portal"
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

              {/* TOP BRAND */}

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
                    Seller Portal
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

                  Secure OTP Login
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
                  Sign in
                  <br />
                  without a password.
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
                  Use a secure one-time verification
                  code sent to your registered seller
                  email to access your Odikart Seller
                  Portal.
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
              OTP LOGIN PANEL
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
                    Seller Portal
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

                  OTP Login
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
                  Sign in with OTP
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-zinc-500
                  "
                >
                  Enter your registered seller email
                  and we'll send you a secure
                  verification code.
                </p>
              </div>

              {/* ERROR */}
{/* 
              {error && (
                <div
                  data-aos="fade-down"
                  role="alert"
                  aria-live="assertive"
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
                        Unable to send OTP
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
              )} */}

              {/* FORM */}

              <form
                onSubmit={sendOTP}
                noValidate
                className="
                  mt-7
                  space-y-5
                "
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
                    Email address
                  </label>

                  <div className="relative">

                    <Mail
                      size={17}
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
                      type="email"
                      name="email"
                      placeholder="seller@example.com"
                      value={email}
                      onChange={handleEmailChange}
                      autoComplete="email"
                      autoFocus
                      required
                      aria-invalid={Boolean(error)}
                      aria-describedby={
                        error
                          ? "email-error"
                          : undefined
                      }
                      className={`
                        pl-11
                        ${inputClass}
                      `}
                    />
                  </div>

                  <InputError />

                  <p
                    className="
                      mt-2
                      text-[11px]
                      leading-5
                      text-zinc-400
                    "
                  >
                    Use the same email address
                    associated with your Odikart
                    seller account.
                  </p>
                </div>

                {/* SECURITY INFO */}

                <div
                  className="
                    flex
                    items-start
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
                    <ShieldCheck size={18} />
                  </div>

                  <div>
                    <p
                      className="
                        text-xs
                        font-semibold
                        text-black
                      "
                    >
                      Secure verification
                    </p>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        leading-5
                        text-zinc-500
                      "
                    >
                      Your OTP is temporary and
                      should never be shared with
                      anyone.
                    </p>
                  </div>
                </div>

                {/* SEND OTP BUTTON */}

                <div
                  data-aos="fade-up"
                  data-aos-delay="150"
                  className="pt-1"
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

                        Sending OTP...
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

              {/* DIVIDER */}

              <div
                data-aos="fade-up"
                data-aos-delay="200"
                className="
                  my-6
                  flex
                  items-center
                  gap-4
                "
              >
                <div
                  className="
                    h-px
                    flex-1
                    bg-zinc-200
                  "
                />

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-widest
                    text-zinc-400
                  "
                >
                  Or
                </span>

                <div
                  className="
                    h-px
                    flex-1
                    bg-zinc-200
                  "
                />
              </div>

              {/* PASSWORD LOGIN */}

              <button
                type="button"
                onClick={() => navigate("/login")}
                data-aos="fade-up"
                data-aos-delay="250"
                className="
                  flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-full
                  border
                  border-zinc-200
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-zinc-800
                  transition

                  hover:border-black
                  hover:bg-zinc-50
                  hover:text-black

                  active:scale-[0.98]

                  focus:outline-none
                  focus:ring-4
                  focus:ring-black/5
                "
              >
                <Smartphone
                  size={18}
                  className="rotate-180"
                />

                Login with password

                <ArrowRight
                  size={15}
                  className="text-zinc-400"
                />
              </button>

              {/* REGISTER */}

              <div
                data-aos="fade-up"
                data-aos-delay="300"
                className="
                  mt-6
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
                    rounded-full
                    px-3
                    py-2
                    text-sm
                    font-bold
                    text-black
                    transition
                    hover:bg-white
                  "
                >
                  Become a Seller

                  <ArrowRight size={15} />
                </Link>
              </div>

              {/* FOOTER */}

              <div
                data-aos="fade-up"
                data-aos-delay="350"
                className="
                  mt-6
                  text-center
                "
              >
                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    text-[10px]
                    font-medium
                    text-zinc-400
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

                  Odikart Seller Portal

                  <span
                    className="
                      h-1.5
                      w-1.5
                      rounded-full
                      bg-black
                    "
                  />
                </div>

                <p
                  className="
                    mt-2
                    text-[10px]
                    leading-5
                    text-zinc-400
                  "
                >
                  Secure OTP authentication for
                  approved seller accounts.
                </p>
              </div>

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default LoginOTP;

