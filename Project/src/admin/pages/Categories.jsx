import { useMemo, useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import {
  getCategories,
  getProducts,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/admin.service";

const CategoryModal = ({ category, onClose, onSave, saving }) => {
  const [name, setName] = useState(category?.category_name || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ category_name: name });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-3xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-neutral-100 p-5">
          <div className="text-lg font-extrabold text-neutral-900">
            {category ? "Edit Category" : "Add Category"}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-neutral-400 hover:text-neutral-700"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div>
            <label className="mb-1 block text-xs font-bold text-neutral-700">Category Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm outline-none"
              placeholder="Enter category name"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-outline px-5 py-3" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary px-5 py-3" disabled={saving}>
              {saving ? "Saving..." : category ? "Update Category" : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

  const normalizedCategories = useMemo(() => {
    return categories.map((category) => ({
      ...category,
      products: products.filter((product) => {
        const productCategory = product.category;
        if (productCategory && typeof productCategory === "object") {
          if (productCategory._id && String(productCategory._id) === String(category._id)) return true;
          if (productCategory.category_name && productCategory.category_name === category.category_name) return true;
        }
        return (
          String(productCategory || "") === String(category._id) ||
          String(productCategory || "") === String(category.category_name)
        );
      }),
    }));
  }, [categories, products]);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [categoryRes, productRes] = await Promise.all([getCategories(), getProducts()]);
      const cats = categoryRes.categories || categoryRes.data?.categories || [];
      const prods = productRes.products || productRes.data?.products || [];
      setCategories(Array.isArray(cats) ? cats : []);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch (err) {
      console.error("Categories load error:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadCategories();
  }, [loadCategories]);

  const openCreate = () => {
    setEditCategory(null);
    setShowModal(true);
  };

  const openEdit = (category) => {
    setEditCategory(category);
    setShowModal(true);
  };

  const handleSaveCategory = async (payload) => {
    try {
      setSaving(true);
      if (editCategory?._id) {
        await updateCategory(editCategory._id, payload);
      } else {
        await createCategory(payload);
      }
      setShowModal(false);
      setEditCategory(null);
      await loadCategories();
    } catch (err) {
      console.error("Category save error:", err);
      window.alert(err.response?.data?.message || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Delete category "${category.category_name || category.name || category._id}"?`
    );
    if (!confirmed) return;

    try {
      setSaving(true);
      await deleteCategory(category._id);
      if (expandedCategoryId === category._id) setExpandedCategoryId(null);
      await loadCategories();
    } catch (err) {
      console.error("Category delete error:", err);
      window.alert(err.response?.data?.message || "Failed to delete category.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="section-eyebrow">Catalog Management</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Categories</div>
          <div className="mt-1 text-sm text-neutral-500">Product categories from database.</div>
        </div>
        <button className="btn-primary" type="button" onClick={openCreate}>
          Add Category
        </button>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-neutral-900 font-extrabold">All Categories</div>
            <div className="text-sm text-neutral-500">Total {normalizedCategories.length}</div>
          </div>
          <Badge variant="brand">Live</Badge>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
              <div className="font-semibold text-neutral-500">Loading categories...</div>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <div className="mb-2 font-extrabold text-red-600">Error</div>
              <div className="mb-3 text-sm text-neutral-500">{error}</div>
              <button className="btn-primary" onClick={loadCategories}>
                Retry
              </button>
            </div>
          ) : normalizedCategories.length === 0 ? (
            <EmptyState title="No categories found" />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {normalizedCategories.map((cat) => {
                const name = cat.category_name || cat.name || cat._id;
                const isExpanded = expandedCategoryId === cat._id;

                return (
                  <div key={cat._id} className="rounded-2xl border border-neutral-200 px-4 py-4">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => setExpandedCategoryId(isExpanded ? null : cat._id)}
                        className="flex-1 text-left"
                      >
                        <div className="text-sm text-neutral-500">Category</div>
                        <div className="font-extrabold text-neutral-900">{name}</div>
                        <div className="mt-1 text-xs text-neutral-500">{cat.products.length} products</div>
                      </button>
                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          className="text-xs font-bold text-[var(--brand-700)] hover:text-[var(--brand-800)]"
                          onClick={() => openEdit(cat)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-xs font-bold text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCategory(cat)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedCategoryId(isExpanded ? null : cat._id)}
                      className="mt-3 text-xs font-bold text-[var(--brand-700)] hover:text-[var(--brand-800)]"
                    >
                      {isExpanded ? "Hide products" : "View products"}
                    </button>

                    {isExpanded && (
                      <div className="mt-4 rounded-2xl bg-neutral-50 p-4">
                        <div className="mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
                          Products in this category
                        </div>
                        {cat.products.length === 0 ? (
                          <div className="text-sm text-neutral-500">
                            No products are assigned to this category.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {cat.products.map((product) => (
                              <div key={product._id} className="rounded-xl border border-neutral-200 bg-white px-3 py-2">
                                <div className="text-sm font-semibold text-neutral-900">
                                  {product.product_name || product.name}
                                </div>
                                <div className="text-xs text-neutral-500">
                                  ₹{product.discount_price || product.price || 0} · Stock {product.stock ?? 0}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {showModal && (
        <CategoryModal
          key={editCategory?._id || "new"}
          category={editCategory}
          onClose={() => {
            setShowModal(false);
            setEditCategory(null);
          }}
          onSave={handleSaveCategory}
          saving={saving}
        />
      )}
    </div>
  );
};

export default Categories;

