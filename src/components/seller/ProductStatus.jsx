function ProductStatus({ status }) {
  const statusConfig = {
    pending: {
      label: "Pending",
      className:
        "bg-yellow-100 text-yellow-700",
    },

    approved: {
      label: "Approved",
      className:
        "bg-green-100 text-green-700",
    },

    rejected: {
      label: "Rejected",
      className:
        "bg-red-100 text-red-700",
    },

    blocked: {
      label: "Blocked",
      className:
        "bg-gray-200 text-gray-700",
    },

    draft: {
      label: "Draft",
      className:
        "bg-blue-100 text-blue-700",
    },
  };

  const config =
    statusConfig[status] ||
    {
      label: status || "Unknown",
      className:
        "bg-gray-100 text-gray-700",
    };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default ProductStatus;