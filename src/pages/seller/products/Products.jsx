import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus,
  Search,
  Package,
  SlidersHorizontal,
  ArrowUpRight,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";

import ProductCard from "../../../components/seller/ProductCard";

import {
  getSellerProducts,
  deleteProduct,
  submitProduct,
} from "../../../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const loadProducts = async () => {
    try {
      setLoading(true);

      const data = await getSellerProducts();

      setProducts(data.products || []);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) return;

    try {
      await deleteProduct(productId);

      toast.success("Product deleted successfully");

      setProducts((previous) =>
        previous.filter(
          (product) => product._id !== productId
        )
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    }
  };

  const handleSubmit = async (productId) => {
    try {
      await submitProduct(productId);

      toast.success(
        "Product submitted for approval"
      );

      setProducts((previous) =>
        previous.map((product) =>
          product._id === productId
            ? {
                ...product,
                status: "pending",
              }
            : product
        )
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to submit product"
      );
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.title
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        status === "all" ||
        product.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [products, search, status]);

  const counts = {
    all: products.length,

    pending: products.filter(
      (p) => p.status === "pending"
    ).length,

    approved: products.filter(
      (p) => p.status === "approved"
    ).length,

    rejected: products.filter(
      (p) => p.status === "rejected"
    ).length,

    blocked: products.filter(
      (p) => p.status === "blocked"
    ).length,

    draft: products.filter(
      (p) => p.status === "draft"
    ).length,
  };

  const filters = [
    ["all", "All"],
    ["pending", "Pending"],
    ["approved", "Approved"],
    ["rejected", "Rejected"],
    ["blocked", "Blocked"],
    ["draft", "Draft"],
  ];

  if (loading) {
    return (
      <div className="min-h-[500px]">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded-lg bg-zinc-200" />

          <div className="h-4 w-72 rounded bg-zinc-100" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-28 rounded-2xl bg-zinc-100"
              />
            ))}
          </div>

          <div className="h-16 rounded-2xl bg-zinc-100" />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-80 rounded-2xl bg-zinc-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

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
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-400">
            <span>Seller Center</span>
            <span>/</span>
            <span className="text-zinc-700">
              Products
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
            Products
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Manage your catalog, inventory and product
            approvals.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadProducts}
            className="
              flex h-11 items-center justify-center
              rounded-xl border border-zinc-200
              bg-white px-3
              text-zinc-500
              transition
              hover:bg-zinc-50
              hover:text-black
            "
            title="Refresh"
          >
            <RefreshCw size={17} />
          </button>

          <Link
            to="/seller/products/add"
            className="
              flex h-11 items-center justify-center gap-2
              rounded-xl
              bg-black
              px-5
              text-sm font-semibold
              text-white
              shadow-lg shadow-black/10
              transition-all
              hover:-translate-y-0.5
              hover:bg-zinc-800
              active:translate-y-0
            "
          >
            <Plus size={17} />
            Add Product
          </Link>
        </div>
      </div>

      {/* =====================================================
          QUICK STATS
      ====================================================== */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {[
          {
            label: "Total Products",
            value: counts.all,
          },
          {
            label: "Pending Approval",
            value: counts.pending,
          },
          {
            label: "Approved",
            value: counts.approved,
          },
          {
            label: "Draft Products",
            value: counts.draft,
          },
        ].map((item, index) => (
          <div
            key={item.label}
            data-aos="fade-up"
            data-aos-delay={index * 70}
            className="
              group
              rounded-2xl
              border border-zinc-200
              bg-white
              p-5
              shadow-sm
              transition-all duration-300
              hover:-translate-y-1
              hover:shadow-lg
            "
          >
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                <Package size={18} />
              </div>

              <ArrowUpRight
                size={16}
                className="
                  text-zinc-300
                  transition
                  group-hover:text-black
                "
              />
            </div>

            <p className="mt-5 text-xs font-medium text-zinc-400">
              {item.label}
            </p>

            <p className="mt-1 text-2xl font-bold text-zinc-950">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* =====================================================
          FILTERS
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
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">

          {/* Search */}
          <div className="relative w-full lg:max-w-md">
            <Search
              size={17}
              className="
                absolute left-3.5 top-1/2
                -translate-y-1/2
                text-zinc-400
              "
            />

            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="
                h-11 w-full
                rounded-xl
                border border-zinc-200
                bg-zinc-50
                pl-10 pr-4
                text-sm
                text-zinc-900
                outline-none
                transition
                placeholder:text-zinc-400
                focus:border-black
                focus:bg-white
                focus:ring-4
                focus:ring-black/5
              "
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            <SlidersHorizontal
              size={16}
              className="shrink-0 text-zinc-400"
            />

            {filters.map(([value, label]) => (
              <button
                key={value}
                onClick={() => setStatus(value)}
                className={`
                  flex shrink-0 items-center gap-2
                  rounded-lg
                  px-3 py-2
                  text-xs font-semibold
                  transition

                  ${
                    status === value
                      ? "bg-black text-white"
                      : "text-zinc-500 hover:bg-zinc-100 hover:text-black"
                  }
                `}
              >
                {label}

                <span
                  className={`
                    rounded-full px-1.5 py-0.5 text-[9px]
                    ${
                      status === value
                        ? "bg-white/15 text-white"
                        : "bg-zinc-100 text-zinc-500"
                    }
                  `}
                >
                  {counts[value]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* =====================================================
          RESULTS
      ====================================================== */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">
            {filteredProducts.length} products
          </p>

          <p className="text-xs text-zinc-400">
            Showing matching products
          </p>
        </div>

        <button
          className="
            hidden items-center gap-2
            rounded-lg border border-zinc-200
            bg-white px-3 py-2
            text-xs font-medium text-zinc-500
            hover:bg-zinc-50
            sm:flex
          "
        >
          <MoreHorizontal size={15} />
          More
        </button>
      </div>

      {/* =====================================================
          PRODUCTS
      ====================================================== */}
      {filteredProducts.length === 0 ? (
        <div
          data-aos="fade-up"
          className="
            rounded-2xl
            border border-dashed border-zinc-300
            bg-white
            px-6 py-16
            text-center
          "
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400">
            <Package size={24} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-zinc-900">
            No products found
          </h2>

          <p className="mx-auto mt-2 max-w-sm text-sm text-zinc-400">
            Try changing your search or filter to find
            what you're looking for.
          </p>

          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-5 text-xs font-semibold text-black underline underline-offset-4"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <div
              key={product._id}
              data-aos="fade-up"
              data-aos-delay={(index % 4) * 70}
            >
              <ProductCard
                product={product}
                onDelete={handleDelete}
                onSubmit={handleSubmit}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;