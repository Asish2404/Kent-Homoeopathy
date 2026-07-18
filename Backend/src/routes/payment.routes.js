import express from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

import {
    createRazorpayOrder,
    verifyRazorpay,
    getPaymentHistory,
    getPaymentById,
    refundPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-order", verifyJWT, createRazorpayOrder);
router.post("/verify", verifyJWT, verifyRazorpay);

router.get("/history", verifyJWT, getPaymentHistory);
router.get("/:paymentId", verifyJWT, getPaymentById);

router.post("/refund", verifyJWT, isAdmin, refundPayment);

export default router;

