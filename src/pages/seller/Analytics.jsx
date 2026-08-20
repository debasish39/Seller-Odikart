import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getSellerAnalytics,
} from "../../services/sellerAnalytics";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  Package,
  TrendingUp,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  Activity,
  CircleDollarSign,
  Boxes,
} from "lucide-react";

/*
 * Modern Odikart Seller Analytics
 *
 * Keeps the existing analytics service + Recharts data structure.
 */

const chartColors = {
  primary: "#0f172a",
  secondary: "#475569",
  muted: "#cbd5e1",
  lowStock: "#f59e0b",
  outOfStock: "#f43f5e",
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async () => {
    try {
      setError("");

      if (!analytics) {
        setLoading(true);
      }

      const data = await getSellerAnalytics();

      if (data?.success) {
        setAnalytics(data.analytics);
      } else {
        setError(
          data?.message ||
            "Failed to load seller analytics."
        );
      }
    } catch (error) {
      console.error("Analytics error:", error);
      console.error(
        "Backend response:",
        error.response?.data
      );

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load seller analytics."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const overview = analytics?.overview || {};
  const orders = analytics?.orders || {};
  const inventory = analytics?.inventory || {};

  const totalRevenue = Number(
    overview.totalRevenue || 0
  );

  const totalOrders = Number(
    overview.totalOrders || 0
  );

  const totalSales = Number(
    overview.totalSales || 0
  );

  const commission = Number(
    overview.commission || 0
  );

  const totalProducts = Number(
    overview.totalProducts || 0
  );

  const lowStock = Number(
    inventory.lowStock || 0
  );

  const outOfStock = Number(
    inventory.outOfStock || 0
  );

  const commissionRate = Number(
    overview.commissionRate || 0
  );

  const orderChartData = useMemo(
    () => [
      {
        name: "Pending",
        orders: Number(
          orders.pending || 0
        ),
      },
      {
        name: "Confirmed",
        orders: Number(
          orders.confirmed || 0
        ),
      },
      {
        name: "Processing",
        orders: Number(
          orders.processing || 0
        ),
      },
      {
        name: "Packed",
        orders: Number(
          orders.packed || 0
        ),
      },
      {
        name: "Shipped",
        orders: Number(
          orders.shipped || 0
        ),
      },
      {
        name: "Delivered",
        orders: Number(
          orders.delivered || 0
        ),
      },
    ],
    [
      orders.pending,
      orders.confirmed,
      orders.processing,
      orders.packed,
      orders.shipped,
      orders.delivered,
    ]
  );

  const inventoryChartData = useMemo(
    () =>
      [
        {
          name: "Low Stock",
          value: Number(
            inventory.lowStock || 0
          ),
        },
        {
          name: "Out of Stock",
          value: Number(
            inventory.outOfStock || 0
          ),
        },
      ].filter((item) => item.value > 0),
    [
      inventory.lowStock,
      inventory.outOfStock,
    ]
  );

  const financialChartData = useMemo(
    () => [
      {
        name: "Sales",
        amount: Number(
          overview.totalSales || 0
        ),
      },
      {
        name: "Revenue",
        amount: Number(
          overview.totalRevenue || 0
        ),
      },
      {
        name: "Commission",
        amount: Number(
          overview.commission || 0
        ),
      },
    ],
    [
      overview.totalSales,
      overview.totalRevenue,
      overview.commission,
    ]
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 animate-pulse">
            <div className="h-4 w-28 rounded-full bg-slate-200" />
            <div className="mt-3 h-9 w-56 rounded-xl bg-slate-200" />
            <div className="mt-3 h-4 w-80 max-w-full rounded bg-slate-200" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-40 rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <div className="h-11 w-11 rounded-xl bg-slate-200" />
                  <div className="mt-5 h-3 w-24 rounded bg-slate-200" />
                  <div className="mt-2 h-8 w-32 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-28 rounded bg-slate-200" />
                </div>
              )
            )}
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="h-[390px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
            <div className="h-[390px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
          </div>

          <div className="mt-6 h-[390px] animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </main>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle size={26} />
            </div>

            <h1 className="mt-5 text-xl font-bold text-slate-950">
              We couldn't load your analytics
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error}
            </p>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />
              {refreshing
                ? "Trying again..."
                : "Try again"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  /*
   * UI
   */
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-7xl space-y-6 lg:space-y-7">

        {/* Hero / Header */}
        <section className="overflow-hidden rounded-3xl bg-slate-950 shadow-xl">
          <div className="relative px-5 py-7 sm:px-8 sm:py-8 lg:px-10">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-40 left-1/3 h-72 w-72 rounded-full bg-slate-700/30 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
                  <Activity size={13} />
                  Store analytics
                </div>

                <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Seller Analytics
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  A quick view of sales performance, order
                  flow, revenue, and inventory health.
                </p>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70 lg:w-auto"
              >
                <RefreshCw
                  size={16}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
                {refreshing
                  ? "Refreshing..."
                  : "Refresh analytics"}
              </button>
            </div>
          </div>
        </section>

        {/* KPI Cards */}
        <section>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <AnalyticsCard
              title="Total Revenue"
              value={formatCurrency(
                totalRevenue
              )}
              description="Current revenue reported by analytics"
              icon={IndianRupee}
              accent="dark"
            />

            <AnalyticsCard
              title="Total Orders"
              value={formatNumber(
                totalOrders
              )}
              description="Orders received by your store"
              icon={ShoppingBag}
              accent="blue"
            />

            <AnalyticsCard
              title="Total Sales"
              value={formatNumber(
                totalSales
              )}
              description="Items sold across your store"
              icon={TrendingUp}
              accent="emerald"
            />

            <AnalyticsCard
              title="Commission"
              value={formatCurrency(
                commission
              )}
              description={
                commissionRate
                  ? `Marketplace rate ${commissionRate}%`
                  : "Marketplace commission"
              }
              icon={CircleDollarSign}
              accent="amber"
            />
          </div>
        </section>

        {/* Store Health */}
        <section className="grid gap-4 md:grid-cols-3">
          <QuickMetric
            label="Products"
            value={totalProducts}
            icon={Boxes}
            helper="Catalog size"
          />

          <QuickMetric
            label="Low stock"
            value={lowStock}
            icon={AlertTriangle}
            helper={
              lowStock > 0
                ? "Needs attention"
                : "Inventory looks healthy"
            }
            tone={
              lowStock > 0
                ? "warning"
                : "success"
            }
          />

          <QuickMetric
            label="Out of stock"
            value={outOfStock}
            icon={XCircle}
            helper={
              outOfStock > 0
                ? "Replenishment needed"
                : "Nothing is unavailable"
            }
            tone={
              outOfStock > 0
                ? "danger"
                : "success"
            }
          />
        </section>

        {/* Order Performance */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            title="Order Performance"
            description="Orders grouped by current status"
            icon={ShoppingBag}
          />

          <div className="px-4 pb-5 sm:px-6 sm:pb-6">
            <div className="h-[340px] w-full sm:h-[380px]">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <BarChart
                  data={orderChartData}
                  margin={{
                    top: 12,
                    right: 8,
                    left: -12,
                    bottom: 8,
                  }}
                >
                  <CartesianGrid
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 11,
                      fill: "#64748b",
                    }}
                    axisLine={false}
                    tickLine={false}
                    interval={0}
                  />

                  <YAxis
                    allowDecimals={false}
                    tick={{
                      fontSize: 11,
                      fill: "#64748b",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    cursor={{
                      fill: "#f8fafc",
                    }}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      boxShadow:
                        "0 12px 30px rgba(15, 23, 42, 0.08)",
                    }}
                  />

                  <Bar
                    dataKey="orders"
                    name="Orders"
                    fill={chartColors.primary}
                    radius={[7, 7, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Financial + Inventory */}
        <section className="grid gap-6 lg:grid-cols-2">

          {/* Financial */}
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeading
              title="Financial Overview"
              description="Sales, revenue, and marketplace commission"
              icon={IndianRupee}
            />

            <div className="px-4 pb-5 sm:px-6 sm:pb-6">
              <div className="h-[320px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={financialChartData}
                    margin={{
                      top: 10,
                      right: 8,
                      left: -4,
                      bottom: 8,
                    }}
                  >
                    <CartesianGrid
                      stroke="#e2e8f0"
                      strokeDasharray="4 4"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fontSize: 11,
                        fill: "#64748b",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "#64748b",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(value),
                        "Amount",
                      ]}
                      cursor={{
                        fill: "#f8fafc",
                      }}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                        boxShadow:
                          "0 12px 30px rgba(15, 23, 42, 0.08)",
                      }}
                    />

                    <Bar
                      dataKey="amount"
                      name="Amount"
                      fill={chartColors.secondary}
                      radius={[7, 7, 0, 0]}
                      maxBarSize={56}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </article>

          {/* Inventory */}
          <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <SectionHeading
              title="Inventory Health"
              description="Products requiring your attention"
              icon={Package}
            />

            {inventoryChartData.length === 0 ? (
              <div className="flex h-[320px] flex-col items-center justify-center px-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <Package size={28} />
                </div>

                <p className="mt-4 text-base font-bold text-slate-950">
                  Inventory looks healthy
                </p>

                <p className="mt-1 max-w-xs text-sm leading-6 text-slate-500">
                  No low-stock or out-of-stock products
                  were reported.
                </p>
              </div>
            ) : (
              <div className="px-4 pb-5 sm:px-6 sm:pb-6">
                <div className="h-[320px]">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <PieChart>
                      <Pie
                        data={inventoryChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={4}
                        stroke="none"
                        label={({ name, value }) =>
                          `${name}: ${value}`
                        }
                      >
                        {inventoryChartData.map(
                          (entry) => (
                            <Cell
                              key={entry.name}
                              fill={
                                entry.name ===
                                "Low Stock"
                                  ? chartColors.lowStock
                                  : chartColors.outOfStock
                              }
                            />
                          )
                        )}
                      </Pie>

                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #e2e8f0",
                          boxShadow:
                            "0 12px 30px rgba(15, 23, 42, 0.08)",
                        }}
                      />

                      <Legend
                        verticalAlign="bottom"
                        height={30}
                        wrapperStyle={{
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </article>
        </section>

        {/* Detailed Inventory */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <SectionHeading
            title="Inventory Summary"
            description="A quick operational snapshot of your catalog"
            icon={Boxes}
          />

          <div className="grid gap-px bg-slate-100 sm:grid-cols-3">
            <SummaryCard
              title="Total Products"
              value={totalProducts}
              description="Products currently in your catalog"
              icon={Package}
              tone="neutral"
            />

            <SummaryCard
              title="Low Stock"
              value={lowStock}
              description={
                lowStock > 0
                  ? "Products approaching stock limits"
                  : "No products need replenishment"
              }
              icon={AlertTriangle}
              tone={
                lowStock > 0
                  ? "warning"
                  : "success"
              }
            />

            <SummaryCard
              title="Out of Stock"
              value={outOfStock}
              description={
                outOfStock > 0
                  ? "Products currently unavailable"
                  : "All products have stock"
              }
              icon={XCircle}
              tone={
                outOfStock > 0
                  ? "danger"
                  : "success"
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
};

const SectionHeading = ({
  title,
  description,
  icon: Icon,
}) => {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-5 sm:px-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        <Icon size={19} />
      </div>

      <div className="min-w-0">
        <h2 className="text-base font-bold text-slate-950 sm:text-lg">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
};

const AnalyticsCard = ({
  title,
  value,
  description,
  icon: Icon,
  accent = "dark",
}) => {
  const accentClasses = {
    dark: {
      icon: "bg-slate-950 text-white",
      glow: "bg-slate-100",
    },
    blue: {
      icon: "bg-sky-50 text-sky-700",
      glow: "bg-sky-50/70",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-700",
      glow: "bg-emerald-50/70",
    },
    amber: {
      icon: "bg-amber-50 text-amber-700",
      glow: "bg-amber-50/70",
    },
  };

  const styles =
    accentClasses[accent] ||
    accentClasses.dark;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full blur-2xl ${styles.glow}`}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <h3 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            {value}
          </h3>

          <p className="mt-2 text-xs leading-5 text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon size={20} />
        </div>
      </div>

      <div className="relative mt-5 flex items-center gap-1 text-xs font-semibold text-slate-400">
        View live store metrics
        <ArrowUpRight
          size={13}
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </div>
    </article>
  );
};

const QuickMetric = ({
  label,
  value,
  helper,
  icon: Icon,
  tone = "neutral",
}) => {
  const toneClasses = {
    neutral: {
      icon: "bg-slate-100 text-slate-700",
      value: "text-slate-950",
    },
    warning: {
      icon: "bg-amber-50 text-amber-700",
      value: "text-amber-700",
    },
    danger: {
      icon: "bg-rose-50 text-rose-700",
      value: "text-rose-700",
    },
    success: {
      icon: "bg-emerald-50 text-emerald-700",
      value: "text-emerald-700",
    },
  };

  const styles =
    toneClasses[tone] ||
    toneClasses.neutral;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p
            className={`mt-1 text-2xl font-bold ${styles.value}`}
          >
            {formatNumber(value)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        {helper}
      </p>
    </article>
  );
};

const SummaryCard = ({
  title,
  value,
  description,
  icon: Icon,
  tone = "neutral",
}) => {
  const toneClasses = {
    neutral:
      "bg-white text-slate-700",
    warning:
      "bg-amber-50/70 text-amber-700",
    danger:
      "bg-rose-50/70 text-rose-700",
    success:
      "bg-emerald-50/70 text-emerald-700",
  };

  return (
    <article
      className={`p-5 sm:p-6 ${toneClasses[tone] || toneClasses.neutral}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold opacity-80">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight">
            {formatNumber(value)}
          </p>

          <p className="mt-2 max-w-xs text-xs leading-5 opacity-70">
            {description}
          </p>
        </div>

        <Icon
          size={23}
          className="shrink-0 opacity-80"
        />
      </div>
    </article>
  );
};

export default Analytics;