import { useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getCategories } from "../services/admin.service";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getCategories();
      const cats = res.categories || res.data?.categories || [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error("Categories load error:", err);
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Catalog Management</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Categories</div>
          <div className="mt-1 text-sm text-neutral-500">Product categories from database.</div>
        </div>
        <button className="btn-primary" type="button">Add Category</button>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-neutral-900 font-extrabold">All Categories</div>
            <div className="text-sm text-neutral-500">Total {categories.length}</div>
          </div>
          <Badge variant="brand">Live</Badge>
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
              <button className="btn-primary" onClick={loadCategories}>Retry</button>
            </div>
          ) : categories.length === 0 ? (
            <EmptyState title="No categories found" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const name = cat.category_name || cat.name || cat._id;
                return (
                  <div
                    key={cat._id}
                    className="rounded-2xl border border-neutral-200 px-4 py-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm text-neutral-500">Category</div>
                      <div className="text-neutral-900 font-extrabold">{name}</div>
                    </div>
                    <Badge variant="neutral">Active</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Categories;

