import express from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCoupon,
  removeCoupon,
} from "../controllers/coupon.controller.js";

const router = express.Router();

// Admin APIs
router.post("/", verifyJWT, isAdmin, createCoupon);
router.get("/", verifyJWT, isAdmin, getCoupons);
router.get("/:couponId", verifyJWT, isAdmin, getCouponById);
router.patch("/:couponId", verifyJWT, isAdmin, updateCoupon);
router.delete("/:couponId", verifyJWT, isAdmin, deleteCoupon);

// User APIs
router.post("/validate", verifyJWT, validateCoupon);
router.post("/apply", verifyJWT, applyCoupon);
router.post("/remove", verifyJWT, removeCoupon);

export default router;

