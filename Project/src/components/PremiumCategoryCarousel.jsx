import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const PremiumCategoryCarousel = ({ categories, onViewAll }) => {
  const navigate = useNavigate();
  const trackRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);

  useEffect(() => {
    const updateVisibleCount = () => {
      const width = window.innerWidth;
      if (width >= 1536) setVisibleCount(7);
      else if (width >= 1280) setVisibleCount(6);
      else if (width >= 768) setVisibleCount(4);
      else setVisibleCount(2.5);
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const cardWidth = useMemo(() => `${100 / visibleCount}%`, [visibleCount]);

  const scrollByAmount = (direction) => {
    const node = trackRef.current;
    if (!node) return;

    const step = Math.max(Math.round(node.clientWidth / visibleCount), 220);
    node.scrollBy({ left: direction === "next" ? step : -step, behavior: "smooth" });
  };

  const handleTouchStart = (event) => {
    const touch = event.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX === null || touchStartY === null) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 24) {
      scrollByAmount(deltaX < 0 ? "next" : "prev");
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  return (
    <section className="py-4 sm:py-5">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <span className="section-eyebrow">Browse</span>
            <h2 className="section-title mt-1.5">
              Shop by <span className="brand-gradient-text">Category</span>
            </h2>
          </div>

          <button
            type="button"
            onClick={onViewAll ?? (() => navigate("/Products"))}
            className="btn-outline group hidden shrink-0 sm:inline-flex"
          >
            View All
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="relative">
          <div className="absolute right-0 top-1/2 z-10 hidden -translate-y-1/2 gap-2 md:flex">
            <button
              type="button"
              onClick={() => scrollByAmount("prev")}
              aria-label="Show previous categories"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--brand-600)] hover:text-white"
            >
              <FiChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount("next")}
              aria-label="Show next categories"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white/95 text-neutral-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--brand-600)] hover:text-white"
            >
              <FiChevronRight size={18} />
            </button>
          </div>

          <div
            ref={trackRef}
            className="overflow-x-auto pb-2 pl-0.5 pr-0.5 scroll-smooth no-scrollbar touch-pan-y md:pr-16"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex gap-3 sm:gap-4">
              {categories.map((category) => {
                const countText = category.productCount > 0 ? `${category.productCount} Products` : "Explore";
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => navigate(`/Products?category=${category.slug}`)}
                    className="group flex min-h-[200px] flex-col items-center justify-center rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-3 py-4 text-center shadow-[0_8px_24px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(22,163,74,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)]/40"
                    style={{ flex: `0 0 ${cardWidth}` }}
                    aria-label={`Shop ${category.name}`}
                  >
                    <div className="mb-3 flex h-24 w-full items-center justify-center rounded-[20px] bg-white/80 p-3 shadow-inner ring-1 ring-emerald-100/80 sm:h-24">
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-110"
                      />
                    </div>
                    <p className="w-full truncate text-[0.96rem] font-semibold leading-5 text-neutral-900">
                      {category.name}
                    </p>
                    <p className="mt-1 text-[0.8rem] font-medium text-neutral-500">
                      {countText}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3 flex justify-center sm:hidden">
          <button
            type="button"
            onClick={onViewAll ?? (() => navigate("/Products"))}
            className="btn-outline group"
          >
            View All
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default PremiumCategoryCarousel;
