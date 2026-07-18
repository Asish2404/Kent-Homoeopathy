import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import {
    createPrescription,
    getPrescriptions,
    getPrescriptionById,
    editPrescription,
    finalizePrescription,
    softDeletePrescription,
} from "../controllers/prescription.controller.js";

const router = express.Router();

// Doctor only (enforced at controller-level using req.user.role + Doctor profile)
router.post("/", verifyJWT, createPrescription);

// Authenticated list
router.get("/", verifyJWT, getPrescriptions);

router.get("/:prescriptionId", verifyJWT, getPrescriptionById);

// Doctor edit only (controller enforces ownership + not finalized)
router.patch("/:prescriptionId", verifyJWT, editPrescription);

// Doctor finalize only
router.patch("/:prescriptionId/finalize", verifyJWT, finalizePrescription);

// Admin soft delete only
router.delete("/:prescriptionId", verifyJWT, isAdmin, softDeletePrescription);

export default router;

