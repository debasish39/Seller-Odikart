import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  getProduct,
  updateProduct,
} from "../../../services/productService";

import {
  ArrowLeft,
  FileText,
  Truck,
  ShieldCheck,
  Save,
  Package,
  ReceiptIndianRupee,
  Trash2,
  Plus,
} from "lucide-react";

function createEmptyVariant() {
  return {
    sku: "",
    barcode: "",
    price: "",
    compareAtPrice: "",
    costPrice: "",
    currency: "INR",
    tax: 0,
    stock: 0,
    reservedStock: 0,
    lowStockThreshold: 5,
    trackInventory: true,
    allowBackorder: false,
    isActive: true,
  };
}

function normalizeVariant(variant = {}) {
  return {
    ...createEmptyVariant(),
    ...variant,
    sku: variant.sku || "",
    barcode: variant.barcode || "",
    price:
      variant.price === null || variant.price === undefined
        ? ""
        : variant.price,
    compareAtPrice:
      variant.compareAtPrice === null ||
      variant.compareAtPrice === undefined
        ? ""
        : variant.compareAtPrice,
    costPrice:
      variant.costPrice === null ||
      variant.costPrice === undefined
        ? ""
        : variant.costPrice,
    currency: variant.currency || "INR",
    // Support existing data that may still use taxRate.
    tax:
      variant.tax !== undefined && variant.tax !== null
        ? Number(variant.tax)
        : Number(variant.taxRate || 0),
    stock:
      variant.stock === null || variant.stock === undefined
        ? 0
        : variant.stock,
    reservedStock:
      variant.reservedStock === null ||
      variant.reservedStock === undefined
        ? 0
        : variant.reservedStock,
    lowStockThreshold:
      variant.lowStockThreshold === null ||
      variant.lowStockThreshold === undefined
        ? 5
        : variant.lowStockThreshold,
    trackInventory: variant.trackInventory !== false,
    allowBackorder: Boolean(variant.allowBackorder),
    isActive: variant.isActive !== false,
  };
}

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    shortDescription: "",
    brand: "",
    material: "",
    warrantyInformation: "",
    returnPolicy: "",
    shippingInformation: "",
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 10,
  });

  const [variants, setVariants] =
    useState([]);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await getProduct(id);
        const product = data.product;

        setForm({
          title: product.title || "",
          description:
            product.description || "",
          shortDescription:
            product.shortDescription || "",
          brand: product.brand || "",
          material: product.material || "",
          warrantyInformation:
            product.warrantyInformation || "",
          returnPolicy:
            product.returnPolicy || "",
          shippingInformation:
            product.shippingInformation || "",
          minimumOrderQuantity:
            product.minimumOrderQuantity || 1,
          maximumOrderQuantity:
            product.maximumOrderQuantity || 10,
        });

        const loadedVariants = Array.isArray(product.variants)
          ? product.variants.map(normalizeVariant)
          : [];

        setVariants(
          loadedVariants.length
            ? loadedVariants
            : [createEmptyVariant()]
        );
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleVariantChange = (
    index,
    field,
    value
  ) => {
    setVariants((previous) => {
      const updated = [...previous];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });
  };

  const addVariant = () => {
    setVariants((previous) => [
      ...previous,
      createEmptyVariant(),
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) {
      toast.error("At least one variant is required");
      return;
    }

    setVariants((previous) =>
      previous.filter(
        (_, variantIndex) =>
          variantIndex !== index
      )
    );
  };

  const validateVariants = () => {
    if (!variants.length) {
      return "At least one variant is required";
    }

    const skuSet = new Set();

    for (let index = 0; index < variants.length; index += 1) {
      const variant = variants[index];

      if (!String(variant.sku || "").trim()) {
        return `Variant ${index + 1}: SKU is required`;
      }

      const sku = String(variant.sku)
        .trim()
        .toUpperCase();

      if (skuSet.has(sku)) {
        return `Duplicate SKU: ${sku}`;
      }

      skuSet.add(sku);

      if (
        variant.price === "" ||
        Number(variant.price) < 0 ||
        Number.isNaN(Number(variant.price))
      ) {
        return `Variant ${index + 1}: valid price is required`;
      }

      if (
        variant.stock === "" ||
        Number(variant.stock) < 0 ||
        Number.isNaN(Number(variant.stock))
      ) {
        return `Variant ${index + 1}: valid stock is required`;
      }

      const tax = Number(variant.tax);

      if (
        Number.isNaN(tax) ||
        tax < 0 ||
        tax > 100
      ) {
        return `Variant ${index + 1}: GST must be between 0% and 100%`;
      }
    }

    return null;
  };

  const buildVariants = () => {
    return variants.map((variant) => ({
      ...variant,
      sku: String(variant.sku || "")
        .trim()
        .toUpperCase(),
      barcode: String(variant.barcode || "").trim(),
      price: Number(variant.price),
      compareAtPrice:
        variant.compareAtPrice === ""
          ? 0
          : Number(variant.compareAtPrice),
      costPrice:
        variant.costPrice === ""
          ? 0
          : Number(variant.costPrice),
      currency: String(
        variant.currency || "INR"
      )
        .trim()
        .toUpperCase(),

      // GST / tax percentage.
      tax: Number(variant.tax || 0),

      stock: Number(variant.stock),
      reservedStock: Number(
        variant.reservedStock || 0
      ),
      lowStockThreshold: Number(
        variant.lowStockThreshold || 0
      ),
      trackInventory: Boolean(
        variant.trackInventory
      ),
      allowBackorder: Boolean(
        variant.allowBackorder
      ),
      isActive: variant.isActive !== false,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const variantError = validateVariants();

    if (variantError) {
      toast.error(variantError);
      return;
    }

    try {
      setSaving(true);

      await updateProduct(id, {
        ...form,
        minimumOrderQuantity: Number(
          form.minimumOrderQuantity
        ),
        maximumOrderQuantity: Number(
          form.maximumOrderQuantity
        ),

        // Send the complete edited variants,
        // including GST as `tax`.
        variants: buildVariants(),
      });

      toast.success(
        "Product updated and submitted for approval"
      );

      navigate(`/seller/products/${id}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update product"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl animate-pulse space-y-6">
        <div className="h-8 w-56 rounded bg-zinc-200" />

        <div className="h-[600px] rounded-2xl bg-zinc-100" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-7 overflow-y-hidden">

      {/* Header */}
      <div data-aos="fade-up">
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
          Edit Product
        </h1>

        <p className="mt-2 text-sm text-zinc-500">
          Update your product information, variants,
          GST and submit the changes for approval.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* =============================================
            BASIC INFORMATION
        ============================================== */}
        <FormSection
          icon={Package}
          title="Basic Information"
          description="General information about your product."
        >
          <div className="space-y-5">

            <InputField
              label="Product Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />

            <InputField
              label="Short Description"
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
            />

            <TextAreaField
              label="Description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              required
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <InputField
                label="Brand"
                name="brand"
                value={form.brand}
                onChange={handleChange}
              />

              <InputField
                label="Material"
                name="material"
                value={form.material}
                onChange={handleChange}
              />
            </div>
          </div>
        </FormSection>

        {/* =============================================
            VARIANTS + GST
        ============================================== */}
        <FormSection
          icon={ReceiptIndianRupee}
          title="Variants, Price & GST"
          description="Edit SKU, price, stock and GST for each product variant."
        >
          <div className="space-y-5">

            {variants.map((variant, index) => (
              <div
                key={`${variant.sku || "variant"}-${index}`}
                className="
                  rounded-2xl
                  border border-zinc-200
                  bg-zinc-50/70
                  p-4
                  sm:p-5
                "
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-400">
                      Variant {index + 1}
                    </p>

                    <h3 className="mt-1 font-bold text-zinc-900">
                      {variant.sku || "New Variant"}
                    </h3>
                  </div>

                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() =>
                        removeVariant(index)
                      }
                      className="
                        inline-flex items-center gap-2
                        rounded-xl border border-red-100
                        bg-white px-3 py-2
                        text-xs font-semibold
                        text-red-500
                        hover:bg-red-50
                      "
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  <InputField
                    label="SKU"
                    value={variant.sku}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "sku",
                        e.target.value.toUpperCase()
                      )
                    }
                    placeholder="SKU-001"
                    required
                  />

                  <InputField
                    label="Barcode"
                    value={variant.barcode}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "barcode",
                        e.target.value
                      )
                    }
                    placeholder="Optional barcode"
                  />

                  <InputField
                    type="number"
                    min="0"
                    step="0.01"
                    label="Selling Price"
                    value={variant.price}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "price",
                        e.target.value
                      )
                    }
                    placeholder="999"
                    required
                  />

                  <InputField
                    type="number"
                    min="0"
                    step="0.01"
                    label="Compare At Price"
                    value={variant.compareAtPrice}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "compareAtPrice",
                        e.target.value
                      )
                    }
                    placeholder="1299"
                  />

                  <InputField
                    type="number"
                    min="0"
                    step="0.01"
                    label="Cost Price"
                    value={variant.costPrice}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "costPrice",
                        e.target.value
                      )
                    }
                    placeholder="600"
                  />

                  <div>
                    <label className="mb-2 block text-xs font-bold text-zinc-700">
                      Currency
                    </label>

                    <select
                      value={variant.currency || "INR"}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "currency",
                          e.target.value
                        )
                      }
                      className="
                        h-11 w-full rounded-xl
                        border border-zinc-200
                        bg-zinc-50 px-4
                        text-sm text-zinc-900
                        outline-none transition
                        focus:border-black
                        focus:bg-white
                        focus:ring-4
                        focus:ring-black/5
                      "
                    >
                      <option value="INR">
                        INR — Indian Rupee
                      </option>
                      <option value="USD">
                        USD — US Dollar
                      </option>
                      <option value="EUR">
                        EUR — Euro
                      </option>
                      <option value="GBP">
                        GBP — Pound
                      </option>
                    </select>
                  </div>

                  {/* GST */}
                  <InputField
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    label="GST (%)"
                    value={variant.tax}
                    onChange={(e) => {
                      const value = e.target.value;

                      handleVariantChange(
                        index,
                        "tax",
                        value === ""
                          ? ""
                          : Math.min(
                              100,
                              Math.max(
                                0,
                                Number(value)
                              )
                            )
                      );
                    }}
                    placeholder="18"
                  />

                  <InputField
                    type="number"
                    min="0"
                    step="1"
                    label="Stock"
                    value={variant.stock}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "stock",
                        e.target.value
                      )
                    }
                    required
                  />

                  <InputField
                    type="number"
                    min="0"
                    step="1"
                    label="Reserved Stock"
                    value={variant.reservedStock}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "reservedStock",
                        e.target.value
                      )
                    }
                  />

                  <InputField
                    type="number"
                    min="0"
                    step="1"
                    label="Low Stock Threshold"
                    value={variant.lowStockThreshold}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "lowStockThreshold",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* GST preview */}
                <div className="mt-5 rounded-xl border border-zinc-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-zinc-700">
                        GST Preview
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        GST is stored as a percentage in the variant.
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-zinc-900">
                        {Number(variant.tax || 0)}%
                      </p>

                      {variant.price !== "" && (
                        <p className="text-xs text-zinc-500">
                          GST amount:{" "}
                          {(
                            Number(variant.price || 0) *
                            Number(variant.tax || 0) /
                            100
                          ).toFixed(2)}{" "}
                          {variant.currency || "INR"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <CheckboxField
                    label="Track inventory"
                    checked={variant.trackInventory}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "trackInventory",
                        e.target.checked
                      )
                    }
                  />

                  <CheckboxField
                    label="Allow backorders"
                    checked={variant.allowBackorder}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "allowBackorder",
                        e.target.checked
                      )
                    }
                  />

                  <CheckboxField
                    label="Active variant"
                    checked={variant.isActive}
                    onChange={(e) =>
                      handleVariantChange(
                        index,
                        "isActive",
                        e.target.checked
                      )
                    }
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addVariant}
              className="
                inline-flex items-center gap-2
                rounded-xl border border-zinc-200
                bg-white px-4 py-3
                text-sm font-semibold text-zinc-800
                hover:bg-zinc-50
              "
            >
              <Plus size={16} />
              Add Variant
            </button>
          </div>
        </FormSection>

        {/* =============================================
            POLICIES
        ============================================== */}
        <FormSection
          icon={ShieldCheck}
          title="Policies & Warranty"
          description="Help customers understand your product policies."
        >
          <div className="space-y-5">

            <TextAreaField
              label="Warranty Information"
              name="warrantyInformation"
              value={form.warrantyInformation}
              onChange={handleChange}
              rows={4}
            />

            <TextAreaField
              label="Return Policy"
              name="returnPolicy"
              value={form.returnPolicy}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </FormSection>

        {/* =============================================
            SHIPPING
        ============================================== */}
        <FormSection
          icon={Truck}
          title="Shipping Information"
          description="Provide shipping details for customers."
        >
          <TextAreaField
            label="Shipping Information"
            name="shippingInformation"
            value={form.shippingInformation}
            onChange={handleChange}
            rows={4}
          />
        </FormSection>

        {/* =============================================
            ORDER LIMITS
        ============================================== */}
        <FormSection
          icon={FileText}
          title="Order Limits"
          description="Define quantity limits for customer orders."
        >
          <div className="grid gap-5 sm:grid-cols-2">

            <InputField
              type="number"
              min="1"
              label="Minimum Order Quantity"
              name="minimumOrderQuantity"
              value={form.minimumOrderQuantity}
              onChange={handleChange}
            />

            <InputField
              type="number"
              min="1"
              label="Maximum Order Quantity"
              name="maximumOrderQuantity"
              value={form.maximumOrderQuantity}
              onChange={handleChange}
            />
          </div>
        </FormSection>

        {/* Submit */}
        <div
          data-aos="fade-up"
          className="
            sticky bottom-4
            rounded-2xl
            border border-zinc-200
            bg-white/95
            p-3
            shadow-xl
            backdrop-blur
          "
        >
          <button
            type="submit"
            disabled={saving}
            className="
              flex h-12 w-full
              items-center justify-center
              gap-2
              rounded-xl
              bg-black
              text-sm font-semibold
              text-white
              transition
              hover:bg-zinc-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Save size={17} />

            {saving
              ? "Saving changes..."
              : "Save & Submit for Approval"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* =========================================================
   REUSABLE FORM COMPONENTS
========================================================= */

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}) {
  return (
    <section
      data-aos="fade-up"
      className="
        overflow-hidden
        rounded-2xl
        border border-zinc-200
        bg-white
        shadow-sm
      "
    >
      <div className="flex items-start gap-3 border-b border-zinc-100 p-5 sm:p-6">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-white">
          <Icon size={16} />
        </div>

        <div>
          <h2 className="text-sm font-bold text-zinc-900">
            {title}
          </h2>

          <p className="mt-1 text-xs text-zinc-400">
            {description}
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function InputField({
  label,
  ...props
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-zinc-700">
        {label}

        {props.required && (
          <span className="ml-1 text-zinc-400">
            *
          </span>
        )}
      </label>

      <input
        {...props}
        className="
          h-11 w-full
          rounded-xl
          border border-zinc-200
          bg-zinc-50
          px-4
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
  );
}

function TextAreaField({
  label,
  ...props
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold text-zinc-700">
        {label}

        {props.required && (
          <span className="ml-1 text-zinc-400">
            *
          </span>
        )}
      </label>

      <textarea
        {...props}
        className="
          w-full
          resize-y
          rounded-xl
          border border-zinc-200
          bg-zinc-50
          px-4 py-3
          text-sm
          leading-6
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
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}) {
  return (
    <label
      className="
        inline-flex cursor-pointer
        items-center gap-3
        rounded-xl
        border border-zinc-200
        bg-white
        px-4 py-3
        text-sm
        font-medium
      "
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-black"
      />

      {label}
    </label>
  );
}

export default EditProduct;
