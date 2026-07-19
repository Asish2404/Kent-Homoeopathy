import mongoose from "mongoose";

import { Notification } from "../models/notification.model.js";
import { User } from "../models/atanu.user.model.js";

const ALLOWED_TYPES = [
    "Order",
    "Payment",
    "Appointment",
    "Prescription",
    "Medical Report",
    "Inventory",
    "Coupon",
    "General Announcement",
];

const ALLOWED_PRIORITIES = ["Low", "Medium", "High", "Critical"];

export const isValidObjectId = (value) => mongoose.isValidObjectId(value);

export const assertValidNotificationType = (type) => {
    if (!type) return { valid: false, message: "notificationType is required" };
    if (!ALLOWED_TYPES.includes(type)) {
        return {
            valid: false,
            message: `Invalid notificationType. Allowed: ${ALLOWED_TYPES.join(", ")}`,
        };
    }

    return { valid: true };
};

export const assertValidPriority = (priority) => {
    if (!priority) return { valid: false, message: "priority is required" };
    if (!ALLOWED_PRIORITIES.includes(priority)) {
        return {
            valid: false,
            message: `Invalid priority. Allowed: ${ALLOWED_PRIORITIES.join(", ")}`,
        };
    }

    return { valid: true };
};

export const assertRecipientExists = async (recipientId) => {
    if (!isValidObjectId(recipientId)) {
        return { valid: false, message: "Invalid receiver" };
    }

    const user = await User.findById(recipientId);
    if (!user) return { valid: false, message: "Recipient does not exist" };

    return { valid: true, user };
};

export const buildBaseNotificationDoc = ({
    receiver,
    sender = null,
    notificationType,
    priority = "Medium",
    title,
    message,
    shortDescription = null,
    isRead = false,
    actionUrl = null,
    actionLabel = null,
    redirectScreen = null,
    order = null,
    appointment = null,
    payment = null,
    shipment = null,
    createdBy = null,
    internalNotes = null,
}) => {
    const now = new Date();

    return {
        receiver,
        sender,
        order,
        appointment,
        payment,
        shipment,
        title,
        message,
        shortDescription,
        notificationType,
        inApp: true,
        email: false,
        sms: false,
        pushNotification: false,
        whatsapp: false,
        status: "Pending",
        priority,
        actionUrl,
        actionLabel,
        redirectScreen,
        isRead,
        readAt: isRead ? now : null,
        createdBy,
        internalNotes,
    };
};

export const createInAppNotification = async ({
    receiver,
    sender = null,
    notificationType,
    priority,
    title,
    message,
    shortDescription,
    actionUrl,
    actionLabel,
    redirectScreen,
    order = null,
    appointment = null,
    payment = null,
    shipment = null,
    createdBy = null,
    internalNotes = null,
}) => {
    const typeCheck = assertValidNotificationType(notificationType);
    if (!typeCheck.valid) return { created: false, message: typeCheck.message };

    const prioCheck = assertValidPriority(priority);
    if (!prioCheck.valid) return { created: false, message: prioCheck.message };

    const recipientCheck = await assertRecipientExists(receiver);
    if (!recipientCheck.valid) return { created: false, message: recipientCheck.message };

    const doc = buildBaseNotificationDoc({
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
        order,
        appointment,
        payment,
        shipment,
        createdBy,
        internalNotes,
    });

    const created = await Notification.create(doc);
    return { created: true, notification: created };
};

export const getNotificationQuery = ({
    userId,
    type,
    priority,
    unreadOnly,
    readStatus,
}) => {
    const q = { receiver: userId };

    if (type) q.notificationType = type;
    if (priority) q.priority = priority;

    if (unreadOnly === "true" || unreadOnly === true) {
        q.isRead = false;
    }

    if (readStatus === "true") q.isRead = true;
    if (readStatus === "false") q.isRead = false;

    return q;
};

