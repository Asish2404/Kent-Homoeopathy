import express from "express";
import { addToCart } from "../controllers/cart.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Add product to cart
router.post("/", verifyJWT, addToCart);

export default router;