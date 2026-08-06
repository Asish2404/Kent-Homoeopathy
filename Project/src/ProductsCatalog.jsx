import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { FaHeart } from "react-icons/fa";
import { HiOutlineSparkles } from "react-icons/hi2";
import { FiSearch, FiFilter, FiX } from "react-icons/fi";
import { allCategories } from "./data/products";
import { useCartContext } from "./Cart/CartContext";
import api from "./services/api";



const ProductsCatalog = () => {
  const navigate = useNavigate();
  const cart = useCartContext();
  const location = useLocation();

  // ===== API-driven product list (with static fallback) =====
  const [apiProducts, setApiProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError("");
    try {
      const res = await api.get("/products");
      const items = res.data?.products || res.data?.data?.products || [];
      setApiProducts(Array.isArray(items) ? items : []);
    } catch (err) {
      setProductsError(
        err?.response?.data?.message || err.message || "Failed to load products."
      );
      setApiProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const normalizeApiProduct = useCallback((raw) => {
    const product_name = raw.product_name || raw.name || "";
    const product_image = raw.product_image || raw.image || "";
    const category =
      raw.category?.category_name ||
      (typeof raw.category === "string" ? raw.category : "Products");
    const price = Number(raw.discount_price ?? raw.price ?? 0);
    const mrp = Number(raw.mrp_price ?? raw.oldPrice ?? price);
    return {
      id: raw._id || raw.id,
      name: product_name,
      image: product_image,
      price,
      oldPrice: mrp > price ? mrp : undefined,
      rating: Number(raw.rating || 0),
      reviews: Number(raw.reviews || raw.reviewCount || 0),
      categoryTitle: category,
      brand: raw.brand || "Dr. Kent",
      isInStock: (raw.stock ?? raw.inStock ?? 0) > 0,
      deliveryETA: raw.deliveryETA || "24 hrs",
      consultRequired: raw.consultRequired ?? false,
      badge: raw.badge || "",
      discount: raw.discount,
      shortDescription: raw.short_description || raw.shortDescription || "",
      longDescription: raw.detailed_description || raw.detailedDescription || "",
      mrp,
      _id: raw._id,
    };
  }, []);

  const staticProducts = useMemo(() => {
    return allCategories.flatMap((c) => c.products || []).map((p) => ({
      ...p,
      categoryTitle:
        allCategories.find((cc) => cc.products?.some((pp) => pp.id === p.id))?.title || "Products",
      isInStock: true,
      brand: "Dr. Kent",
      deliveryETA: "24 hrs",
      consultRequired: true,
    }));
  }, []);

  const allProducts = useMemo(() => {
    const apiList = Array.isArray(apiProducts)
      ? apiProducts.map(normalizeApiProduct)
      : [];
    if (apiList.length > 0) return apiList;
    return staticProducts;
  }, [apiProducts, staticProducts, normalizeApiProduct]);

  // UI state
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [availability, setAvailability] = useState("any");
  const [brand, setBrand] = useState("any");
  const [minRating, setMinRating] = useState(0);
  const [consultRequired, setConsultRequired] = useState("any");
  const [deliveryOption, setDeliveryOption] = useState("any");
  const prices = useMemo(() => {
    return allProducts
      .map((p) => Number(p.price) || 0)
      .filter((n) => Number.isFinite(n) && n >= 0);
  }, [allProducts]);

  const priceMin = prices.length ? Math.floor(Math.min(...prices)) : 0;
  const priceMaxOverall = prices.length ? Math.ceil(Math.max(...prices)) : 0;

  // Price slider state (selected max)
  const [selectedPriceMax, setSelectedPriceMax] = useState(priceMaxOverall);




  const safeSelectedPriceMax = Math.min(
    Math.max(selectedPriceMax, priceMin),
    priceMaxOverall
  );

const [sortKey, setSortKey] = useState("relevance");
  const [filterOpen, setFilterOpen] = useState(false);

  const hasActiveFilters =
    activeCategory !== "all" ||
    availability !== "any" ||
    brand !== "any" ||
    minRating > 0 ||
    consultRequired !== "any" ||
    deliveryOption !== "any" ||
    safeSelectedPriceMax < priceMaxOverall;






  const categoriesForSidebar = useMemo(() => {
    return allCategories.map((c) => ({ id: c.id, title: c.title }));
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = [...allProducts];

    if (activeCategory !== "all") {
      const cat = allCategories.find((c) => c.id === activeCategory);
      const ids = new Set(cat?.products?.map((p) => p.id) || []);
      const catTitle = (cat?.title || "").toLowerCase().trim();
      list = list.filter((p) => {
        // Static products are matched by their numeric id.
        if (ids.has(p.id)) return true;
        // API products carry categoryTitle from MongoDB — match by title.
        if (catTitle) {
          return String(p.categoryTitle || "").toLowerCase().trim() === catTitle;
        }
        return false;
      });
    }

    if (q) {
      list = list.filter((p) =>
        [p.name, p.categoryTitle].some((x) => String(x || "").toLowerCase().includes(q))
      );
    }

    if (availability !== "any") {
      if (availability === "in_stock") list = list.filter((p) => p.isInStock);
      if (availability === "out_of_stock") list = list.filter((p) => !p.isInStock);
    }

    if (brand !== "any") {
      list = list.filter((p) => p.brand === brand);
    }

    if (minRating > 0) {
      list = list.filter((p) => Number(p.rating || 0) >= minRating);
    }

    if (consultRequired !== "any") {
      const want = consultRequired === "required";
      list = list.filter((p) => Boolean(p.consultRequired) === want);
    }

    if (deliveryOption !== "any") {
      list = list.filter((p) => String(p.deliveryETA || "").includes(deliveryOption === "fast" ? "hrs" : ""));
    }

    // price range (simple max)
    list = list.filter((p) => Number(p.price || 0) <= safeSelectedPriceMax);

    // sorting


    list.sort((a, b) => {
      if (sortKey === "price_low") return Number(a.price) - Number(b.price);
      if (sortKey === "price_high") return Number(b.price) - Number(a.price);
      if (sortKey === "rating_high") return Number(b.rating) - Number(a.rating);
      // relevance fallback
      const ar = Number(a.rating || 0) * 0.7 + Number(a.reviews || 0) * 0.00001;
      const br = Number(b.rating || 0) * 0.7 + Number(b.reviews || 0) * 0.00001;
      return br - ar;
    });

    return list;
  }, [activeCategory, availability, allProducts, brand, consultRequired, deliveryOption, minRating, safeSelectedPriceMax, query, sortKey]);


const resetFilters = () => {
    setQuery("");
    setActiveCategory("all");
    setAvailability("any");
    setBrand("any");
    setMinRating(0);
    setConsultRequired("any");
    setDeliveryOption("any");
    setSelectedPriceMax(priceMaxOverall);
    setSortKey("relevance");
  };

  // Lock body scroll while the mobile filter drawer is open
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


  // Read URL params (global search / category) and apply only those filters
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("query") || "";
    const catParamRaw = params.get("category") || "";
    const catParam = catParamRaw.trim();

    // Always keep category in sync with URL (including refresh)
    const normalize = (s) => String(s || "").trim().toLowerCase();
    const resolveCategoryId = (value) => {
      const v = normalize(value);
      if (!v) return "all";

      // 1) If URL already uses category ids (e.g. pain, women)
      const byId = allCategories.find((c) => normalize(c.id) === v);
      if (byId) return byId.id;

      // 2) If URL uses category titles (e.g. "Pain Relief", "Women's Wellness")
      const byTitle = allCategories.find((c) => normalize(c.title) === v);
      if (byTitle) return byTitle.id;

      // 3) Fallback invalid => All
      return "all";
    };

    const nextActiveCategory = resolveCategoryId(catParam);

    if (q || catParam) {
      // reset other filters then apply only query + category
      setAvailability("any");
      setBrand("any");
      setMinRating(0);
      setConsultRequired("any");
      setDeliveryOption("any");
      setSelectedPriceMax(priceMaxOverall);
      setSortKey("relevance");


      setQuery(q);
      setActiveCategory(nextActiveCategory);
    } else {
      // No query/category in URL => default to All
      setQuery("");
      setActiveCategory("all");
    }
  }, [location.search, allProducts]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleProductClick = (product) => {
    // Route by the MongoDB _id (what the backend expects). The numeric id
    // is only used for display/sorting, never for API calls or routing.
    const routeId = product?._id || product?.id;
    navigate(`/products/${routeId}`, { state: { product } });
  };

  const formatDiscountPct = (p) => {
    // Prefer explicit discount format in data; fallback to computed old/new prices
    if (typeof p.discount === "string" && p.discount.includes("%")) return p.discount;
    const oldP = Number(p.oldPrice);
    const curP = Number(p.price);
    if (!Number.isFinite(oldP) || !Number.isFinite(curP) || oldP <= 0 || oldP <= curP) return null;
    const pct = Math.round(((oldP - curP) / oldP) * 100);
    return pct > 0 ? `-${pct}%` : null;
  };

  const reviewCountSafe = (p) => {
    const r = Number(p.reviews || p.reviewCount || 0);
    return r > 0 ? r.toLocaleString() : "";
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
          {/* Sidebar */}
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

                {/* Category */}
                <div>
                  <div className="font-semibold text-neutral-900 mb-3">Category</div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setActiveCategory("all")}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                        activeCategory === "all"
                          ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)]"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                      }`}
                    >
                      All
                    </button>
                    {categoriesForSidebar.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveCategory(c.id)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                          activeCategory === c.id
                            ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)]"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                        }`}
                      >
                        {c.title}
                      </button>
                    ))}
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
                      max={priceMaxOverall}
                      value={safeSelectedPriceMax}
                      onChange={(e) => setSelectedPriceMax(Number(e.target.value))}
                      className="w-full absolute left-0 top-0 h-2 bg-transparent appearance-none outline-none cursor-pointer"
                      style={{
                        background: "transparent",
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-neutral-500 mt-2">
                    <span>₹{priceMin}</span>
                    <span>₹{priceMaxOverall}</span>
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
                            ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)]"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brand */}
                <div>
                  <div className="font-semibold text-neutral-900 mb-3">Brand</div>
                  <div className="space-y-2">
                    {[
                      { id: "any", label: "Any" },
                      { id: "Dr. Kent", label: "Dr. Kent" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setBrand(opt.id)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                          brand === opt.id
                            ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)]"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <div className="font-semibold text-neutral-900 mb-3">Rating</div>
                  <div className="space-y-2">
                    {[
                      { id: 0, label: "Any" },
                      { id: 4.5, label: "4.5+" },
                      { id: 4.0, label: "4.0+" },
                      { id: 3.5, label: "3.5+" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setMinRating(opt.id)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                          minRating === opt.id
                            ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)]"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Consultation Required */}
                <div>
                  <div className="font-semibold text-neutral-900 mb-3">Consultation</div>
                  <div className="space-y-2">
                    {[
                      { id: "any", label: "Any" },
                      { id: "required", label: "Required" },
                      { id: "not_required", label: "Not required" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setConsultRequired(opt.id)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                          consultRequired === opt.id
                            ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)]"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Delivery Options */}
                <div>
                  <div className="font-semibold text-neutral-900 mb-3">Delivery Options</div>
                  <div className="space-y-2">
                    {[
                      { id: "any", label: "Any" },
                      { id: "fast", label: "Fast delivery" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setDeliveryOption(opt.id)}
                        className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                          deliveryOption === opt.id
                            ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)]"
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
                    onClick={fetchProducts}
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
                  const discountLabel = formatDiscountPct(p);
                  const rating = Number(p.rating || 0);

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
                          if (e.key === 'Enter' || e.key === ' ') handleProductClick(p);
                        }}
                        className="w-full text-left cursor-pointer"
                      >
                        <div className="flex flex-col md:flex-row md:items-stretch">
                          {/* Compact Image */}
                          <div className="flex-shrink-0 p-3 md:p-4">
                            <div className="relative w-[76px] sm:w-[88px] h-[76px] sm:h-[88px] rounded-xl overflow-hidden bg-gradient-to-br from-[var(--brand-50)] to-white border border-neutral-100 flex items-center justify-center">
                              {discountLabel && (
                                <div className="absolute top-2 left-2 z-10 bg-[var(--brand-600)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                  {discountLabel}
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

                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex items-center gap-1">
                                    <span className="text-amber-500 font-extrabold">★</span>
                                    <span className="font-semibold text-neutral-800 text-[13px]">
                                      {rating.toFixed(1)}
                                    </span>
                                  </div>
                                  <span className="text-neutral-500 text-[12px]">
                                    ({reviewCountSafe(p)} reviews)
                                  </span>
                                </div>

                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-100 whitespace-nowrap">
                                    Delivery {p.deliveryETA}
                                  </span>

                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--brand-50)] text-[var(--brand-700)] text-[11px] font-semibold border border-[var(--brand-100)]">
                                    {p.consultRequired ? "Consultation" : "No consult"}
                                  </span>

                                  <span
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                                      p.isInStock
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                        : "bg-rose-50 text-rose-700 border-rose-100"
                                    }`}
                                  >
                                    {p.isInStock ? "In stock" : "Out of stock"}
                                  </span>
                                </div>
                              </div>

                              {/* Price + actions */}
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
                                    {p.discount && typeof p.discount === "string" && !p.discount.includes("%") && (
                                      <div className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                                        {p.discount}
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

            <div className="products-filter-scrollbar p-5 space-y-7 overflow-y-auto flex-1">
              {/* Category */}
              <div>
                <div className="font-semibold text-neutral-900 mb-3">Category</div>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setActiveCategory("all")}
                    className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                      activeCategory === "all"
                        ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)]"
                        : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                    }`}
                  >
                    All
                  </button>
                  {categoriesForSidebar.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setActiveCategory(c.id)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                        activeCategory === c.id
                          ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)]"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                      }`}
                    >
                      {c.title}
                    </button>
                  ))}
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
                  max={priceMaxOverall}
                  value={safeSelectedPriceMax}
                  onChange={(e) => setSelectedPriceMax(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-neutral-500 mt-2">
                  <span>₹{priceMin}</span>
                  <span>₹{priceMaxOverall}</span>
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
                          ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)]"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <div className="font-semibold text-neutral-900 mb-3">Brand</div>
                <div className="space-y-2">
                  {[
                    { id: "any", label: "Any" },
                    { id: "Dr. Kent", label: "Dr. Kent" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setBrand(opt.id)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                        brand === opt.id
                          ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)]"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <div className="font-semibold text-neutral-900 mb-3">Rating</div>
                <div className="space-y-2">
                  {[
                    { id: 0, label: "Any" },
                    { id: 4.5, label: "4.5+" },
                    { id: 4.0, label: "4.0+" },
                    { id: 3.5, label: "3.5+" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setMinRating(opt.id)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                        minRating === opt.id
                          ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)]"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Consultation */}
              <div>
                <div className="font-semibold text-neutral-900 mb-3">Consultation</div>
                <div className="space-y-2">
                  {[
                    { id: "any", label: "Any" },
                    { id: "required", label: "Required" },
                    { id: "not_required", label: "Not required" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setConsultRequired(opt.id)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                        consultRequired === opt.id
                          ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)]"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-[var(--brand-200)]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Options */}
              <div>
                <div className="font-semibold text-neutral-900 mb-3">Delivery Options</div>
                <div className="space-y-2">
                  {[
                    { id: "any", label: "Any" },
                    { id: "fast", label: "Fast delivery" },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDeliveryOption(opt.id)}
                      className={`w-full text-left text-sm px-3 py-2 rounded-xl border transition ${
                        deliveryOption === opt.id
                          ? "bg-[var(--brand-50)] border-[var(--brand-200)] text-[var(--brand-800)]"
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

