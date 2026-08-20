import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Mail,
  Phone,
  User,
  ShieldCheck,
  Store,
  Package,
  Wallet,
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

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
  | FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  /*
  |--------------------------------------------------------------------------
  | PASSWORD STRENGTH
  |--------------------------------------------------------------------------
  */

  const passwordStrength = useMemo(() => {
    const password = form.password;

    if (!password) {
      return {
        label: "",
        width: "0%",
        className: "bg-zinc-200",
      };
    }

    let score = 0;

    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) {
      return {
        label: "Weak",
        width: "35%",
        className: "bg-zinc-400",
      };
    }

    if (score <= 3) {
      return {
        label: "Good",
        width: "65%",
        className: "bg-zinc-600",
      };
    }

    return {
      label: "Strong",
      width: "100%",
      className: "bg-black",
    };
  }, [form.password]);

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    const nextErrors = {};

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!firstName) {
      nextErrors.firstName = "First name is required.";
    } else if (firstName.length < 2) {
      nextErrors.firstName =
        "First name must be at least 2 characters.";
    }

    if (!lastName) {
      nextErrors.lastName = "Last name is required.";
    } else if (lastName.length < 2) {
      nextErrors.lastName =
        "Last name must be at least 2 characters.";
    }

    if (!email) {
      nextErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!phone) {
      nextErrors.phone =
        "Phone number is required.";
    } else if (
      !/^[+]?[0-9\s()-]{10,16}$/.test(phone)
    ) {
      nextErrors.phone =
        "Enter a valid phone number.";
    }

    if (!form.password) {
      nextErrors.password =
        "Password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password =
        "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  /*
  |--------------------------------------------------------------------------
  | REGISTER SELLER
  |--------------------------------------------------------------------------
  */

  const registerSeller = async (e) => {
    e.preventDefault();

    setServerError("");

    if (!validateForm()) {
      return;
    }

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    try {
      setLoading(true);

      const response = await api.post("/auth/signup", {
        firstName,
        lastName,
        email,
        phone,
        password: form.password,
        role: "seller",
      });

      navigate("/verify-signup-otp", {
        state: {
          email,
          role: "seller",
        },
      });

      console.log(
        response.data?.message ||
          "OTP sent to your email."
      );
    } catch (error) {
      console.error(
        "Seller registration error:",
        error
      );

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to create your seller account. Please try again.";

      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INPUT STYLE
  |--------------------------------------------------------------------------
  */

  const inputClass = (field) => `
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
      errors[field]
        ? `
          border-zinc-900
          bg-zinc-50
          focus:ring-zinc-900/10
        `
        : `
          border-zinc-200
        `
    }
  `;

  /*
  |--------------------------------------------------------------------------
  | INPUT ERROR
  |--------------------------------------------------------------------------
  */

  const InputError = ({ field }) => {
    if (!errors[field]) return null;

    return (
      <p
        id={`${field}-error`}
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

        {errors[field]}
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

          {/* LOGO */}

          <button
            type="button"
            onClick={() => navigate("/login")}
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
            Sign in
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
  {/* =====================================================
      SPLASH IMAGE BACKGROUND
  ===================================================== */}

  <img
    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85"
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

  {/* =====================================================
      DARK OVERLAY
  ===================================================== */}

  <div
    className="
      absolute
      inset-0
      bg-black/55
    "
  />

  {/* =====================================================
      BOTTOM GRADIENT
  ===================================================== */}

  <div
    className="
      absolute
      inset-0
      bg-gradient-to-t
      from-black/90
      via-black/40
      to-black/10
    "
  />

  {/* =====================================================
      DECORATIVE CIRCLES
  ===================================================== */}

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

  {/* =====================================================
      CONTENT
  ===================================================== */}

  <div
    className="
      relative
      z-10
      flex
      h-full
      min-h-[650px]
      flex-col
      justify-between
      p-8
      sm:p-10
    "
  >

    {/* =================================================
        TOP
    ================================================= */}

    <div
      className="
        flex
        items-center
        justify-between
      "
    >

      {/* BRAND */}

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
            src="https://odikart.in/web-app-manifest-192x192.png"
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
            Odikart
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

      {/* PORTAL BADGE */}

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
            font-semibold
            uppercase
            tracking-wider
            text-white
          "
        >
          Seller Portal
        </span>

      </div>

    </div>

    {/* =================================================
        HERO CONTENT
    ================================================= */}

    <div>

      {/* BADGE */}

      <div
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
          text-xs
          font-semibold
          text-white
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

        Official Seller Portal

      </div>

      {/* TITLE */}

      <h1
        className="
          mt-7
          max-w-xl
          text-4xl
          font-semibold
          leading-[1.04]
          tracking-[-0.045em]
          text-white
          sm:text-5xl
        "
      >
        Build your store.
        <br />
        Grow with Odikart.
      </h1>

      {/* DESCRIPTION */}

      <p
        className="
          mt-5
          max-w-lg
          text-sm
          leading-7
          text-white/70
          sm:text-[17px]
        "
      >
        Everything you need to manage
        products, orders, customers and
        earnings from one seller portal.
      </p>

      {/* =================================================
          SELLER FEATURES
      ================================================= */}

      <div
        className="
          mt-8
          grid
          grid-cols-3
          gap-3
        "
      >

        {[
          {
            icon: Store,
            title: "Store",
            text: "Manage",
          },
          {
            icon: Package,
            title: "Orders",
            text: "Track",
          },
          {
            icon: Wallet,
            title: "Earnings",
            text: "Withdraw",
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
                bg-black/30
                p-4
                backdrop-blur-xl
                transition
                duration-300
                hover:bg-black/45
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
                "
              >
                <Icon size={17} />
              </div>

              <p
                className="
                  mt-3
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {item.title}
              </p>

              <p
                className="
                  mt-0.5
                  text-xs
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
              FORM CARD
          ===================================================== */}

          <section
            data-aos="fade-up"
            data-aos-delay="80"
            className="
              overflow-hidden
              rounded-[28px]
              border
              border-zinc-200
              bg-white
              shadow-[0_8px_35px_rgba(0,0,0,0.06)]
            "
          >

            {/* CARD HEADER */}

            <div
              className="
                border-b
                border-zinc-100
                px-5
                py-6
                sm:px-8
                sm:py-8
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
                    Become a seller
                  </p>

                  <p
                    className="
                      text-[11px]
                      text-zinc-500
                    "
                  >
                    Odikart Seller Portal
                  </p>

                </div>

              </div>

              <h2
                className="
                  mt-6
                  text-2xl
                  font-semibold
                  tracking-[-0.03em]
                  text-black
                  sm:text-3xl
                "
              >
                Create your account
              </h2>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-zinc-500
                "
              >
                Set up your seller profile and
                start selling on Odikart.
              </p>

            </div>

            {/* ERROR */}

            {serverError && (
              <div
                data-aos="fade-down"
                role="alert"
                className="
                  mx-5
                  mt-5
                  flex
                  items-start
                  gap-3
                  rounded-2xl
                  border
                  border-zinc-200
                  bg-zinc-50
                  p-4
                  sm:mx-8
                "
              >

                <div
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-black
                    text-sm
                    font-bold
                    text-white
                  "
                >
                  !
                </div>

                <div className="min-w-0 flex-1">

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-black
                    "
                  >
                    Registration failed
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-zinc-600
                    "
                  >
                    {serverError}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setServerError("")
                  }
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    text-zinc-400
                    transition
                    hover:bg-white
                    hover:text-black
                  "
                >
                  <X size={15} />
                </button>

              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={registerSeller}
              noValidate
              className="
                space-y-5
                p-5
                sm:p-8
              "
            >

              {/* PERSONAL INFORMATION */}

              <div>

                <div className="mb-3">

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-black
                    "
                  >
                    Personal information
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-zinc-500
                    "
                  >
                    Enter the details of the
                    seller account owner.
                  </p>

                </div>

                <div
                  className="
                    grid
                    gap-4
                    sm:grid-cols-2
                  "
                >

                  {/* FIRST NAME */}

                  <div>

                    <label
                      htmlFor="firstName"
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        text-zinc-700
                      "
                    >
                      First name
                    </label>

                    <div className="relative">

                      <User
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
                        id="firstName"
                        type="text"
                        name="firstName"
                        placeholder="John"
                        value={form.firstName}
                        onChange={handleChange}
                        autoComplete="given-name"
                        required
                        className={`
                          pl-11
                          ${inputClass("firstName")}
                        `}
                      />

                    </div>

                    <InputError field="firstName" />

                  </div>

                  {/* LAST NAME */}

                  <div>

                    <label
                      htmlFor="lastName"
                      className="
                        mb-2
                        block
                        text-xs
                        font-semibold
                        text-zinc-700
                      "
                    >
                      Last name
                    </label>

                    <input
                      id="lastName"
                      type="text"
                      name="lastName"
                      placeholder="Doe"
                      value={form.lastName}
                      onChange={handleChange}
                      autoComplete="family-name"
                      required
                      className={inputClass(
                        "lastName"
                      )}
                    />

                    <InputError field="lastName" />

                  </div>

                </div>

              </div>

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
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
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    className={`
                      pl-11
                      ${inputClass("email")}
                    `}
                  />

                </div>

                <InputError field="email" />

              </div>

              {/* PHONE */}

              <div>

                <label
                  htmlFor="phone"
                  className="
                    mb-2
                    block
                    text-xs
                    font-semibold
                    text-zinc-700
                  "
                >
                  Phone number
                </label>

                <div className="relative">

                  <Phone
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
                    id="phone"
                    type="tel"
                    name="phone"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                    className={`
                      pl-11
                      ${inputClass("phone")}
                    `}
                  />

                </div>

                <InputError field="phone" />

              </div>

              {/* PASSWORD */}

              <div>

                <div
                  className="
                    mb-2
                    flex
                    items-center
                    justify-between
                  "
                >

                  <label
                    htmlFor="password"
                    className="
                      text-xs
                      font-semibold
                      text-zinc-700
                    "
                  >
                    Password
                  </label>

                  <span
                    className="
                      text-[10px]
                      font-medium
                      text-zinc-400
                    "
                  >
                    6+ characters
                  </span>

                </div>

                <div className="relative">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    placeholder="Create a secure password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={6}
                    required
                    className={`
                      pr-12
                      ${inputClass("password")}
                    `}
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
                      right-2
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
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

                {/* STRENGTH */}

                {form.password && (
                  <div className="mt-3">

                    <div
                      className="
                        h-1
                        overflow-hidden
                        rounded-full
                        bg-zinc-100
                      "
                    >
                      <div
                        className={`
                          h-full
                          rounded-full
                          transition-all
                          duration-500
                          ${passwordStrength.className}
                        `}
                        style={{
                          width:
                            passwordStrength.width,
                        }}
                      />
                    </div>

                    <div
                      className="
                        mt-2
                        flex
                        justify-between
                      "
                    >

                      <span
                        className="
                          text-[10px]
                          text-zinc-400
                        "
                      >
                        Strong passwords use
                        numbers and symbols.
                      </span>

                      <span
                        className="
                          text-[10px]
                          font-semibold
                          text-black
                        "
                      >
                        {passwordStrength.label}
                      </span>

                    </div>

                  </div>
                )}

                <InputError field="password" />

              </div>

              {/* VERIFICATION */}

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
                    Secure email verification
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                      text-zinc-500
                    "
                  >
                    We'll send a verification OTP
                    after you create your seller
                    account.
                  </p>

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="
                  group
                  flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-black
                  px-5
                  py-3.5
                  text-sm
                  font-semibold
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

                    Creating account...
                  </>
                ) : (
                  <>
                    Create seller account

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

              {/* LOGIN */}

              <div
                className="
                  border-t
                  border-zinc-100
                  pt-5
                  text-center
                "
              >

                <p
                  className="
                    text-xs
                    text-zinc-500
                  "
                >
                  Already have a seller account?
                </p>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/login")
                  }
                  className="
                    mt-1
                    rounded-full
                    px-3
                    py-2
                    text-sm
                    font-semibold
                    text-black
                    transition
                    hover:bg-zinc-100
                  "
                >
                  Sign in
                </button>

              </div>

              {/* TERMS */}

              <p
                className="
                  text-center
                  text-[10px]
                  leading-5
                  text-zinc-400
                "
              >
                By creating a seller account,
                you agree to Odikart's seller
                terms and policies.
              </p>

            </form>

          </section>

        </div>

      </main>

      {/* =========================================================
          MOBILE FOOTER
      ========================================================= */}

      <div
        className="
          pb-8
          text-center
          lg:hidden
        "
      >

        <div
          className="
            inline-flex
            items-center
            gap-2
            rounded-full
            border
            border-zinc-200
            bg-white
            px-3
            py-2
          "
        >

          <img
            src={ODIKART_LOGO}
            alt="Odikart"
            className="
              h-5
              w-5
              rounded-lg
            "
          />

          <span
            className="
              text-[10px]
              font-semibold
              text-zinc-500
            "
          >
            Odikart Seller Portal
          </span>

        </div>

      </div>

    </div>
  );
}

export default Register;