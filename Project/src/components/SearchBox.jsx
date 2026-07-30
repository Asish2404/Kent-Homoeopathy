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

  // Search effect: starts debounced search when value changes
  useEffect(() => {
    const q = value.trim();

    if (abortRef.current) {
      abortRef.current.abort();
    }

    if (!q) {
      // Reset results when input is cleared - defer to avoid cascading render warnings
      const resetTimer = setTimeout(() => {
        setResults({ products: [], doctors: [], categories: [], labTests: [], faqs: [] });
        setLoading(false);
      }, 0);
      return () => clearTimeout(resetTimer);
    }

    const searchTimer = setTimeout(() => {
      setLoading(true);
      performSearch(q);
    }, 300);

    return () => {
      clearTimeout(searchTimer);
    };
  }, [value, performSearch]);

  // Reset active index when value changes (deferred to avoid cascading render warnings)
  const prevValueRef = useRef("");
  useEffect(() => {
    const q = value.trim();
    const prev = prevValueRef.current;
    prevValueRef.current = q;
    if (q !== prev) {
      const timer = setTimeout(() => setActiveIndex(-1), 0);
      return () => clearTimeout(timer);
    }
  }, [value]);

  // Reset active index when results fully change
  const prevResultsRef = useRef(null);
  useEffect(() => {
    if (prevResultsRef.current !== results) {
      prevResultsRef.current = results;
      const timer = setTimeout(() => setActiveIndex(-1), 0);
      return () => clearTimeout(timer);
    }
  }, [results]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-result-index]");
      if (items[activeIndex]) {
        items[activeIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

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
    if (group === "doctors") return item.doctor_name;
    if (group === "categories") return item.category_name;
    if (group === "labTests") return item.test_name;
    if (group === "faqs") return item.question;
    return "";
  };

  return (
    <div ref={rootRef} className="relative w-full min-w-0">
      <div className={className} role="search" aria-label={ariaLabel}>
        <div className="absolute left-0 top-0 bottom-0 w-[38px] flex items-center justify-center pointer-events-none text-neutral-500 z-10">
          <FiSearch className="text-sm" />
        </div>

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
            const next = e.target.value;
            setValue(next);
            if (next.trim()) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
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
          className="h-full w-full outline-none text-neutral-800 text-sm bg-transparent placeholder:text-neutral-400"
          style={{ paddingLeft: "2.25rem", paddingRight: "2.25rem" }}
        />

        <div className="absolute right-0 top-0 bottom-0 w-[38px] flex items-center justify-center z-10">
          {loading ? (
            <FiLoader className="animate-spin text-base text-[var(--brand-600)]" />
          ) : value?.length > 0 ? (
            <button
              type="button"
              aria-label="Clear search"
              tabIndex={-1}
              onClick={() => {
                setValue("");
                setOpen(false);
                inputRef.current?.focus();
              }}
              className="w-full h-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
            >
              <span className="text-xl leading-none">&times;</span>
            </button>
          ) : null}
        </div>
      </div>

      <div
        ref={liveRef}
        role="status"
        aria-live="polite"
        className="sr-only"
      />

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
                <span>Searching&hellip;</span>
              </div>
            ) : groupedResults.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-neutral-500">
                <div className="text-neutral-300 text-2xl mb-2">&#128269;</div>
                <p>No results found for &ldquo;{value}&rdquo;</p>
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

          {!loading && hasAnyResults && (
            <button
              type="button"
              onClick={() => doSearch(value)}
              className="w-full px-4 py-3 bg-white border-t border-neutral-100 text-sm font-semibold text-[var(--brand-700)] hover:bg-[var(--brand-50)] transition text-center"
            >
              View all results for &ldquo;{value}&rdquo;
            </button>
          )}
        </div>
      )}
    </div>
  );
}

