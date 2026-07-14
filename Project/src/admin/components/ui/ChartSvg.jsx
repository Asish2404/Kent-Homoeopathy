import React from "react";

const toPath = (points) => {
  if (!points.length) return "";
  return points.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
};

const normalize = (value, min, max) => {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
};

const ChartSvg = ({ data, height = 220, stroke = "#22c55e", fill = "rgba(34,197,94,0.12)" }) => {
  const values = (data || []).map((d) => d.value ?? d.y ?? d.amount ?? d.orders ?? 0);
  const labels = (data || []).map((d) => d.label ?? d.x ?? "");

  const w = 720;
  const h = height;
  const padding = 36;

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);

  const plotW = w - padding * 2;
  const plotH = h - padding * 2;

  const pts = values.map((v, i) => {
    const t = values.length === 1 ? 0.5 : i / (values.length - 1);
    const x = padding + t * plotW;
    const y = padding + (1 - normalize(v, min, max)) * plotH;
    return { x, y, v, label: labels[i] };
  });

  const path = toPath(pts);
  const areaPath =
    pts.length === 0
      ? ""
      : `${path} L ${padding + plotW} ${padding + plotH} L ${padding} ${padding + plotH} Z`;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[220px] md:h-[240px]">
        <defs>
          <linearGradient id="brandFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
          </linearGradient>
        </defs>

        {/* Grid */}
        {[0, 1, 2, 3].map((i) => {
          const y = padding + (i / 3) * plotH;
          return (
            <line
              key={i}
              x1={padding}
              y1={y}
              x2={padding + plotW}
              y2={y}
              stroke="#e5e7eb"
              strokeDasharray="4 6"
              strokeWidth="1"
              opacity="0.8"
            />
          );
        })}

        {pts.length ? (
          <>
            <path d={areaPath} fill="url(#brandFill)" />
            <path d={path} fill="none" stroke={stroke} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

            {pts.map((p, idx) => (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke={stroke} strokeWidth="3" />
              </g>
            ))}
          </>
        ) : null}
      </svg>
    </div>
  );
};

export default ChartSvg;

