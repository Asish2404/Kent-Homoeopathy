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
    rating = 0,
    reviews = 0,
    image,
    discount,
    badge,
    pack,
    stock,
    out_of_stock,
    not_available,
    isInStock,
  } = product;

  const isAvailable = isInStock !== false && !out_of_stock && !not_available && (stock === undefined || Number(stock) > 0);

  const filledStars = Math.floor(rating);
  const isCompact = variant === "compact";
  const wishlisted = cart.isWishlisted?.(product.id || product._id);

  // Local qty state
  const [localQty, setLocalQty] = useState(1);
  const controlledQty = qty !== undefined ? qty : localQty;
  const setControlledQty = onQtyChange || setLocalQty;

  const maxStock = Math.max(1, Number(stock) || 15);

  const handleAdd = onAdd || (() => isAvailable && cart.addToCart(product, controlledQty));
  const handleBuy =
    onBuy ||
    (() => {
      if (!isAvailable) return;
      const pid = product._id || product.id;
      if (!cart.isInCart?.(pid)) {
        cart.addToCart(product, controlledQty);
      } else {
        cart.setQty?.(pid, controlledQty);
      }
      navigate("/Cart");
    });
  const handleWishlist = onWishlist || (() => cart.toggleWishlist(product));

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
        ${isCompact ? "w-[155px] sm:w-[170px] lg:w-auto" : "w-[80%] sm:w-[50%] md:w-[38%] lg:w-[28%] xl:w-[22%]"}
        bg-white rounded-2xl overflow-hidden
        border border-neutral-100
        shadow-sm hover:shadow-lg
        card-lift
        relative
        cursor-pointer
        flex flex-col
      `}
    >
      {/* Wishlist top-right */}
      <div className="absolute top-2.5 right-2.5 z-20">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleWishlist();
            e.currentTarget.blur();
          }}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center transition ${
            wishlisted ? "text-red-500" : "text-neutral-400 hover:text-red-500 hover:bg-white"
          }`}
        >
          <FaHeart className="text-xs" />
        </button>
      </div>

      {/* Badges Container - Top Left with Dedicated Positions */}
      <div className="absolute top-2.5 left-2.5 z-20 flex flex-col items-start gap-1 pointer-events-none">
        {badge && (
          <span className="bg-amber-500 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
            <HiCheckBadge className="text-[11px]" />
            {badge}
          </span>
        )}
        {discount && (
          <span className="bg-[var(--brand-600)] text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-sm">
            {discount}
          </span>
        )}
        {!isAvailable && (
          <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
            Out of Stock
          </span>
        )}
      </div>

      {/* Image */}
      <div
        className={`relative bg-gradient-to-br from-[var(--brand-50)]/60 to-white flex items-center justify-center overflow-hidden ${
          isCompact ? "p-2 h-[100px] sm:h-[110px]" : "p-3 sm:p-4 aspect-square"
        }`}
      >
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-1 ${isCompact ? "p-2" : "p-3 sm:p-3.5"}`}>
        <h3
          className={`font-semibold text-neutral-800 line-clamp-2 leading-snug ${
            isCompact ? "text-xs min-h-[1.8rem]" : "text-xs sm:text-sm mb-1 min-h-[2.2rem]"
          }`}
        >
          {name}
        </h3>

        {/* Size/qty label */}
        {pack && (
          <p className="text-[10px] sm:text-[11px] text-neutral-500 font-medium truncate">{pack}</p>
        )}

        {/* Rating — only shown when real reviews exist */}
        {!isCompact && reviews > 0 && rating > 0 && (
          <div className="flex items-center gap-1 mt-1 mb-1.5">
            <div className="flex text-amber-400 text-[10px] gap-0.5">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < filledStars ? "" : "text-neutral-200"} />
              ))}
            </div>
            <span className="text-[10px] sm:text-[11px] text-neutral-500 font-medium">
              {rating.toFixed(1)} ({reviews})
            </span>
          </div>
        )}

        {/* Price */}
        <div className={`flex items-baseline gap-1.5 ${!isCompact ? "my-1.5" : "mt-1"}`}>
          <span className={`font-extrabold text-neutral-900 ${isCompact ? "text-xs sm:text-sm" : "text-sm sm:text-base"}`}>
            ₹{price}
          </span>
          {oldPrice && oldPrice > price && (
            <span className="text-neutral-400 line-through text-[10px] sm:text-xs">
              ₹{oldPrice}
            </span>
          )}
        </div>

        {/* Footer Actions */}
        {isCompact ? (
          <div className="mt-auto pt-1.5 flex flex-col gap-1">
            {isAvailable ? (
              <>
                <div className="flex items-center justify-between border border-neutral-200 rounded-lg overflow-hidden h-7">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      changeQty(-1);
                    }}
                    aria-label="Decrease quantity"
                    className="w-7 h-full flex items-center justify-center text-neutral-600 hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] transition"
                  >
                    <FaMinus className="text-[10px]" />
                  </button>
                  <span className="text-xs font-bold text-neutral-800">{controlledQty}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      changeQty(1);
                    }}
                    aria-label="Increase quantity"
                    className="w-7 h-full flex items-center justify-center text-neutral-600 hover:bg-[var(--brand-50)] hover:text-[var(--brand-700)] transition"
                  >
                    <FaPlus className="text-[10px]" />
                  </button>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAdd();
                      e.currentTarget.blur();
                    }}
                    className="flex-1 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1 transition"
                  >
                    <FaShoppingCart className="text-[10px]" /> Add
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleBuy();
                      e.currentTarget.blur();
                    }}
                    className="flex-1 border border-[var(--brand-600)] text-[var(--brand-700)] py-1.5 rounded-lg text-[11px] font-semibold hover:bg-[var(--brand-50)] transition flex items-center justify-center gap-1"
                  >
                    <FaBolt className="text-[10px]" /> Buy
                  </button>
                </div>
              </>
            ) : (
              <div className="py-1.5 text-center text-[10px] font-bold text-neutral-500 bg-neutral-100 rounded-lg">
                Unavailable
              </div>
            )}
          </div>
        ) : (
          <div className="flex gap-1.5 mt-auto pt-1">
            {isAvailable ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAdd();
                    e.currentTarget.blur();
                  }}
                  className="flex-1 bg-[var(--brand-600)] hover:bg-[var(--brand-700)] text-white py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm hover:shadow-md"
                >
                  <FaShoppingCart className="text-[11px]" />
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
                  className="px-2.5 border border-[var(--brand-600)] text-[var(--brand-700)] rounded-xl text-xs font-semibold hover:bg-[var(--brand-50)] transition flex items-center gap-1"
                  aria-label="Buy now"
                >
                  <FaBolt className="text-[11px]" />
                  Buy
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCardClick();
                }}
                className="w-full py-2 bg-neutral-100 text-neutral-600 rounded-xl text-xs font-semibold transition"
              >
                Notify Me
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
