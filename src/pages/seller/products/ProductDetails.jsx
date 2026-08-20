import { useEffect, useState } from "react";
import {
  Link,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Edit3,
  Package,
  Warehouse,
  Star,
  Tag,
  ShieldCheck,
  Truck,
  Layers3,
} from "lucide-react";

import {
  getProduct,
} from "../../../services/productService";

import ProductStatus from "../../../components/seller/ProductStatus";

function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProduct(id);

        setProduct(data.product);
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-64 rounded bg-zinc-200" />
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="h-[450px] rounded-2xl bg-zinc-100" />
          <div className="h-[450px] rounded-2xl bg-zinc-100" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center">
        <Package
          size={32}
          className="mx-auto text-zinc-300"
        />

        <h2 className="mt-4 font-bold">
          Product not found
        </h2>

        <Link
          to="/seller/products"
          className="mt-4 inline-block text-sm font-semibold underline"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const variants = product.variants || [];

  const totalStock = variants.reduce(
    (total, variant) =>
      total + Number(variant.stock || 0),
    0
  );

  const image =
    product.thumbnail ||
    product.images?.[0] ||
    "https://via.placeholder.com/600";

  return (
    <div className="space-y-7">

      {/* =====================================================
          HEADER
      ====================================================== */}
      <div
        data-aos="fade-up"
        className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <Link
            to="/seller/products"
            className="
              mb-4
              inline-flex items-center gap-2
              text-xs font-semibold
              text-zinc-400
              transition
              hover:text-black
            "
          >
            <ArrowLeft size={14} />
            Products
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
              {product.title}
            </h1>

            <ProductStatus
              status={product.status}
            />
          </div>

          <p className="mt-2 text-sm text-zinc-400">
            Product ID: {product._id}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to={`/seller/products/${id}/stock`}
            className="
              inline-flex items-center gap-2
              rounded-xl
              border border-zinc-200
              bg-white
              px-4 py-2.5
              text-sm font-semibold
              text-zinc-700
              transition
              hover:bg-zinc-50
            "
          >
            <Warehouse size={16} />
            Manage Stock
          </Link>

          <Link
            to={`/seller/products/${id}/edit`}
            className="
              inline-flex items-center gap-2
              rounded-xl
              bg-black
              px-4 py-2.5
              text-sm font-semibold
              text-white
              transition
              hover:bg-zinc-800
            "
          >
            <Edit3 size={16} />
            Edit Product
          </Link>
        </div>
      </div>

      {/* =====================================================
          PRODUCT HERO
      ====================================================== */}
      <div className="grid gap-6 lg:grid-cols-5">

        {/* Image */}
        <div
          data-aos="fade-right"
          className="
            overflow-hidden
            rounded-2xl
            border border-zinc-200
            bg-white
            p-3
            shadow-sm
            lg:col-span-3
          "
        >
          <div className="overflow-hidden rounded-xl bg-zinc-50">
            <img
              src={image}
              alt={product.title}
              className="
                h-[320px]
                w-full
                object-cover
                transition duration-500
                hover:scale-[1.02]
                sm:h-[420px]
              "
            />
          </div>
        </div>

        {/* Information */}
        <div
          data-aos="fade-left"
          className="
            rounded-2xl
            border border-zinc-200
            bg-white
            p-6
            shadow-sm
            lg:col-span-2
          "
        >
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">
              <Package size={17} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-zinc-900">
                Product Information
              </h2>

              <p className="text-[10px] text-zinc-400">
                Basic product details
              </p>
            </div>
          </div>

          <div className="mt-7 divide-y divide-zinc-100">

            <InfoRow
              label="Brand"
              value={product.brand || "-"}
            />

            <InfoRow
              label="Category"
              value={
                product.category?.name || "-"
              }
            />

            <InfoRow
              label="Material"
              value={
                product.material || "-"
              }
            />

            <InfoRow
              label="Total Stock"
              value={totalStock}
              strong
            />

            <InfoRow
              label="Rating"
              value={
                <span className="flex items-center gap-1">
                  <Star
                    size={14}
                    className="fill-black"
                  />
                  {product.rating || 0}
                </span>
              }
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          DESCRIPTION
      ====================================================== */}
      <div
        data-aos="fade-up"
        className="
          rounded-2xl
          border border-zinc-200
          bg-white
          p-6
          shadow-sm
        "
      >
        <h2 className="text-sm font-bold text-zinc-900">
          Description
        </h2>

        <p className="mt-4 max-w-4xl whitespace-pre-line text-sm leading-7 text-zinc-500">
          {product.description || "No description available."}
        </p>
      </div>

      {/* =====================================================
          VARIANTS
      ====================================================== */}
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
        <div className="flex items-center gap-3 border-b border-zinc-200 p-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
            <Layers3 size={17} />
          </div>

          <div>
            <h2 className="text-sm font-bold">
              Product Variants
            </h2>

            <p className="text-[10px] text-zinc-400">
              {variants.length} variants
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  SKU
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Attributes
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Price
                </th>

                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Stock
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-zinc-100">
              {variants.map((variant) => (
                <tr
                  key={variant._id}
                  className="transition hover:bg-zinc-50"
                >
                  <td className="px-5 py-4 font-mono text-xs font-semibold">
                    {variant.sku}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {variant.attributes &&
                        Object.entries(
                          variant.attributes
                        ).map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded-md bg-zinc-100 px-2 py-1 text-[10px] font-medium text-zinc-600"
                          >
                            {key}: {value}
                          </span>
                        ))}
                    </div>
                  </td>

                  <td className="px-5 py-4 font-semibold">
                    ₹{variant.price}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`
                        font-semibold
                        ${
                          Number(variant.stock) <= 5
                            ? "text-zinc-900"
                            : "text-zinc-600"
                        }
                      `}
                    >
                      {variant.stock}
                    </span>
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

function InfoRow({
  label,
  value,
  strong = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <span className="text-xs text-zinc-400">
        {label}
      </span>

      <span
        className={`text-right text-sm ${
          strong
            ? "font-bold text-zinc-950"
            : "font-medium text-zinc-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

export default ProductDetails;