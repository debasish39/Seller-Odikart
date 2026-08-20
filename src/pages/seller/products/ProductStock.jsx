import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import {
  getProduct,
  updateVariantStock,
} from "../../../services/productService";

import {
  ArrowLeft,
  Package,
  Save,
  Warehouse,
  AlertTriangle,
} from "lucide-react";

function ProductStock() {
  const { id } = useParams();

  const [product, setProduct] =
    useState(null);

  const [stocks, setStocks] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProduct(id);

        const currentProduct = data.product;

        setProduct(currentProduct);

        const initialStocks = {};

        currentProduct.variants?.forEach(
          (variant) => {
            initialStocks[variant.sku] =
              variant.stock;
          }
        );

        setStocks(initialStocks);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load stock"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleStockChange = (
    sku,
    value
  ) => {
    setStocks((previous) => ({
      ...previous,
      [sku]: value,
    }));
  };

  const handleSave = async (
    variant
  ) => {
    const stock = Number(
      stocks[variant.sku]
    );

    if (
      Number.isNaN(stock) ||
      stock < 0
    ) {
      toast.error(
        "Stock must be 0 or greater"
      );
      return;
    }

    try {
      setSaving(variant.sku);

      await updateVariantStock({
        productId: id,
        variantSku: variant.sku,
        stock,
      });

      toast.success(
        "Stock updated successfully"
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update stock"
      );
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-56 rounded bg-zinc-200" />
        <div className="h-96 rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
        Product not found.
      </div>
    );
  }

  const variants = product.variants || [];

  const totalStock = variants.reduce(
    (total, variant) =>
      total + Number(variant.stock || 0),
    0
  );

  const lowStockCount = variants.filter(
    (variant) =>
      Number(variant.stock) <= 5
  ).length;

  return (
    <div className="space-y-7">

      {/* Header */}
      <div
        data-aos="fade-up"
        className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <Link
            to={`/seller/products/${id}`}
            className="
              inline-flex items-center gap-2
              text-xs font-semibold
              text-zinc-400
              hover:text-black
            "
          >
            <ArrowLeft size={14} />
            Back to Product
          </Link>

          <h1 className="mt-4 text-3xl font-bold tracking-tight">
            Manage Stock
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            {product.title}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">

        <StockStat
          icon={Warehouse}
          label="Total Stock"
          value={totalStock}
        />

        <StockStat
          icon={Package}
          label="Variants"
          value={variants.length}
        />

        <StockStat
          icon={AlertTriangle}
          label="Low Stock"
          value={lowStockCount}
        />
      </div>

      {/* Table */}
      <div
        data-aos="fade-up"
        className="
          overflow-hidden
          rounded-2xl
          border border-zinc-200
          bg-white
          shadow-sm
        "
      >
        <div className="border-b border-zinc-200 p-5">
          <h2 className="text-sm font-bold">
            Inventory
          </h2>

          <p className="mt-1 text-xs text-zinc-400">
            Update stock for each product variant.
          </p>
        </div>

        {/* Mobile */}
        <div className="divide-y divide-zinc-100 md:hidden">
          {variants.map((variant) => (
            <div
              key={variant._id}
              className="p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs font-bold">
                    {variant.sku}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {variant.attributes &&
                      Object.entries(
                        variant.attributes
                      ).map(([key, value]) => (
                        <span
                          key={key}
                          className="rounded-md bg-zinc-100 px-2 py-1 text-[9px] text-zinc-600"
                        >
                          {key}: {value}
                        </span>
                      ))}
                  </div>
                </div>

                <span
                  className={`
                    text-sm font-bold
                    ${
                      Number(variant.stock) <= 5
                        ? "text-black"
                        : "text-zinc-600"
                    }
                  `}
                >
                  {variant.stock} units
                </span>
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={
                    stocks[variant.sku] ?? 0
                  }
                  onChange={(e) =>
                    handleStockChange(
                      variant.sku,
                      e.target.value
                    )
                  }
                  className="
                    h-10 flex-1
                    rounded-lg
                    border border-zinc-200
                    bg-zinc-50
                    px-3
                    text-sm
                    outline-none
                    focus:border-black
                    focus:bg-white
                  "
                />

                <button
                  onClick={() =>
                    handleSave(variant)
                  }
                  disabled={
                    saving === variant.sku
                  }
                  className="
                    flex h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-black
                    px-4
                    text-xs
                    font-semibold
                    text-white
                    disabled:opacity-50
                  "
                >
                  <Save size={14} />

                  {saving === variant.sku
                    ? "Saving"
                    : "Save"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[700px] text-left">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  SKU
                </th>

                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Variant
                </th>

                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Current
                </th>

                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  New Stock
                </th>

                <th className="px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {variants.map((variant) => (
                <tr
                  key={variant._id}
                  className="transition hover:bg-zinc-50"
                >
                  <td className="px-5 py-5 font-mono text-xs font-semibold">
                    {variant.sku}
                  </td>

                  <td className="px-5 py-5">
                    <div className="flex flex-wrap gap-1.5">
                      {variant.attributes &&
                        Object.entries(
                          variant.attributes
                        ).map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] text-zinc-600"
                          >
                            {key}: {value}
                          </span>
                        ))}
                    </div>
                  </td>

                  <td className="px-5 py-5">
                    <span className="font-bold text-zinc-900">
                      {variant.stock}
                    </span>
                  </td>

                  <td className="px-5 py-5">
                    <input
                      type="number"
                      min="0"
                      value={
                        stocks[variant.sku] ?? 0
                      }
                      onChange={(e) =>
                        handleStockChange(
                          variant.sku,
                          e.target.value
                        )
                      }
                      className="
                        h-10 w-28
                        rounded-lg
                        border border-zinc-200
                        bg-zinc-50
                        px-3
                        text-sm
                        outline-none
                        focus:border-black
                        focus:bg-white
                        focus:ring-4
                        focus:ring-black/5
                      "
                    />
                  </td>

                  <td className="px-5 py-5">
                    <button
                      onClick={() =>
                        handleSave(variant)
                      }
                      disabled={
                        saving === variant.sku
                      }
                      className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-lg
                        bg-black
                        px-4 py-2
                        text-xs
                        font-semibold
                        text-white
                        transition
                        hover:bg-zinc-800
                        disabled:opacity-50
                      "
                    >
                      <Save size={14} />

                      {saving === variant.sku
                        ? "Saving..."
                        : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StockStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div
      data-aos="fade-up"
      className="
        rounded-2xl
        border border-zinc-200
        bg-white
        p-5
        shadow-sm
      "
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
        <Icon size={18} />
      </div>

      <p className="mt-4 text-xs text-zinc-400">
        {label}
      </p>

      <p className="mt-1 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

export default ProductStock;