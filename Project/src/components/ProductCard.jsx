import { useState } from "react";
import { FaStar, FaHeart, FaShoppingCart, FaBolt, FaMinus, FaPlus } from "react-icons/fa";
import { HiCheckBadge } from "react-icons/hi2";
import { useNavigate } from "react-router-dom";
import { useCartContext } from "../Cart/CartContext";

/**
 * Reusable premium product card.
 * Used in: Home (Featured + all category sliders), Products (related).
 *
 * Props:
 *  - product: { id, _id, name, price, oldPrice, rating, reviews, image, discount, badge, pack, stock, ... }
 *  - onAdd, onBuy, onWishlist  (optional handlers)
 *  - variant: "default" | "compact"
 *  - qty: controlled quantity (optional)
 *  - onQtyChange: quantity change handler (optional)
 */
const ProductCard = ({ product, onAdd, onBuy, onWishlist, variant = "default", qty, onQtyChange }) => {
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
    pack,
    stock,
  } = product;

  const filledStars = Math.floor(rating);
  const isCompact = variant === "compact";
  const wishlisted = cart.isWishlisted?.(product.id);

  // Local qty state (only used when qty/onQtyChange are not provided)
  const [localQty, setLocalQty] = useState(1);
  const controlledQty = qty !== undefined ? qty : localQty;
  const setControlledQty = onQtyChange || setLocalQty;

  const maxStock = Math.max(1, Number(stock) || 15);

  const handleAdd = onAdd || (() => cart.addToCart(product, controlledQty));
  const handleBuy =
    onBuy ||
    (() => {
      if (!cart.isInCart?.(product.id)) {
        cart.addToCart(product, controlledQty);
      } else {
        cart.setQty?.(product.id, controlledQty);
      }
      navigate("/Cart");
    });
  const handleWishlist = onWishlist || (() => cart.toggleWishlist(product));

  // Clicking anywhere on the card opens the product details page.
  const handleCardClick = () => {
    const routeId = product?._id || product?.id;
    if (routeId) {
      navigate(`/products/${routeId}`);
    }
  };

  const changeQty = (delta) => {
    const next = Math.max(1, Math.min(maxStock, Number(controlledQty || 1) + delta));
    setControlledQty(next);
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
        ${isCompact ? "w-[170px] sm:w-[190px] lg:w-auto" : "w-[85%] sm:w-[60%] md:w-[45%] lg:w-[30%] xl:w-[23%]"}
        bg-white rounded-2xl overflow-hidden
        border border-neutral-100
        shadow-sm hover:shadow-xl
        card-lift
        relative
        cursor-pointer
        flex flex-col
      `}
    >
      {/* Wishlist top-right */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleWishlist();
            e.currentTarget.blur();
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`w-9 h-9 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center transition ${
            wishlisted ? "text-red-500" : "text-neutral-500 hover:text-red-500 hover:bg-white"
          }`}
        >
          <FaHeart className={isCompact ? "text-sm" : "text-sm"} />
        </button>
      </div>

      {/* Image */}
      <div
        className={`relative bg-gradient-to-br from-[var(--brand-50)] to-white flex items-center justify-center overflow-hidden ${
          isCompact ? "p-2 h-[110px] sm:h-[120px]" : "p-5 aspect-square"
        }`}
      >
        {/* Discount / Badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {discount && (
            <span className="bg-[var(--brand-600)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md">
              {discount}
            </span>
          )}
          {badge && (
            <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <HiCheckBadge className="text-[10px]" />
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
      <div className={`flex flex-col flex-1 ${isCompact ? "p-2.5" : "p-5"}`}>
        <h3
          className={`font-semibold text-neutral-800 line-clamp-2 leading-snug ${
            isCompact ? "text-[13px] min-h-[2rem]" : "text-base md:text-lg mb-2 min-h-[2.6rem]"
          }`}
        >
          {name}
        </h3>

        {/* Size/qty label */}
        {pack && (
          <p className="mt-1 text-[11px] text-neutral-500 font-medium">{pack}</p>
        )}

        {/* Rating (default only) */}
        {!isCompact && (
          <div className="flex items-center gap-1.5 mb-3 mt-1">
            <div className="flex text-amber-400 text-xs gap-0.5">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < filledStars ? "" : "text-neutral-200"} />
              ))}
            </div>
            <span className="text-xs text-neutral-500 font-medium">
              {rating.toFixed(1)} {reviews > 0 && `(${reviews.toLocaleString()})`}
            </span>
          </div>
        )}

        {/* Price */}
        <div className={`flex items-baseline gap-2 ${!isCompact ? "mb-4" : "mt-1"}`}>
          <span className={`font-bold text-neutral-900 ${isCompact ? "text-[15px]" : "text-xl md:text-2xl"}`}>
            ₹{price}
          </span>
          {oldPrice && (
            <span className={`text-neutral-400 line-through ${isCompact ? "text-[11px]" : "text-sm"}`}>
              ₹{oldPrice}
            </span>
          )}
        </div>

        {/* Compact footer: qty stepper + Add + Buy */}
        {isCompact ? (
          <div className="mt-auto pt-2 flex flex-col gap-1.5">
            {/* Quantity stepper */}
            <div className="flex items-center justify-between border border-neutral-200 rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  changeQty(-1);
                }}
                aria-label="Decrease quantity"
                className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] transition"
              >
                <FaMinus className="text-xs" />
              </button>
              <span className="text-sm font-bold text-neutral-800">{controlledQty}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  changeQty(1);
                }}
                aria-label="Increase quantity"
                className="w-8 h-8 flex items-center justify-center text-neutral-600 hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] transition"
              >
                <FaPlus className="text-xs" />
              </button>
            </div>

            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAdd();
                  e.currentTarget.blur();
                }}
                className="flex-1 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition"
              >
                <FaShoppingCart className="text-[11px]" />
                <span className="hidden sm:inline">Add to</span> Cart
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleBuy();
                  e.currentTarget.blur();
                }}
                className="flex-1 border border-[var(--brand-600)] text-[var(--brand-700)] py-2 rounded-lg text-xs font-semibold hover:bg-[var(--brand-50)] transition flex items-center justify-center gap-1"
              >
                <FaBolt className="text-[11px]" />
                Buy
              </button>
            </div>
          </div>
        ) : (
          /* Default footer */
          <div className="flex gap-2 mt-auto">
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
        )}
      </div>
    </div>
  );
};

export default ProductCard;
