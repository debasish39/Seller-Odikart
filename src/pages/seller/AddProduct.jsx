
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ImagePlus,
  Package,
  Plus,
  Save,
  Search,
  Settings2,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  Upload,
  Video,
  X,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

import { createProduct } from "../../services/productService";
import {
  getCategories,
  getSubCategories,
} from "../../services/categoryService";

const inputClass = `
  w-full rounded-xl border border-zinc-200 bg-zinc-50
  px-4 py-3 text-sm text-zinc-900 outline-none
  transition-all duration-200
  placeholder:text-zinc-400
  hover:border-zinc-300
  focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5
`;

const textareaClass = `${inputClass} min-h-[120px] resize-y`;

const cardClass = `
  rounded-3xl border border-zinc-200 bg-white
  p-5 shadow-sm transition-all duration-300
  sm:p-7
`;

const AddProduct = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    shortDescription: "",
    category: "",
    subCategory: "",
    tags: [],
    brand: "",
    productType: "simple",
    currency: "INR",
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 10,
    material: "",
    warrantyInformation: "",
    returnPolicy: "",
    shippingInformation: "",
    shipping: {
      freeShipping: false,
      processingTime: 2,
      returnDays: 7,
    },
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: [],
    },
    offer: {
      discountPercentage: 0,
    },
  });

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [subCategoryLoading, setSubCategoryLoading] = useState(false);

  const [variants, setVariants] = useState([
    {
      sku: "",
      attributes: { size: "", color: "" },
      price: "",
      originalPrice: "",
      stock: "",
      barcode: "",
      weight: "",
      isActive: true,
    },
  ]);

  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    AOS.init({
      duration: 650,
      easing: "ease-out-cubic",
      once: true,
      offset: 40,
    });

    const loadCategories = async () => {
      try {
        setCategoryLoading(true);
        const data = await getCategories();

        if (data.success) {
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Get Categories Error:", error);
        setError(
          error.response?.data?.message ||
            "Failed to load categories"
        );
      } finally {
        setCategoryLoading(false);
      }
    };

    loadCategories();
  }, []);

  const parentCategories = categories.filter(
    (category) => !category.parentCategory
  );

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;

    setForm((prev) => ({
      ...prev,
      category: categoryId,
      subCategory: "",
    }));

    setSubCategories([]);

    if (!categoryId) return;

    try {
      setSubCategoryLoading(true);
      setError("");

      const data = await getSubCategories(categoryId);

      if (data.success) {
        setSubCategories(data.subCategories || []);
      }
    } catch (error) {
      console.error("Get Subcategories Error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to load subcategories"
      );
    } finally {
      setSubCategoryLoading(false);
    }
  };

  const handleSubCategoryChange = (e) => {
    setForm((prev) => ({
      ...prev,
      subCategory: e.target.value,
    }));
  };

  const handleShippingChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      shipping: {
        ...prev.shipping,
        [name]:
          type === "checkbox" ? checked : Number(value),
      },
    }));
  };

  const handleSEOChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [name]: value,
      },
    }));
  };

  const handleOfferChange = (e) => {
    setForm((prev) => ({
      ...prev,
      offer: {
        ...prev.offer,
        discountPercentage: Number(e.target.value),
      },
    }));
  };

  const handleVariantChange = (index, field, value) => {
    setVariants((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });
  };

  const handleAttributeChange = (
    index,
    attribute,
    value
  ) => {
    setVariants((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        attributes: {
          ...updated[index].attributes,
          [attribute]: value,
        },
      };

      return updated;
    });
  };

  const createEmptyVariant = () => ({
    sku: "",
    attributes: { size: "", color: "" },
    price: "",
    originalPrice: "",
    stock: "",
    barcode: "",
    weight: "",
    isActive: true,
  });

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      createEmptyVariant(),
    ]);
  };

  const removeVariant = (index) => {
    if (variants.length === 1) return;

    setVariants((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files || []));
  };

  const handleVideoChange = (e) => {
    setVideos(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Product title is required");
      return;
    }

    if (!form.description.trim()) {
      setError("Product description is required");
      return;
    }

    if (!form.category) {
      setError("Category is required");
      return;
    }

    if (
      subCategories.length > 0 &&
      !form.subCategory
    ) {
      setError("Subcategory is required");
      return;
    }

    if (variants.length === 0) {
      setError("At least one variant is required");
      return;
    }

    for (const variant of variants) {
      if (!variant.sku.trim()) {
        setError("Every variant needs a SKU");
        return;
      }

      if (
        variant.price === "" ||
        Number(variant.price) <= 0
      ) {
        setError("Every variant needs a valid price");
        return;
      }

      if (
        variant.stock === "" ||
        Number(variant.stock) < 0
      ) {
        setError("Every variant needs valid stock");
        return;
      }
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append(
        "shortDescription",
        form.shortDescription
      );
      formData.append("category", form.category);

      if (form.subCategory) {
        formData.append(
          "subCategory",
          form.subCategory
        );
      }

      formData.append("brand", form.brand);
      formData.append("productType", form.productType);
      formData.append("currency", form.currency);
      formData.append(
        "minimumOrderQuantity",
        form.minimumOrderQuantity
      );
      formData.append(
        "maximumOrderQuantity",
        form.maximumOrderQuantity
      );

      formData.append("material", form.material);
      formData.append(
        "warrantyInformation",
        form.warrantyInformation
      );
      formData.append(
        "returnPolicy",
        form.returnPolicy
      );
      formData.append(
        "shippingInformation",
        form.shippingInformation
      );

      formData.append(
        "tags",
        JSON.stringify(form.tags)
      );

      formData.append(
        "variants",
        JSON.stringify(
          variants.map((variant) => ({
            ...variant,
            price: Number(variant.price),
            originalPrice: Number(
              variant.originalPrice || 0
            ),
            stock: Number(variant.stock),
            weight: Number(variant.weight || 0),
          }))
        )
      );

      formData.append(
        "shipping",
        JSON.stringify(form.shipping)
      );

      formData.append("seo", JSON.stringify(form.seo));
      formData.append(
        "offer",
        JSON.stringify(form.offer)
      );

      images.forEach((file) => {
        formData.append("images", file);
      });

      videos.forEach((file) => {
        formData.append("videos", file);
      });

      await createProduct(formData);

      setSuccess("Product submitted successfully!");

      setTimeout(() => {
        navigate("/seller/products");
      }, 1000);
} catch (err) {

  console.error(
    "================================="
  );

  console.error(
    "🔥 CREATE PRODUCT FRONTEND ERROR"
  );

  console.error(
    "Message:",
    err?.message
  );

  console.error(
    "Status:",
    err?.response?.status
  );

  console.error(
    "Response data:",
    err?.response?.data
  );

  console.error(
    "Response headers:",
    err?.response?.headers
  );

  console.error(
    "Request URL:",
    err?.config?.url
  );

  console.error(
    "Request method:",
    err?.config?.method
  );

  console.error(
    "================================="
  );


  const backendMessage =
    err?.response?.data?.message;


  setError(
    backendMessage ||
    err?.message ||
    "Failed to create product"
  );

} finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: "basic", label: "Basic Info" },
    { id: "category", label: "Category" },
    { id: "variants", label: "Variants" },
    { id: "shipping", label: "Shipping" },
    { id: "details", label: "Details" },
    { id: "media", label: "Media" },
    { id: "seo", label: "SEO & Offer" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                navigate("/seller/products")
              }
              className="
                flex h-10 w-10 shrink-0 items-center
                justify-center rounded-xl border
                border-zinc-200 bg-white
                text-zinc-600 transition hover:bg-zinc-50
                hover:text-black
              "
            >
              <ArrowLeft size={17} />
            </button>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                Seller Center
              </p>

              <h1 className="truncate text-lg font-bold tracking-tight sm:text-xl">
                Add Product
              </h1>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black text-white">
              <ShoppingBag size={16} />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          {/* Progress */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
                Product setup
              </p>

              <nav className="mt-5 space-y-1">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-500 transition hover:bg-zinc-50 hover:text-black"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-zinc-200 text-[9px] font-bold group-hover:border-black group-hover:bg-black group-hover:text-white">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    {section.label}
                  </a>
                ))}
              </nav>

              <div className="mt-6 rounded-2xl bg-black p-4 text-white">
                <p className="text-xs font-bold">
                  Complete your listing
                </p>

                <p className="mt-1 text-[10px] leading-4 text-zinc-400">
                  Add clear information and high-quality
                  media to improve your product listing.
                </p>
              </div>
            </div>
          </aside>

          <main className="min-w-0">
            <div className="mb-6" data-aos="fade-up">
              <p className="text-sm text-zinc-500">
                Create a polished product listing for
                your store.
              </p>
            </div>

            {error && (
              <div
                data-aos="fade-down"
                className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <X size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div
                data-aos="fade-down"
                className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700"
              >
                <Check size={18} />
                {success}
              </div>
            )}

            <form
              id="add-product-form"
              onSubmit={handleSubmit}
              className="space-y-6 pb-28"
            >
              {/* Basic */}
              <section
                id="basic"
                data-aos="fade-up"
                className={cardClass}
              >
                <SectionHeader
                  number="01"
                  icon={Package}
                  title="Basic Information"
                  description="Tell customers what your product is."
                />

                <div className="space-y-5">
                  <Field label="Product Title" required>
                    <input
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      placeholder="e.g. Premium Cotton T-Shirt"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Short Description">
                    <textarea
                      name="shortDescription"
                      value={form.shortDescription}
                      onChange={handleChange}
                      placeholder="A short summary of the product..."
                      rows={3}
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Full Description"
                    required
                  >
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      placeholder="Describe features, materials, usage and benefits..."
                      rows={6}
                      className={textareaClass}
                    />
                  </Field>
                </div>
              </section>

              {/* Category */}
              <section
                id="category"
                data-aos="fade-up"
                className={cardClass}
              >
                <SectionHeader
                  number="02"
                  icon={Tag}
                  title="Category & Type"
                  description="Organize your product so customers can find it."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Category" required>
                    <SelectField
                      value={form.category}
                      onChange={handleCategoryChange}
                      disabled={categoryLoading}
                      options={parentCategories}
                      loading={categoryLoading}
                      placeholder="Select category"
                    />
                  </Field>

                  <Field label="Subcategory">
                    <SelectField
                      value={form.subCategory}
                      onChange={handleSubCategoryChange}
                      disabled={
                        !form.category ||
                        subCategoryLoading
                      }
                      options={subCategories}
                      loading={subCategoryLoading}
                      placeholder={
                        !form.category
                          ? "Select category first"
                          : subCategories.length === 0
                          ? "No subcategories available"
                          : "Select subcategory"
                      }
                    />
                  </Field>

                  <Field label="Brand">
                    <input
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      placeholder="e.g. Nike"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Product Type">
                    <SelectBasic
                      name="productType"
                      value={form.productType}
                      onChange={handleChange}
                      options={[
                        ["simple", "Simple Product"],
                        [
                          "variable",
                          "Variable Product",
                        ],
                      ]}
                    />
                  </Field>
                </div>
              </section>

              {/* Variants */}
              <section
                id="variants"
                data-aos="fade-up"
                className={cardClass}
              >
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                  <SectionHeader
                    number="03"
                    icon={Settings2}
                    title="Product Variants"
                    description="Configure SKU, pricing, inventory and attributes."
                  />

                  <button
                    type="button"
                    onClick={addVariant}
                    className="
                      inline-flex shrink-0 items-center
                      justify-center gap-2 rounded-xl
                      bg-black px-4 py-3 text-xs
                      font-bold text-white
                      transition hover:bg-zinc-800
                      active:scale-[0.98]
                    "
                  >
                    <Plus size={15} />
                    Add Variant
                  </button>
                </div>

                <div className="space-y-4">
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      data-aos="fade-up"
                      data-aos-delay={
                        (index % 4) * 60
                      }
                      className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4 sm:p-5"
                    >
                      <div className="mb-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-[10px] font-bold text-white">
                            {String(index + 1).padStart(
                              2,
                              "0"
                            )}
                          </span>

                          <div>
                            <h3 className="text-sm font-bold">
                              Variant {index + 1}
                            </h3>

                            <p className="text-[10px] text-zinc-400">
                              SKU & inventory details
                            </p>
                          </div>
                        </div>

                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeVariant(index)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] font-semibold text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={13} />
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="SKU" required>
                          <input
                            value={variant.sku}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "sku",
                                e.target.value
                              )
                            }
                            placeholder="SKU-001"
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Barcode">
                          <input
                            value={variant.barcode}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "barcode",
                                e.target.value
                              )
                            }
                            placeholder="Barcode"
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Size">
                          <input
                            value={
                              variant.attributes.size
                            }
                            onChange={(e) =>
                              handleAttributeChange(
                                index,
                                "size",
                                e.target.value
                              )
                            }
                            placeholder="S, M, L, 32GB..."
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Color">
                          <input
                            value={
                              variant.attributes.color
                            }
                            onChange={(e) =>
                              handleAttributeChange(
                                index,
                                "color",
                                e.target.value
                              )
                            }
                            placeholder="Black, White..."
                            className={inputClass}
                          />
                        </Field>

                        <Field
                          label="Selling Price"
                          required
                        >
                          <InputWithPrefix prefix="₹">
                            <input
                              type="number"
                              min="0"
                              value={variant.price}
                              onChange={(e) =>
                                handleVariantChange(
                                  index,
                                  "price",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                            />
                          </InputWithPrefix>
                        </Field>

                        <Field label="Original Price">
                          <InputWithPrefix prefix="₹">
                            <input
                              type="number"
                              min="0"
                              value={
                                variant.originalPrice
                              }
                              onChange={(e) =>
                                handleVariantChange(
                                  index,
                                  "originalPrice",
                                  e.target.value
                                )
                              }
                              placeholder="0.00"
                              className="w-full bg-transparent px-3 py-3 text-sm outline-none"
                            />
                          </InputWithPrefix>
                        </Field>

                        <Field
                          label="Stock"
                          required
                        >
                          <input
                            type="number"
                            min="0"
                            value={variant.stock}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "stock",
                                e.target.value
                              )
                            }
                            placeholder="0"
                            className={inputClass}
                          />
                        </Field>

                        <Field label="Weight (kg)">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={variant.weight}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "weight",
                                e.target.value
                              )
                            }
                            placeholder="0.00"
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Shipping */}
              <section
                id="shipping"
                data-aos="fade-up"
                className={cardClass}
              >
                <SectionHeader
                  number="04"
                  icon={Truck}
                  title="Shipping"
                  description="Set delivery and return preferences."
                />

                <div className="space-y-5">
                  <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 transition hover:bg-white">
                    <div>
                      <p className="text-sm font-bold">
                        Free Shipping
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-400">
                        Offer free shipping to customers.
                      </p>
                    </div>

                    <span
                      className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                        form.shipping.freeShipping
                          ? "bg-black"
                          : "bg-zinc-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        name="freeShipping"
                        checked={
                          form.shipping.freeShipping
                        }
                        onChange={
                          handleShippingChange
                        }
                        className="sr-only"
                      />

                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                          form.shipping.freeShipping
                            ? "left-6"
                            : "left-1"
                        }`}
                      />
                    </span>
                  </label>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Processing Time (days)">
                      <input
                        type="number"
                        min="0"
                        name="processingTime"
                        value={
                          form.shipping.processingTime
                        }
                        onChange={
                          handleShippingChange
                        }
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Return Period (days)">
                      <input
                        type="number"
                        min="0"
                        name="returnDays"
                        value={
                          form.shipping.returnDays
                        }
                        onChange={
                          handleShippingChange
                        }
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              </section>

              {/* Details */}
              <section
                id="details"
                data-aos="fade-up"
                className={cardClass}
              >
                <SectionHeader
                  number="05"
                  icon={Package}
                  title="Product Details"
                  description="Add the information customers need before buying."
                />

                <div className="grid gap-5">
                  <Field label="Material">
                    <input
                      name="material"
                      value={form.material}
                      onChange={handleChange}
                      placeholder="e.g. 100% Cotton"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Warranty Information">
                    <textarea
                      name="warrantyInformation"
                      value={
                        form.warrantyInformation
                      }
                      onChange={handleChange}
                      placeholder="Warranty details..."
                      rows={3}
                      className={textareaClass}
                    />
                  </Field>

                  <Field label="Return Policy">
                    <textarea
                      name="returnPolicy"
                      value={form.returnPolicy}
                      onChange={handleChange}
                      placeholder="Return policy..."
                      rows={3}
                      className={textareaClass}
                    />
                  </Field>

                  <Field label="Shipping Information">
                    <textarea
                      name="shippingInformation"
                      value={
                        form.shippingInformation
                      }
                      onChange={handleChange}
                      placeholder="Shipping information..."
                      rows={3}
                      className={textareaClass}
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Minimum Order Quantity">
                      <input
                        type="number"
                        min="1"
                        name="minimumOrderQuantity"
                        value={
                          form.minimumOrderQuantity
                        }
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </Field>

                    <Field label="Maximum Order Quantity">
                      <input
                        type="number"
                        min="1"
                        name="maximumOrderQuantity"
                        value={
                          form.maximumOrderQuantity
                        }
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </Field>
                  </div>
                </div>
              </section>

              {/* Media */}
              <section
                id="media"
                data-aos="fade-up"
                className={cardClass}
              >
                <SectionHeader
                  number="06"
                  icon={ImagePlus}
                  title="Product Media"
                  description="Upload high-quality product images and videos."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <UploadBox
                    icon={ImagePlus}
                    title="Product Images"
                    description="PNG, JPG or WEBP"
                    files={images}
                    accept="image/*"
                    onChange={handleImageChange}
                  />

                  <UploadBox
                    icon={Video}
                    title="Product Videos"
                    description="MP4 and supported video formats"
                    files={videos}
                    accept="video/*"
                    onChange={handleVideoChange}
                  />
                </div>
              </section>

              {/* SEO + Offer */}
              <section
                id="seo"
                data-aos="fade-up"
                className={cardClass}
              >
                <SectionHeader
                  number="07"
                  icon={Search}
                  title="SEO & Offer"
                  description="Improve discoverability and add a promotional discount."
                />

                <div className="space-y-5">
                  <Field label="Meta Title">
                    <input
                      name="metaTitle"
                      value={form.seo.metaTitle}
                      onChange={handleSEOChange}
                      placeholder="SEO title"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Meta Description">
                    <textarea
                      name="metaDescription"
                      value={
                        form.seo.metaDescription
                      }
                      onChange={handleSEOChange}
                      placeholder="SEO description..."
                      rows={4}
                      className={textareaClass}
                    />
                  </Field>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div className="mb-4 flex items-center gap-2">
                      <Tag size={15} />
                      <p className="text-sm font-bold">
                        Promotional Offer
                      </p>
                    </div>

                    <Field label="Discount Percentage">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={
                            form.offer
                              .discountPercentage
                          }
                          onChange={
                            handleOfferChange
                          }
                          placeholder="0"
                          className={`${inputClass} pr-10`}
                        />

                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
                          %
                        </span>
                      </div>
                    </Field>
                  </div>
                </div>
              </section>
            </form>
          </main>
        </div>
      </div>

      {/* Sticky submit bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] backdrop-blur-xl sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="hidden sm:block">
            <p className="text-xs font-bold">
              Ready to publish?
            </p>
            <p className="text-[10px] text-zinc-400">
              Your product will be submitted for approval.
            </p>
          </div>

          <div className="ml-auto flex w-full gap-2 sm:w-auto">
            <button
              type="button"
              onClick={() =>
                navigate("/seller/products")
              }
              className="
                flex-1 rounded-xl border
                border-zinc-200 bg-white
                px-5 py-3 text-xs font-bold
                text-zinc-600 transition
                hover:bg-zinc-50 hover:text-black
                sm:flex-none
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              form="add-product-form"
              disabled={loading}
              className="
                flex flex-1 items-center
                justify-center gap-2 rounded-xl
                bg-black px-5 py-3 text-xs
                font-bold text-white
                shadow-lg shadow-black/10
                transition hover:bg-zinc-800
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:opacity-50
                sm:flex-none
              "
            >
              <Save size={15} />

              {loading
                ? "Submitting..."
                : "Submit Product"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function SectionHeader({
  number,
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="mb-6 flex items-start gap-3 sm:gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white shadow-lg shadow-black/10">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold tracking-[0.15em] text-zinc-400">
            {number}
          </span>

          <h2 className="text-lg font-bold tracking-tight">
            {title}
          </h2>
        </div>

        <p className="mt-1 text-xs leading-5 text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}) {
  return (
    <div>
      <label className="mb-2 block text-[11px] font-bold text-zinc-700">
        {label}

        {required && (
          <span className="ml-1 text-zinc-400">
            *
          </span>
        )}
      </label>

      {children}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  disabled,
  options,
  loading,
  placeholder,
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${inputClass} appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <option value="">
          {loading
            ? "Loading..."
            : placeholder}
        </option>

        {options.map((item) => (
          <option
            key={item._id}
            value={item._id}
          >
            {item.name}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
      />
    </div>
  );
}

function SelectBasic({
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`${inputClass} appearance-none pr-10`}
      >
        {options.map(([optionValue, label]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
      />
    </div>
  );
}

function InputWithPrefix({
  prefix,
  children,
}) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 transition focus-within:border-black focus-within:bg-white focus-within:ring-4 focus-within:ring-black/5">
      <span className="flex items-center border-r border-zinc-200 px-3 text-sm font-bold text-zinc-500">
        {prefix}
      </span>

      {children}
    </div>
  );
}

function UploadBox({
  icon: Icon,
  title,
  description,
  files,
  accept,
  onChange,
}) {
  return (
    <label className="group relative flex min-h-[190px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-center transition-all duration-300 hover:border-black hover:bg-white">
      <input
        type="file"
        multiple
        accept={accept}
        onChange={onChange}
        className="sr-only"
      />

      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200 transition group-hover:bg-black group-hover:text-white">
        {files.length > 0 ? (
          <Check size={20} />
        ) : (
          <Icon size={20} />
        )}
      </div>

      <p className="mt-4 text-sm font-bold">
        {files.length > 0
          ? `${files.length} file${
              files.length > 1 ? "s" : ""
            } selected`
          : title}
      </p>

      <p className="mt-1 text-[10px] text-zinc-400">
        {files.length > 0
          ? "Click to replace files"
          : description}
      </p>

      <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[10px] font-bold text-zinc-600 transition group-hover:border-black group-hover:text-black">
        <Upload size={12} />
        Choose files
      </span>
    </label>
  );
}

export default AddProduct;