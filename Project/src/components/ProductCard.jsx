import { FaStar, FaHeart, FaShoppingCart, FaBolt } from "react-icons/fa";
import { HiCheckBadge } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../Cart/CartContext";

/**
 * Reusable premium product card.
 * Used in: Home (Featured + all category sliders), Products (related).
 *
 * Props:
 *  - product: { id, name, price, oldPrice, rating, reviews, image, discount, badge }
 *  - onAdd, onBuy, onWishlist  (optional handlers)
 *  - variant: "default" | "compact"
 */
const ProductCard = ({ product, onAdd, onBuy, onWishlist, variant = "default" }) => {
  const cart = useCartContext();
  const navigate = useNavigate();
  const {
    name,
    price,
    oldPrice,
    rating = 4.8,
    reviews = 0,
    image,
    discount,
    badge,
  } = product;

  const filledStars = Math.floor(rating);
  const isCompact = variant === "compact";
  const wishlisted = cart.isWishlisted?.(product.id);

  const handleAdd = onAdd || (() => cart.addToCart(product, 1));
  const handleBuy =
    onBuy ||
    (() => {
      if (!cart.isInCart?.(product.id)) {
        cart.addToCart(product, 1);
      }
      navigate("/Cart");
    });
  const handleWishlist = onWishlist || (() => cart.toggleWishlist(product));

  // Clicking anywhere on the card opens the product details page.
  const handleCardClick = () => {
    if (product?.id) {
      navigate(`/products/${product.id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`
        group shrink-0
        ${isCompact ? "w-[180px] sm:w-[200px]" : "w-[85%] sm:w-[60%] md:w-[45%] lg:w-[30%] xl:w-[23%]"}
        bg-white rounded-2xl overflow-hidden
        border border-neutral-100
        shadow-sm hover:shadow-xl
        card-lift
        relative
        cursor-pointer
      `}
    >
      {/* Top action bar */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <button
          onClick={handleWishlist}
          aria-label="Add to wishlist"
          className={`w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center transition ${
            wishlisted ? "text-red-500" : "text-neutral-500 hover:text-red-500 hover:bg-white"
          }`}
        >
          <FaHeart className="text-sm" />
        </button>
      </div>

      {/* Image */}
      <div className="relative bg-gradient-to-br from-[var(--brand-50)] to-white p-5 aspect-square flex items-center justify-center overflow-hidden">
        {/* Discount / Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount && (
            <span className="bg-[var(--brand-600)] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md">
              {discount}
            </span>
          )}
          {badge && (
            <span className="bg-amber-100 text-amber-700 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <HiCheckBadge className="text-xs" />
              {badge}
            </span>
          )}
        </div>

        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-base md:text-lg font-semibold text-neutral-800 mb-2 line-clamp-2 leading-snug min-h-[2.6rem]">
          {name}
        </h3>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex text-amber-400 text-xs gap-0.5">
            {[...Array(5)].map((_, i) => (
              <FaStar
                key={i}
                className={i < filledStars ? "" : "text-neutral-200"}
              />
            ))}
          </div>
          <span className="text-xs text-neutral-500 font-medium">
            {rating.toFixed(1)} {reviews > 0 && `(${reviews.toLocaleString()})`}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xl md:text-2xl font-bold text-neutral-900">
            ₹{price}
          </span>
          {oldPrice && (
            <span className="text-sm text-neutral-400 line-through">
              ₹{oldPrice}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAdd();
              e.currentTarget.blur();
            }}
            className="flex-1 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition shadow-sm hover:shadow-md"
          >
            <FaShoppingCart className="text-xs" />
            Add
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleBuy();
              e.currentTarget.blur();
            }}
            className="px-3 border border-[var(--brand-600)] text-[var(--brand-700)] rounded-lg text-sm font-semibold hover:bg-[var(--brand-50)] transition flex items-center gap-1.5"
            aria-label="Buy now"
          >
            <FaBolt className="text-xs" />
            Buy
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
