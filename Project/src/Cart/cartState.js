import { useEffect, useMemo, useState } from "react";
import {
  normalizeCartItem,
  SAVED_STORAGE_KEY,
  STORAGE_KEY,
  WISHLIST_STORAGE_KEY,
} from "./cartUtils";

const readList = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeCartItem).filter(Boolean);
  } catch {
    return [];
  }
};

const clampQty = (item, qty) => {
  const stock = Math.max(1, Number(item?.stock || 15));
  return Math.max(1, Math.min(stock, Number(qty) || 1));
};

// Unique line key: same product + same variant merge; different variants of
// the same product stay as separate cart lines.
const keyOf = (it) => {
  const vi =
    it && it.variant_index !== undefined && it.variant_index !== null
      ? it.variant_index
      : "";
  return `${it && it.id}::${vi}`;
};

const variantIndexOf = (variant_index) =>
  variant_index !== undefined && variant_index !== null ? variant_index : "";

export function useCartState() {
  const [items, setItems] = useState(() => {
    return readList(STORAGE_KEY);
  });
  const [savedItems, setSavedItems] = useState(() => readList(SAVED_STORAGE_KEY));
  const [wishlistItems, setWishlistItems] = useState(() => readList(WISHLIST_STORAGE_KEY));

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedItems));
    } catch {
      // ignore
    }
  }, [savedItems]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch {
      // ignore
    }
  }, [wishlistItems]);

  const totalCount = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0),
    [items]
  );

  const wishlistCount = useMemo(() => wishlistItems.length, [wishlistItems]);

  const addToCart = (product, qty = 1) => {
    const n = normalizeCartItem({ ...product, qty });
    if (!n) return;

    setItems((prev) => {
      const idx = prev.findIndex((x) => keyOf(x) === keyOf(n));
      if (idx === -1) {
        return [...prev, { ...n, qty: clampQty(n, qty) }];
      }
      return prev.map((x, i) =>
        i === idx
          ? {
              ...x,
              qty: clampQty(x, Number(x.qty || 1) + (Number(qty) || 1)),
            }
          : x
      );
    });

    setSavedItems((prev) => prev.filter((x) => keyOf(x) !== keyOf(n)));
  };

  const removeFromCart = (id, variant_index) => {
    const sid = String(id);
    const vi = variantIndexOf(variant_index);
    setItems((prev) => prev.filter((x) => `${String(x.id)}::${variantIndexOf(x.variant_index)}` !== `${sid}::${vi}`));
  };

  const setQty = (id, qty, variant_index) => {
    const sid = String(id);
    const vi = variantIndexOf(variant_index);
    setItems((prev) =>
      prev
        .map((x) =>
          `${String(x.id)}::${variantIndexOf(x.variant_index)}` === `${sid}::${vi}`
            ? { ...x, qty: clampQty(x, qty) }
            : x
        )
        .filter(Boolean)
    );
  };

  const addToSaved = (product) => {
    const n = normalizeCartItem(product);
    if (!n) return;
    setItems((prev) => prev.filter((x) => keyOf(x) !== keyOf(n)));
    setSavedItems((prev) => {
      if (prev.some((x) => keyOf(x) === keyOf(n))) return prev;
      return [...prev, n];
    });
  };

  const removeFromSaved = (id, variant_index) => {
    const sid = String(id);
    const vi = variantIndexOf(variant_index);
    setSavedItems((prev) => prev.filter((x) => `${String(x.id)}::${variantIndexOf(x.variant_index)}` !== `${sid}::${vi}`));
  };

  const moveSavedToCart = (id, variant_index) => {
    const sid = String(id);
    const vi = variantIndexOf(variant_index);
    const item = savedItems.find((x) => `${String(x.id)}::${variantIndexOf(x.variant_index)}` === `${sid}::${vi}`);
    if (!item) return;
    removeFromSaved(sid, variant_index);
    addToCart(item, item.qty || 1);
  };

  const toggleWishlist = (product) => {
    const n = normalizeCartItem(product);
    if (!n) return false;
    setWishlistItems((prev) => {
      const exists = prev.some((x) => x.id === n.id);
      if (exists) return prev.filter((x) => x.id !== n.id);
      return [...prev, n];
    });
    return true;
  };

  const removeFromWishlist = (id) => {
    const sid = String(id);
    setWishlistItems((prev) => prev.filter((x) => x.id !== sid));
  };

  const isInCart = (id) => items.some((x) => x.id === String(id));
  const isSaved = (id) => savedItems.some((x) => x.id === String(id));
  const isWishlisted = (id) => wishlistItems.some((x) => x.id === String(id));

  const clearCart = () => setItems([]);

  const cartHasKentProduct = useMemo(
    () => items.some((item) => Boolean(item.isKentProduct)),
    [items]
  );

  return {
    items,
    savedItems,
    wishlistItems,
    totalCount,
    wishlistCount,
    cartHasKentProduct,
    addToCart,
    addToSaved,
    moveSavedToCart,
    removeFromCart,
    removeFromSaved,
    setQty,
    clearCart,
    toggleWishlist,
    removeFromWishlist,
    isInCart,
    isSaved,
    isWishlisted,
  };
}
