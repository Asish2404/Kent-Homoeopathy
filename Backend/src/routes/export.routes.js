import express from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

import {
  exportProducts,
  exportOrders,
  exportCustomers,
  exportInventory,
  exportCoupons,
  exportReports,
} from "../controllers/export.controller.js";

const router = express.Router();

// All export routes require admin authentication
router.get("/products", verifyJWT, isAdmin, exportProducts);
router.get("/orders", verifyJWT, isAdmin, exportOrders);
router.get("/customers", verifyJWT, isAdmin, exportCustomers);
router.get("/inventory", verifyJWT, isAdmin, exportInventory);
router.get("/coupons", verifyJWT, isAdmin, exportCoupons);
router.get("/reports", verifyJWT, isAdmin, exportReports);

export default router;

