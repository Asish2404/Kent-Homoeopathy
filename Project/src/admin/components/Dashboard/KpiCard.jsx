import React from "react";
import Card from "../ui/Card";

const KpiCard = ({ label, value, sublabel, variant = "brand" }) => {
  const colorClass =
    variant === "brand"
      ? "text-brand-700"
      : variant === "neutral"
        ? "text-neutral-800"
        : variant === "warning"
          ? "text-amber-700"
          : "text-emerald-700";

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-bold text-neutral-500">{label}</div>
          <div className={["mt-2 text-2xl font-extrabold", colorClass].join(" ")}>
            {value}
          </div>
          {sublabel ? (
            <div className="mt-1 text-sm text-neutral-500">{sublabel}</div>
          ) : null}
        </div>
        <div className="w-12 h-12 rounded-3xl bg-brand-50 border border-brand-200 grid place-items-center">
          <div className="text-brand-700 font-extrabold">+</div>
        </div>
      </div>
    </Card>
  );
};

export default KpiCard;

