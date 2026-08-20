import { Link } from "react-router-dom";
import {
  Package,
  Layers3,
  MessageSquare,
  Warehouse,
  ArrowUpRight,
} from "lucide-react";

import ProductStatus from "./ProductStatus";
import ProductAction from "./ProductAction";

function ProductCard({
  product,
  onDelete,
  onSubmit,
}) {
  const variants = product.variants || [];

  const totalStock = variants.reduce(
    (total, variant) =>
      total + Number(variant.stock || 0),
    0
  );

  const firstVariant = variants[0];

  const price =
    firstVariant?.price || 0;

 const image =
  product.media?.thumbnail ||
  product.media?.images?.[0] ||
  firstVariant?.images?.[0] ||
  "https://via.placeholder.com/600";
  return (
    <article
      className="
        group
        overflow-hidden
        rounded-2xl
        border border-zinc-200
        bg-white
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-zinc-300
        hover:shadow-xl
        hover:shadow-black/[0.06]
      "
    >

      {/* ==================================================
          IMAGE
      =================================================== */}
      <div className="relative overflow-hidden bg-zinc-100">

        <Link
          to={`/seller/products/${product._id}`}
          className="block"
        >
          <img
            src={image}
            alt={product.title}
            className="
              h-52
              w-full
              object-cover
              transition-transform
              duration-500
              ease-out
              group-hover:scale-[1.04]
            "
          />
        </Link>

        {/* Image overlay */}
        <div
          className="
            pointer-events-none
            absolute inset-x-0 bottom-0
            h-20
            bg-gradient-to-t
            from-black/20
            to-transparent
            opacity-0
            transition-opacity
            duration-300
            group-hover:opacity-100
          "
        />

        {/* Status */}
        <div className="absolute left-3 top-3">
          <ProductStatus
            status={product.status}
          />
        </div>

        {/* Quick view */}
        <Link
          to={`/seller/products/${product._id}`}
          className="
            absolute
            right-3
            top-3
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            bg-white/95
            text-zinc-700
            opacity-0
            shadow-lg
            backdrop-blur
            transition-all
            duration-300
            hover:bg-black
            hover:text-white
            group-hover:opacity-100
          "
          title="View product"
        >
          <ArrowUpRight size={16} />
        </Link>
      </div>

      {/* ==================================================
          CONTENT
      =================================================== */}
      <div className="p-4">

        {/* Title */}
        <div className="min-h-[72px]">

          <div className="flex items-start justify-between gap-3">
            <Link
              to={`/seller/products/${product._id}`}
              className="
                line-clamp-2
                text-[15px]
                font-bold
                leading-5
                tracking-tight
                text-zinc-950
                transition
                hover:text-zinc-600
              "
            >
              {product.title}
            </Link>
          </div>

          <p className="
            mt-2
            line-clamp-2
            text-[11px]
            leading-5
            text-zinc-400
          ">
            {product.shortDescription ||
              product.description ||
              "No product description available."}
          </p>
        </div>

        {/* ==================================================
            PRICE
        =================================================== */}
        <div
          className="
            mt-4
            flex
            items-end
            justify-between
            border-b
            border-zinc-100
            pb-4
          "
        >
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-wider text-zinc-400">
              Starting price
            </p>

            <p className="mt-1 text-xl font-bold tracking-tight text-zinc-950">
              ₹{price}
            </p>
          </div>

          <span className="text-[9px] text-zinc-400">
            / variant
          </span>
        </div>

        {/* ==================================================
            METRICS
        =================================================== */}
        <div className="grid grid-cols-3 divide-x divide-zinc-100 py-4">

          {/* Stock */}
          <Metric
            icon={Warehouse}
            label="Stock"
            value={totalStock}
            warning={totalStock <= 5}
          />

          {/* Variants */}
          <Metric
            icon={Layers3}
            label="Variants"
            value={variants.length}
          />

          {/* Reviews */}
          <Metric
            icon={MessageSquare}
            label="Reviews"
            value={product.numReviews || 0}
          />
        </div>

        {/* ==================================================
            ACTIONS
        =================================================== */}
        <ProductAction
          product={product}
          onDelete={onDelete}
          onSubmit={onSubmit}
        />
      </div>
    </article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  warning = false,
}) {
  return (
    <div className="flex flex-col items-center px-2 text-center first:pl-0 last:pr-0">

      <div className="flex items-center gap-1.5">
        <Icon
          size={12}
          className={
            warning
              ? "text-black"
              : "text-zinc-400"
          }
        />

        <span
          className={`
            text-xs font-bold
            ${
              warning
                ? "text-black"
                : "text-zinc-800"
            }
          `}
        >
          {value}
        </span>
      </div>

      <span className="mt-1 text-[9px] text-zinc-400">
        {label}
      </span>
    </div>
  );
}

export default ProductCard;