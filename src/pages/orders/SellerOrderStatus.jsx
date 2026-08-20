import React from "react";
import {
  Check,
  ChevronDown,
  Clock3,
  Lock,
  PackageCheck,
  Truck,
  XCircle,
  RotateCcw,
} from "lucide-react";

/* =====================================================
   SELLER ORDER STATUS FLOW
===================================================== */

export const ORDER_STATUS_FLOW = {
  "Pending Payment": ["Confirmed", "Cancelled"],

  Confirmed: ["Processing", "Cancelled"],

  Processing: ["Packed", "Cancelled"],

  Packed: ["Ready for Pickup", "Cancelled"],

  "Ready for Pickup": ["Shipped"],

  Shipped: ["In Transit"],

  "In Transit": ["Out for Delivery"],

  "Out for Delivery": ["Delivered"],

  Delivered: ["Return Requested"],

  "Return Requested": [
    "Return Approved",
    "Return Rejected",
  ],

  "Return Approved": [
    "Return Pickup Scheduled",
  ],

  "Return Pickup Scheduled": [
    "Return Picked Up",
  ],

  "Return Picked Up": [
    "Received by Admin",
  ],

  "Received by Admin": [
    "Inspection",
  ],

  Inspection: [
    "Refund Processing",
    "Return Rejected",
  ],

  "Refund Processing": [
    "Refund Completed",
  ],

  "Refund Completed": [],

  "Return Rejected": [],

  Cancelled: [],
};


/* =====================================================
   STATUS CONFIG
===================================================== */

const STATUS_CONFIG = {
  "Pending Payment": {
    color: "amber",
    icon: Clock3,
    label: "Pending Payment",
  },

  Confirmed: {
    color: "blue",
    icon: Check,
    label: "Confirmed",
  },

  Processing: {
    color: "indigo",
    icon: PackageCheck,
    label: "Processing",
  },

  Packed: {
    color: "violet",
    icon: PackageCheck,
    label: "Packed",
  },

  "Ready for Pickup": {
    color: "orange",
    icon: PackageCheck,
    label: "Ready for Pickup",
  },

  Shipped: {
    color: "cyan",
    icon: Truck,
    label: "Shipped",
  },

  "In Transit": {
    color: "sky",
    icon: Truck,
    label: "In Transit",
  },

  "Out for Delivery": {
    color: "purple",
    icon: Truck,
    label: "Out for Delivery",
  },

  Delivered: {
    color: "emerald",
    icon: Check,
    label: "Delivered",
  },

  Cancelled: {
    color: "red",
    icon: XCircle,
    label: "Cancelled",
  },

  "Return Requested": {
    color: "orange",
    icon: RotateCcw,
    label: "Return Requested",
  },

  "Return Approved": {
    color: "blue",
    icon: Check,
    label: "Return Approved",
  },

  "Return Rejected": {
    color: "red",
    icon: XCircle,
    label: "Return Rejected",
  },

  "Return Pickup Scheduled": {
    color: "orange",
    icon: Truck,
    label: "Pickup Scheduled",
  },

  "Return Picked Up": {
    color: "violet",
    icon: PackageCheck,
    label: "Return Picked Up",
  },

  "Received by Admin": {
    color: "slate",
    icon: PackageCheck,
    label: "Received by Admin",
  },

  Inspection: {
    color: "amber",
    icon: Clock3,
    label: "Inspection",
  },

  "Refund Processing": {
    color: "amber",
    icon: Clock3,
    label: "Refund Processing",
  },

  "Refund Completed": {
    color: "emerald",
    icon: Check,
    label: "Refund Completed",
  },
};


/* =====================================================
   COLOR HELPERS
===================================================== */

