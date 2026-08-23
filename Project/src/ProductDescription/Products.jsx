import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Shield,
  Award,
  ChevronRight,
  Plus,
  Minus,
  Share2,
  ThumbsUp,
  BadgeCheck,
  RefreshCw,
  Scale,
  FileText,
  Info,
} from "lucide-react";
import { FaLeaf, FaBolt, FaFire } from "react-icons/fa";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import ProductCard from "../components/ProductCard";
import { useCartContext } from "../Cart/CartContext";
import { ProductDetailSkeleton } from "../components/LoadingSkeleton";
import api from "../services/api";

/**
 * Normalize backend product response to the shape expected by the UI.
 */
function normalizeProduct(raw) {
  const product_name = raw.product_name || raw.name || "";
  const product_image = raw.product_image || raw.image || "";
  // Combine every available image source into a single deduplicated gallery.
  const imageSources = [
    product_image,
    ...(Array.isArray(raw.images) ? raw.images : []),
    ...(Array.isArray(raw.thumbnail_images) ? raw.thumbnail_images : []),
    ...(Array.isArray(raw.gallery_images) ? raw.gallery_images : []),
    ...(Array.isArray(raw.extra_images) ? raw.extra_images : []),
    raw.zoom_image,
  ];
  const seen = new Set();
  const images = imageSources.filter((src) => {
    if (!src || typeof src !== "string") return false;
    const trimmed = src.trim();
    if (!trimmed || seen.has(trimmed)) return false;
    seen.add(trimmed);
    return true;
  });
  const resolvedImage = images.length > 0 ? images[0] : product_image;
  const mrp = Number(raw.mrp_price || raw.mrp || raw.originalPrice || 0);
  const price = Number(raw.discount_price || raw.price || raw.currentPrice || 0);
  const category =
    raw.category?.category_name || raw.categoryTitle || raw.category || "Products";
  const stock = raw.stock ?? raw.inStock ?? 0;
  const inStock = stock > 0;
  const description = raw.short_description || raw.shortDescription || raw.description || "";
  const longDescription = raw.detailed_description || raw.detailedDescription || raw.longDescription || description;
  const potency = (raw.potency && raw.potency.trim() !== "30C" ? raw.potency.trim() : (raw.potency?.trim() || ""));
  const variantList = Array.isArray(raw.variants) ? raw.variants : [];
  const sizeOptions = variantList.map((variant) => variant?.size).filter(Boolean);
  const packFallback = raw.pack || raw.sizes?.[0] || "";
  const sizes = sizeOptions.length > 0 ? [...new Set(sizeOptions)] : (packFallback ? [packFallback] : []);

  const variantPotencies = variantList.map((v) => v?.potency?.trim()).filter(Boolean);
  const rawPotencies = Array.isArray(raw.potencies) && raw.potencies.length > 0
    ? raw.potencies.map((p) => typeof p === "string" ? p.trim() : (p?.value || "").trim()).filter(Boolean)
    : (potency ? [potency] : []);
  const allPotencies = variantPotencies.length > 0 ? [...new Set(variantPotencies)] : rawPotencies;
  const potencies = allPotencies.filter(Boolean);

  let discountPct = 0;
  if (typeof raw.discount === "number") {
    discountPct = raw.discount;
  } else if (typeof raw.discount === "string") {
    const m = raw.discount.match(/(\d+(?:\.\d+)?)%/);
    if (m) discountPct = Number(m[1]);
  } else if (mrp > 0 && price > 0 && mrp > price) {
    discountPct = Math.round(((mrp - price) / mrp) * 100);
  }

  const routeId = raw._id || raw.id;

  return {
    id: routeId,
    _id: routeId,
    slug: raw.slug || "",
    name: product_name,
    category,
    description,
    longDescription,
    rating: Number(raw.rating || raw.averageRating || 0),
    reviews: Number(raw.reviews || raw.reviewCount || raw.totalReviews || 0),
    reviewCount: Number(raw.reviews || raw.reviewCount || raw.totalReviews || 0),
    images,
    image: resolvedImage,
    currentPrice: price,
    originalPrice: mrp,
    discount: discountPct,
    inStock,
    soldCount: Number(raw.sold_count || raw.soldCount || 0),
    availabilityText: inStock ? "In stock" : "Out of stock",
    potencies,
    potencyObjects: potencies.map((p) => ({ value: p })),
    sizes,
    variants: variantList,
    shortDescription: description,
    badge: raw.badge || "",
    brand: raw.brand || "Kent",
    stock,
    medicineType: raw.medicine_type || raw.medicineType || "",
    sku: raw.sku || "",
    prescriptionRequired: raw.prescription_required || raw.prescriptionRequired || false,
    // New dynamic specifications from the backend
    specifications: Array.isArray(raw.specifications) ? raw.specifications : [],
    featured: raw.featured || false,
    bestSeller: raw.best_seller || raw.bestSeller || false,
    trending: raw.trending || false,
    newArrival: raw.new_arrival || raw.newArrival || false,
    mrp: mrp,
    price: price,
  };
}

