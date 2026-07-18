import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import {
    createMedicalReport,
    getMedicalReports,
    getMedicalReportById,
    updateMedicalReport,
    updateMedicalReportStatus,
    softDeleteMedicalReport,
} from "../controllers/medicalReport.controller.js";

const router = express.Router();

// Doctor or Patient upload
router.post("/", verifyJWT, createMedicalReport);

// Authenticated list
router.get("/", verifyJWT, getMedicalReports);

router.get("/:reportId", verifyJWT, getMedicalReportById);

// Doctor update only
router.patch("/:reportId", verifyJWT, updateMedicalReport);

// Doctor/Admin status update
router.patch("/:reportId/status", verifyJWT, updateMedicalReportStatus);

// Admin soft delete
router.delete("/:reportId", verifyJWT, isAdmin, softDeleteMedicalReport);

export default router;

