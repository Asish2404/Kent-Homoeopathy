import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function SearchBox({
  className = "",
  placeholder = "Search...",
  ariaLabel = "Search",
}) {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const doSearch = (v) => {
    const q = String(v || value || "").trim();
    if (!q) return;
    navigate(`/Products?query=${encodeURIComponent(q)}`);
  };

  return (
    <div
      className={className}
      role="search"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        aria-label={`${ariaLabel} submit`}
        onClick={() => doSearch(value)}
        className="h-full w-11 flex items-center justify-center text-neutral-500 hover:text-[var(--brand-700)] transition"
      >
        <FiSearch className="text-base" />
      </button>

      <input
        type="search"
        aria-label={ariaLabel}
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") doSearch(e.currentTarget.value);
        }}
        className="h-full flex-1 outline-none text-neutral-800 text-sm bg-transparent min-w-0 placeholder:text-neutral-400"
      />

      {value?.length > 0 && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => setValue("")}
          className="h-full w-11 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition"
        >
          <span className="text-xl leading-none">×</span>
        </button>
      )}
    </div>
  );
}

