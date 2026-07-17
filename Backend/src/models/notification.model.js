import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
            index: true,
        },

        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            default: null,
            index: true,
        },

        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            default: null,
            index: true,
        },

        shipment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Shipment",
            default: null,
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        shortDescription: {
            type: String,
            trim: true,
        },

        notificationType: {
            type: String,
            enum: [
                "Order",
                "Payment",
                "Appointment",
                "Prescription",
                "Shipment",
                "Inventory",
                "Review",
                "Coupon",
                "Promotion",
                "System",
                "Security",
            ],
            required: true,
            trim: true,
            index: true,
        },

        inApp: {
            type: Boolean,
            default: true,
        },

        email: {
            type: Boolean,
            default: false,
        },

        sms: {
            type: Boolean,
            default: false,
        },

        pushNotification: {
            type: Boolean,
            default: false,
        },

        whatsapp: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["Pending", "Sent", "Delivered", "Read", "Failed", "Archived"],
            default: "Pending",
            required: true,
            trim: true,
            index: true,
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Medium",
            required: true,
            trim: true,
            index: true,
        },

        actionUrl: {
            type: String,
            trim: true,
        },

        actionLabel: {
            type: String,
            trim: true,
        },

        redirectScreen: {
            type: String,
            trim: true,
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        readAt: {
            type: Date,
        },

        deviceType: {
            type: String,
            trim: true,
        },

        platform: {
            type: String,
            trim: true,
        },

        browser: {
            type: String,
            trim: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        internalNotes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Lookup indexes for inbox performance, notification analytics, and admin filtering.
notificationSchema.index({ receiver: 1 });
notificationSchema.index({ notificationType: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
