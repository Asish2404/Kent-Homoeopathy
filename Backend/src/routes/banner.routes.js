import express from "express";
import { getActiveBanners } from "../controllers/banner.controller.js";

const router = express.Router();

// Public read-only endpoint for the homepage banner carousel.
router.get("/", getActiveBanners);

export default router;
