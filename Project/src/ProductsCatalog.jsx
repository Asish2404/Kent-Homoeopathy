import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHeart } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { useCartContext } from "./Cart/CartContext";
import api from "./services/api";

const SECTION_OPTIONS = [
  { id: "all", label: "All Products" },
  { id: "featured", label: "Featured" },
  { id: "trending", label: "Trending" },
  { id: "best_sellers", label: "Best Sellers" },
  { id: "top_picks", label: "Top Picks" },
  { id: "new_arrivals", label: "New Arrivals" },
];

const ProductsCatalog = () => {
  const navigate = useNavigate();
  const cart = useCartContext();
  const location = useLocation();

  // API-driven data
  const [apiProducts, setApiProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const fetchData = useCallback(async () => {
    setProductsLoading(true);
    setProductsError("");
    try {
      const [prodRes, catRes] = await Promise.all([
        api.get("/products"),
        api.get("/category").catch(() => ({ data: { categories: [] } })),
      ]);

      const items = prodRes.data?.products || prodRes.data?.data?.products || [];
      setApiProducts(Array.isArray(items) ? items : []);

      const catList = catRes.data?.categories || catRes.data?.data || [];
      if (Array.isArray(catList) && catList.length > 0) {
        setCategories(
          catList.map((c) => ({
            id: c._id || c.id,
            slug: c.slug || c.category_name?.toLowerCase().replace(/\s+/g, "-"),
            title: c.category_name || c.name || "Category",
          }))
        );
      }
    } catch (err) {
      setProductsError(
        err?.response?.data?.message || err.message || "Failed to load products."
      );
      setApiProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const normalizeApiProduct = useCallback((raw) => {
    const product_name = raw.product_name || raw.name || "";
    const product_image = raw.product_image || raw.image || "";
    const categoryName =
      raw.category?.category_name ||
      (typeof raw.category === "string" ? raw.category : "General");
    const categoryId = raw.category?._id || (typeof raw.category === "string" ? raw.category : "");
    const price = Number(raw.discount_price ?? raw.price ?? 0);
    const mrp = Number(raw.mrp_price ?? raw.oldPrice ?? price);

    let discountPct = 0;
    if (typeof raw.discount === "number") {
      discountPct = raw.discount;
    } else if (typeof raw.discount === "string") {
      const m = raw.discount.match(/(\d+(?:\.\d+)?)%/);
      if (m) discountPct = Number(m[1]);
    } else if (mrp > 0 && price > 0 && mrp > price) {
      discountPct = Math.round(((mrp - price) / mrp) * 100);
    }

    return {
      id: raw._id || raw.id,
      _id: raw._id || raw.id,
      name: product_name,
      image: product_image,
      price,
      oldPrice: mrp > price ? mrp : undefined,
      rating: Number(raw.averageRating || raw.rating || 0),
      reviews: Number(raw.totalReviews || raw.reviews || raw.reviewCount || 0),
      categoryTitle: categoryName,
      categoryId,
      brand: raw.brand || "Dr. Kent",
      isInStock: (raw.stock ?? raw.inStock ?? 0) > 0,
      badge: raw.badge || (raw.best_seller ? "Best Seller" : raw.new_arrival ? "New" : raw.featured ? "Featured" : raw.top_pick ? "Top Pick" : ""),
      discount: discountPct > 0 ? `-${discountPct}%` : undefined,
      discountPct,
      shortDescription: raw.short_description || raw.shortDescription || "",
      longDescription: raw.detailed_description || raw.detailedDescription || "",
      featured: Boolean(raw.featured),
      trending: Boolean(raw.trending),
      best_seller: Boolean(raw.best_seller),
      top_pick: Boolean(raw.top_pick),
      new_arrival: Boolean(raw.new_arrival),
      mrp,
    };
  }, []);

  const allProducts = useMemo(() => {
    return Array.isArray(apiProducts) ? apiProducts.map(normalizeApiProduct) : [];
  }, [apiProducts, normalizeApiProduct]);

  // If categories API was empty, fallback to extracting unique categories from products
  const dynamicCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    const map = new Map();
    allProducts.forEach((p) => {
      if (p.categoryTitle && !map.has(p.categoryTitle.toLowerCase())) {
        map.set(p.categoryTitle.toLowerCase(), {
          id: p.categoryId || p.categoryTitle.toLowerCase().replace(/\s+/g, "-"),
          slug: p.categoryTitle.toLowerCase().replace(/\s+/g, "-"),
          title: p.categoryTitle,
        });
      }
    });
    return Array.from(map.values());
  }, [categories, allProducts]);

  // Dynamic brands from products
  const dynamicBrands = useMemo(() => {
    const set = new Set();
    allProducts.forEach((p) => {
      if (p.brand && p.brand.trim()) set.add(p.brand.trim());
    });
    return Array.from(set);
  }, [allProducts]);

  // UI state
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSection, setActiveSection] = useState("all");
  const [availability, setAvailability] = useState("any");
  const [brand, setBrand] = useState("any");
  const [minRating, setMinRating] = useState(0);
  const [targetDiscount, setTargetDiscount] = useState(0);

  const prices = useMemo(() => {
    return allProducts
      .map((p) => Number(p.price) || 0)
      .filter((n) => Number.isFinite(n) && n >= 0);
  }, [allProducts]);

  const priceMin = prices.length ? Math.floor(Math.min(...prices)) : 0;
  const priceMaxOverall = prices.length ? Math.ceil(Math.max(...prices)) : 5000;

  const [selectedPriceMax, setSelectedPriceMax] = useState(priceMaxOverall);

  useEffect(() => {
    if (priceMaxOverall > 0) {
      setSelectedPriceMax(priceMaxOverall);
    }
  }, [priceMaxOverall]);

  const safeSelectedPriceMax = Math.min(
    Math.max(selectedPriceMax || priceMaxOverall, priceMin),
    priceMaxOverall || 5000
  );

  const [sortKey, setSortKey] = useState("relevance");
  const [filterOpen, setFilterOpen] = useState(false);

  const hasActiveFilters =
    activeCategory !== "all" ||
    activeSection !== "all" ||
    availability !== "any" ||
    brand !== "any" ||
    minRating > 0 ||
    targetDiscount > 0 ||
    safeSelectedPriceMax < priceMaxOverall;

  // Filter and Sort results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = [...allProducts];

    // Category filter
    if (activeCategory !== "all") {
      const targetCat = dynamicCategories.find(
        (c) =>
          c.id === activeCategory ||
          c.slug === activeCategory.toLowerCase() ||
          c.title.toLowerCase() === activeCategory.toLowerCase()
      );
      const targetTitle = (targetCat?.title || activeCategory).toLowerCase().trim();
      const targetId = targetCat?.id || activeCategory;

      list = list.filter((p) => {
        if (p.categoryId && String(p.categoryId) === String(targetId)) return true;
        if (p.categoryTitle && p.categoryTitle.toLowerCase().trim() === targetTitle) return true;
        return false;
      });
    }

    // Section filter
    if (activeSection !== "all") {
      const sec = activeSection.toLowerCase().replace(/-/g, "_");
      if (sec === "featured") list = list.filter((p) => p.featured);
      else if (sec === "trending") list = list.filter((p) => p.trending);
      else if (sec === "best_sellers" || sec === "best_seller") list = list.filter((p) => p.best_seller);
      else if (sec === "top_picks" || sec === "top_pick") list = list.filter((p) => p.top_pick);
      else if (sec === "new_arrivals" || sec === "new_arrival") list = list.filter((p) => p.new_arrival);
    }

    // Discount filter
    if (targetDiscount > 0) {
      list = list.filter((p) => {
        const pct = p.discountPct || 0;
        return pct >= targetDiscount - 5 && pct <= targetDiscount + 15;
      });
    }

    // Query filter
    if (q) {
      list = list.filter((p) =>
        [p.name, p.categoryTitle, p.brand, p.shortDescription].some((x) =>
          String(x || "").toLowerCase().includes(q)
        )
      );
    }

    // Availability filter
    if (availability !== "any") {
      if (availability === "in_stock") list = list.filter((p) => p.isInStock);
      if (availability === "out_of_stock") list = list.filter((p) => !p.isInStock);
    }

    // Brand filter
    if (brand !== "any") {
      list = list.filter((p) => p.brand === brand);
    }

    // Rating filter
    if (minRating > 0) {
      list = list.filter((p) => Number(p.rating || 0) >= minRating);
    }

    // Price range
    list = list.filter((p) => Number(p.price || 0) <= safeSelectedPriceMax);

    // Sorting
    list.sort((a, b) => {
      if (sortKey === "price_low") return Number(a.price) - Number(b.price);
      if (sortKey === "price_high") return Number(b.price) - Number(a.price);
      if (sortKey === "rating_high") return Number(b.rating) - Number(a.rating);
      // relevance
      const ar = Number(a.rating || 0) * 0.7 + Number(a.reviews || 0) * 0.00001;
      const br = Number(b.rating || 0) * 0.7 + Number(b.reviews || 0) * 0.00001;
      return br - ar;
    });

    return list;
  }, [
    activeCategory,
    activeSection,
    allProducts,
    availability,
    brand,
    dynamicCategories,
    minRating,
    query,
    safeSelectedPriceMax,
    sortKey,
    targetDiscount,
  ]);

  const resetFilters = () => {
    setQuery("");
    setActiveCategory("all");
    setActiveSection("all");
    setAvailability("any");
    setBrand("any");
    setMinRating(0);
    setTargetDiscount(0);
    setSelectedPriceMax(priceMaxOverall);
    setSortKey("relevance");
  };

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    if (filterOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [filterOpen]);

  const closeMobileFilters = () => {
    setFilterOpen(false);
  };

  // Sync URL parameters (?category=, ?section=, ?discount=, ?query=)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("query") || "";
    const catParam = (params.get("category") || "").trim();
    const secParam = (params.get("section") || "").trim().toLowerCase();
    const discParam = params.get("discount") || "";

    if (q || catParam || secParam || discParam) {
      setAvailability("any");
      setBrand("any");
      setMinRating(0);
      setSortKey("relevance");

      setQuery(q);

      if (catParam) {
        setActiveCategory(catParam);
      } else {
        setActiveCategory("all");
      }

      if (secParam) {
        setActiveSection(secParam);
      } else {
        setActiveSection("all");
      }

      if (discParam) {
        const num = Number(discParam.replace(/[^0-9.]/g, "")) || 0;
        setTargetDiscount(num);
      } else {
        setTargetDiscount(0);
      }
    } else {
      setQuery("");
      setActiveCategory("all");
      setActiveSection("all");
      setTargetDiscount(0);
    }
  }, [location.search]);

  const handleProductClick = (product) => {
    const routeId = product?._id || product?.id;
    navigate(`/products/${routeId}`, { state: { product } });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Title bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-7">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
              Products
            </h1>
            <p className="text-neutral-500 mt-1">
              {results.length} results
            </p>
          </div>

          <div className="w-full md:w-auto">
            <div className="flex gap-3 items-stretch">
              {/* Search */}
              <div className="flex items-center gap-2 bg-white border border-neutral-200 rounded-xl px-3 py-2.5 shadow-sm w-full md:w-[340px]">
                <FiSearch className="text-neutral-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, categories..."
                  className="w-full outline-none bg-transparent text-sm text-neutral-800"
                />
              </div>

              {/* Sort */}
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value)}
                className="bg-white border border-neutral-200 rounded-xl px-3 py-2.5 shadow-sm text-sm text-neutral-800"
                aria-label="Sort"
              >
                <option value="relevance">Sort: Relevance</option>
                <option value="price_low">Sort: Price (Low)</option>
                <option value="price_high">Sort: Price (High)</option>
                <option value="rating_high">Sort: Rating</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main section: Filters + Product list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar (Desktop) */}
          <aside className="lg:sticky lg:top-24 self-start hidden md:block">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              <style>{`
                .products-filter-scrollbar{max-height:calc(100vh - 180px);overflow:auto;-webkit-overflow-scrolling:touch;scroll-behavior:smooth;}
                .products-filter-scrollbar::-webkit-scrollbar{width:6px;}
                .products-filter-scrollbar::-webkit-scrollbar-track{background:#e5e7eb;border-radius:9999px;}
                .products-filter-scrollbar::-webkit-scrollbar-thumb{background:var(--brand-600);border-radius:9999px;}
                .products-filter-scrollbar::-webkit-scrollbar-thumb:hover{background:var(--brand-700);}
              `}</style>

              <div className="p-5 border-b border-neutral-100">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-bold text-neutral-900">Filters</h2>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-[var(--brand-700)] hover:text-[var(--brand-800)] font-semibold"
                    type="button"
                  >
                    Clear
                  </button>
                </div>
                <p className="text-xs text-neutral-500 mt-1">Refine your search</p>
              </div>

              <div className="products-filter-scrollbar p-5 space-y-7">
                {/* Section filter */}
                <div>
                  <div className="font-semibold text-neutral-900 mb-3">Sections</div>
                  <div className="space-y-2">
                    {SECTION_OPTIONS.map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => setActiveSection(sec.id)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                          activeSection === sec.id
                            ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)] font-semibold"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                        }`}
                      >
                        {sec.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <div className="font-semibold text-neutral-900 mb-3">Category</div>
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => setActiveCategory("all")}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                        activeCategory === "all"
                          ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)] font-semibold"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                      }`}
                    >
                      All Categories
                    </button>
                    {dynamicCategories.map((c) => {
                      const isActive =
                        activeCategory === c.id ||
                        activeCategory.toLowerCase() === c.slug?.toLowerCase() ||
                        activeCategory.toLowerCase() === c.title?.toLowerCase();
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setActiveCategory(c.id)}
                          className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                            isActive
                              ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)] font-semibold"
                              : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                          }`}
                        >
                          {c.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <div className="font-semibold text-neutral-900 mb-3">Price</div>
                  <div className="text-sm text-neutral-500 mb-2">
                    Up to ₹{safeSelectedPriceMax}
                  </div>

                  <div className="relative">
                    <div
                      className="h-2 rounded-full bg-neutral-200"
                      style={{
                        background: `linear-gradient(to right, var(--brand-600) 0%, var(--brand-600) ${
                          priceMaxOverall === priceMin
                            ? 100
                            : ((safeSelectedPriceMax - priceMin) / (priceMaxOverall - priceMin)) * 100
                        }%, #e5e7eb ${
                          priceMaxOverall === priceMin
                            ? 100
                            : ((safeSelectedPriceMax - priceMin) / (priceMaxOverall - priceMin)) * 100
                        }%)`,
                      }}
                    />

                    <input
                      type="range"
                      min={priceMin}
                      max={priceMaxOverall || 5000}
                      value={safeSelectedPriceMax}
                      onChange={(e) => setSelectedPriceMax(Number(e.target.value))}
                      className="w-full absolute left-0 top-0 h-2 bg-transparent appearance-none outline-none cursor-pointer"
                      style={{ background: "transparent" }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-neutral-500 mt-2">
                    <span>₹{priceMin}</span>
                    <span>₹{priceMaxOverall || 5000}</span>
                  </div>
                </div>

                {/* Availability */}
                <div>
                  <div className="font-semibold text-neutral-900 mb-3">Availability</div>
                  <div className="space-y-2">
                    {[
                      { id: "any", label: "Any" },
                      { id: "in_stock", label: "In stock" },
                      { id: "out_of_stock", label: "Out of stock" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAvailability(opt.id)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                          availability === opt.id
                            ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)] font-semibold"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand */}
                {dynamicBrands.length > 0 && (
                  <div>
                    <div className="font-semibold text-neutral-900 mb-3">Brand</div>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setBrand("any")}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                          brand === "any"
                            ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)] font-semibold"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                        }`}
                      >
                        Any Brand
                      </button>
                      {dynamicBrands.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBrand(b)}
                          className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                            brand === b
                              ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)] font-semibold"
                              : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rating */}
                <div>
                  <div className="font-semibold text-neutral-900 mb-3">Rating</div>
                  <div className="space-y-2">
                    {[
                      { id: 0, label: "Any" },
                      { id: 4.5, label: "4.5★ & above" },
                      { id: 4.0, label: "4.0★ & above" },
                      { id: 3.5, label: "3.5★ & above" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMinRating(opt.id)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                          minRating === opt.id
                            ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)] font-semibold"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product list */}
          <section>
            {/* Mobile filters button */}
            <div className="md:hidden mb-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-sm font-semibold text-neutral-800 text-sm hover:bg-neutral-50 transition min-h-[48px]"
                >
                  <FiFilter className="text-base" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-[var(--brand-600)]" />
                  )}
                </button>
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="flex-1 bg-white border border-neutral-200 rounded-2xl px-4 py-3 shadow-sm font-semibold text-neutral-800 text-sm cursor-pointer min-h-[48px]"
                  aria-label="Sort"
                >
                  <option value="relevance">Sort: Relevance</option>
                  <option value="price_low">Sort: Price (Low)</option>
                  <option value="price_high">Sort: Price (High)</option>
                  <option value="rating_high">Sort: Rating</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {productsLoading ? (
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-12 text-center">
                  <div className="animate-spin w-8 h-8 border-4 border-[var(--brand-600)] border-t-transparent rounded-full mx-auto mb-3" />
                  <h3 className="text-neutral-900 font-bold">Loading products...</h3>
                </div>
              ) : productsError && results.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-10 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-3">
                    <HiOutlineSparkles className="text-xl" />
                  </div>
                  <h3 className="text-neutral-900 font-bold">Couldn't load products</h3>
                  <p className="text-neutral-500 text-sm mt-1">{productsError}</p>
                  <button
                    type="button"
                    onClick={fetchData}
                    className="btn-outline mt-4 py-2 px-4"
                  >
                    Retry
                  </button>
                </div>
              ) : results.length === 0 ? (
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-10 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-[var(--brand-50)] text-[var(--brand-700)] flex items-center justify-center mb-3">
                    <HiOutlineSparkles className="text-xl" />
                  </div>
                  <h3 className="text-neutral-900 font-bold">No products found</h3>
                  <p className="text-neutral-500 text-sm mt-1">
                    Try changing filters or searching for something else.
                  </p>
                </div>
              ) : (
                results.map((p) => {
                  const rating = Number(p.rating || 0);
                  const reviews = Number(p.reviews || 0);

                  return (
                    <div
                      key={p.id}
                      className="group bg-white border border-neutral-100 shadow-sm hover:shadow-md transition-shadow rounded-xl overflow-hidden card-lift"
                    >
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => handleProductClick(p)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") handleProductClick(p);
                        }}
                        className="w-full text-left cursor-pointer"
                      >
                        <div className="flex flex-col md:flex-row md:items-stretch">
                          {/* Image */}
                          <div className="flex-shrink-0 p-3 md:p-4">
                            <div className="relative w-[88px] h-[88px] sm:w-[100px] sm:h-[100px] rounded-xl overflow-hidden bg-gradient-to-br from-[var(--brand-50)] to-white border border-neutral-100 flex items-center justify-center">
                              {p.discount && (
                                <div className="absolute top-2 left-2 z-10 bg-[var(--brand-600)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                  {p.discount}
                                </div>
                              )}
                              {p.badge && (
                                <div className="absolute top-2 right-2 z-10 bg-amber-100 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                  {p.badge}
                                </div>
                              )}
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-[1.06]"
                                loading="lazy"
                              />
                            </div>
                          </div>

                          {/* Row content */}
                          <div className="flex-1 px-3 sm:px-0 pb-3 md:pb-0">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="text-[14px] sm:text-[15px] font-bold text-neutral-900 line-clamp-1">
                                  {p.name}
                                </h3>
                                <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-0.5 line-clamp-1">
                                  {p.categoryTitle}
                                </p>

                                {/* Rating (Only show if reviews > 0 && rating > 0) */}
                                <div className="flex items-center gap-2 mt-2">
                                  {reviews > 0 && rating > 0 ? (
                                    <>
                                      <div className="flex items-center gap-1">
                                        <span className="text-amber-500 font-extrabold">★</span>
                                        <span className="font-semibold text-neutral-800 text-[13px]">
                                          {rating.toFixed(1)}
                                        </span>
                                      </div>
                                      <span className="text-neutral-500 text-[12px]">
                                        ({reviews} {reviews === 1 ? "review" : "reviews"})
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-neutral-400 text-[12px] italic">
                                      No reviews yet
                                    </span>
                                  )}
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                      p.isInStock
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                        : "bg-rose-50 text-rose-700 border-rose-100"
                                    }`}
                                  >
                                    {p.isInStock ? "In stock" : "Out of stock"}
                                  </span>
                                  {p.brand && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px]">
                                      {p.brand}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Price + Actions */}
                              <div className="shrink-0 w-full sm:w-auto">
                                <div className="flex items-end justify-between gap-3">
                                  <div className="flex items-baseline gap-2">
                                    <div className="text-[18px] sm:text-[20px] font-extrabold text-neutral-900">
                                      ₹{p.price}
                                    </div>
                                    {p.oldPrice && (
                                      <div className="text-[12px] text-neutral-400 line-through">
                                        ₹{p.oldPrice}
                                      </div>
                                    )}
                                  </div>

                                  <div className="hidden sm:flex items-center gap-2">
                                    <button
                                      type="button"
                                      className={`w-9 h-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center transition ${
                                        cart.isWishlisted?.(p.id) ? "text-red-500" : "text-neutral-400 hover:text-red-500"
                                      }`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        cart.toggleWishlist(p);
                                      }}
                                      aria-label="Wishlist"
                                    >
                                      <FaHeart className="text-sm" />
                                    </button>
                                  </div>
                                </div>

                                <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2">
                                  <button
                                    type="button"
                                    className="btn-primary py-2 px-3 text-xs font-bold rounded-lg shadow-sm hover:shadow-md"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      cart.addToCart(p, 1);
                                    }}
                                  >
                                    Add
                                  </button>

                                  <button
                                    type="button"
                                    className="btn-outline py-2 px-3 text-xs font-bold rounded-lg hover:bg-[var(--brand-50)]"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      if (!cart.isInCart?.(p.id)) {
                                        cart.addToCart(p, 1);
                                      }
                                      navigate(`/Cart`);
                                    }}
                                  >
                                    Buy
                                  </button>

                                  <button
                                    type="button"
                                    className={`sm:hidden w-9 h-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center transition ${
                                      cart.isWishlisted?.(p.id) ? "text-red-500" : "text-neutral-400 hover:text-red-500"
                                    }`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      cart.toggleWishlist(p);
                                    }}
                                    aria-label="Wishlist"
                                  >
                                    <FaHeart className="text-sm" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-neutral-900/50"
            onClick={closeMobileFilters}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filters"
            className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
              <h2 className="text-lg font-bold text-neutral-900">Filters</h2>
              <button
                type="button"
                onClick={closeMobileFilters}
                className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-neutral-200 transition"
                aria-label="Close filters"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="products-filter-scrollbar p-5 space-y-7 overflow-y-auto flex-1 safe-scroll-pad">
              {/* Section filter */}
              <div>
                <div className="font-semibold text-neutral-900 mb-3">Sections</div>
                <div className="space-y-2">
                  {SECTION_OPTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => setActiveSection(sec.id)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                        activeSection === sec.id
                          ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)] font-semibold"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                      }`}
                    >
                      {sec.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="font-semibold text-neutral-900 mb-3">Category</div>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => setActiveCategory("all")}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                      activeCategory === "all"
                        ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)] font-semibold"
                        : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                    }`}
                  >
                    All Categories
                  </button>
                  {dynamicCategories.map((c) => {
                    const isActive =
                      activeCategory === c.id ||
                      activeCategory.toLowerCase() === c.slug?.toLowerCase() ||
                      activeCategory.toLowerCase() === c.title?.toLowerCase();
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveCategory(c.id)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                          isActive
                            ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)] font-semibold"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                        }`}
                      >
                        {c.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <div className="font-semibold text-neutral-900 mb-3">Price</div>
                <div className="text-sm text-neutral-500 mb-2">
                  Up to ₹{safeSelectedPriceMax}
                </div>
                <input
                  type="range"
                  min={priceMin}
                  max={priceMaxOverall || 5000}
                  value={safeSelectedPriceMax}
                  onChange={(e) => setSelectedPriceMax(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-2">
                  <span>₹{priceMin}</span>
                  <span>₹{priceMaxOverall || 5000}</span>
                </div>
              </div>

              {/* Availability */}
              <div>
                <div className="font-semibold text-neutral-900 mb-3">Availability</div>
                <div className="space-y-2">
                  {[
                    { id: "any", label: "Any" },
                    { id: "in_stock", label: "In stock" },
                    { id: "out_of_stock", label: "Out of stock" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAvailability(opt.id)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                        availability === opt.id
                          ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)] font-semibold"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              {dynamicBrands.length > 0 && (
                <div>
                  <div className="font-semibold text-neutral-900 mb-3">Brand</div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setBrand("any")}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                        brand === "any"
                          ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)] font-semibold"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                      }`}
                    >
                      Any Brand
                    </button>
                    {dynamicBrands.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBrand(b)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                          brand === b
                            ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)] font-semibold"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating */}
              <div>
                <div className="font-semibold text-neutral-900 mb-3">Rating</div>
                <div className="space-y-2">
                  {[
                    { id: 0, label: "Any" },
                    { id: 4.5, label: "4.5★ & above" },
                    { id: 4.0, label: "4.0★ & above" },
                    { id: 3.5, label: "3.5★ & above" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMinRating(opt.id)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                        minRating === opt.id
                          ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)] font-semibold"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-5 py-4 border-t border-neutral-100 bg-white">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 btn-outline py-3 text-sm"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={closeMobileFilters}
                className="flex-1 btn-primary py-3 text-sm"
              >
                Show Results ({results.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsCatalog;