export const markNotificationAsRead = async ({ notificationId, userId, isAdminUser }) => {
    if (!isValidObjectId(notificationId)) {
        return { updated: false, message: "Invalid notificationId" };
    }

    const match = isAdminUser ? { _id: notificationId } : { _id: notificationId, receiver: userId };

    const notification = await Notification.findOne(match);
    if (!notification) {
        return { updated: false, message: "Notification not found" };
    }

    if (!notification.isRead) {
        notification.isRead = true;
        notification.status = "Read";
        notification.readAt = new Date();
        await notification.save();
    }

    return { updated: true, notification };
};

export const markAllNotificationsAsRead = async ({ userId, isAdminUser = false, targetReceiverId }) => {
    // Security: by default only user can mark their own.
    const receiverId = isAdminUser && targetReceiverId ? targetReceiverId : userId;

    if (!isValidObjectId(receiverId)) {
        return { updated: false, message: "Invalid receiver" };
    }

    const result = await Notification.updateMany(
        { receiver: receiverId, isRead: false },
        {
            $set: {
                isRead: true,
                status: "Read",
                readAt: new Date(),
            },
        }
    );

    return {
        updated: true,
        modifiedCount: result.modifiedCount ?? result.nModified ?? 0,
    };
};

export const softDeleteNotification = async ({ notificationId, userId, isAdminUser }) => {
    if (!isValidObjectId(notificationId)) {
        return { deleted: false, message: "Invalid notificationId" };
    }

    const match = isAdminUser ? { _id: notificationId } : { _id: notificationId, receiver: userId };

    const existing = await Notification.findOne(match);
    if (!existing) return { deleted: false, message: "Notification not found" };

    existing.status = "Archived";
    existing.internalNotes = existing.internalNotes;
    // Keep document but hide it logically; isRead left as-is.
    await existing.save();

    return { deleted: true, notification: existing };
};

export const getUnreadCount = async ({ userId }) => {
    const count = await Notification.countDocuments({ receiver: userId, isRead: false });
    return count;
};

// ---------------- Auto-notification helpers (reusable) ----------------
export const autoNotifyOrderPlaced = async ({ receiver, sender = null, orderId, priority = "High" }) => {
    return createInAppNotification({
        receiver,
        sender,
        notificationType: "Order",
        priority,
        order: orderId,
        title: "Order placed",
        message: "Your order has been successfully placed.",
        actionUrl: "/profile/orders",
        actionLabel: "View order",
        redirectScreen: "Orders",
        createdBy: sender,
        internalNotes: `Auto: Order placed (${orderId})`,
    });
};

export const autoNotifyOrderShipped = async ({ receiver, sender = null, orderId, priority = "Medium" }) => {
    return createInAppNotification({
        receiver,
        sender,
        notificationType: "Order",
        priority,
        order: orderId,
        title: "Order shipped",
        message: "Your order has been shipped.",
        actionUrl: "/profile/orders",
        actionLabel: "Track order",
        redirectScreen: "Orders",
        createdBy: sender,
        internalNotes: `Auto: Order shipped (${orderId})`,
    });
};

export const autoNotifyOrderDelivered = async ({ receiver, sender = null, orderId, priority = "Low" }) => {
    return createInAppNotification({
        receiver,
        sender,
        notificationType: "Order",
        priority,
        order: orderId,
        title: "Order delivered",
        message: "Your order has been delivered.",
        actionUrl: "/profile/orders",
        actionLabel: "View details",
        redirectScreen: "Orders",
        createdBy: sender,
        internalNotes: `Auto: Order delivered (${orderId})`,
    });
};

export const autoNotifyPaymentSuccessful = async ({ receiver, sender = null, paymentId = null, priority = "High" }) => {
    return createInAppNotification({
        receiver,
        sender,
        notificationType: "Payment",
        priority,
        payment: paymentId,
        title: "Payment successful",
        message: "Your payment was successful.",
        actionUrl: "/profile/orders",
        actionLabel: "View order",
        redirectScreen: "Orders",
        createdBy: sender,
        internalNotes: `Auto: Payment successful (${paymentId})`,
    });
};

export const autoNotifyPaymentFailed = async ({ receiver, sender = null, paymentId = null, priority = "Critical" }) => {
    return createInAppNotification({
        receiver,
        sender,
        notificationType: "Payment",
        priority,
        payment: paymentId,
        title: "Payment failed",
        message: "Your payment failed. Please try again.",
        actionUrl: "/payments",
        actionLabel: "Retry payment",
        redirectScreen: "Payment",
        createdBy: sender,
        internalNotes: `Auto: Payment failed (${paymentId})`,
    });
};

