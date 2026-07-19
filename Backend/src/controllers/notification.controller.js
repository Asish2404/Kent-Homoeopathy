import mongoose from "mongoose";

import { Notification } from "../models/notification.model.js";
import { User } from "../models/atanu.user.model.js";

import {
    createInAppNotification,
    getNotificationQuery,
    getUnreadCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    softDeleteNotification,
} from "../utils/notification.utils.js";

const getPagination = (query) => {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const pickNotificationFilters = (req) => {
    const { type, priority, isRead, unreadOnly } = req.query || {};
    return {
        type,
        priority,
        readStatus: isRead,
        unreadOnly,
    };
};

export const createNotification = async (req, res) => {
    try {
        const adminId = req.user?._id;

        const {
            receiver,
            sender = null,
            notificationType,
            priority,
            title,
            message,
            shortDescription = null,
            actionUrl = null,
            actionLabel = null,
            redirectScreen = null,
        } = req.body || {};

        if (!adminId) {
            return res.status(401).json({ success: false, message: "Invalid admin" });
        }

        if (!mongoose.isValidObjectId(receiver)) {
            return res.status(400).json({ success: false, message: "Invalid receiver" });
        }

        const userExists = await User.findById(receiver);
        if (!userExists) {
            return res.status(404).json({ success: false, message: "Recipient does not exist" });
        }

        if (!title || !message) {
            return res.status(400).json({
                success: false,
                message: "title and message are required",
            });
        }

        if (!priority) {
            return res.status(400).json({ success: false, message: "priority is required" });
        }

        const result = await createInAppNotification({
            receiver,
            sender,
            notificationType,
            priority,
            title,
            message,
            shortDescription,
            actionUrl,
            actionLabel,
            redirectScreen,
            createdBy: adminId,
            internalNotes: "Admin created",
        });

        if (!result.created) {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(201).json({
            success: true,
            message: "Notification created",
            notification: result.notification,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create notification",
        });
    }
};

export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Invalid user" });
        }

        const { page, limit, skip } = getPagination(req.query);
        const filters = pickNotificationFilters(req);

        const query = getNotificationQuery({
            userId,
            ...filters,
        });

        // By default exclude archived notifications from inbox
        query.status = { $ne: "Archived" };

        const [notifications, totalCount] = await Promise.all([
            Notification.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Notification.countDocuments(query),
        ]);

        const unreadCount = await getUnreadCount({ userId });

        return res.status(200).json({
            success: true,
            notifications,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
            },
            unreadCount,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch notifications",
        });
    }
};

export const getNotificationById = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ success: false, message: "Invalid user" });

        const { notificationId } = req.params;
        if (!mongoose.isValidObjectId(notificationId)) {
            return res.status(400).json({ success: false, message: "Invalid notificationId" });
        }

        const isAdmin = req.user?.role === "admin";
        const match = isAdmin ? { _id: notificationId } : { _id: notificationId, receiver: userId };

        const notification = await Notification.findOne(match);
        if (!notification) {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        if (!isAdmin && notification.status === "Archived") {
            return res.status(404).json({ success: false, message: "Notification not found" });
        }

        return res.status(200).json({ success: true, notification });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Failed to fetch" });
    }
};

export const markNotificationRead = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ success: false, message: "Invalid user" });

        const { notificationId } = req.params;
        const isAdminUser = req.user?.role === "admin";

        const result = await markNotificationAsRead({
            notificationId,
            userId,
            isAdminUser,
        });

        if (!result.updated) {
            return res.status(404).json({ success: false, message: result.message });
        }

        return res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification: result.notification,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Failed to mark read" });
    }
};

export const markAllRead = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ success: false, message: "Invalid user" });

        // Security: user can only mark their own.
        const result = await markAllNotificationsAsRead({
            userId,
            isAdminUser: false,
        });

        if (!result.updated) {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(200).json({
            success: true,
            message: "All notifications marked as read",
            modifiedCount: result.modifiedCount,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Failed to mark all read" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ success: false, message: "Invalid user" });

        const isAdminUser = req.user?.role === "admin";
        const { notificationId } = req.params;

        const result = await softDeleteNotification({
            notificationId,
            userId,
            isAdminUser,
        });

        if (!result.deleted) {
            return res.status(404).json({ success: false, message: result.message });
        }

        return res.status(200).json({
            success: true,
            message: "Notification deleted (soft)",
            notification: result.notification,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Failed to delete" });
    }
};

