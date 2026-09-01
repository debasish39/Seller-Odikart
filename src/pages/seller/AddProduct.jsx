import { useEffect, useMemo, useState } from "react";
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


/* =====================================================
   STYLES
===================================================== */

const inputClass = `
  w-full rounded-xl border border-zinc-200
  bg-zinc-50 px-4 py-3 text-sm text-zinc-900
  outline-none transition-all duration-200
  placeholder:text-zinc-400
  hover:border-zinc-300
  focus:border-black focus:bg-white
  focus:ring-4 focus:ring-black/5
`;

const textareaClass = `
  ${inputClass}
  min-h-[120px]
  resize-y
`;

const selectClass = `
  ${inputClass}
  appearance-none
`;

const cardClass = `
  rounded-3xl border border-zinc-200
  bg-white p-5 shadow-sm
  sm:p-7
`;

const buttonClass = `
  inline-flex items-center justify-center gap-2
  rounded-xl px-4 py-3 text-sm font-semibold
  transition-all duration-200
  disabled:cursor-not-allowed
  disabled:opacity-50
`;


/* =====================================================
   HELPERS
===================================================== */

const createEmptyAttribute = () => ({
  name: "",
  value: "",
});

const createEmptyVariant = () => ({
  sku: "",
  barcode: "",

  attributes: [
    createEmptyAttribute(),
  ],

  price: "",
  compareAtPrice: "",
  costPrice: "",

  currency: "INR",
  tax: 0,

  stock: "",
  reservedStock: 0,
  lowStockThreshold: 5,

  trackInventory: true,
  allowBackorder: false,

  weight: {
    value: "",
    unit: "kg",
  },

  dimensions: {
    length: "",
    width: "",
    height: "",
    unit: "cm",
  },

  media: [],

  isActive: true,
});


const createEmptyForm = () => ({
  title: "",
  description: "",
  shortDescription: "",

  category: "",
  subCategory: "",

  brand: "",
  productType: "simple",
  currency: "INR",

  tags: [],

  attributes: [],

  specifications: [
    {
      name: "",
      value: "",
    },
  ],

  minimumOrderQuantity: 1,
  maximumOrderQuantity: 10,

  shipping: {
    freeShipping: false,
    charge: 0,
    processingDays: 2,
    returnable: true,
    returnDays: 7,
    provider: "",
    restrictions: [],
  },

  details: {
    material: "",
    warranty: "",
    returnPolicy: "",
    shippingInformation: "",
  },

  seo: {
    title: "",
    description: "",
    keywords: [],
    canonicalUrl: "",
    image: "",
  },

  offer: {
    enabled: false,
    type: "percentage",
    value: 0,
    label: "",
    startAt: "",
    endAt: "",
    maxQuantity: "",
    promotionCode: "",
  },
});


const formatFileSize = (bytes) => {
  if (!bytes) return "0 KB";

  const kb = bytes / 1024;

  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(1)} MB`;
};


const getCategoryId = (category) => {
  if (!category) return "";

  return (
    category._id ||
    category.id ||
    ""
  );
};


/* =====================================================
   CATEGORY-DRIVEN FIELD CONFIGURATION

   The form uses the selected category/subcategory to
   decide which product and variant fields are shown.
   Unknown categories still get a safe generic form.
===================================================== */

const CATEGORY_FIELD_CONFIG = {
  electronics: {
    productFields: [
      { name: "Model", type: "text" },
      { name: "RAM", options: ["2 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB", "32 GB"] },
      { name: "Storage", options: ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"] },
      { name: "Display", options: ["5 inch", "6 inch", "6.1 inch", "6.5 inch", "6.7 inch", "7 inch", "Other"] },
      { name: "Color", options: ["Black", "White", "Blue", "Green", "Red", "Silver", "Gold", "Other"] },
    ],
    variantFields: [
      { name: "Storage", options: ["32 GB", "64 GB", "128 GB", "256 GB", "512 GB", "1 TB", "2 TB"] },
      { name: "RAM", options: ["2 GB", "4 GB", "6 GB", "8 GB", "12 GB", "16 GB", "32 GB"] },
      { name: "Color", options: ["Black", "White", "Blue", "Green", "Red", "Silver", "Gold", "Other"] },
    ],
  },

  fashion: {
    productFields: [
      { name: "Gender", options: ["Men", "Women", "Unisex", "Kids"] },
      { name: "Fabric", options: ["Cotton", "Polyester", "Linen", "Denim", "Wool", "Silk", "Rayon", "Other"] },
      { name: "Fit", options: ["Regular", "Slim", "Relaxed", "Oversized", "Loose"] },
      { name: "Pattern", options: ["Solid", "Printed", "Striped", "Checked", "Floral", "Graphic", "Other"] },
      { name: "Sleeve", options: ["Full Sleeve", "Half Sleeve", "Sleeveless", "3/4 Sleeve"] },
    ],
    variantFields: [
      { name: "Size", options: ["XS", "S", "M", "L", "XL", "XXL", "3XL", "Free Size"] },
      { name: "Color", options: ["Black", "White", "Blue", "Red", "Green", "Yellow", "Pink", "Grey", "Brown", "Other"] },
    ],
  },

  shoes: {
    productFields: [
      { name: "Gender", options: ["Men", "Women", "Unisex", "Kids"] },
      { name: "Material", options: ["Leather", "Synthetic", "Mesh", "Canvas", "Textile", "Suede", "Other"] },
      { name: "Sole Material", options: ["Rubber", "EVA", "TPR", "Leather", "PVC", "Other"] },
      { name: "Occasion", options: ["Casual", "Sports", "Running", "Formal", "Party", "Outdoor", "Other"] },
    ],
    variantFields: [
      { name: "Size", options: ["5", "6", "7", "8", "9", "10", "11", "12", "13"] },
      { name: "Color", options: ["Black", "White", "Blue", "Brown", "Grey", "Red", "Green", "Other"] },
    ],
  },

  beauty: {
    productFields: [
      { name: "Skin Type", options: ["Normal", "Dry", "Oily", "Combination", "Sensitive", "All Skin Types"] },
      { name: "Product Type", options: ["Face Wash", "Moisturizer", "Serum", "Sunscreen", "Makeup", "Shampoo", "Conditioner", "Other"] },
      { name: "Finish", options: ["Matte", "Dewy", "Natural", "Glossy", "Shimmer", "Other"] },
      { name: "Concern", options: ["Acne", "Dryness", "Aging", "Pigmentation", "Sun Protection", "Hair Fall", "Other"] },
    ],
    variantFields: [
      { name: "Shade", options: ["Light", "Medium", "Tan", "Deep", "Fair", "Warm", "Cool", "Other"] },
      { name: "Size", options: ["10 ml", "20 ml", "30 ml", "50 ml", "100 ml", "200 ml", "250 ml", "500 ml"] },
    ],
  },

  grocery: {
    productFields: [
      { name: "Food Type", options: ["Vegetarian", "Non-Vegetarian", "Vegan"] },
      { name: "Pack Type", options: ["Packet", "Bottle", "Box", "Can", "Jar", "Pouch", "Other"] },
      { name: "Shelf Life", options: ["1 Month", "3 Months", "6 Months", "9 Months", "12 Months", "18 Months", "24 Months"] },
      ],
    variantFields: [
      { name: "Weight", options: ["100 g", "250 g", "500 g", "1 kg", "2 kg", "5 kg", "10 kg"] },
      { name: "Pack Size", options: ["1 Pack", "2 Pack", "3 Pack", "5 Pack", "10 Pack", "20 Pack"] },
    ],
  },

  home: {
    productFields: [
      { name: "Material", options: ["Wood", "Metal", "Plastic", "Glass", "Ceramic", "Fabric", "Leather", "Bamboo", "Other"] },
      { name: "Room", options: ["Living Room", "Bedroom", "Kitchen", "Bathroom", "Office", "Outdoor", "Other"] },
      { name: "Style", options: ["Modern", "Classic", "Minimal", "Traditional", "Industrial", "Boho", "Other"] },
      { name: "Color", options: ["Black", "White", "Blue", "Green", "Red", "Brown", "Grey", "Beige", "Other"] },
    ],
    variantFields: [
      { name: "Color", options: ["Black", "White", "Blue", "Green", "Red", "Brown", "Grey", "Beige", "Other"] },
      { name: "Size", options: ["Small", "Medium", "Large", "XL", "XXL", "Standard", "Other"] },
    ],
  },
};

const normalizeName = (value = "") =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const getCategoryFieldConfig = (categoryName = "", subCategoryName = "") => {
  const category = normalizeName(categoryName);
  const subCategory = normalizeName(subCategoryName);
  const combined = `${category} ${subCategory}`;

  if (
    /electronic|mobile|computer|laptop|tablet|phone|camera|television|tv|audio|headphone/.test(combined)
  ) {
    return CATEGORY_FIELD_CONFIG.electronics;
  }

  if (/fashion|clothing|apparel|garment|shirt|t shirt|dress|jean|saree|kurta/.test(combined)) {
    return CATEGORY_FIELD_CONFIG.fashion;
  }

  if (/shoe|shoes|footwear|sandal|sneaker|boot/.test(combined)) {
    return CATEGORY_FIELD_CONFIG.shoes;
  }

  if (/beauty|cosmetic|cosmetics|makeup|skincare|skin care|hair care|personal care|perfume/.test(combined)) {
    return CATEGORY_FIELD_CONFIG.beauty;
  }

  if (/grocery|food|beverage|snack|drink|organic|staple/.test(combined)) {
    return CATEGORY_FIELD_CONFIG.grocery;
  }

  if (/home|furniture|kitchen|decor|decoration|garden|household|living/.test(combined)) {
    return CATEGORY_FIELD_CONFIG.home;
  }

  return { productFields: [], variantFields: [] };
};

/* =====================================================
   AUTOMATIC SEO HELPERS
===================================================== */

const slugify = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .trim()
    .replace(/<[^>]*>/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const stripHtml = (value = "") =>
  value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const truncateText = (value = "", maxLength) => {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).trim()}…`;
};

