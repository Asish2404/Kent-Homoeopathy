import React from "react";
import { useNavigate } from "react-router-dom";

const CTA_ROUTES = {
  "Consult Doctor": "/Consult",
  "Find a Specialist": "/Consult",
  "Products": "/Products",
  "Explore Products": "/Products",
  "Shop Now": "/Products",
  "View Categories": "/Products",
  "Order Medicines": "/Products",
  "Discover Wellness": "/Products",
  "See Wellness Packs": "/Products",
  "Lab Test": "/Labtest",
  "Book Lab Test": "/Labtest",
  "Book Lab Tests": "/Labtest",
  "Book Test": "/Labtest",
  "Consult Now": "/Consult",
};

const SlideCard = React.memo(({ slide }) => {
  const navigate = useNavigate();
  const placeholderImg =
    "https://images.unsplash.com/photo-1580281658628-93a3e2c21cbf?q=80&w=2000&auto=format&fit=crop";

  const [imgSrc, setImgSrc] = React.useState(slide.image || placeholderImg);

  React.useEffect(() => {
    setImgSrc(slide.image || placeholderImg);
  }, [slide.image]);

  const goToCta = (label) => {
    const route = CTA_ROUTES[label];
    if (route) navigate(route);
  };

  return (
<div className="relative w-full h-[68vh] min-h-[380px] md:h-[90vh] shrink-0 bg-white">
      {/* Background Image */}
      <img
        src={imgSrc}
        alt={slide.title}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setImgSrc(placeholderImg)}
        className="absolute inset-0 w-full h-full object-cover object-center"
      />

      {/* Premium readable overlays (green/dark, subtle) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[rgba(20,83,45,0.75)] via-[rgba(4,120,87,0.35)] to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
      {/* Extra dark for left text area only */}
      <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_20%_40%,rgba(20,83,45,0.45),transparent_55%)]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-7 md:px-12 h-full flex items-center">
          <div className="max-w-2xl text-white space-y-4 sm:space-y-6 animate-fade-up">
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full
                       bg-[var(--brand-500)]/20 backdrop-blur
                       text-[var(--brand-100)] text-xs sm:text-sm font-semibold
                       border border-[rgba(134,239,172,0.28)]"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-300)] animate-pulse" />
            Healthcare • Wellness
          </span>

          <h2
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05]
                       tracking-tight font-['Plus_Jakarta_Sans']"
          >
            {slide.title}
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-neutral-100/95 max-w-xl leading-relaxed">
            {slide.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
            <button
              className="btn-primary text-base px-6 sm:px-7 py-3.5"
              type="button"
              onClick={() => goToCta(slide.primaryCta || slide.buttonText)}
            >
              {slide.primaryCta || slide.buttonText}
            </button>

            {slide.secondaryCta ? (
              <button
                className="btn-outline border-white/30 text-white bg-white/10 backdrop-blur hover:bg-white/20 hover:border-white/50"
                type="button"
                onClick={() => goToCta(slide.secondaryCta)}
              >
                {slide.secondaryCta}
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Decorative bottom curve */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/90 to-transparent" />
    </div>
  );
});

export default SlideCard;

