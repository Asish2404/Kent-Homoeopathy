import { useEffect, useMemo, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { universalSearch } from "../services/checkout.service";

const RESULT_LIMIT = 5;

const highlightText = (text, query) => {
  const value = String(text || "");
  const q = String(query || "").trim();
  if (!q) return value;
  const idx = value.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return value;
  return (
    <>
      {value.slice(0, idx)}
      <span className="bg-[var(--brand-100)] text-[var(--brand-800)] rounded px-0.5">{value.slice(idx, idx + q.length)}</span>
      {value.slice(idx + q.length)}
    </>
  );
};

const getEntityTarget = (group, item) => {
  if (group === "products") return `/Products?query=${encodeURIComponent(item.product_name || "")}`;
  if (group === "doctors") return `/Consult?query=${encodeURIComponent(item.fullName || "")}`;
  if (group === "categories") return `/Products?category=${encodeURIComponent(item.category_name || "")}`;
  if (group === "labTests") return `/Labtest?query=${encodeURIComponent(item.test_name || "")}`;
  if (group === "faqs") return `/Contact?faq=${encodeURIComponent(item.question || "")}`;
  return "/Products";
};

export default function SearchBox({
  className = "",
  placeholder = "Search...",
  ariaLabel = "Search",
  onSearch,
}) {
  const [value, setValue] = useState("");
  const [results, setResults] = useState({ products: [], doctors: [], categories: [], labTests: [], faqs: [] });
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef(null);
  const rootRef = useRef(null);

  const doSearch = (v) => {
    const q = String(v || value || "").trim();
    if (!q) return;
    if (onSearch) onSearch(q);
    else navigate(`/Products?query=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  const flatResults = useMemo(() => {
    const groups = ["products", "doctors", "categories", "labTests", "faqs"];
    return groups.flatMap((group) => (results[group] || []).slice(0, RESULT_LIMIT).map((item) => ({ group, item })));
  }, [results]);

  useEffect(() => {
    const q = value.trim();
    setActiveIndex(-1);

    if (!q) {
      setResults({ products: [], doctors: [], categories: [], labTests: [], faqs: [] });
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const data = await universalSearch(q);
        setResults({
          products: data.products || [],
          doctors: data.doctors || [],
          categories: data.categories || [],
          labTests: data.labTests || [],
          faqs: data.faqs || [],
        });
      } catch {
        setResults({ products: [], doctors: [], categories: [], labTests: [], faqs: [] });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timerRef.current);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <div className={className} role="search" aria-label={ariaLabel}>
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
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setValue(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (activeIndex >= 0 && flatResults[activeIndex]) {
              const picked = flatResults[activeIndex];
              navigate(getEntityTarget(picked.group, picked.item));
              setOpen(false);
              return;
            }
            doSearch(e.currentTarget.value);
            return;
          }

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActiveIndex((prev) => Math.min(flatResults.length - 1, prev + 1));
          }

          if (e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            setActiveIndex((prev) => Math.max(0, prev - 1));
          }
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

      {open && value.trim() ? (
        <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-neutral-200 bg-white shadow-2xl z-50 overflow-hidden">
          <div className="max-h-[380px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-4 text-sm text-neutral-500">Searching…</div>
            ) : flatResults.length === 0 ? (
              <div className="px-4 py-4 text-sm text-neutral-500">No results found.</div>
            ) : (
              flatResults.map((entry, index) => {
                const { group, item } = entry;
                const label =
                  group === "products"
                    ? item.product_name
                    : group === "doctors"
                      ? item.fullName
                      : group === "categories"
                        ? item.category_name
                        : group === "labTests"
                          ? item.test_name
                          : item.question;

                const meta =
                  group === "products"
                    ? item.brand
                    : group === "doctors"
                      ? item.specialization
                      : group === "categories"
                        ? "Category"
                        : group === "labTests"
                          ? `₹${item.price ?? 0}`
                          : item.category;

                return (
                  <button
                    key={`${group}-${item._id}`}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      navigate(getEntityTarget(group, item));
                      setOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-neutral-100 last:border-b-0 transition ${index === activeIndex ? "bg-[var(--brand-50)]" : "bg-white hover:bg-neutral-50"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-neutral-900 truncate">{highlightText(label, value)}</div>
                        <div className="text-xs text-neutral-500 truncate">{meta}</div>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">{group}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

