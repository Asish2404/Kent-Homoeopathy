import express from "express";
import {
  addProductToWishlist,
  getWishlist,
  checkWishlistProduct,
  removeProductFromWishlist,
  clearWishlist,
  moveWishlistItemToCart,
} from "../controllers/wishlist.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

// Add product to wishlist
router.post("/", verifyJWT, addProductToWishlist);

// Get wishlist (paginated + populated)
router.get("/", verifyJWT, getWishlist);

// Check if product exists in wishlist
router.get("/check/:productId", verifyJWT, checkWishlistProduct);

// Remove product from wishlist
router.delete("/:productId", verifyJWT, removeProductFromWishlist);

// Clear entire wishlist
router.delete("/", verifyJWT, clearWishlist);

// Move wishlist item to cart
router.post(
  "/:productId/move-to-cart",
  verifyJWT,
  moveWishlistItemToCart
);

export default router;

