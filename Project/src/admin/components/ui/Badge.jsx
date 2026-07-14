import React from "react";

const variants = {
  neutral: "bg-neutral-50 text-neutral-700 border-neutral-200",
  brand: "bg-brand-50 text-brand-700 border-brand-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const Badge = ({ variant = "neutral", children, className = "" }) => {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border",
        variants[variant] || variants.neutral,
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
};

export default Badge;

