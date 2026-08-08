import express from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

import {
    getHomepageSections,
    getHomepageSection,
    addProductToSection,
    removeProductFromSection,
    reorderSection,
} from "../controllers/homepage.controller.js";

const router = express.Router();

// Public
router.get("/sections", getHomepageSections);
router.get("/sections/:section", getHomepageSection);

// Admin-only
router.post("/sections/:section/products", verifyJWT, isAdmin, addProductToSection);
router.delete("/sections/:section/products/:productId", verifyJWT, isAdmin, removeProductFromSection);
router.patch("/sections/:section/reorder", verifyJWT, isAdmin, reorderSection);

export default router;
