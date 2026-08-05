import { useMemo, useState } from "react";
import { Plus } from "lucide-react";

const normalizeForCart = (item) => {
  const id = item?._id || item?.id;
  if (!id) return null;

  const price = Number(item?.price ?? item?.currentPrice ?? item?.discount_price ?? 0) || 0;
  const mrp = Number(item?.mrp ?? item?.originalPrice ?? item?.mrp_price ?? price) || price;

  return {
    id,
    productId: item?._id || item?.id,
    name: item?.name || item?.product_name || "",
    image: item?.image || item?.product_image || "",
    price,
    mrp,
    category: item?.category || "Products",
    inStock: item?.inStock !== false,
    stock: Number(item?.stock ?? 10) || 10,
  };
};

const getPrice = (item) => Number(item?.price ?? item?.currentPrice ?? item?.discount_price ?? 0) || 0;
const getMrp = (item) => Number(item?.mrp ?? item?.originalPrice ?? item?.mrp_price ?? getPrice(item)) || getPrice(item);
const getDiscountPercent = (item) => {
  const direct = Number(item?.discountPercent ?? item?.discount ?? 0);
  if (Number.isFinite(direct) && direct > 0) return Math.round(direct);
  const mrp = getMrp(item);
  const price = getPrice(item);
  if (mrp > 0 && mrp > price) {
    return Math.round(((mrp - price) / mrp) * 100);
  }
  return 0;
};

export default function FrequentlyBoughtTogether({ currentProduct, linkedProducts = [], cart }) {
  const items = useMemo(() => {
    const current = currentProduct
      ? {
          id: currentProduct._id || currentProduct.id,
          _id: currentProduct._id || currentProduct.id,
          name: currentProduct.name,
          image: currentProduct.image,
          price: Number(currentProduct.currentPrice ?? currentProduct.price ?? 0) || 0,
          mrp: Number(currentProduct.originalPrice ?? currentProduct.mrp ?? currentProduct.currentPrice ?? 0) || 0,
          inStock: currentProduct.inStock !== false,
          stock: Number(currentProduct.stock ?? 10) || 10,
          category: currentProduct.category,
          isCurrent: true,
        }
      : null;

    const linked = (linkedProducts || [])
      .filter(Boolean)
      .map((p) => ({
        id: p._id || p.id,
        _id: p._id || p.id,
        name: p.product_name || p.name || "",
        image: p.product_image || p.image || "",
        price: Number(p.discount_price ?? p.price ?? 0) || 0,
        mrp: Number(p.mrp_price ?? p.mrp ?? p.discount_price ?? p.price ?? 0) || 0,
        discountPercent: Number(p.discountPercent ?? 0) || 0,
        inStock: true,
        stock: Number(p.stock ?? 10) || 10,
        category: p.category,
      }));

    return current ? [current, ...linked] : linked;
  }, [currentProduct, linkedProducts]);

  const [selectedMap, setSelectedMap] = useState(() => {
    const init = {};
    items.forEach((item) => {
      init[item.id] = true;
    });
    return init;
  });

  const selectedItems = useMemo(
    () => items.filter((item) => selectedMap[item.id]),
    [items, selectedMap]
  );

  const totalPrice = useMemo(
    () => selectedItems.reduce((sum, item) => sum + getPrice(item), 0),
    [selectedItems]
  );

  const totalMrp = useMemo(
    () => selectedItems.reduce((sum, item) => sum + getMrp(item), 0),
    [selectedItems]
  );

  const addOne = (item) => {
    const cartItem = normalizeForCart(item);
    if (!cartItem) return;
    cart.addToCart(cartItem, 1);
  };

  const addSelected = () => {
    selectedItems.forEach((item) => {
      const cartItem = normalizeForCart(item);
      if (cartItem) cart.addToCart(cartItem, 1);
    });
  };

  if (items.length <= 1) {
    return null;
  }

  return (
    <section className="mb-12 md:mb-16">
      <div className="mb-8">
        <span className="section-eyebrow">Complete your routine</span>
        <h2 className="section-title mt-3">Frequently Bought Together</h2>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3 snap-x snap-mandatory md:overflow-visible md:flex-nowrap">
        {items.map((item) => {
          const discount = getDiscountPercent(item);
          return (
            <div
              key={item.id}
              className="snap-start shrink-0 w-[82%] sm:w-[55%] md:w-full md:flex-1 bg-white border border-neutral-100 rounded-2xl p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedMap[item.id])}
                    onChange={() =>
                      setSelectedMap((prev) => ({
                        ...prev,
                        [item.id]: !prev[item.id],
                      }))
                    }
                    className="mt-1 w-4 h-4 accent-[var(--brand-600)]"
                  />
                  <span className="text-xs font-semibold text-neutral-500">
                    {item.isCurrent ? "This Product" : "Add Item"}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => addOne(item)}
                  className="w-8 h-8 rounded-full border border-[var(--brand-200)] text-[var(--brand-700)] hover:bg-[var(--brand-50)] flex items-center justify-center"
                  aria-label="Quick add"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-neutral-50 border border-neutral-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-neutral-900 line-clamp-2">{item.name}</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-base font-bold text-neutral-900">₹{getPrice(item)}</span>
                    {getMrp(item) > getPrice(item) && (
                      <span className="text-xs text-neutral-400 line-through">₹{getMrp(item)}</span>
                    )}
                    {discount > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                        {discount}% OFF
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 bg-[var(--brand-50)] border border-[var(--brand-100)] rounded-2xl p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-neutral-500">Selected total</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-neutral-900">₹{totalPrice.toFixed(2)}</span>
            {totalMrp > totalPrice && (
              <span className="text-sm text-neutral-400 line-through">₹{totalMrp.toFixed(2)}</span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={addSelected}
          disabled={selectedItems.length === 0}
          className="btn-primary w-full md:w-auto px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add selected to cart
        </button>
      </div>
    </section>
  );
}