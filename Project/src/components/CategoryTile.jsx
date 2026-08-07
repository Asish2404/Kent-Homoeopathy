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
      className="group flex h-full w-full min-w-0 flex-col overflow-hidden rounded-[1.25rem] border border-neutral-100 bg-white/95 text-left shadow-sm transition-all duration-300 ease-out cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-500)]/40 sm:hover:-translate-y-1 sm:hover:shadow-lg"
      aria-label={`Shop ${category.name}`}
    >
      <div className={`relative overflow-hidden bg-gradient-to-br from-[var(--brand-50)] via-white to-[var(--brand-100)] p-3 sm:p-3.5 ${compact ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out sm:group-hover:scale-[1.04]"
        />
      </div>
      <div className={`flex flex-1 flex-col gap-1 px-3 py-3 ${compact ? "sm:px-3 sm:py-3" : "sm:px-4 sm:py-4"}`}>
        <p className="text-sm font-semibold leading-snug text-neutral-900">
          {category.name}
        </p>
        {subtitle && (
          <p className="text-sm leading-snug text-neutral-500">
            {subtitle}
          </p>
        )}
        {category.productCount > 0 && (
          <p className="mt-auto pt-2 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--brand-600)] sm:text-xs">
            {category.productCount} items
          </p>
        )}
      </div>
    </button>
  );
};

export default CategoryTile;
