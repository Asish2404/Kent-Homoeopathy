import { useNavigate } from "react-router-dom";

/**
 * Image-based category tile.
 * Routes to /Products?category=:slug
 */
const CategoryTile = ({ category, compact = false }) => {
  const navigate = useNavigate();
  if (!category) return null;

  const handleClick = () => {
    navigate(`/Products?category=${category.slug}`);
  };

  const subtitle = category.tagline || category.description || category.short_description || "";

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white/95 text-left shadow-sm transition-all duration-300 ease-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)]/40 sm:hover:-translate-y-0.5 sm:hover:shadow-md"
      aria-label={`Shop ${category.name}`}
    >
      <div className={`relative overflow-hidden bg-gradient-to-br from-[var(--brand-50)] via-white to-[var(--brand-100)] p-2.5 sm:p-3 ${compact ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out sm:group-hover:scale-[1.03]"
        />
      </div>
      <div className={`flex flex-1 flex-col gap-0.5 px-2.5 py-2.5 ${compact ? "sm:px-2.5 sm:py-2.5" : "sm:px-3 sm:py-3"}`}>
        <p className="text-xs sm:text-sm font-bold leading-snug text-neutral-900 truncate">
          {category.name}
        </p>
        {subtitle && (
          <p className="text-[11px] sm:text-xs leading-snug text-neutral-500 line-clamp-1">
            {subtitle}
          </p>
        )}
        {category.productCount > 0 && (
          <p className="mt-auto pt-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--brand-600)]">
            {category.productCount} items
          </p>
        )}
      </div>
    </button>
  );
};

export default CategoryTile;
