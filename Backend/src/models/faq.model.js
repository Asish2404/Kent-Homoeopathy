import mongoose from "mongoose";

// FAQ model
// - Stores frequently asked questions displayed across the website.
// - Supports per-category display, priority ordering, active/inactive control,
//   and basic SEO/analytics fields.

const { Schema } = mongoose;

const faqSchema = new Schema(
  {
    // --------------------
    // Core FAQ Content
    // --------------------
    question: {
      type: String,
      required: true,
      trim: true,
    },

    answer: {
      type: String,
      required: true,
      trim: true,
    },

    shortDescription: {
      type: String,
      trim: true,
      default: "",
    },

    // --------------------
    // Category
    // --------------------
    category: {
      type: String,
      required: true,
      enum: [
        "General",
        "Medicines",
        "Doctor Consultation",
        "Lab Tests",
        "Orders",
        "Payments",
        "Shipping",
        "Account",
        "Prescription",
        "Technical",
        "Other",
      ],
    },

    // --------------------
    // Display Settings
    // --------------------
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // --------------------
    // SEO
    // --------------------
    keywords: {
      type: String,
      trim: true,
      default: "",
    },

    metaTitle: {
      type: String,
      trim: true,
      default: "",
    },

    metaDescription: {
      type: String,
      trim: true,
      default: "",
    },

    // --------------------
    // Analytics
    // --------------------
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    helpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    notHelpfulCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // --------------------
    // Admin Details
    // --------------------
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
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
// Required by spec:
// - Category
// - Is Active
// - Priority
// - Display Order
// - Created At (timestamps already creates createdAt; we index it)
faqSchema.index({ category: 1 });
faqSchema.index({ isActive: 1 });
faqSchema.index({ priority: 1 });
faqSchema.index({ displayOrder: 1 });
faqSchema.index({ createdAt: -1 });

export const Faq = mongoose.model("Faq", faqSchema);

