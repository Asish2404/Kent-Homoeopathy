import express from "express";
import {
    addToCart,
    getCart,
    updateCartQuantity,
    removeCartItem
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Add product to cart
router.post("/", verifyJWT, addToCart);

// Get cart for logged-in user
router.get("/", verifyJWT, getCart);

// Update cart quantity for a product
router.patch("/update", verifyJWT, updateCartQuantity);

// Remove a single product from cart
router.delete("/remove/:productId", verifyJWT, removeCartItem);

export default router;



