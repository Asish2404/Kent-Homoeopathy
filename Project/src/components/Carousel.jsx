import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import SlideCard from "./SlideCard";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from "lucide-react";

export default function Carousel({ slides, autoplayInterval = 4000 }) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [touching, setTouching] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
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

  // swipe logic
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouching(true);
    touchEndX.current = 0;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) {
      setTouching(false);
      return;
    }

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) nextSlide();
    if (isRightSwipe) prevSlide();

    setTouching(false);
  };

  const translateValue = useMemo(
    () => `translateX(-${current * 100}%)`,
    [current]
  );

  return (
    <section className="w-full rounded-2xl overflow-hidden relative">
      <div
        className="relative"
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

        {/* left arrow */}
        <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white shadow-xl items-center justify-center hover:scale-110 transition cursor-pointer"
        >
        <ChevronLeft />
        </button>

        {/* right arrow */}
        <button
        onClick={nextSlide}
        aria-label="Next Slide"
        className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white shadow-xl items-center justify-center hover:scale-110 transition cursor-pointer"
        >
        <ChevronRight />
        </button>

        {/* controls */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 items-center">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
            className="rounded-2xl px-5 py-3 bg-black text-white flex items-center gap-2 shadow-lg cursor-pointer hover:scale-105 transition"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            {isPlaying ? "Pause" : "Play"}
          </button>

          <div className="flex gap-3 items-center">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`
                  transition-all rounded-full cursor-pointer
                  ${
                    current === index
                      ? "w-10 h-3 bg-black"
                      : "w-3 h-3 bg-slate-300 hover:bg-slate-400"
                  }
                `}
              />
            ))}
          </div>
        </div>

        {/* mobile arrows */}
        <div className="md:hidden mt-6 flex justify-center gap-4">
          <button
            onClick={prevSlide}
            aria-label="Previous"
            className="p-4 rounded-2xl bg-white shadow-lg cursor-pointer"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next"
            className="p-4 rounded-2xl bg-white shadow-lg cursor-pointer"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}