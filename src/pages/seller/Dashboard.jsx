import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getSellerAnalytics,
} from "../../services/sellerOrderService";

/* =========================================================
   ICON
========================================================= */

const Icon = ({
  name,
  size = 20,
}) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "package":
      return (
        <svg {...common}>
          <path d="m21 8-9-5-9 5 9 5 9-5Z" />
          <path d="M3 8v8l9 5 9-5V8" />
          <path d="M12 13v8" />
        </svg>
      );

    case "orders":
      return (
        <svg {...common}>
          <path d="M6 8h12l1 13H5L6 8Z" />
          <path d="M9 8V6a3 3 0 0 1 6 0v2" />
        </svg>
      );

    case "wallet":
      return (
        <svg {...common}>
          <path d="M3 7h18v13H3z" />
          <path d="M3 7V5h15v2" />
          <path d="M16 13h5" />
          <circle cx="17" cy="13" r="1" />
        </svg>
      );

    case "chart":
      return (
        <svg {...common}>
          <path d="M4 19V5" />
          <path d="M4 19h17" />
          <path d="m7 15 3-4 3 2 5-7" />
        </svg>
      );

    case "box":
      return (
        <svg {...common}>
          <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
          <path d="m4 7.5 8 4.5 8-4.5" />
          <path d="M12 12v9" />
        </svg>
      );

    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 20 6v5c0 5-3.4 8.8-8 10-4.6-1.2-8-5-8-10V6l8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );

    case "upload":
      return (
        <svg {...common}>
          <path d="M12 16V4" />
          <path d="m7 9 5-5 5 5" />
          <path d="M5 20h14" />
        </svg>
      );

    case "warning":
      return (
        <svg {...common}>
          <path d="M12 3 22 20H2L12 3Z" />
          <path d="M12 9v5" />
          <path d="M12 17h.01" />
        </svg>
      );

    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );

    case "plus":
      return (
        <svg {...common}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8.1 8.1 0 0 0-14.9-3L3 11" />
          <path d="M3 4v7h7" />
          <path d="M4 13a8.1 8.1 0 0 0 14.9 3L21 13" />
          <path d="M21 20v-7h-7" />
        </svg>
      );

    case "arrow":
      return (
        <svg {...common}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );

    case "external":
      return (
        <svg {...common}>
          <path d="M7 17 17 7" />
          <path d="M7 7h10v10" />
        </svg>
      );

    default:
      return null;
  }
};

/* =========================================================
   HELPERS
========================================================= */

const numberFormat = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const currencyFormat = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

/* =========================================================
   DASHBOARD
========================================================= */

