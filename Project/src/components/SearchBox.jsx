import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function SearchBox({ className = "", placeholder = "Search...", ariaLabel = "Search" }) {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const doSearch = (v) => {
    const q = String(v || value || "").trim();
    if (!q) return;
    navigate(`/Products?query=${encodeURIComponent(q)}`);
  };

  return (
    <div className={className}>
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={() => doSearch(value)}
        className="p-2 text-neutral-500"
      >
        <FiSearch />
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
        className="outline-none text-neutral-800 text-sm w-full bg-transparent"
      />
    </div>
  );
}
