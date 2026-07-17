import express from "express";
import { addToCart, checkout, getCart, updateCartQuantity } from "../controllers/cart.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Add product to cart
router.post("/", verifyJWT, addToCart);

// Get current cart
router.get("/", verifyJWT, getCart);

// Update cart item quantity
router.patch("/quantity", verifyJWT, updateCartQuantity);

// Checkout - prepares checkout details (does NOT create an order)
router.get("/checkout", verifyJWT, checkout);

export default router;
