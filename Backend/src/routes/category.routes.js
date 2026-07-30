import express from "express";
import {
    createCategory,
    getAllCategories
} from "../controllers/category.controller.js";

const router = express.Router();

router.post("/", createCategory);

router.get("/", getAllCategories);

export default router;