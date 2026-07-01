import { useEffect, useMemo, useState } from "react";
import { normalizeCartItem, STORAGE_KEY } from "./cartUtils";

export function useCartState() {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(normalizeCartItem).filter(Boolean);
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const totalCount = useMemo(
    () => items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0),
    [items]
  );

  const addToCart = (product, qty = 1) => {
    const n = normalizeCartItem({ ...product, qty });
    if (!n) return;

    setItems((prev) => {
      const idx = prev.findIndex((x) => x.id === n.id);
      if (idx === -1) {
        return [
          ...prev,
          { ...n, qty: Math.max(1, Math.min(15, Number(qty) || 1)) },
        ];
      }
      return prev.map((x, i) =>
        i === idx
          ? {
              ...x,
              qty: Math.max(1, Math.min(15, x.qty + (Number(qty) || 1))),
            }
          : x
      );
    });
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
            ? { ...x, qty: Math.max(1, Math.min(15, Number(qty) || 1)) }
            : x
        )
        .filter(Boolean)
    );
  };

  const clearCart = () => setItems([]);

  return { items, totalCount, addToCart, removeFromCart, setQty, clearCart };
}

