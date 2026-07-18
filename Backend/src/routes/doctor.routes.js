import express from "express";
import { createDoctor, getDoctors, getDoctorById, updateDoctor, deleteDoctor, updateDoctorAvailability } from "../controllers/doctor.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Admin only
router.post("/", verifyJWT, isAdmin, createDoctor);
router.patch("/:doctorId", verifyJWT, isAdmin, updateDoctor);
router.delete("/:doctorId", verifyJWT, isAdmin, deleteDoctor);
router.patch("/:doctorId/availability", verifyJWT, isAdmin, updateDoctorAvailability);


// Public
router.get("/", getDoctors);
router.get("/:doctorId", getDoctorById);

export default router;