const buildAutomaticSEO = ({
  title,
  description,
  shortDescription,
  brand,
  categoryName,
  subCategoryName,
  tags = [],
  attributes = [],
}) => {
  const cleanTitle = stripHtml(title);
  const cleanDescription = stripHtml(description);
  const cleanShortDescription = stripHtml(shortDescription);
  const cleanBrand = stripHtml(brand);
  const cleanCategory = stripHtml(categoryName);
  const cleanSubCategory = stripHtml(subCategoryName);

  const seoTitleParts = [
    cleanTitle,
    cleanBrand && !["generic", "no brand"].includes(cleanBrand.toLowerCase())
      ? cleanBrand
      : "",
  ].filter(Boolean);

  const seoTitle = truncateText(
    seoTitleParts.join(" | "),
    60
  );

  const descriptionSource =
    cleanShortDescription || cleanDescription || cleanTitle;

  const seoDescription = truncateText(
    [
      descriptionSource,
      cleanSubCategory,
      cleanCategory,
      cleanBrand && !["generic", "no brand"].includes(cleanBrand.toLowerCase())
        ? cleanBrand
        : "",
    ]
      .filter(Boolean)
      .join(" "),
    160
  );

  const keywordSource = [
    cleanTitle,
    cleanBrand,
    cleanCategory,
    cleanSubCategory,
    ...tags,
    ...attributes.flatMap((attribute) => [
      attribute?.name,
      attribute?.value,
    ]),
  ];

  const keywords = [];

  keywordSource
    .flatMap((value) =>
      stripHtml(value || "")
        .split(/[,|]/)
        .map((part) => part.trim())
    )
    .forEach((keyword) => {
      if (!keyword || keyword.length < 2) return;

      const normalized = keyword.toLowerCase();

      if (!keywords.some((item) => item.toLowerCase() === normalized)) {
        keywords.push(keyword);
      }
    });

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: keywords.slice(0, 20),
    canonicalUrl: slugify(cleanTitle)
      ? `${window.location.origin}/product/${slugify(cleanTitle)}`
      : "",
    image: "",
  };
};


/* =====================================================
   SMALL COMPONENTS
===================================================== */

