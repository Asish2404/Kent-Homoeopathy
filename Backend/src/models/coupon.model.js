import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
    {
        couponCode: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
            index: true,
        },

        couponName: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        discountType: {
            type: String,
            enum: ["Flat", "Percentage", "Free Shipping"],
            required: true,
            trim: true,
        },

        discountValue: {
            type: Number,
            required: true,
            min: [0, "Discount value must be positive"],
        },

        maximumDiscountAmount: {
            type: Number,
            default: 0,
            min: [0, "Maximum discount amount cannot be negative"],
        },

        minimumOrderValue: {
            type: Number,
            default: 0,
            min: [0, "Minimum order value cannot be negative"],
        },

        startDate: {
            type: Date,
            required: true,
        },

        expiryDate: {
            type: Date,
            required: true,
            validate: {
                validator: function (value) {
                    if (!value || !this.startDate) {
                        return true;
                    }

                    return value > this.startDate;
                },
                message: "Expiry date must be greater than start date",
            },
        },

        totalUsageLimit: {
            type: Number,
            default: 0,
            min: [0, "Total usage limit cannot be negative"],
        },

        usagePerUser: {
            type: Number,
            default: 1,
            min: [1, "Usage per user must be at least 1"],
        },

        currentUsageCount: {
            type: Number,
            default: 0,
            min: [0, "Current usage count cannot be negative"],
        },

        applicableCategories: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Category",
            default: [],
        },

        applicableProducts: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Product",
            default: [],
        },

        applicableUsers: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "User",
            default: [],
        },

        applicableOrderTypes: {
            type: [String],
            enum: ["Medicine Orders", "Doctor Consultation"],
            default: [],
        },

        excludedProducts: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Product",
            default: [],
        },

        excludedCategories: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Category",
            default: [],
        },

        status: {
            type: String,
            enum: ["Active", "Inactive", "Expired", "Disabled"],
            default: "Active",
            required: true,
            trim: true,
            index: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        updatedBy: {
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

// Search-friendly indexes for promotion management, checkout evaluation, and admin reporting.
couponSchema.index({ startDate: 1 });
couponSchema.index({ expiryDate: 1 });

export const Coupon = mongoose.model("Coupon", couponSchema);
