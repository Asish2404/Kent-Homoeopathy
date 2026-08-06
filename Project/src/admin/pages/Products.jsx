import { useMemo, useState, useEffect, useCallback, useRef } from "react";
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

const SectionHeader = ({ title, subtitle }) => (
  <div className="pt-5 border-t border-neutral-100 mt-5">
    <div className="text-sm font-extrabold text-neutral-900">{title}</div>
    {subtitle && <div className="text-xs text-neutral-400 mt-0.5">{subtitle}</div>}
  </div>
);

const ToggleCheckbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="w-4 h-4 accent-(--brand-600)"
    />
    <span className="text-sm font-semibold text-neutral-700">{label}</span>
  </label>
);

const emptyProductForm = {
  product_name: "",
  product_image: "",
  brand: "",
  short_description: "",
  detailed_description: "",
  category: "",
  medicine_type: "",
  isKentProduct: false,
  // Variants (new simplified schema)
  variants: [],
  // Homepage sections
  featured: false,
  new_arrival: false,
  trending: false,
  best_seller: false,
  top_pick: false,
  // Status
  hide_product: false,
  draft: false,
};

// Default values for a new, empty variant.
const emptyVariant = {
  size: "",
  potency: "",
  mrp_price: "",
  discount_percent: "",
  selling_price: "",
  min_order_qty: "1",
  stock: "0",
  expiry_date: "",
  rating: "0",
  review_count: "0",
  out_of_stock: false,
  not_available: false,
};

// Auto-calculate selling price from MRP & discount %.
const computeSellingPrice = (mrp, discountPct) => {
  const m = Number(mrp) || 0;
  const d = Math.max(0, Math.min(100, Number(discountPct) || 0));
  return Math.max(0, m - (m * d) / 100);
};

const IMAGE_MODE_UPLOAD = "upload";
const IMAGE_MODE_URL = "url";

const inferImageMode = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return IMAGE_MODE_UPLOAD;
  return trimmed.startsWith("data:image/") ? IMAGE_MODE_UPLOAD : IMAGE_MODE_URL;
};

