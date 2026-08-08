import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  Star,
  ShoppingCart,
  Stethoscope,
  Calendar,
  Phone,
  Truck,
  Shield,
RotateCcw,
  Award,
  ChevronRight,
  Plus,
  Minus,
  Share2,
  ThumbsUp,
  BadgeCheck,
  Lock,
  RefreshCw,
  Scale,
  FileText,
  Info,
} from "lucide-react";
import { FaLeaf, FaBolt, FaFire } from "react-icons/fa";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import ProductCard from "../components/ProductCard";
import { useCartContext } from "../Cart/CartContext";
import { vitaminsSupplements, heartCare } from "../data/products";
import { ProductDetailSkeleton } from "../components/LoadingSkeleton";
import api from "../services/api";
import comboOffers from "./ComboOffer";

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
  const potency = raw.potency || raw.potencies?.[0] || "30C";
  const variantList = Array.isArray(raw.variants) ? raw.variants : [];
  const sizeOptions = variantList.map((variant) => variant?.size).filter(Boolean);
  const packFallback = raw.pack || raw.sizes?.[0] || "30ml";
  const sizes = sizeOptions.length > 0 ? [...new Set(sizeOptions)] : [packFallback];

  const potencyList = Array.isArray(raw.potencies) && raw.potencies.length > 0
    ? raw.potencies
    : (raw.potenciesSimple && raw.potenciesSimple.length > 0
        ? raw.potenciesSimple.map((p) => typeof p === "string" ? { value: p } : p)
        : []);

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
    deliveryETA: raw.deliveryETA || raw.delivery || "24 hrs",
    deliveryInfo: `Delivery in ${raw.deliveryETA || raw.delivery || "24 hrs"}`,
    potencies: Array.isArray(raw.potencies) && raw.potencies.length > 0 ? raw.potencies.map((p) => typeof p === "string" ? p : (p?.value || "")) : [potency],
    potencyObjects: potencyList,
    sizes,
    variants: variantList,
    shortDescription: description,
    badge: raw.badge || "",
    brand: raw.brand || "Dr. Kent",
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
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [reviewMessage, setReviewMessage] = useState(null);
  const [editingReviewId, setEditingReviewId] = useState(null);

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

  const relatedProducts = [
    ...vitaminsSupplements.slice(0, 4),
    ...heartCare.slice(0, 2),
  ];

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

  // ---- Review submission ----
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMessage(null);
    if (!reviewForm.rating || reviewForm.rating < 1 || reviewForm.rating > 5) {
      setReviewMessage({ type: "error", text: "Please select a rating between 1 and 5." });
      return;
    }
    try {
      const payload = {
        productId,
        rating: Number(reviewForm.rating),
        title: reviewForm.title,
        comment: reviewForm.comment,
      };
      if (editingReviewId) {
        await api.patch(`/reviews/${editingReviewId}`, payload);
        setReviewMessage({ type: "success", text: "Review updated successfully. It will be re-approved by moderation." });
      } else {
        await api.post("/reviews", payload);
        setReviewMessage({ type: "success", text: "Review submitted successfully. It will appear after approval." });
      }
      setShowReviewForm(false);
      setEditingReviewId(null);
      setReviewForm({ rating: 5, title: "", comment: "" });
      await fetchReviews();
    } catch (err) {
      setReviewMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to submit review.",
      });
    }
  };

  const startEditReview = (review) => {
    setEditingReviewId(review._id);
    setReviewForm({
      rating: Number(review.rating || 5),
      title: review.reviewTitle || review.title || "",
      comment: review.reviewDescription || review.comment || "",
    });
    setShowReviewForm(true);
    setReviewMessage(null);
  };

  const badge = product?.bestSeller
    ? "Bestseller"
    : product?.newArrival
      ? "New"
      : product?.trending
        ? "Trending"
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
          {/* Consultation Strip */}
          <div
            className="mb-8 p-5 md:p-6
                     bg-gradient-to-r from-[var(--brand-50)] to-white
                     border border-[var(--brand-100)]
                     rounded-2xl flex flex-col md:flex-row
                     items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4 text-center md:text-left">
              <div
                className="w-12 h-12 rounded-2xl
                         bg-[var(--brand-600)] flex items-center justify-center
                         text-white shadow-md shadow-[var(--brand-600)]/30"
              >
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-base md:text-lg">
                  Need Help Choosing?
                </h3>
                <p className="text-sm text-neutral-500">
                  Consult with certified homeopathy doctors — free first visit
                </p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                className="flex-1 md:flex-none btn-primary py-2.5 text-sm"
                onClick={() => navigate("/Consult")}
              >
                <Stethoscope className="w-4 h-4" />
                Consult Doctor
              </button>
              <button
                className="flex-1 md:flex-none btn-outline py-2.5 text-sm"
                onClick={() => navigate("/Consult")}
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </button>
            </div>
          </div>

          {/* Product section */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Images */}
            <div>
              <div
                className={`relative bg-gradient-to-br from-[var(--brand-50)] to-white
                         border border-neutral-100 rounded-3xl overflow-hidden
                         aspect-square flex items-center justify-center group ${
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
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    zoom ? "scale-150" : "hover:scale-105"
                  }`}
                />

                {/* Discount badge */}
                {discountPct > 0 && (
                  <div
                    className="absolute top-4 left-4
                             bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-700)]
                             text-white px-3 py-1.5 text-sm font-bold rounded-full
                             shadow-lg flex items-center gap-1"
                  >
                    <FaFire className="text-xs" />
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
                    <Truck className="w-4 h-4 text-[var(--brand-600)]" />
                    <span className="font-medium">Free Delivery</span>
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

            {/* Product Info */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full
                             bg-[var(--brand-100)] text-[var(--brand-700)]
                             text-xs font-semibold"
                >
                  <FaLeaf className="text-[10px]" />
                  Homoeopathic
                </span>
                {badge && (
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full
                               bg-amber-100 text-amber-700 text-xs font-semibold"
                  >
                    <Award className="w-3 h-3" />
                    {badge}
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-1 tracking-tight">
                {product.name}
              </h1>
              <p className="text-neutral-500 italic mb-1">
                {product.brand} · {product.category}
              </p>
              {product.medicineType && (
                <p className="text-xs text-neutral-400 mb-4">{product.medicineType}</p>
              )}

              {/* Rating + Sold count */}
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <StarRating rating={displayedRating} />
                <span className="text-sm font-medium text-neutral-700">
                  {displayedRating || 0}
                </span>
                <span className="text-sm text-neutral-500">
                  ({displayedReviews} reviews)
                </span>
                {product.soldCount > 0 && (
                  <span className="text-xs text-emerald-600 font-medium">
                    <BadgeCheck className="w-3.5 h-3.5 inline mr-0.5" />
                    {product.soldCount.toLocaleString()}+ Sold
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-1 pb-3 border-b border-dashed border-neutral-200 flex-wrap">
                <span className="text-4xl font-extrabold text-neutral-900">
                  ₹{activePrice}
                </span>
                {activeMrp > 0 && (
                  <span className="text-xl text-neutral-400 line-through">
                    ₹{activeMrp}
                  </span>
                )}
                {discountPct > 0 && (
                  <span
                    className="bg-emerald-100 text-emerald-700
                               text-xs font-bold px-2.5 py-1 rounded-full"
                  >
                    {discountPct}% OFF
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4 flex-wrap">
                {amountSaved > 0 && (
                  <span className="text-emerald-600 font-semibold">
                    You save ₹{amountSaved.toFixed(2)}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <Info className="w-3 h-3" /> Inclusive of all taxes
                </span>
              </div>

              {/* Description */}
              <p className="text-neutral-600 mb-6 leading-relaxed">{product.description}</p>

              {/* Potency */}
              {product.potencies && product.potencies.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-neutral-800 mb-3">Potency</label>
                  <div className="flex flex-wrap gap-2">
                    {product.potencies.map((potency) => (
                      <button
                        key={potency}
                        onClick={() => setSelectedPotency(potency)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition
                                    ${
                                      displaySelectedPotency === potency
                                        ? "bg-[var(--brand-600)] text-white shadow-md shadow-[var(--brand-600)]/30"
                                        : "bg-white text-neutral-700 border border-neutral-200 hover:border-[var(--brand-300)] hover:text-[var(--brand-700)]"
                                    }`}
                      >
                        {potency}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-neutral-800 mb-3">Pack Size</label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition
                                    ${
                                      displaySelectedSize === size
                                        ? "bg-[var(--brand-600)] text-white shadow-md shadow-[var(--brand-600)]/30"
                                        : "bg-white text-neutral-700 border border-neutral-200 hover:border-[var(--brand-300)] hover:text-[var(--brand-700)]"
                                    }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SKU display */}
              {activeSku && (
                <div className="mb-4 text-xs text-neutral-400">
                  SKU: <span className="font-mono">{activeSku}</span>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-neutral-800 mb-3">Quantity</label>
                <div className="inline-flex items-center bg-white border border-neutral-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center text-[var(--brand-700)] hover:bg-[var(--brand-50)] transition font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-14 text-center font-bold text-neutral-800 border-x border-neutral-200 tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-11 h-11 flex items-center justify-center text-[var(--brand-700)] hover:bg-[var(--brand-50)] transition font-bold"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  className="flex-1 btn-primary py-3.5 text-base"
                  disabled={!isAvailable}
                  onClick={addCurrentToCart}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  className="flex-1 btn-outline py-3.5 text-base"
                  disabled={!isAvailable}
                  onClick={() => {
                    buyCurrentNow();
                    navigate("/Cart");
                  }}
                >
                  <FaBolt />
                  Buy Now
                </button>
              </div>

              {/* Availability */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
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
              </div>

              {/* Quick Contact */}
              <div className="p-4 bg-[var(--brand-50)] border border-[var(--brand-100)] rounded-xl flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-800 mb-0.5">Need Expert Advice?</p>
                  <p className="text-xs text-neutral-500">Talk to our homeopathic specialist</p>
                </div>
                <a
                  href="tel:+08910863893"
                  className="flex items-center gap-2 bg-white text-[var(--brand-700)] font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[var(--brand-100)] transition"
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
              </div>

              {/* Delivery / trust info */}
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-neutral-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[var(--brand-600)]" />
                  {product.deliveryInfo}
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[var(--brand-600)]" />
                  7-day easy returns
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--brand-600)]" />
                  100% genuine
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--brand-600)]" />
                  Secure payment
                </div>
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

          {/* Combo Offers */}
          <section className="mb-12 md:mb-16">
            <div className="text-center mb-8">
              <span className="section-eyebrow">Bundle & Save</span>
              <h2 className="section-title mt-3">Combo Offers</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {comboOffers.map((combo) => (
                <div
                  key={combo.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl card-lift"
                >
                  <div className="relative aspect-[4/3] bg-gradient-to-br from-[var(--brand-50)] to-white overflow-hidden">
                    <img
                      src={combo.image}
                      alt={combo.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <span className="absolute top-3 left-3 bg-[var(--brand-600)] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {combo.discount}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-neutral-900 mb-3">{combo.name}</h3>
                    <ul className="text-sm text-neutral-500 space-y-1.5 mb-4">
                      {combo.medicines.map((med, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-[var(--brand-500)]" />
                          {med}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-2xl font-bold text-neutral-900">₹{combo.price}</span>
                      <span className="text-sm text-neutral-400 line-through">₹{combo.originalPrice}</span>
                    </div>
                    <button
                      className="w-full btn-primary py-2.5"
                      onClick={() => {
                        cart.addToCart({
                          id: `bundle-${combo.id}`,
                          name: combo.name,
                          image: combo.image,
                          price: combo.price,
                          mrp: combo.originalPrice,
                          category: "Bundle",
                          inStock: true,
                        });
                      }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add Combo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Related Products slider */}
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

          {/* Frequently Bought Together */}
          <section className="mb-12 md:mb-16">
            <div className="mb-8">
              <span className="section-eyebrow">Complete your routine</span>
              <h2 className="section-title mt-3">Frequently Bought Together</h2>
            </div>
            <div className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-2 -mx-2 px-2">
              {heartCare.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>

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

          {/* Reviews — connected to backend */}
          <section className="mb-12 md:mb-16">
            <div className="text-center mb-8">
              <span className="section-eyebrow">Real customers</span>
              <h2 className="section-title mt-3">Customer Reviews</h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-[var(--brand-50)] to-white border border-[var(--brand-100)] rounded-2xl p-6 md:p-8 text-center lg:text-left">
                <div className="text-6xl font-extrabold text-neutral-900 mb-2">{displayedRating}</div>
                <div className="flex justify-center lg:justify-start mb-2">
                  <StarRating rating={displayedRating} size="w-5 h-5" />
                </div>
                <p className="text-sm text-neutral-500 mb-6">Based on {displayedReviews} reviews</p>

                <button
                  className="btn-primary w-full mt-2 py-2.5 text-sm"
                  onClick={() => {
                    setShowReviewForm((v) => !v);
                    setReviewMessage(null);
                  }}
                >
                  {showReviewForm ? "Cancel" : "Write a Review"}
                </button>
              </div>

              <div className="lg:col-span-2 space-y-4">
                {showReviewForm && (
                  <div className="bg-white border border-neutral-200 rounded-2xl p-5 md:p-6 mb-4">
                    <div className="text-lg font-bold text-neutral-900 mb-4">
                      {editingReviewId ? "Edit Review" : "Write a Review"}
                    </div>
                    {reviewMessage && (
                      <div className={`mb-4 text-sm font-semibold px-4 py-3 rounded-xl ${reviewMessage.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"}`}>
                        {reviewMessage.text}
                      </div>
                    )}
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-800 mb-2">Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((r) => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setReviewForm((prev) => ({ ...prev, rating: r }))}
                              className="p-1"
                            >
                              <Star
                                className={`w-7 h-7 ${r <= reviewForm.rating ? "fill-amber-400 text-amber-400" : "text-neutral-300"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-800 mb-2">Title</label>
                        <input
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm((prev) => ({ ...prev, title: e.target.value }))}
                          placeholder="Summarize your experience"
                          className="border border-neutral-200 rounded-xl px-4 py-3 outline-none w-full text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-neutral-800 mb-2">Review</label>
                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm((prev) => ({ ...prev, comment: e.target.value }))}
                          rows={4}
                          placeholder="Share your experience with this product..."
                          className="border border-neutral-200 rounded-xl px-4 py-3 outline-none w-full text-sm resize-y"
                        />
                      </div>
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          className="btn-outline px-4 py-2.5 text-sm"
                          onClick={() => {
                            setShowReviewForm(false);
                            setEditingReviewId(null);
                            setReviewMessage(null);
                          }}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn-primary px-5 py-2.5 text-sm">
                          {editingReviewId ? "Update Review" : "Submit Review"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {reviewsLoading ? (
                  <div className="text-center py-10 text-neutral-500">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="bg-white border border-neutral-100 rounded-2xl p-8 text-center text-neutral-500">
                    No reviews yet. Be the first to review this product.
                  </div>
                ) : (
                  reviews.map((review) => {
                    const authorName = review.user?.user_name || review.userName || "Anonymous";
                    const title = review.reviewTitle || review.title || "";
                    const comment = review.reviewDescription || review.comment || "";
                    const date = review.createdAt
                      ? new Date(review.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
                      : "";
                    return (
                      <div
                        key={review._id}
                        className="bg-white border border-neutral-100 rounded-2xl p-5 md:p-6 hover:shadow-md transition"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-700)] text-white font-bold flex items-center justify-center shrink-0">
                            {(authorName || "A")[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-neutral-900">{authorName}</span>
                              {review.verifiedPurchase && (
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                                  <BadgeCheck className="w-3 h-3" /> Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <StarRating rating={review.rating} size="w-3 h-3" />
                              <span>·</span>
                              <span>{date}</span>
                            </div>
                          </div>
                        </div>

                        {title && <div className="font-bold text-neutral-800 mb-1">{title}</div>}
                        {comment && <p className="text-neutral-600 leading-relaxed mb-3">{comment}</p>}

                        <div className="flex items-center gap-3">
                          <button className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[var(--brand-700)] transition">
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Helpful ({review.helpfulCount || 0})
                          </button>
                          <button
                            onClick={() => startEditReview(review)}
                            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[var(--brand-700)] transition"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          {/* Bottom CTA */}
          <div
            className="mt-8 p-8 md:p-12 rounded-3xl text-center text-white
                       bg-gradient-to-br from-[var(--brand-700)] via-[var(--brand-800)] to-[var(--brand-900)]
                       relative overflow-hidden"
          >
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-[var(--accent-mint)]/20 blur-2xl" />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold mb-3 font-['Plus_Jakarta_Sans']">
                Still Have Questions?
              </h3>
              <p className="text-[var(--brand-100)] mb-6 max-w-md mx-auto">
                Expert homeopathic doctors available 24/7 to help you choose the right remedy.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button className="bg-white text-[var(--brand-700)] font-semibold px-7 py-3 rounded-xl hover:bg-[var(--brand-50)] transition flex items-center justify-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  Free Consultation
                </button>
                <button className="bg-white/10 backdrop-blur border border-white/30 text-white font-semibold px-7 py-3 rounded-xl hover:bg-white/20 transition flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Call Now
                </button>
              </div>
            </div>
          </div>
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
