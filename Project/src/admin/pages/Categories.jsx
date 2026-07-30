import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../services/admin.service";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formName, setFormName] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const reloadCategories = () => {
    setLoading(true);
    setError(null);
    getCategories()
      .then((res) => {
        const cats = res.categories || res.data?.categories || [];
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch((err) => {
        console.error("Categories load error:", err);
        setError("Failed to load categories. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

useEffect(() => {
    let mounted = true;
    getCategories()
      .then((res) => {
        if (!mounted) return;
        const cats = res.categories || res.data?.categories || [];
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error("Categories load error:", err);
        setError("Failed to load categories. Please try again.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setFormName(cat.category_name || cat.name || "");
    setFormError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = formName.trim();
    if (!name) {
      setFormError("Category name is required");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      if (editingCategory) {
        await updateCategory(editingCategory._id, { category_name: name });
        showNotification("Category updated successfully");
      } else {
        await createCategory({ category_name: name });
        showNotification("Category created successfully");
      }
      setModalOpen(false);
      reloadCategories();
    } catch (err) {
      setFormError(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (catId) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(catId);
      showNotification("Category deleted successfully");
      reloadCategories();
    } catch (err) {
      showNotification(err.response?.data?.message || "Delete failed", "error");
    }
  };

  const filtered = categories.filter((cat) => {
    const name = (cat.category_name || cat.name || "").toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Notification toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl shadow-xl text-white font-semibold text-sm transition-all ${
          notification.type === "error" ? "bg-red-500" : "bg-green-600"
        }`}>
          {notification.msg}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Catalog Management</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Categories</div>
          <div className="mt-1 text-sm text-neutral-500">Product categories from database.</div>
        </div>
        <button className="btn-primary" type="button" onClick={openCreateModal}>Add Category</button>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-neutral-900 font-extrabold">All Categories</div>
            <div className="text-sm text-neutral-500">Total {categories.length}</div>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-neutral-200 rounded-2xl px-4 py-2 outline-none w-full sm:w-64 text-sm"
            placeholder="Search categories..."
          />
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-neutral-500 font-semibold">Loading categories...</div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-600 font-extrabold mb-2">Error</div>
              <div className="text-neutral-500 text-sm mb-3">{error}</div>
              <button className="btn-primary" onClick={reloadCategories}>Retry</button>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title={search ? "No categories match your search" : "No categories found"} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((cat) => {
                const name = cat.category_name || cat.name || cat._id;
                return (
                  <div
                    key={cat._id}
                    className="rounded-2xl border border-neutral-200 px-4 py-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-sm text-neutral-500">Category</div>
                      <div className="text-neutral-900 font-extrabold truncate">{name}</div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant="neutral">Active</Badge>
                      <button
                        onClick={() => openEditModal(cat)}
                        className="text-xs text-brand-600 hover:text-brand-800 font-semibold px-2 py-1 rounded-lg hover:bg-brand-50 transition"
                        title="Edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat._id)}
                        className="text-xs text-red-600 hover:text-red-800 font-semibold px-2 py-1 rounded-lg hover:bg-red-50 transition"
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/40" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md">
            <div className="text-lg font-extrabold text-neutral-900 mb-4">
              {editingCategory ? "Edit Category" : "Create Category"}
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Category Name</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border border-neutral-200 rounded-2xl px-4 py-3 outline-none focus:border-brand-500"
                  placeholder="Enter category name"
                  autoFocus
                />
                {formError && <p className="text-red-500 text-sm mt-1">{formError}</p>}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-neutral-200 text-neutral-700 font-semibold hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary px-5 py-2.5 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
