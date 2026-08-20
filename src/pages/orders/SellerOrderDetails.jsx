import { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import { useNavigate, useParams } from "react-router-dom";

import {
  getSellerOrder,
  updateOrderStatus,
} from "../../services/sellerOrderService";

import SellerOrderStatus from "./SellerOrderStatus";

/* =====================================================
   UI HELPERS
===================================================== */

const formatDateTime = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const formatDate = (value) => {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("en-IN", {
    dateStyle: "medium",
  });
};

const money = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const getStatusMeta = (status) => {
  const map = {
    "Pending Payment": ["bg-amber-50 text-amber-700 ring-amber-200", "bg-amber-500"],
    Confirmed: ["bg-blue-50 text-blue-700 ring-blue-200", "bg-blue-500"],
    Processing: ["bg-indigo-50 text-indigo-700 ring-indigo-200", "bg-indigo-500"],
    Packed: ["bg-violet-50 text-violet-700 ring-violet-200", "bg-violet-500"],
    "Ready for Pickup": ["bg-orange-50 text-orange-700 ring-orange-200", "bg-orange-500"],
    Shipped: ["bg-cyan-50 text-cyan-700 ring-cyan-200", "bg-cyan-500"],
    "In Transit": ["bg-sky-50 text-sky-700 ring-sky-200", "bg-sky-500"],
    "Out for Delivery": ["bg-purple-50 text-purple-700 ring-purple-200", "bg-purple-500"],
    Delivered: ["bg-emerald-50 text-emerald-700 ring-emerald-200", "bg-emerald-500"],
    Cancelled: ["bg-red-50 text-red-700 ring-red-200", "bg-red-500"],
    "Return Requested": ["bg-orange-50 text-orange-700 ring-orange-200", "bg-orange-500"],
    "Return Approved": ["bg-blue-50 text-blue-700 ring-blue-200", "bg-blue-500"],
    "Return Rejected": ["bg-red-50 text-red-700 ring-red-200", "bg-red-500"],
    "Refund Processing": ["bg-amber-50 text-amber-700 ring-amber-200", "bg-amber-500"],
    "Refund Completed": ["bg-emerald-50 text-emerald-700 ring-emerald-200", "bg-emerald-500"],
  };

  return map[status] || ["bg-slate-100 text-slate-700 ring-slate-200", "bg-slate-500"];
};

/* =====================================================
   ICONS
===================================================== */

const ArrowLeft = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
    <path
      d="M19 12H5m6 6-6-6 6-6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowUpRight = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
    <path
      d="M7 17 17 7m-8 0h8v8"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PackageIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="m21 8-9-5-9 5m18 0v8l-9 5-9-5V8m18 0-9 5M3 8l9 5m0 0v8"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <path
      d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
      stroke="currentColor"
      strokeWidth="1.7"
    />
    <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M5 20c.8-3.2 3.1-5 7-5s6.2 1.8 7 5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const CreditCardIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3 10h18" stroke="currentColor" strokeWidth="1.7" />
    <path d="M7 15h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <path
      d="M3 6h11v11H3zM14 10h4l3 3v4h-7z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <circle cx="7" cy="18" r="2" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="18" cy="18" r="2" stroke="currentColor" strokeWidth="1.7" />
  </svg>
);

