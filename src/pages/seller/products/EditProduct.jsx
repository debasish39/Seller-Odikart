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
} from "lucide-react";

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

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    <div className="mx-auto max-w-4xl space-y-7">

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
          Update your product information and submit
          the changes for approval.
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

export default EditProduct;