const Dashboard = () => {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  /* =======================================================
     USER
  ======================================================= */

  const loadSellerUser = () => {
    try {
      const storedUser =
        localStorage.getItem("user");

      if (!storedUser) {
        setUser(null);
        return;
      }

      const parsedUser =
        JSON.parse(storedUser);

      setUser(parsedUser);
    } catch (error) {
      console.error(
        "Unable to load seller:",
        error
      );

      setUser(null);
    }
  };

  /* =======================================================
     ANALYTICS
  ======================================================= */

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getSellerAnalytics();

      console.log(
        "SELLER ANALYTICS:",
        data
      );

      if (!data?.success) {
        setError(
          data?.message ||
            "Unable to load dashboard"
        );

        return;
      }

      setAnalytics(
        data?.analytics || {}
      );
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadSellerUser();
    loadAnalytics();
  }, []);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="min-h-full bg-[#f7f8fa] px-4 py-5 sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl animate-pulse">

          <div className="flex items-center justify-between">

            <div>
              <div className="h-3 w-28 rounded bg-slate-200" />

              <div className="mt-3 h-8 w-64 rounded-lg bg-slate-200" />

              <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-200" />
            </div>

            <div className="h-10 w-10 rounded-full bg-slate-200" />

          </div>

          <div className="mt-7 h-36 rounded-[24px] bg-slate-200" />

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-40 rounded-[22px] bg-slate-200"
                />
              )
            )}

          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">

            <div className="h-48 rounded-[24px] bg-slate-200" />

            <div className="h-48 rounded-[24px] bg-slate-200" />

          </div>

        </div>

      </main>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <main className="min-h-full bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8">

        <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center">

          <div className="w-full rounded-[24px] border border-slate-100 bg-white p-7 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <Icon
                name="warning"
                size={25}
              />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-950">
              Dashboard unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={loadAnalytics}
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              <Icon
                name="refresh"
                size={17}
              />
              Try Again
            </button>

          </div>

        </div>

      </main>
    );
  }

  /* =======================================================
     SAFE ANALYTICS
  ======================================================= */

  const overview =
    analytics?.overview || {};

  const orders =
    analytics?.orders || {};

  const inventory =
    analytics?.inventory || {};

  const totalOrders =
    Number(
      overview?.totalOrders || 0
    );

  const totalSales =
    Number(
      overview?.totalSales || 0
    );

  const totalRevenue =
    Number(
      overview?.totalRevenue || 0
    );

  const totalProducts =
    Number(
      overview?.totalProducts || 0
    );

  const commission =
    Number(
      overview?.commission || 0
    );

  const commissionRate =
    Number(
      overview?.commissionRate || 0
    );

  const pendingOrders =
    Number(
      orders?.pending || 0
    );

  const confirmedOrders =
    Number(
      orders?.confirmed || 0
    );

  const processingOrders =
    Number(
      orders?.processing || 0
    );

  const packedOrders =
    Number(
      orders?.packed || 0
    );

  const shippedOrders =
    Number(
      orders?.shipped || 0
    );

  const deliveredOrders =
    Number(
      orders?.delivered || 0
    );

  const cancelledOrders =
    Number(
      orders?.cancelled || 0
    );

  const returnedOrders =
    Number(
      orders?.returned || 0
    );

  const lowStock =
    Number(
      inventory?.lowStock || 0
    );

  const outOfStock =
    Number(
      inventory?.outOfStock || 0
    );

  /* =======================================================
     SELLER VERIFICATION
  ======================================================= */

  const sellerStatus =
    user?.sellerStatus ||
    "pending";

  const verificationStatus =
    user?.sellerInfo?.verification
      ?.status ||
    "pending";

  const hasDocuments =
    Boolean(
      user?.sellerInfo?.kyc?.aadhaar
        ?.frontImage ||
      user?.sellerInfo?.kyc?.aadhaar
        ?.backImage ||
      user?.sellerInfo?.kyc?.pan
        ?.image ||
      user?.sellerInfo?.kyc?.bankProof
        ?.image ||
      user?.sellerInfo?.kyc?.gst
        ?.certificate
    );

  const isVerified =
    sellerStatus === "approved" &&
    verificationStatus === "approved";

  const isRejected =
    sellerStatus === "rejected" ||
    verificationStatus === "rejected";

  const rejectionReason =
    user?.sellerRejectedReason ||
    user?.sellerInfo?.verification
      ?.rejectionReason ||
    "";

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleAddProduct = () => {
    if (!isVerified) {
      navigate(
        "/seller/upload-documents"
      );

      return;
    }

    navigate(
      "/seller/products/add"
    );
  };

  const handleVerification = () => {
    navigate(
      "/seller/upload-documents"
    );
  };

  /* =======================================================
     ORDER STATUS
  ======================================================= */

  const orderStatuses = [
    {
      label: "Pending",
      value: pendingOrders,
      style:
        "bg-amber-50 border-amber-100",
    },
    {
      label: "Confirmed",
      value: confirmedOrders,
      style:
        "bg-sky-50 border-sky-100",
    },
    {
      label: "Processing",
      value: processingOrders,
      style:
        "bg-violet-50 border-violet-100",
    },
    {
      label: "Packed",
      value: packedOrders,
      style:
        "bg-orange-50 border-orange-100",
    },
    {
      label: "Shipped",
      value: shippedOrders,
      style:
        "bg-indigo-50 border-indigo-100",
    },
    {
      label: "Delivered",
      value: deliveredOrders,
      style:
        "bg-emerald-50 border-emerald-100",
    },
    {
      label: "Cancelled",
      value: cancelledOrders,
      style:
        "bg-rose-50 border-rose-100",
    },
    {
      label: "Returned",
      value: returnedOrders,
      style:
        "bg-slate-100 border-slate-200",
    },
  ];

  /* =======================================================
     QUICK ACTIONS
  ======================================================= */

  const quickActions = [
    {
      title: "Add Product",
      description:
        isVerified
          ? "Create a new product"
          : "Verification required",
      icon: "plus",
      onClick:
        handleAddProduct,
    },
    {
      title: "Products",
      description:
        "Manage your catalog",
      icon: "package",
      onClick: () =>
        navigate(
          "/seller/products"
        ),
    },
    {
      title: "Orders",
      description:
        "Manage customer orders",
      icon: "orders",
      onClick: () =>
        navigate(
          "/seller/orders"
        ),
    },
    {
      title: "Wallet",
      description:
        "Balance & payouts",
      icon: "wallet",
      onClick: () =>
        navigate(
          "/seller/wallet"
        ),
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="min-h-full bg-[#f7f8fa] px-3 py-4 sm:px-5 sm:py-6 lg:px-8 lg:py-7">

      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="mb-6 flex items-center justify-between gap-4">

          <div className="min-w-0">

            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Store overview
            </p>

            <h1 className="mt-1 truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Good morning,{" "}
              {user?.firstName ||
                "Seller"}
            </h1>

            <p className="mt-1.5 hidden text-sm text-slate-500 sm:block">
              Here's what's happening with your store today.
            </p>

          </div>

          <div className="flex shrink-0 items-center gap-2">

            {isVerified && (
              <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 sm:flex">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                Verified Seller

              </div>
            )}

            <button
              type="button"
              onClick={loadAnalytics}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              aria-label="Refresh dashboard"
            >
              <Icon
                name="refresh"
                size={18}
              />
            </button>

          </div>

        </header>

        {/* =================================================
            VERIFICATION CARD
        ================================================= */}

        <section className="mb-6">

          {isVerified ? (
            <div className="overflow-hidden rounded-[24px] border border-emerald-100 bg-white shadow-[0_2px_16px_rgba(15,23,42,0.04)]">

              <div className="flex flex-col gap-5 bg-emerald-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                    <Icon
                      name="shield"
                      size={23}
                    />
                  </div>

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-2">

                      <h2 className="text-base font-bold text-emerald-950">
                        Seller account verified
                      </h2>

                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        Approved
                      </span>

                    </div>

                    <p className="mt-1 text-sm leading-6 text-emerald-700">
                      Your seller verification is complete. You can now add products and sell on the platform.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={
                    handleAddProduct
                  }
                  className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 sm:w-auto"
                >
                  <Icon
                    name="plus"
                    size={17}
                  />
                  Add Product
                </button>

              </div>

            </div>
          ) : isRejected ? (
            <div className="overflow-hidden rounded-[24px] border border-rose-100 bg-white shadow-sm">

              <div className="bg-rose-50 p-5 sm:p-6">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm">
                      <Icon
                        name="warning"
                        size={23}
                      />
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-base font-bold text-rose-950">
                          Verification needs attention
                        </h2>

                        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-700">
                          Rejected
                        </span>

                      </div>

                      <p className="mt-1 text-sm leading-6 text-rose-700">
                        Please update your seller documents and submit them again.
                      </p>

                      {rejectionReason && (
                        <div className="mt-3 rounded-xl bg-white/70 p-3">

                          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
                            Rejection reason
                          </p>

                          <p className="mt-1 text-xs leading-5 text-rose-700">
                            {rejectionReason}
                          </p>

                        </div>
                      )}

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleVerification
                    }
                    className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white sm:w-auto"
                  >
                    Upload Again
                    <Icon
                      name="arrow"
                      size={16}
                    />
                  </button>

                </div>

              </div>

            </div>
          ) : !hasDocuments ? (
            <div className="overflow-hidden rounded-[24px] border border-amber-100 bg-white shadow-sm">

              <div className="bg-amber-50 p-5 sm:p-6">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-600 shadow-sm">
                      <Icon
                        name="upload"
                        size={23}
                      />
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-base font-bold text-amber-950">
                          Complete seller verification
                        </h2>

                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                          Required
                        </span>

                      </div>

                      <p className="mt-1 text-sm leading-6 text-amber-700">
                        Upload your KYC documents to get your seller account approved.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleVerification
                    }
                    className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white sm:w-auto"
                  >
                    Upload Documents
                    <Icon
                      name="arrow"
                      size={16}
                    />
                  </button>

                </div>

              </div>

            </div>
          ) : (
            <div className="overflow-hidden rounded-[24px] border border-sky-100 bg-white shadow-sm">

              <div className="bg-sky-50 p-5 sm:p-6">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sky-600 shadow-sm">
                      <Icon
                        name="clock"
                        size={23}
                      />
                    </div>

                    <div>

                      <div className="flex flex-wrap items-center gap-2">

                        <h2 className="text-base font-bold text-sky-950">
                          Verification in review
                        </h2>

                        <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-700">
                          Pending
                        </span>

                      </div>

                      <p className="mt-1 text-sm leading-6 text-sky-700">
                        Your documents are waiting for admin approval. Product creation will unlock after approval.
                      </p>

                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleVerification
                    }
                    className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white px-5 text-sm font-bold text-sky-800 sm:w-auto"
                  >
                    View Documents
                    <Icon
                      name="arrow"
                      size={16}
                    />
                  </button>

                </div>

              </div>

            </div>
          )}

        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="mb-7">

          <div className="mb-3 flex items-center justify-between">

            <div>
              <h2 className="text-base font-bold text-slate-950">
                Quick actions
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Common seller actions
              </p>
            </div>

          </div>
