import express from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

import {
    createNotification,
    getMyNotifications,
    getNotificationById,
    markNotificationRead,
    markAllRead,
    deleteNotification,
} from "../controllers/notification.controller.js";

const router = express.Router();

router.post("/", verifyJWT, isAdmin, createNotification);

router.get("/", verifyJWT, getMyNotifications);
router.get("/:notificationId", verifyJWT, getNotificationById);

router.patch("/:notificationId/read", verifyJWT, markNotificationRead);
router.patch("/read-all", verifyJWT, markAllRead);

router.delete("/:notificationId", verifyJWT, deleteNotification);

export default router;

