import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
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
import { sendPhoneOTP, verifyPhoneOTP, resetRecaptcha } from "../../phoneAuth";

/*
|--------------------------------------------------------------------------
| ODikart Seller Portal
|--------------------------------------------------------------------------
*/

const ODIKART_LOGO =
  "https://seller.odikart.in/icon-512.png";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountChecked, setAccountChecked] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const [existingUser, setExistingUser] = useState(null);

  // Firebase phone OTP authentication state
  const [phoneOtpSent, setPhoneOtpSent] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Seller application state
  const [showSellerApplication, setShowSellerApplication] =
    useState(false);

  const [sellerForm, setSellerForm] = useState({
    shopName: "",
    description: "",
    website: "",
    supportEmail: "",
    supportPhone: "",
    businessType: "Individual",
    ownerName: "",
    registrationNumber: "",
  });

  const [sellerErrors, setSellerErrors] = useState({});

  /*
  |--------------------------------------------------------------------------
  | SELLER KYC DOCUMENTS
  |--------------------------------------------------------------------------
  */

  const [sellerDocuments, setSellerDocuments] = useState({
    aadhaarFront: null,
    aadhaarBack: null,
    panImage: null,
    bankProof: null,
  });

  const [documentErrors, setDocumentErrors] = useState({});

  const [uploadingDocuments, setUploadingDocuments] =
    useState(false);

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
  | SERVER ERROR AUTO CLEAR
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!serverError) return;

    const timer = setTimeout(() => {
      setServerError("");
    }, 5000);

    return () => clearTimeout(timer);
  }, [serverError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setServerError("");
  };

  const normalizePhone = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 10) return `+91${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    if (String(value || "").trim().startsWith("+")) return `+${digits}`;
    return `+${digits}`;
  };

  const validatePhoneForm = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = "First name is required.";
    if (!form.lastName.trim()) next.lastName = "Last name is required.";
    const rawPhone = form.phone.replace(/\D/g, "");
    if (!(rawPhone.length === 10 || (rawPhone.length === 12 && rawPhone.startsWith("91")))) {
      next.phone = "Enter a valid 10-digit Indian mobile number.";
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const sendPhoneVerification = async (e) => {
    e?.preventDefault?.();
    setServerError("");
    if (!validatePhoneForm()) return;
    try {
      setPhoneOtpLoading(true);
      const result = await sendPhoneOTP(normalizePhone(form.phone));
      setConfirmationResult(result);
      setPhoneOtpSent(true);
      setPhoneOtp("");
      setServerError("OTP sent to your mobile number.");
    } catch (error) {
      console.error("Firebase phone OTP send error:", error);
      setServerError(error?.message || "Unable to send OTP. Please try again.");
    } finally {
      setPhoneOtpLoading(false);
    }
  };


  const handleApplyAsSeller = () => {
    if (!existingUser) {
      setServerError("Verify your phone number to continue.");
      return;
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setServerError("Please verify your phone number first.");
      return;
    }
    const sellerStatus = existingUser.sellerStatus || "none";
    if (existingUser.role === "seller" && sellerStatus === "approved") {
      setServerError("This account is already an approved seller account.");
      return;
    }
    if (sellerStatus === "pending") {
      setServerError("Your seller application is already under review.");
      return;
    }
    if (sellerStatus === "suspended") {
      setServerError("Your seller account is suspended. Please contact support.");
      return;
    }
    const ownerName = `${existingUser.firstName || form.firstName || ""} ${existingUser.lastName || form.lastName || ""}`.trim();
    setSellerForm({
      shopName: existingUser.store?.shopName || "",
      description: existingUser.store?.description || "",
      website: existingUser.store?.website || "",
      supportEmail: existingUser.store?.supportEmail || existingUser.email || form.email || "",
      supportPhone: existingUser.store?.supportPhone || existingUser.phone || form.phone || "",
      businessType: existingUser.business?.businessType || "Individual",
      ownerName: existingUser.business?.ownerName || ownerName,
      registrationNumber: existingUser.business?.registrationNumber || "",
    });
    setSellerDocuments({ aadhaarFront: null, aadhaarBack: null, panImage: null, bankProof: null });
    setDocumentErrors({});
    setSellerErrors({});
    setServerError("");
    setShowSellerApplication(true);
  };


  const verifyPhoneAndContinue = async (e) => {
    e.preventDefault();
    const code = phoneOtp.replace(/\D/g, "").slice(0, 6);
    if (!confirmationResult || !/^\d{6}$/.test(code)) {
      setServerError("Enter the 6-digit OTP sent to your phone.");
      return;
    }
    try {
      setPhoneOtpLoading(true);
      setServerError("");
      const verified = await verifyPhoneOTP(confirmationResult, code);
      const firebaseToken = verified.firebaseToken;
      // Customer-mode Firebase login safely creates/links the account for seller application.
      let response;
      try {
        response = await api.post("/auth/firebase-phone-login", { app: "customer" }, {
          headers: { Authorization: `Bearer ${firebaseToken}` },
        });
      } catch (customerLoginError) {
        // If the phone belongs to an approved seller, attempt seller-mode login.
        response = await api.post("/auth/firebase-phone-login", { app: "seller" }, {
          headers: { Authorization: `Bearer ${firebaseToken}` },
        });
      }
      const data = response.data;
      if (!data?.success || !data?.token) throw new Error(data?.message || "Phone login failed.");
      localStorage.setItem("token", data.token);
      const authUser = data.user || {};
      const mergedUser = {
        ...authUser,
        firstName: authUser.firstName || form.firstName.trim(),
        lastName: authUser.lastName || form.lastName.trim(),
        email: authUser.email || form.email.trim().toLowerCase(),
        phone: authUser.phone || normalizePhone(form.phone),
      };
      setExistingUser(mergedUser);
      setAccountExists(true);
      setAccountChecked(true);
      setPhoneOtpSent(false);
      setPhoneOtp("");
      setConfirmationResult(null);
      setForm((prev) => ({ ...prev, phone: mergedUser.phone, firstName: mergedUser.firstName, lastName: mergedUser.lastName, email: mergedUser.email }));
      if (mergedUser.role === "seller" && mergedUser.sellerStatus === "approved") {
        navigate("/seller/dashboard");
        return;
      }
      if (mergedUser.sellerStatus === "pending") {
        setServerError("Your seller application is already under review.");
        return;
      }
      handleApplyAsSellerAfterAuth(mergedUser);
    } catch (error) {
      console.error("Phone OTP verification/login failed:", error);
      setServerError(error?.response?.data?.message || error?.message || "OTP verification failed. Please try again.");
    } finally {
      setPhoneOtpLoading(false);
    }
  };


  const handleApplyAsSellerAfterAuth = (user) => {
    const ownerName = `${user.firstName || form.firstName || ""} ${user.lastName || form.lastName || ""}`.trim();
    setSellerForm({
      shopName: user.store?.shopName || "",
      description: user.store?.description || "",
      website: user.store?.website || "",
      supportEmail: user.store?.supportEmail || user.email || form.email || "",
      supportPhone: user.store?.supportPhone || user.phone || form.phone || "",
      businessType: user.business?.businessType || "Individual",
      ownerName: user.business?.ownerName || ownerName,
      registrationNumber: user.business?.registrationNumber || "",
    });
    setSellerDocuments({ aadhaarFront: null, aadhaarBack: null, panImage: null, bankProof: null });
    setDocumentErrors({});
    setSellerErrors({});
    setShowSellerApplication(true);
  };


  /*
  |--------------------------------------------------------------------------
  | SELLER FORM CHANGE
  |--------------------------------------------------------------------------
  */

  const handleSellerChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setSellerForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSellerErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  /*
  |--------------------------------------------------------------------------
  | SELLER DOCUMENT CHANGE
  |--------------------------------------------------------------------------
  */

  const handleSellerDocumentChange = (
    e
  ) => {
    const {
      name,
      files,
    } = e.target;

    const file =
      files?.[0] || null;

    setSellerDocuments((prev) => ({
      ...prev,
      [name]: file,
    }));

    setDocumentErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  /*
  |--------------------------------------------------------------------------
  | SELLER DOCUMENT VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateSellerDocuments = () => {
    const nextErrors = {};

    if (!sellerDocuments.aadhaarFront) {
      nextErrors.aadhaarFront =
        "Aadhaar front is required.";
    }

    if (!sellerDocuments.aadhaarBack) {
      nextErrors.aadhaarBack =
        "Aadhaar back is required.";
    }

    if (!sellerDocuments.panImage) {
      nextErrors.panImage =
        "PAN card is required.";
    }

    if (!sellerDocuments.bankProof) {
      nextErrors.bankProof =
        "Bank proof is required.";
    }

    setDocumentErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SELLER APPLICATION VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateSellerApplication = () => {
    const nextErrors = {};

    const shopName =
      sellerForm.shopName.trim();

    const description =
      sellerForm.description.trim();

    const supportEmail =
      sellerForm.supportEmail
        .trim()
        .toLowerCase();

    const supportPhone =
      sellerForm.supportPhone.trim();

    const businessType =
      sellerForm.businessType.trim();

    const ownerName =
      sellerForm.ownerName.trim();

    if (!shopName) {
      nextErrors.shopName =
        "Shop name is required.";
    }

    if (!description) {
      nextErrors.description =
        "Store description is required.";
    }

    if (!supportEmail) {
      nextErrors.supportEmail =
        "Support email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        supportEmail
      )
    ) {
      nextErrors.supportEmail =
        "Enter a valid support email.";
    }

    if (!supportPhone) {
      nextErrors.supportPhone =
        "Support phone is required.";
    }

    if (!businessType) {
      nextErrors.businessType =
        "Business type is required.";
    }

    if (!ownerName) {
      nextErrors.ownerName =
        "Owner name is required.";
    }

    setSellerErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  /*
  |--------------------------------------------------------------------------
  | SUBMIT SELLER APPLICATION + KYC
  |--------------------------------------------------------------------------
  */

  const submitSellerApplication =
    async (e) => {
      e.preventDefault();

      console.group(
        "🚀 [SELLER] SUBMIT APPLICATION"
      );

      const token =
        localStorage.getItem("token");

      if (!token) {
        setServerError(
          "Please login before applying to become a seller."
        );

        console.groupEnd();
        return;
      }

      if (!existingUser) {
        setServerError(
          "Please login before applying to become a seller."
        );

        console.groupEnd();
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | VALIDATE SELLER DETAILS
      |--------------------------------------------------------------------------
      */

      if (!validateSellerApplication()) {
        console.error(
          "❌ Seller form validation failed"
        );

        console.groupEnd();
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | VALIDATE DOCUMENTS
      |--------------------------------------------------------------------------
      */

      if (!validateSellerDocuments()) {
        console.error(
          "❌ Seller KYC validation failed"
        );

        setServerError(
          "Please upload Aadhaar front, Aadhaar back, PAN and bank proof."
        );

        console.groupEnd();
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | SELLER APPLICATION PAYLOAD
      |--------------------------------------------------------------------------
      */

      const payload = {
        store: {
          shopName:
            sellerForm.shopName.trim(),

          description:
            sellerForm.description.trim(),

          website:
            sellerForm.website.trim(),

          supportEmail:
            sellerForm.supportEmail
              .trim()
              .toLowerCase(),

          supportPhone:
            sellerForm.supportPhone.trim(),
        },

        business: {
          businessType:
            sellerForm.businessType.trim(),

          ownerName:
            sellerForm.ownerName.trim(),

          registrationNumber:
            sellerForm.registrationNumber.trim(),
        },
      };

      try {
        setLoading(true);
        setServerError("");

        /*
        |--------------------------------------------------------------------------
        | STEP 1
        | CREATE / UPDATE SELLER APPLICATION
        |--------------------------------------------------------------------------
        */

        console.log(
          "1. POST /seller/apply"
        );

        const response =
          await api.post(
            "/seller/apply",
            payload
          );

        console.log(
          "2. Seller application response:",
          response.data
        );

        if (
          !response.data?.success
        ) {
          setServerError(
            response.data?.message ||
              "Unable to submit seller application."
          );

          console.groupEnd();
          return;
        }

        /*
        |--------------------------------------------------------------------------
        | STEP 2
        | CREATE MULTIPART FORM DATA
        |--------------------------------------------------------------------------
        */

        const documentData =
          new FormData();

        documentData.append(
          "aadhaarFront",
          sellerDocuments.aadhaarFront
        );

        documentData.append(
          "aadhaarBack",
          sellerDocuments.aadhaarBack
        );

        documentData.append(
          "panImage",
          sellerDocuments.panImage
        );

        documentData.append(
          "bankProof",
          sellerDocuments.bankProof
        );

        /*
        |--------------------------------------------------------------------------
        | STEP 3
        | UPLOAD DOCUMENTS
        |--------------------------------------------------------------------------
        */

        setUploadingDocuments(true);

        console.log(
          "3. POST /seller/upload-documents"
        );

        const documentResponse =
          await api.put(
            "/seller/upload-documents",
            documentData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        console.log(
          "4. Document response:",
          documentResponse.data
        );

        if (
          !documentResponse.data?.success
        ) {
          setServerError(
            documentResponse.data?.message ||
              "Application was created, but document upload failed."
          );

          console.groupEnd();
          return;
        }

        /*
        |--------------------------------------------------------------------------
        | STEP 4
        | UPDATE LOCAL USER
        |--------------------------------------------------------------------------
        */

        const newStatus =
          documentResponse.data
            ?.sellerStatus ||
          response.data
            ?.sellerStatus ||
          "pending";

        setExistingUser((prev) => ({
          ...prev,

          sellerStatus:
            newStatus,

          sellerAppliedAt:
            response.data
              ?.sellerAppliedAt ||
            new Date().toISOString(),
        }));

        /*
        |--------------------------------------------------------------------------
        | RESET DOCUMENTS
        |--------------------------------------------------------------------------
        */

        setSellerDocuments({
          aadhaarFront: null,
          aadhaarBack: null,
          panImage: null,
          bankProof: null,
        });

        setDocumentErrors({});
        setSellerErrors({});

        /*
        |--------------------------------------------------------------------------
        | CLOSE SELLER FORM
        |--------------------------------------------------------------------------
        */

        setShowSellerApplication(false);

        /*
        |--------------------------------------------------------------------------
        | SUCCESS
        |--------------------------------------------------------------------------
        */

        setServerError(
          "Seller application and KYC documents submitted successfully. Your application is pending admin approval."
        );

        console.log(
          "✅ SELLER APPLICATION + KYC SUBMITTED"
        );
      } catch (error) {
        console.error(
          "❌ SELLER APPLY FAILED:",
          error
        );

        console.error(
          "Backend response:",
          error.response?.data
        );

        if (
          error.response?.status ===
            401 ||
          error.response?.status ===
            403
        ) {
          localStorage.removeItem(
            "token"
          );

          setServerError(
            "Your login session has expired. Please login again."
          );
        } else {
          setServerError(
            error.response?.data
              ?.message ||
              "Unable to submit seller application."
          );
        }
      } finally {
        setLoading(false);
        setUploadingDocuments(false);
        console.groupEnd();
      }
    };

  /*
  |--------------------------------------------------------------------------
  | REGISTER SELLER
  |--------------------------------------------------------------------------
  */

  const registerSeller = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validatePhoneForm()) return;
    await sendPhoneVerification();
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
    bg-[#f8faff]
    px-4
    text-sm
    font-medium
    text-zinc-950
    outline-none
    transition-all
    placeholder:text-zinc-400
    hover:border-zinc-300
    focus:bg-white
    focus:border-[#2563EB]
    focus:ring-4
    focus:ring-[#2563EB]/10

    ${
      errors[field]
        ? `
          border-zinc-900
          bg-[#f8faff]
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
  | DOCUMENT INPUT COMPONENT
  |--------------------------------------------------------------------------
  */

  const DocumentInput = ({
    name,
    label,
    description,
  }) => {
    const file =
      sellerDocuments[name];

    const error =
      documentErrors[name];

    return (
      <div>
        <label
          className="
            mb-2
            block
            text-xs
            font-semibold
            text-zinc-700
          "
        >
          {label} *
        </label>

        <p
          className="
            mb-2
            text-[10px]
            leading-4
            text-zinc-400
          "
        >
          {description}
        </p>

        <label
          className={`
            flex
            min-h-14
            cursor-pointer
            items-center
            rounded-2xl
            border
            bg-[#f8faff]
            px-4
            py-3
            transition
            hover:border-zinc-400
            hover:bg-white
            ${
              error
                ? "border-red-300"
                : "border-zinc-200"
            }
          `}
        >
          <input
            type="file"
            name={name}
            accept="image/*,.pdf"
            onChange={
              handleSellerDocumentChange
            }
            className="hidden"
          />

          <div className="min-w-0 flex-1">
            {file ? (
              <>
                <p
                  className="
                    truncate
                    text-xs
                    font-semibold
                    text-slate-900
                  "
                >
                  {file.name}
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    text-zinc-400
                  "
                >
                  Document selected
                </p>
              </>
            ) : (
              <>
                <p
                  className="
                    text-xs
                    font-semibold
                    text-zinc-700
                  "
                >
                  Choose document
                </p>

                <p
                  className="
                    mt-0.5
                    text-[10px]
                    text-zinc-400
                  "
                >
                  JPG, PNG or PDF
                </p>
              </>
            )}
          </div>

          <div
            className="
              ml-3
              rounded-full
              bg-[#2563EB]
              px-3
              py-2
              text-[10px]
              font-semibold
              text-white
            "
          >
            {file
              ? "Change"
              : "Upload"}
          </div>
        </label>

        {error && (
          <p
            className="
              mt-1
              text-[11px]
              font-medium
              text-red-500
            "
          >
            {error}
          </p>
        )}
      </div>
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
        bg-[#f7f8fc]
        text-zinc-950
      "
    >
      {/* Firebase invisible reCAPTCHA host: must stay mounted in the DOM */}
      <div
        id="recaptcha-container"
        aria-hidden="true"
        style={{
          position: "fixed",
          left: 0,
          bottom: 0,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      />

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
          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
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
                  text-slate-900
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
              text-slate-900
              transition
              hover:border-[#2563EB]
              hover:bg-[#2563EB]
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
              bg-[#2563EB]
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
                from-black/90
                via-black/40
                to-black/10
              "
            />

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
                h-full
                min-h-[650px]
                flex-col
                justify-between
                p-8
                sm:p-10
              "
            >
              <div
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

              <div>
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
                    const Icon =
                      item.icon;

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
                            text-slate-900
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
              shadow-[0_12px_45px_rgba(37,99,235,0.08)]
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
                    bg-[#2563EB]
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
                      text-slate-900
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
                  text-slate-900
                  sm:text-3xl
                "
              >
                {accountExists
                  ? "Your account was found"
                  : "Create your account"}
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
                  bg-[#f8faff]
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
                    bg-[#2563EB]
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
                      text-slate-900
                    "
                  >
                    {accountExists
                      ? "Unable to continue"
                      : "Registration failed"}
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
                    hover:text-slate-900
                  "
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* =====================================================
                SELLER APPLICATION
            ===================================================== */}

            {showSellerApplication &&
              accountExists &&
              existingUser &&
              Boolean(
                localStorage.getItem(
                  "token"
                )
              ) && (
                <div
                  className="
                    mx-5
                    mt-5
                    overflow-hidden
                    rounded-2xl
                    border
                    border-zinc-200
                    bg-white
                    sm:mx-8
                  "
                >
                  <div
                    className="
                      border-b
                      border-zinc-100
                      px-5
                      py-5
                      sm:px-6
                    "
                  >
                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-4
                      "
                    >
                      <div>
                        <p
                          className="
                            text-[10px]
                            font-semibold
                            uppercase
                            tracking-[0.18em]
                            text-zinc-400
                          "
                        >
                          Seller application
                        </p>

                        <h3
                          className="
                            mt-1
                            text-xl
                            font-semibold
                            tracking-tight
                            text-slate-900
                          "
                        >
                          Apply as Seller
                        </h3>

                        <p
                          className="
                            mt-1
                            text-xs
                            leading-5
                            text-zinc-500
                          "
                        >
                          Complete your store information
                          and upload all required KYC
                          documents.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowSellerApplication(
                            false
                          );

                          setSellerErrors({});
                          setDocumentErrors({});
                          setServerError("");
                        }}
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          text-zinc-400
                          hover:bg-zinc-100
                          hover:text-slate-900
                        "
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <form
                    onSubmit={
                      submitSellerApplication
                    }
                    noValidate
                    className="
                      space-y-5
                      p-5
                      sm:p-6
                    "
                  >
                    {/* SHOP NAME */}

                    <div>
                      <label
                        className="
                          mb-2
                          block
                          text-xs
                          font-semibold
                          text-zinc-700
                        "
                      >
                        Shop name *
                      </label>

                      <input
                        name="shopName"
                        type="text"
                        value={
                          sellerForm.shopName
                        }
                        onChange={
                          handleSellerChange
                        }
                        placeholder="Rahul Electronics"
                        className={inputClass(
                          "shopName"
                        )}
                      />

                      {sellerErrors.shopName && (
                        <p className="mt-1 text-[11px] text-red-500">
                          {
                            sellerErrors.shopName
                          }
                        </p>
                      )}
                    </div>

                    {/* DESCRIPTION */}

                    <div>
                      <label
                        className="
                          mb-2
                          block
                          text-xs
                          font-semibold
                          text-zinc-700
                        "
                      >
                        Description *
                      </label>

                      <textarea
                        name="description"
                        rows={4}
                        value={
                          sellerForm.description
                        }
                        onChange={
                          handleSellerChange
                        }
                        placeholder="Electronics and accessories store"
                        className="
                          w-full
                          resize-none
                          rounded-2xl
                          border
                          border-zinc-200
                          bg-[#f8faff]
                          px-4
                          py-3
                          text-sm
                          text-zinc-950
                          outline-none
                          focus:border-[#2563EB]
                          focus:bg-white
                          focus:ring-4
                          focus:ring-[#2563EB]/10
                        "
                      />

                      {sellerErrors.description && (
                        <p className="mt-1 text-[11px] text-red-500">
                          {
                            sellerErrors.description
                          }
                        </p>
                      )}
                    </div>

                    {/* WEBSITE + BUSINESS TYPE */}

                    <div
                      className="
                        grid
                        gap-4
                        sm:grid-cols-2
                      "
                    >
                      <div>
                        <label
                          className="
                            mb-2
                            block
                            text-xs
                            font-semibold
                            text-zinc-700
                          "
                        >
                          Website
                        </label>

                        <input
                          name="website"
                          type="url"
                          value={
                            sellerForm.website
                          }
                          onChange={
                            handleSellerChange
                          }
                          placeholder="https://example.com"
                          className={inputClass(
                            "website"
                          )}
                        />
                      </div>

                      <div>
                        <label
                          className="
                            mb-2
                            block
                            text-xs
                            font-semibold
                            text-zinc-700
                          "
                        >
                          Business type *
                        </label>

                        <select
                          name="businessType"
                          value={
                            sellerForm.businessType
                          }
                          onChange={
                            handleSellerChange
                          }
                          className="
                            h-12
                            w-full
                            rounded-2xl
                            border
                            border-zinc-200
                            bg-[#f8faff]
                            px-4
                            text-sm
                            text-zinc-950
                            outline-none
                            focus:border-[#2563EB]
                            focus:bg-white
                            focus:ring-4
                            focus:ring-[#2563EB]/10
                          "
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

                          <option value="Private Limited">
                            Private Limited
                          </option>

                          <option value="Public Limited">
                            Public Limited
                          </option>

                          <option value="LLP">
                            LLP
                          </option>

                          <option value="Other">
                            Other
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* SUPPORT EMAIL + PHONE */}

                    <div
                      className="
                        grid
                        gap-4
                        sm:grid-cols-2
                      "
                    >
                      <div>
                        <label
                          className="
                            mb-2
                            block
                            text-xs
                            font-semibold
                            text-zinc-700
                          "
                        >
                          Support email *
                        </label>

                        <input
                          name="supportEmail"
                          type="email"
                          value={
                            sellerForm.supportEmail
                          }
                          onChange={
                            handleSellerChange
                          }
                          className={inputClass(
                            "supportEmail"
                          )}
                        />

                        {sellerErrors.supportEmail && (
                          <p className="mt-1 text-[11px] text-red-500">
                            {
                              sellerErrors.supportEmail
                            }
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          className="
                            mb-2
                            block
                            text-xs
                            font-semibold
                            text-zinc-700
                          "
                        >
                          Support phone *
                        </label>

                        <input
                          name="supportPhone"
                          type="tel"
                          value={
                            sellerForm.supportPhone
                          }
                          onChange={
                            handleSellerChange
                          }
                          className={inputClass(
                            "supportPhone"
                          )}
                        />

                        {sellerErrors.supportPhone && (
                          <p className="mt-1 text-[11px] text-red-500">
                            {
                              sellerErrors.supportPhone
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    {/* OWNER + REGISTRATION */}

                    <div
                      className="
                        grid
                        gap-4
                        sm:grid-cols-2
                      "
                    >
                      <div>
                        <label
                          className="
                            mb-2
                            block
                            text-xs
                            font-semibold
                            text-zinc-700
                          "
                        >
                          Owner name *
                        </label>

                        <input
                          name="ownerName"
                          type="text"
                          value={
                            sellerForm.ownerName
                          }
                          onChange={
                            handleSellerChange
                          }
                          className={inputClass(
                            "ownerName"
                          )}
                        />

                        {sellerErrors.ownerName && (
                          <p className="mt-1 text-[11px] text-red-500">
                            {
                              sellerErrors.ownerName
                            }
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          className="
                            mb-2
                            block
                            text-xs
                            font-semibold
                            text-zinc-700
                          "
                        >
                          Registration number
                        </label>

                        <input
                          name="registrationNumber"
                          type="text"
                          value={
                            sellerForm.registrationNumber
                          }
                          onChange={
                            handleSellerChange
                          }
                          placeholder="Optional"
                          className={inputClass(
                            "registrationNumber"
                          )}
                        />
                      </div>
                    </div>

                    {/* =================================================
                        KYC DOCUMENTS
                    ================================================= */}

                    <div
                      className="
                        rounded-2xl
                        border
                        border-zinc-200
                        bg-[#f8faff]
                        p-4
                        sm:p-5
                      "
                    >
                      <div className="mb-5">
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
                              bg-[#2563EB]
                              text-white
                            "
                          >
                            <ShieldCheck
                              size={17}
                            />
                          </div>

                          <div>
                            <p
                              className="
                                text-sm
                                font-semibold
                                text-slate-900
                              "
                            >
                              KYC Documents
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-[11px]
                                text-zinc-500
                              "
                            >
                              All four documents are
                              required for admin approval.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div
                        className="
                          grid
                          gap-4
                          sm:grid-cols-2
                        "
                      >
                        <DocumentInput
                          name="aadhaarFront"
                          label="Aadhaar Front"
                          description="Upload the front side of Aadhaar."
                        />

                        <DocumentInput
                          name="aadhaarBack"
                          label="Aadhaar Back"
                          description="Upload the back side of Aadhaar."
                        />

                        <DocumentInput
                          name="panImage"
                          label="PAN Card"
                          description="Upload a clear PAN card copy."
                        />

                        <DocumentInput
                          name="bankProof"
                          label="Bank Proof"
                          description="Upload cancelled cheque, passbook or bank statement."
                        />
                      </div>

                      <div
                        className="
                          mt-4
                          rounded-xl
                          border
                          border-zinc-200
                          bg-white
                          p-3
                        "
                      >
                        <p
                          className="
                            text-[10px]
                            leading-5
                            text-zinc-500
                          "
                        >
                          Accepted formats: JPG, PNG or PDF.
                          Make sure the documents are clear
                          and readable before submitting.
                        </p>
                      </div>
                    </div>

                    {/* STATUS */}

                    {uploadingDocuments && (
                      <div
                        className="
                          flex
                          items-center
                          gap-3
                          rounded-2xl
                          border
                          border-zinc-200
                          bg-[#f8faff]
                          p-4
                        "
                      >
                        <span
                          className="
                            h-5
                            w-5
                            animate-spin
                            rounded-full
                            border-2
                            border-zinc-300
                            border-t-black
                          "
                        />

                        <div>
                          <p
                            className="
                              text-xs
                              font-semibold
                              text-slate-900
                            "
                          >
                            Uploading KYC documents...
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-[10px]
                              text-zinc-500
                            "
                          >
                            Please do not close this page.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* SERVER ERROR */}

                    {serverError && (
                      <div
                        className="
                          rounded-2xl
                          border
                          border-zinc-200
                          bg-[#f8faff]
                          p-4
                        "
                      >
                        <p
                          className="
                            text-xs
                            leading-5
                            text-zinc-700
                          "
                        >
                          {serverError}
                        </p>
                      </div>
                    )}

                    {/* SUBMIT */}

                    <button
                      type="submit"
                      disabled={
                        loading ||
                        uploadingDocuments
                      }
                      className="
                        flex
                        min-h-12
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-full
                        bg-[#2563EB]
                        px-5
                        py-3.5
                        text-sm
                        font-semibold
                        text-white
                        shadow-[0_8px_24px_rgba(37,99,235,0.22)]
                        transition-all
                        hover:from-[#1D4ED8] hover:to-[#4338CA]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {loading ||
                      uploadingDocuments ? (
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

                          {uploadingDocuments
                            ? "Uploading documents..."
                            : "Submitting..."}
                        </>
                      ) : (
                        <>
                          <ShieldCheck
                            size={17}
                          />

                          Submit Application & KYC

                          <ArrowRight
                            size={17}
                          />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

            {/* PHONE-BASED SELLER REGISTRATION */}
            {!showSellerApplication && (
              <form onSubmit={phoneOtpSent ? verifyPhoneAndContinue : registerSeller} noValidate className="space-y-5 p-5 sm:p-8">
                {!phoneOtpSent ? (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-zinc-700" htmlFor="firstName">First name</label>
                        <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} placeholder="First name" autoComplete="given-name" className={inputClass("firstName")} />
                        <InputError field="firstName" />
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-semibold text-zinc-700" htmlFor="lastName">Last name</label>
                        <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last name" autoComplete="family-name" className={inputClass("lastName")} />
                        <InputError field="lastName" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-zinc-700" htmlFor="phone">Mobile number</label>
                      <div className="relative">
                        <Phone size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="10-digit mobile number" autoComplete="tel" className={`pl-11 ${inputClass("phone")}`} />
                      </div>
                      <InputError field="phone" />
                      <p className="mt-2 text-xs text-zinc-500">We will verify this number with a Firebase SMS OTP.</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-zinc-700" htmlFor="email">Email address <span className="font-normal text-zinc-400">(optional)</span></label>
                      <div className="relative">
                        <Mail size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="seller@example.com" autoComplete="email" className={`pl-11 ${inputClass("email")}`} />
                      </div>
                      <InputError field="email" />
                    </div>
                    <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-[#f8faff] p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-white"><ShieldCheck size={18} /></div>
                      <div><p className="text-xs font-semibold text-black">Phone-first secure verification</p><p className="mt-1 text-xs leading-5 text-zinc-500">Your mobile number is the only authentication method here. Email is optional contact information.</p></div>
                    </div>
                    <button type="submit" disabled={loading || phoneOtpLoading} className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-5 py-3.5 text-sm font-semibold text-white transition hover:from-[#1D4ED8] hover:to-[#4338CA] disabled:opacity-50">
                      {loading || phoneOtpLoading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Sending OTP...</> : <>Continue with phone OTP <ArrowRight size={17} /></>}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl border border-zinc-200 bg-[#f8faff] p-4 text-center">
                      <p className="text-sm font-semibold text-zinc-900">Verify your mobile number</p>
                      <p className="mt-1 text-xs text-zinc-500">Enter the 6-digit code sent to <strong>{normalizePhone(form.phone)}</strong></p>
                    </div>
                    <input value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="Enter 6-digit OTP" className="h-12 w-full rounded-2xl border border-zinc-200 bg-[#f8faff] px-4 text-center text-lg font-semibold tracking-[0.35em] text-black outline-none focus:border-[#2563EB] focus:bg-white focus:ring-4 focus:ring-[#2563EB]/10" />
                    <button type="submit" disabled={phoneOtpLoading || phoneOtp.length !== 6} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] px-5 py-3 text-sm font-semibold text-white transition hover:from-[#1D4ED8] hover:to-[#4338CA] disabled:opacity-50">{phoneOtpLoading ? "Verifying..." : "Verify OTP & Continue"}</button>
                    <button type="button" disabled={phoneOtpLoading} onClick={sendPhoneVerification} className="w-full py-2 text-xs font-semibold text-zinc-600 underline underline-offset-4 disabled:opacity-50">Resend OTP</button>
                    <button type="button" disabled={phoneOtpLoading} onClick={() => { resetRecaptcha(); setPhoneOtpSent(false); setConfirmationResult(null); setPhoneOtp(""); }} className="w-full py-2 text-xs font-semibold text-zinc-500">Change phone number</button>
                  </>
                )}
                <div className="border-t border-zinc-100 pt-5 text-center">
                  <p className="text-xs text-zinc-500">Already have an Odikart account?</p>
                  <button type="button" onClick={() => navigate("/login")} className="mt-1 rounded-full px-3 py-2 text-sm font-semibold text-black transition hover:bg-zinc-100">Sign in</button>
                </div>
                <p className="text-center text-[10px] leading-5 text-zinc-400">By applying as a seller, you agree to Odikart's seller terms and policies.</p>
              </form>
            )}

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