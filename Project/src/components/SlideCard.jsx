import React from "react";

const SlideCard = React.memo(({ slide }) => {
  return (
    <div className="relative w-full h-[80vh] md:h-[90vh] shrink-0">
      {/* Background Image */}
      <img
        src={slide.image}
        alt={slide.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Brand-tinted gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--brand-900)]/30 via-transparent to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 h-full flex items-center">
        <div className="max-w-2xl text-white space-y-6 animate-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
                           bg-[var(--brand-500)]/20 backdrop-blur
                           text-[var(--brand-300)] text-sm font-semibold
                           border border-[var(--brand-400)]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-400)] animate-pulse" />
            Featured
          </span>

          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight
                         tracking-tight flex flex-wrap
                         font-['Plus_Jakarta_Sans']">
            {slide.title}
          </h2>

          <p className="text-base md:text-lg text-neutral-200 max-w-xl leading-relaxed">
            {slide.description}
          </p>

          <div className="flex gap-4 mt-6">
            <button className="btn-primary text-base px-8 py-3.5">
              {slide.buttonText}
            </button>

            <button className="btn-outline border-white/30 text-white bg-white/10 backdrop-blur hover:bg-white/20 hover:border-white/50">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Decorative bottom curve */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </div>
  );
});

export default SlideCard;
