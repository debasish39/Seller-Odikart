import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Upload,
  X,
  Clock3,
  AlertCircle,
} from "lucide-react";

import AOS from "aos";
import "aos/dist/aos.css";

import api from "../../services/api";

const SELLER_IMAGE =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=85";

const MAX_FILE_SIZE =
  10 * 1024 * 1024;

const DOCUMENT_CONFIG = [
  {
    key: "shopLogo",
    title: "Shop Logo",
    description: "Your store profile image",
    accept: "image/*",
    required: false,
    type: "image",
  },
  {
    key: "shopBanner",
    title: "Shop Banner",
    description: "Cover image for your store",
    accept: "image/*",
    required: false,
    type: "image",
  },
  {
    key: "aadhaarFront",
    title: "Aadhaar Front",
    description: "Front side of Aadhaar card",
    accept: "image/*,.pdf",
    required: true,
    type: "document",
  },
  {
    key: "aadhaarBack",
    title: "Aadhaar Back",
    description: "Back side of Aadhaar card",
    accept: "image/*,.pdf",
    required: true,
    type: "document",
  },
  {
    key: "panImage",
    title: "PAN Card",
    description: "PAN card document",
    accept: "image/*,.pdf",
    required: true,
    type: "document",
  },
  {
    key: "gstCertificate",
    title: "GST Certificate",
    description: "GST registration certificate",
    accept: "image/*,.pdf",
    required: false,
    type: "document",
  },
  {
    key: "bankProof",
    title: "Bank Proof",
    description: "Cancelled cheque or bank proof",
    accept: "image/*,.pdf",
    required: true,
    type: "document",
  },
];

