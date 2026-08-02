import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory
} from "../controllers/category.controller.js";

const router = express.Router();

router.post("/", verifyJWT, isAdmin, createCategory);

router.get("/", getAllCategories);

router.patch("/:id", verifyJWT, isAdmin, updateCategory);

router.delete("/:id", verifyJWT, isAdmin, deleteCategory);

export default router;