export const autoNotifyAppointmentBooked = async ({ receiver, sender = null, appointmentId = null, priority = "High" }) => {
    return createInAppNotification({
        receiver,
        sender,
        notificationType: "Appointment",
        priority,
        appointment: appointmentId,
        title: "Appointment booked",
        message: "Your appointment has been booked.",
        actionUrl: "/profile/appointments",
        actionLabel: "View appointment",
        redirectScreen: "Appointments",
        createdBy: sender,
        internalNotes: `Auto: Appointment booked (${appointmentId})`,
    });
};

export const autoNotifyAppointmentCancelled = async ({ receiver, sender = null, appointmentId = null, priority = "Medium" }) => {
    return createInAppNotification({
        receiver,
        sender,
        notificationType: "Appointment",
        priority,
        appointment: appointmentId,
        title: "Appointment cancelled",
        message: "Your appointment has been cancelled.",
        actionUrl: "/profile/appointments",
        actionLabel: "Reschedule",
        redirectScreen: "Appointments",
        createdBy: sender,
        internalNotes: `Auto: Appointment cancelled (${appointmentId})`,
    });
};

export const autoNotifyPrescriptionReady = async ({ receiver, sender = null, prescriptionId = null, priority = "High" }) => {
    return createInAppNotification({
        receiver,
        sender,
        notificationType: "Prescription",
        priority,
        // no prescription field in schema; kept for messages via internalNotes
        title: "Prescription ready",
        message: "Your prescription is ready. Please check your medical documents.",
        actionUrl: "/profile/prescriptions",
        actionLabel: "View prescription",
        redirectScreen: "Prescriptions",
        createdBy: sender,
        internalNotes: `Auto: Prescription ready (${prescriptionId})`,
    });
};

export const autoNotifyMedicalReportUploaded = async ({ receiver, sender = null, reportId = null, priority = "High" }) => {
    return createInAppNotification({
        receiver,
        sender,
        notificationType: "Medical Report",
        priority,
        title: "Medical report uploaded",
        message: "A new medical report has been uploaded.",
        actionUrl: "/profile/medical-reports",
        actionLabel: "View report",
        redirectScreen: "MedicalReports",
        createdBy: sender,
        internalNotes: `Auto: Medical report uploaded (${reportId})`,
    });
};

export const autoNotifyCouponAssigned = async ({ receiver, sender = null, couponId = null, priority = "Medium" }) => {
    return createInAppNotification({
        receiver,
        sender,
        notificationType: "Coupon",
        priority,
        title: "Coupon assigned",
        message: "A new coupon has been added to your account.",
        actionUrl: "/coupons",
        actionLabel: "View coupons",
        redirectScreen: "Coupons",
        createdBy: sender,
        internalNotes: `Auto: Coupon assigned (${couponId})`,
    });
};

export const autoNotifyInventoryLowStock = async ({
    receiver,
    sender = null,
    inventoryId = null,
    priority = "High",
    productName = "",
}) => {
    return createInAppNotification({
        receiver,
        sender,
        notificationType: "Inventory",
        priority,
        title: "Low stock alert",
        message: productName
            ? `"${productName}" is running low. Order soon to avoid stock-out.`
            : "An item you follow is running low in stock.",
        actionUrl: "/products",
        actionLabel: "Shop now",
        redirectScreen: "Products",
        createdBy: sender,
        internalNotes: `Auto: Inventory low stock (${inventoryId})`,
    });
};

export const autoNotifyGeneralAnnouncement = async ({
    receiver,
    sender = null,
    priority = "Medium",
    title = "Announcement",
    message = "",
}) => {
    return createInAppNotification({
        receiver,
        sender,
        notificationType: "General Announcement",
        priority,
        title,
        message,
        actionUrl: null,
        actionLabel: null,
        redirectScreen: null,
        createdBy: sender,
        internalNotes: `Auto: General announcement`,
    });
};

