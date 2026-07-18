import express from "express";
import { placeOrder } from "../controllers/order.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/place", verifyJWT, placeOrder);

export default router;
