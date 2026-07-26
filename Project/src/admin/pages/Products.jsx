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
  discount_price: "",
  stock: "0",
  category: "",
  isKentProduct: false,
};

const ProductModal = ({ product, categories, onClose, onSave, saving }) => {
  const [form, setForm] = useState({ ...emptyProductForm });
  const [errors, setErrors] = useState({});
  const isEdit = !!product;

  useEffect(() => {
    if (product) {
      setForm({
        product_name: product.product_name || "",
        product_image: product.product_image || "",
        brand: product.brand || "",
        short_description: product.short_description || "",
        detailed_description: product.detailed_description || "",
        quantity: product.quantity ?? "",
        pack: product.pack || "",
        mrp_price: product.mrp_price ?? "",
        discount_price: product.discount_price ?? "",
        stock: product.stock ?? "0",
        category: product.category?._id || product.category || "",
        isKentProduct: product.isKentProduct || false,
      });
    } else {
      setForm({ ...emptyProductForm });
    }
    setErrors({});
  }, [product]);

  const validate = () => {
    const e = {};
    if (!form.product_name.trim()) e.product_name = "Product name is required";
    if (!form.product_image.trim()) e.product_image = "Image URL is required";
    if (!form.brand.trim()) e.brand = "Brand is required";
    if (!form.short_description.trim()) e.short_description = "Short description is required";
    if (!form.detailed_description.trim()) e.detailed_description = "Detailed description is required";
    if (!form.mrp_price || Number(form.mrp_price) <= 0) e.mrp_price = "MRP must be positive";
    if (!form.discount_price || Number(form.discount_price) <= 0) e.discount_price = "Discount price must be positive";
    if (!form.category) e.category = "Category is required";
    if (Number(form.discount_price) > Number(form.mrp_price)) e.discount_price = "Discount price cannot exceed MRP";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (field) => (e) => {
    const value = field === "isKentProduct" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      quantity: form.quantity ? Number(form.quantity) : undefined,
      mrp_price: Number(form.mrp_price),
      discount_price: Number(form.discount_price),
      stock: Number(form.stock) || 0,
    };
    await onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-neutral-200">
          <div className="text-lg font-extrabold text-neutral-900">{isEdit ? "Edit Product" : "Add Product"}</div>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-neutral-700 block mb-1">Product Name *</label>
              <input value={form.product_name} onChange={handleChange("product_name")} className={`border ${errors.product_name ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`} placeholder="Product name" />
              {errors.product_name && <div className="text-xs text-red-600 mt-1">{errors.product_name}</div>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Image URL *</label>
              <input value={form.product_image} onChange={handleChange("product_image")} className={`border ${errors.product_image ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`} placeholder="https://..." />
              {errors.product_image && <div className="text-xs text-red-600 mt-1">{errors.product_image}</div>}
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Brand *</label>
              <input value={form.brand} onChange={handleChange("brand")} className={`border ${errors.brand ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`} placeholder="Brand name" />
              {errors.brand && <div className="text-xs text-red-600 mt-1">{errors.brand}</div>}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">Short Description *</label>
            <textarea value={form.short_description} onChange={handleChange("short_description")} rows={2} className={`border ${errors.short_description ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`} placeholder="Brief description" />
            {errors.short_description && <div className="text-xs text-red-600 mt-1">{errors.short_description}</div>}
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-700 block mb-1">Detailed Description *</label>
            <textarea value={form.detailed_description} onChange={handleChange("detailed_description")} rows={3} className={`border ${errors.detailed_description ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`} placeholder="Full product details" />
            {errors.detailed_description && <div className="text-xs text-red-600 mt-1">{errors.detailed_description}</div>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">MRP *</label>
              <input type="number" min="0" value={form.mrp_price} onChange={handleChange("mrp_price")} className={`border ${errors.mrp_price ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`} placeholder="0" />
              {errors.mrp_price && <div className="text-xs text-red-600 mt-1">{errors.mrp_price}</div>}
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Discount Price *</label>
              <input type="number" min="0" value={form.discount_price} onChange={handleChange("discount_price")} className={`border ${errors.discount_price ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`} placeholder="0" />
              {errors.discount_price && <div className="text-xs text-red-600 mt-1">{errors.discount_price}</div>}
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Stock</label>
              <input type="number" min="0" value={form.stock} onChange={handleChange("stock")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Category *</label>
              <select value={form.category} onChange={handleChange("category")} className={`border ${errors.category ? "border-red-400" : "border-neutral-200"} rounded-2xl px-4 py-3 outline-none w-full text-sm`}>
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.category_name || cat.name || cat._id}</option>
                ))}
              </select>
              {errors.category && <div className="text-xs text-red-600 mt-1">{errors.category}</div>}
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Quantity</label>
              <input type="number" min="0" value={form.quantity} onChange={handleChange("quantity")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="0" />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-700 block mb-1">Pack</label>
              <input value={form.pack} onChange={handleChange("pack")} className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full text-sm" placeholder="e.g. 10x10" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.isKentProduct} onChange={handleChange("isKentProduct")} className="sr-only peer" />
              <div className="w-9 h-5 bg-neutral-300 rounded-full peer peer-checked:bg-brand-500 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
            </label>
            <span className="text-sm font-bold text-neutral-700">Kent Product</span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
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
                            className={`px-2.5 py-1 rounded-2xl text-xs font-bold border ${
                              isKent
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

