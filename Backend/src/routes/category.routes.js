import express from "express";
import {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} from "../controllers/category.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/", getAllCategories);
router.post("/", verifyJWT, isAdmin, createCategory);
router.patch("/:categoryId", verifyJWT, isAdmin, updateCategory);
router.delete("/:categoryId", verifyJWT, isAdmin, deleteCategory);

export default router;
