export const STORAGE_KEY = "cart_items_v1";

export function normalizeCartItem(item) {
  if (!item) return null;
  const id = item.id ?? item.productId ?? item._id;
  if (id == null) return null;

  return {
    id: String(id),
    name: item.name ?? "",
    image: item.image ?? item.productImage ?? "",
    price: Number(item.price ?? item.currentPrice ?? 0),
    mrp: Number(
      item.mrp ??
        item.oldPrice ??
        item.originalPrice ??
        item.price ??
        0
    ),
    qty: Number(item.qty ?? 1),
    inStock: item.inStock ?? item.isInStock ?? true,
    rx: Boolean(item.rx),
    category: item.category ?? item.categoryTitle ?? "",
    deliveryLabel: item.deliveryLabel ?? "",
  };
}

