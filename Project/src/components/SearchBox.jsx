import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiSearch, FiLoader, FiChevronRight } from "react-icons/fi";
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

const SECTION_LABELS = {
  products: "Products",
  doctors: "Doctors",
  categories: "Categories",
  labTests: "Lab Tests",
  faqs: "FAQs",
};

const getEntityTarget = (group, item) => {
  if (group === "products") return `/products/${item._id}`;
  if (group === "doctors") return `/Consult?doctor=${item._id}`;
  if (group === "categories") return `/Products?category=${encodeURIComponent(item.category_name || "")}`;
  if (group === "labTests") return `/Labtest?test=${item._id}`;
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
  const abortRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const liveRef = useRef(null);

  const doSearch = (v) => {
    const q = String(v || value || "").trim();
    if (!q) return;
    if (onSearch) onSearch(q);
    else navigate(`/Products?query=${encodeURIComponent(q)}`);
    setOpen(false);
  };

  const hasAnyResults = useMemo(() => {
    return Object.values(results).some((arr) => arr.length > 0);
  }, [results]);

  // Build grouped flat list with section headers
  const groupedResults = useMemo(() => {
    const groups = ["products", "doctors", "categories", "labTests", "faqs"];
    const flat = [];
    groups.forEach((group) => {
      const items = results[group] || [];
      const limited = items.slice(0, RESULT_LIMIT);
      if (limited.length > 0) {
        flat.push({ group, item: null, isHeader: true });
        limited.forEach((item) => {
          flat.push({ group, item, isHeader: false });
        });
      }
    });
    return flat;
  }, [results]);

  const performSearch = useCallback(async (q) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const data = await universalSearch(q);
      if (!controller.signal.aborted) {
        setResults({
          products: data.products || [],
          doctors: data.doctors || [],
          categories: data.categories || [],
          labTests: data.labTests || [],
          faqs: data.faqs || [],
        });
      }
    } catch {
      if (!controller.signal.aborted) {
        setResults({ products: [], doctors: [], categories: [], labTests: [], faqs: [] });
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const q = value.trim();
    setActiveIndex(-1);

    if (!q) {
      setResults({ products: [], doctors: [], categories: [], labTests: [], faqs: [] });
      setLoading(false);
      return undefined;
    }

    // Cancel any pending requests
    if (abortRef.current) {
      abortRef.current.abort();
    }

    setLoading(true);
    timerRef.current = setTimeout(() => {
      performSearch(q);
    }, 300);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [value, performSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-result-index]");
      if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(-1);
  }, [results]);

  // Announce result count for screen readers
  useEffect(() => {
    if (liveRef.current) {
      const total = groupedResults.filter((r) => !r.isHeader).length;
      if (total > 0) {
        liveRef.current.textContent = `${total} search results found. Use arrow keys to navigate.`;
      } else if (value.trim() && !loading) {
        liveRef.current.textContent = "No search results found.";
      } else {
        liveRef.current.textContent = "";
      }
    }
  }, [groupedResults, value, loading]);

  const getItemMeta = (group, item) => {
    if (group === "products") return item.brand;
    if (group === "doctors") return item.specialization;
    if (group === "categories") return "Category";
    if (group === "labTests") return `₹${item.price ?? 0}`;
    if (group === "faqs") return item.category;
    return "";
  };

  const getItemLabel = (group, item) => {
    if (group === "products") return item.product_name;
    if (group === "doctors") return item.fullName;
    if (group === "categories") return item.category_name;
    if (group === "labTests") return item.test_name;
    if (group === "faqs") return item.question;
    return "";
  };

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
          ref={inputRef}
          type="search"
          aria-label={ariaLabel}
          aria-expanded={open && value.trim().length > 0}
          aria-controls="search-results-listbox"
          aria-activedescendant={activeIndex >= 0 ? `search-result-${activeIndex}` : undefined}
          role="combobox"
          autoComplete="off"
          placeholder={placeholder}
          value={value}
          onFocus={() => {
            if (value.trim()) setOpen(true);
          }}
          onChange={(e) => {
            setValue(e.target.value);
            if (e.target.value.trim()) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              // Check if activeIndex is on a non-header item
              if (activeIndex >= 0 && groupedResults[activeIndex] && !groupedResults[activeIndex].isHeader) {
                const picked = groupedResults[activeIndex];
                navigate(getEntityTarget(picked.group, picked.item));
                setOpen(false);
                inputRef.current?.blur();
                return;
              }
              doSearch(e.currentTarget.value);
              return;
            }

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              setActiveIndex((prev) => {
                let next = prev + 1;
                // Skip header items when navigating
                while (next < groupedResults.length && groupedResults[next].isHeader) {
                  next++;
                }
                return Math.min(groupedResults.length - 1, next);
              });
            }

            if (e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
              setActiveIndex((prev) => {
                let next = prev - 1;
                // Skip header items when navigating
                while (next >= 0 && groupedResults[next].isHeader) {
                  next--;
                }
                return Math.max(0, next);
              });
            }

            if (e.key === "Escape") {
              e.preventDefault();
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          className="h-full flex-1 outline-none text-neutral-800 text-sm bg-transparent min-w-0 placeholder:text-neutral-400"
        />

        {loading ? (
          <div className="h-full w-11 flex items-center justify-center text-[var(--brand-600)]">
            <FiLoader className="animate-spin text-base" />
          </div>
        ) : value?.length > 0 ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setValue("");
              setOpen(false);
              inputRef.current?.focus();
            }}
            className="h-full w-11 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition"
          >
            <span className="text-xl leading-none">×</span>
          </button>
        ) : null}
      </div>

      {/* Screen reader live region */}
      <div
        ref={liveRef}
        role="status"
        aria-live="polite"
        className="sr-only"
      />

      {/* Results dropdown */}
      {open && value.trim() && (
        <div
          id="search-results-listbox"
          role="listbox"
          aria-label="Search results"
          className="absolute left-0 right-0 mt-2 rounded-2xl border border-neutral-200 bg-white shadow-2xl z-50 overflow-hidden"
        >
          <div ref={listRef} className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-6 flex items-center justify-center gap-2 text-sm text-neutral-500">
                <FiLoader className="animate-spin" />
                <span>Searching…</span>
              </div>
            ) : groupedResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-neutral-500">
                <div className="text-neutral-300 text-2xl mb-2">🔍</div>
                <p>No results found for "{value}"</p>
                <p className="text-xs text-neutral-400 mt-1">Try different keywords</p>
              </div>
            ) : (
              groupedResults.map((entry, index) => {
                if (entry.isHeader) {
                  const count = results[entry.group]?.length || 0;
                  return (
                    <div
                      key={`header-${entry.group}`}
                      className="px-4 py-2 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between"
                    >
                      <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                        {SECTION_LABELS[entry.group]}
                      </span>
                      <span className="text-[10px] text-neutral-400">{count}</span>
                    </div>
                  );
                }

                const label = getItemLabel(entry.group, entry.item);
                const meta = getItemMeta(entry.group, entry.item);

                return (
                  <button
                    key={`${entry.group}-${entry.item._id}`}
                    id={`search-result-${index}`}
                    data-result-index={index}
                    role="option"
                    aria-selected={index === activeIndex}
                    type="button"
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => {
                      navigate(getEntityTarget(entry.group, entry.item));
                      setOpen(false);
                      inputRef.current?.blur();
                    }}
                    className={`w-full text-left px-4 py-3 border-b border-neutral-100 last:border-b-0 transition flex items-center justify-between gap-3 ${
                      index === activeIndex ? "bg-[var(--brand-50)]" : "bg-white hover:bg-neutral-50"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-neutral-900 truncate">
                        {highlightText(label, value)}
                      </div>
                      <div className="text-xs text-neutral-500 truncate mt-0.5">
                        {meta}
                      </div>
                    </div>
                    <FiChevronRight className="text-neutral-300 flex-shrink-0 text-sm" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer with "View all results" */}
          {!loading && hasAnyResults && (
            <button
              type="button"
              onClick={() => doSearch(value)}
              className="w-full px-4 py-3 bg-white border-t border-neutral-100 text-sm font-semibold text-[var(--brand-700)] hover:bg-[var(--brand-50)] transition text-center"
            >
              View all results for "{value}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