const RefreshIcon = ({ spinning }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`}
  >
    <path
      d="M20 11a8.1 8.1 0 0 0-14.8-3M4 5v5h5m-5 3a8.1 8.1 0 0 0 14.8 3M20 19v-5h-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SectionHeader = ({ icon, title, description }) => (
  <div className="mb-5 flex items-start gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
      {icon}
    </div>
    <div>
      <h2 className="text-lg font-bold tracking-tight text-slate-950">
        {title}
      </h2>
      {description && (
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      )}
    </div>
  </div>
);

const DetailRow = ({ label, value, valueClass = "" }) => (
  <div className="flex items-start justify-between gap-5 border-b border-slate-100 py-3 last:border-0 last:pb-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className={`max-w-[65%] text-right text-sm font-semibold text-slate-800 ${valueClass}`}>
      {value || "—"}
    </span>
  </div>
);

/* =====================================================
   COMPONENT
===================================================== */

const SellerOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  /* =====================================================
     AOS
  ===================================================== */

  useEffect(() => {
    AOS.init({
      duration: 650,
      easing: "ease-out-cubic",
      once: true,
      offset: 70,
      disable: "mobile",
    });

    return () => AOS.refreshHard();
  }, []);

  /* =====================================================
     LOAD ORDER
  ===================================================== */

  const loadOrder = async ({ silent = false } = {}) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      setError("");

      const data = await getSellerOrder(id);

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message || "Order not found");
      }
    } catch (error) {
      console.error("Get Seller Order Error:", error);

      setError(
        error.response?.data?.message || "Failed to load order"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (id) loadOrder();
  }, [id]);

  useEffect(() => {
    if (!loading && order) {
      const frame = requestAnimationFrame(() => AOS.refresh());
      return () => cancelAnimationFrame(frame);
    }
  }, [loading, order]);

  /* =====================================================
     UPDATE STATUS
  ===================================================== */

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdating(true);
      setError("");

      const data = await updateOrderStatus(orderId, status);

      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Update Seller Order Status Error:", error);

      setError(
        error.response?.data?.message ||
        "Failed to update order status"
      );
    } finally {
      setUpdating(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-44 animate-pulse bg-slate-100" />
            <div className="grid gap-5 p-6 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div className="h-52 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-44 animate-pulse rounded-2xl bg-slate-100" />
              </div>
              <div className="space-y-4">
                <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
                <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR
  ===================================================== */

  if (error || !order) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div
            data-aos="zoom-in"
            className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-2xl">
              !
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Order not found
            </h2>

            <p className="mt-2 text-sm leading-6 text-red-600">
              {error || "We couldn't load this order."}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => loadOrder({ silent: true })}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshIcon spinning={refreshing} />
                Try again
              </button>

              <button
                type="button"
                onClick={() => navigate("/seller/orders")}
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
              >
                Back to Orders
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     ORDER VALUES
  ===================================================== */

  const customer = order.userId || {};
  const items = order.items || [];
  const pricing = order.pricing || {};
  const payment = order.payment || {};
  const shipping = order.shipping || {};
  const address = order.deliveryAddress?.address || {};
  const customerAddress = order.deliveryAddress?.customer || {};

  const [statusClass, statusDot] = getStatusMeta(order.status);

  const customerName =
    customerAddress.fullName ||
    `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
    "Customer";

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* HEADER */}
        <section
          data-aos="fade-down"
          className="relative mb-6 overflow-hidden rounded-3xl bg-slate-950 px-5 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8"
        >
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative">
            <button
              type="button"
              onClick={() => navigate("/seller/orders")}
              className="mb-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-slate-200 backdrop-blur transition hover:bg-white/15 hover:text-white"
            >
              <ArrowLeft />
              Back to Orders
            </button>

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Order details
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="break-all text-3xl font-bold tracking-tight sm:text-4xl">
                    #{order.orderNumber || order._id}
                  </h1>

                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${statusClass}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
                    {order.status || "Unknown"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-300">
                  Placed {formatDateTime(order.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadOrder({ silent: true })}
                disabled={refreshing}
                className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshIcon spinning={refreshing} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>
        </section>

        {/* ERROR / UPDATE FEEDBACK */}
        {error && (
          <div
            data-aos="fade-down"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            <p className="font-semibold">Action needs attention</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid gap-5 lg:grid-cols-3">
          {/* LEFT / MAIN */}
          <main className="space-y-5 lg:col-span-2">
            {/* PRODUCTS */}
            <section
              data-aos="fade-up"
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <SectionHeader
                icon={<PackageIcon />}
                title="Ordered products"
                description={`${items.length} item${items.length === 1 ? "" : "s"} in this order`}
              />

              <div className="space-y-3">
                {items.map((item, index) => {
                  const itemTotal =
                    Number(item.price || 0) *
                    Number(item.quantity || 0);

                  return (
                    <div
                      key={item._id || index}
                      data-aos="fade-up"
                      data-aos-delay={Math.min(index * 60, 240)}
                      className="group flex flex-col gap-4 rounded-2xl border border-slate-200 p-3 transition duration-300 hover:border-slate-300 hover:bg-slate-50 sm:flex-row sm:items-center sm:p-4"
                    >
                     <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
  {(() => {
    const image =
      item.image ||
      item.thumbnail ||
      item.images?.[0] ||
      item.product?.image ||
      item.product?.thumbnail ||
      item.product?.images?.[0];

    return image ? (
      <img
        src={image}
        alt={item.title || "Product"}
        className="
          h-full
          w-full
          object-cover
          transition
          duration-500
          group-hover:scale-105
        "
        onError={(e) => {
          console.error(
            "Product image failed:",
            image
          );

          e.currentTarget.style.display =
            "none";
        }}
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-slate-400">
        <PackageIcon />
      </div>
    );
  })()}
</div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-slate-950">
                          {item.title || "Product"}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            Qty {item.quantity}
                          </span>

                          {item.variantSku && (
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              SKU {item.variantSku}
                            </span>
                          )}

                          {item.variantId && (
                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                              Variant {item.variantId}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs text-slate-400">
                          {money(item.price)} × {item.quantity}
                        </p>
                        <p className="mt-1 text-lg font-bold text-slate-950">
                          {money(itemTotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* DELIVERY ADDRESS */}
            <section
              data-aos="fade-up"
              data-aos-delay="80"
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <SectionHeader
                icon={<MapPinIcon />}
                title="Delivery address"
                description="Where this order is being delivered"
              />

              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-bold text-slate-950">
                      {customerName}
                    </h3>

                    {customerAddress.phone && (
                      <p className="mt-1 text-sm text-slate-500">
                        {customerAddress.phone}
                      </p>
                    )}
                  </div>

                  <span className="mt-2 inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 sm:mt-0">
                    Delivery address
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 border-t border-slate-200 pt-4 text-sm leading-6 text-slate-600">
                  {address.addressLine1 && <p>{address.addressLine1}</p>}
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  {address.landmark && <p>Landmark: {address.landmark}</p>}
                  {address.area && <p>{address.area}</p>}

                  <p>
                    {address.city}
                    {address.district && `, ${address.district}`}
                  </p>

                  <p>
                    {address.state}
                    {address.postalCode && ` - ${address.postalCode}`}
                  </p>

                  <p>{address.country || "India"}</p>
                </div>
              </div>
            </section>

            {/* TIMELINE */}
            <section
              data-aos="fade-up"
              data-aos-delay="140"
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <SectionHeader
                icon={<span className="text-base">↗</span>}
                title="Order timeline"
                description="Status history for this order"
              />

              {order.statusHistory?.length ? (
                <div className="relative ml-2 space-y-0">
                  <div className="absolute bottom-3 left-[7px] top-3 w-px bg-slate-200" />

                  {[...order.statusHistory]
                    .reverse()
                    .map((history, index) => {
                      const [historyClass, historyDot] = getStatusMeta(
                        history.status
                      );

                      return (
                        <div
                          key={history._id || index}
                          data-aos="fade-left"
                          data-aos-delay={index * 60}
                          className="relative flex gap-4 pb-6 last:pb-0"
                        >
                          <div className="relative z-10 mt-1.5 h-4 w-4 shrink-0 rounded-full bg-white ring-4 ring-white">
                            <div
                              className={`h-full w-full rounded-full ${historyDot}`}
                            />
                          </div>

                          <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${historyClass}`}
                              >
                                {history.status}
                              </span>

                              <span className="text-xs text-slate-400">
                                {formatDateTime(history.date)}
                              </span>
                            </div>

                            {history.remark && (
                              <p className="mt-3 text-sm leading-6 text-slate-600">
                                {history.remark}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-slate-500">
                  No status history available.
                </div>
              )}
            </section>
          </main>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-5">
            {/* STATUS */}
            <section
              data-aos="fade-left"
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <SectionHeader
                icon={<span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />}
                title="Order status"
                description="Manage the next order stage"
              />

              <div className="rounded-2xl bg-slate-50 p-4">
                <SellerOrderStatus
                  status={order.status}
                  orderId={order._id}
                  updating={updating}
                  onStatusChange={handleStatusChange}
                />
              </div>
            </section>

            {/* CUSTOMER */}
            <section
              data-aos="fade-left"
              data-aos-delay="80"
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <SectionHeader
                icon={<UserIcon />}
                title="Customer"
                description="Customer contact information"
              />

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-bold text-slate-950">
                  {customer.firstName || ""} {customer.lastName || ""}
                </p>

                <div className="mt-3 space-y-2 text-sm">
                  {customer.email && (
                    <p className="break-all text-slate-500">
                      {customer.email}
                    </p>
                  )}

                  {customer.phone && (
                    <p className="text-slate-500">{customer.phone}</p>
                  )}
                </div>
              </div>
            </section>

            {/* PAYMENT */}
            <section
              data-aos="fade-left"
              data-aos-delay="140"
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <SectionHeader
                icon={<CreditCardIcon />}
                title="Payment"
                description="Payment method and gateway details"
              />

              <div>
                <DetailRow label="Method" value={payment.method || "N/A"} />
                <DetailRow label="Status" value={payment.status || "Pending"} />

                {payment.gateway?.paymentId && (
                  <div className="pt-3">
                    <p className="text-sm text-slate-500">Payment ID</p>
                    <p className="mt-1 break-all rounded-lg bg-slate-50 p-2 text-xs font-mono text-slate-700">
                      {payment.gateway.paymentId}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* ORDER SUMMARY */}
            <section
              data-aos="fade-left"
              data-aos-delay="200"
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="bg-slate-950 p-5 text-white sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                  Financial summary
                </p>
                <h2 className="mt-1 text-xl font-bold">Order total</h2>
                <p className="mt-3 text-3xl font-bold tracking-tight">
                  {money(pricing.total)}
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="space-y-1">
                  <DetailRow label="Subtotal" value={money(pricing.subtotal)} />
                  <DetailRow
                    label="Shipping"
                    value={money(pricing.shippingCharge)}
                  />
                  <DetailRow label="Tax" value={money(pricing.tax)} />
                  <DetailRow
                    label="Discount"
                    value={`- ${money(pricing.couponDiscount)}`}
                    valueClass="text-red-600"
                  />
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                  <span className="font-bold text-slate-950">Total</span>
                  <span className="text-xl font-bold text-slate-950">
                    {money(pricing.total)}
                  </span>
                </div>
              </div>
            </section>

            {/* SHIPPING */}
            <section
              data-aos="fade-left"
              data-aos-delay="260"
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <SectionHeader
                icon={<TruckIcon />}
                title="Shipping"
                description="Courier and tracking information"
              />

              <div>
                <DetailRow
                  label="Courier"
                  value={shipping.courierName || "Not assigned"}
                />
                <DetailRow
                  label="Tracking number"
                  value={shipping.trackingNumber || "Not available"}
                />

                {shipping.estimatedDelivery && (
                  <DetailRow
                    label="Estimated delivery"
                    value={formatDate(shipping.estimatedDelivery)}
                  />
                )}

                {shipping.trackingUrl && (
                  <a
                    href={shipping.trackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    Track shipment
                    <ArrowUpRight />
                  </a>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default SellerOrderDetails;
