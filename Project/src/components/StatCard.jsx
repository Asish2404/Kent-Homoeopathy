import { useEffect, useRef, useState } from "react";

/**
 * Premium animated stat card with counting effect.
 *
 * Props:
 *  - icon: ReactNode
 *  - value: number (target value)
 *  - suffix: string (e.g. "+", "%")
 *  - label: string
 *  - accent: "brand" | "emerald" | "teal"  (subtle background tone)
 */
const StatCard = ({ icon, value, suffix = "+", label, accent = "brand" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const duration = 1800;
            const start = performance.now();
            const animate = (now) => {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              // ease-out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              setCount(Math.floor(eased * value));
              if (progress < 1) requestAnimationFrame(animate);
              else setCount(value);
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.3 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);

  const tones = {
    brand: "from-[var(--brand-50)] to-white text-[var(--brand-700)]",
    emerald: "from-emerald-50 to-white text-emerald-700",
    teal: "from-teal-50 to-white text-teal-700",
  };

  return (
    <div
      ref={ref}
      className={`
        relative overflow-hidden
        bg-gradient-to-br ${tones[accent] || tones.brand}
        border border-neutral-100
        rounded-2xl p-6 md:p-8
        shadow-sm hover:shadow-xl
        card-lift
        group
      `}
    >
      {/* Decorative blob */}
      <div
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full
                   bg-[var(--brand-100)] opacity-50
                   group-hover:scale-125 transition-transform duration-700"
      />

      {/* Icon */}
      <div
        className="relative w-14 h-14 rounded-2xl bg-white shadow-md
                   flex items-center justify-center
                   text-2xl mb-5
                   group-hover:rotate-6 transition"
        style={{ color: "var(--brand-700)" }}
      >
        {icon}
      </div>

      {/* Number */}
      <div className="relative">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl md:text-5xl font-extrabold text-neutral-900 tabular-nums tracking-tight">
            {count.toLocaleString()}
          </span>
          <span className="text-2xl md:text-3xl font-bold text-[var(--brand-600)]">
            {suffix}
          </span>
        </div>
        <p className="text-neutral-500 font-medium mt-2 text-sm md:text-base">
          {label}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
