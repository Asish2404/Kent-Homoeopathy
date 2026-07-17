import express from "express";
import {
    addToCart,
    getCart,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    checkout
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Add product to cart
router.post("/", verifyJWT, addToCart);

// Get current cart
router.get("/", verifyJWT, getCart);

// Update cart quantity
router.patch("/quantity", verifyJWT, updateCartQuantity);

// Remove one item from cart
router.delete("/:productId", verifyJWT, removeCartItem);

// Clear entire cart
router.delete("/", verifyJWT, clearCart);

// Checkout summary
router.get("/checkout", verifyJWT, checkout);

export default router;