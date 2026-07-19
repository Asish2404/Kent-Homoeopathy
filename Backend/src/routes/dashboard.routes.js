import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

import {
  getOverview,
  getRevenue,
  getOrders,
  getPayments,
  getProducts,
  getDoctors,
  getPatients,
  getAppointments,
  getReports,
  getCharts,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/overview", verifyJWT, isAdmin, getOverview);
router.get("/revenue", verifyJWT, isAdmin, getRevenue);
router.get("/orders", verifyJWT, isAdmin, getOrders);
router.get("/payments", verifyJWT, isAdmin, getPayments);
router.get("/products", verifyJWT, isAdmin, getProducts);
router.get("/doctors", verifyJWT, isAdmin, getDoctors);
router.get("/patients", verifyJWT, isAdmin, getPatients);
router.get("/appointments", verifyJWT, isAdmin, getAppointments);
router.get("/reports", verifyJWT, isAdmin, getReports);
router.get("/charts", verifyJWT, isAdmin, getCharts);

export default router;

