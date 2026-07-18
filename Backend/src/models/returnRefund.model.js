import mongoose from "mongoose";

// Return & Refund model
// - Stores customer return requests and refund records.
// - Designed to support partial refunds, admin approval workflow, and return pickup scheduling
//   without adding any business/payment gateway logic in this schema.

const { Schema } = mongoose;

const returnRefundSchema = new Schema(
  {
    // --------------------
    // References
    // --------------------
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      default: null,
    },

    shipment: {
      type: Schema.Types.ObjectId,
      ref: "Shipment",
      default: null,
    },

    // --------------------
    // Return Details
    // --------------------
    returnNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    returnType: {
      type: String,
      required: true,
      enum: ["Return", "Replacement", "Refund Only", "Exchange"],
    },

    reason: {
      type: String,
      required: true,
      enum: [
        "Wrong Product",
        "Damaged Product",
        "Expired Product",
        "Missing Item",
        "Quality Issue",
        "Changed Mind",
        "Order Cancelled",
        "Other",
      ],
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    customerImages: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr);
        },
        message: "customerImages must be an array of URLs",
      },
    },

    requestedDate: {
      type: Date,
      required: true,
      default: () => new Date(),
    },

    // --------------------
    // Return Status
    // --------------------
    returnStatus: {
      type: String,
      required: true,
      enum: [
        "Requested",
        "Approved",
        "Rejected",
        "Pickup Scheduled",
        "Picked Up",
        "Received",
        "Completed",
        "Cancelled",
      ],
      default: "Requested",
      index: true,
    },

    // Return pickup scheduling (future ready)
    pickupScheduledDate: {
      type: Date,
      default: null,
    },

    pickedUpDate: {
      type: Date,
      default: null,
    },

    receivedDate: {
      type: Date,
      default: null,
    },

    completedDate: {
      type: Date,
      default: null,
    },

    cancelledDate: {
      type: Date,
      default: null,
    },

    // --------------------
    // Refund Details
    // --------------------
    refundAmount: {
      type: Number,
      required: true,
      default: 0,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: "refundAmount must be a positive number",
      },
    },

    refundMethod: {
      type: String,
      trim: true,
      default: "",
    },

    refundTransactionId: {
      type: String,
      trim: true,
      default: "",
    },

    refundStatus: {
      type: String,
      required: true,
      enum: ["Pending", "Approved", "Rejected", "Processing", "Completed", "Cancelled"],
      default: "Pending",
      index: true,
    },

    refundDate: {
      type: Date,
      default: null,
    },

    // --------------------
    // Admin Details
    // --------------------
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewNotes: {
      type: String,
      trim: true,
      default: "",
    },

    internalNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

// --------------------
// Indexes (performance)
// --------------------
returnRefundSchema.index({ returnNumber: 1 });
returnRefundSchema.index({ order: 1 });
returnRefundSchema.index({ user: 1 });
returnRefundSchema.index({ returnStatus: 1 });
returnRefundSchema.index({ refundStatus: 1 });
returnRefundSchema.index({ requestedDate: -1 });

export const ReturnRefund = mongoose.model("ReturnRefund", returnRefundSchema);

