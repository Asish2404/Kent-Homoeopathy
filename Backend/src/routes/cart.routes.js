import express from "express";
import { addToCart, getCart } from "../controllers/cart.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Add product to cart
router.post("/", verifyJWT, addToCart);

// Get cart for logged-in user
router.get("/", verifyJWT, getCart);

export default router;