/* ------- Small helper components ------- */

const StarRating = ({ rating, size = "w-4 h-4" }) => {
  const rounded = Math.round(rating || 0);
  return (
    <div className="flex">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < rounded ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
        />
      ))}
    </div>
  );
};

const Products = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const cart = useCartContext();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Review & rating state
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [ratingSummary, setRatingSummary] = useState({ average: 0, total: 0 });

  const fetchProduct = useCallback(async () => {
    if (!productId) {
      setError("Product ID is missing");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const res = await api.get(`/products/${productId}`);
      if (res.data?.success && res.data?.product) {
        setProduct(normalizeProduct(res.data.product));
      } else {
        setNotFound(true);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(
          err.response?.data?.message || "Failed to load product. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProduct();
  }, [fetchProduct]);

  // Fetch reviews for the product and compute averageRating / totalReviews
  const fetchReviews = useCallback(async () => {
    if (!productId) return;
    setReviewsLoading(true);
    try {
      const res = await api.get("/reviews", { params: { productId, limit: 50 } });
      const list = Array.isArray(res.data?.reviews) ? res.data.reviews : [];
      setReviews(list);
      if (list.length > 0) {
        const total = list.length;
        const sum = list.reduce((acc, r) => acc + Number(r.rating || 0), 0);
        setRatingSummary({ average: Number((sum / total).toFixed(1)), total });
      } else {
        setRatingSummary({ average: 0, total: 0 });
      }
    } catch {
      setReviews([]);
      setRatingSummary({ average: 0, total: 0 });
    } finally {
      setReviewsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReviews();
  }, [fetchReviews]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedPotency, setSelectedPotency] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [zoom, setZoom] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const relatedRef = useRef(null);

  // Recently viewed tracking
  useEffect(() => {
    if (!product) return;
    try {
      const key = "recently_viewed_v1";
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const next = [product, ...existing.filter((p) => p._id !== product._id)].slice(0, 8);
      localStorage.setItem(key, JSON.stringify(next));
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecentlyViewed(next);
    } catch {
      // ignore
    }
  }, [product]);

  // Sticky purchase bar on scroll
  useEffect(() => {
    const onScroll = () => {
      setStickyVisible(window.scrollY > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [frequentlyBought, setFrequentlyBought] = useState([]);

  // Fetch related and recommended products from backend
  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/products", { params: { limit: 16 } });
        const all = (res.data?.products || []).filter((p) => (p._id || p.id) !== product._id);
        const catName = typeof product.category === "string" ? product.category : product.category?.category_name;
        const matchingCategory = all.filter((p) => {
          const pCatName = typeof p.category === "string" ? p.category : p.category?.category_name;
          return pCatName && pCatName.toLowerCase() === (catName || "").toLowerCase();
        });
        const finalRelated = matchingCategory.length >= 2 ? matchingCategory : all.slice(0, 8);
        const finalFrequent = all.filter((p) => !finalRelated.some((r) => (r._id || r.id) === (p._id || p.id))).slice(0, 4);

        if (!cancelled) {
          setRelatedProducts(
            finalRelated.map((p) => {
              const mrp = Number(p.mrp_price || p.mrp || 0);
              const price = Number(p.discount_price || p.price || p.selling_price || 0);
              return {
                id: p._id,
                _id: p._id,
                name: p.product_name || p.name,
                price: price,
                oldPrice: mrp > price ? mrp : undefined,
                rating: Number(p.averageRating || p.rating || 0),
                reviews: Number(p.totalReviews || p.reviews || 0),
                image: p.product_image || p.image,
                discount: mrp > price ? `-${Math.round(((mrp - price) / mrp) * 100)}%` : undefined,
                badge: p.best_seller ? "Best Seller" : p.new_arrival ? "New" : p.featured ? "Featured" : p.top_pick ? "Top Pick" : undefined,
                categoryTitle: p.category?.category_name || p.category || "Products",
                brand: p.brand || "Dr. Kent",
                isInStock: Number(p.stock || 0) > 0,
              };
            })
          );
          setFrequentlyBought(
            finalFrequent.map((p) => {
              const mrp = Number(p.mrp_price || p.mrp || 0);
              const price = Number(p.discount_price || p.price || p.selling_price || 0);
              return {
                id: p._id,
                _id: p._id,
                name: p.product_name || p.name,
                price: price,
                oldPrice: mrp > price ? mrp : undefined,
                rating: Number(p.averageRating || p.rating || 0),
                reviews: Number(p.totalReviews || p.reviews || 0),
                image: p.product_image || p.image,
                discount: mrp > price ? `-${Math.round(((mrp - price) / mrp) * 100)}%` : undefined,
                badge: p.best_seller ? "Best Seller" : p.new_arrival ? "New" : p.featured ? "Featured" : p.top_pick ? "Top Pick" : undefined,
                categoryTitle: p.category?.category_name || p.category || "Products",
                brand: p.brand || "Dr. Kent",
                isInStock: Number(p.stock || 0) > 0,
              };
            })
          );
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [product]);

  const scrollRelated = (dir) => {
    relatedRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  const displaySelectedPotency = selectedPotency || product?.potencies?.[0] || "";
  const displaySelectedSize = selectedSize || product?.sizes?.[0] || "";

  const selectedVariant = useMemo(() => {
    if (!product || !Array.isArray(product.variants) || product.variants.length === 0) {
      return null;
    }
    return (
      product.variants.find((variant) => String(variant?.size || "") === String(displaySelectedSize || "")) ||
      product.variants[0] ||
      null
    );
  }, [product, displaySelectedSize]);

  const selectedPotencyObj = useMemo(() => {
    const list = product?.potencyObjects || [];
    if (!list || list.length === 0) return null;
    return (
      list.find((p) => String(p?.value || "") === String(displaySelectedPotency || "")) ||
      list[0] ||
      null
    );
  }, [product, displaySelectedPotency]);

  const activePrice = Number(
    selectedVariant?.selling_price ??
      selectedVariant?.discount_price ??
      selectedPotencyObj?.discount_price ??
      product?.currentPrice ??
      0
  );
  const activeMrp = Number(
    selectedVariant?.mrp_price ??
      selectedPotencyObj?.mrp_price ??
      product?.originalPrice ??
      0
  );
  const activeStock = Number(
    selectedVariant?.stock ??
      selectedPotencyObj?.stock ??
      product?.stock ??
      0
  );
  const activeSku =
    selectedVariant?.sku || selectedPotencyObj?.sku || product?.sku || "";
  const isVariantDriven = Boolean(selectedVariant) || Boolean(selectedPotencyObj);
  const isAvailable = isVariantDriven
    ? activeStock > 0
    : Boolean(product?.inStock) && !product?.out_of_stock;
  const selectedPackInfo = [displaySelectedPotency, displaySelectedSize].filter(Boolean).join(" · ");

  const amountSaved = activeMrp > activePrice ? activeMrp - activePrice : 0;
  const discountPct =
    activeMrp > 0 && activeMrp > activePrice
      ? Math.round(((activeMrp - activePrice) / activeMrp) * 100)
      : product?.discount || 0;

  const displayedRating = ratingSummary.average || product?.rating || 0;
  const displayedReviews = ratingSummary.total || product?.reviewCount || 0;

  const addCurrentToCart = () => {
    if (!product) return;
    const variant =
      selectedVariant ||
      (selectedPotencyObj ? { ...selectedPotencyObj, size: displaySelectedSize, potency: displaySelectedPotency } : null);
    cart.addToCart(
      {
        id: product.id,
        name: product.name,
        image: product.image,
        price: activePrice,
        mrp: activeMrp || activePrice,
        category: product.category,
        inStock: isAvailable,
        stock: activeStock || product.stock,
        packInfo: selectedPackInfo,
        sku: activeSku,
        variant_id: variant?._id ? String(variant._id) : "",
        variant_index: selectedVariant ? product.variants.findIndex((v) => String(v?._id) === String(selectedVariant._id)) : null,
        selected_size: variant?.size || displaySelectedSize,
        selected_potency: variant?.potency || displaySelectedPotency,
        selling_price: activePrice,
        mrp_price: activeMrp,
        min_order_qty: variant?.min_order_qty || 1,
      },
      quantity
    );
  };

  const buyCurrentNow = () => {
    addCurrentToCart();
  };

  const badge = product?.bestSeller
    ? "Best Seller"
    : product?.newArrival
      ? "New Arrival"
      : product?.trending
        ? "Trending"
        : product?.top_pick || product?.topPick
          ? "Top Pick"
          : product?.featured
            ? "Featured"
            : "";

  // About Product section only (simplified Product Information)
  const aboutProduct = product?.longDescription || product?.description || "";

  // Dynamic specifications from the backend
  const specs = Array.isArray(product?.specifications)
    ? product.specifications.filter((s) => s && (s.label || s.value))
    : [];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <nav className="text-sm text-neutral-500 flex items-center gap-2 flex-wrap">
            <Link to="/" className="hover:text-[var(--brand-700)]">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/Products" className="hover:text-[var(--brand-700)]">
              Products
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-neutral-900 font-medium">
              {product?.name || (loading ? "Loading..." : "")}
            </span>
          </nav>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <ProductDetailSkeleton />
        </div>
      )}

      {/* Error State */}
      {error && !loading && !notFound && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">Failed to load product</h2>
            <p className="text-sm text-neutral-500 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={fetchProduct} className="btn-primary py-2.5 px-5">
                Try Again
              </button>
              <Link to="/Products" className="btn-outline py-2.5 px-5">
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 404 / Not Found State */}
      {notFound && !loading && !error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto mb-4">
              <FaLeaf className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              Product not found
            </h2>
            <p className="text-sm text-neutral-500 mb-4">
              The product you are looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/Products"
              className="btn-primary inline-flex items-center justify-center py-2.5 px-5"
            >
              Browse Products
            </Link>
          </div>
        </div>
      )}

      {/* Product Content */}
      {product && !loading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8 pb-24">
          {/* Product section */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Images */}
            <div className="w-full max-w-md mx-auto lg:max-w-none">
              <div
                className={`relative bg-gradient-to-br from-[var(--brand-50)] to-white
                         border border-neutral-100 rounded-3xl overflow-hidden
                         aspect-square max-h-[280px] sm:max-h-[340px] lg:max-h-none flex items-center justify-center group mx-auto ${
                           zoom ? "cursor-zoom-out" : "cursor-zoom-in"
                         }`}
                onClick={() => setZoom((z) => !z)}
              >
                <img
                  src={product.images?.[selectedImage] || product.image}
                  alt={product.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=900&auto=format&fit=crop";
                  }}
                  className={`w-full h-full max-h-[260px] sm:max-h-[320px] lg:max-h-none object-contain p-4 transition-transform duration-500 ${
                    zoom ? "scale-150" : "hover:scale-105"
                  }`}
                />

                {/* Discount badge */}
                {discountPct > 0 && (
                  <div
                    className="absolute top-3 left-3
                             bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-700)]
                             text-white px-2.5 py-1 text-xs font-bold rounded-lg
                             shadow-md flex items-center gap-1"
                  >
                    <FaFire className="text-[10px]" />
                    -{discountPct}% OFF
                  </div>
                )}

                {/* Bestseller / New badge */}
                {badge && (
                  <div
                    className="absolute bottom-16 left-4
                             bg-amber-100 text-amber-700 px-3 py-1.5 text-xs font-bold rounded-full
                             shadow-md flex items-center gap-1"
                  >
                    <Award className="w-3 h-3" />
                    {badge}
                  </div>
                )}

                {/* Stock badge */}
                {!isAvailable && (
                  <div className="absolute top-4 right-4 bg-rose-600 text-white px-3 py-1.5 text-xs font-bold rounded-full shadow-lg">
                    Out of Stock
                  </div>
                )}

                {/* Zoom hint */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 text-xs text-neutral-600 flex items-center gap-1 shadow">
                  <Scale className="w-3.5 h-3.5 text-[var(--brand-600)]" />
                  {zoom ? "Zoom Out" : "Hover / Click to Zoom"}
                </div>

                {/* Share button */}
                <div className="absolute top-4 right-4">
                  <button
                    aria-label="Share"
                    onClick={async (e) => {
                      e.stopPropagation();
                      const url = window.location.href;
                      if (navigator.share) {
                        await navigator.share({ title: product.name, url });
                        return;
                      }
                      await navigator.clipboard.writeText(url);
                    }}
                    className="w-10 h-10 rounded-full bg-white shadow-md
                               flex items-center justify-center text-neutral-500
                               hover:text-[var(--brand-700)] transition"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Trust strip at bottom */}
                <div
                  className="absolute bottom-4 left-4 right-4
                           bg-white/95 backdrop-blur rounded-xl p-3
                           flex items-center justify-around gap-2 text-xs
                           border border-neutral-100"
                >
                  <div className="flex items-center gap-1.5 text-neutral-700">
                    <Shield className="w-4 h-4 text-[var(--brand-600)]" />
                    <span className="font-medium">Genuine</span>
                  </div>
                  <div className="w-px h-4 bg-neutral-200" />
                  <div className="flex items-center gap-1.5 text-neutral-700">
                    <Award className="w-4 h-4 text-[var(--brand-600)]" />
                    <span className="font-medium">GMP</span>
                  </div>
                </div>
              </div>

              {/* Thumbnails */}
              {Array.isArray(product.images) && product.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  {product.images.map((image, index) => (
                    <button
                      key={image + index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-xl overflow-hidden border-2
                                  transition bg-white ${
                                    selectedImage === index
                                      ? "border-[var(--brand-600)] shadow-md"
                                      : "border-neutral-200 hover:border-[var(--brand-300)]"
                                  }`}
                    >
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* Product Info with Mobile Reordering */}
            <div className="lg:sticky lg:top-32 lg:self-start flex flex-col">
              {/* Block 1: Product Name / Brand / Basic info (Mobile Order 1) */}
              <div className="order-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
                               bg-[var(--brand-100)] text-[var(--brand-700)]
                               text-[11px] font-semibold"
                  >
                    <FaLeaf className="text-[9px]" />
                    Homoeopathic
                  </span>
                  {badge && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
                                 bg-amber-100 text-amber-700 text-[11px] font-semibold"
                    >
                      <Award className="w-3 h-3" />
                      {badge}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-1.5 tracking-tight">
                  {product.name}
                </h1>

                {/* Brand Name Only */}
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs sm:text-sm font-bold text-[var(--brand-700)] bg-[var(--brand-50)] px-2.5 py-1 rounded-lg border border-[var(--brand-100)]">
                    Brand: {product.brand || "Kent"}
                  </span>
                  <span className="text-xs text-neutral-500">
                    Category: {product.category}
                  </span>
                </div>

                {product.medicineType && (
                  <p className="text-xs text-neutral-400 mb-2">{product.medicineType}</p>
                )}

                {/* Rating + Sold count */}
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  {displayedReviews > 0 && displayedRating > 0 ? (
                    <>
                      <StarRating rating={displayedRating} />
                      <span className="text-xs sm:text-sm font-medium text-neutral-700">
                        {displayedRating}
                      </span>
                      <span className="text-xs sm:text-sm text-neutral-500">
                        ({displayedReviews} reviews)
                      </span>
                    </>
                  ) : (
                    <span className="text-xs sm:text-sm text-neutral-400">No reviews yet</span>
                  )}
                  {product.soldCount > 0 && (
                    <span className="text-xs text-emerald-600 font-medium">
                      <BadgeCheck className="w-3.5 h-3.5 inline mr-0.5" />
                      {product.soldCount.toLocaleString()}+ Sold
                    </span>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-1 pb-2 border-b border-dashed border-neutral-200 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-extrabold text-neutral-900">
                    ₹{activePrice}
                  </span>
                  {activeMrp > 0 && activeMrp > activePrice && (
                    <span className="text-lg sm:text-xl text-neutral-400 line-through">
                      ₹{activeMrp}
                    </span>
                  )}
                  {discountPct > 0 && (
                    <span
                      className="bg-emerald-100 text-emerald-700
                                 text-xs font-bold px-2 py-0.5 rounded-full"
                    >
                      {discountPct}% OFF
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3 flex-wrap">
                  {amountSaved > 0 && (
                    <span className="text-emerald-600 font-semibold">
                      You save ₹{amountSaved.toFixed(2)}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Info className="w-3 h-3" /> Inclusive of all taxes
                  </span>
                </div>

                {/* Short Description */}
                <p className="text-xs sm:text-sm text-neutral-600 mb-4 leading-relaxed">{product.description}</p>
              </div>

              {/* Block 2: Potency (Desktop Order 2) */}
              {product.potencies && product.potencies.length > 0 && product.potencies[0] && (
                <div className="order-2 my-2">
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-2">Potency</label>
                  <div className="flex flex-wrap gap-2">
                    {product.potencies.map((potency) => (
                      <button
                        key={potency}
                        type="button"
                        onClick={() => setSelectedPotency(potency)}
                        className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition
                                    ${
                                      displaySelectedPotency === potency
                                        ? "bg-[var(--brand-600)] text-white shadow-md shadow-[var(--brand-600)]/30"
                                        : "bg-white text-neutral-700 border border-neutral-200 hover:border-[var(--brand-300)]"
                                    }`}
                      >
                        {potency}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Block 3: Pack Size (Desktop Order 3) */}
              {product.sizes && product.sizes.length > 0 && product.sizes[0] && (
                <div className="order-3 my-2">
                  <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-2">Pack Size</label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition
                                    ${
                                      displaySelectedSize === size
                                        ? "bg-[var(--brand-600)] text-white shadow-md shadow-[var(--brand-600)]/30"
                                        : "bg-white text-neutral-700 border border-neutral-200 hover:border-[var(--brand-300)]"
                                    }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Block 4: Quantity (Desktop Order 4) */}
              <div className="order-4 my-2">
                <label className="block text-xs sm:text-sm font-semibold text-neutral-800 mb-2">Quantity</label>
                <div className="inline-flex items-center bg-white border border-neutral-200 rounded-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[var(--brand-700)] hover:bg-[var(--brand-50)] transition font-bold"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center font-bold text-sm text-neutral-800 border-x border-neutral-200 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-[var(--brand-700)] hover:bg-[var(--brand-50)] transition font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Block 5: Action Buttons (Desktop Order 5) */}
              <div className="order-5 my-4">
                {isAvailable ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      className="flex-1 btn-primary py-3 text-sm sm:text-base font-bold shadow-md flex items-center justify-center gap-2"
                      onClick={addCurrentToCart}
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      className="flex-1 btn-outline py-3 text-sm sm:text-base font-bold flex items-center justify-center gap-2"
                      onClick={() => {
                        buyCurrentNow();
                        navigate("/Cart");
                      }}
                    >
                      <FaBolt />
                      Buy Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="p-3 bg-rose-50 text-rose-700 text-xs sm:text-sm font-semibold rounded-xl border border-rose-100 text-center">
                      Currently Out of Stock / Unavailable
                    </div>
                    <button
                      type="button"
                      onClick={() => alert("You will be notified once this item is back in stock!")}
                      className="w-full btn-primary py-3 text-sm sm:text-base font-bold flex items-center justify-center gap-2"
                    >
                      Notify Me
                    </button>
                  </div>
                )}
              </div>

              {/* Block 6: Availability & Badges */}
              <div className="order-6 my-2">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    isAvailable
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-rose-50 text-rose-700 border-rose-100"
                  }`}
                >
                  {isAvailable ? "In stock" : "Out of stock"}
                </span>
                {product.prescriptionRequired && (
                  <span className="ml-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-700 border-amber-100">
                    <FileText className="w-3 h-3" /> Prescription Required
                  </span>
                )}
                {activeSku && (
                  <span className="ml-2 text-xs text-neutral-400">
                    SKU: <span className="font-mono">{activeSku}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Product Information — About Product only */}
          <section className="mb-12 md:mb-16">
            <div className="text-center mb-8">
              <span className="section-eyebrow">Complete Details</span>
              <h2 className="section-title mt-3">About Product</h2>
            </div>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white border border-neutral-100 rounded-3xl shadow-sm p-6 md:p-10">
                {aboutProduct ? (
                  <div
                    className="prose max-w-none text-neutral-700 leading-relaxed text-base md:text-lg"
                    style={{ lineHeight: "1.8" }}
                  >
                    {aboutProduct.split("\n").map((line, i) =>
                      line.trim() ? (
                        <p key={i} className="mb-4 last:mb-0 text-neutral-700">
                          {line}
                        </p>
                      ) : (
                        <div key={i} className="h-3" />
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-neutral-500">No description available for this product.</p>
                )}
              </div>
            </div>
          </section>

          {/* Product Specifications — dynamic from backend */}
          {specs.length > 0 && (
            <section className="mb-12 md:mb-16">
              <div className="text-center mb-8">
                <span className="section-eyebrow">Quick reference</span>
                <h2 className="section-title mt-3">Product Specifications</h2>
              </div>
              <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm max-w-3xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  {specs.map((s, i) => (
                    <div
                      key={i}
                      className={`px-5 py-3.5 flex items-center justify-between gap-4 text-sm ${
                        i % 2 === 0 ? "sm:border-r sm:border-neutral-100" : ""
                      } border-b border-neutral-100`}
                    >
                      <span className="text-neutral-500">{s.label}</span>
                      <span className="font-semibold text-neutral-800 text-right">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Related Products slider */}
          {relatedProducts.length > 0 && (
            <section className="mb-12 md:mb-16">
              <div className="flex items-end justify-between gap-4 mb-8">
                <div>
                  <span className="section-eyebrow">You may also like</span>
                  <h2 className="section-title mt-3">Related Products</h2>
                </div>
                <div className="hidden md:flex gap-2">
                  <button
                    onClick={() => scrollRelated(-1)}
                    aria-label="Scroll left"
                    className="w-11 h-11 rounded-full bg-white shadow-md border border-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] transition"
                  >
                    <HiOutlineChevronLeft className="text-xl" />
                  </button>
                  <button
                    onClick={() => scrollRelated(1)}
                    aria-label="Scroll right"
                    className="w-11 h-11 rounded-full bg-white shadow-md border border-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] transition"
                  >
                    <HiOutlineChevronRight className="text-xl" />
                  </button>
                </div>
              </div>

              <div ref={relatedRef} className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-2 -mx-2 px-2">
                {relatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* Recently Viewed */}
          {recentlyViewed.length > 1 && (
            <section className="mb-12 md:mb-16">
              <div className="mb-8">
                <span className="section-eyebrow">Keep exploring</span>
                <h2 className="section-title mt-3">Recently Viewed</h2>
              </div>
              <div className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-2 -mx-2 px-2">
                {recentlyViewed.slice(1, 5).map((p) => {
                  const card = {
                    id: p.id,
                    _id: p._id,
                    name: p.name,
                    price: p.price,
                    oldPrice: p.originalPrice,
                    rating: p.rating,
                    reviews: p.reviews,
                    image: p.image,
                    discount: p.discount ? `-${p.discount}%` : undefined,
                  };
                  return <ProductCard key={p.id} product={card} />;
                })}
              </div>
            </section>
          )}
          
          {/* Reviews — Real approved reviews from database (Admin-managed) */}
          <section className="mb-12 md:mb-16">
            <div className="text-center mb-8">
              <span className="section-eyebrow">Verified Feedback</span>
              <h2 className="section-title mt-2">Customer Reviews</h2>
            </div>

            {displayedReviews > 0 && displayedRating > 0 ? (
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-[var(--brand-50)] to-white border border-[var(--brand-100)] rounded-2xl p-6 md:p-8 text-center lg:text-left h-fit">
                  <div className="text-5xl font-extrabold text-neutral-900 mb-2">{displayedRating}</div>
                  <div className="flex justify-center lg:justify-start mb-2">
                    <StarRating rating={displayedRating} size="w-4 h-4" />
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-500">
                    Based on {displayedReviews} verified {displayedReviews === 1 ? "review" : "reviews"}
                  </p>
                </div>

                <div className="lg:col-span-2 space-y-3">
                  {reviewsLoading ? (
                    <div className="text-center py-8 text-neutral-500 text-xs">Loading reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div className="bg-white border border-neutral-100 rounded-2xl p-6 text-center text-xs text-neutral-500">
                      No customer reviews currently available.
                    </div>
                  ) : (
                    reviews.map((review) => {
                      const authorName = review.user?.user_name || review.userName || "Verified Customer";
                      const title = review.reviewTitle || review.title || "";
                      const comment = review.reviewDescription || review.comment || "";
                      const date = review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "";
                      return (
                        <div
                          key={review._id}
                          className="bg-white border border-neutral-100 rounded-2xl p-4 sm:p-5 hover:shadow-sm transition"
                        >
                          <div className="flex items-start gap-3 mb-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-700)] text-white text-xs font-bold flex items-center justify-center shrink-0">
                              {(authorName || "A")[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="font-semibold text-xs sm:text-sm text-neutral-900">{authorName}</span>
                                {review.verifiedPurchase && (
                                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded uppercase tracking-wider flex items-center gap-0.5">
                                    <BadgeCheck className="w-3 h-3" /> Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
                                <StarRating rating={review.rating} size="w-3 h-3" />
                                <span>·</span>
                                <span>{date}</span>
                              </div>
                            </div>
                          </div>

                          {title && <div className="font-semibold text-xs sm:text-sm text-neutral-800 mb-1">{title}</div>}
                          {comment && <p className="text-xs text-neutral-600 leading-relaxed">{comment}</p>}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            ) : (
              <div className="max-w-xl mx-auto bg-white border border-neutral-100 rounded-3xl p-6 sm:p-8 text-center shadow-sm">
                <Star className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <h3 className="text-base font-bold text-neutral-900 mb-1">No reviews yet</h3>
                <p className="text-xs text-neutral-500">
                  Approved patient and customer ratings will be displayed here.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* Sticky Purchase Bar */}
      {product && !loading && stickyVisible && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-10 h-10 rounded-lg object-cover border border-neutral-200 shrink-0"
              />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-900 truncate max-w-[120px] sm:max-w-xs">
                  {product.name}
                </div>
                <div className="text-sm font-bold text-[var(--brand-700)]">
                  ₹{activePrice}
                  {activeMrp > activePrice && (
                    <span className="ml-1.5 text-xs text-neutral-400 line-through font-normal">
                      ₹{activeMrp}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={addCurrentToCart}
                disabled={!isAvailable}
                className="btn-primary py-2.5 text-sm whitespace-nowrap"
              >
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>
              <button
                onClick={() => {
                  buyCurrentNow();
                  navigate("/Cart");
                }}
                disabled={!isAvailable}
                className="btn-outline py-2.5 text-sm whitespace-nowrap"
              >
                <FaBolt />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
