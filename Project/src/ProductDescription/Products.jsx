import { useMemo, useRef, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import {
  Star,
  Heart,
  ShoppingCart,
  Stethoscope,
  Calendar,
  Phone,
  Truck,
  Shield,
  RotateCcw,
  Award,
  ChevronRight,
  Check,
  Plus,
  Minus,
  Share2,
  ThumbsUp,
} from "lucide-react";
import { FaLeaf, FaBolt, FaFire } from "react-icons/fa";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import ProductCard from "../components/ProductCard";
import { vitaminsSupplements, heartCare } from "../data/products";

const Products = () => {
  const location = useLocation();
  const { productId } = useParams();

  const locationProduct = location.state?.product || null;
  void productId;

  const product = useMemo(() => {
    if (!locationProduct) return null;

    const images = Array.isArray(locationProduct.images)
      ? locationProduct.images
      : locationProduct.image
        ? [locationProduct.image]
        : [];

    const longDescription =
      locationProduct.longDescription ||
      locationProduct.description ||
      locationProduct.shortDescription ||
      "";

    // discount% (number). If absent, derive from oldPrice/price.
    let discountPct = 0;
    if (typeof locationProduct.discount === "number") {
      discountPct = locationProduct.discount;
    } else if (typeof locationProduct.discount === "string") {
      const m = locationProduct.discount.match(/(\d+(?:\.\d+)?)%/);
      if (m) discountPct = Number(m[1]);
    } else {
      const oldP = Number(locationProduct.oldPrice);
      const curP = Number(locationProduct.price);
      if (
        Number.isFinite(oldP) &&
        Number.isFinite(curP) &&
        oldP > 0 &&
        oldP > curP
      ) {
        discountPct = Math.round(((oldP - curP) / oldP) * 100);
      }
    }

    const inStockRaw =
      locationProduct.isInStock ??
      locationProduct.inStock ??
      locationProduct.availability === "out" ?
        false :
        locationProduct.availability === "in" ?
          true :
          true;

    return {
      id: locationProduct.id,
      name: locationProduct.name,
      category:
        locationProduct.categoryTitle ||
        locationProduct.category ||
        "Products",
      description:
        locationProduct.description ||
        locationProduct.shortDescription ||
        longDescription,
      longDescription: longDescription,
      rating: Number(locationProduct.rating || 0),
      reviews: Number(
        locationProduct.reviews ||
          locationProduct.reviewCount ||
          0
      ),
      reviewCount: Number(
        locationProduct.reviews ||
          locationProduct.reviewCount ||
          0
      ),
      images:
        images.length > 0 ? images : locationProduct.image ? [locationProduct.image] : [],
      image: locationProduct.image,
      currentPrice: Number(
        locationProduct.price ||
          locationProduct.currentPrice ||
          0
      ),
      originalPrice: Number(
        locationProduct.oldPrice ||
          locationProduct.originalPrice ||
          0
      ),
      discount: discountPct,
      inStock: Boolean(inStockRaw),
      availabilityText: inStockRaw ? "In stock" : "Out of stock",
      deliveryETA: locationProduct.deliveryETA || locationProduct.delivery || "24 hrs",
      deliveryInfo: `Delivery in ${locationProduct.deliveryETA || locationProduct.delivery || "24 hrs"}`,
      potencies: Array.isArray(locationProduct.potencies)
        ? locationProduct.potencies
        : ["30C"],
      sizes: Array.isArray(locationProduct.sizes)
        ? locationProduct.sizes
        : ["30ml"],
      shortDescription:
        locationProduct.shortDescription ||
        locationProduct.description ||
        "",
      badge: locationProduct.badge,
      latinName: locationProduct.latinName || "",
    };
  }, [locationProduct]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedPotency, setSelectedPotency] = useState("30C");
  const [selectedSize, setSelectedSize] = useState("30ml");
  const [activeTab, setActiveTab] = useState("description");
  const [wishlisted, setWishlisted] = useState(false);
  const relatedRef = useRef(null);

  const comboOffers = [
    {
      id: 1,
      name: "Pain Relief Combo",
      medicines: ["Arnica Montana", "Rhus Tox", "Bryonia Alba"],
      image:
        "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=600&auto=format&fit=crop",
      price: 34.99,
      originalPrice: 45.99,
      rating: 4.8,
      discount: "Save ₹11",
    },
    {
      id: 2,
      name: "Immunity Booster",
      medicines: ["Echinacea", "Arsenicum", "Gelsemium"],
      image:
        "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=600&auto=format&fit=crop",
      price: 39.99,
      originalPrice: 52.99,
      rating: 4.7,
      discount: "Save ₹13",
    },
    {
      id: 3,
      name: "Digestive Health",
      medicines: ["Nux Vomica", "Carbo Veg", "Pulsatilla"],
      image:
        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop",
      price: 36.99,
      originalPrice: 48.99,
      rating: 4.6,
      discount: "Save ₹12",
    },
  ];

  const relatedProducts = [
    ...vitaminsSupplements.slice(0, 4),
    ...heartCare.slice(0, 2),
  ].map((p, i) => ({ ...p, id: p.id + i }));

  const reviews = [
    {
      id: 1,
      author: "Dr. Priya Sharma",
      rating: 5,
      date: "Jan 15, 2026",
      comment: "Excellent quality. Highly effective for my patients.",
      isDoctor: true,
      helpful: 42,
    },
    {
      id: 2,
      author: "Rajesh Kumar",
      rating: 5,
      date: "Jan 10, 2026",
      comment: "Great relief from muscle soreness. Will buy again.",
      isDoctor: false,
      helpful: 28,
    },
    {
      id: 3,
      author: "Dr. Meena Patel",
      rating: 4,
      date: "Jan 05, 2026",
      comment: "Good potency and results. Authentic product.",
      isDoctor: true,
      helpful: 19,
    },
  ];

  const ratingBreakdown = [
    { stars: 5, count: 168, pct: 66 },
    { stars: 4, count: 58, pct: 23 },
    { stars: 3, count: 20, pct: 8 },
    { stars: 2, count: 6, pct: 2 },
    { stars: 1, count: 4, pct: 1 },
  ];

  const scrollRelated = (dir) => {
    relatedRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

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
              {product?.name || "Selected Product"}
            </span>
          </nav>
        </div>
      </div>

      {!product ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="bg-white border border-neutral-100 rounded-2xl shadow-sm p-8 text-center">
            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              Product not found
            </h2>
            <p className="text-sm text-neutral-500 mb-4">
              Please go back to the products catalog.
            </p>
            <Link
              to="/Products"
              className="btn-primary inline-flex items-center justify-center py-2.5 px-5"
            >
              Back to Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 md:py-8">
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
              <button className="flex-1 md:flex-none btn-primary py-2.5 text-sm">
                <Stethoscope className="w-4 h-4" />
                Consult Doctor
              </button>
              <button className="flex-1 md:flex-none btn-outline py-2.5 text-sm">
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
                className="relative bg-gradient-to-br from-[var(--brand-50)] to-white
                         border border-neutral-100 rounded-3xl overflow-hidden
                         aspect-square flex items-center justify-center group"
              >
                <img
                  src={product.images?.[selectedImage] || product.image}
                  alt={product.name}
                  className="w-full h-full object-cover
                           transition-transform duration-500 group-hover:scale-105"
                />

                {/* Discount badge */}
                {product.discount > 0 && (
                  <div
                    className="absolute top-4 left-4
                             bg-gradient-to-r from-[var(--brand-600)] to-[var(--brand-700)]
                             text-white px-3 py-1.5 text-sm font-bold rounded-full
                             shadow-lg flex items-center gap-1"
                  >
                    <FaFire className="text-xs" />
                    -{product.discount}% OFF
                  </div>
                )}

                {/* Action buttons */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={() => setWishlisted(!wishlisted)}
                    aria-label="Wishlist"
                    className={`w-10 h-10 rounded-full bg-white shadow-md
                                flex items-center justify-center transition
                                ${
                                  wishlisted
                                    ? "text-red-500"
                                    : "text-neutral-500 hover:text-red-500"
                                }`}
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={wishlisted ? "currentColor" : "none"}
                    />
                  </button>
                  <button
                    aria-label="Share"
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
                                  transition bg-white
                                  ${
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
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full
                             bg-[var(--brand-100)] text-[var(--brand-700)]
                             text-xs font-semibold"
                >
                  <FaLeaf className="text-[10px]" />
                  Homoeopathic
                </span>
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full
                             bg-amber-100 text-amber-700 text-xs font-semibold"
                >
                  <Award className="w-3 h-3" />
                  Top Rated
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-1 tracking-tight">
                {product.name}
              </h1>
              <p className="text-neutral-500 italic mb-4">{product.category}</p>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-neutral-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-neutral-700">
                  {product.rating}
                </span>
                <span className="text-sm text-neutral-500">
                  ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-2 pb-6 border-b border-dashed border-neutral-200">
                <span className="text-4xl font-extrabold text-neutral-900">
                  ₹{product.currentPrice}
                </span>
                {product.originalPrice > 0 && (
                  <span className="text-xl text-neutral-400 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
                {product.originalPrice > 0 && product.originalPrice > product.currentPrice && (
                  <span
                    className="bg-emerald-100 text-emerald-700
                               text-xs font-bold px-2.5 py-1 rounded-full"
                  >
                    Save ₹{(product.originalPrice - product.currentPrice).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-neutral-600 mb-7 leading-relaxed">{product.description}</p>

              {/* Potency */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-neutral-800 mb-3">Potency</label>
                <div className="flex flex-wrap gap-2">
                  {product.potencies.map((potency) => (
                    <button
                      key={potency}
                      onClick={() => setSelectedPotency(potency)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition
                                  ${
                                    selectedPotency === potency
                                      ? "bg-[var(--brand-600)] text-white shadow-md shadow-[var(--brand-600)]/30"
                                      : "bg-white text-neutral-700 border border-neutral-200 hover:border-[var(--brand-300)] hover:text-[var(--brand-700)]"
                                  }`}
                    >
                      {potency}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-neutral-800 mb-3">Pack Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition
                                  ${
                                    selectedSize === size
                                      ? "bg-[var(--brand-600)] text-white shadow-md shadow-[var(--brand-600)]/30"
                                      : "bg-white text-neutral-700 border border-neutral-200 hover:border-[var(--brand-300)] hover:text-[var(--brand-700)]"
                                  }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-7">
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
                <button className="flex-1 btn-primary py-3.5 text-base" disabled={!product.inStock}>
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button className="flex-1 btn-outline py-3.5 text-base" disabled={!product.inStock}>
                  <FaBolt />
                  Buy Now
                </button>
              </div>

              {/* Availability */}
              <div className="mb-4">
                <span
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                    product.inStock
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-rose-50 text-rose-700 border-rose-100"
                  }`}
                >
                  {product.availabilityText}
                </span>
              </div>

              {/* Quick Contact */}
              <div className="p-4 bg-[var(--brand-50)] border border-[var(--brand-100)] rounded-xl flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-800 mb-0.5">Need Expert Advice?</p>
                  <p className="text-xs text-neutral-500">Talk to our homeopathic specialist</p>
                </div>
                <a
                  href="tel:+919876543210"
                  className="flex items-center gap-2 bg-white text-[var(--brand-700)] font-semibold text-sm px-4 py-2 rounded-lg hover:bg-[var(--brand-100)] transition"
                >
                  <Phone className="w-4 h-4" />
                  Call Now
                </a>
              </div>

              {/* Delivery info */}
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
                  <Award className="w-4 h-4 text-[var(--brand-600)]" />
                  COD available
                </div>
              </div>
            </div>
          </div>

          {/* Tabs section */}
          <section className="mb-12 md:mb-16">
            <div className="bg-white border border-neutral-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex overflow-x-auto no-scrollbar border-b border-neutral-100">
                {[
                  { id: "description", label: "Description" },
                  { id: "benefits", label: "Benefits" },
                  { id: "ingredients", label: "Ingredients" },
                  { id: "usage", label: "How to Use" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-6 py-4 text-sm font-semibold whitespace-nowrap transition relative ${
                      activeTab === t.id
                        ? "text-[var(--brand-700)]"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    {t.label}
                    {activeTab === t.id && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--brand-600)] rounded-t-full" />
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6 md:p-8 text-neutral-600 leading-relaxed animate-fade-in">
                {activeTab === "description" && (
                  <div className="space-y-4">
                    <p>{product.longDescription}</p>
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg text-sm text-amber-800">
                      ⚠️ Consult a qualified homeopathic practitioner before use.
                    </div>
                  </div>
                )}

                {activeTab === "benefits" && (
                  <ul className="space-y-3">
                    {(product.benefits || ["Helps with wellness", "Supports recovery"]).map(
                      (b, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-[var(--brand-100)] text-[var(--brand-700)] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-neutral-700">{b}</span>
                        </li>
                      )
                    )}
                  </ul>
                )}

                {activeTab === "ingredients" && (
                  <ul className="space-y-2.5">
                    {(product.ingredients || ["Natural ingredients"]).map((b, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-500)] mt-2.5 shrink-0" />
                        <span className="text-neutral-700">{b}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {activeTab === "usage" && (
                  <ol className="space-y-2.5 list-decimal list-inside marker:text-[var(--brand-600)] marker:font-bold">
                    {(product.usage || ["Follow expert guidance" ]).map((u, i) => (
                      <li key={i} className="text-neutral-700">
                        {u}
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          </section>

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
                    <button className="w-full btn-primary py-2.5">
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

          {/* Reviews */}
          <section className="mb-12 md:mb-16">
            <div className="text-center mb-8">
              <span className="section-eyebrow">Real customers</span>
              <h2 className="section-title mt-3">Customer Reviews</h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-[var(--brand-50)] to-white border border-[var(--brand-100)] rounded-2xl p-6 md:p-8 text-center lg:text-left">
                <div className="text-6xl font-extrabold text-neutral-900 mb-2">{product.rating}</div>
                <div className="flex justify-center lg:justify-start mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-neutral-200"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-neutral-500 mb-6">Based on {product.reviewCount} reviews</p>

                <div className="space-y-2">
                  {ratingBreakdown.map((r) => (
                    <div key={r.stars} className="flex items-center gap-3 text-sm">
                      <span className="w-3 text-neutral-600 font-medium">{r.stars}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${r.pct}%` }} />
                      </div>
                      <span className="w-8 text-right text-neutral-500 text-xs">{r.count}</span>
                    </div>
                  ))}
                </div>

                <button className="btn-primary w-full mt-6 py-2.5 text-sm">Write a Review</button>
              </div>

              <div className="lg:col-span-2 space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white border border-neutral-100 rounded-2xl p-5 md:p-6 hover:shadow-md transition"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--brand-400)] to-[var(--brand-700)] text-white font-bold flex items-center justify-center shrink-0">
                        {review.author[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold text-neutral-900">{review.author}</span>
                          {review.isDoctor && (
                            <span className="text-[10px] font-bold bg-[var(--brand-100)] text-[var(--brand-700)] px-2 py-0.5 rounded-full uppercase tracking-wider">
                              Doctor
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-neutral-200"
                                }`}
                              />
                            ))}
                          </div>
                          <span>·</span>
                          <span>{review.date}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-neutral-600 leading-relaxed mb-3">{review.comment}</p>

                    <button className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[var(--brand-700)] transition">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Helpful ({review.helpful})
                    </button>
                  </div>
                ))}

                <button className="btn-outline w-full py-2.5 mt-2">Load More Reviews</button>
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
    </div>
  );
};

export default Products;