const Field = ({
  label,
  required = false,
  hint,
  children,
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-semibold text-zinc-900">
      {label}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>

    {children}

    {hint && (
      <p className="text-xs leading-5 text-zinc-500">
        {hint}
      </p>
    )}
  </div>
);


const SectionHeader = ({
  number,
  icon: Icon,
  title,
  description,
}) => (
  <div className="mb-7 flex items-start gap-4">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-white">
      <Icon size={19} />
    </div>

    <div className="min-w-0">
      <div className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
        Section {number}
      </div>

      <h2 className="text-xl font-bold tracking-tight text-zinc-950">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  </div>
);


const UploadBox = ({
  icon: Icon,
  title,
  description,
  files,
  accept,
  multiple = true,
  onChange,
}) => (
  <label className="group relative flex min-h-[230px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-6 text-center transition-all hover:border-zinc-400 hover:bg-white">
    <input
      type="file"
      accept={accept}
      multiple={multiple}
      onChange={onChange}
      className="hidden"
    />

    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
      <Icon
        size={24}
        className="text-zinc-700"
      />
    </div>

    <h3 className="font-semibold text-zinc-900">
      {title}
    </h3>

    <p className="mt-1 text-xs text-zinc-500">
      {description}
    </p>

    <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-xs font-semibold text-white">
      <Upload size={14} />
      Choose files
    </div>

    {files?.length > 0 && (
      <div className="mt-4 rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
        {files.length} file
        {files.length !== 1 ? "s" : ""} selected
      </div>
    )}
  </label>
);


/* =====================================================
   ADD PRODUCT
===================================================== */

const AddProduct = () => {
  const navigate =
    useNavigate();


  /* ===================================================
     STATE
  =================================================== */

  const [form, setForm] =
    useState(
      createEmptyForm()
    );

  const [variants, setVariants] =
    useState([
      createEmptyVariant(),
    ]);

  const [images, setImages] =
    useState([]);

  const [videos, setVideos] =
    useState([]);


  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    subCategories,
    setSubCategories,
  ] = useState([]);


  const [
    categoryLoading,
    setCategoryLoading,
  ] = useState(false);

  const [
    subCategoryLoading,
    setSubCategoryLoading,
  ] = useState(false);


  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  const [
    activeSection,
    setActiveSection,
  ] = useState("basic");


  /* ===================================================
     FORM SUPPORT STATE

     These states must be declared before any effect or
     callback that references them.
  =================================================== */

  const [tagInput, setTagInput] =
    useState("");

  const [customBrand, setCustomBrand] =
    useState("");


  /* ===================================================
     AOS + CATEGORIES
  =================================================== */

  useEffect(() => {
    AOS.init({
      duration: 650,
      easing: "ease-out-cubic",
      once: true,
      offset: 40,
    });

    loadCategories();
  }, []);


  const loadCategories =
    async () => {
      try {
        setCategoryLoading(
          true
        );

        setError("");

        const data =
          await getCategories();

        if (
          data?.success
        ) {
          setCategories(
            data.categories ||
              []
          );
        } else {
          setCategories(
            data?.categories ||
              []
          );
        }
      } catch (err) {
        console.error(
          "Get Categories Error:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Failed to load categories"
        );
      } finally {
        setCategoryLoading(
          false
        );
      }
    };


  /* ===================================================
     CATEGORY LIST
  =================================================== */

  const parentCategories =
    useMemo(
      () =>
        categories.filter(
          (category) =>
            !category.parentCategory &&
            !category.parent
        ),
      [categories]
    );


  const selectedCategory = useMemo(() => {
    return categories.find(
      (category) =>
        getCategoryId(category) === form.category
    );
  }, [categories, form.category]);

  const selectedSubCategory = useMemo(() => {
    return subCategories.find(
      (category) =>
        getCategoryId(category) === form.subCategory
    );
  }, [subCategories, form.subCategory]);

  const categoryFieldConfig = useMemo(() => {
    return getCategoryFieldConfig(
      selectedCategory?.name,
      selectedSubCategory?.name
    );
  }, [selectedCategory, selectedSubCategory]);


  /* ===================================================
     BASIC CHANGE
  =================================================== */

  const handleChange =
    (e) => {
      const {
        name,
        value,
      } = e.target;

      setForm((prev) => ({
        ...prev,
        [name]: value,
        seo:
          name === "title" && !prev.seo.title
            ? {
                ...prev.seo,
                title: value,
              }
            : name === "description" && !prev.seo.description
            ? {
                ...prev.seo,
                description: value,
              }
            : prev.seo,
      }));

      if (name === "brand" && value !== "Other") {
        setCustomBrand("");
      }
    };


  /* ===================================================
     CATEGORY CHANGE
  =================================================== */

  const handleCategoryChange =
    async (e) => {
      const categoryId =
        e.target.value;

      setForm((prev) => ({
        ...prev,

        category:
          categoryId,

        subCategory:
          "",
      }));

      setSubCategories([]);

      if (!categoryId) {
        return;
      }

      try {
        setSubCategoryLoading(
          true
        );

        setError("");

        const data =
          await getSubCategories(
            categoryId
          );

        setSubCategories(
          data?.subCategories ||
            data?.categories ||
            []
        );
      } catch (err) {
        console.error(
          "Get Subcategories Error:",
          err
        );

        setError(
          err?.response?.data
            ?.message ||
            "Failed to load subcategories"
        );
      } finally {
        setSubCategoryLoading(
          false
        );
      }
    };



  /* ===================================================
     AUTOMATIC SEO

     SEO is generated from the product information as
     the seller fills the form. The seller can still edit
     the fields manually after generation if needed.
  =================================================== */

  useEffect(() => {
    const effectiveBrand =
      form.brand === "Other"
        ? customBrand.trim()
        : form.brand.trim();

    const automaticSEO = buildAutomaticSEO({
      title: form.title,
      description: form.description,
      shortDescription: form.shortDescription,
      brand: effectiveBrand,
      categoryName: selectedCategory?.name || "",
      subCategoryName: selectedSubCategory?.name || "",
      tags: form.tags,
      attributes: form.attributes,
    });

    setForm((prev) => {
      const currentSEO = prev.seo || {};

      const unchanged =
        currentSEO.title === automaticSEO.title &&
        currentSEO.description === automaticSEO.description &&
        JSON.stringify(currentSEO.keywords || []) ===
          JSON.stringify(automaticSEO.keywords || []) &&
        currentSEO.canonicalUrl === automaticSEO.canonicalUrl;

      if (unchanged) return prev;

      return {
        ...prev,
        seo: {
          ...currentSEO,
          ...automaticSEO,
        },
      };
    });
  }, [
    form.title,
    form.description,
    form.shortDescription,
    form.brand,
    customBrand,
    form.tags,
    form.attributes,
    selectedCategory,
    selectedSubCategory,
  ]);


  /* ===================================================
     CATEGORY-DRIVEN DEFAULTS
  =================================================== */

  useEffect(() => {
    if (!form.category) return;

    const fields = categoryFieldConfig.productFields || [];
    const allowedNames = new Set(fields.map((field) => field.name));

    setForm((prev) => ({
      ...prev,
      attributes: prev.attributes.filter((attribute) =>
        allowedNames.has(attribute.name)
      ),
    }));

    setVariants((prev) =>
      prev.map((variant) => ({
        ...variant,
        attributes: variant.attributes.filter((attribute) =>
          (categoryFieldConfig.variantFields || []).some(
            (field) => field.name === attribute.name
          )
        ),
        currency: variant.currency || prev.currency || form.currency || "INR",
      }))
    );
  }, [form.category, form.subCategory, categoryFieldConfig]);

  /* ===================================================
     PRODUCT TYPE DEFAULTS
  =================================================== */

  useEffect(() => {
    if (form.productType === "simple") {
      setVariants((prev) =>
        prev.length > 0 ? [prev[0]] : [createEmptyVariant()]
      );
    }
  }, [form.productType]);

  /* ===================================================
     SHIPPING
  =================================================== */

  const handleShippingChange =
    (e) => {
      const {
        name,
        value,
        type,
        checked,
      } = e.target;

      setForm((prev) => ({
        ...prev,

        shipping: {
          ...prev.shipping,

          [name]:
            type ===
            "checkbox"
              ? checked
              : name ===
                  "charge" ||
                name ===
                  "processingDays" ||
                name ===
                  "returnDays"
                ? Number(value)
                : value,
        },
      }));
    };


  /* ===================================================
     DETAILS
  =================================================== */

  const handleDetailsChange =
    (e) => {
      const {
        name,
        value,
      } = e.target;

      setForm((prev) => ({
        ...prev,

        details: {
          ...prev.details,
          [name]: value,
        },
      }));
    };


  /* ===================================================
     SEO
  =================================================== */

  const handleSEOChange =
    (e) => {
      const {
        name,
        value,
      } = e.target;

      setForm((prev) => ({
        ...prev,

        seo: {
          ...prev.seo,

          [name]: value,
        },
      }));
    };


  /* ===================================================
     OFFER
  =================================================== */

  const handleOfferChange =
    (e) => {
      const {
        name,
        value,
        type,
        checked,
      } = e.target;

      setForm((prev) => ({
        ...prev,

        offer: {
          ...prev.offer,

          [name]:
            type ===
            "checkbox"
              ? checked
              : [
                    "value",
                    "maxQuantity",
                  ].includes(name)
                ? Number(value)
                : value,
        },
      }));
    };


  /* ===================================================
     TAGS
  =================================================== */



  const addTag = () => {
    const tag =
      tagInput.trim();

    if (!tag) return;

    if (
      form.tags.includes(
        tag
      )
    ) {
      setTagInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,

      tags: [
        ...prev.tags,
        tag,
      ],
    }));

    setTagInput("");
  };


  const removeTag =
    (index) => {
      setForm((prev) => ({
        ...prev,

        tags: prev.tags.filter(
          (_, i) =>
            i !== index
        ),
      }));
    };


  /* ===================================================
     PRODUCT ATTRIBUTES
  =================================================== */

  const addProductAttribute =
    () => {
      setForm((prev) => ({
        ...prev,

        attributes: [
          ...prev.attributes,
          createEmptyAttribute(),
        ],
      }));
    };


  const updateProductAttribute =
    (
      index,
      field,
      value
    ) => {
      setForm((prev) => {
        const updated = [
          ...prev.attributes,
        ];

        updated[index] = {
          ...updated[index],
          [field]: value,
        };

        return {
          ...prev,
          attributes:
            updated,
        };
      });
    };


  const removeProductAttribute =
    (index) => {
      setForm((prev) => ({
        ...prev,

        attributes:
          prev.attributes.filter(
            (_, i) =>
              i !== index
          ),
      }));
    };


  /* ===================================================
     SPECIFICATIONS
  =================================================== */

  const addSpecification =
    () => {
      setForm((prev) => ({
        ...prev,

        specifications: [
          ...prev.specifications,
          {
            name: "",
            value: "",
          },
        ],
      }));
    };


  const updateSpecification =
    (
      index,
      field,
      value
    ) => {
      setForm((prev) => {
        const updated = [
          ...prev.specifications,
        ];

        updated[index] = {
          ...updated[index],
          [field]: value,
        };

        return {
          ...prev,
          specifications:
            updated,
        };
      });
    };


  const removeSpecification =
    (index) => {
      setForm((prev) => ({
        ...prev,

        specifications:
          prev.specifications.filter(
            (_, i) =>
              i !== index
          ),
      }));
    };


  /* ===================================================
     VARIANT CHANGE
  =================================================== */

  const handleVariantChange =
    (
      index,
      field,
      value
    ) => {
      setVariants((prev) => {
        const updated = [
          ...prev,
        ];

        updated[index] = {
          ...updated[index],

          [field]:
            value,
        };

        return updated;
      });
    };


  /* ===================================================
     VARIANT ATTRIBUTE
  =================================================== */

  const addVariantAttribute =
    (variantIndex) => {
      setVariants((prev) => {
        const updated = [
          ...prev,
        ];

        updated[
          variantIndex
        ].attributes = [
          ...updated[
            variantIndex
          ].attributes,
          createEmptyAttribute(),
        ];

        return updated;
      });
    };


  const updateVariantAttribute =
    (
      variantIndex,
      attributeIndex,
      field,
      value
    ) => {
      setVariants((prev) => {
        const updated = [
          ...prev,
        ];

        const attributes =
          [
            ...updated[
              variantIndex
            ].attributes,
          ];

        attributes[
          attributeIndex
        ] = {
          ...attributes[
            attributeIndex
          ],
          [field]:
            value,
        };

        updated[
          variantIndex
        ] = {
          ...updated[
            variantIndex
          ],
          attributes,
        };

        return updated;
      });
    };


  const removeVariantAttribute =
    (
      variantIndex,
      attributeIndex
    ) => {
      setVariants((prev) => {
        const updated = [
          ...prev,
        ];

        const attributes =
          updated[
            variantIndex
          ].attributes.filter(
            (_, i) =>
              i !==
              attributeIndex
          );

        updated[
          variantIndex
        ] = {
          ...updated[
            variantIndex
          ],
          attributes:
            attributes.length
              ? attributes
              : [
                  createEmptyAttribute(),
                ],
        };

        return updated;
      });
    };


  /* ===================================================
     VARIANT WEIGHT
  =================================================== */

  const handleVariantWeightChange =
    (
      index,
      field,
      value
    ) => {
      setVariants((prev) => {
        const updated = [
          ...prev,
        ];

        updated[index] = {
          ...updated[index],

          weight: {
            ...updated[index]
              .weight,

            [field]:
              field ===
              "value"
                ? value
                : value,
          },
        };

        return updated;
      });
    };


  /* ===================================================
     VARIANT DIMENSIONS
  =================================================== */

  const handleVariantDimensionChange =
    (
      index,
      field,
      value
    ) => {
      setVariants((prev) => {
        const updated = [
          ...prev,
        ];

        updated[index] = {
          ...updated[index],

          dimensions: {
            ...updated[index]
              .dimensions,

            [field]:
              value,
          },
        };

        return updated;
      });
    };


  /* ===================================================
     ADD / REMOVE VARIANT
  =================================================== */

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      createEmptyVariant(),
    ]);
  };


  const removeVariant =
    (index) => {
      if (
        variants.length ===
        1
      ) {
        return;
      }

      setVariants((prev) =>
        prev.filter(
          (_, i) =>
            i !== index
        )
      );
    };


  /* ===================================================
     MEDIA
  =================================================== */

  const handleImageChange =
    (e) => {
      setImages(
        Array.from(
          e.target.files ||
            []
        )
      );
    };


  const handleVideoChange =
    (e) => {
      setVideos(
        Array.from(
          e.target.files ||
            []
        )
      );
    };


  const removeImage =
    (index) => {
      setImages((prev) =>
        prev.filter(
          (_, i) =>
            i !== index
        )
      );
    };


  const removeVideo =
    (index) => {
      setVideos((prev) =>
        prev.filter(
          (_, i) =>
            i !== index
        )
      );
    };


  /* ===================================================
     VALIDATION
  =================================================== */

  const validateForm =
    () => {
      if (
        !form.title.trim()
      ) {
        return "Product title is required";
      }

      if (
        form.title.trim()
          .length < 3
      ) {
        return "Product title must contain at least 3 characters";
      }

      if (
        !form.description.trim()
      ) {
        return "Product description is required";
      }

      if (
        form.description.trim()
          .length < 10
      ) {
        return "Product description must contain at least 10 characters";
      }

      if (!form.category) {
        return "Category is required";
      }

      if (form.brand === "Other" && !customBrand.trim()) {
        return "Please enter the brand name or select No Brand/Generic";
      }

      if (
        subCategories.length >
          0 &&
        !form.subCategory
      ) {
        return "Subcategory is required";
      }

      if (
        variants.length ===
        0
      ) {
        return "At least one variant is required";
      }

      const skuSet =
        new Set();

      for (
        let i = 0;
        i <
        variants.length;
        i++
      ) {
        const variant =
          variants[i];

        if (
          !variant.sku.trim()
        ) {
          return `Variant ${
            i + 1
          }: SKU is required`;
        }

        const sku =
          variant.sku
            .trim()
            .toUpperCase();

        if (
          skuSet.has(sku)
        ) {
          return `Duplicate SKU: ${sku}`;
        }

        skuSet.add(sku);

        if (
          variant.price ===
            "" ||
          Number(
            variant.price
          ) < 0
        ) {
          return `Variant ${
            i + 1
          }: valid price is required`;
        }

        if (
          variant.stock ===
            "" ||
          Number(
            variant.stock
          ) < 0
        ) {
          return `Variant ${
            i + 1
          }: valid stock is required`;
        }

        const tax = Number(variant.tax);

        if (
          Number.isNaN(tax) ||
          tax < 0 ||
          tax > 100
        ) {
          return `Variant ${
            i + 1
          }: GST must be between 0% and 100%`;
        }

        for (
          const attribute of
            variant.attributes
        ) {
          if (
            attribute.name &&
            !attribute.value
          ) {
            return `Variant ${
              i + 1
            }: attribute "${attribute.name}" needs a value`;
          }
        }
      }

      if (
        Number(
          form.minimumOrderQuantity
        ) < 1
      ) {
        return "Minimum order quantity must be at least 1";
      }

      if (
        Number(
          form.maximumOrderQuantity
        ) <
        Number(
          form.minimumOrderQuantity
        )
      ) {
        return "Maximum order quantity cannot be lower than minimum quantity";
      }

      if (
        form.offer.enabled
      ) {
        if (
          Number(
            form.offer.value
          ) <= 0
        ) {
          return "Offer value must be greater than 0";
        }

        if (
          form.offer.type ===
            "percentage" &&
          Number(
            form.offer.value
          ) > 100
        ) {
          return "Percentage offer cannot exceed 100%";
        }
      }

      return null;
    };


  /* ===================================================
     BUILD VARIANTS
  =================================================== */

  const buildVariants =
    () => {
      return variants.map(
        (variant) => {
          const attributes =
            variant.attributes
              .filter(
                (attribute) =>
                  attribute.name.trim() &&
                  attribute.value.trim()
              )
              .map(
                (attribute) => ({
                  name:
                    attribute.name.trim(),

                  key:
                    attribute.name
                      .trim()
                      .toLowerCase()
                      .replace(
                        /\s+/g,
                        "-"
                      ),

                  value:
                    attribute.value.trim(),
                })
              );

          return {
            sku:
              variant.sku
                .trim()
                .toUpperCase(),

            barcode:
              variant.barcode
                .trim(),

            attributes,

            price:
              Number(
                variant.price
              ),

            compareAtPrice:
              Number(
                variant.compareAtPrice ||
                  0
              ),

            costPrice:
              Number(
                variant.costPrice ||
                  0
              ),

            currency:
              (
                variant.currency ||
                form.currency ||
                "INR"
              )
                .trim()
                .toUpperCase(),

           tax:
  Number(
    variant.tax || 0
  ),
            stock:
              Number(
                variant.stock
              ),

            reservedStock:
              Number(
                variant.reservedStock ||
                  0
              ),

            lowStockThreshold:
              Number(
                variant.lowStockThreshold ||
                  5
              ),

            trackInventory:
              Boolean(
                variant.trackInventory
              ),

            allowBackorder:
              Boolean(
                variant.allowBackorder
              ),

            weight: {
              value:
                Number(
                  variant.weight
                    ?.value ||
                    0
                ),

              unit:
                variant.weight
                  ?.unit ||
                "kg",
            },

            dimensions: {
              length:
                Number(
                  variant.dimensions
                    ?.length ||
                    0
                ),

              width:
                Number(
                  variant.dimensions
                    ?.width ||
                    0
                ),

              height:
                Number(
                  variant.dimensions
                    ?.height ||
                    0
                ),

              unit:
                variant.dimensions
                  ?.unit ||
                "cm",
            },

            media:
              Array.isArray(
                variant.media
              )
                ? variant.media
                : [],

            isActive:
              variant.isActive !==
              false,
          };
        }
      );
    };


  /* ===================================================
     BUILD SPECIFICATIONS
  =================================================== */

  const buildSpecifications =
    () => {
      const result = {};

      form.specifications.forEach(
        (item) => {
          const name =
            item.name.trim();

          const value =
            item.value.trim();

          if (
            name &&
            value
          ) {
            result[name] =
              value;
          }
        }
      );

      return result;
    };


  /* ===================================================
     SUBMIT
  =================================================== */

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");
      setSuccess("");

      const validationError =
        validateForm();

      if (
        validationError
      ) {
        setError(
          validationError
        );

        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });

        return;
      }

      try {
        setLoading(true);

        const formData =
          new FormData();


        /* -------------------------------
           BASIC
        ------------------------------- */

        formData.append(
          "title",
          form.title.trim()
        );

        formData.append(
          "description",
          form.description.trim()
        );

        formData.append(
          "shortDescription",
          form.shortDescription.trim()
        );

        // Brand is optional. An empty value means the product is unbranded.
        const effectiveBrand =
          form.brand === "Other"
            ? customBrand.trim()
            : form.brand.trim();

        formData.append(
          "brand",
          effectiveBrand
        );

        formData.append(
          "category",
          form.category
        );

        if (
          form.subCategory
        ) {
          formData.append(
            "subCategory",
            form.subCategory
          );
        }

        formData.append(
          "productType",
          form.productType
        );

        formData.append(
          "currency",
          form.currency
        );


        /* -------------------------------
           TAGS
        ------------------------------- */

        formData.append(
          "tags",
          JSON.stringify(
            form.tags
          )
        );


        /* -------------------------------
           ATTRIBUTES
        ------------------------------- */

        formData.append(
          "attributes",
          JSON.stringify(
            form.attributes
              .filter(
                (item) =>
                  item.name.trim() &&
                  item.value.trim()
              )
              .map(
                (item) => ({
                  name:
                    item.name.trim(),

                  key:
                    item.name
                      .trim()
                      .toLowerCase()
                      .replace(
                        /\s+/g,
                        "-"
                      ),

                  value:
                    item.value.trim(),
                })
              )
          )
        );


        /* -------------------------------
           SPECIFICATIONS
        ------------------------------- */

        formData.append(
          "specifications",
          JSON.stringify(
            buildSpecifications()
          )
        );


        /* -------------------------------
           ORDER RULES
        ------------------------------- */

        formData.append(
          "minimumOrderQuantity",
          String(
            Number(
              form.minimumOrderQuantity
            )
          )
        );

        formData.append(
          "maximumOrderQuantity",
          String(
            Number(
              form.maximumOrderQuantity
            )
          )
        );


        /* -------------------------------
           VARIANTS
        ------------------------------- */

        formData.append(
          "variants",
          JSON.stringify(
            buildVariants()
          )
        );


        /* -------------------------------
           SHIPPING
        ------------------------------- */

        formData.append(
          "shipping",
          JSON.stringify(
            form.shipping
          )
        );


        /* -------------------------------
           DETAILS
        ------------------------------- */

        formData.append(
          "details",
          JSON.stringify(
            form.details
          )
        );


        /*
          Keep these fields too because
          your controller supports the
          existing frontend names.
        */

        formData.append(
          "material",
          form.details.material
        );

        formData.append(
          "warrantyInformation",
          form.details.warranty
        );

        formData.append(
          "returnPolicy",
          form.details.returnPolicy
        );

        formData.append(
          "shippingInformation",
          form.details.shippingInformation
        );


        /* -------------------------------
           SEO
        ------------------------------- */

        formData.append(
          "seo",
          JSON.stringify(
            form.seo
          )
        );


        /* -------------------------------
           OFFER
        ------------------------------- */

        formData.append(
          "offer",
          JSON.stringify(
            form.offer
          )
        );


        /* -------------------------------
           IMAGES
        ------------------------------- */

        images.forEach(
          (file) => {
            formData.append(
              "images",
              file
            );
          }
        );


        /* -------------------------------
           VIDEOS
        ------------------------------- */

        videos.forEach(
          (file) => {
            formData.append(
              "videos",
              file
            );
          }
        );


        /* -------------------------------
           API
        ------------------------------- */

        await createProduct(
          formData
        );


        setSuccess(
          "Product created successfully and submitted for approval."
        );


        setTimeout(() => {
          navigate(
            "/seller/products"
          );
        }, 1200);

      } catch (err) {
        console.error(
          "================================="
        );

        console.error(
          "CREATE PRODUCT FRONTEND ERROR"
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
          "Response:",
          err?.response?.data
        );

        console.error(
          "================================="
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Failed to create product"
        );

        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });
      } finally {
        setLoading(false);
      }
    };


  /* ===================================================
     SECTION NAVIGATION
  =================================================== */

  const sections = [
    {
      id: "basic",
      label: "Basic Info",
      icon: Package,
    },

    {
      id: "category",
      label: "Category",
      icon: Tag,
    },

    {
      id: "variants",
      label: "Variants",
      icon: Package,
    },

    {
      id: "shipping",
      label: "Shipping",
      icon: Truck,
    },

    {
      id: "details",
      label: "Details",
      icon: Check,
    },

    {
      id: "media",
      label: "Media",
      icon: ImagePlus,
    },

    {
      id: "seo",
      label: "SEO & Offer",
      icon: Search,
    },
  ];


  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">


      {/* ===============================================
          HEADER
      =============================================== */}

      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex min-w-0 items-center gap-3">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/seller/products"
                )
              }
              className={`${buttonClass} h-10 w-10 rounded-xl border border-zinc-200 bg-white p-0 text-zinc-600 hover:bg-zinc-50 hover:text-black`}
            >
              <ArrowLeft
                size={18}
              />
            </button>

            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-400">
                Seller Center
              </p>

              <h1 className="truncate text-lg font-bold sm:text-xl">
                Add Product
              </h1>
            </div>

          </div>


          <button
            type="button"
            onClick={
              handleSubmit
            }
            disabled={
              loading
            }
            className={`${buttonClass} bg-zinc-950 text-white hover:bg-zinc-800`}
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving...
              </>
            ) : (
              <>
                <Save
                  size={16}
                />
                Submit Product
              </>
            )}
          </button>

        </div>
      </header>


      {/* ===============================================
          MAIN
      =============================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">


        {/* =============================================
            ALERTS
        ============================================= */}

        {error && (
          <div
            className="mb-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800"
            data-aos="fade-down"
          >
            <div>
              <p className="font-bold">
                Unable to save product
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X
                size={17}
              />
            </button>
          </div>
        )}


        {success && (
          <div
            className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800"
            data-aos="fade-down"
          >
            <p className="font-bold">
              Product saved
            </p>

            <p className="mt-1">
              {success}
            </p>
          </div>
        )}


        {/* =============================================
            SECTION NAV
        ============================================= */}

        <div className="mb-7 overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-2 shadow-sm">
          <div className="flex min-w-max gap-1">
            {sections.map(
              (section) => {
                const Icon =
                  section.icon;

                return (
                  <button
                    key={
                      section.id
                    }
                    type="button"
                    onClick={() =>
                      setActiveSection(
                        section.id
                      )
                    }
                    className={`
                      flex items-center gap-2
                      rounded-xl px-4 py-2.5
                      text-xs font-semibold
                      transition
                      ${
                        activeSection ===
                        section.id
                          ? "bg-zinc-950 text-white"
                          : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                      }
                    `}
                  >
                    <Icon
                      size={14}
                    />

                    {
                      section.label
                    }
                  </button>
                );
              }
            )}
          </div>
        </div>


        <form
          onSubmit={
            handleSubmit
          }
          className="space-y-7"
        >


          {/* ===========================================
              BASIC INFO
          =========================================== */}

          <section
            id="basic"
            data-aos="fade-up"
            className={cardClass}
          >
            <SectionHeader
              number="01"
              icon={
                Package
              }
              title="Basic Information"
              description="Give your product a clear title and useful description."
            />

            <div className="grid gap-5">

              <Field
                label="Product Title"
                required
              >
                <input
                  name="title"
                  value={
                    form.title
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. Premium Cotton Oversized T-Shirt"
                  className={
                    inputClass
                  }
                  maxLength={250}
                />
              </Field>


              <Field
                label="Short Description"
                hint="Keep this concise. It can be used in product cards."
              >
                <input
                  name="shortDescription"
                  value={
                    form.shortDescription
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="A short summary of the product"
                  className={
                    inputClass
                  }
                  maxLength={500}
                />
              </Field>


              <Field
                label="Description"
                required
              >
                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Describe the product, its benefits, usage and important information..."
                  className={
                    textareaClass
                  }
                />
              </Field>


              <div className="grid gap-5 md:grid-cols-3">

                <Field
                  label="Brand"
                  hint="Choose No Brand for unbranded products. Select Other to enter a custom brand."
                >
                  <div className="relative">
                    <select
                      name="brand"
                      value={
                        form.brand
                      }
                      onChange={
                        handleChange
                      }
                      className={
                        selectClass
                      }
                    >
                      <option value="">
                        No Brand
                      </option>

                      <option value="Generic">
                        Generic
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                  </div>

                  {form.brand === "Other" && (
                    <input
                      value={customBrand}
                      onChange={(e) =>
                        setCustomBrand(e.target.value)
                      }
                      placeholder="Enter brand name"
                      className={`${inputClass} mt-3`}
                    />
                  )}
                </Field>


                <Field label="Product Type">
                  <div className="relative">
                    <select
                      name="productType"
                      value={
                        form.productType
                      }
                      onChange={
                        handleChange
                      }
                      className={
                        selectClass
                      }
                    >
                      <option value="simple">
                        Simple
                      </option>

                      <option value="variable">
                        Variable
                      </option>

                      <option value="digital">
                        Digital
                      </option>

                      <option value="service">
                        Service
                      </option>

                      <option value="bundle">
                        Bundle
                      </option>
                    </select>

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                  </div>
                </Field>


                <Field label="Currency">
                  <div className="relative">
                    <select
                      name="currency"
                      value={
                        form.currency
                      }
                      onChange={
                        handleChange
                      }
                      className={
                        selectClass
                      }
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

                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                    />
                  </div>
                </Field>

              </div>


              <Field label="Tags">
                <div className="flex gap-2">
                  <input
                    value={
                      tagInput
                    }
                    onChange={(e) =>
                      setTagInput(
                        e.target.value
                      )
                    }
                    onKeyDown={(e) => {
                      if (
                        e.key ===
                        "Enter"
                      ) {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Type a tag and press Enter"
                    className={
                      inputClass
                    }
                  />

                  <button
                    type="button"
                    onClick={
                      addTag
                    }
                    className={`${buttonClass} shrink-0 bg-zinc-950 text-white hover:bg-zinc-800`}
                  >
                    <Plus
                      size={16}
                    />
                    Add
                  </button>
                </div>


                {form.tags.length >
                  0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {form.tags.map(
                      (
                        tag,
                        index
                      ) => (
                        <span
                          key={`${tag}-${index}`}
                          className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-700"
                        >
                          {tag}

                          <button
                            type="button"
                            onClick={() =>
                              removeTag(
                                index
                              )
                            }
                            className="text-zinc-400 hover:text-red-600"
                          >
                            <X
                              size={
                                13
                              }
                            />
                          </button>
                        </span>
                      )
                    )}
                  </div>
                )}
              </Field>

            </div>
          </section>


          {/* ===========================================
              CATEGORY
          =========================================== */}

          <section
            id="category"
            data-aos="fade-up"
            className={cardClass}
          >
            <SectionHeader
              number="02"
              icon={
                Tag
              }
              title="Category & Product Attributes"
              description="Place the product in the correct category and describe its common attributes."
            />


            <div className="grid gap-5 md:grid-cols-2">

              <Field
                label="Category"
                required
              >
                <div className="relative">
                  <select
                    value={
                      form.category
                    }
                    onChange={
                      handleCategoryChange
                    }
                    disabled={
                      categoryLoading
                    }
                    className={
                      selectClass
                    }
                  >
                    <option value="">
                      {categoryLoading
                        ? "Loading categories..."
                        : "Select category"}
                    </option>

                    {parentCategories.map(
                      (
                        category
                      ) => (
                        <option
                          key={getCategoryId(
                            category
                          )}
                          value={getCategoryId(
                            category
                          )}
                        >
                          {
                            category.name
                          }
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                </div>
              </Field>


              <Field label="Subcategory">
                <div className="relative">
                  <select
                    value={
                      form.subCategory
                    }
                    onChange={(e) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          subCategory:
                            e.target.value,
                        })
                      )
                    }
                    disabled={
                      subCategoryLoading ||
                      !form.category
                    }
                    className={
                      selectClass
                    }
                  >
                    <option value="">
                      {subCategoryLoading
                        ? "Loading subcategories..."
                        : !form.category
                        ? "Select category first"
                        : subCategories.length
                        ? "Select subcategory"
                        : "No subcategories"}
                    </option>

                    {subCategories.map(
                      (
                        category
                      ) => (
                        <option
                          key={getCategoryId(
                            category
                          )}
                          value={getCategoryId(
                            category
                          )}
                        >
                          {
                            category.name
                          }
                        </option>
                      )
                    )}
                  </select>

                  <ChevronDown
                    size={16}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                </div>
              </Field>

            </div>


            {/* Product attributes */}

            <div className="mt-7 border-t border-zinc-100 pt-7">

              <div className="mb-4">
                <h3 className="font-bold">
                  Product Attributes
                </h3>

                <p className="mt-1 text-xs text-zinc-500">
                  Available fields are selected automatically from the category and subcategory.
                </p>
              </div>

              {!form.category ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-center text-sm text-zinc-500">
                  Select a category first to see relevant product fields.
                </div>
              ) : categoryFieldConfig.productFields.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-5 text-center text-sm text-zinc-500">
                  No predefined fields are configured for this category. You can continue with the standard product information.
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  {categoryFieldConfig.productFields.map((field) => {
                    const existing = form.attributes.find(
                      (item) => item.name === field.name
                    );

                    const value = existing?.value || "";

                    const updateValue = (nextValue) => {
                      setForm((prev) => {
                        const attributes = [...prev.attributes];
                        const attributeIndex = attributes.findIndex(
                          (item) => item.name === field.name
                        );

                        const nextAttribute = {
                          name: field.name,
                          value: nextValue,
                        };

                        if (attributeIndex >= 0) {
                          attributes[attributeIndex] = nextAttribute;
                        } else if (nextValue) {
                          attributes.push(nextAttribute);
                        }

                        return {
                          ...prev,
                          attributes,
                        };
                      });
                    };

                    return (
                      <Field
                        key={field.name}
                        label={field.name}
                      >
                        {field.type === "text" || !field.options ? (
                          <input
                            value={value}
                            onChange={(e) => updateValue(e.target.value)}
                            placeholder={`Enter ${field.name.toLowerCase()}`}
                            className={inputClass}
                          />
                        ) : (
                          <div className="relative">
                            <select
                              value={value}
                              onChange={(e) => updateValue(e.target.value)}
                              className={selectClass}
                            >
                              <option value="">
                                Select {field.name}
                              </option>

                              {field.options.map((option) => (
                                <option
                                  key={option}
                                  value={option}
                                >
                                  {option}
                                </option>
                              ))}
                            </select>

                            <ChevronDown
                              size={16}
                              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                            />
                          </div>
                        )}
                      </Field>
                    );
                  })}
                </div>
              )}

            </div>


            {/* Specifications */}

            <div className="mt-7 border-t border-zinc-100 pt-7">

              <div className="mb-4 flex items-center justify-between gap-4">

                <div>
                  <h3 className="font-bold">
                    Specifications
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    Example: Display → 6.7 inch, RAM → 8 GB.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    addSpecification
                  }
                  className={`${buttonClass} border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50`}
                >
                  <Plus
                    size={15}
                  />
                  Add Specification
                </button>

              </div>


              <div className="space-y-3">
                {form.specifications.map(
                  (
                    specification,
                    index
                  ) => (
                    <div
                      key={
                        index
                      }
                      className="grid gap-3 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <input
                        value={
                          specification.name
                        }
                        onChange={(e) =>
                          updateSpecification(
                            index,
                            "name",
                            e.target
                              .value
                          )
                        }
                        placeholder="Specification name"
                        className={
                          inputClass
                        }
                      />

                      <input
                        value={
                          specification.value
                        }
                        onChange={(e) =>
                          updateSpecification(
                            index,
                            "value",
                            e.target
                              .value
                          )
                        }
                        placeholder="Specification value"
                        className={
                          inputClass
                        }
                      />

                      <button
                        type="button"
                        onClick={() =>
                          removeSpecification(
                            index
                          )
                        }
                        className="flex h-12 items-center justify-center rounded-xl border border-red-100 px-4 text-red-500 hover:bg-red-50"
                      >
                        <Trash2
                          size={
                            16
                          }
                        />
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>

          </section>


          {/* ===========================================
              VARIANTS
          =========================================== */}

          <section
            id="variants"
            data-aos="fade-up"
            className={cardClass}
          >
            <div className="flex flex-wrap items-start justify-between gap-4">

              <SectionHeader
                number="03"
                icon={
                  Package
                }
                title="Product Variants"
                description="Every product needs at least one valid SKU, price and stock value."
              />

              {form.productType === "variable" && (
                <button
                  type="button"
                  onClick={addVariant}
                  className={`${buttonClass} bg-zinc-950 text-white hover:bg-zinc-800`}
                >
                  <Plus size={16} />
                  Add Variant
                </button>
              )}

            </div>


            <div className="space-y-6">

              {variants.map(
                (
                  variant,
                  index
                ) => (
                  <div
                    key={
                      index
                    }
                    className="rounded-3xl border border-zinc-200 bg-zinc-50/70 p-5"
                  >

                    <div className="mb-5 flex items-center justify-between gap-3">

                      <div>
                        <div className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-400">
                          Variant{" "}
                          {index +
                            1}
                        </div>

                        <h3 className="mt-1 font-bold">
                          {variant.sku ||
                            "New Variant"}
                        </h3>
                      </div>

                      {variants.length >
                        1 && (
                        <button
                          type="button"
                          onClick={() =>
                            removeVariant(
                              index
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50"
                        >
                          <Trash2
                            size={
                              14
                            }
                          />
                          Remove
                        </button>
                      )}

                    </div>


                    {/* SKU */}

                    <div className="grid gap-5 md:grid-cols-3">

                      <Field
                        label="SKU"
                        required
                      >
                        <input
                          value={
                            variant.sku
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "sku",
                              e.target
                                .value
                                .toUpperCase()
                            )
                          }
                          placeholder="SKU-001"
                          className={
                            inputClass
                          }
                        />
                      </Field>


                      <Field label="Barcode">
                        <input
                          value={
                            variant.barcode
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "barcode",
                              e.target
                                .value
                            )
                          }
                          placeholder="Optional barcode"
                          className={
                            inputClass
                          }
                        />
                      </Field>


                      <Field label="Variant Currency">
                        <div className="relative">
                          <select
                            value={variant.currency || form.currency}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "currency",
                                e.target.value
                              )
                            }
                            className={selectClass}
                          >
                            <option value="INR">INR — Indian Rupee</option>
                            <option value="USD">USD — US Dollar</option>
                            <option value="EUR">EUR — Euro</option>
                            <option value="GBP">GBP — Pound</option>
                          </select>
                          <ChevronDown
                            size={16}
                            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                          />
                        </div>
                      </Field>

                    </div>


                    {/* Price */}

                    <div className="mt-5 grid gap-5 md:grid-cols-4">

                      <Field
                        label="Selling Price"
                        required
                      >
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            variant.price
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "price",
                              e.target
                                .value
                            )
                          }
                          placeholder="999"
                          className={
                            inputClass
                          }
                        />
                      </Field>


                      <Field label="Compare At Price">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            variant.compareAtPrice
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "compareAtPrice",
                              e.target
                                .value
                            )
                          }
                          placeholder="1299"
                          className={
                            inputClass
                          }
                        />
                      </Field>


                      <Field label="Cost Price">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            variant.costPrice
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "costPrice",
                              e.target
                                .value
                            )
                          }
                          placeholder="600"
                          className={
                            inputClass
                          }
                        />
                      </Field>


                      <Field
                        label="GST (%)"
                        hint="Enter the GST percentage for this variant."
                      >
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={
                            variant.tax ?? 0
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "tax",
                              e.target.value
                            )
                          }
                          placeholder="18"
                          className={
                            inputClass
                          }
                        />
                      </Field>

                    </div>


                    {/* Inventory */}

                    <div className="mt-5 grid gap-5 md:grid-cols-4">

                      <Field
                        label="Stock"
                        required
                      >
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={
                            variant.stock
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "stock",
                              e.target
                                .value
                            )
                          }
                          placeholder="100"
                          className={
                            inputClass
                          }
                        />
                      </Field>


                      <Field label="Reserved Stock">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={
                            variant.reservedStock
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "reservedStock",
                              e.target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                        />
                      </Field>


                      <Field label="Low Stock Threshold">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={
                            variant.lowStockThreshold
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "lowStockThreshold",
                              e.target
                                .value
                            )
                          }
                          className={
                            inputClass
                          }
                        />
                      </Field>


                      <div className="flex items-end">

                        <label className="flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium">
                          <input
                            type="checkbox"
                            checked={
                              variant.trackInventory
                            }
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                "trackInventory",
                                e.target
                                  .checked
                              )
                            }
                            className="h-4 w-4 accent-black"
                          />

                          Track inventory
                        </label>

                      </div>

                    </div>


                    {/* Variant attributes */}

                    <div className="mt-6 border-t border-zinc-200 pt-6">

                      <div className="mb-4">
                        <h4 className="font-bold">
                          Variant Options
                        </h4>

                        <p className="mt-1 text-xs text-zinc-500">
                          Choose values such as size, color or storage. Options are based on the selected category.
                        </p>
                      </div>

                      {categoryFieldConfig.variantFields.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-4 text-sm text-zinc-500">
                          No predefined variant options are configured for this category.
                        </div>
                      ) : (
                        <div className="grid gap-5 md:grid-cols-2">
                          {categoryFieldConfig.variantFields.map((field) => {
                            const existing = variant.attributes.find(
                              (item) => item.name === field.name
                            );

                            return (
                              <Field
                                key={field.name}
                                label={field.name}
                              >
                                <div className="relative">
                                  <select
                                    value={existing?.value || ""}
                                    onChange={(e) => {
                                      const value = e.target.value;

                                      setVariants((prev) => {
                                        const updated = [...prev];
                                        const attributes = [
                                          ...updated[index].attributes,
                                        ];

                                        const attributeIndex =
                                          attributes.findIndex(
                                            (item) =>
                                              item.name === field.name
                                          );

                                        const nextAttribute = {
                                          name: field.name,
                                          value,
                                        };

                                        if (attributeIndex >= 0) {
                                          if (value) {
                                            attributes[attributeIndex] =
                                              nextAttribute;
                                          } else {
                                            attributes.splice(
                                              attributeIndex,
                                              1
                                            );
                                          }
                                        } else if (value) {
                                          attributes.push(nextAttribute);
                                        }

                                        updated[index] = {
                                          ...updated[index],
                                          attributes,
                                        };

                                        return updated;
                                      });
                                    }}
                                    className={selectClass}
                                  >
                                    <option value="">
                                      Select {field.name}
                                    </option>

                                    {field.options.map((option) => (
                                      <option
                                        key={option}
                                        value={option}
                                      >
                                        {option}
                                      </option>
                                    ))}
                                  </select>

                                  <ChevronDown
                                    size={16}
                                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400"
                                  />
                                </div>
                              </Field>
                            );
                          })}
                        </div>
                      )}

                    </div>


                    {/* Weight / dimensions */}

                    <div className="mt-6 border-t border-zinc-200 pt-6">

                      <h4 className="mb-4 font-bold">
                        Shipping Dimensions
                      </h4>

                      <div className="grid gap-5 md:grid-cols-2">

                        <div className="grid grid-cols-[1fr_120px] gap-3">

                          <Field label="Weight">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                variant.weight
                                  .value
                              }
                              onChange={(e) =>
                                handleVariantWeightChange(
                                  index,
                                  "value",
                                  e.target
                                    .value
                                )
                              }
                              placeholder="1"
                              className={
                                inputClass
                              }
                            />
                          </Field>

                          <Field label="Unit">
                            <select
                              value={
                                variant.weight
                                  .unit
                              }
                              onChange={(e) =>
                                handleVariantWeightChange(
                                  index,
                                  "unit",
                                  e.target
                                    .value
                                )
                              }
                              className={
                                selectClass
                              }
                            >
                              <option value="g">
                                g
                              </option>

                              <option value="kg">
                                kg
                              </option>

                              <option value="lb">
                                lb
                              </option>
                            </select>
                          </Field>

                        </div>


                        <div className="grid grid-cols-4 gap-2">

                          <Field label="Length">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                variant
                                  .dimensions
                                  .length
                              }
                              onChange={(e) =>
                                handleVariantDimensionChange(
                                  index,
                                  "length",
                                  e.target
                                    .value
                                )
                              }
                              className={
                                inputClass
                              }
                            />
                          </Field>

                          <Field label="Width">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                variant
                                  .dimensions
                                  .width
                              }
                              onChange={(e) =>
                                handleVariantDimensionChange(
                                  index,
                                  "width",
                                  e.target
                                    .value
                                )
                              }
                              className={
                                inputClass
                              }
                            />
                          </Field>

                          <Field label="Height">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                variant
                                  .dimensions
                                  .height
                              }
                              onChange={(e) =>
                                handleVariantDimensionChange(
                                  index,
                                  "height",
                                  e.target
                                    .value
                                )
                              }
                              className={
                                inputClass
                              }
                            />
                          </Field>

                          <Field label="Unit">
                            <select
                              value={
                                variant
                                  .dimensions
                                  .unit
                              }
                              onChange={(e) =>
                                handleVariantDimensionChange(
                                  index,
                                  "unit",
                                  e.target
                                    .value
                                )
                              }
                              className={
                                selectClass
                              }
                            >
                              <option value="cm">
                                cm
                              </option>

                              <option value="m">
                                m
                              </option>

                              <option value="in">
                                in
                              </option>
                            </select>
                          </Field>

                        </div>

                      </div>

                    </div>


                    {/* Backorder */}

                    <div className="mt-5 flex flex-wrap gap-3">

                      <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm">
                        <input
                          type="checkbox"
                          checked={
                            variant.allowBackorder
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "allowBackorder",
                              e.target
                                .checked
                            )
                          }
                          className="h-4 w-4 accent-black"
                        />

                        Allow backorders
                      </label>


                      <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm">
                        <input
                          type="checkbox"
                          checked={
                            variant.isActive
                          }
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              "isActive",
                              e.target
                                .checked
                            )
                          }
                          className="h-4 w-4 accent-black"
                        />

                        Active variant
                      </label>

                    </div>

                  </div>
                )
              )}

            </div>


            {/* Order quantity */}

            <div className="mt-7 border-t border-zinc-100 pt-7">

              <h3 className="mb-4 font-bold">
                Order Quantity
              </h3>

              <div className="grid gap-5 md:grid-cols-2">

                <Field label="Minimum Order Quantity">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    name="minimumOrderQuantity"
                    value={
                      form.minimumOrderQuantity
                    }
                    onChange={
                      handleChange
                    }
                    className={
                      inputClass
                    }
                  />
                </Field>


                <Field label="Maximum Order Quantity">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    name="maximumOrderQuantity"
                    value={
                      form.maximumOrderQuantity
                    }
                    onChange={
                      handleChange
                    }
                    className={
                      inputClass
                    }
                  />
                </Field>

              </div>

            </div>

          </section>


          {/* ===========================================
              SHIPPING
          =========================================== */}

          <section
            id="shipping"
            data-aos="fade-up"
            className={cardClass}
          >
            <SectionHeader
              number="04"
              icon={
                Truck
              }
              title="Shipping"
              description="Configure delivery, shipping cost and return settings."
            />


            <div className="grid gap-5 md:grid-cols-2">

              <Field label="Shipping Provider">
                <input
                  name="provider"
                  value={
                    form.shipping
                      .provider
                  }
                  onChange={
                    handleShippingChange
                  }
                  placeholder="e.g. Delhivery"
                  className={
                    inputClass
                  }
                />
              </Field>


              <Field label="Shipping Charge">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  name="charge"
                  value={
                    form.shipping
                      .charge
                  }
                  onChange={
                    handleShippingChange
                  }
                  disabled={
                    form.shipping
                      .freeShipping
                  }
                  className={
                    inputClass
                  }
                />
              </Field>


              <Field label="Processing Days">
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="processingDays"
                  value={
                    form.shipping
                      .processingDays
                  }
                  onChange={
                    handleShippingChange
                  }
                  className={
                    inputClass
                  }
                />
              </Field>


              <Field label="Return Days">
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="returnDays"
                  value={
                    form.shipping
                      .returnDays
                  }
                  onChange={
                    handleShippingChange
                  }
                  disabled={
                    !form.shipping
                      .returnable
                  }
                  className={
                    inputClass
                  }
                />
              </Field>

            </div>


            <div className="mt-5 flex flex-wrap gap-3">

              <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium">
                <input
                  type="checkbox"
                  name="freeShipping"
                  checked={
                    form.shipping
                      .freeShipping
                  }
                  onChange={
                    handleShippingChange
                  }
                  className="h-4 w-4 accent-black"
                />

                Free shipping
              </label>


              <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium">
                <input
                  type="checkbox"
                  name="returnable"
                  checked={
                    form.shipping
                      .returnable
                  }
                  onChange={
                    handleShippingChange
                  }
                  className="h-4 w-4 accent-black"
                />

                Product is returnable
              </label>

            </div>

          </section>


          {/* ===========================================
              DETAILS
          =========================================== */}

          <section
            id="details"
            data-aos="fade-up"
            className={cardClass}
          >
            <SectionHeader
              number="05"
              icon={
                Check
              }
              title="Product Details"
              description="Add material, warranty, returns and shipping information."
            />


            <div className="grid gap-5 md:grid-cols-2">

              <Field label="Material">
                <input
                  name="material"
                  value={
                    form.details
                      .material
                  }
                  onChange={
                    handleDetailsChange
                  }
                  placeholder="e.g. 100% Cotton"
                  className={
                    inputClass
                  }
                />
              </Field>


              <Field label="Warranty">
                <input
                  name="warranty"
                  value={
                    form.details
                      .warranty
                  }
                  onChange={
                    handleDetailsChange
                  }
                  placeholder="e.g. 1 year manufacturer warranty"
                  className={
                    inputClass
                  }
                />
              </Field>

            </div>


            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <Field label="Return Policy">
                <textarea
                  name="returnPolicy"
                  value={
                    form.details
                      .returnPolicy
                  }
                  onChange={
                    handleDetailsChange
                  }
                  placeholder="Explain the return conditions..."
                  className={
                    textareaClass
                  }
                />
              </Field>


              <Field label="Shipping Information">
                <textarea
                  name="shippingInformation"
                  value={
                    form.details
                      .shippingInformation
                  }
                  onChange={
                    handleDetailsChange
                  }
                  placeholder="Explain delivery expectations..."
                  className={
                    textareaClass
                  }
                />
              </Field>

            </div>

          </section>


          {/* ===========================================
              MEDIA
          =========================================== */}

          <section
            id="media"
            data-aos="fade-up"
            className={cardClass}
          >
            <SectionHeader
              number="06"
              icon={
                ImagePlus
              }
              title="Product Media"
              description="Upload high-quality product images and videos."
            />


            <div className="grid gap-5 md:grid-cols-2">

              <UploadBox
                icon={
                  ImagePlus
                }
                title="Product Images"
                description="PNG, JPG, JPEG or WEBP"
                files={
                  images
                }
                accept="image/*"
                onChange={
                  handleImageChange
                }
              />


              <UploadBox
                icon={
                  Video
                }
                title="Product Videos"
                description="MP4 and supported video formats"
                files={
                  videos
                }
                accept="video/*"
                onChange={
                  handleVideoChange
                }
              />

            </div>


            {/* Image list */}

            {images.length >
              0 && (
              <div className="mt-6">

                <h3 className="mb-3 text-sm font-bold">
                  Selected Images
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                  {images.map(
                    (
                      file,
                      index
                    ) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 p-3"
                      >

                        <div className="mb-3 aspect-square overflow-hidden rounded-xl bg-zinc-100">
                          <img
                            src={URL.createObjectURL(
                              file
                            )}
                            alt={
                              file.name
                            }
                            className="h-full w-full object-cover"
                            onLoad={(e) =>
                              URL.revokeObjectURL(
                                e.currentTarget
                                  .src
                              )
                            }
                          />
                        </div>

                        <p className="truncate text-xs font-semibold">
                          {
                            file.name
                          }
                        </p>

                        <p className="mt-1 text-[11px] text-zinc-500">
                          {formatFileSize(
                            file.size
                          )}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            removeImage(
                              index
                            )
                          }
                          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-black/80 text-white opacity-0 transition group-hover:opacity-100"
                        >
                          <X
                            size={
                              15
                            }
                          />
                        </button>

                      </div>
                    )
                  )}

                </div>
              </div>
            )}


            {/* Video list */}

            {videos.length >
              0 && (
              <div className="mt-6">

                <h3 className="mb-3 text-sm font-bold">
                  Selected Videos
                </h3>

                <div className="space-y-2">

                  {videos.map(
                    (
                      file,
                      index
                    ) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                      >
                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                            <Video
                              size={
                                17
                              }
                            />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {
                                file.name
                              }
                            </p>

                            <p className="text-xs text-zinc-500">
                              {formatFileSize(
                                file.size
                              )}
                            </p>
                          </div>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeVideo(
                              index
                            )
                          }
                          className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2
                            size={
                              16
                            }
                          />
                        </button>

                      </div>
                    )
                  )}

                </div>
              </div>
            )}

          </section>


          {/* ===========================================
              SEO + OFFER
          =========================================== */}

          <section
            id="seo"
            data-aos="fade-up"
            className={cardClass}
          >
            <SectionHeader
              number="07"
              icon={
                Search
              }
              title="SEO & Offer"
              description="Improve product discovery and optionally configure a promotion."
            />


            {/* SEO */}

            <div>

              <h3 className="mb-4 font-bold">
                Search Engine Optimization
              </h3>

              <div className="space-y-5">

                <Field
                  label="SEO Title"
                  hint="Automatically generated from title and brand. You can edit it if needed."
                >
                  <input
                    name="title"
                    value={
                      form.seo.title
                    }
                    onChange={(e) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          seo: {
                            ...prev.seo,
                            title:
                              e.target
                                .value,
                          },
                        })
                      )
                    }
                    placeholder="SEO title is generated automatically"
                    className={
                      inputClass
                    }
                    maxLength={
                      60
                    }
                  />
                  <div className="flex justify-end text-[11px] text-zinc-400">
                    {form.seo.title.length}/60
                  </div>
                </Field>


                <Field
                  label="SEO Description"
                  hint="Automatically generated from your product description, category, subcategory and brand."
                >
                  <textarea
                    name="description"
                    value={
                      form.seo
                        .description
                    }
                    onChange={(e) =>
                      setForm(
                        (prev) => ({
                          ...prev,
                          seo: {
                            ...prev.seo,
                            description:
                              e.target
                                .value,
                          },
                        })
                      )
                    }
                    placeholder="SEO description is generated automatically"
                    className={
                      textareaClass
                    }
                    maxLength={
                      160
                    }
                  />
                  <div className="flex justify-end text-[11px] text-zinc-400">
                    {form.seo.description.length}/160
                  </div>
                </Field>


                <Field
                  label="SEO Keywords"
                  hint="Generated automatically from the title, category, brand, tags and product attributes."
                >
                  <div className="flex min-h-[48px] flex-wrap gap-2 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                    {(form.seo.keywords || []).length > 0 ? (
                      form.seo.keywords.map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200"
                        >
                          {keyword}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400">
                        Keywords will appear automatically.
                      </span>
                    )}
                  </div>
                </Field>

                <Field
                  label="Canonical URL"
                  hint="Generated automatically from the product title."
                >
                  <input
                    name="canonicalUrl"
                    value={
                      form.seo
                        .canonicalUrl
                    }
                    onChange={
                      handleSEOChange
                    }
                    placeholder="https://example.com/product/..."
                    className={
                      inputClass
                    }
                  />
                </Field>

              </div>

            </div>


            {/* OFFER */}

            <div className="mt-8 border-t border-zinc-100 pt-8">

              <div className="mb-5 flex items-center justify-between gap-4">

                <div>
                  <h3 className="font-bold">
                    Promotional Offer
                  </h3>

                  <p className="mt-1 text-xs text-zinc-500">
                    Optional. The controller will normalize the offer before saving.
                  </p>
                </div>


                <label className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    name="enabled"
                    checked={
                      form.offer
                        .enabled
                    }
                    onChange={
                      handleOfferChange
                    }
                    className="h-4 w-4 accent-black"
                  />

                  Enable offer
                </label>

              </div>


              {form.offer.enabled && (
                <div className="space-y-5">

                  <div className="grid gap-5 md:grid-cols-3">

                    <Field label="Offer Type">
                      <select
                        name="type"
                        value={
                          form.offer
                            .type
                        }
                        onChange={
                          handleOfferChange
                        }
                        className={
                          selectClass
                        }
                      >
                        <option value="percentage">
                          Percentage
                        </option>

                        <option value="fixed">
                          Fixed Amount
                        </option>
                      </select>
                    </Field>


                    <Field label="Offer Value">
                      <input
                        type="number"
                        name="value"
                        min="0"
                        step="0.01"
                        value={
                          form.offer
                            .value
                        }
                        onChange={
                          handleOfferChange
                        }
                        className={
                          inputClass
                        }
                      />
                    </Field>


                    <Field label="Offer Label">
                      <input
                        name="label"
                        value={
                          form.offer
                            .label
                        }
                        onChange={
                          handleOfferChange
                        }
                        placeholder="Weekend Sale"
                        className={
                          inputClass
                        }
                      />
                    </Field>

                  </div>


                  <div className="grid gap-5 md:grid-cols-2">

                    <Field label="Start At">
                      <input
                        type="datetime-local"
                        name="startAt"
                        value={
                          form.offer
                            .startAt
                        }
                        onChange={
                          handleOfferChange
                        }
                        className={
                          inputClass
                        }
                      />
                    </Field>


                    <Field label="End At">
                      <input
                        type="datetime-local"
                        name="endAt"
                        value={
                          form.offer
                            .endAt
                        }
                        onChange={
                          handleOfferChange
                        }
                        className={
                          inputClass
                        }
                      />
                    </Field>

                  </div>


                  <div className="grid gap-5 md:grid-cols-2">

                    <Field label="Maximum Promotional Quantity">
                      <input
                        type="number"
                        name="maxQuantity"
                        min="0"
                        step="1"
                        value={
                          form.offer
                            .maxQuantity
                        }
                        onChange={
                          handleOfferChange
                        }
                        className={
                          inputClass
                        }
                      />
                    </Field>


                    <Field label="Promotion Code">
                      <input
                        name="promotionCode"
                        value={
                          form.offer
                            .promotionCode
                        }
                        onChange={
                          handleOfferChange
                        }
                        placeholder="SALE2026"
                        className={
                          inputClass
                        }
                      />
                    </Field>

                  </div>

                </div>
              )}

            </div>

          </section>


          {/* ===========================================
              FINAL SUBMIT
          =========================================== */}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/seller/products"
                )
              }
              className={`${buttonClass} border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50`}
            >
              Cancel
            </button>


            <button
              type="submit"
              disabled={
                loading
              }
              className={`${buttonClass} min-w-[190px] bg-zinc-950 text-white hover:bg-zinc-800`}
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating...
                </>
              ) : (
                <>
                  <Check
                    size={
                      17
                    }
                  />
                  Create Product
                </>
              )}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
};


export default AddProduct;

