import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  Store,
  Package,
  BarChart3,
  ShieldCheck,
  X,
  Smartphone,
} from "lucide-react";

import AOS from "aos";
import "aos/dist/aos.css";

import api from "../../services/api";


/* =========================================================
   ODIKART LOGO
========================================================= */

const ODIKART_LOGO =
  "https://odikart.in/web-app-manifest-192x192.png";


function Login() {

  const navigate = useNavigate();


  /* =========================================================
     FORM
  ========================================================= */

  const [form, setForm] = useState({
    email: "",
    password: "",
    otp: "",
  });


  /* =========================================================
     LOGIN METHOD
  ========================================================= */

  const [loginMethod, setLoginMethod] =
    useState("password");

  const [otpSent, setOtpSent] =
    useState(false);


  /* =========================================================
     UI
  ========================================================= */

  const [errors, setErrors] =
    useState({});

  const [serverError, setServerError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [otpLoading, setOtpLoading] =
    useState(false);

  const [showPassword, setShowPassword] =
    useState(false);


  /* =========================================================
     AOS
  ========================================================= */

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


  /* =========================================================
     AUTO CLEAR SERVER ERROR
  ========================================================= */

  useEffect(() => {

    if (!serverError) {
      return;
    }

    const timer = setTimeout(() => {
      setServerError("");
    }, 6000);

    return () => {
      clearTimeout(timer);
    };

  }, [serverError]);


  /* =========================================================
     INPUT CHANGE
  ========================================================= */

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

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


  /* =========================================================
     CHANGE LOGIN METHOD
  ========================================================= */

  const changeLoginMethod = (method) => {

    setLoginMethod(method);

    setServerError("");

    setErrors({});

    setOtpSent(false);

    setForm((prev) => ({
      ...prev,
      password: "",
      otp: "",
    }));

  };


  /* =========================================================
     VALIDATE EMAIL
  ========================================================= */

  const validateEmail = () => {

    const email =
      form.email
        .trim()
        .toLowerCase();

    if (!email) {

      setErrors({
        email:
          "Email address is required.",
      });

      return false;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {

      setErrors({
        email:
          "Please enter a valid email address.",
      });

      return false;
    }

    return true;
  };


  /* =========================================================
     VALIDATE PASSWORD
  ========================================================= */

  const validatePassword = () => {

    const nextErrors = {};

    const email =
      form.email
        .trim()
        .toLowerCase();

    const password =
      form.password;

    if (!email) {

      nextErrors.email =
        "Email address is required.";

    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {

      nextErrors.email =
        "Please enter a valid email address.";

    }

    if (!password) {

      nextErrors.password =
        "Password is required.";

    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };


/* =========================================================
   SELLER LOGIN SUCCESS

   FLOW:

   seller role?
      ↓
   seller approved?
      ↓
   KYC approved?
      ├── YES → /seller/dashboard
      └── NO  → /seller/upload-documents

   Storage:
   token
   user
========================================================= */

const handleSellerLoginSuccess = (
  token,
  user
) => {

  console.log(
    "======================================="
  );

  console.log(
    "========== SELLER LOGIN CHECK =========="
  );

  console.log(
    "TOKEN RECEIVED:",
    Boolean(token)
  );

  console.log(
    "TOKEN LENGTH:",
    token?.length || 0
  );

  console.log(
    "USER:",
    user
  );

  console.log(
    "======================================="
  );


  /* =====================================================
     TOKEN CHECK
  ===================================================== */

  if (!token) {

    setServerError(
      "Authentication token was not received."
    );

    return false;
  }


  /* =====================================================
     USER CHECK
  ===================================================== */

  if (!user) {

    setServerError(
      "Unable to retrieve your account information."
    );

    return false;
  }


  /* =====================================================
     ACCOUNT STATUS
  ===================================================== */

  if (user.isBlocked) {

    setServerError(
      "Your account has been blocked. Please contact support."
    );

    return false;
  }


  if (user.isDeleted) {

    setServerError(
      "This account is no longer available."
    );

    return false;
  }


  /* =====================================================
     ROLE
  ===================================================== */

  const role =
    user.role || "user";


  /* =====================================================
     SELLER STATUS
  ===================================================== */

  const sellerStatus =
    user.sellerStatus || "none";


  /* =====================================================
     KYC STATUS

     Preferred API field:
       sellerVerificationStatus

     Backward-compatible fallback:
       sellerInfo.verification.status

  ===================================================== */

  const sellerVerificationStatus =
    user.sellerVerificationStatus ||
    user.sellerInfo?.verification?.status ||
    "pending";


  /* =====================================================
     DEBUG
  ===================================================== */

  console.log(
    "========== SELLER ACCESS =========="
  );

  console.log(
    "Role:",
    role
  );

  console.log(
    "Seller Status:",
    sellerStatus
  );

  console.log(
    "KYC Status:",
    sellerVerificationStatus
  );

  console.log(
    "==================================="
  );


  /* =====================================================
     ROLE CHECK
  ===================================================== */

  if (role !== "seller") {

    if (
      sellerStatus === "pending"
    ) {

      setServerError(
        "Your seller application is waiting for admin approval."
      );

    } else if (
      sellerStatus === "rejected"
    ) {

      setServerError(
        "Your seller application was rejected. Please contact support."
      );

    } else {

      setServerError(
        "This account is currently a customer account. Please apply to become a seller first."
      );

    }

    return false;
  }


  /* =====================================================
     SELLER APPROVAL CHECK
  ===================================================== */

 if (
  sellerStatus !== "approved"
) {

  const statusMessages = {

    pending:
      "Your seller account is waiting for admin approval.",

    rejected:
      "Your seller application was rejected. Please contact support.",

    suspended:
      "Your seller account has been suspended. Please contact support.",

    blocked:
      "Your seller account has been blocked. Please contact support.",

    none:
      "This account is not registered as a seller.",

  };


  setServerError(
    statusMessages[sellerStatus] ||
    `Your seller account status is "${sellerStatus}".`
  );


  return false;
}

  /* =====================================================
     SAVE AUTH SESSION

     We save the session BEFORE redirecting to
     upload-documents because that page needs authentication.
  ===================================================== */

  const saveSellerSession = () => {

    /* -----------------------------------------------
       Remove old seller-specific storage
    ----------------------------------------------- */

    localStorage.removeItem(
      "sellerToken"
    );

    localStorage.removeItem(
      "sellerUser"
    );

    localStorage.removeItem(
      "sellerRole"
    );

    localStorage.removeItem(
      "sellerEmail"
    );

    localStorage.removeItem(
      "activeApplication"
    );


    /* -----------------------------------------------
       One token
    ----------------------------------------------- */

    localStorage.setItem(
      "token",
      token
    );


    /* -----------------------------------------------
       UI cache only
    ----------------------------------------------- */

    localStorage.setItem(
      "user",
      JSON.stringify(
        user
      )
    );


    console.log(
      "========== SELLER SESSION SAVED =========="
    );

    console.log(
      "Token:",
      Boolean(
        localStorage.getItem(
          "token"
        )
      )
    );

    console.log(
      "User:",
      JSON.parse(
        localStorage.getItem(
          "user"
        ) || "null"
      )
    );

    console.log(
      "=========================================="
    );

  };


  /* =====================================================
     KYC CHECK
  ===================================================== */

  if (
    sellerVerificationStatus !==
    "approved"
  ) {

    console.log(
      "⚠️ SELLER KYC IS NOT APPROVED"
    );

    console.log(
      "KYC Status:",
      sellerVerificationStatus
    );


    /*
    ======================================================
       KYC PENDING / NOT SUBMITTED
    ======================================================
    */

    if (
      sellerVerificationStatus ===
      "pending"
    ) {

      console.log(
        "📄 KYC pending/not completed"
      );

      saveSellerSession();

      setServerError("");


      console.log(
        "🚀 REDIRECT → /seller/upload-documents"
      );


      navigate(
        "/seller/upload-documents",
        {
          replace: true,
        }
      );


      return false;
    }


    /*
    ======================================================
       KYC REJECTED
    ======================================================
    */

    if (
      sellerVerificationStatus ===
      "rejected"
    ) {

      console.log(
        "❌ KYC rejected"
      );

      saveSellerSession();

      setServerError(
        "Your KYC verification was rejected. Please update your documents."
      );


      navigate(
        "/seller/upload-documents",
        {
          replace: true,
          state: {
            fromLogin: true,
            kycRejected: true,
          },
        }
      );


      return false;
    }


    /*
    ======================================================
       OTHER / MISSING STATUS
    ======================================================
    */

    console.log(
      "⚠️ Unknown/missing KYC status"
    );


    saveSellerSession();

    setServerError("");


    navigate(
      "/seller/upload-documents",
      {
        replace: true,
        state: {
          fromLogin: true,
          kycIncomplete: true,
        },
      }
    );


    return false;
  }


  /* =====================================================
     SELLER + KYC APPROVED
  ===================================================== */

  console.log(
    "======================================="
  );

  console.log(
    "✅ SELLER ACCOUNT APPROVED"
  );

  console.log(
    "✅ KYC VERIFIED"
  );

  console.log(
    "✅ SELLER LOGIN ALLOWED"
  );

  console.log(
    "======================================="
  );


  /* =====================================================
     SAVE SESSION
  ===================================================== */

  saveSellerSession();


  /* =====================================================
     CLEAR ERROR
  ===================================================== */

  setServerError("");


  /* =====================================================
     REDIRECT DASHBOARD
  ===================================================== */

  console.log(
    "🚀 REDIRECT → /seller/dashboard"
  );


  navigate(
    "/seller/dashboard",
    {
      replace: true,
    }
  );


  return true;
};

  /* =========================================================
     PASSWORD LOGIN
  ========================================================= */

  const loginWithPassword =
    async () => {

      if (
        !validatePassword()
      ) {
        return;
      }


      try {

        setLoading(true);

        setServerError("");


        const email =
          form.email
            .trim()
            .toLowerCase();


        /* ==================================================
           DEBUG REQUEST
        ================================================== */

        console.log(
          "========== PASSWORD LOGIN REQUEST =========="
        );

        console.log(
          "Email:",
          email
        );

        console.log(
          "App:",
          "seller"
        );

        console.log(
          "============================================"
        );


        /* ==================================================
           SELLER LOGIN
        ================================================== */

        const response =
          await api.post(
            "/auth/signin-password",
            {
              email,

              password:
                form.password,

              app:
                "seller",
            }
          );


        console.log(
          "🔐 Password login response:",
          response.data
        );


        const {
          token,
          user,
        } = response.data;


        /* ==================================================
           HANDLE LOGIN
        ================================================== */

        handleSellerLoginSuccess(
          token,
          user
        );

      } catch (error) {

        console.error(
          "❌ Seller password login error:",
          error
        );

        console.error(
          "Backend response:",
          error.response?.data
        );


        setServerError(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Login failed. Please check your email and password."
        );

      } finally {

        setLoading(false);

      }

    };


  /* =========================================================
     SEND LOGIN OTP
  ========================================================= */

  const sendLoginOTP =
    async () => {

      setServerError("");


      if (
        !validateEmail()
      ) {
        return;
      }


      try {

        setOtpLoading(true);


        const email =
          form.email
            .trim()
            .toLowerCase();


        console.log(
          "========== SEND SELLER OTP =========="
        );

        console.log(
          "Email:",
          email
        );

        console.log(
          "App:",
          "seller"
        );

        console.log(
          "======================================"
        );


        const response =
          await api.post(
            "/auth/signin-otp",
            {
              email,

              app:
                "seller",
            }
          );


        console.log(
          "📩 Send OTP response:",
          response.data
        );


        if (
          response.data?.success
        ) {

          setOtpSent(true);

          setServerError("");

          setForm((prev) => ({
            ...prev,
            otp: "",
          }));

        } else {

          setServerError(
            response.data?.message ||
            "Failed to send OTP."
          );

        }

      } catch (error) {

        console.error(
          "❌ Send seller OTP error:",
          error
        );

        console.error(
          "Backend:",
          error.response?.data
        );


        setServerError(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to send OTP."
        );

      } finally {

        setOtpLoading(false);

      }

    };


  /* =========================================================
     VERIFY LOGIN OTP
  ========================================================= */

  const verifyLoginOTP =
    async () => {

      setServerError("");


      const email =
        form.email
          .trim()
          .toLowerCase();


      const otp =
        form.otp.trim();


      if (!email) {

        setServerError(
          "Please enter your email address."
        );

        return;
      }


      if (!otp) {

        setServerError(
          "Please enter the OTP."
        );

        return;
      }


      if (
        !/^\d{6}$/.test(otp)
      ) {

        setServerError(
          "OTP must be exactly 6 digits."
        );

        return;
      }


      try {

        setLoading(true);


        console.log(
          "========== VERIFY SELLER OTP =========="
        );

        console.log(
          "Email:",
          email
        );

        console.log(
          "App:",
          "seller"
        );

        console.log(
          "========================================"
        );


        const response =
          await api.post(
            "/auth/verify-signin-otp",
            {
              email,

              otp,

              app:
                "seller",
            }
          );


        console.log(
          "🔐 Verify OTP response:",
          response.data
        );


        const {
          token,
          user,
        } = response.data;


        handleSellerLoginSuccess(
          token,
          user
        );

      } catch (error) {

        console.error(
          "❌ Seller OTP login error:",
          error
        );

        console.error(
          "Backend response:",
          error.response?.data
        );


        setServerError(
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Invalid or expired OTP."
        );

      } finally {

        setLoading(false);

      }

    };


  /* =========================================================
     FORM SUBMIT
  ========================================================= */

  const login = async (e) => {

    e.preventDefault();

    setServerError("");


    if (
      loginMethod === "password"
    ) {

      await loginWithPassword();

      return;
    }


    if (
      loginMethod === "otp"
    ) {

      if (!otpSent) {

        await sendLoginOTP();

        return;
      }


      await verifyLoginOTP();

    }

  };


  /* =========================================================
     INPUT CLASS
  ========================================================= */

  const inputClass = (
    field
  ) => `
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
          border-red-400
          bg-red-50/30
          focus:border-red-500
          focus:ring-red-500/10
        `
        : `
          border-zinc-200
        `
    }
  `;


  /* =========================================================
     INPUT ERROR
  ========================================================= */

  const InputError = ({
    field,
  }) => {

    if (!errors[field]) {
      return null;
    }


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


  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className="
        min-h-screen
        bg-[#f5f5f5]
        text-zinc-950
      "
    >

      {/* =====================================================
          HEADER
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

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
            className="
              group
              flex
              items-center
              gap-3
              rounded-2xl
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

          {/* ===================================================
              HERO
          =================================================== */}

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
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85"
              alt="Odikart Seller Portal"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
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

              <div className="flex items-center gap-3">

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

                  <p className="text-sm font-bold text-white">
                    Odikart Seller
                  </p>

                  <p className="text-xs text-white/60">
                    Seller Portal
                  </p>

                </div>

              </div>


              <div>

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

                </span>


                <h1
                  className="
                    mt-6
                    text-4xl
                    font-semibold
                    leading-[1.02]
                    tracking-[-0.045em]
                    text-white
                    sm:text-5xl
                  "
                >
                  Welcome
                  <br />
                  back, seller.
                </h1>


                <p
                  className="
                    mt-5
                    max-w-md
                    text-sm
                    leading-7
                    text-white/70
                  "
                >
                  Sign in to manage your products,
                  orders, customers and store from
                  one simple seller workspace.
                </p>


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
                      icon: BarChart3,
                      title: "Analytics",
                      text: "Track sales",
                    },
                    {
                      icon: Package,
                      title: "Products",
                      text: "Manage stock",
                    },
                    {
                      icon: Store,
                      title: "Store",
                      text: "Grow business",
                    },
                  ].map((item) => {

                    const Icon =
                      item.icon;

                    return (
                      <div
                        key={
                          item.title
                        }
                        className="
                          rounded-2xl
                          border
                          border-white/10
                          bg-black/35
                          p-4
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

                          <Icon
                            size={17}
                          />

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


          {/* ===================================================
              LOGIN PANEL
          =================================================== */}

          <section
            data-aos="fade-up"
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

            <div
              className="
                mx-auto
                w-full
                max-w-md
              "
            >

              {/* MOBILE BRAND */}

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

                  <p className="text-sm font-bold text-black">
                    Odikart Seller
                  </p>

                  <p className="text-xs text-zinc-400">
                    Seller Portal
                  </p>

                </div>

              </div>


              {/* TITLE */}

              <div>

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

                  Seller Login

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
                  Welcome back
                </h2>


                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-zinc-500
                  "
                >
                  Sign in with your Odikart account
                  to access your approved seller workspace.
                </p>

              </div>


              {/* =================================================
                  ERROR
              ================================================= */}

              {serverError && (

                <div
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
                        bg-red-500
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
                          text-red-900
                        "
                      >
                        Unable to sign in
                      </p>


                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-red-700
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
                        rounded-lg
                        text-red-400
                        hover:bg-red-100
                      "
                      aria-label="Dismiss error"
                    >

                      <X size={15} />

                    </button>

                  </div>

                </div>

              )}


              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={login}
                noValidate
                className="
                  mt-7
                  space-y-5
                "
              >

                {/* EMAIL */}

                <div>

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


                  <InputError
                    field="email"
                  />

                </div>


                {/* LOGIN METHOD */}

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-2
                    rounded-2xl
                    bg-zinc-100
                    p-1
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      changeLoginMethod(
                        "password"
                      )
                    }
                    className={`
                      rounded-xl
                      py-2.5
                      text-xs
                      font-semibold
                      transition
                      ${
                        loginMethod ===
                        "password"
                          ? "bg-white text-black shadow-sm"
                          : "text-zinc-500"
                      }
                    `}
                  >
                    Password
                  </button>


                  <button
                    type="button"
                    onClick={() =>
                      changeLoginMethod(
                        "otp"
                      )
                    }
                    className={`
                      rounded-xl
                      py-2.5
                      text-xs
                      font-semibold
                      transition
                      ${
                        loginMethod ===
                        "otp"
                          ? "bg-white text-black shadow-sm"
                          : "text-zinc-500"
                      }
                    `}
                  >
                    OTP
                  </button>

                </div>


                {/* =================================================
                    PASSWORD
                ================================================= */}

                {loginMethod === "password" && (

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
                          font-bold
                          text-zinc-700
                        "
                      >
                        Password
                      </label>


                      <Link
                        to="/forgot-password"
                        className="
                          text-xs
                          font-semibold
                          text-zinc-500
                          hover:text-black
                        "
                      >
                        Forgot password?
                      </Link>

                    </div>


                    <div className="relative">

                      <LockKeyhole
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
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        autoComplete="current-password"
                        required
                        className={`
                          pl-11
                          pr-12
                          ${inputClass(
                            "password"
                          )}
                        `}
                      />


                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (prev) =>
                              !prev
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
                          hover:bg-zinc-100
                          hover:text-black
                        "
                      >

                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}

                      </button>

                    </div>


                    <InputError
                      field="password"
                    />

                  </div>

                )}


                {/* =================================================
                    OTP
                ================================================= */}

                {loginMethod === "otp" && (

                  <div>

                    <label
                      htmlFor="otp"
                      className="
                        mb-2
                        block
                        text-xs
                        font-bold
                        text-zinc-700
                      "
                    >
                      Login OTP
                    </label>


                    {!otpSent ? (

                      <div
                        className="
                          space-y-3
                        "
                      >

                        <div
                          className="
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

                          <Smartphone
                            size={19}
                            className="
                              shrink-0
                              text-zinc-500
                            "
                          />

                          <div>

                            <p
                              className="
                                text-xs
                                font-semibold
                                text-zinc-800
                              "
                            >
                              Login with OTP
                            </p>

                            <p
                              className="
                                mt-1
                                text-[11px]
                                leading-5
                                text-zinc-500
                              "
                            >
                              We'll send a one-time
                              password to your registered
                              email address.
                            </p>

                          </div>

                        </div>


                        <button
                          type="button"
                          onClick={
                            sendLoginOTP
                          }
                          disabled={
                            otpLoading
                          }
                          className="
                            h-12
                            w-full
                            rounded-2xl
                            border
                            border-zinc-200
                            bg-zinc-50
                            text-sm
                            font-semibold
                            text-black
                            hover:border-black
                            hover:bg-white
                            disabled:opacity-50
                          "
                        >

                          {otpLoading
                            ? "Sending OTP..."
                            : "Send OTP"}

                        </button>

                      </div>

                    ) : (

                      <div
                        className="
                          space-y-4
                        "
                      >

                        <div
                          className="
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
                              items-center
                              gap-3
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
                                bg-black
                                text-white
                              "
                            >

                              <Mail
                                size={17}
                              />

                            </div>


                            <div>

                              <p
                                className="
                                  text-xs
                                  font-semibold
                                  text-black
                                "
                              >
                                OTP sent
                              </p>

                              <p
                                className="
                                  mt-1
                                  text-[11px]
                                  text-zinc-500
                                "
                              >
                                Check your registered
                                email for the OTP.
                              </p>

                            </div>

                          </div>

                        </div>


                        <input
                          id="otp"
                          type="text"
                          name="otp"
                          inputMode="numeric"
                          maxLength={6}
                          autoComplete="one-time-code"
                          placeholder="Enter 6-digit OTP"
                          value={form.otp}
                          onChange={(e) => {

                            const value =
                              e.target.value
                                .replace(
                                  /\D/g,
                                  ""
                                )
                                .slice(
                                  0,
                                  6
                                );

                            setForm(
                              (prev) => ({
                                ...prev,
                                otp: value,
                              })
                            );

                            setServerError("");

                          }}
                          className="
                            h-14
                            w-full
                            rounded-2xl
                            border
                            border-zinc-200
                            bg-zinc-50
                            px-4
                            text-center
                            text-xl
                            font-semibold
                            tracking-[0.5em]
                            text-black
                            outline-none
                            focus:border-black
                            focus:bg-white
                            focus:ring-4
                            focus:ring-black/5
                          "
                        />


                        <div
                          className="
                            flex
                            items-center
                            justify-between
                          "
                        >

                          <button
                            type="button"
                            onClick={() => {

                              setOtpSent(false);

                              setForm(
                                (prev) => ({
                                  ...prev,
                                  otp: "",
                                })
                              );

                              setServerError("");

                            }}
                            className="
                              text-xs
                              font-semibold
                              text-zinc-500
                              hover:text-black
                            "
                          >
                            Change email
                          </button>


                          <button
                            type="button"
                            onClick={
                              sendLoginOTP
                            }
                            disabled={
                              otpLoading
                            }
                            className="
                              text-xs
                              font-semibold
                              text-black
                              underline
                              underline-offset-4
                            "
                          >
                            {otpLoading
                              ? "Sending..."
                              : "Resend OTP"}
                          </button>

                        </div>

                      </div>

                    )}

                  </div>

                )}


                {/* =================================================
                    SECURITY INFORMATION
                   
                    IMPORTANT:
                    This is informational only.
                    It is NOT the verification check.
                ================================================= */}

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

                    <ShieldCheck
                      size={18}
                    />

                  </div>


                  <div>

                    <p
                      className="
                        text-xs
                        font-semibold
                        text-black
                      "
                    >
                      Secure seller access
                    </p>


                    <p
                      className="
                        mt-1
                        text-[11px]
                        leading-5
                        text-zinc-500
                      "
                    >
                      Only approved and KYC-verified
                      seller accounts can access the
                      Seller Portal.
                    </p>

                  </div>

                </div>


                {/* =================================================
                    LOGIN BUTTON
                ================================================= */}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    otpLoading
                  }
                  className="
                    group
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-2xl
                    bg-black
                    px-5
                    text-sm
                    font-semibold
                    text-white
                    shadow-lg
                    shadow-black/10
                    transition-all
                    hover:bg-zinc-800
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >

                  {loading ? (
                    "Signing in..."
                  ) : (
                    <>
                      {loginMethod === "otp" &&
                      !otpSent
                        ? "Send Login OTP"
                        : loginMethod === "otp"
                        ? "Verify OTP"
                        : "Sign in to Seller Portal"}

                      <ArrowRight
                        size={17}
                      />
                    </>
                  )}

                </button>


                {/* =================================================
                    REGISTER
                ================================================= */}

                <div
                  className="
                    text-center
                    text-xs
                    text-zinc-500
                  "
                >

                  Don't have an Odikart account?

                  {" "}

                  <Link
                    to="/register"
                    className="
                      font-semibold
                      text-black
                      hover:underline
                    "
                  >
                    Become a Seller
                  </Link>

                </div>


                {/* =================================================
                    CUSTOMER ACCOUNT INFO
                ================================================= */}

                <div
                  className="
                    rounded-2xl
                    border
                    border-zinc-200
                    bg-white
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

                    <Store
                      size={18}
                      className="
                        mt-0.5
                        shrink-0
                        text-zinc-500
                      "
                    />


                    <div>

                      <p
                        className="
                          text-xs
                          font-semibold
                          text-zinc-800
                        "
                      >
                        Already an Odikart customer?
                      </p>


                      <p
                        className="
                          mt-1
                          text-[11px]
                          leading-5
                          text-zinc-500
                        "
                      >
                        You don't need to create another
                        account. Apply for seller access
                        using your existing Odikart account.
                      </p>

                    </div>

                  </div>

                </div>

              </form>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}


export default Login;