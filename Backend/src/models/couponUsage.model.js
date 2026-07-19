import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema(
  {
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
      index: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Optional linkage when checkout succeeds.
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    // Used for reservation tracking.
    reservationId: {
      type: String,
      default: null,
      index: true,
    },

    // Reservation/App lifecycle.
    status: {
      type: String,
      enum: ["Reserved", "Applied", "Cancelled", "Expired"],
      default: "Reserved",
      index: true,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },

    appliedAt: {
      type: Date,
      default: null,
    },

    reservedAt: {
      type: Date,
      default: Date.now,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

couponUsageSchema.index({ coupon: 1, user: 1, status: 1 });

export const CouponUsage = mongoose.model("CouponUsage", couponUsageSchema);

