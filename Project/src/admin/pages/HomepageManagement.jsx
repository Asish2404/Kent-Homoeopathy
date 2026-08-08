import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { formatCurrency } from "../utils/formatters";
import {
  getHomepageSections,
  getProducts,
  getCategories,
  addProductToHomepageSection,
  removeProductFromHomepageSection,
  reorderHomepageSection,
} from "../services/admin.service";

const SECTION_DEFS = [
  { key: "featured", label: "Featured Products", desc: "Products shown in the Featured Products slider" },
  { key: "new_arrivals", label: "New Arrivals", desc: "Fresh products on the homepage" },
  { key: "trending", label: "Trending Products", desc: "Most loved this week" },
  { key: "best_sellers", label: "Best Sellers", desc: "Customer favourites" },
  { key: "top_picks", label: "Top Picks of the Day", desc: "Handpicked daily" },
  { key: "discount_20", label: "Discount Collections (20%)", desc: "Products with ~20% off" },
  { key: "discount_30", label: "Discount Collections (30%)", desc: "Products with ~30% off" },
  { key: "discount_50", label: "Discount Collections (50%)", desc: "Products with ~50% off" },
  { key: "discount_70", label: "Discount Collections (70%)", desc: "Products with ~70% off" },
];

const SectionCard = ({ def, products, allProducts, categories, onAdd, onRemove, onReorder }) => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [draggingIndex, setDraggingIndex] = useState(null);
  const dragOverIndex = useRef(null);

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    const inSection = new Set((products || []).map((p) => p._id || p.id));
    return allProducts.filter((p) => {
      if (inSection.has(p._id || p.id)) return false;
      const name = (p.product_name || p.name || "").toLowerCase();
      const cat = p.category?.category_name || p.category || "";
      const catStr = typeof cat === "string" ? cat.toLowerCase() : "";
      const matchesQuery = !q || name.includes(q) || catStr.includes(q);
      const catVal = p.category?._id || p.category?.id || "";
      const matchesCategory = !category || catVal === category;
      return matchesQuery && matchesCategory;
    });
  }, [query, category, allProducts, products]);

  const handleDrop = (dropIndex) => {
    if (draggingIndex === null || draggingIndex === dropIndex) {
      setDraggingIndex(null);
      return;
    }
    const next = [...(products || [])];
    const [moved] = next.splice(draggingIndex, 1);
    next.splice(dropIndex, 0, moved);
    setDraggingIndex(null);
    onReorder(next);
  };

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-lg font-extrabold text-neutral-900">{def.label}</div>
          <div className="text-xs text-neutral-500 mt-0.5">{def.desc}</div>
        </div>
        <Badge variant="brand">{products?.length || 0} products</Badge>
      </div>

      {/* Assigned products */}
      <div className="mb-4">
        <div className="text-xs font-bold text-neutral-700 mb-2">Products in this section</div>
        {products && products.length > 0 ? (
          <div className="space-y-2">
            {products.map((p, idx) => {
              const name = p.product_name || p.name || "Unknown";
              const image = p.product_image || p.image || "/src/assets/Product_image.png";
              const price = p.discount_price || p.selling_price || p.mrp_price || p.price || 0;
              const stock = Number(p.stock || 0);
              const categoryName = p.category?.category_name || p.category || "N/A";
              return (
                <div
                  key={p._id || p.id}
                  draggable
                  onDragStart={() => setDraggingIndex(idx)}
                  onDragEnter={() => { dragOverIndex.current = idx; }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(dragOverIndex.current ?? idx)}
                  className={`flex items-center gap-3 border rounded-xl p-2.5 bg-neutral-50 cursor-grab active:cursor-grabbing ${
                    draggingIndex === idx ? "opacity-50" : ""
                  }`}
                >
                  <span className="text-neutral-400 text-sm">⋮⋮</span>
                  <img src={image} alt={name} className="w-10 h-10 rounded-lg object-cover border border-neutral-200" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-neutral-800 truncate">{name}</div>
                    <div className="text-xs text-neutral-500">{categoryName}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-extrabold text-neutral-900">{formatCurrency(price)}</div>
                    <div className={`text-xs font-semibold ${stock > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {stock > 0 ? `${stock} in stock` : "Out of stock"}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(p._id || p.id)}
                    className="text-xs font-bold text-red-600 hover:text-red-800 px-2 py-1 shrink-0"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState title="No products assigned" description="Add products from the list below." />
        )}
      </div>

      {/* Add products */}
      <div className="border-t border-neutral-100 pt-3">
        <div className="text-xs font-bold text-neutral-700 mb-2">Add products</div>
        <div className="flex flex-col sm:flex-row gap-2 mb-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="border border-neutral-200 rounded-xl px-3 py-2 text-sm outline-none w-full"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-neutral-200 rounded-xl px-3 py-2 text-sm outline-none bg-white"
          >
<option value="">All Categories</option>
            {(categories || []).map((c) => (
              <option key={c._id} value={c._id}>{c.category_name || c.name || c._id}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="border border-neutral-200 rounded-xl px-3 py-2 text-sm outline-none bg-white flex-1"
          >
            <option value="">Select a product...</option>
            {available.map((p) => (
              <option key={p._id || p.id} value={p._id || p.id}>
                {p.product_name || p.name || "Unknown"}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (selectedId) {
                onAdd(selectedId);
                setSelectedId("");
              }
            }}
            className="btn-primary px-4 py-2 text-sm"
          >
            Add
          </button>
        </div>
      </div>
    </Card>
  );
};

const HomepageManagement = () => {
  const [sections, setSections] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const notify = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [secRes, prodRes, catRes] = await Promise.all([
        getHomepageSections(),
        getProducts({ limit: 500 }),
        getCategories(),
      ]);
      setSections(secRes.sections || []);
      setAllProducts(prodRes.products || []);
      const cats = catRes.categories || catRes.data?.categories || [];
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (err) {
      console.error("Homepage management load error:", err);
      setError("Failed to load homepage sections. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  const updateSection = (sectionKey, updatedProducts) => {
    setSections((prev) =>
      prev.map((s) => (s.section === sectionKey ? { ...s, products: updatedProducts, count: updatedProducts.length } : s))
    );
  };

  const handleAdd = async (sectionKey, productId) => {
    try {
      const res = await addProductToHomepageSection(sectionKey, productId);
      updateSection(sectionKey, res.products || []);
      notify("Product added to section");
    } catch (err) {
      notify(err.response?.data?.message || err.message || "Add failed", "error");
    }
  };

  const handleRemove = async (sectionKey, productId) => {
    try {
      const res = await removeProductFromHomepageSection(sectionKey, productId);
      updateSection(sectionKey, res.products || []);
      notify("Product removed from section");
    } catch (err) {
      notify(err.response?.data?.message || err.message || "Remove failed", "error");
    }
  };

  const handleReorder = async (sectionKey, orderedProducts) => {
    const productIds = orderedProducts.map((p) => p._id || p.id).filter(Boolean);
    updateSection(sectionKey, orderedProducts);
    try {
      await reorderHomepageSection(sectionKey, productIds);
      notify("Section order updated");
    } catch (err) {
      notify(err.response?.data?.message || err.message || "Reorder failed", "error");
    }
  };

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-100 px-5 py-3 rounded-2xl shadow-lg text-sm font-bold text-white ${notification.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {notification.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Homepage Management</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Homepage Sections</div>
          <div className="mt-1 text-sm text-neutral-500">
            Manage products across all homepage sections. Changes reflect instantly on the storefront.
          </div>
        </div>
        <button className="btn-outline" onClick={loadData}>Refresh</button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <div className="text-neutral-500 font-semibold">Loading homepage sections...</div>
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <div className="text-red-600 font-extrabold mb-2">Error</div>
          <div className="text-neutral-500 text-sm mb-3">{error}</div>
          <button className="btn-primary" onClick={loadData}>Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {SECTION_DEFS.map((def) => {
            const sectionData = sections.find((s) => s.section === def.key);
            return (
<SectionCard
                key={def.key}
                def={def}
                products={sectionData?.products || []}
                allProducts={allProducts}
                categories={categories}
                onAdd={(productId) => handleAdd(def.key, productId)}
                onRemove={(productId) => handleRemove(def.key, productId)}
                onReorder={(list) => handleReorder(def.key, list)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HomepageManagement;
