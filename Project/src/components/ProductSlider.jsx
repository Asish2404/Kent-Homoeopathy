import { useRef } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { FiArrowRight } from "react-icons/fi";
import ProductCard from "./ProductCard";

/**
 * Reusable horizontally scrollable product section.
 * Mirrors the existing Featured Products slider (arrows + View All)
 * so every category section looks consistent.
 *
 * Props:
 *  - title, subtitle
 *  - products: array
 *  - onViewAll (optional)
 *  - bgClass: tailwind class for section background
 */
const ProductSlider = ({
  title,
  subtitle,
  products = [],
  onViewAll,
  bgClass = "bg-white",
  viewAllLabel = "View All",
}) => {
  const sliderRef = useRef(null);

  const scrollBy = (offset) => {
    sliderRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  };

return (
    <section className={`py-16 md:py-20 ${bgClass} overflow-hidden`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-6 mb-8 md:mb-10">
          <div>
            <span className="section-eyebrow">{subtitle || "Curated for you"}</span>
            <h2 className="section-title mt-3">{title}</h2>
          </div>

          {/* Desktop arrows */}
          <div className="hidden md:flex gap-2 shrink-0">
            <button
              onClick={() => scrollBy(-420)}
              aria-label="Scroll left"
              className="w-12 h-12 rounded-full bg-white shadow-md border border-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] hover:border-[var(--brand-200)] transition"
            >
              <HiOutlineChevronLeft className="text-2xl" />
            </button>
            <button
              onClick={() => scrollBy(420)}
              aria-label="Scroll right"
              className="w-12 h-12 rounded-full bg-white shadow-md border border-neutral-100 flex items-center justify-center text-neutral-700 hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] hover:border-[var(--brand-200)] transition"
            >
              <HiOutlineChevronRight className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Slider */}
        <div className="relative">
          <div
            ref={sliderRef}
            className="flex gap-5 overflow-x-auto scroll-smooth no-scrollbar pb-4 pl-2 pr-2"
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {/* View All */}
        {onViewAll && (
          <div className="flex justify-center mt-10">
            <button
              onClick={onViewAll}
              className="btn-outline group"
            >
              {viewAllLabel}
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        )}

        {/* Mobile arrows */}
        <div className="md:hidden flex justify-center gap-3 mt-6">
          <button
            onClick={() => scrollBy(-300)}
            aria-label="Scroll left"
            className="w-11 h-11 rounded-full bg-white shadow-md border border-neutral-100 flex items-center justify-center"
          >
            <HiOutlineChevronLeft className="text-xl" />
          </button>
          <button
            onClick={() => scrollBy(300)}
            aria-label="Scroll right"
            className="w-11 h-11 rounded-full bg-white shadow-md border border-neutral-100 flex items-center justify-center"
          >
            <HiOutlineChevronRight className="text-xl" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductSlider;