function UploadSellerDocuments() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  const [files, setFiles] = useState({
    shopLogo: null,
    shopBanner: null,
    aadhaarFront: null,
    aadhaarBack: null,
    panImage: null,
    gstCertificate: null,
    bankProof: null,
  });

  const [previews, setPreviews] =
    useState({});

  const [errors, setErrors] =
    useState({});

  const [serverError, setServerError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [dragging, setDragging] =
    useState(null);

  /*
  |--------------------------------------------------------------------------
  | LOAD USER
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        navigate("/login", {
          replace: true,
        });

        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

      if (parsedUser?.role !== "seller") {
        navigate("/", {
          replace: true,
        });

        return;
      }

      if (
        parsedUser?.sellerStatus ===
          "blocked" ||
        parsedUser?.sellerStatus ===
          "suspended"
      ) {
        navigate("/seller/dashboard", {
          replace: true,
        });

        return;
      }

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "Load seller verification user error:",
        error
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      navigate("/login", {
        replace: true,
      });
    }
  }, [navigate]);

  /*
  |--------------------------------------------------------------------------
  | AOS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    AOS.init({
      duration: 650,
      easing: "ease-out-cubic",
      once: true,
      offset: 40,
    });

    return () => AOS.refreshHard();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | USER STATUS
  |--------------------------------------------------------------------------
  */

  const sellerStatus =
    user?.sellerStatus || "pending";

  const verificationStatus =
    user?.verification?.status ||
    "pending";

  const rejectionReason =
    user?.sellerRejectedReason ||
    user?.verification?.rejectedReason ||
    "";

  const isRejected =
    sellerStatus === "rejected" ||
    verificationStatus === "rejected";

  const isPending =
    verificationStatus === "pending" &&
    !isRejected;

  /*
  |--------------------------------------------------------------------------
  | FILE PREVIEWS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const nextPreviews = {};

    Object.entries(files).forEach(
      ([key, file]) => {
        if (!file) return;

        if (
          file.type?.startsWith("image/")
        ) {
          nextPreviews[key] =
            URL.createObjectURL(file);
        }
      }
    );

    setPreviews(nextPreviews);

    return () => {
      Object.values(nextPreviews).forEach(
        (url) => URL.revokeObjectURL(url)
      );
    };
  }, [files]);

  /*
  |--------------------------------------------------------------------------
  | FILE VALIDATION
  |--------------------------------------------------------------------------
  */

  const validateFile = (
    file,
    config
  ) => {
    if (!file) {
      return "Please select a file.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "File size must be 10MB or less.";
    }

    if (config.type === "image") {
      if (
        !file.type.startsWith("image/")
      ) {
        return "Please select an image file.";
      }
    } else {
      const valid =
        file.type.startsWith("image/") ||
        file.type ===
          "application/pdf";

      if (!valid) {
        return "Only image or PDF files are allowed.";
      }
    }

    return "";
  };

  /*
  |--------------------------------------------------------------------------
  | SET DOCUMENT
  |--------------------------------------------------------------------------
  */

  const setDocumentFile = (
    key,
    file
  ) => {
    const config =
      DOCUMENT_CONFIG.find(
        (item) => item.key === key
      );

    if (!config || !file) {
      return;
    }

    const validationError =
      validateFile(
        file,
        config
      );

    if (validationError) {
      setErrors((prev) => ({
        ...prev,
        [key]: validationError,
      }));

      return;
    }

    setFiles((prev) => ({
      ...prev,
      [key]: file,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));

    setServerError("");
    setSuccessMessage("");
  };

  /*
  |--------------------------------------------------------------------------
  | INPUT CHANGE
  |--------------------------------------------------------------------------
  */

  const handleFileChange = (
    e
  ) => {
    const {
      name,
      files: selectedFiles,
    } = e.target;

    const file =
      selectedFiles?.[0];

    if (!file) return;

    setDocumentFile(
      name,
      file
    );

    e.target.value = "";
  };

  /*
  |--------------------------------------------------------------------------
  | DRAG
  |--------------------------------------------------------------------------
  */

  const handleDragOver = (
    e,
    key
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setDragging(key);
  };

  const handleDragLeave = (
    e
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setDragging(null);
  };

  const handleDrop = (
    e,
    key
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setDragging(null);

    const file =
      e.dataTransfer.files?.[0];

    if (!file) return;

    setDocumentFile(
      key,
      file
    );
  };

  /*
  |--------------------------------------------------------------------------
  | REMOVE
  |--------------------------------------------------------------------------
  */

  const removeFile = (
    key
  ) => {
    setFiles((prev) => ({
      ...prev,
      [key]: null,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));

    setSuccessMessage("");
  };

  /*
  |--------------------------------------------------------------------------
  | FILE SIZE
  |--------------------------------------------------------------------------
  */

  const formatFileSize = (
    bytes
  ) => {
    if (!bytes) return "";

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (
      bytes <
      1024 * 1024
    ) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  /*
  |--------------------------------------------------------------------------
  | DOCUMENT COUNTS
  |--------------------------------------------------------------------------
  */

  const requiredDocuments =
    DOCUMENT_CONFIG.filter(
      (item) => item.required
    );

  const uploadedRequiredDocuments =
    requiredDocuments.filter(
      (item) => files[item.key]
    );

  const completion = useMemo(() => {
    if (
      requiredDocuments.length ===
      0
    ) {
      return 100;
    }

    return Math.round(
      (uploadedRequiredDocuments.length /
        requiredDocuments.length) *
        100
    );
  }, [
    uploadedRequiredDocuments.length,
    requiredDocuments.length,
  ]);

  /*
  |--------------------------------------------------------------------------
  | VALIDATE ALL
  |--------------------------------------------------------------------------
  */

  const validateAllDocuments =
    () => {
      const nextErrors = {};

      DOCUMENT_CONFIG.forEach(
        (config) => {
          if (
            config.required &&
            !files[config.key]
          ) {
            nextErrors[
              config.key
            ] =
              `${config.title} is required.`;
          }
        }
      );

      setErrors(nextErrors);

      return (
        Object.keys(
          nextErrors
        ).length === 0
      );
    };

  /*
  |--------------------------------------------------------------------------
  | UPLOAD
  |--------------------------------------------------------------------------
  */

  const uploadDocuments =
    async (e) => {
      e.preventDefault();

      setServerError("");
      setSuccessMessage("");

      if (
        !validateAllDocuments()
      ) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        return;
      }

      try {
        setLoading(true);

        const formData =
          new FormData();

        Object.entries(
          files
        ).forEach(
          ([key, file]) => {
            if (file) {
              formData.append(
                key,
                file
              );
            }
          }
        );

        const response =
          await api.put(
            "/seller/upload-documents",
            formData,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            }
          );

        const updatedUser =
          response.data?.user;

        /*
        |--------------------------------------------------------------------------
        | UPDATE LOCAL USER
        |--------------------------------------------------------------------------
        */

        if (updatedUser) {
          localStorage.setItem(
            "user",
            JSON.stringify(
              updatedUser
            )
          );

          setUser(
            updatedUser
          );
        }

        setSuccessMessage(
          response.data?.message ||
            "Documents uploaded successfully. Your verification is now pending review."
        );

        /*
        |--------------------------------------------------------------------------
        | GO DASHBOARD
        |--------------------------------------------------------------------------
        */

        setTimeout(() => {
          navigate(
            "/seller/dashboard",
            {
              replace: true,
            }
          );
        }, 1000);
      } catch (error) {
        console.error(
          "Seller document upload error:",
          error
        );

        setServerError(
          error.response?.data
            ?.message ||
            error.response?.data
              ?.error ||
            "Document upload failed. Please try again."
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
  | DOCUMENT CARD
  |--------------------------------------------------------------------------
  */

  const DocumentCard = ({
    config,
    index,
  }) => {
    const file =
      files[config.key];

    const preview =
      previews[config.key];

    const error =
      errors[config.key];

    const isDragging =
      dragging ===
      config.key;

    return (
      <div
        data-aos="fade-up"
        data-aos-delay={
          index * 50
        }
        onDragOver={(e) =>
          handleDragOver(
            e,
            config.key
          )
        }
        onDragLeave={
          handleDragLeave
        }
        onDrop={(e) =>
          handleDrop(
            e,
            config.key
          )
        }
        className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
          error
            ? "border-red-300 bg-red-50/40"
            : isDragging
              ? "border-indigo-500 bg-indigo-50 shadow-lg"
              : file
                ? "border-emerald-200 bg-emerald-50/30"
                : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg"
        }`}
      >
        <input
          id={`file-${config.key}`}
          type="file"
          name={config.key}
          accept={config.accept}
          onChange={
            handleFileChange
          }
          className="hidden"
        />

        {!file ? (
          <label
            htmlFor={`file-${config.key}`}
            className="block cursor-pointer p-5"
          >
            <div className="flex items-start gap-4">

              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                  error
                    ? "bg-red-100 text-red-600"
                    : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                }`}
              >
                {config.type ===
                "image" ? (
                  <Upload size={21} />
                ) : (
                  <ShieldCheck size={21} />
                )}
              </div>

              <div className="min-w-0 flex-1">

                <div className="flex items-start justify-between gap-2">

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {config.title}
                    </h3>

                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      {
                        config.description
                      }
                    </p>
                  </div>

                  {config.required ? (
                    <span className="shrink-0 rounded-full bg-red-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-red-500">
                      Required
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                      Optional
                    </span>
                  )}

                </div>

                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-indigo-600">
                  <span>
                    Choose file
                  </span>

                  <span className="text-slate-300">
                    or
                  </span>

                  <span className="text-slate-400">
                    drag & drop
                  </span>
                </div>

                <p className="mt-2 text-[10px] text-slate-400">
                  {config.type ===
                  "image"
                    ? "Image files • Max 10MB"
                    : "JPG, PNG or PDF • Max 10MB"}
                </p>

              </div>
            </div>
          </label>
        ) : (
          <div className="p-4">

            <div className="flex items-center gap-4">

              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {preview ? (
                  <img
                    src={preview}
                    alt={
                      config.title
                    }
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-red-500">
                    <ShieldCheck size={25} />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-2">

                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2
                      size={13}
                    />
                  </span>

                  <p className="truncate text-sm font-bold text-slate-900">
                    {file.name}
                  </p>

                </div>

                <p className="mt-1 text-xs text-slate-400">
                  {formatFileSize(
                    file.size
                  )}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  removeFile(
                    config.key
                  )
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500"
                aria-label={`Remove ${config.title}`}
              >
                <X size={17} />
              </button>

            </div>

            <label
              htmlFor={`file-${config.key}`}
              className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-500 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
            >
              Replace file
            </label>

          </div>
        )}

        {error && (
          <div className="border-t border-red-200 bg-red-50 px-5 py-3">
            <p className="flex items-center gap-2 text-xs font-medium text-red-600">
              <AlertCircle size={14} />
              {error}
            </p>
          </div>
        )}
      </div>
    );
  };

  /*
  |--------------------------------------------------------------------------
  | RENDER
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-3 py-3 sm:px-5 sm:py-5 lg:px-8 lg:py-8">

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-violet-400/10 blur-3xl" />
      </div>

      <main className="relative mx-auto max-w-6xl">

        <div className="grid overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.3)] sm:rounded-[2rem] lg:grid-cols-[0.8fr_1.2fr]">

          {/* =====================================================
              LEFT
          ===================================================== */}

          <section className="relative hidden min-h-[900px] overflow-hidden bg-slate-950 lg:block">

            <img
              src={SELLER_IMAGE}
              alt="Seller verification"
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/95" />

            <div className="relative flex h-full flex-col justify-between p-10 text-white">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/15">
                  <ShieldCheck size={22} />
                </div>

                <div>
                  <p className="text-sm font-bold">
                    Seller Portal
                  </p>

                  <p className="text-xs text-white/60">
                    Marketplace
                  </p>
                </div>

              </div>

              <div>

                <span className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                  Seller verification
                </span>

                <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight">
                  {isRejected
                    ? "Update your documents."
                    : "Verify your business."}
                </h1>

                <p className="mt-5 max-w-md text-sm leading-7 text-white/70">
                  {isRejected
                    ? "Some documents need attention. Upload corrected documents and submit them again for review."
                    : "Upload clear, valid documents so our team can verify your seller account."}
                </p>

                <div className="mt-8 space-y-3">

                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <CheckCircle2 size={19} />
                    <span className="text-sm">
                      Account created
                    </span>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <Upload size={19} />
                    <span className="text-sm">
                      Upload seller documents
                    </span>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                    <Clock3 size={19} />
                    <span className="text-sm">
                      Wait for admin approval
                    </span>
                  </div>

                </div>

              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-5">

                <p className="text-xs font-semibold text-white/60">
                  Required documents
                </p>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">

                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{
                      width: `${completion}%`,
                    }}
                  />

                </div>

                <p className="mt-3 text-xs text-white/50">
                  {
                    uploadedRequiredDocuments.length
                  }{" "}
                  of{" "}
                  {
                    requiredDocuments.length
                  }{" "}
                  required documents uploaded
                </p>

              </div>

            </div>
          </section>

          {/* =====================================================
              FORM
          ===================================================== */}

          <section className="px-5 py-7 sm:px-8 sm:py-10 lg:px-12 lg:py-10">

            <div className="mb-8 flex items-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white">
                <ShieldCheck size={21} />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-950">
                  Seller Portal
                </p>

                <p className="text-xs text-slate-400">
                  Seller Verification
                </p>
              </div>

            </div>

            {/* STATUS */}

            {isRejected ? (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600">
                    <AlertCircle size={20} />
                  </div>

                  <div>

                    <h2 className="text-sm font-bold text-red-900">
                      Verification rejected
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-red-700">
                      Please correct your documents and submit them again.
                    </p>

                    {rejectionReason && (
                      <div className="mt-3 rounded-xl bg-white/70 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                          Rejection reason
                        </p>

                        <p className="mt-1 text-xs leading-5 text-red-700">
                          {rejectionReason}
                        </p>
                      </div>
                    )}

                  </div>

                </div>

              </div>
            ) : isPending ? (
              <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

                <div className="flex items-start gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600">
                    <Clock3 size={20} />
                  </div>

                  <div>

                    <h2 className="text-sm font-bold text-amber-900">
                      Verification pending
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-amber-700">
                      Your documents are being reviewed. You can update them if necessary.
                    </p>

                  </div>

                </div>

              </div>
            ) : null}

            {/* HEADER */}

            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                Seller verification
              </span>

              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {isRejected
                  ? "Upload corrected documents"
                  : "Verify your business"}
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Upload clear copies of your required seller documents.
              </p>
            </div>

            {/* SERVER ERROR */}

            {serverError && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">

                <div className="flex items-start gap-3">

                  <AlertCircle
                    size={19}
                    className="shrink-0 text-red-600"
                  />

                  <div className="flex-1">

                    <p className="text-sm font-bold text-red-800">
                      Upload failed
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-600">
                      {serverError}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setServerError("")
                    }
                    className="text-red-400 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>

                </div>

              </div>
            )}

            {/* SUCCESS */}

            {successMessage && (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                <div className="flex items-start gap-3">

                  <CheckCircle2
                    size={19}
                    className="shrink-0 text-emerald-600"
                  />

                  <div>

                    <p className="text-sm font-bold text-emerald-800">
                      Documents submitted
                    </p>

                    <p className="mt-1 text-xs leading-5 text-emerald-700">
                      {successMessage}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* FORM */}

            <form
              onSubmit={
                uploadDocuments
              }
              className="mt-8"
            >

              {/* STORE */}

              <section>

                <div className="mb-5">
                  <h3 className="text-base font-bold text-slate-950">
                    Store images
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Add your branding so customers can identify your store.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">

                  {DOCUMENT_CONFIG.filter(
                    (item) =>
                      item.key ===
                        "shopLogo" ||
                      item.key ===
                        "shopBanner"
                  ).map(
                    (
                      config,
                      index
                    ) => (
                      <DocumentCard
                        key={
                          config.key
                        }
                        config={
                          config
                        }
                        index={
                          index
                        }
                      />
                    )
                  )}

                </div>

              </section>

              <div className="my-8 h-px bg-slate-100" />

              {/* IDENTITY */}

              <section>

                <div className="mb-5">
                  <h3 className="text-base font-bold text-slate-950">
                    Identity documents
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Upload clear copies of your identity documents.
                  </p>
                </div>

                <div className="space-y-4">

                  {DOCUMENT_CONFIG.filter(
                    (item) =>
                      item.key ===
                        "aadhaarFront" ||
                      item.key ===
                        "aadhaarBack" ||
                      item.key ===
                        "panImage"
                  ).map(
                    (
                      config,
                      index
                    ) => (
                      <DocumentCard
                        key={
                          config.key
                        }
                        config={
                          config
                        }
                        index={
                          index
                        }
                      />
                    )
                  )}

                </div>

              </section>

              <div className="my-8 h-px bg-slate-100" />

              {/* BUSINESS */}

              <section>

                <div className="mb-5">
                  <h3 className="text-base font-bold text-slate-950">
                    Business documents
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Provide the documents required for seller verification.
                  </p>
                </div>

                <div className="space-y-4">

                  {DOCUMENT_CONFIG.filter(
                    (item) =>
                      item.key ===
                        "gstCertificate" ||
                      item.key ===
                        "bankProof"
                  ).map(
                    (
                      config,
                      index
                    ) => (
                      <DocumentCard
                        key={
                          config.key
                        }
                        config={
                          config
                        }
                        index={
                          index
                        }
                      />
                    )
                  )}

                </div>

              </section>

              {/* NOTICE */}

              <div className="mt-8 flex gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">

                <ShieldCheck
                  size={19}
                  className="shrink-0 text-indigo-600"
                />

                <div>
                  <p className="text-xs font-bold text-indigo-900">
                    Your documents are protected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-indigo-700/70">
                    Make sure all text is readable and the complete document is visible. Accepted files are JPG, PNG and PDF up to 10MB.
                  </p>
                </div>

              </div>

              {/* BUTTONS */}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex min-h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Uploading Documents...
                    </>
                  ) : (
                    <>
                      {isRejected
                        ? "Resubmit Documents"
                        : "Submit Documents"}

                      <ArrowRight size={17} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() =>
                    navigate(
                      "/seller/dashboard"
                    )
                  }
                  className="min-h-12 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Upload Later
                </button>

              </div>

              <p className="mt-4 text-center text-[11px] leading-5 text-slate-400">
                You can access your seller dashboard while verification is pending, but adding products requires approval.
              </p>

            </form>

          </section>
        </div>
      </main>
    </div>
  );
}

export default UploadSellerDocuments;