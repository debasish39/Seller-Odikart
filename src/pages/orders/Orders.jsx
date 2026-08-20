import { useEffect, useMemo, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import {
  getSellerOrders,
  updateOrderStatus,
} from "../../services/sellerOrderService";

import { useNavigate } from "react-router-dom";

/* =====================================================
   SELLER ORDER STATUS FLOW
===================================================== */

const STATUS_FLOW = {
  "Pending Payment": ["Confirmed", "Cancelled"],
  Confirmed: ["Processing", "Cancelled"],
  Processing: ["Packed", "Cancelled"],
  Packed: ["Ready for Pickup", "Cancelled"],
  "Ready for Pickup": ["Shipped"],
  Shipped: ["In Transit"],
  "In Transit": ["Out for Delivery"],
  "Out for Delivery": ["Delivered"],
  Delivered: ["Return Requested"],
  "Return Requested": ["Return Approved", "Return Rejected"],
  "Return Approved": ["Return Pickup Scheduled"],
  "Return Pickup Scheduled": ["Return Picked Up"],
  "Return Picked Up": ["Received by Admin"],
  "Received by Admin": ["Inspection"],
  Inspection: ["Refund Processing", "Return Rejected"],
  "Refund Processing": ["Refund Completed"],
  "Refund Completed": [],
  "Return Rejected": [],
  Cancelled: [],
};

/* =====================================================
   UI HELPERS
===================================================== */

const STATUS_META = {
  "Pending Payment": {
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  Confirmed: {
    className: "bg-blue-50 text-blue-700 ring-blue-200",
    dot: "bg-blue-500",
  },
  Processing: {
    className: "bg-indigo-50 text-indigo-700 ring-indigo-200",
    dot: "bg-indigo-500",
  },
  Packed: {
    className: "bg-violet-50 text-violet-700 ring-violet-200",
    dot: "bg-violet-500",
  },
  "Ready for Pickup": {
    className: "bg-orange-50 text-orange-700 ring-orange-200",
    dot: "bg-orange-500",
  },
  Shipped: {
    className: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    dot: "bg-cyan-500",
  },
  "In Transit": {
    className: "bg-sky-50 text-sky-700 ring-sky-200",
    dot: "bg-sky-500",
  },
  "Out for Delivery": {
    className: "bg-purple-50 text-purple-700 ring-purple-200",
    dot: "bg-purple-500",
  },
  Delivered: {
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  Cancelled: {
    className: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },
  "Return Requested": {
    className: "bg-orange-50 text-orange-700 ring-orange-200",
    dot: "bg-orange-500",
  },
  "Return Approved": {
    className: "bg-blue-50 text-blue-700 ring-blue-200",
    dot: "bg-blue-500",
  },
  "Return Rejected": {
    className: "bg-red-50 text-red-700 ring-red-200",
    dot: "bg-red-500",
  },
  Returned: {
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-500",
  },
  "Return Picked Up": {
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-500",
  },
  "Refund Processing": {
    className: "bg-amber-50 text-amber-700 ring-amber-200",
    dot: "bg-amber-500",
  },
  "Refund Completed": {
    className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    dot: "bg-emerald-500",
  },
};

const getStatusMeta = (status) =>
  STATUS_META[status] || {
    className: "bg-slate-100 text-slate-700 ring-slate-200",
    dot: "bg-slate-500",
  };

const getStatusClass = (status) => getStatusMeta(status).className;

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getCustomerName = (order) =>
  [order.userId?.firstName, order.userId?.lastName]
    .filter(Boolean)
    .join(" ") || "Guest customer";

/* =====================================================
   SMALL ICONS
===================================================== */

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
    <path
      d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const PackageIcon = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="m21 8-9-5-9 5m18 0v8l-9 5-9-5V8m18 0-9 5M3 8l9 5m0 0v8"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
    <path
      d="M5 12h14m-6-6 6 6-6 6"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const RefreshIcon = ({ spinning = false }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`}
    aria-hidden="true"
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

/* =====================================================
   COMPONENT
===================================================== */

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const navigate = useNavigate();

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
     LOAD SELLER ORDERS
  ===================================================== */

  const loadOrders = async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await getSellerOrders();

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || "Failed to load orders");
      }
    } catch (error) {
      console.error("Load Seller Orders Error:", error);

      setError(
        error.response?.data?.message || "Failed to load orders"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    if (!loading) {
      const frame = requestAnimationFrame(() => AOS.refresh());
      return () => cancelAnimationFrame(frame);
    }
  }, [orders, loading, search, statusFilter]);

  /* =====================================================
     UPDATE STATUS
  ===================================================== */

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingOrder(orderId);

      await updateOrderStatus(orderId, status);
      await loadOrders({ silent: true });
    } catch (error) {
      console.error("Update Order Status Error:", error);

      setError(
        error.response?.data?.message || "Failed to update order status"
      );
    } finally {
      setUpdatingOrder(null);
    }
  };

  /* =====================================================
     FILTERING + SUMMARY
  ===================================================== */

  const statusOptions = useMemo(() => {
    const statuses = orders.map((order) => order.status).filter(Boolean);
    return ["All", ...Array.from(new Set(statuses))];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const customer = getCustomerName(order).toLowerCase();
      const orderNumber = String(
        order.orderNumber || order._id || ""
      ).toLowerCase();

      const products = (order.items || [])
        .map((item) => `${item.title || ""} ${item.variantSku || ""}`)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        customer.includes(query) ||
        orderNumber.includes(query) ||
        products.includes(query);

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const summary = useMemo(() => {
    const totalValue = orders.reduce((sum, order) => {
      return (
        sum +
        Number(order.pricing?.total ?? order.totalAmount ?? 0)
      );
    }, 0);

    return {
      total: orders.length,
      active: orders.filter(
        (order) =>
          !["Delivered", "Cancelled", "Refund Completed", "Return Rejected"].includes(
            order.status
          )
      ).length,
      delivered: orders.filter((order) => order.status === "Delivered").length,
      returns: orders.filter((order) =>
        String(order.status || "").toLowerCase().includes("return")
      ).length,
      totalValue,
    };
  }, [orders]);

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
            data-aos="fade-up"
          >
            <div className="h-36 animate-pulse bg-slate-100" />
            <div className="space-y-4 p-6 sm:p-8">
              <div className="h-6 w-52 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-72 animate-pulse rounded bg-slate-100" />
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-2xl bg-slate-100"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* HEADER */}
        <section
          data-aos="fade-down"
          className="relative mb-6 overflow-hidden rounded-3xl bg-slate-950 px-5 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-9"
        >
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-200 backdrop-blur">
                <PackageIcon className="h-4 w-4" />
                Seller dashboard
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Orders, simplified.
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Track your products, move orders through each stage, and keep
                every customer update in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadOrders({ silent: true })}
              disabled={refreshing}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshIcon spinning={refreshing} />
              {refreshing ? "Refreshing..." : "Refresh orders"}
            </button>
          </div>
        </section>

        {/* SUMMARY */}
        <section
          data-aos="fade-up"
          data-aos-delay="80"
          className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          {[
            {
              label: "Total orders",
              value: summary.total,
              detail: "All seller orders",
            },
            {
              label: "Active orders",
              value: summary.active,
              detail: "Currently moving",
            },
            {
              label: "Delivered",
              value: summary.delivered,
              detail: "Successfully completed",
            },
            {
              label: "Order value",
              value: `₹${summary.totalValue.toLocaleString("en-IN")}`,
              detail: "Combined order total",
            },
          ].map((stat, index) => (
            <div
              key={stat.label}
              data-aos="zoom-in"
              data-aos-delay={120 + index * 60}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-900/5"
            >
              <p className="text-sm font-medium text-slate-500">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{stat.detail}</p>
            </div>
          ))}
        </section>

        {/* ERROR */}
        {error && (
          <div
            data-aos="fade-down"
            className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1 text-red-600">{error}</p>
            </div>

            <button
              type="button"
              onClick={() => loadOrders({ silent: true })}
              className="shrink-0 rounded-lg bg-white px-3 py-2 font-semibold text-red-700 shadow-sm ring-1 ring-red-200 transition hover:bg-red-100"
            >
              Try again
            </button>
          </div>
        )}

        {/* TOOLBAR */}
        {orders.length > 0 && (
          <section
            data-aos="fade-up"
            data-aos-delay="120"
            className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-slate-950">Your orders</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Showing {filteredOrders.length} of {orders.length} orders
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
                <label className="relative min-w-0 flex-1 sm:min-w-[280px]">
                  <span className="sr-only">Search orders</span>
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <SearchIcon />
                  </span>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search order, customer, product..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                </label>

                <label className="sm:w-48">
                  <span className="sr-only">Filter by status</span>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status === "All" ? "All statuses" : status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </section>
        )}

        {/* EMPTY STATE */}
        {orders.length === 0 ? (
          <div
            data-aos="zoom-in"
            className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <PackageIcon className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              No orders yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Orders containing your products will appear here once customers
              place them.
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            data-aos="fade-up"
            className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <SearchIcon />
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-950">
              No matching orders
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Try a different search term or reset the status filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order, index) => {
              const nextStatuses = STATUS_FLOW[order.status] || [];
              const customerName = getCustomerName(order);
              const orderTotal = Number(
                order.pricing?.total ?? order.totalAmount ?? 0
              );

              return (
                <article
                  key={order._id}
                  data-aos="fade-up"
                  data-aos-delay={Math.min(index * 60, 240)}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/5"
                >
                  {/* ORDER TOP */}
                  <div className="border-b border-slate-100 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                            Order
                          </span>
                          <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs font-semibold text-slate-700">
                            #{order.orderNumber || order._id}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-500">
                          Placed {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${getStatusClass(
                          order.status
                        )}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${getStatusMeta(
                            order.status
                          ).dot}`}
                        />
                        {order.status || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* ORDER BODY */}
                  <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_280px]">
                    <div className="space-y-6">
                      {/* CUSTOMER */}
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-bold text-indigo-600 shadow-sm ring-1 ring-slate-200">
                            {customerName.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                              Customer
                            </p>
                            <p className="truncate font-semibold text-slate-900">
                              {customerName}
                            </p>
                          </div>
                        </div>

                        {(order.userId?.email || order.userId?.phone) && (
                          <div className="mt-3 grid gap-1 border-t border-slate-200 pt-3 text-sm text-slate-500 sm:grid-cols-2">
                            {order.userId?.email && (
                              <p className="truncate">{order.userId.email}</p>
                            )}
                            {order.userId?.phone && (
                              <p>{order.userId.phone}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* PRODUCTS */}
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-950">
                              Your products
                            </h3>
                            <p className="mt-0.5 text-xs text-slate-400">
                              {order.items?.length || 0} item
                              {(order.items?.length || 0) === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {order.items?.map((item, itemIndex) => {
                            const itemTotal =
                              Number(item.price || 0) *
                              Number(item.quantity || 0);

                            return (
                              <div
                                key={item._id || itemIndex}
                                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-3 transition hover:border-slate-300 hover:bg-slate-50"
                              >
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                  {item.image ? (
                                    <img
                                      src={item.image}
                                      alt={item.title || "Product"}
                                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                                      <PackageIcon />
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <h4 className="truncate font-semibold text-slate-900">
                                    {item.title || "Product"}
                                  </h4>

                                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                                    <span>Qty {item.quantity}</span>
                                    {item.variantSku && (
                                      <span>SKU {item.variantSku}</span>
                                    )}
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="font-bold text-slate-900">
                                    ₹{itemTotal.toLocaleString("en-IN")}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-400">
                                    ₹{Number(item.price || 0).toLocaleString("en-IN")} each
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* SIDE SUMMARY */}
                    <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Order summary
                        </p>

                        <div className="mt-4 flex items-end justify-between gap-4">
                          <span className="text-sm text-slate-500">
                            Total
                          </span>
                          <span className="text-2xl font-bold tracking-tight text-slate-950">
                            ₹{orderTotal.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      <div className="my-5 h-px bg-slate-200" />

                      <div className="flex items-start justify-between gap-4 text-sm">
                        <span className="text-slate-500">Payment</span>
                        <span className="text-right font-semibold text-slate-800">
                          {order.payment?.method || "N/A"}
                          <span className="mt-0.5 block text-xs font-medium text-slate-400">
                            {order.payment?.status || "Pending"}
                          </span>
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                        <span className="text-slate-500">Items</span>
                        <span className="font-semibold text-slate-800">
                          {order.items?.length || 0}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/seller/orders/${order._id}`)
                        }
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
                      >
                        View order details
                        <ArrowRightIcon />
                      </button>
                    </aside>
                  </div>

                  {/* ACTION FOOTER */}
                  <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          Order progress
                        </p>

                        {nextStatuses.length > 0 ? (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-slate-500">
                              Next:
                            </span>

                            {nextStatuses.map((status) => (
                              <span
                                key={status}
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${getStatusClass(
                                  status
                                )}`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${getStatusMeta(
                                    status
                                  ).dot}`}
                                />
                                {status}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-1 text-xs text-slate-500">
                            This order has reached a final status.
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row">
                        {nextStatuses.length > 0 ? (
                          <label className="min-w-[210px]">
                            <span className="sr-only">Update order status</span>
                            <select
                              value=""
                              disabled={updatingOrder === order._id}
                              onChange={(event) => {
                                const newStatus = event.target.value;
                                if (newStatus) {
                                  handleStatusChange(order._id, newStatus);
                                }
                              }}
                              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              <option value="">
                                {updatingOrder === order._id
                                  ? "Updating..."
                                  : "Update status"}
                              </option>

                              {nextStatuses.map((status) => (
                                <option key={status} value={status}>
                                  Move to {status}
                                </option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <span className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-400 ring-1 ring-slate-200">
                            No further action
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/seller/orders/${order._id}`)
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                        >
                          Details
                          <ArrowRightIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
