import React from "react";

export function DeltaPill({ value, suffix = "%", digits = 2 }) {
  if (value === null || value === undefined || isNaN(value)) return <span>—</span>;
  const cls = value > 0 ? "text-green-700" : value < 0 ? "text-red-700" : "text-zinc-600";
  const sign = value > 0 ? "+" : "";
  return (
    <span className={`font-mono-data ${cls}`}>
      {sign}
      {Number(value).toFixed(digits)}
      {suffix}
    </span>
  );
}

export function SectionHeader({ eyebrow, title, right }) {
  return (
    <div className="flex items-end justify-between mb-4 border-b border-zinc-200 pb-3">
      <div>
        {eyebrow && (
          <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-display mb-1">
            {eyebrow}
          </div>
        )}
        <h2 className="font-display font-bold text-xl tracking-tight text-zinc-950">
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}

export function Card({ children, className = "", ...rest }) {
  return (
    <div
      className={`bg-white border border-zinc-200 hover-darken ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}