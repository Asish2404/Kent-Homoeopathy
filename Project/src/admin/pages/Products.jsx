import { useMemo, useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { formatCurrency } from "../utils/formatters";
import { getProducts, createProduct, updateProduct, deleteProduct, exportProducts, getCategories } from "../services/admin.service";

const statusVariant = (status) => {
  const s = String(status).toLowerCase();
  if (s === "in stock" || s === "available") return "success";
  if (s === "low stock") return "warning";
  if (s === "out of stock") return "danger";
  return "neutral";
};

const emptyProductForm = {
  product_name: "",
  product_image: "",
  brand: "",
  short_description: "",
  detailed_description: "",
  quantity: "",
  pack: "",
  mrp_price: "",
  discountPercent: "",
  discount_price: "",
  stock: "0",
  category: "",
  isKentProduct: false,
  // New optional fields
  variants: [],
  benefits: [],
  ingredients: [],
  usage: [],
  dosage: "",
  latin_name: "",
  extra_images: [],
  rating: "",
  review_count: "",
  side_effects: [],
  precautions: [],
  storage_instructions: "",
  manufacturer_info: "",
  country_of_origin: "",
  shelf_life: "",
  suitable_age_group: "",
  prescription_required: false,
  potency: "",
  faq: [],
  // ===== Advanced Premium Product Fields =====
  medicine_type: "",
  sku: "",
  barcode: "",
  hsn_code: "",
  tags: [],
  net_quantity: "",
  weight: "",
  composition: [],
  gst: "0",
  gst_included: true,
  profit_margin: "0",
  potencies: [],
  how_it_works: [],
  uses: [],
  warnings: [],
  contraindications: [],
  drug_interactions: [],
  expiry: "",
  license_number: "",
  pack_contents: "",
  min_stock: "0",
  max_stock: "0",
  low_stock_alert: "0",
  out_of_stock: false,
  availability: "in_stock",
  warehouse: "",
  thumbnail_images: [],
  gallery_images: [],
  zoom_image: "",
  seo_title: "",
  seo_description: "",
  seo_keywords: "",
  slug: "",
  canonical_url: "",
  og_image: "",
  featured: false,
  best_seller: false,
  trending: false,
  recommended: false,
  new_arrival: false,
  home_page: false,
  hide_product: false,
  draft: false,
  publish: false,
  sold_count: "",
};

const ProductModal = ({ product, categories, onClose, onSave, saving }) => {
  const [form, setForm] = useState({ ...emptyProductForm });
  const [errors, setErrors] = useState({});
  const isEdit = !!product;

  useEffect(() => {
    if (product) {
      const incomingVariants = Array.isArray(product.variants) ? product.variants : [];
      const flatPotencies = Array.isArray(product.potencies) ? product.potencies : [];
      const variants = incomingVariants.length > 0
        ? incomingVariants.map((variant, index) => ({
            ...variant,
            potencies: Array.isArray(variant.potencies)
              ? variant.potencies
              : index === 0
                ? flatPotencies
                : [],
          }))
        : [{
            size: product.pack || "",
            unit: "ml",
            net_quantity: product.net_quantity || "",
            mrp_price: product.mrp_price ?? "",
            discount_price: product.discount_price ?? "",
            discountPercent: product.discountPercent ?? "",
            stock: product.stock ?? "0",
            sku: product.sku || "",
            barcode: product.barcode || "",
            weight: product.weight || "",
            status: "active",
            potencies: flatPotencies,
          }];

      setForm({
        product_name: product.product_name || "",
        product_image: product.product_image || "",
        brand: product.brand || "",
        short_description: product.short_description || "",
        detailed_description: product.detailed_description || "",
        quantity: product.quantity ?? "",
        pack: product.pack || "",
        mrp_price: product.mrp_price ?? "",
        discountPercent: product.discountPercent ?? "",
        discount_price: product.discount_price ?? "",
        stock: product.stock ?? "0",
        category: product.category?._id || product.category || "",
        isKentProduct: product.isKentProduct || false,
        variants,
        benefits: Array.isArray(product.benefits) ? product.benefits : [],
        ingredients: Array.isArray(product.ingredients) ? product.ingredients : [],
        usage: Array.isArray(product.usage) ? product.usage : [],
        dosage: product.dosage || "",
        latin_name: product.latin_name || "",
        extra_images: Array.isArray(product.extra_images) ? product.extra_images : [],
        rating: product.rating ?? "",
        review_count: product.review_count ?? "",
        side_effects: Array.isArray(product.side_effects) ? product.side_effects : [],
        precautions: Array.isArray(product.precautions) ? product.precautions : [],
        storage_instructions: product.storage_instructions || "",
        manufacturer_info: product.manufacturer_info || "",
        country_of_origin: product.country_of_origin || "",
        shelf_life: product.shelf_life || "",
        suitable_age_group: product.suitable_age_group || "",
        prescription_required: product.prescription_required || false,
        potency: product.potency || "",
        faq: Array.isArray(product.faq) ? product.faq : [],
        medicine_type: product.medicine_type || "",
        sku: product.sku || "",
        barcode: product.barcode || "",
        hsn_code: product.hsn_code || "",
        tags: Array.isArray(product.tags) ? product.tags : [],
        net_quantity: product.net_quantity || "",
        weight: product.weight || "",
        composition: Array.isArray(product.composition) ? product.composition : [],
        gst: product.gst ?? "0",
        gst_included: product.gst_included !== false,
        profit_margin: product.profit_margin ?? "0",
        how_it_works: Array.isArray(product.how_it_works) ? product.how_it_works : [],
        uses: Array.isArray(product.uses) ? product.uses : [],
        warnings: Array.isArray(product.warnings) ? product.warnings : [],
        contraindications: Array.isArray(product.contraindications) ? product.contraindications : [],
        drug_interactions: Array.isArray(product.drug_interactions) ? product.drug_interactions : [],
        expiry: product.expiry || "",
        license_number: product.license_number || "",
        pack_contents: product.pack_contents || "",
        min_stock: product.min_stock ?? "0",
        max_stock: product.max_stock ?? "0",
        low_stock_alert: product.low_stock_alert ?? "0",
        out_of_stock: product.out_of_stock || false,
        availability: product.availability || "in_stock",
        warehouse: product.warehouse || "",
        thumbnail_images: Array.isArray(product.thumbnail_images) ? product.thumbnail_images : [],
        gallery_images: Array.isArray(product.gallery_images) ? product.gallery_images : [],
        zoom_image: product.zoom_image || "",
        seo_title: product.seo_title || "",
        seo_description: product.seo_description || "",
        seo_keywords: product.seo_keywords || "",
        slug: product.slug || "",
        canonical_url: product.canonical_url || "",
        og_image: product.og_image || "",
        featured: product.featured || false,
        best_seller: product.best_seller || false,
        trending: product.trending || false,
        recommended: product.recommended || false,
        new_arrival: product.new_arrival || false,
        home_page: product.home_page || false,
        hide_product: product.hide_product || false,
        draft: product.draft || false,
        publish: product.publish || false,
        sold_count: product.sold_count ?? "",
      });
    } else {
      setForm({ ...emptyProductForm });
    }
    setErrors({});
  }, [product]);

  // Auto-calc discount & savings
  const mrpNum = Number(form.mrp_price) || 0;
  const priceNum = Number(form.discount_price) || 0;
  const discountPct = mrpNum > 0 && priceNum > 0 && mrpNum > priceNum
    ? Math.round(((mrpNum - priceNum) / mrpNum) * 100)
    : Number(form.discountPercent) || 0;
  const amountSaved = mrpNum > priceNum ? mrpNum - priceNum : 0;
  const gstVal = Number(form.gst) || 0;
  const profitMargin = gstVal > 0
    ? Math.round(((mrpNum - priceNum) / mrpNum) * 100)
    : discountPct;

  const validate = () => {
    const e = {};
    if (!form.product_name.trim()) e.product_name = "Product name is required";
    if (!form.product_image.trim()) e.product_image = "Image URL is required";
    if (!form.brand.trim()) e.brand = "Brand is required";
    if (!form.short_description.trim()) e.short_description = "Short description is required";
    if (!form.detailed_description.trim()) e.detailed_description = "Detailed description is required";
    if (!form.category) e.category = "Category is required";
    if (Number(form.stock) < 0) e.stock = "Stock cannot be negative";

    // Duplicate variant size check
    const sizes = (form.variants || []).map((v) => String(v.size || "").trim().toLowerCase()).filter(Boolean);
    if (new Set(sizes).size !== sizes.length) e.variants = "Duplicate variant sizes are not allowed";

    // Duplicate potency check
    const potencies = (form.variants || []).flatMap((variant) => Array.isArray(variant.potencies) ? variant.potencies : []);
    const potences = potencies.map((p) => String(p.value || "").trim().toLowerCase()).filter(Boolean);
    if (new Set(potences).size !== potences.length) e.potencies = "Duplicate potencies are not allowed";

    // Image URL validation
    for (const [field, label] of [["product_image", "Main image"], ["zoom_image", "Zoom image"]]) {
      const val = form[field];
      if (val && !/^https?:\/\/.+/.test(val)) {
        e[field] = `${label} must be a valid URL`;
      }
    }
    for (const f of ["extra_images", "thumbnail_images", "gallery_images"]) {
      for (const url of form[f] || []) {
        if (url && !/^https?:\/\/.+/.test(url)) {
          e[f] = "Image URLs must be valid http(s) links";
          break;
        }
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    const isCheckbox = ["isKentProduct", "prescription_required", "gst_included", "out_of_stock", "featured", "best_seller", "trending", "recommended", "new_arrival", "home_page", "hide_product", "draft", "publish"].includes(field);
    const value = isCheckbox ? e.target.checked : e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      const mrp = Number(field === "mrp_price" ? value : prev.mrp_price) || 0;
      const price = Number(field === "discount_price" ? value : prev.discount_price) || 0;
      const discountPercent = Number(field === "discountPercent" ? value : prev.discountPercent) || 0;

      if (field === "discountPercent" && mrp > 0) {
        next.discount_price = String(Math.max(0, Math.round(mrp - (mrp * discountPercent) / 100)));
      }

      if (field === "discount_price" && mrp > 0 && price > 0) {
        next.discountPercent = String(Math.max(0, Math.round(((mrp - price) / mrp) * 100)));
      }

      if (field === "mrp_price" && mrp > 0) {
        if (discountPercent > 0) {
          next.discount_price = String(Math.max(0, Math.round(mrp - (mrp * discountPercent) / 100)));
        } else if (price > 0) {
          next.discountPercent = String(Math.max(0, Math.round(((mrp - price) / mrp) * 100)));
        }
      }

      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  // Helpers for newline-separated string list fields
  const handleListText = (field) => (e) => {
    const items = e.target.value
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    setForm((prev) => ({ ...prev, [field]: items }));
  };
  const listTextValue = (field) => (Array.isArray(form[field]) ? form[field] : []).join("\n");

  // Dynamic array item manager (for arrays of objects with one text field)
  const handleArrayItem = (field, idx, e) => {
    const items = [...(form[field] || [])];
    items[idx] = e.target.value;
    setForm((prev) => ({ ...prev, [field]: items }));
  };
  const addArrayItem = (field) => setForm((prev) => ({ ...prev, [field]: [...(prev[field] || []), ""] }));
  const removeArrayItem = (field, idx) => setForm((prev) => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== idx) }));

  // Variants manager
  const handleVariantChange = (idx, key) => (e) => {
    setForm((prev) => {
      const variants = [...(prev.variants || [])];
      variants[idx] = { ...(variants[idx] || {}), [key]: e.target.value };
      return { ...prev, variants };
    });
  };
  const addVariant = () =>
    setForm((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), { size: "", unit: "ml", net_quantity: "", mrp_price: "", discount_price: "", discountPercent: "", stock: "", sku: "", barcode: "", weight: "", status: "active", potencies: [] }],
    }));
  const removeVariant = (idx) =>
    setForm((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== idx),
    }));
  const handleVariantPotencyChange = (variantIdx, potencyIdx, key) => (e) => {
    setForm((prev) => {
      const variants = [...(prev.variants || [])];
      const currentVariant = { ...(variants[variantIdx] || {}) };
      const potencies = [...(currentVariant.potencies || [])];
      potencies[potencyIdx] = { ...(potencies[potencyIdx] || {}), [key]: e.target.value };
      variants[variantIdx] = { ...currentVariant, potencies };
      return { ...prev, variants };
    });
  };
  const addVariantPotency = (variantIdx) =>
    setForm((prev) => {
      const variants = [...(prev.variants || [])];
      const currentVariant = { ...(variants[variantIdx] || {}) };
      currentVariant.potencies = [...(currentVariant.potencies || []), { value: "", mrp_price: "", discount_price: "", discountPercent: "", stock: "", sku: "" }];
      variants[variantIdx] = currentVariant;
      return { ...prev, variants };
    });
  const removeVariantPotency = (variantIdx, potencyIdx) =>
    setForm((prev) => {
      const variants = [...(prev.variants || [])];
      const currentVariant = { ...(variants[variantIdx] || {}) };
      currentVariant.potencies = (currentVariant.potencies || []).filter((_, i) => i !== potencyIdx);
      variants[variantIdx] = currentVariant;
      return { ...prev, variants };
    });

  // FAQ manager
  const handleFaqChange = (idx, key) => (e) => {
    setForm((prev) => {
      const faq = [...(prev.faq || [])];
      faq[idx] = { ...(faq[idx] || {}), [key]: e.target.value };
      return { ...prev, faq };
    });
  };
  const addFaq = () =>
    setForm((prev) => ({
      ...prev,
      faq: [...(prev.faq || []), { question: "", answer: "" }],
    }));
  const removeFaq = (idx) =>
    setForm((prev) => ({
      ...prev,
      faq: (prev.faq || []).filter((_, i) => i !== idx),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      quantity: form.quantity !== "" ? Number(form.quantity) : undefined,
      mrp_price: Number(form.mrp_price) || 0,
      discount_price: Number(form.discount_price) || 0,
      discountPercent: form.discountPercent !== "" ? Number(form.discountPercent) : undefined,
      stock: Number(form.stock) || 0,
      rating: form.rating !== "" ? Number(form.rating) : undefined,
      review_count: form.review_count !== "" ? Number(form.review_count) : undefined,
      gst: Number(form.gst) || 0,
      sold_count: form.sold_count !== "" ? Number(form.sold_count) : undefined,
      min_stock: Number(form.min_stock) || 0,
      max_stock: Number(form.max_stock) || 0,
      low_stock_alert: Number(form.low_stock_alert) || 0,
      variants: (form.variants || [])
        .filter((v) => v.size)
        .map((v) => ({
          size: v.size,
          unit: v.unit || "ml",
          net_quantity: v.net_quantity || "",
          mrp_price: Number(v.mrp_price) || 0,
          discount_price: Number(v.discount_price) || 0,
          discountPercent: Number(v.discountPercent) || 0,
          stock: Number(v.stock) || 0,
          sku: v.sku || "",
          barcode: v.barcode || "",
          weight: v.weight || "",
          status: v.status || "active",
          potencies: (v.potencies || [])
            .filter((p) => p.value)
            .map((p) => ({
              value: p.value,
              mrp_price: Number(p.mrp_price) || 0,
              discount_price: Number(p.discount_price) || 0,
              discountPercent: Number(p.discountPercent) || 0,
              stock: Number(p.stock) || 0,
              sku: p.sku || "",
            })),
        })),
      potencies: (form.variants || []).flatMap((v) => (v.potencies || [])
        .filter((p) => p.value)
        .map((p) => ({
          value: p.value,
          mrp_price: Number(p.mrp_price) || 0,
          discount_price: Number(p.discount_price) || 0,
          discountPercent: Number(p.discountPercent) || 0,
          stock: Number(p.stock) || 0,
          sku: p.sku || "",
        }))),
    };
    await onSave(payload);
  };

  const inputCls = (field) => `border ${errors[field] ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`;
  const labelCls = "text-xs font-bold text-neutral-700 block mb-1";

  const SectionHeader = ({ title, subtitle }) => (
    <div className="pt-5 border-t border-neutral-100 mt-5">
      <div className="text-sm font-extrabold text-neutral-900">{title}</div>
      {subtitle && <div className="text-xs text-neutral-400 mt-0.5">{subtitle}</div>}
    </div>
  );

  const ToggleCheckbox = ({ field, label }) => (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={form[field]}
        onChange={handleChange(field)}
        className="w-4 h-4 accent-[var(--brand-600)]"
      />
      <span className="text-sm font-semibold text-neutral-700">{label}</span>
    </label>
  );

  const DynamicList = ({ field, label, placeholder }) => (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="space-y-2">
        {(form[field] || []).map((item, idx) => (
          <div key={idx} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => handleArrayItem(field, idx, e)}
              className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm flex-1"
              placeholder={placeholder}
            />
            <button type="button" onClick={() => removeArrayItem(field, idx)} className="text-red-500 hover:text-red-700 text-xs font-bold px-2">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem(field)} className="text-xs font-bold text-[var(--brand-700)] hover:text-[var(--brand-800)]">+ Add {label.toLowerCase()}</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl mx-4 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200 sticky top-0 bg-white z-10">
          <div className="text-lg font-extrabold text-neutral-900">{isEdit ? "Edit Product" : "Add Product"}</div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* ===== BASIC INFORMATION ===== */}
          <SectionHeader title="Basic Information" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Product Name *</label>
              <input value={form.product_name} onChange={handleChange("product_name")} className={inputCls("product_name")} placeholder="Product name" />
              {errors.product_name && <div className="text-xs text-red-600 mt-1">{errors.product_name}</div>}
            </div>
            <div>
              <label className={labelCls}>Latin Name</label>
              <input value={form.latin_name} onChange={handleChange("latin_name")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. Belladonna" />
            </div>
            <div>
              <label className={labelCls}>Brand *</label>
              <input value={form.brand} onChange={handleChange("brand")} className={inputCls("brand")} placeholder="Brand name" />
              {errors.brand && <div className="text-xs text-red-600 mt-1">{errors.brand}</div>}
            </div>
            <div>
              <label className={labelCls}>Category *</label>
              <select value={form.category} onChange={handleChange("category")} className={inputCls("category")}>
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.category_name || cat.name || cat._id}</option>
                ))}
              </select>
              {errors.category && <div className="text-xs text-red-600 mt-1">{errors.category}</div>}
            </div>
            <div>
              <label className={labelCls}>Medicine Type</label>
              <input value={form.medicine_type} onChange={handleChange("medicine_type")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. Drops, Tablets, Ointment" />
            </div>
            <div>
              <label className={labelCls}>Potency (single)</label>
              <input value={form.potency} onChange={handleChange("potency")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. 30C" />
            </div>
            <div>
              <label className={labelCls}>SKU</label>
              <input value={form.sku} onChange={handleChange("sku")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. KNT-001" />
            </div>
            <div>
              <label className={labelCls}>Barcode</label>
              <input value={form.barcode} onChange={handleChange("barcode")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="EAN/UPC" />
            </div>
            <div>
              <label className={labelCls}>HSN Code</label>
              <input value={form.hsn_code} onChange={handleChange("hsn_code")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. 3003" />
            </div>
            <div>
              <label className={labelCls}>Net Quantity</label>
              <input value={form.net_quantity} onChange={handleChange("net_quantity")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. 30ml" />
            </div>
            <div>
              <label className={labelCls}>Weight</label>
              <input value={form.weight} onChange={handleChange("weight")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. 50g" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Short Description *</label>
            <textarea value={form.short_description} onChange={handleChange("short_description")} rows={2} className={inputCls("short_description")} placeholder="Brief description" />
            {errors.short_description && <div className="text-xs text-red-600 mt-1">{errors.short_description}</div>}
          </div>
          <div>
            <label className={labelCls}>Detailed Description *</label>
            <textarea value={form.detailed_description} onChange={handleChange("detailed_description")} rows={3} className={inputCls("detailed_description")} placeholder="Full product details" />
            {errors.detailed_description && <div className="text-xs text-red-600 mt-1">{errors.detailed_description}</div>}
          </div>
          <div>
            <label className={labelCls}>Tags (one per line)</label>
            <textarea rows={2} value={listTextValue("tags")} onChange={handleListText("tags")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder={"immunity\nayurvedic"} />
          </div>

          {/* ===== PRICING ===== */}
          <SectionHeader title="Pricing" subtitle="Auto-calculates discount, savings and profit margin" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>MRP</label>
              <input type="number" min="0" value={form.mrp_price} onChange={handleChange("mrp_price")} className={inputCls("mrp_price")} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Discount %</label>
              <input type="number" min="0" max="100" value={form.discountPercent} onChange={handleChange("discountPercent")} className={inputCls("discountPercent")} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Selling Price</label>
              <input type="number" min="0" value={form.discount_price} onChange={handleChange("discount_price")} className={inputCls("discount_price")} placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>GST (%)</label>
              <input type="number" min="0" value={form.gst} onChange={handleChange("gst")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm">
              <div className="text-xs text-emerald-700 font-bold">Discount %</div>
              <div className="text-lg font-extrabold text-emerald-700">{discountPct}%</div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-sm">
              <div className="text-xs text-amber-700 font-bold">Savings</div>
              <div className="text-lg font-extrabold text-amber-700">₹{amountSaved.toFixed(2)}</div>
            </div>
            <div className="p-3 bg-[var(--brand-50)] border border-[var(--brand-100)] rounded-xl text-sm">
              <div className="text-xs text-[var(--brand-700)] font-bold">Profit Margin</div>
              <div className="text-lg font-extrabold text-[var(--brand-700)]">{profitMargin}%</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ToggleCheckbox field="gst_included" label="GST Included in price" />
          </div>

          {/* ===== VARIANT MANAGER ===== */}
          <SectionHeader title="Variant Manager" subtitle="Manage unlimited pack sizes (10ml, 30ml, 100ml...)" />
          {errors.variants && <div className="text-xs text-red-600">{errors.variants}</div>}
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls}>Variants</label>
            <button type="button" onClick={addVariant} className="text-xs font-bold text-[var(--brand-700)] hover:text-[var(--brand-800)]">+ Add Variant</button>
          </div>
          {(form.variants || []).length === 0 && (
            <p className="text-xs text-neutral-400 mb-2">No variants added. Main product price/stock will be used.</p>
          )}
          {(form.variants || []).map((v, idx) => (
            <div key={idx} className="border border-neutral-100 rounded-2xl p-3 mb-3 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
                <input value={v.size || ""} onChange={handleVariantChange(idx, "size")} placeholder="Pack Size" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                <input value={v.unit || ""} onChange={handleVariantChange(idx, "unit")} placeholder="Unit (ml/g)" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                <input value={v.net_quantity || ""} onChange={handleVariantChange(idx, "net_quantity")} placeholder="Net Qty" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                <input type="number" value={v.mrp_price || ""} onChange={handleVariantChange(idx, "mrp_price")} placeholder="MRP" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                <input type="number" value={v.discountPercent || ""} onChange={handleVariantChange(idx, "discountPercent")} placeholder="Discount %" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                <input type="number" value={v.discount_price || ""} onChange={handleVariantChange(idx, "discount_price")} placeholder="Price" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                <input type="number" value={v.stock || ""} onChange={handleVariantChange(idx, "stock")} placeholder="Stock" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                <input value={v.sku || ""} onChange={handleVariantChange(idx, "sku")} placeholder="SKU" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                <input value={v.barcode || ""} onChange={handleVariantChange(idx, "barcode")} placeholder="Barcode" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                <input value={v.weight || ""} onChange={handleVariantChange(idx, "weight")} placeholder="Weight" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                <select value={v.status || "active"} onChange={handleVariantChange(idx, "status")} className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <button type="button" onClick={() => removeVariant(idx)} className="text-red-500 hover:text-red-700 text-xs font-bold justify-self-end">Remove</button>
              </div>

              <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-neutral-700">Variant Potencies</span>
                  <button type="button" onClick={() => addVariantPotency(idx)} className="text-xs font-bold text-[var(--brand-700)] hover:text-[var(--brand-800)]">+ Add Potency</button>
                </div>
                {(v.potencies || []).length === 0 && <p className="text-xs text-neutral-400">Add potencies for this pack size.</p>}
                <div className="space-y-2">
                  {(v.potencies || []).map((p, potencyIdx) => (
                    <div key={potencyIdx} className="grid grid-cols-2 sm:grid-cols-6 gap-2 items-center">
                      <input value={p.value || ""} onChange={handleVariantPotencyChange(idx, potencyIdx, "value")} placeholder="Potency" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                      <input type="number" value={p.mrp_price || ""} onChange={handleVariantPotencyChange(idx, potencyIdx, "mrp_price")} placeholder="MRP" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                      <input type="number" value={p.discountPercent || ""} onChange={handleVariantPotencyChange(idx, potencyIdx, "discountPercent")} placeholder="Discount %" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                      <input type="number" value={p.discount_price || ""} onChange={handleVariantPotencyChange(idx, potencyIdx, "discount_price")} placeholder="Price" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                      <input type="number" value={p.stock || ""} onChange={handleVariantPotencyChange(idx, potencyIdx, "stock")} placeholder="Stock" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                      <input value={p.sku || ""} onChange={handleVariantPotencyChange(idx, potencyIdx, "sku")} placeholder="SKU" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                      <button type="button" onClick={() => removeVariantPotency(idx, potencyIdx)} className="text-red-500 hover:text-red-700 text-xs font-bold sm:col-span-6 justify-self-end">Remove</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* ===== INVENTORY ===== */}
          <SectionHeader title="Inventory" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Current Stock</label>
              <input type="number" min="0" value={form.stock} onChange={handleChange("stock")} className={inputCls("stock")} placeholder="0" />
              {errors.stock && <div className="text-xs text-red-600 mt-1">{errors.stock}</div>}
            </div>
            <div>
              <label className={labelCls}>Minimum Stock</label>
              <input type="number" min="0" value={form.min_stock} onChange={handleChange("min_stock")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Maximum Stock</label>
              <input type="number" min="0" value={form.max_stock} onChange={handleChange("max_stock")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Low Stock Alert Threshold</label>
              <input type="number" min="0" value={form.low_stock_alert} onChange={handleChange("low_stock_alert")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="0" />
            </div>
            <div>
              <label className={labelCls}>Availability</label>
              <select value={form.availability} onChange={handleChange("availability")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm">
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="preorder">Pre-order</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Warehouse</label>
              <input value={form.warehouse} onChange={handleChange("warehouse")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. Warehouse A" />
            </div>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <ToggleCheckbox field="out_of_stock" label="Out of Stock" />
          </div>

          {/* ===== IMAGES ===== */}
          <SectionHeader title="Images" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Main Image *</label>
              <input value={form.product_image} onChange={handleChange("product_image")} className={inputCls("product_image")} placeholder="https://..." />
              {errors.product_image && <div className="text-xs text-red-600 mt-1">{errors.product_image}</div>}
              {form.product_image && (
                <img src={form.product_image} alt="preview" className="mt-2 w-20 h-20 rounded-xl object-cover border border-neutral-200" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              )}
            </div>
            <div>
              <label className={labelCls}>Zoom Image</label>
              <input value={form.zoom_image} onChange={handleChange("zoom_image")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="https://..." />
              {errors.zoom_image && <div className="text-xs text-red-600 mt-1">{errors.zoom_image}</div>}
            </div>
          </div>
          <div>
            <label className={labelCls}>Extra Images (one per line)</label>
            <textarea rows={2} value={listTextValue("extra_images")} onChange={handleListText("extra_images")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder={"https://...image2.jpg\nhttps://...image3.jpg"} />
            {errors.extra_images && <div className="text-xs text-red-600 mt-1">{errors.extra_images}</div>}
          </div>
          <div>
            <label className={labelCls}>Thumbnail Images (one per line)</label>
            <textarea rows={2} value={listTextValue("thumbnail_images")} onChange={handleListText("thumbnail_images")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder={"https://...thumb1.jpg\nhttps://...thumb2.jpg"} />
            {errors.thumbnail_images && <div className="text-xs text-red-600 mt-1">{errors.thumbnail_images}</div>}
          </div>
          <div>
            <label className={labelCls}>Gallery Images (one per line)</label>
            <textarea rows={2} value={listTextValue("gallery_images")} onChange={handleListText("gallery_images")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder={"https://...gallery1.jpg\nhttps://...gallery2.jpg"} />
            {errors.gallery_images && <div className="text-xs text-red-600 mt-1">{errors.gallery_images}</div>}
          </div>

          {/* ===== PRODUCT DETAILS ===== */}
          <SectionHeader title="Product Details" subtitle="All fields are optional and can be added/removed dynamically" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DynamicList field="benefits" label="Benefits" placeholder="e.g. Relieves fever" />
            <DynamicList field="ingredients" label="Ingredients" placeholder="e.g. Belladonna 30C" />
            <DynamicList field="composition" label="Composition" placeholder="e.g. Active ingredient" />
            <DynamicList field="uses" label="Uses" placeholder="e.g. For headaches" />
            <DynamicList field="how_it_works" label="How It Works" placeholder="e.g. Stimulates natural healing" />
            <div>
              <label className={labelCls}>Dosage</label>
              <input value={form.dosage} onChange={handleChange("dosage")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. 3-4 drops, 3x daily" />
            </div>
            <DynamicList field="usage" label="How to Use" placeholder="e.g. Take 3 drops in water" />
            <DynamicList field="side_effects" label="Side Effects" placeholder="e.g. None known" />
            <DynamicList field="precautions" label="Precautions" placeholder="e.g. Keep out of reach of children" />
            <DynamicList field="warnings" label="Warnings" placeholder="e.g. Avoid during pregnancy" />
            <DynamicList field="contraindications" label="Contraindications" placeholder="e.g. Not for children under 2" />
            <DynamicList field="drug_interactions" label="Drug Interactions" placeholder="e.g. Avoid with beta-blockers" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Storage Instructions</label>
              <input value={form.storage_instructions} onChange={handleChange("storage_instructions")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. Store in a cool dry place" />
            </div>
            <div>
              <label className={labelCls}>Shelf Life</label>
              <input value={form.shelf_life} onChange={handleChange("shelf_life")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. 36 months" />
            </div>
            <div>
              <label className={labelCls}>Expiry</label>
              <input value={form.expiry} onChange={handleChange("expiry")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. 12/2027" />
            </div>
            <div>
              <label className={labelCls}>Manufacturer</label>
              <input value={form.manufacturer_info} onChange={handleChange("manufacturer_info")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. Dr. Kent Homoeopathy" />
            </div>
            <div>
              <label className={labelCls}>Country of Origin</label>
              <input value={form.country_of_origin} onChange={handleChange("country_of_origin")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. India" />
            </div>
            <div>
              <label className={labelCls}>License Number</label>
              <input value={form.license_number} onChange={handleChange("license_number")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. MH-12345" />
            </div>
            <div>
              <label className={labelCls}>Suitable Age Group</label>
              <input value={form.suitable_age_group} onChange={handleChange("suitable_age_group")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. Adults & Children 2+" />
            </div>
            <div>
              <label className={labelCls}>Pack Contents</label>
              <input value={form.pack_contents} onChange={handleChange("pack_contents")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. 1 bottle of 30ml" />
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <ToggleCheckbox field="prescription_required" label="Prescription Required" />
          </div>

          {/* Rating / Reviews / Sold */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className={labelCls}>Rating (0-5)</label>
              <input type="number" step="0.1" min="0" max="5" value={form.rating} onChange={handleChange("rating")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. 4.6" />
            </div>
            <div>
              <label className={labelCls}>Review Count</label>
              <input type="number" min="0" value={form.review_count} onChange={handleChange("review_count")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. 128" />
            </div>
            <div>
              <label className={labelCls}>Sold Count</label>
              <input type="number" min="0" value={form.sold_count} onChange={handleChange("sold_count")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. 1000" />
            </div>
          </div>

          {/* ===== FAQ ===== */}
          <SectionHeader title="FAQ" />
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls}>FAQs</label>
            <button type="button" onClick={addFaq} className="text-xs font-bold text-[var(--brand-700)] hover:text-[var(--brand-800)]">+ Add FAQ</button>
          </div>
          {(form.faq || []).length === 0 && <p className="text-xs text-neutral-400 mb-2">No FAQs added yet.</p>}
          {(form.faq || []).map((f, idx) => (
            <div key={idx} className="border border-neutral-100 rounded-2xl p-3 mb-3 space-y-2">
              <input value={f.question || ""} onChange={handleFaqChange(idx, "question")} placeholder="Question" className="w-full border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
              <textarea rows={2} value={f.answer || ""} onChange={handleFaqChange(idx, "answer")} placeholder="Answer" className="w-full border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
              <button type="button" onClick={() => removeFaq(idx)} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove FAQ</button>
            </div>
          ))}

          {/* ===== SEO ===== */}
          <SectionHeader title="SEO" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>SEO Title</label>
              <input value={form.seo_title} onChange={handleChange("seo_title")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="Meta title" />
            </div>
            <div>
              <label className={labelCls}>Slug</label>
              <input value={form.slug} onChange={handleChange("slug")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. belladonna-30c" />
            </div>
            <div>
              <label className={labelCls}>Canonical URL</label>
              <input value={form.canonical_url} onChange={handleChange("canonical_url")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="https://..." />
            </div>
            <div>
              <label className={labelCls}>Open Graph Image</label>
              <input value={form.og_image} onChange={handleChange("og_image")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="https://..." />
            </div>
            <div>
              <label className={labelCls}>SEO Description</label>
              <textarea rows={2} value={form.seo_description} onChange={handleChange("seo_description")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="Meta description" />
            </div>
            <div>
              <label className={labelCls}>SEO Keywords</label>
              <textarea rows={2} value={form.seo_keywords} onChange={handleChange("seo_keywords")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="comma, separated, keywords" />
            </div>
          </div>

          {/* ===== PRODUCT STATUS ===== */}
          <SectionHeader title="Product Status" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ToggleCheckbox field="featured" label="Featured" />
            <ToggleCheckbox field="best_seller" label="Best Seller" />
            <ToggleCheckbox field="trending" label="Trending" />
            <ToggleCheckbox field="recommended" label="Recommended" />
            <ToggleCheckbox field="new_arrival" label="New Arrival" />
            <ToggleCheckbox field="home_page" label="Home Page" />
            <ToggleCheckbox field="hide_product" label="Hide Product" />
            <ToggleCheckbox field="draft" label="Draft" />
            <ToggleCheckbox field="publish" label="Publish" />
          </div>
          <div className="flex items-center gap-3">
            <ToggleCheckbox field="isKentProduct" label="Kent Product" />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-neutral-100">
            <button type="button" onClick={onClose} className="btn-outline px-5 py-3" disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary px-5 py-3" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ product, onClose, onConfirm, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm mx-4 p-6">
      <div className="text-lg font-extrabold text-neutral-900 mb-2">Delete Product</div>
      <div className="text-sm text-neutral-600 mb-4">
        Are you sure you want to delete <strong>{product?.product_name || product?.name || "this product"}</strong>? This action cannot be undone.
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="btn-outline px-4 py-3" disabled={deleting}>Cancel</button>
        <button onClick={() => onConfirm(product._id)} className="btn-outline px-4 py-3 !text-red-600 !border-red-300 hover:!bg-red-50" disabled={deleting}>
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
);

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteProductItem, setDeleteProductItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  const notify = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProducts();
      setProducts(res.products || []);
      const catRes = await getCategories();
      const cats = catRes.categories || catRes.data?.categories || [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error("Products load error:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const name = (p.product_name || p.name || "").toLowerCase();
      const cat = p.category?.category_name || p.category || "";
      const catStr = typeof cat === "string" ? cat.toLowerCase() : "";
      const id = (p._id || "").toLowerCase();
      const matchesQuery = !q || name.includes(q) || catStr.includes(q) || id.includes(q);
      const stockStatus = String(p.stockStatus || p.status || "In Stock");
      const matchesStatus = status === "All" ? true : stockStatus === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status, products]);

  const handleCreate = () => {
    setEditProduct(null);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowModal(true);
  };

  const handleSave = async (payload) => {
    try {
      setSaving(true);
      if (editProduct) {
        await updateProduct(editProduct._id, payload);
        notify("Product updated successfully");
      } else {
        await createProduct(payload);
        notify("Product created successfully");
      }
      setShowModal(false);
      setEditProduct(null);
      await loadProducts();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Operation failed";
      notify(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    try {
      setDeleting(true);
      await deleteProduct(productId);
      notify("Product deleted successfully");
      setDeleteProductItem(null);
      await loadProducts();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Delete failed";
      notify(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleKent = async (product) => {
    try {
      await updateProduct(product._id, { isKentProduct: !product.isKentProduct });
      notify(`Kent product ${product.isKentProduct ? "removed" : "set"} successfully`);
      await loadProducts();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Toggle failed";
      notify(msg, "error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-2xl shadow-lg text-sm font-bold text-white ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {notification.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Product Management</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Products</div>
          <div className="mt-1 text-sm text-neutral-500">Browse and manage product catalog.</div>
        </div>
        <div className="flex gap-2">
          <select
            onChange={(e) => { if (e.target.value) { exportProducts(e.target.value); e.target.value = ""; } }}
            className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none text-sm bg-white cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Export</option>
            <option value="csv">CSV</option>
            <option value="xlsx">Excel (.xlsx)</option>
          </select>
          <button className="btn-primary" onClick={handleCreate}>
            Add Product
          </button>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full sm:w-80"
              placeholder="Search products..."
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none"
            >
              <option>All</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>

          <div className="text-sm text-neutral-500">
            Showing <span className="font-extrabold text-neutral-900">{filtered.length}</span> items
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-neutral-500 font-semibold">Loading products...</div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-600 font-extrabold mb-2">Error</div>
              <div className="text-neutral-500 text-sm mb-3">{error}</div>
              <button className="btn-primary" onClick={loadProducts}>Retry</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
<thead className="text-left text-xs text-neutral-500">
                  <tr>
                    <th className="font-bold py-3">Product</th>
                    <th className="font-bold py-3">Category</th>
                    <th className="font-bold py-3">Price</th>
                    <th className="font-bold py-3">Discount</th>
                    <th className="font-bold py-3">Stock</th>
                    <th className="font-bold py-3">Kent</th>
                    <th className="font-bold py-3">Status</th>
                    <th className="font-bold py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filtered.map((p) => {
                    const name = p.product_name || p.name || "Unknown";
                    const category = p.category?.category_name || p.category || "N/A";
                    const price = p.discount_price || p.mrp_price || p.price || 0;
                    const mrp = p.mrp_price || p.price || 0;
                    const discount = mrp > 0 ? Math.round((1 - price / mrp) * 100) : 0;
                    const stock = p.stock || p.currentStock || p.availableStock || 0;
                    const stockStatus = p.stockStatus || p.status || "In Stock";
                    const image = p.product_image || "/src/assets/Product_image.png";
                    const isKent = p.isKentProduct || false;

                    return (
                      <tr key={p._id} className="border-t border-neutral-200">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={image}
                              alt={name}
                              className="w-12 h-12 rounded-2xl object-cover border border-neutral-200"
                            />
                            <div className="min-w-0">
                              <div className="font-extrabold text-neutral-900 truncate">{name}</div>
                              <div className="text-xs text-neutral-500">{p._id?.slice(-8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-neutral-700">{typeof category === "string" ? category : category?.category_name || "N/A"}</td>
                        <td className="py-3 font-extrabold text-neutral-900">{formatCurrency(price)}</td>
                        <td className="py-3 text-neutral-700">{discount}%</td>
                        <td className="py-3 font-extrabold text-neutral-900">{stock}</td>
                        <td className="py-3">
                          <button
                            onClick={() => handleToggleKent(p)}
                            className={`px-2.5 py-1 rounded-2xl text-xs font-bold border ${isKent
                                ? "bg-brand-50 text-brand-700 border-brand-200"
                                : "bg-neutral-50 text-neutral-400 border-neutral-200"
                              }`}
                          >
                            {isKent ? "Yes" : "No"}
                          </button>
                        </td>
                        <td className="py-3">
                          <Badge variant={statusVariant(stockStatus)}>{stockStatus}</Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button className="btn-outline px-3 py-2" onClick={() => handleEdit(p)}>Edit</button>
                            <button className="btn-outline px-3 py-2" onClick={() => setDeleteProductItem(p)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="py-10">
                        <EmptyState title="No matching products" description="Try adjusting your search or filter." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>

      {showModal && (
        <ProductModal
          product={editProduct}
          categories={categories}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSave={handleSave}
          saving={saving}
        />
      )}

      {deleteProductItem && (
        <DeleteConfirmModal
          product={deleteProductItem}
          onClose={() => setDeleteProductItem(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default Products;
