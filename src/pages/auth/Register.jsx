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

  // Account lookup state
  const [checkingAccount, setCheckingAccount] = useState(false);
  const [accountChecked, setAccountChecked] = useState(false);
  const [accountExists, setAccountExists] = useState(false);
  const [existingUser, setExistingUser] = useState(null);

  // Existing-account login OTP state
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginOtp, setLoginOtp] = useState("");
  const [loginOtpLoading, setLoginOtpLoading] = useState(false);

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

    // A changed email invalidates the previous account lookup.
    if (name === "email") {
      setAccountChecked(false);
      setAccountExists(false);
      setExistingUser(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CHECK EXISTING ACCOUNT
  |--------------------------------------------------------------------------
  */

  const checkAccount = async () => {
    console.group("🔎 [SELLER] CHECK ACCOUNT");

    setServerError("");
    setErrors((prev) => ({
      ...prev,
      email: "",
    }));

    setAccountChecked(false);
    setAccountExists(false);
    setExistingUser(null);

    const email = form.email.trim().toLowerCase();

    if (!email) {
      setErrors((prev) => ({
        ...prev,
        email: "Email address is required.",
      }));

      console.groupEnd();
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors((prev) => ({
        ...prev,
        email: "Enter a valid email address.",
      }));

      console.groupEnd();
      return;
    }

    try {
      setCheckingAccount(true);

      const response = await api.get(
        "/auth/check-account",
        {
          params: { email },
        }
      );

      const data = response.data;

      setAccountChecked(true);

      if (data?.exists && data?.user) {
        setAccountExists(true);
        setExistingUser(data.user);

        setForm((prev) => ({
          ...prev,
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          email: data.user.email || email,
          phone: data.user.phone || "",
        }));

        console.log("✅ ACCOUNT FOUND");

        console.groupEnd();
        return;
      }

      setAccountExists(false);
      setExistingUser(null);

      console.log("🆕 NO ACCOUNT FOUND");
    } catch (error) {
      console.error(
        "❌ CHECK ACCOUNT FAILED:",
        error
      );

      setServerError(
        error.response?.data?.message ||
          "Unable to check this email. Please try again."
      );
    } finally {
      setCheckingAccount(false);
      console.groupEnd();
    }
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
  | REGISTER FORM VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateForm = () => {
    const nextErrors = {};

    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();

    if (!firstName) {
      nextErrors.firstName =
        "First name is required.";
    } else if (firstName.length < 2) {
      nextErrors.firstName =
        "First name must be at least 2 characters.";
    }

    if (!lastName) {
      nextErrors.lastName =
        "Last name is required.";
    } else if (lastName.length < 2) {
      nextErrors.lastName =
        "Last name must be at least 2 characters.";
    }

    if (!email) {
      nextErrors.email =
        "Email address is required.";
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
  | APPLY AS SELLER
  |--------------------------------------------------------------------------
  */

  const handleApplyAsSeller = () => {
    console.group(
      "🏪 [SELLER] APPLY AS SELLER"
    );

    if (!existingUser) {
      setServerError(
        "Please login before applying to become a seller."
      );

      console.groupEnd();
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      setLoginOtpSent(false);
      setLoginOtp("");

      setServerError(
        "Please verify the login OTP before applying as a seller."
      );

      sendExistingAccountLoginOTP();

      console.groupEnd();
      return;
    }

    const sellerStatus =
      existingUser.sellerStatus || "none";

    if (
      existingUser.role === "seller" &&
      sellerStatus === "approved"
    ) {
      setServerError(
        "This account is already an approved seller account."
      );

      console.groupEnd();
      return;
    }

    if (sellerStatus === "pending") {
      setServerError(
        "Your seller application is already under review."
      );

      console.groupEnd();
      return;
    }

    if (sellerStatus === "suspended") {
      setServerError(
        "Your seller account is suspended. Please contact support."
      );

      console.groupEnd();
      return;
    }

    const ownerName =
      `${existingUser.firstName || ""} ${
        existingUser.lastName || ""
      }`.trim();

    setSellerForm({
      shopName:
        existingUser.store?.shopName || "",
      description:
        existingUser.store?.description || "",
      website:
        existingUser.store?.website || "",
      supportEmail:
        existingUser.store?.supportEmail ||
        existingUser.email ||
        "",
      supportPhone:
        existingUser.store?.supportPhone ||
        existingUser.phone ||
        "",
      businessType:
        existingUser.business?.businessType ||
        "Individual",
      ownerName:
        existingUser.business?.ownerName ||
        ownerName,
      registrationNumber:
        existingUser.business?.registrationNumber ||
        "",
    });

    /*
    |--------------------------------------------------------------------------
    | RESET DOCUMENT INPUTS
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
    setServerError("");
    setShowSellerApplication(true);

    console.log(
      "✅ Seller application form opened"
    );

    console.groupEnd();
  };

  /*
  |--------------------------------------------------------------------------
  | LOGIN OTP
  |--------------------------------------------------------------------------
  */

  const sendExistingAccountLoginOTP =
    async () => {
      const email = String(
        form.email || ""
      )
        .trim()
        .toLowerCase();

      if (!email) {
        setServerError(
          "Please enter your registered email address."
        );

        return;
      }

      try {
        setLoginOtpLoading(true);
        setServerError("");

        const response = await api.post(
          "/auth/signin-otp",
          { email }
        );

        if (!response.data?.success) {
          setServerError(
            response.data?.message ||
              "Unable to send login OTP."
          );

          return;
        }

        setLoginOtpSent(true);
        setLoginOtp("");

        setServerError(
          "Login OTP sent to your registered email."
        );
      } catch (error) {
        console.error(
          "❌ SEND LOGIN OTP FAILED:",
          error
        );

        setServerError(
          error.response?.data?.message ||
            "Unable to send login OTP. Please try again."
        );
      } finally {
        setLoginOtpLoading(false);
      }
    };

  /*
  |--------------------------------------------------------------------------
  | VERIFY LOGIN OTP
  |--------------------------------------------------------------------------
  */

  const verifyExistingAccountLoginOTP =
    async (e) => {
      e.preventDefault();

      const email = String(
        form.email || ""
      )
        .trim()
        .toLowerCase();

      const otp = String(
        loginOtp || ""
      )
        .replace(/\D/g, "")
        .slice(0, 6);

      if (!email) {
        setServerError(
          "Email address is required."
        );

        return;
      }

      if (!/^\d{6}$/.test(otp)) {
        setServerError(
          "Please enter the 6-digit OTP."
        );

        return;
      }

      try {
        setLoginOtpLoading(true);
        setServerError("");

        const response = await api.post(
          "/auth/verify-signin-otp",
          {
            email,
            otp,
          }
        );

        if (!response.data?.success) {
          setServerError(
            response.data?.message ||
              "Invalid login OTP."
          );

          return;
        }

        const token =
          response.data?.token;

        if (!token) {
          setServerError(
            "Login succeeded but no authentication token was returned."
          );

          return;
        }

        localStorage.setItem(
          "token",
          token
        );

        const authenticatedUser =
          response.data?.user ||
          existingUser;

        setExistingUser(
          authenticatedUser
        );

        setAccountExists(true);
        setLoginOtpSent(false);
        setLoginOtp("");

        setServerError("");

        const ownerName =
          `${authenticatedUser?.firstName || ""} ${
            authenticatedUser?.lastName || ""
          }`.trim();

        setSellerForm({
          shopName:
            authenticatedUser?.store?.shopName ||
            "",
          description:
            authenticatedUser?.store?.description ||
            "",
          website:
            authenticatedUser?.store?.website ||
            "",
          supportEmail:
            authenticatedUser?.store?.supportEmail ||
            authenticatedUser?.email ||
            email,
          supportPhone:
            authenticatedUser?.store?.supportPhone ||
            authenticatedUser?.phone ||
            "",
          businessType:
            authenticatedUser?.business?.businessType ||
            "Individual",
          ownerName:
            authenticatedUser?.business?.ownerName ||
            ownerName,
          registrationNumber:
            authenticatedUser?.business?.registrationNumber ||
            "",
        });

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
        setShowSellerApplication(true);
      } catch (error) {
        console.error(
          "❌ VERIFY LOGIN OTP FAILED:",
          error
        );

        setServerError(
          error.response?.data?.message ||
            "Unable to verify login OTP. Please try again."
        );
      } finally {
        setLoginOtpLoading(false);
      }
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

    console.group(
      "🚀 [SELLER] REGISTER SELLER"
    );

    setServerError("");

    /*
    |--------------------------------------------------------------------------
    | EXISTING ACCOUNT
    |--------------------------------------------------------------------------
    */

    if (
      accountExists &&
      existingUser
    ) {
      if (
        existingUser.role ===
          "seller" &&
        existingUser.sellerStatus ===
          "approved"
      ) {
        setServerError(
          "This account is already an approved seller account."
        );

        console.groupEnd();
        return;
      }

      if (
        existingUser.sellerStatus ===
        "pending"
      ) {
        setServerError(
          "This seller application is already under review."
        );

        console.groupEnd();
        return;
      }

      handleApplyAsSeller();

      console.groupEnd();
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | NEW ACCOUNT
    |--------------------------------------------------------------------------
    */

    if (!accountChecked) {
      setServerError(
        "Please check your email first."
      );

      console.groupEnd();
      return;
    }

    if (!validateForm()) {
      console.groupEnd();
      return;
    }

    const firstName =
      form.firstName.trim();

    const lastName =
      form.lastName.trim();

    const email =
      form.email
        .trim()
        .toLowerCase();

    const phone =
      form.phone.trim();

    try {
      setLoading(true);

      const response =
        await api.post(
          "/auth/signup",
          {
            firstName,
            lastName,
            email,
            phone,
            password:
              form.password,
            role: "seller",
          }
        );

      console.log(
        "✅ ACCOUNT CREATED:",
        response.data
      );

      navigate(
        "/verify-signup-otp",
        {
          state: {
            email,
            role: "seller",
          },
        }
      );
    } catch (error) {
      console.error(
        "❌ SIGNUP REQUEST FAILED:",
        error
      );

      const message =
        error.response?.data
          ?.message ||
        error.response?.data
          ?.error ||
        "Unable to create your seller account. Please try again.";

      setServerError(message);
    } finally {
      setLoading(false);
      console.groupEnd();
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
            bg-zinc-50
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
                    text-black
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
              bg-black
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
                    hover:text-black
                  "
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* =====================================================
                LOGIN OTP
            ===================================================== */}

            {accountExists &&
              existingUser &&
              loginOtpSent &&
              !localStorage.getItem(
                "token"
              ) && (
                <div
                  className="
                    mx-5
                    mt-5
                    rounded-2xl
                    border
                    border-zinc-200
                    bg-white
                    p-5
                    sm:mx-8
                    sm:p-6
                  "
                >
                  <p
                    className="
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.18em]
                      text-zinc-400
                    "
                  >
                    Account verification
                  </p>

                  <h3
                    className="
                      mt-1
                      text-xl
                      font-semibold
                      tracking-tight
                      text-black
                    "
                  >
                    Verify your login
                  </h3>

                  <p
                    className="
                      mt-2
                      text-xs
                      leading-5
                      text-zinc-500
                    "
                  >
                    We found your existing account.
                    Enter the 6-digit OTP sent to
                    your registered email to login
                    and continue with your seller
                    application.
                  </p>

                  <form
                    onSubmit={
                      verifyExistingAccountLoginOTP
                    }
                    className="mt-5 space-y-4"
                  >
                    <input
                      value={loginOtp}
                      onChange={(e) => {
                        const value =
                          e.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(0, 6);

                        setLoginOtp(value);
                      }}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="Enter 6-digit OTP"
                      className="
                        h-12
                        w-full
                        rounded-2xl
                        border
                        border-zinc-200
                        bg-zinc-50
                        px-4
                        text-center
                        text-lg
                        font-semibold
                        tracking-[0.35em]
                        text-black
                        outline-none
                        focus:border-black
                        focus:bg-white
                        focus:ring-4
                        focus:ring-black/5
                      "
                    />

                    <button
                      type="submit"
                      disabled={
                        loginOtpLoading ||
                        loginOtp.length !== 6
                      }
                      className="
                        flex
                        min-h-12
                        w-full
                        items-center
                        justify-center
                        rounded-full
                        bg-black
                        px-5
                        py-3
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-zinc-800
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {loginOtpLoading
                        ? "Verifying..."
                        : "Verify & Continue"}
                    </button>
                  </form>

                  <button
                    type="button"
                    disabled={
                      loginOtpLoading
                    }
                    onClick={
                      sendExistingAccountLoginOTP
                    }
                    className="
                      mt-3
                      w-full
                      text-xs
                      font-semibold
                      text-zinc-600
                      underline
                      underline-offset-4
                      hover:text-black
                      disabled:opacity-50
                    "
                  >
                    Resend login OTP
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
                            text-black
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
                          hover:text-black
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
                          bg-zinc-50
                          px-4
                          py-3
                          text-sm
                          text-zinc-950
                          outline-none
                          focus:border-black
                          focus:bg-white
                          focus:ring-4
                          focus:ring-black/5
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
                            bg-zinc-50
                            px-4
                            text-sm
                            text-zinc-950
                            outline-none
                            focus:border-black
                            focus:bg-white
                            focus:ring-4
                            focus:ring-black/5
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
                        bg-zinc-50
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
                              bg-black
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
                                text-black
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
                          bg-zinc-50
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
                              text-black
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
                          bg-zinc-50
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
                        bg-black
                        px-5
                        py-3.5
                        text-sm
                        font-semibold
                        text-white
                        shadow-[0_8px_20px_rgba(0,0,0,0.15)]
                        transition-all
                        hover:bg-zinc-800
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

            {/* =====================================================
                MAIN REGISTRATION FORM
            ===================================================== */}

            {!(loginOtpSent ||
              showSellerApplication) && (
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

                {accountChecked &&
                  !accountExists && (
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
                          Enter the details of the seller
                          account owner.
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
                              value={
                                form.firstName
                              }
                              onChange={
                                handleChange
                              }
                              autoComplete="given-name"
                              required
                              className={`
                                pl-11
                                ${inputClass(
                                  "firstName"
                                )}
                              `}
                            />
                          </div>

                          <InputError
                            field="firstName"
                          />
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
                            value={
                              form.lastName
                            }
                            onChange={
                              handleChange
                            }
                            autoComplete="family-name"
                            required
                            className={inputClass(
                              "lastName"
                            )}
                          />

                          <InputError
                            field="lastName"
                          />
                        </div>
                      </div>
                    </div>
                  )}

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

                  <div
                    className="
                      flex
                      flex-col
                      gap-3
                      sm:flex-row
                    "
                  >
                    <div className="relative flex-1">
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
                        onChange={
                          handleChange
                        }
                        autoComplete="email"
                        required
                        className={`
                          pl-11
                          ${inputClass(
                            "email"
                          )}
                        `}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={
                        checkAccount
                      }
                      disabled={
                        checkingAccount
                      }
                      className="
                        flex
                        h-12
                        shrink-0
                        items-center
                        justify-center
                        gap-2
                        rounded-2xl
                        bg-black
                        px-5
                        text-sm
                        font-semibold
                        text-white
                        transition
                        hover:bg-zinc-800
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {checkingAccount ? (
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

                          Checking...
                        </>
                      ) : (
                        <>
                          Check Account

                          <ArrowRight
                            size={16}
                          />
                        </>
                      )}
                    </button>
                  </div>

                  <InputError
                    field="email"
                  />

                  <p
                    className="
                      mt-2
                      text-[11px]
                      leading-5
                      text-zinc-500
                    "
                  >
                    Enter your email first. If you
                    already have an Odikart account,
                    your account information will be
                    shown automatically.
                  </p>
                </div>

                {/* EXISTING ACCOUNT */}

                {accountExists &&
                  existingUser && (
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
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-full
                            bg-black
                            text-white
                          "
                        >
                          {existingUser.image ? (
                            <img
                              src={
                                existingUser.image
                              }
                              alt={
                                existingUser.firstName ||
                                "User"
                              }
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                            />
                          ) : (
                            <User size={20} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="
                              text-sm
                              font-semibold
                              text-black
                            "
                          >
                            {
                              existingUser.firstName
                            }{" "}
                            {
                              existingUser.lastName
                            }
                          </p>

                          <p
                            className="
                              mt-0.5
                              truncate
                              text-xs
                              text-zinc-500
                            "
                          >
                            {
                              existingUser.email
                            }
                          </p>
                        </div>

                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                            rounded-full
                            bg-white
                            px-3
                            py-1.5
                            text-[10px]
                            font-semibold
                            text-black
                          "
                        >
                          <Check size={12} />
                          Account found
                        </div>
                      </div>

                      <div
                        className="
                          mt-5
                          grid
                          gap-4
                          border-t
                          border-zinc-200
                          pt-4
                          sm:grid-cols-2
                        "
                      >
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            First name
                          </p>

                          <p className="mt-1 text-sm font-medium text-zinc-900">
                            {existingUser.firstName ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            Last name
                          </p>

                          <p className="mt-1 text-sm font-medium text-zinc-900">
                            {existingUser.lastName ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            Email
                          </p>

                          <p className="mt-1 break-all text-sm font-medium text-zinc-900">
                            {existingUser.email ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            Phone
                          </p>

                          <p className="mt-1 text-sm font-medium text-zinc-900">
                            {existingUser.phone ||
                              "-"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            Account type
                          </p>

                          <p className="mt-1 text-sm font-medium capitalize text-zinc-900">
                            {existingUser.role ||
                              "user"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                            Seller status
                          </p>

                          <p className="mt-1 text-sm font-medium capitalize text-zinc-900">
                            {existingUser.sellerStatus ||
                              "Not applied"}
                          </p>
                        </div>
                      </div>

                      {/* SELLER ACTION */}

                      {existingUser.sellerStatus ===
                        "none" ||
                      existingUser.sellerStatus ===
                        "rejected" ||
                      !existingUser.sellerStatus ? (
                        <div
                          className="
                            mt-5
                            rounded-2xl
                            border
                            border-zinc-200
                            bg-white
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
                              <Store size={17} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-black">
                                {existingUser.sellerStatus ===
                                "rejected"
                                  ? "You can apply again"
                                  : "You are not a seller yet"}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-zinc-500">
                                {existingUser.sellerStatus ===
                                "rejected"
                                  ? "Your previous seller application was rejected. You can submit a new application."
                                  : "Your Odikart account is ready. Apply as a seller without creating another account."}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={
                              handleApplyAsSeller
                            }
                            className="
                              group
                              mt-4
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
                              font-semibold
                              text-white
                              transition-all
                              hover:bg-zinc-800
                            "
                          >
                            <Store size={17} />

                            {existingUser.sellerStatus ===
                            "rejected"
                              ? "Apply Again as Seller"
                              : "Apply as Seller"}

                            <ArrowRight
                              size={17}
                              className="
                                transition-transform
                                group-hover:translate-x-1
                              "
                            />
                          </button>
                        </div>
                      ) : existingUser.sellerStatus ===
                        "pending" ? (
                        <div
                          className="
                            mt-5
                            flex
                            items-start
                            gap-3
                            rounded-xl
                            border
                            border-zinc-200
                            bg-zinc-50
                            p-4
                          "
                        >
                          <ShieldCheck
                            size={18}
                            className="mt-0.5 shrink-0 text-zinc-700"
                          />

                          <div>
                            <p className="text-sm font-semibold text-black">
                              Seller application under review
                            </p>

                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                              Your seller application has already
                              been submitted. Please wait for admin
                              approval.
                            </p>
                          </div>
                        </div>
                      ) : existingUser.sellerStatus ===
                        "approved" ? (
                        <div
                          className="
                            mt-5
                            flex
                            items-start
                            gap-3
                            rounded-xl
                            border
                            border-zinc-200
                            bg-zinc-50
                            p-4
                          "
                        >
                          <Check
                            size={18}
                            className="mt-0.5 shrink-0 text-zinc-700"
                          />

                          <div>
                            <p className="text-sm font-semibold text-black">
                              Seller account approved
                            </p>

                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                              This account is already an approved
                              seller account.
                            </p>
                          </div>
                        </div>
                      ) : existingUser.sellerStatus ===
                        "suspended" ? (
                        <div
                          className="
                            mt-5
                            flex
                            items-start
                            gap-3
                            rounded-xl
                            border
                            border-zinc-200
                            bg-zinc-50
                            p-4
                          "
                        >
                          <ShieldCheck
                            size={18}
                            className="mt-0.5 shrink-0 text-zinc-700"
                          />

                          <div>
                            <p className="text-sm font-semibold text-black">
                              Seller account suspended
                            </p>

                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                              Please contact support to continue.
                            </p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

                {/* PHONE */}

                {accountChecked &&
                  !accountExists && (
                    <>
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
                            onChange={
                              handleChange
                            }
                            autoComplete="tel"
                            required
                            className={`
                              pl-11
                              ${inputClass(
                                "phone"
                              )}
                            `}
                          />
                        </div>

                        <InputError
                          field="phone"
                        />
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
                            value={
                              form.password
                            }
                            onChange={
                              handleChange
                            }
                            autoComplete="new-password"
                            minLength={6}
                            required
                            className={`
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
                              transition
                              hover:bg-zinc-100
                              hover:text-black
                            "
                          >
                            {showPassword ? (
                              <EyeOff
                                size={17}
                              />
                            ) : (
                              <Eye
                                size={17}
                              />
                            )}
                          </button>
                        </div>

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
                                {
                                  passwordStrength.label
                                }
                              </span>
                            </div>
                          </div>
                        )}

                        <InputError
                          field="password"
                        />
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
                    </>
                  )}

                {/* SUBMIT */}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    checkingAccount ||
                    !accountChecked
                  }
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
                  ) : accountExists ? (
                    existingUser?.sellerStatus ===
                      "none" ||
                    !existingUser?.sellerStatus ||
                    existingUser?.sellerStatus ===
                      "rejected" ? (
                      <>
                        <Store size={17} />

                        {existingUser?.sellerStatus ===
                        "rejected"
                          ? "Apply Again as Seller"
                          : "Apply as Seller"}

                        <ArrowRight
                          size={17}
                          className="
                            transition-transform
                            group-hover:translate-x-1
                          "
                        />
                      </>
                    ) : existingUser?.sellerStatus ===
                      "pending" ? (
                      <>
                        <ShieldCheck
                          size={17}
                        />

                        Application Under Review
                      </>
                    ) : existingUser?.sellerStatus ===
                      "approved" ? (
                      <>
                        <Check size={17} />

                        Seller Account Approved
                      </>
                    ) : (
                      <>
                        Continue to Login

                        <ArrowRight
                          size={17}
                          className="
                            transition-transform
                            group-hover:translate-x-1
                          "
                        />
                      </>
                    )
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
                    Already have an Odikart account?
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