const isValidImageUrl = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const ProductModal = ({ product, categories, onClose, onSave, saving }) => {
  const [form, setForm] = useState(() => ({
    ...emptyProductForm,
    ...(product
      ? {
          product_name: product.product_name || "",
          product_image: product.product_image || "",
          brand: product.brand || "",
          short_description: product.short_description || "",
          detailed_description: product.detailed_description || "",
          category: product.category?._id || product.category || "",
          medicine_type: product.medicine_type || "",
          isKentProduct: product.isKentProduct || false,
          variants: Array.isArray(product.variants) && product.variants.length > 0 ? product.variants : [],
          featured: product.featured || false,
          new_arrival: product.new_arrival || false,
          trending: product.trending || false,
          best_seller: product.best_seller || false,
          top_pick: product.top_pick || false,
          hide_product: product.hide_product || false,
          draft: product.draft || false,
        }
      : {}),
  }));
  const [errors, setErrors] = useState({});
  const [imageMode, setImageMode] = useState(() => inferImageMode(product?.product_image));
  const [imageUrlInput, setImageUrlInput] = useState(() => product?.product_image || "");
  const [imageMessage, setImageMessage] = useState("");
  const fileInputRef = useRef(null);
  const urlInputRef = useRef(null);
  const isEdit = !!product;

  const validate = () => {
    const e = {};
    if (!form.product_name.trim()) e.product_name = "Product name is required";
    if (!form.product_image.trim()) e.product_image = "Image URL is required";
    if (!form.brand.trim()) e.brand = "Brand is required";
    if (!form.short_description.trim()) e.short_description = "Short description is required";
    if (!form.detailed_description.trim()) e.detailed_description = "Detailed description is required";
    if (!form.category) e.category = "Category is required";

    // Duplicate variant check (by size + potency combo)
    const comboSet = new Set();
    for (const v of form.variants || []) {
      const combo = `${String(v.size || "").trim().toLowerCase()}::${String(v.potency || "").trim().toLowerCase()}`;
      if (v.size || v.potency) {
        if (comboSet.has(combo)) {
          e.variants = "Duplicate variant (same size + potency) is not allowed";
          break;
        }
        comboSet.add(combo);
      }
    }

    // Accept either a remote URL or a locally uploaded image.
    if (form.product_image && !/^(https?:\/\/|data:image\/)/.test(form.product_image)) {
      e.product_image = "Image must be a valid URL or uploaded image";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    const isCheckbox = ["isKentProduct", "featured", "new_arrival", "trending", "best_seller", "top_pick", "hide_product", "draft"].includes(field);
    const value = isCheckbox ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const clearImageSelection = (nextMode = imageMode) => {
    setImageMode(nextMode);
    setImageUrlInput("");
    setImageMessage("");
    setForm((prev) => ({ ...prev, product_image: "" }));
    setErrors((prev) => ({ ...prev, product_image: undefined }));
  };

  const handleImageModeChange = (nextMode) => {
    if (nextMode === imageMode) return;
    clearImageSelection(nextMode);
  };

  const handleImagePick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setImageMessage("Please choose a JPG, PNG, or WEBP image.");
      setErrors((prev) => ({ ...prev, product_image: "Please choose a JPG, PNG, or WEBP image." }));
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setImageMode(IMAGE_MODE_UPLOAD);
      setImageUrlInput("");
      setImageMessage("");
      setForm((prev) => ({ ...prev, product_image: result }));
      if (errors.product_image) setErrors((prev) => ({ ...prev, product_image: undefined }));
    };
    reader.onerror = () => {
      setImageMessage("Unable to read selected image.");
      setErrors((prev) => ({ ...prev, product_image: "Unable to read selected image" }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleImageUrlChange = (e) => {
    const value = e.target.value;
    setImageUrlInput(value);

    const trimmed = value.trim();
    if (!trimmed) {
      setImageMessage("Enter an image URL to preview it.");
      setForm((prev) => ({ ...prev, product_image: "" }));
      setErrors((prev) => ({ ...prev, product_image: undefined }));
      return;
    }

    if (!isValidImageUrl(trimmed)) {
      setImageMessage("Please enter a valid image URL.");
      setForm((prev) => ({ ...prev, product_image: "" }));
      setErrors((prev) => ({ ...prev, product_image: "Please enter a valid image URL." }));
      return;
    }

    setImageMode(IMAGE_MODE_URL);
    setImageMessage("");
    setForm((prev) => ({ ...prev, product_image: trimmed }));
    if (errors.product_image) setErrors((prev) => ({ ...prev, product_image: undefined }));
  };

  // ---- Variant manager ----
  const handleVariantChange = (idx, key) => (e) => {
    setForm((prev) => {
      const variants = [...(prev.variants || [])];
      const current = { ...(variants[idx] || {}) };
      let value = e.target.value;
      if (["out_of_stock", "not_available"].includes(key)) {
        value = e.target.checked;
      }
      current[key] = value;

      // Auto-calculate selling price whenever MRP or Discount changes.
      if (key === "mrp_price" || key === "discount_percent") {
        current.selling_price = computeSellingPrice(
          key === "mrp_price" ? value : current.mrp_price,
          key === "discount_percent" ? value : current.discount_percent
        );
      }

      variants[idx] = current;
      return { ...prev, variants };
    });
    if (errors.variants) setErrors((prev) => ({ ...prev, variants: undefined }));
  };

  const addVariant = () =>
    setForm((prev) => ({
      ...prev,
      variants: [...(prev.variants || []), { ...emptyVariant }],
    }));

  const removeVariant = (idx) =>
    setForm((prev) => ({
      ...prev,
      variants: (prev.variants || []).filter((_, i) => i !== idx),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      // Keep product-level price fields for backward compatibility by
      // deriving them from the first variant when present.
      mrp_price: Number(form.variants?.[0]?.mrp_price) || 0,
      discount_price: Number(form.variants?.[0]?.selling_price) || 0,
      stock: Number(form.variants?.[0]?.stock) || 0,
      variants: (form.variants || [])
        .filter((v) => v.size || v.potency)
        .map((v) => ({
          size: v.size || "",
          potency: v.potency || "",
          mrp_price: Number(v.mrp_price) || 0,
          discount_percent: Math.max(0, Math.min(100, Number(v.discount_percent) || 0)),
          selling_price: computeSellingPrice(v.mrp_price, v.discount_percent),
          min_order_qty: Math.max(1, Number(v.min_order_qty) || 1),
          stock: Number(v.stock) || 0,
          expiry_date: v.expiry_date || "",
          rating: Number(v.rating) || 0,
          review_count: Number(v.review_count) || 0,
          out_of_stock: Boolean(v.out_of_stock),
          not_available: Boolean(v.not_available),
        })),
    };

    await onSave(payload);
  };

  const inputCls = (field) => `border ${errors[field] ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`;
  const labelCls = "text-xs font-bold text-neutral-700 block mb-1";

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

          {/* ===== PRODUCT IMAGE (single) ===== */}
          <SectionHeader title="Product Image" subtitle="Choose one image for the product using either a local file or a direct URL." />
          <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
            <label className={labelCls}>Product Image *</label>
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm">
              <button
                type="button"
                onClick={() => handleImageModeChange(IMAGE_MODE_UPLOAD)}
                className={`flex-1 min-w-37.5 rounded-xl px-4 py-3 text-sm font-semibold transition ${imageMode === IMAGE_MODE_UPLOAD ? "bg-(--brand-600) text-white shadow" : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"}`}
              >
                Upload from Device
              </button>
              <button
                type="button"
                onClick={() => handleImageModeChange(IMAGE_MODE_URL)}
                className={`flex-1 min-w-37.5 rounded-xl px-4 py-3 text-sm font-semibold transition ${imageMode === IMAGE_MODE_URL ? "bg-(--brand-600) text-white shadow" : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100"}`}
              >
                Upload via Image URL
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImagePick} className="hidden" />

            {imageMode === IMAGE_MODE_UPLOAD ? (
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-outline px-4 py-3">
                    Choose Image
                  </button>
                  {form.product_image && (
                    <>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="btn-outline px-4 py-3">
                        Replace Image
                      </button>
                      <button type="button" onClick={() => clearImageSelection(IMAGE_MODE_UPLOAD)} className="btn-outline px-4 py-3 text-red-600">
                        Remove Image
                      </button>
                    </>
                  )}
                </div>
                <div className="text-xs text-neutral-500">Supported formats: JPG, PNG, WEBP.</div>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <input
                  ref={urlInputRef}
                  value={imageUrlInput}
                  onChange={handleImageUrlChange}
                  type="url"
                  placeholder="https://example.com/product-image.jpg"
                  className={inputCls("product_image")}
                />
                <div className="text-xs text-neutral-500">Enter a direct image URL and preview it live before saving.</div>
              </div>
            )}

            {errors.product_image && <div className="text-xs text-red-600 mt-3">{errors.product_image}</div>}
            {imageMessage && !errors.product_image && <div className="text-xs text-amber-600 mt-3">{imageMessage}</div>}

            {form.product_image && (
              <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="text-sm font-semibold text-neutral-800">Image Preview</div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => (imageMode === IMAGE_MODE_URL ? urlInputRef.current?.focus() : fileInputRef.current?.click())}
                      className="btn-outline px-3 py-2 text-sm"
                    >
                      Replace Image
                    </button>
                    <button type="button" onClick={() => clearImageSelection(imageMode)} className="btn-outline px-3 py-2 text-sm text-red-600">
                      Remove Image
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <img
                    src={form.product_image}
                    alt="preview"
                    className="w-24 h-24 rounded-xl object-cover border border-neutral-200"
                    onError={() => setImageMessage("This image could not be loaded. Please try a different URL or file.")}
                  />
                  <div className="text-xs text-neutral-500 leading-5">
                    <div className="font-semibold text-neutral-700">Stored image</div>
                    <div>This product will use a single image asset.</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ===== VARIANT MANAGER ===== */}
          <SectionHeader
            title="Variants"
            subtitle="Each variant holds its own MRP, discount %, auto-calculated selling price, minimum qty, potency, pack size, stock, expiry, rating and availability."
          />
          {errors.variants && <div className="text-xs text-red-600">{errors.variants}</div>}
          <div className="flex items-center justify-between mb-2">
            <label className={labelCls}>Variants</label>
            <button type="button" onClick={addVariant} className="text-xs font-bold text-(--brand-700) hover:text-(--brand-800)">+ Add Variant</button>
          </div>
          {(form.variants || []).length === 0 && (
            <p className="text-xs text-neutral-400 mb-2">No variants added yet. Add at least one variant to set pricing and stock.</p>
          )}
          {(form.variants || []).map((v, idx) => {
            const selling = computeSellingPrice(v.mrp_price, v.discount_percent);
            return (
              <div key={idx} className="border border-neutral-100 rounded-2xl p-3 mb-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-neutral-700">Variant #{idx + 1}</span>
                  <button type="button" onClick={() => removeVariant(idx)} className="text-red-500 hover:text-red-700 text-xs font-bold">Remove</button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input value={v.size || ""} onChange={handleVariantChange(idx, "size")} placeholder="Pack Size (30ml)" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                  <input value={v.potency || ""} onChange={handleVariantChange(idx, "potency")} placeholder="Potency (30C)" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                  <input type="number" min="0" value={v.mrp_price || ""} onChange={handleVariantChange(idx, "mrp_price")} placeholder="MRP" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                  <input type="number" min="0" max="100" value={v.discount_percent || ""} onChange={handleVariantChange(idx, "discount_percent")} placeholder="Discount %" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                  <input type="number" min="0" value={v.min_order_qty || ""} onChange={handleVariantChange(idx, "min_order_qty")} placeholder="Min Qty" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                  <input type="number" min="0" value={v.stock || ""} onChange={handleVariantChange(idx, "stock")} placeholder="Stock" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                  <input value={v.expiry_date || ""} onChange={handleVariantChange(idx, "expiry_date")} placeholder="Expiry (12/2027)" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                  <input type="number" step="0.1" min="0" max="5" value={v.rating || ""} onChange={handleVariantChange(idx, "rating")} placeholder="Rating" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                  <input type="number" min="0" value={v.review_count || ""} onChange={handleVariantChange(idx, "review_count")} placeholder="Reviews" className="border border-neutral-200 rounded-xl px-3 py-2 outline-none text-sm" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center">
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                    <div className="text-[10px] text-emerald-700 font-bold">Selling Price (auto)</div>
                    <div className="text-sm font-extrabold text-emerald-700">₹{selling.toFixed(2)}</div>
                  </div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                    <input type="checkbox" checked={v.out_of_stock || false} onChange={handleVariantChange(idx, "out_of_stock")} className="w-4 h-4 accent-(--brand-600)" />
                    Out of Stock
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-neutral-700">
                    <input type="checkbox" checked={v.not_available || false} onChange={handleVariantChange(idx, "not_available")} className="w-4 h-4 accent-(--brand-600)" />
                    Not Available
                  </label>
                </div>
              </div>
            );
          })}

          {/* ===== HOMEPAGE SECTIONS ===== */}
          <SectionHeader title="Homepage Sections" subtitle="A product can appear in multiple homepage sections." />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ToggleCheckbox label="Featured" checked={form.featured} onChange={handleChange("featured")} />
            <ToggleCheckbox label="New Arrival" checked={form.new_arrival} onChange={handleChange("new_arrival")} />
            <ToggleCheckbox label="Trending" checked={form.trending} onChange={handleChange("trending")} />
            <ToggleCheckbox label="Best Seller" checked={form.best_seller} onChange={handleChange("best_seller")} />
            <ToggleCheckbox label="Top Pick of the Day" checked={form.top_pick} onChange={handleChange("top_pick")} />
          </div>

          {/* ===== PRODUCT STATUS ===== */}
          <SectionHeader title="Product Status" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <ToggleCheckbox label="Kent Product" checked={form.isKentProduct} onChange={handleChange("isKentProduct")} />
            <ToggleCheckbox label="Hide Product" checked={form.hide_product} onChange={handleChange("hide_product")} />
            <ToggleCheckbox label="Draft" checked={form.draft} onChange={handleChange("draft")} />
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
        <button onClick={() => onConfirm(product._id)} className="btn-outline px-4 py-3 text-red-600! border-red-300! hover:bg-red-50!" disabled={deleting}>
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
    const timeoutId = window.setTimeout(() => {
      void loadProducts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
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
        <div className={`fixed top-4 right-4 z-100 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold text-white ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
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
          key={editProduct?._id || "new-product"}
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
