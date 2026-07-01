import { useMemo } from "react";
import { useCartState } from "./cartState";
import { CartContext } from "./CartContext";

export default function CartProvider({ children }) {

  const cart = useCartState();

  const value = useMemo(
    () => ({
      ...cart,
    }),
    [cart]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}