<div
  className="
    flex
    gap-3
    overflow-x-auto
    overscroll-x-contain
    pb-2
    snap-x
    snap-mandatory
    [-ms-overflow-style:none]
    [scrollbar-width:none]
    [&::-webkit-scrollbar]:hidden
  "
>
  {quickActions.map((action) => (
    <button
      key={action.title}
      type="button"
      onClick={action.onClick}
      className="
        group
        flex
        min-w-[210px]
        shrink-0
        snap-start
        items-center
        gap-3
        rounded-[20px]
        border
        border-slate-100
        bg-white
        p-3.5
        text-left
        shadow-[0_2px_12px_rgba(15,23,42,0.035)]
        transition
        hover:-translate-y-0.5
        hover:border-slate-200
        hover:shadow-md
        active:scale-[0.98]
        sm:min-w-[230px]
      "
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
        <Icon
          name={action.icon}
          size={19}
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-900">
          {action.title}
        </p>

        <p className="mt-0.5 truncate text-[11px] text-slate-400">
          {action.description}
        </p>
      </div>

      <Icon
        name="arrow"
        size={15}
      />
    </button>
  ))}
</div>

        </section>

        {/* =================================================
            PERFORMANCE
        ================================================= */}

        <section className="mb-7">

          <div className="mb-3">

            <h2 className="text-base font-bold text-slate-950">
              Performance
            </h2>

            <p className="mt-0.5 text-xs text-slate-400">
              Your store metrics
            </p>

          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

            {/* ORDERS */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/seller/orders"
                )
              }
              className="group rounded-[22px] border border-slate-100 bg-white p-5 text-left shadow-[0_2px_14px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-md"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon
                    name="orders"
                    size={20}
                  />
                </div>

                <Icon
                  name="external"
                  size={16}
                />

              </div>

              <p className="mt-5 text-xs font-semibold text-slate-400">
                Total Orders
              </p>

              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {numberFormat(
                  totalOrders
                )}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                All orders received
              </p>

            </button>

            {/* SALES */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/seller/analytics"
                )
              }
              className="group rounded-[22px] border border-slate-100 bg-white p-5 text-left shadow-[0_2px_14px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-md"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Icon
                    name="chart"
                    size={20}
                  />
                </div>

                <Icon
                  name="external"
                  size={16}
                />

              </div>

              <p className="mt-5 text-xs font-semibold text-slate-400">
                Total Sales
              </p>

              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {numberFormat(
                  totalSales
                )}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Items sold
              </p>

            </button>

            {/* REVENUE */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/seller/wallet"
                )
              }
              className="group rounded-[22px] border border-slate-100 bg-white p-5 text-left shadow-[0_2px_14px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-md"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Icon
                    name="wallet"
                    size={20}
                  />
                </div>

                <Icon
                  name="external"
                  size={16}
                />

              </div>

              <p className="mt-5 text-xs font-semibold text-slate-400">
                Revenue
              </p>

              <p className="mt-1 break-all text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {currencyFormat(
                  totalRevenue
                )}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Before commission
              </p>

            </button>

            {/* PRODUCTS */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/seller/products"
                )
              }
              className="group rounded-[22px] border border-slate-100 bg-white p-5 text-left shadow-[0_2px_14px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-md"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <Icon
                    name="package"
                    size={20}
                  />
                </div>

                <Icon
                  name="external"
                  size={16}
                />

              </div>

              <p className="mt-5 text-xs font-semibold text-slate-400">
                Products
              </p>

              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                {numberFormat(
                  totalProducts
                )}
              </p>

              <p className="mt-1 text-[11px] text-slate-400">
                Products in store
              </p>

            </button>

          </div>

        </section>

        {/* =================================================
            REVENUE + INVENTORY
        ================================================= */}

        <section className="mb-7 grid gap-4 lg:grid-cols-2">

          {/* REVENUE */}

          <article className="rounded-[24px] bg-slate-950 p-5 text-white shadow-[0_8px_28px_rgba(15,23,42,0.10)] sm:p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Revenue overview
                </p>

                <p className="mt-2 text-3xl font-bold tracking-tight">
                  {currencyFormat(
                    totalRevenue
                  )}
                </p>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                <Icon
                  name="chart"
                  size={20}
                />
              </div>

            </div>

            <div className="mt-7 grid grid-cols-2 gap-4">

              <div className="rounded-2xl bg-white/5 p-4">

                <p className="text-[11px] text-slate-500">
                  Commission
                </p>

                <p className="mt-1 text-sm font-bold text-white">
                  {currencyFormat(
                    commission
                  )}
                </p>

              </div>

              <div className="rounded-2xl bg-white/5 p-4">

                <p className="text-[11px] text-slate-500">
                  Rate
                </p>

                <p className="mt-1 text-sm font-bold text-white">
                  {commissionRate}%
                </p>

              </div>

            </div>

            <div className="mt-5">

              <div className="mb-2 flex items-center justify-between text-[10px] text-slate-500">

                <span>
                  Commission rate
                </span>

                <span>
                  {commissionRate}%
                </span>

              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">

                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{
                    width: `${Math.min(
                      Math.max(
                        commissionRate,
                        0
                      ),
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

          </article>

          {/* INVENTORY */}

          <article className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-[0_2px_14px_rgba(15,23,42,0.04)] sm:p-6">

            <div className="flex items-start justify-between">

              <div>

                <p className="text-xs font-medium text-slate-400">
                  Inventory health
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Stock overview
                </h2>

              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <Icon
                  name="box"
                  size={20}
                />
              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/seller/products"
                  )
                }
                className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-left transition hover:bg-amber-100"
              >

                <p className="text-xs font-semibold text-amber-700">
                  Low stock
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-950">
                  {numberFormat(
                    lowStock
                  )}
                </p>

                <p className="mt-1 text-[11px] text-amber-700/70">
                  Products need attention
                </p>

              </button>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/seller/products"
                  )
                }
                className="rounded-2xl border border-rose-100 bg-rose-50 p-4 text-left transition hover:bg-rose-100"
              >

                <p className="text-xs font-semibold text-rose-700">
                  Out of stock
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-950">
                  {numberFormat(
                    outOfStock
                  )}
                </p>

                <p className="mt-1 text-[11px] text-rose-700/70">
                  Products unavailable
                </p>

              </button>

            </div>

          </article>

        </section>

        {/* =================================================
            ORDERS
        ================================================= */}

        <section className="mb-7 overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-[0_2px_14px_rgba(15,23,42,0.04)]">

          <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">

            <div>

              <h2 className="text-base font-bold text-slate-950 sm:text-lg">
                Order status
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Current order pipeline
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/seller/orders"
                )
              }
              className="hidden items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-950 sm:flex"
            >
              View orders
              <Icon
                name="arrow"
                size={14}
              />
            </button>

          </div>

          <div className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 sm:gap-3 sm:p-5 lg:grid-cols-8">

            {orderStatuses.map(
              (status) => (
                <div
                  key={
                    status.label
                  }
                  className={`rounded-2xl border p-3.5 sm:p-4 ${status.style}`}
                >

                  <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {status.label}
                  </p>

                  <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    {numberFormat(
                      status.value
                    )}
                  </p>

                </div>
              )
            )}

          </div>

          <div className="border-t border-slate-100 p-3 sm:hidden">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/seller/orders"
                )
              }
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-50 text-xs font-bold text-slate-700"
            >
              View all orders
              <Icon
                name="arrow"
                size={14}
              />
            </button>

          </div>

        </section>

        {/* =================================================
            RESPONSIVE FOOTER SPACE
        ================================================= */}

        <div className="h-2" />

      </div>

    </main>
  );
};

export default Dashboard;