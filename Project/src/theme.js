/**
 * Centralized theme for Kent Web.
 *
 * All UI colors, radii, shadows, and motion values live here so the brand
 * primary color can be swapped in one place (the user will provide the
 * official green / brand color later).
 *
 * The exported `brand` object is mirrored as CSS custom properties in
 * `index.css` (`--brand-*`) so Tailwind utility classes can use them via
 * `bg-[var(--brand-500)]` etc. and styling stays consistent across files.
 */

export const brand = {
  // Primary green scale — change the values here to re-skin the entire app
  50: "#f0fdf4",
  100: "#dcfce7",
  200: "#bbf7d0",
  300: "#86efac",
  400: "#4ade80",
  500: "#22c55e", // primary
  600: "#16a34a",
  700: "#15803d",
  800: "#166534",
  900: "#14532d",
  950: "#052e16",
};

export const accent = {
  // Lighter green shades used as accents / gradients
  mint: "#a7f3d0",
  sage: "#d1fae5",
  emerald: "#10b981",
  teal: "#14b8a6",
};

export const neutral = {
  white: "#ffffff",
  50: "#f8fafc",
  100: "#f1f5f9",
  200: "#e2e8f0",
  300: "#cbd5e1",
  400: "#94a3b8",
  500: "#64748b",
  600: "#475569",
  700: "#334155",
  800: "#1e293b",
  900: "#0f172a",
  950: "#020617",
};

export const radius = {
  sm: "0.5rem",
  md: "0.75rem",
  lg: "1rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  full: "9999px",
};

export const shadow = {
  sm: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
  md: "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.06)",
  lg: "0 10px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.08)",
  xl: "0 20px 40px -10px rgba(15, 23, 42, 0.15)",
  brand: "0 10px 30px -10px rgba(22, 163, 74, 0.45)",
  "brand-lg": "0 20px 45px -12px rgba(22, 163, 74, 0.55)",
};

export const motion = {
  fast: "150ms",
  base: "250ms",
  slow: "400ms",
  ease: "cubic-bezier(0.4, 0, 0.2, 1)",
};

export default { brand, accent, neutral, radius, shadow, motion };