const getStatusColors = (color) => {
  const colors = {
    amber: {
      badge:
        "bg-amber-50 text-amber-700 ring-amber-200",
      icon:
        "bg-amber-100 text-amber-700",
      dot:
        "bg-amber-500",
    },

    blue: {
      badge:
        "bg-blue-50 text-blue-700 ring-blue-200",
      icon:
        "bg-blue-100 text-blue-700",
      dot:
        "bg-blue-500",
    },

    indigo: {
      badge:
        "bg-indigo-50 text-indigo-700 ring-indigo-200",
      icon:
        "bg-indigo-100 text-indigo-700",
      dot:
        "bg-indigo-500",
    },

    violet: {
      badge:
        "bg-violet-50 text-violet-700 ring-violet-200",
      icon:
        "bg-violet-100 text-violet-700",
      dot:
        "bg-violet-500",
    },

    orange: {
      badge:
        "bg-orange-50 text-orange-700 ring-orange-200",
      icon:
        "bg-orange-100 text-orange-700",
      dot:
        "bg-orange-500",
    },

    cyan: {
      badge:
        "bg-cyan-50 text-cyan-700 ring-cyan-200",
      icon:
        "bg-cyan-100 text-cyan-700",
      dot:
        "bg-cyan-500",
    },

    sky: {
      badge:
        "bg-sky-50 text-sky-700 ring-sky-200",
      icon:
        "bg-sky-100 text-sky-700",
      dot:
        "bg-sky-500",
    },

    purple: {
      badge:
        "bg-purple-50 text-purple-700 ring-purple-200",
      icon:
        "bg-purple-100 text-purple-700",
      dot:
        "bg-purple-500",
    },

    emerald: {
      badge:
        "bg-emerald-50 text-emerald-700 ring-emerald-200",
      icon:
        "bg-emerald-100 text-emerald-700",
      dot:
        "bg-emerald-500",
    },

    red: {
      badge:
        "bg-red-50 text-red-700 ring-red-200",
      icon:
        "bg-red-100 text-red-700",
      dot:
        "bg-red-500",
    },

    slate: {
      badge:
        "bg-slate-100 text-slate-700 ring-slate-200",
      icon:
        "bg-slate-200 text-slate-700",
      dot:
        "bg-slate-500",
    },
  };

  return colors[color] || colors.slate;
};


/* =====================================================
   STATUS CLASS
===================================================== */

export const getStatusClass = (status) => {
  const config =
    STATUS_CONFIG[status];

  if (!config) {
    return "bg-slate-100 text-slate-700 ring-slate-200";
  }

  return getStatusColors(
    config.color
  ).badge;
};


/* =====================================================
   STATUS LABEL
===================================================== */

export const getStatusLabel = (status) => {
  return status || "Unknown";
};


/* =====================================================
   STATUS ICON
===================================================== */

const StatusIcon = ({
  status,
  size = 18,
}) => {
  const config =
    STATUS_CONFIG[status];

  const Icon =
    config?.icon || PackageCheck;

  return (
    <Icon size={size} />
  );
};


/* =====================================================
   SELLER ORDER STATUS
===================================================== */

