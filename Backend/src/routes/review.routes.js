import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

import {
    createReview,
    getReviews,
    getReviewById,
    updateReview,
    deleteReview,
    voteHelpful,
    reportReview,
    approveReview,
    rejectReview,
    hideReview,
} from "../controllers/review.controller.js";

const router = express.Router();

// Public
router.get("/", getReviews);
router.get("/:reviewId", getReviewById);

// Auth user
router.post("/", verifyJWT, createReview);
router.patch("/:reviewId", verifyJWT, updateReview);
router.delete("/:reviewId", verifyJWT, deleteReview);
router.patch("/:reviewId/helpful", verifyJWT, voteHelpful);
router.patch("/:reviewId/report", verifyJWT, reportReview);

// Admin moderation
router.patch("/:reviewId/approve", verifyJWT, isAdmin, approveReview);
router.patch("/:reviewId/reject", verifyJWT, isAdmin, rejectReview);
router.patch("/:reviewId/hide", verifyJWT, isAdmin, hideReview);

export default router;

