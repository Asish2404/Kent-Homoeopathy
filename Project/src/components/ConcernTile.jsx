import { useNavigate } from "react-router-dom";

/**
 * "Shop by Concern" tile — image with gradient overlay + bold label at bottom.
 * Routes to a filtered product listing.
 */
const ConcernTile = ({ concern }) => {
  const navigate = useNavigate();
  if (!concern) return null;

  const handleClick = () => {
    navigate(`/Products?category=${concern.slug}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group relative shrink-0 w-[150px] sm:w-[170px] lg:w-44
                 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl
                 card-lift cursor-pointer
                 aspect-[4/5] bg-neutral-100"
      aria-label={`Shop by concern: ${concern.name}`}
    >
      <img
        src={concern.image}
        alt={concern.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${concern.gradient || "from-neutral-900/80 to-transparent"}`} />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="text-white font-bold text-sm sm:text-base leading-tight drop-shadow">
          {concern.name}
        </p>
      </div>
    </button>
  );
};

export default ConcernTile;
