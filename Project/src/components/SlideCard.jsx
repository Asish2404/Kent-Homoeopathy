import React from "react"

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
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Gradient Overlay (optional premium look) */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 h-full flex items-center">

        <div className="max-w-2xl text-white space-y-6">

          <span className="inline-block px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
            Featured
          </span>

          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold leading-tight flex flex-wrap">
            {slide.title}
          </h2>

          <p className="text-base md:text-lg text-gray-200">
            {slide.description}
          </p>

          <div className="flex gap-4 mt-6">
            <button className="bg-yellow-500 text-black px-20 py-3 rounded-xl font-semibold hover:scale-105 transition">
              {slide.buttonText}
            </button>

          </div>

        </div>
      </div>
    </div>
  )
})

export default SlideCard