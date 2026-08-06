import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

/**
 * Horizontally scrollable row of brand logos in light rounded cards.
 * Clicking routes to the full product listing (no brand-filtered page exists yet).
 */
const BrandLogoStrip = ({ brands = [] }) => {
  const sliderRef = useRef(null);
  const navigate = useNavigate();

  if (!brands?.length) return null;

  const scrollBy = (offset) => {
    sliderRef.current?.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={sliderRef}
        className="flex gap-3 overflow-x-auto scroll-smooth no-scrollbar pb-2"
      >
        {brands.map((b) => (
          <button
            key={b.slug}
            type="button"
            onClick={() => navigate("/Products")}
            className="group shrink-0 w-[120px] sm:w-[150px] h-[76px] sm:h-[88px]
                       bg-white rounded-2xl border border-neutral-100
                       shadow-sm hover:shadow-md hover:border-[var(--brand-200)]
                       flex items-center justify-center p-3
                       transition cursor-pointer"
            aria-label={b.name}
          >
            <div className="flex flex-col items-center gap-1.5">
              <img
                src={b.logo}
                alt={b.name}
                loading="lazy"
                className="w-8 h-8 sm:w-10 sm:h-10 object-contain opacity-80 group-hover:opacity-100 transition"
              />
              <span className="text-[11px] sm:text-xs font-semibold text-neutral-600 group-hover:text-[var(--brand-700)] transition">
                {b.name}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Arrows (desktop) */}
      <button
        type="button"
        onClick={() => scrollBy(-320)}
        aria-label="Scroll brands left"
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full
                   bg-white shadow-md border border-neutral-100 items-center justify-center
                   text-neutral-700 hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] transition"
      >
        <HiOutlineChevronLeft className="text-xl" />
      </button>
      <button
        type="button"
        onClick={() => scrollBy(320)}
        aria-label="Scroll brands right"
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full
                   bg-white shadow-md border border-neutral-100 items-center justify-center
                   text-neutral-700 hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] transition"
      >
        <HiOutlineChevronRight className="text-xl" />
      </button>
    </div>
  );
};

export default BrandLogoStrip;