const SellerOrderStatus = ({
  status,
  orderId,
  updating = false,
  onStatusChange,
}) => {
  const nextStatuses =
    ORDER_STATUS_FLOW[status] || [];

  const currentConfig =
    STATUS_CONFIG[status];

  const currentColors =
    getStatusColors(
      currentConfig?.color
    );

  const isFinal =
    nextStatuses.length === 0;


  /* ================================================
     UPDATE
  ================================================ */

  const handleChange = (event) => {
    const newStatus =
      event.target.value;

    if (!newStatus) return;

    onStatusChange(
      orderId,
      newStatus
    );
  };


  return (
    <div className="space-y-5">

      {/* ============================================
          CURRENT STATUS
      ============================================ */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
        "
      >

        <div className="p-4 sm:p-5">

          <div className="flex items-start justify-between gap-4">

            <div className="flex min-w-0 items-center gap-3">

              <div
                className={`
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  ${currentColors.icon}
                `}
              >
                <StatusIcon
                  status={status}
                  size={20}
                />
              </div>

              <div className="min-w-0">

                <p className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.14em]
                  text-slate-400
                ">
                  Current status
                </p>

                <h3 className="
                  mt-1
                  truncate
                  text-base
                  font-bold
                  text-slate-950
                  sm:text-lg
                ">
                  {getStatusLabel(status)}
                </h3>

              </div>

            </div>

            <span
              className={`
                inline-flex
                shrink-0
                items-center
                gap-1.5
                rounded-full
                px-3
                py-1.5
                text-[11px]
                font-bold
                ring-1
                ${currentColors.badge}
              `}
            >
              <span
                className={`
                  h-1.5
                  w-1.5
                  rounded-full
                  ${currentColors.dot}
                `}
              />

              Active
            </span>

          </div>

        </div>

      </div>


      {/* ============================================
          NEXT STATUS
      ============================================ */}

      {!isFinal && (

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            p-4
            sm:p-5
          "
        >

          <div className="mb-3">

            <p className="
              text-sm
              font-bold
              text-slate-950
            ">
              Update order
            </p>

            <p className="
              mt-1
              text-xs
              leading-5
              text-slate-500
            ">
              Select the next stage for this order.
            </p>

          </div>


          {/* SELECT */}

          <div className="relative">

            <select
              value=""
              disabled={updating}
              onChange={handleChange}
              className="
                w-full
                appearance-none
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-3.5
                pr-11
                text-sm
                font-semibold
                text-slate-800
                shadow-sm
                outline-none
                transition
                hover:border-slate-300
                focus:border-slate-950
                focus:ring-4
                focus:ring-slate-950/5
                disabled:cursor-not-allowed
                disabled:bg-slate-100
                disabled:opacity-60
              "
            >

              <option value="">
                {updating
                  ? "Updating order..."
                  : "Select next status"}
              </option>

              {nextStatuses.map(
                (nextStatus) => (
                  <option
                    key={nextStatus}
                    value={nextStatus}
                  >
                    {nextStatus}
                  </option>
                )
              )}

            </select>

            <ChevronDown
              size={18}
              className="
                pointer-events-none
                absolute
                right-4
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

          </div>


          {/* ========================================
              POSSIBLE NEXT STATUSES
          ======================================== */}

          <div className="mt-4">

            <p className="
              mb-2
              text-[10px]
              font-bold
              uppercase
              tracking-[0.12em]
              text-slate-400
            ">
              Available transitions
            </p>

            <div className="flex flex-wrap gap-2">

              {nextStatuses.map(
                (nextStatus) => {

                  const config =
                    STATUS_CONFIG[
                      nextStatus
                    ];

                  const colors =
                    getStatusColors(
                      config?.color
                    );

                  return (
                    <button
                      key={nextStatus}
                      type="button"
                      disabled={updating}
                      onClick={() =>
                        onStatusChange(
                          orderId,
                          nextStatus
                        )
                      }
                      className={`
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        px-3
                        py-1.5
                        text-xs
                        font-semibold
                        ring-1
                        transition
                        hover:-translate-y-0.5
                        hover:shadow-sm
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        ${colors.badge}
                      `}
                    >

                      <span
                        className={`
                          h-1.5
                          w-1.5
                          rounded-full
                          ${colors.dot}
                        `}
                      />

                      {nextStatus}

                    </button>
                  );
                }
              )}

            </div>

          </div>

        </div>
      )}


      {/* ============================================
          FINAL STATUS
      ============================================ */}

      {isFinal && (

        <div
          className="
            flex
            items-start
            gap-3
            rounded-2xl
            border
            border-slate-200
            bg-slate-50
            p-4
          "
        >

          <div className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-slate-200
            text-slate-600
          ">
            <Lock size={16} />
          </div>

          <div>

            <p className="
              text-sm
              font-bold
              text-slate-800
            ">
              Order completed
            </p>

            <p className="
              mt-1
              text-xs
              leading-5
              text-slate-500
            ">
              This order has reached a final status
              and no further seller updates are available.
            </p>

          </div>

        </div>
      )}

    </div>
  );
};

export default SellerOrderStatus;