import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Info,
  MapPin,
  Store,
  Building2,
  ShieldCheck,
  X,
  FileCheck2,
  Globe2,
  Phone,
  Mail,
} from "lucide-react";

import AOS from "aos";
import "aos/dist/aos.css";

import api from "../../services/api";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const ODIKART_LOGO =
  "https://odikart.in/web-app-manifest-192x192.png";

const SELLER_IMAGE =
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85";

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

function CompleteSellerProfile() {
  const navigate = useNavigate();

  /*
  |--------------------------------------------------------------------------
  | STATE
  |--------------------------------------------------------------------------
  */

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const [serverError, setServerError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [form, setForm] = useState({
    shopName: "",
    shopSlug: "",
    description: "",
    website: "",
    supportEmail: "",
    supportPhone: "",

    ownerName: "",
    businessType: "Individual",
    gstNumber: "",
    panNumber: "",
    registrationNumber: "",

    street: "",
    city: "",
    state: "",
    postcode: "",
    country: "India",
  });

  /*
  |--------------------------------------------------------------------------
  | AOS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    AOS.init({
      duration: 550,
      easing: "ease-out-cubic",
      once: true,
      offset: 20,
    });

    return () => {
      AOS.refreshHard();
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | SLUG GENERATOR
  |--------------------------------------------------------------------------
  */

  const generateSlug = (value) => {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  /*
  |--------------------------------------------------------------------------
  | FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    let nextValue = value;

    /*
    |--------------------------------------------------------------------------
    | GST
    |--------------------------------------------------------------------------
    */

    if (name === "gstNumber") {
      nextValue = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 15);
    }

    /*
    |--------------------------------------------------------------------------
    | PAN
    |--------------------------------------------------------------------------
    */

    if (name === "panNumber") {
      nextValue = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10);
    }

    /*
    |--------------------------------------------------------------------------
    | SLUG
    |--------------------------------------------------------------------------
    */

    if (name === "shopSlug") {
      nextValue = generateSlug(value);
    }

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
    setSuccessMessage("");
  };

  /*
  |--------------------------------------------------------------------------
  | SHOP NAME
  |--------------------------------------------------------------------------
  */

  const handleShopNameChange = (e) => {
    const value = e.target.value;

    setForm((prev) => ({
      ...prev,
      shopName: value,
      shopSlug: generateSlug(value),
    }));

    setErrors((prev) => ({
      ...prev,
      shopName: "",
      shopSlug: "",
    }));

    setServerError("");
    setSuccessMessage("");
  };

  /*
  |--------------------------------------------------------------------------
  | VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    const nextErrors = {};

    const shopName =
      form.shopName.trim();

    const shopSlug =
      form.shopSlug.trim();

    const ownerName =
      form.ownerName.trim();

    const street =
      form.street.trim();

    const city =
      form.city.trim();

    const state =
      form.state.trim();

    const postcode =
      form.postcode.trim();

    /*
    |--------------------------------------------------------------------------
    | SHOP NAME
    |--------------------------------------------------------------------------
    */

    if (!shopName) {
      nextErrors.shopName =
        "Shop name is required.";
    } else if (shopName.length < 2) {
      nextErrors.shopName =
        "Shop name must be at least 2 characters.";
    }

    /*
    |--------------------------------------------------------------------------
    | SHOP SLUG
    |--------------------------------------------------------------------------
    */

    if (!shopSlug) {
      nextErrors.shopSlug =
        "Shop slug is required.";
    } else if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(
        shopSlug
      )
    ) {
      nextErrors.shopSlug =
        "Use lowercase letters, numbers and hyphens only.";
    }

    /*
    |--------------------------------------------------------------------------
    | WEBSITE
    |--------------------------------------------------------------------------
    */

    if (form.website.trim()) {
      try {
        new URL(form.website.trim());
      } catch {
        nextErrors.website =
          "Enter a valid website URL.";
      }
    }

    /*
    |--------------------------------------------------------------------------
    | SUPPORT EMAIL
    |--------------------------------------------------------------------------
    */

    if (form.supportEmail.trim()) {
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.supportEmail.trim()
        )
      ) {
        nextErrors.supportEmail =
          "Enter a valid support email.";
      }
    }

    /*
    |--------------------------------------------------------------------------
    | OWNER
    |--------------------------------------------------------------------------
    */

    if (!ownerName) {
      nextErrors.ownerName =
        "Owner name is required.";
    }

    /*
    |--------------------------------------------------------------------------
    | GST
    |--------------------------------------------------------------------------
    */

    if (
      form.gstNumber &&
      form.gstNumber.length !== 15
    ) {
      nextErrors.gstNumber =
        "GST number must contain 15 characters.";
    }

    /*
    |--------------------------------------------------------------------------
    | PAN
    |--------------------------------------------------------------------------
    */

    if (
      form.panNumber &&
      form.panNumber.length !== 10
    ) {
      nextErrors.panNumber =
        "PAN number must contain 10 characters.";
    }

    /*
    |--------------------------------------------------------------------------
    | ADDRESS
    |--------------------------------------------------------------------------
    */

    if (!street) {
      nextErrors.street =
        "Street address is required.";
    }

    if (!city) {
      nextErrors.city =
        "City is required.";
    }

    if (!state) {
      nextErrors.state =
        "State is required.";
    }

    if (!postcode) {
      nextErrors.postcode =
        "Postcode is required.";
    } else if (
      !/^[0-9A-Za-z -]{4,10}$/.test(
        postcode
      )
    ) {
      nextErrors.postcode =
        "Enter a valid postcode.";
    }

    /*
    |--------------------------------------------------------------------------
    | COUNTRY
    |--------------------------------------------------------------------------
    */

    if (!form.country.trim()) {
      nextErrors.country =
        "Country is required.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  const completeProfile = async (e) => {
    e.preventDefault();

    setServerError("");
    setSuccessMessage("");

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    try {
      setLoading(true);

      const response = await api.put(
        "/seller/complete-profile",
        {
          store: {
            shopName:
              form.shopName.trim(),

            shopSlug:
              form.shopSlug.trim(),

            description:
              form.description.trim(),

            website:
              form.website.trim(),

            supportEmail:
              form.supportEmail
                .trim()
                .toLowerCase(),

            supportPhone:
              form.supportPhone.trim(),

            address: {
              street:
                form.street.trim(),

              city:
                form.city.trim(),

              state:
                form.state.trim(),

              postcode:
                form.postcode.trim(),

              country:
                form.country.trim(),
            },
          },

          business: {
            ownerName:
              form.ownerName.trim(),

            businessType:
              form.businessType,

            gstNumber:
              form.gstNumber.trim(),

            panNumber:
              form.panNumber.trim(),

            registrationNumber:
              form.registrationNumber.trim(),
          },
        }
      );

      setSuccessMessage(
        response.data?.message ||
          "Seller profile completed successfully."
      );

      setTimeout(() => {
        navigate(
          "/seller/upload-documents"
        );
      }, 700);
    } catch (error) {
      console.error(
        "Complete seller profile error:",
        error
      );

      setServerError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to complete your seller profile. Please try again."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | INPUT CLASS
  |--------------------------------------------------------------------------
  */

  const inputClass = (field) =>
    `
      h-12
      w-full
      rounded-xl
      border
      bg-zinc-50
      px-4
      text-sm
      text-zinc-900
      outline-none
      transition

      placeholder:text-zinc-400

      hover:border-zinc-300

      focus:bg-white
      focus:ring-4

      disabled:cursor-not-allowed
      disabled:opacity-60

      ${
        errors[field]
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
    `;

  /*
  |--------------------------------------------------------------------------
  | FIELD ERROR
  |--------------------------------------------------------------------------
  */

  const FieldError = ({ field }) => {
    if (!errors[field]) {
      return null;
    }

    return (
      <p
        id={`${field}-error`}
        role="alert"
        className="
          mt-1.5
          flex
          items-start
          gap-1.5
          text-xs
          font-medium
          leading-5
          text-red-600
        "
      >
        <span
          className="
            mt-0.5
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
          "
        >
          !
        </span>

        <span>
          {errors[field]}
        </span>
      </p>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | COMPLETION
  |--------------------------------------------------------------------------
  */

  const completion = useMemo(() => {
    const fields = [
      form.shopName,
      form.shopSlug,
      form.ownerName,
      form.street,
      form.city,
      form.state,
      form.postcode,
      form.country,
    ];

    const completed =
      fields.filter(
        (value) => value.trim()
      ).length;

    return Math.round(
      (completed / fields.length) * 100
    );
  }, [form]);

  /*
  |--------------------------------------------------------------------------
  | RENDER
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

          {/* SAVE LATER / DASHBOARD */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/seller/dashboard"
              )
            }
            disabled={loading}
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

              disabled:cursor-not-allowed
              disabled:opacity-50

              sm:px-5
              sm:py-2.5
              sm:text-sm
            "
          >
            Seller Dashboard
          </button>

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
          data-aos="fade-up"
          className="
            grid
            gap-5
            overflow-hidden
            lg:grid-cols-[minmax(0,1fr)_500px]
            lg:items-stretch
          "
        >

          {/* =====================================================
              LEFT HERO
          ===================================================== */}

          <section
            className="
              relative
              hidden
              min-h-[850px]
              overflow-hidden
              rounded-[32px]
              bg-black
              lg:block
            "
          >

            {/* IMAGE */}

            <img
              src={SELLER_IMAGE}
              alt="Seller completing business profile"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
              "
            />

            {/* OVERLAY */}

            <div
              className="
                absolute
                inset-0
                bg-black/60
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-gradient-to-t
                from-black/95
                via-black/45
                to-black/10
              "
            />

            {/* DECORATION */}

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
                min-h-[850px]
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

                {/* SECURE */}

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
                  <ShieldCheck
                    size={13}
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

                  Seller onboarding
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
                  Build your
                  <br />
                  seller profile.
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
                  Add your store, business and
                  address details. This information
                  helps us create a professional
                  storefront for your customers.
                </p>

              </div>

              {/* PROGRESS */}

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

                <div
                  className="
                    flex
                    items-center
                    justify-between
                  "
                >
                  <p
                    className="
                      text-xs
                      font-semibold
                      text-white/70
                    "
                  >
                    Profile completion
                  </p>

                  <p
                    className="
                      text-sm
                      font-bold
                      text-white
                    "
                  >
                    {completion}%
                  </p>
                </div>

                {/* PROGRESS BAR */}

                <div
                  className="
                    mt-3
                    h-2
                    overflow-hidden
                    rounded-full
                    bg-white/10
                  "
                >
                  <div
                    className="
                      h-full
                      rounded-full
                      bg-white
                      transition-all
                      duration-500
                    "
                    style={{
                      width: `${completion}%`,
                    }}
                  />
                </div>

                {/* STEPS */}

                <div className="mt-6 space-y-4">

                  {[
                    [
                      "01",
                      "Account",
                      true,
                    ],
                    [
                      "02",
                      "Store profile",
                      true,
                    ],
                    [
                      "03",
                      "Documents",
                      false,
                    ],
                    [
                      "04",
                      "Approval",
                      false,
                    ],
                  ].map(
                    ([
                      number,
                      title,
                      active,
                    ]) => (
                      <div
                        key={number}
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        <div
                          className={`
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-full
                            text-xs
                            font-bold

                            ${
                              active
                                ? "bg-white text-black"
                                : "bg-white/10 text-white/40"
                            }
                          `}
                        >
                          {active
                            ? "✓"
                            : number}
                        </div>

                        <p
                          className={`
                            text-xs
                            font-semibold

                            ${
                              active
                                ? "text-white"
                                : "text-white/40"
                            }
                          `}
                        >
                          {title}
                        </p>

                      </div>
                    )
                  )}

                </div>

              </div>

            </div>
          </section>

          {/* =====================================================
              RIGHT FORM
          ===================================================== */}

          <section
            className="
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
              lg:py-10
            "
          >

            <div className="mx-auto w-full max-w-md">

              {/* MOBILE BRAND */}

              <div
                data-aos="fade-down"
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
                    Odikart Seller
                  </p>

                  <p
                    className="
                      text-xs
                      text-zinc-400
                    "
                  >
                    Complete your profile
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

                  Seller onboarding
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
                  Complete your profile
                </h2>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-zinc-500
                  "
                >
                  Add your store and business
                  details so customers know who
                  they're buying from.
                </p>

              </div>

              {/* SERVER ERROR */}

              {serverError && (
                <div
                  data-aos="fade-down"
                  role="alert"
                  aria-live="assertive"
                  className="
                    mt-6
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
                        text-red-600
                      "
                    >
                      !
                    </div>

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <p
                        className="
                          text-sm
                          font-bold
                          text-red-800
                        "
                      >
                        Unable to save profile
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-red-600
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
                        rounded-lg
                        p-1
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

              {successMessage && (
                <div
                  data-aos="fade-down"
                  role="status"
                  aria-live="polite"
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
                      <CheckCircle2
                        size={17}
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
                        Profile saved
                      </p>

                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-zinc-600
                        "
                      >
                        {successMessage}
                      </p>
                    </div>

                  </div>

                </div>
              )}

              {/* =====================================================
                  FORM
              ===================================================== */}

              <form
                onSubmit={completeProfile}
                noValidate
                className="mt-8 space-y-8"
              >

                {/* =================================================
                    STORE INFORMATION
                ================================================= */}

                <section
                  data-aos="fade-up"
                  data-aos-delay="80"
                >

                  <div
                    className="
                      mb-5
                      flex
                      items-start
                      gap-3
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
                        bg-zinc-100
                        text-black
                      "
                    >
                      <Store size={19} />
                    </div>

                    <div>
                      <h3
                        className="
                          text-base
                          font-bold
                          text-black
                        "
                      >
                        Store information
                      </h3>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-zinc-400
                        "
                      >
                        This information will be
                        visible to your customers.
                      </p>
                    </div>

                  </div>

                  <div className="space-y-5">

                    {/* SHOP NAME */}

                    <div>

                      <label
                        htmlFor="shopName"
                        className="
                          mb-2
                          block
                          text-xs
                          font-bold
                          text-zinc-700
                        "
                      >
                        Shop Name
                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        id="shopName"
                        name="shopName"
                        placeholder="My Store"
                        value={form.shopName}
                        onChange={
                          handleShopNameChange
                        }
                        required
                        aria-invalid={Boolean(
                          errors.shopName
                        )}
                        aria-describedby={
                          errors.shopName
                            ? "shopName-error"
                            : undefined
                        }
                        className={inputClass(
                          "shopName"
                        )}
                      />

                      <FieldError field="shopName" />

                    </div>

                    {/* SLUG */}

                    <div>

                      <label
                        htmlFor="shopSlug"
                        className="
                          mb-2
                          block
                          text-xs
                          font-bold
                          text-zinc-700
                        "
                      >
                        Shop Slug

                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <div className="relative">

                        <span
                          className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-xs
                            font-medium
                            text-zinc-400
                          "
                        >
                          /
                        </span>

                        <input
                          id="shopSlug"
                          name="shopSlug"
                          placeholder="my-store"
                          value={form.shopSlug}
                          onChange={handleChange}
                          required
                          aria-invalid={Boolean(
                            errors.shopSlug
                          )}
                          className={`
                            ${inputClass(
                              "shopSlug"
                            )}
                            pl-8
                          `}
                        />

                      </div>

                      <p
                        className="
                          mt-1.5
                          text-[11px]
                          text-zinc-400
                        "
                      >
                        This will be used as your
                        store URL.
                      </p>

                      <FieldError field="shopSlug" />

                    </div>

                    {/* DESCRIPTION */}

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
                          htmlFor="description"
                          className="
                            text-xs
                            font-bold
                            text-zinc-700
                          "
                        >
                          Store Description
                        </label>

                        <span
                          className="
                            text-[11px]
                            text-zinc-400
                          "
                        >
                          {form.description.length}
                          /500
                        </span>

                      </div>

                      <textarea
                        id="description"
                        name="description"
                        placeholder="Tell customers what your store sells..."
                        value={form.description}
                        onChange={handleChange}
                        maxLength={500}
                        rows={4}
                        className="
                          w-full
                          resize-none
                          rounded-xl
                          border
                          border-zinc-200
                          bg-zinc-50
                          px-4
                          py-3
                          text-sm
                          text-zinc-900
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

                    {/* WEBSITE */}

                    <div>

                      <label
                        htmlFor="website"
                        className="
                          mb-2
                          block
                          text-xs
                          font-bold
                          text-zinc-700
                        "
                      >
                        Website

                        <span
                          className="
                            ml-2
                            font-normal
                            text-zinc-400
                          "
                        >
                          Optional
                        </span>
                      </label>

                      <div className="relative">

                        <Globe2
                          size={16}
                          className="
                            absolute
                            left-4
                            top-1/2
                            -translate-y-1/2
                            text-zinc-400
                          "
                        />

                        <input
                          id="website"
                          type="url"
                          name="website"
                          placeholder="https://example.com"
                          value={form.website}
                          onChange={handleChange}
                          aria-invalid={Boolean(
                            errors.website
                          )}
                          className={`
                            ${inputClass(
                              "website"
                            )}
                            pl-11
                          `}
                        />

                      </div>

                      <FieldError field="website" />

                    </div>

                    {/* SUPPORT */}

                    <div
                      className="
                        grid
                        gap-5
                        sm:grid-cols-2
                      "
                    >

                      {/* EMAIL */}

                      <div>

                        <label
                          htmlFor="supportEmail"
                          className="
                            mb-2
                            block
                            text-xs
                            font-bold
                            text-zinc-700
                          "
                        >
                          Support Email
                        </label>

                        <div className="relative">

                          <Mail
                            size={16}
                            className="
                              absolute
                              left-4
                              top-1/2
                              -translate-y-1/2
                              text-zinc-400
                            "
                          />

                          <input
                            id="supportEmail"
                            type="email"
                            name="supportEmail"
                            placeholder="support@example.com"
                            value={
                              form.supportEmail
                            }
                            onChange={
                              handleChange
                            }
                            aria-invalid={Boolean(
                              errors.supportEmail
                            )}
                            className={`
                              ${inputClass(
                                "supportEmail"
                              )}
                              pl-11
                            `}
                          />

                        </div>

                        <FieldError field="supportEmail" />

                      </div>

                      {/* PHONE */}

                      <div>

                        <label
                          htmlFor="supportPhone"
                          className="
                            mb-2
                            block
                            text-xs
                            font-bold
                            text-zinc-700
                          "
                        >
                          Support Phone
                        </label>

                        <div className="relative">

                          <Phone
                            size={16}
                            className="
                              absolute
                              left-4
                              top-1/2
                              -translate-y-1/2
                              text-zinc-400
                            "
                          />

                          <input
                            id="supportPhone"
                            type="tel"
                            name="supportPhone"
                            placeholder="+91 98765 43210"
                            value={
                              form.supportPhone
                            }
                            onChange={
                              handleChange
                            }
                            className={`
                              ${inputClass(
                                "supportPhone"
                              )}
                              pl-11
                            `}
                          />

                        </div>

                      </div>

                    </div>

                  </div>

                </section>

                {/* DIVIDER */}

                <div className="h-px bg-zinc-100" />

                {/* =================================================
                    BUSINESS
                ================================================= */}

                <section
                  data-aos="fade-up"
                  data-aos-delay="120"
                >

                  <div
                    className="
                      mb-5
                      flex
                      items-start
                      gap-3
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
                        bg-zinc-100
                        text-black
                      "
                    >
                      <Building2 size={19} />
                    </div>

                    <div>
                      <h3
                        className="
                          text-base
                          font-bold
                          text-black
                        "
                      >
                        Business information
                      </h3>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-zinc-400
                        "
                      >
                        Provide your business and
                        ownership details.
                      </p>
                    </div>

                  </div>

                  <div className="space-y-5">

                    {/* OWNER */}

                    <div>

                      <label
                        htmlFor="ownerName"
                        className="
                          mb-2
                          block
                          text-xs
                          font-bold
                          text-zinc-700
                        "
                      >
                        Owner Name

                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        id="ownerName"
                        name="ownerName"
                        placeholder="Business owner name"
                        value={form.ownerName}
                        onChange={handleChange}
                        required
                        aria-invalid={Boolean(
                          errors.ownerName
                        )}
                        className={inputClass(
                          "ownerName"
                        )}
                      />

                      <FieldError field="ownerName" />

                    </div>

                    {/* BUSINESS TYPE */}

                    <div>

                      <label
                        htmlFor="businessType"
                        className="
                          mb-2
                          block
                          text-xs
                          font-bold
                          text-zinc-700
                        "
                      >
                        Business Type
                      </label>

                      <select
                        id="businessType"
                        name="businessType"
                        value={
                          form.businessType
                        }
                        onChange={handleChange}
                        className={inputClass(
                          "businessType"
                        )}
                      >

                        <option value="Individual">
                          Individual
                        </option>

                        <option value="Proprietorship">
                          Proprietorship
                        </option>

                        <option value="Partnership">
                          Partnership
                        </option>

                        <option value="LLP">
                          LLP
                        </option>

                        <option value="Private Limited">
                          Private Limited
                        </option>

                      </select>

                    </div>

                    {/* GST + PAN */}

                    <div
                      className="
                        grid
                        gap-5
                        sm:grid-cols-2
                      "
                    >

                      {/* GST */}

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
                            htmlFor="gstNumber"
                            className="
                              text-xs
                              font-bold
                              text-zinc-700
                            "
                          >
                            GST Number
                          </label>

                          <span
                            className="
                              text-[10px]
                              text-zinc-400
                            "
                          >
                            {form.gstNumber.length}
                            /15
                          </span>

                        </div>

                        <input
                          id="gstNumber"
                          name="gstNumber"
                          placeholder="22AAAAA0000A1Z5"
                          value={form.gstNumber}
                          onChange={handleChange}
                          maxLength={15}
                          className={inputClass(
                            "gstNumber"
                          )}
                        />

                        <FieldError field="gstNumber" />

                      </div>

                      {/* PAN */}

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
                            htmlFor="panNumber"
                            className="
                              text-xs
                              font-bold
                              text-zinc-700
                            "
                          >
                            PAN Number
                          </label>

                          <span
                            className="
                              text-[10px]
                              text-zinc-400
                            "
                          >
                            {form.panNumber.length}
                            /10
                          </span>

                        </div>

                        <input
                          id="panNumber"
                          name="panNumber"
                          placeholder="ABCDE1234F"
                          value={form.panNumber}
                          onChange={handleChange}
                          maxLength={10}
                          className={inputClass(
                            "panNumber"
                          )}
                        />

                        <FieldError field="panNumber" />

                      </div>

                    </div>

                    {/* REGISTRATION */}

                    <div>

                      <label
                        htmlFor="registrationNumber"
                        className="
                          mb-2
                          block
                          text-xs
                          font-bold
                          text-zinc-700
                        "
                      >
                        Registration Number

                        <span
                          className="
                            ml-2
                            font-normal
                            text-zinc-400
                          "
                        >
                          Optional
                        </span>
                      </label>

                      <input
                        id="registrationNumber"
                        name="registrationNumber"
                        placeholder="Business registration number"
                        value={
                          form.registrationNumber
                        }
                        onChange={handleChange}
                        className={inputClass(
                          "registrationNumber"
                        )}
                      />

                    </div>

                  </div>

                </section>

                {/* DIVIDER */}

                <div className="h-px bg-zinc-100" />

                {/* =================================================
                    ADDRESS
                ================================================= */}

                <section
                  data-aos="fade-up"
                  data-aos-delay="160"
                >

                  <div
                    className="
                      mb-5
                      flex
                      items-start
                      gap-3
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
                        bg-zinc-100
                        text-black
                      "
                    >
                      <MapPin size={19} />
                    </div>

                    <div>
                      <h3
                        className="
                          text-base
                          font-bold
                          text-black
                        "
                      >
                        Store address
                      </h3>

                      <p
                        className="
                          mt-1
                          text-xs
                          text-zinc-400
                        "
                      >
                        Where your business is
                        located.
                      </p>
                    </div>

                  </div>

                  <div className="space-y-5">

                    {/* STREET */}

                    <div>

                      <label
                        htmlFor="street"
                        className="
                          mb-2
                          block
                          text-xs
                          font-bold
                          text-zinc-700
                        "
                      >
                        Street Address

                        <span className="ml-1 text-red-500">
                          *
                        </span>
                      </label>

                      <input
                        id="street"
                        name="street"
                        placeholder="Street address"
                        value={form.street}
                        onChange={handleChange}
                        required
                        aria-invalid={Boolean(
                          errors.street
                        )}
                        className={inputClass(
                          "street"
                        )}
                      />

                      <FieldError field="street" />

                    </div>

                    {/* CITY + STATE */}

                    <div
                      className="
                        grid
                        gap-5
                        sm:grid-cols-2
                      "
                    >

                      <div>

                        <label
                          htmlFor="city"
                          className="
                            mb-2
                            block
                            text-xs
                            font-bold
                            text-zinc-700
                          "
                        >
                          City

                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <input
                          id="city"
                          name="city"
                          placeholder="Hyderabad"
                          value={form.city}
                          onChange={handleChange}
                          required
                          aria-invalid={Boolean(
                            errors.city
                          )}
                          className={inputClass(
                            "city"
                          )}
                        />

                        <FieldError field="city" />

                      </div>

                      <div>

                        <label
                          htmlFor="state"
                          className="
                            mb-2
                            block
                            text-xs
                            font-bold
                            text-zinc-700
                          "
                        >
                          State

                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <input
                          id="state"
                          name="state"
                          placeholder="Telangana"
                          value={form.state}
                          onChange={handleChange}
                          required
                          aria-invalid={Boolean(
                            errors.state
                          )}
                          className={inputClass(
                            "state"
                          )}
                        />

                        <FieldError field="state" />

                      </div>

                    </div>

                    {/* POSTCODE + COUNTRY */}

                    <div
                      className="
                        grid
                        gap-5
                        sm:grid-cols-2
                      "
                    >

                      <div>

                        <label
                          htmlFor="postcode"
                          className="
                            mb-2
                            block
                            text-xs
                            font-bold
                            text-zinc-700
                          "
                        >
                          Postcode

                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <input
                          id="postcode"
                          name="postcode"
                          placeholder="500016"
                          value={form.postcode}
                          onChange={handleChange}
                          required
                          aria-invalid={Boolean(
                            errors.postcode
                          )}
                          className={inputClass(
                            "postcode"
                          )}
                        />

                        <FieldError field="postcode" />

                      </div>

                      <div>

                        <label
                          htmlFor="country"
                          className="
                            mb-2
                            block
                            text-xs
                            font-bold
                            text-zinc-700
                          "
                        >
                          Country

                          <span className="ml-1 text-red-500">
                            *
                          </span>
                        </label>

                        <input
                          id="country"
                          name="country"
                          value={form.country}
                          onChange={handleChange}
                          required
                          aria-invalid={Boolean(
                            errors.country
                          )}
                          className={inputClass(
                            "country"
                          )}
                        />

                        <FieldError field="country" />

                      </div>

                    </div>

                  </div>

                </section>

                {/* =================================================
                    NOTICE
                ================================================= */}

                <div
                  data-aos="fade-up"
                  className="
                    flex
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
                      bg-white
                      text-black
                      shadow-sm
                    "
                  >
                    <Info size={17} />
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

                    <p
                      className="
                        mt-1
                        text-xs
                        leading-5
                        text-zinc-500
                      "
                    >
                      After saving your profile,
                      you'll upload your business
                      documents for verification.
                    </p>

                  </div>

                </div>

                {/* =================================================
                    SUBMIT
                ================================================= */}

                <div
                  data-aos="fade-up"
                  className="
                    flex
                    flex-col
                    gap-3
                    pt-2
                    sm:flex-row-reverse
                  "
                >

                  {/* SAVE & CONTINUE */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      group
                      relative
                      flex
                      min-h-12
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      overflow-hidden
                      rounded-xl
                      bg-black
                      px-5
                      py-3.5
                      text-sm
                      font-bold
                      text-white
                      shadow-lg
                      shadow-black/10
                      transition
                      duration-300

                      hover:bg-zinc-800
                      hover:shadow-black/20

                      focus:outline-none
                      focus:ring-4
                      focus:ring-black/10

                      disabled:cursor-not-allowed
                      disabled:opacity-60
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
                            h-5
                            w-5
                            animate-spin
                            rounded-full
                            border-2
                            border-white/30
                            border-t-white
                          "
                        />

                        Saving Profile...
                      </>
                    ) : (
                      <>
                        Save & Continue

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

                  {/* SAVE LATER */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/seller/dashboard"
                      )
                    }
                    disabled={loading}
                    className="
                      min-h-12
                      rounded-xl
                      border
                      border-zinc-200
                      px-5
                      py-3
                      text-sm
                      font-bold
                      text-zinc-600
                      transition

                      hover:border-zinc-300
                      hover:bg-zinc-50

                      disabled:cursor-not-allowed
                      disabled:opacity-50

                      sm:flex-none
                    "
                  >
                    Save Later
                  </button>

                </div>

                {/* FOOTER */}

                <div
                  data-aos="fade-up"
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    border-t
                    border-zinc-100
                    pt-5
                    text-center
                    text-[10px]
                    leading-5
                    text-zinc-400
                  "
                >
                  <ShieldCheck size={13} />

                  Your store information is securely
                  saved and can be updated later.
                </div>

              </form>

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default CompleteSellerProfile;