import { createContext, useContext } from "react";

// Holds the cart state + actions.
export const CartContext = createContext(null);

// Hook used by components (e.g., Navbar) to access the cart.
export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCartContext must be used within a CartProvider");
  }
  return ctx;
}


