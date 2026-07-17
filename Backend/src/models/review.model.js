import mongoose from "mongoose";

const reviewMediaSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },
    },
    { _id: false }
);

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            default: null,
            index: true,
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            default: null,
            index: true,
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

        reviewTitle: {
            type: String,
            trim: true,
        },

        reviewDescription: {
            type: String,
            trim: true,
        },

        rating: {
            type: Number,
            required: true,
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating must not exceed 5"],
            index: true,
        },

        reviewImages: {
            type: [reviewMediaSchema],
            default: [],
            validate: {
                validator: (values) => Array.isArray(values),
                message: "Review images must be an array",
            },
        },

        reviewVideos: {
            type: [reviewMediaSchema],
            default: [],
            validate: {
                validator: (values) => Array.isArray(values),
                message: "Review videos must be an array",
            },
        },

        verifiedPurchase: {
            type: Boolean,
            default: false,
        },

        verifiedConsultation: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Hidden", "Reported"],
            default: "Pending",
            required: true,
            trim: true,
            index: true,
        },

        helpfulCount: {
            type: Number,
            default: 0,
            min: [0, "Helpful count cannot be negative"],
        },

        reportCount: {
            type: Number,
            default: 0,
            min: [0, "Report count cannot be negative"],
        },

        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        moderatedDate: {
            type: Date,
        },

        moderationNotes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Search-friendly indexes for review analytics, moderation queues, and entity-specific listings.
reviewSchema.index({ user: 1 });
reviewSchema.index({ product: 1 });
reviewSchema.index({ doctor: 1 });
reviewSchema.index({ order: 1 });
reviewSchema.index({ appointment: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ status: 1 });

export const Review = mongoose.model("Review", reviewSchema);
