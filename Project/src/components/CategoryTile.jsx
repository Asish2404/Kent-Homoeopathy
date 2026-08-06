import { useNavigate } from "react-router-dom";

/**
 * Image-based category tile.
 * Routes to /Products?category=:slug
 */
const CategoryTile = ({ category }) => {
  const navigate = useNavigate();
  if (!category) return null;

  const handleClick = () => {
    navigate(`/Products?category=${category.slug}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group shrink-0 w-[120px] sm:w-[150px] lg:w-auto
                 bg-white rounded-2xl border border-neutral-100
                 shadow-sm hover:shadow-lg card-lift
                 overflow-hidden text-left cursor-pointer"
      aria-label={`Shop ${category.name}`}
    >
      <div className="aspect-square bg-gradient-to-br from-[var(--brand-50)] to-white
                      flex items-center justify-center p-3">
        <img
          src={category.image}
          alt={category.name}
          loading="lazy"
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="px-2 py-2.5 text-center">
        <p className="text-[13px] lg:text-sm font-semibold text-neutral-800 line-clamp-2 leading-tight">
          {category.name}
        </p>
        {category.productCount > 0 && (
          <p className="text-[11px] text-neutral-400 mt-0.5">
            {category.productCount} items
          </p>
        )}
      </div>
    </button>
  );
};

export default CategoryTile;
