export const STORAGE_KEY = "cart_items_v1";
export const SAVED_STORAGE_KEY = "cart_saved_v1";
export const WISHLIST_STORAGE_KEY = "wishlist_items_v1";

const readNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export function normalizeCartItem(item) {
  if (!item) return null;
  const rawId = item.id ?? item.cartItemId ?? item.productId ?? item._id;
  if (rawId == null) return null;

  const productId =
    item.productId ??
    item.baseProductId ??
    item._id ??
    (typeof rawId === "string" && rawId.includes("::") ? rawId.split("::")[0] : rawId);

  const stock = readNumber(item.stock ?? item.maxQty ?? item.availableStock ?? item.inventory, 15);

  return {
    id: String(rawId),
    productId: productId != null ? String(productId) : undefined,
    name: item.name ?? "",
    image: item.image ?? item.productImage ?? "",
    price: readNumber(item.price ?? item.currentPrice ?? 0),
    mrp: readNumber(
      item.mrp ??
        item.oldPrice ??
        item.originalPrice ??
        item.price ??
        0
    ),
    qty: Math.max(1, Math.min(stock || 15, readNumber(item.qty ?? 1, 1))),
    inStock: item.inStock ?? item.isInStock ?? true,
    rx: Boolean(item.rx),
    category: item.category ?? item.categoryTitle ?? "",
    deliveryLabel: item.deliveryLabel ?? "",
    stock,
    packInfo: item.packInfo ?? item.variantLabel ?? "",
    variantKey: item.variantKey ?? "",
    isKentProduct: Boolean(item.isKentProduct),
  };
}

