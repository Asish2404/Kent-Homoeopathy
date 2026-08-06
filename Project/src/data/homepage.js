/**
 * Homepage content data layer.
 *
 * Central source of truth for non-product homepage sections, mirroring the
 * existing `data/products.js` convention. Each section is a simple config
 * array so it can later be swapped for a Mongo collection/route without
 * changing the UI components.
 *
 * Consumed by: Home.jsx (+ its sub-components).
 */

import rawCategories from "./categories.json";

/* ============================================================
   Categories (image tiles)
   Uses the existing categories.json (image, name, slug, sortOrder).
   ============================================================ */
export const categories = [...rawCategories]
  .filter((c) => c.isActive !== false)
  .sort((a, b) => (a.sortOrder ?? 99) - (b.sortOrder ?? 99))
  .map((c) => ({
    id: c.id,
    name: c.category_name,
    slug: c.slug,
    image: c.image,
    tagline: c.tagline || "",
    productCount: c.productCount || 0,
  }));

/* ============================================================
   Health Concerns ("Shop by Concern")
   Mapped to existing product categories/tags (verified clean 1:1).
   Routes to /Products?category=:slug
   ============================================================ */
export const healthConcerns = [
  {
    name: "Hair Fall",
    slug: "hair-care",
    image: "/images/categories/hair-care.svg",
    gradient: "from-teal-600/80 to-emerald-900/90",
  },
  {
    name: "Anxiety & Depression",
    slug: "stress-sleep",
    image: "/images/categories/stress-sleep.svg",
    gradient: "from-indigo-600/80 to-slate-900/90",
  },
  {
    name: "Joint & Muscle Pain",
    slug: "joint-muscle-pain",
    image: "/images/categories/joint-muscle-pain.svg",
    gradient: "from-orange-600/80 to-red-900/90",
  },
  {
    name: "Diabetes Care",
    slug: "diabetes-care",
    image: "/images/categories/diabetes-care.svg",
    gradient: "from-sky-600/80 to-blue-900/90",
  },
  {
    name: "Digestive Health",
    slug: "digestive-care",
    image: "/images/categories/digestive-care.svg",
    gradient: "from-emerald-600/80 to-green-900/90",
  },
  {
    name: "Skin Problems",
    slug: "skin-care",
    image: "/images/categories/skin-care.svg",
    gradient: "from-rose-600/80 to-pink-900/90",
  },
  {
    name: "Immunity Booster",
    slug: "immunity",
    image: "/images/categories/immunity.svg",
    gradient: "from-lime-600/80 to-green-900/90",
  },
  {
    name: "Cold & Cough",
    slug: "cold-cough",
    image: "/images/categories/cold-cough.svg",
    gradient: "from-cyan-600/80 to-teal-900/90",
  },
];

/* ============================================================
   Top Brands (horizontal logo strip)
   Only "Dr. Kent" exists in product data; curated homeopathy brands
   route to the full product listing (no brand-filtered page exists
   for them yet). Clicking a tile navigates to /Products.
   ============================================================ */
export const brands = [
  { name: "Dr. Kent", slug: "dr-kent", logo: "/images/categories/general-wellness.svg" },
  { name: "SBL", slug: "sbl", logo: "/images/categories/digestive-care.svg" },
  { name: "Schwabe", slug: "schwabe", logo: "/images/categories/immunity.svg" },
  { name: "Boiron", slug: "boiron", logo: "/images/categories/allergy.svg" },
  { name: "Reckeweg", slug: "reckeweg", logo: "/images/categories/heart-care.svg" },
  { name: "Allen", slug: "allen", logo: "/images/categories/skin-care.svg" },
];

/* ============================================================
   Quick-Access Service Strip
   Only wired to real routes that exist in App.jsx.
   ============================================================ */
export const homeServices = [
  {
    iconKey: "stethoscope",
    label: "Consult Doctor",
    route: "/Consult",
  },
  {
    iconKey: "calendar",
    label: "Book Appointment",
    route: "/Consult",
  },
  {
    iconKey: "flask",
    label: "Book Lab Test",
    route: "/Labtest",
  },
  {
    iconKey: "pills",
    label: "Order Medicine",
    route: "/Products",
  },
  {
    iconKey: "headset",
    label: "Contact Us",
    route: "/Contact",
  },
];

/* ============================================================
   Promo Banners (fallback config)
   The PromoBannerCarousel prefers GET /api/banners (Mongo). If that
   returns nothing/errors, it falls back to these static banners so the
   home page is never empty.
   ============================================================ */
export const promoBanners = [
  {
    id: "fallback-1",
    title: "Free Consultation",
    subtitle: "Talk to a certified homeopathy doctor today",
    ctaText: "Consult Now",
    ctaLink: "/Consult",
    image: "/images/products/belladonna-30c.svg",
    alt: "Free homeopathy consultation",
  },
  {
    id: "fallback-2",
    title: "Genuine Medicines",
    subtitle: "100% authentic homeopathic remedies, fast delivery",
    ctaText: "Shop Now",
    ctaLink: "/Products",
    image: "/images/products/arsenic-album-30c.svg",
    alt: "Genuine homeopathic medicines",
  },
  {
    id: "fallback-3",
    title: "Book Lab Tests",
    subtitle: "Accurate tests at your doorstep",
    ctaText: "Book Now",
    ctaLink: "/Labtest",
    image: "/images/products/calendula-ointment.svg",
    alt: "Book home lab tests",
  },
];

export default { categories, healthConcerns, brands, homeServices, promoBanners };
