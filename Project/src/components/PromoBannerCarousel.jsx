import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "../services/api";
import { promoBanners as fallbackBanners } from "../data/homepage";

/**
 * Auto-rotating promotional banner carousel with CTA button.
 *
 * Data-driven: prefers GET /api/banners (Mongo, active & in-date-range),
 * falls back to static config from data/homepage.js so the section is never empty.
 *
 * Accessibility: real <button> arrows with aria-labels, dot nav, keyboard support.
 */
const PromoBannerCarousel = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState(fallbackBanners);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const autoplayRef = useRef(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get("/banners");
        const list = res.data?.banners || res.data?.data?.banners || [];
        if (active && Array.isArray(list) && list.length > 0) {
          setBanners(
            list.map((b, i) => ({
              id: b._id || b.id || i,
              title: b.bannerTitle || b.title || "",
              subtitle: b.subtitle || b.description || "",
              ctaText: b.buttonText || b.cta_text || "Shop Now",
              ctaLink: b.buttonUrl || b.cta_link || "/Products",
              image: b.desktopImageUrl || b.image_url || fallbackBanners[i % fallbackBanners.length]?.image || "",
              alt: b.altText || b.title || "Promotional banner",
            }))
          );
        }
      } catch {
        // fallback config already set
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const total = banners.length;
  const next = useCallback(
    () => setCurrent((prev) => (prev + 1) % total),
    [total]
  );
  const prev = useCallback(
    () => setCurrent((prev) => (prev - 1 + total) % total),
    [total]
  );

  useEffect(() => {
    if (loading || paused || total <= 1) return;
    autoplayRef.current = setInterval(next, 4500);
    return () => clearInterval(autoplayRef.current);
  }, [loading, paused, total, next]);

  if (!total) return null;

  return (
    <section className="px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1600px] mx-auto">
        <div
          className="relative overflow-hidden rounded-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {banners.map((b) => (
              <div
                key={b.id}
                className="group min-w-full relative flex items-center justify-center
                           h-44 sm:h-56 lg:h-64 overflow-hidden
                           bg-gradient-to-br from-[var(--brand-600)] via-[var(--brand-700)] to-[var(--brand-900)]"
              >
                {b.image && (
                  <img
                    src={b.image}
                    alt={b.alt}
                    className="absolute inset-0 w-full h-full object-cover opacity-25"
                  />
                )}
                <div className="relative z-10 text-center px-6">
                  <h2 className="text-white text-xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
                    {b.title}
                  </h2>
                  {b.subtitle && (
                    <p className="text-[var(--brand-100)] text-sm sm:text-base mb-4 max-w-xl mx-auto">
                      {b.subtitle}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => b.ctaLink && navigate(b.ctaLink)}
                    className="bg-white text-[var(--brand-700)] font-semibold
                               px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl
                               hover:bg-[var(--brand-50)] hover:shadow-xl transition
                               text-sm sm:text-base"
                  >
                    {b.ctaText}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Arrows */}
          <button
            type="button"
            onClick={prev}
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full
                       bg-white/90 backdrop-blur shadow-md flex items-center justify-center
                       text-neutral-700 hover:bg-[var(--brand-600)] hover:text-white transition"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next banner"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full
                       bg-white/90 backdrop-blur shadow-md flex items-center justify-center
                       text-neutral-700 hover:bg-[var(--brand-600)] hover:text-white transition"
          >
            <ChevronRight />
          </button>

          {/* Dots */}
          {total > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {banners.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to banner ${i + 1}`}
                  className={`transition-all rounded-full ${
                    current === i
                      ? "w-6 h-2 bg-white"
                      : "w-2 h-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PromoBannerCarousel;
