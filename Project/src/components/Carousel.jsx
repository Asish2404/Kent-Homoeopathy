import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import SlideCard from "./SlideCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Carousel({ slides, autoplayInterval = 4000 }) {
  const [current, setCurrent] = useState(0);
  const [isPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touching, setTouching] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);
  const autoplayRef = useRef(null);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = useCallback((index) => {
    setCurrent(index);
  }, []);

  // autoplay
  useEffect(() => {
    if (!isPlaying || isHovered || touching) return;

    autoplayRef.current = setInterval(() => {
      nextSlide();
    }, autoplayInterval);

    return () => clearInterval(autoplayRef.current);
  }, [isPlaying, isHovered, touching, nextSlide, autoplayInterval]);

  // keyboard support
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [nextSlide, prevSlide]);

  // ------------------------------------------------------------------
  // Touch / swipe handling
  //
  // IMPORTANT: We NEVER block vertical scrolling here. The container uses
  // `touch-pan-y` (`touch-action: pan-y`), so vertical gestures scroll the
  // page natively (like Amazon / Flipkart). Horizontal gestures are detected
  // via JS and used to change slides. No `preventDefault` is called, so the
  // browser is free to handle vertical scrolling naturally.
  // ------------------------------------------------------------------
  const minSwipeDistance = 50;
  const minIntentDistance = 12; // movement required to lock gesture intent

  const onTouchStart = (e) => {
    const t = e.targetTouches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
    touchEndX.current = t.clientX;
    touchEndY.current = t.clientY;
    setTouching(true);
  };

  const onTouchMove = (e) => {
    const t = e.targetTouches[0];
    touchEndX.current = t.clientX;
    touchEndY.current = t.clientY;
  };

  const onTouchEnd = () => {
    const startX = touchStartX.current;
    const startY = touchStartY.current;
    const endX = touchEndX.current;
    const endY = touchEndY.current;

    setTouching(false);

    const dx = endX - startX;
    const dy = endY - startY;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Only treat as a slide swipe when the gesture is predominantly
    // horizontal AND exceeds the minimum distance. Vertical gestures are
    // intentionally ignored so the page can scroll.
    const isHorizontalIntent = absDx > absDy && absDx > minIntentDistance;
    if (!isHorizontalIntent) return;

    if (absDx < minSwipeDistance) return;

    if (dx < 0) nextSlide(); // swipe left
    if (dx > 0) prevSlide(); // swipe right
  };

  const translateValue = useMemo(
    () => `translateX(-${current * 100}%)`,
    [current]
  );

  return (
    <section className="w-full overflow-hidden relative">
      <div
        className="relative touch-pan-y"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-out will-change-transform"
            style={{ transform: translateValue }}
          >
            {slides.map((slide) => (
              <SlideCard key={slide.id} slide={slide} />
            ))}
          </div>
        </div>

        {/* left arrow - moved further out to avoid overlapping hero content */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="hidden md:flex absolute left-12 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full
                     bg-white/95 backdrop-blur shadow-xl
                     items-center justify-center
                     hover:scale-110 hover:bg-[var(--brand-600)] hover:text-white
                     text-neutral-700
                     transition cursor-pointer"
        >
          <ChevronLeft />
        </button>

        {/* right arrow - moved further out to avoid overlapping hero content */}
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="hidden md:flex absolute right-12 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full
                     bg-white/95 backdrop-blur shadow-xl
                     items-center justify-center
                     hover:scale-110 hover:bg-[var(--brand-600)] hover:text-white
                     text-neutral-700
                     transition cursor-pointer"
        >
          <ChevronRight />
        </button>

        {/* controls */}
        <div className="absolute bottom-6 sm:bottom-10 md:bottom-14 left-1/2 -translate-x-1/2 z-20 flex justify-center">
          <div className="flex gap-2 items-center bg-white/90 backdrop-blur rounded-full px-3 py-2 shadow-lg">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`
                  transition-all rounded-full cursor-pointer
                  ${
                    current === index
                      ? "w-8 h-2.5 bg-[var(--brand-600)]"
                      : "w-2.5 h-2.5 bg-neutral-300 hover:bg-[var(--brand-400)]"
                  }
                `}
              />
            ))}
          </div>
        </div>

        <div className="hidden" />
      </div>
    </section>
  );
}
