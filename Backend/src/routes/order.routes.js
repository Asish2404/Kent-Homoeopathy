import express from "express";
import {
    placeOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    updateOrderStatus,
    getAdminOrders,
} from "../controllers/order.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";


const router = express.Router();

router.post("/place", verifyJWT, placeOrder);

// User order management
router.get("/", verifyJWT, getMyOrders);
router.get("/:orderId", verifyJWT, getOrderById);
router.patch("/:orderId/cancel", verifyJWT, cancelOrder);

// Admin order management
router.patch("/:orderId/status", verifyJWT, isAdmin, updateOrderStatus);
router.get("/admin/orders", verifyJWT, isAdmin, getAdminOrders);



export default router;


