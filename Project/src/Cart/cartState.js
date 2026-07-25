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
      const idx = prev.findIndex((x) => x.id === n.id);
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

    setSavedItems((prev) => prev.filter((x) => x.id !== n.id));
  };

  const removeFromCart = (id) => {
    const sid = String(id);
    setItems((prev) => prev.filter((x) => x.id !== sid));
  };

  const setQty = (id, qty) => {
    const sid = String(id);
    setItems((prev) =>
      prev
        .map((x) =>
          x.id === sid
            ? { ...x, qty: clampQty(x, qty) }
            : x
        )
        .filter(Boolean)
    );
  };

  const addToSaved = (product) => {
    const n = normalizeCartItem(product);
    if (!n) return;
    setItems((prev) => prev.filter((x) => x.id !== n.id));
    setSavedItems((prev) => {
      if (prev.some((x) => x.id === n.id)) return prev;
      return [...prev, n];
    });
  };

  const removeFromSaved = (id) => {
    const sid = String(id);
    setSavedItems((prev) => prev.filter((x) => x.id !== sid));
  };

  const moveSavedToCart = (id) => {
    const sid = String(id);
    const item = savedItems.find((x) => x.id === sid);
    if (!item) return;
    removeFromSaved(sid);
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

