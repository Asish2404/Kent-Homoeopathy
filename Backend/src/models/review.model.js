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
            alias: "createdBy",
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
            alias: "title",
        },

        reviewDescription: {
            type: String,
            trim: true,
            alias: "comment",
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
            alias: "images",
            validate: {
                validator: (values) => Array.isArray(values),
                message: "Review images must be an array",
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

        helpfulVotes: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },

        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected", "Hidden"],
            default: "Pending",
            required: true,
            trim: true,
            index: true,
        },

        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        moderatedDate: {
            type: Date,
            default: null,
        },

        moderationNotes: {
            type: String,
            trim: true,
        },

        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

reviewSchema.index({ user: 1, product: 1 }, { unique: true, partialFilterExpression: { product: { $exists: true, $ne: null } } });
reviewSchema.index({ user: 1, appointment: 1 }, { unique: true, partialFilterExpression: { appointment: { $exists: true, $ne: null } } });
reviewSchema.index({ product: 1, status: 1, createdAt: -1 });
reviewSchema.index({ doctor: 1, status: 1, createdAt: -1 });
reviewSchema.index({ rating: 1, status: 1 });
reviewSchema.index({ helpfulCount: -1, createdAt: -1 });

export const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
