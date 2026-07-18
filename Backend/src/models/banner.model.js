import mongoose from "mongoose";

const { Schema } = mongoose;

// Banner model
// - Manages all banners displayed throughout the application.
// - Supports scheduled publishing, targeting/visibility flags,
//   analytics, SEO metadata, and CTA button configuration.

const bannerSchema = new Schema(
  {
    // --------------------
    // Banner Content
    // --------------------
    bannerTitle: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // Image URLs (stored as strings so any CDN provider can be used)
    desktopImageUrl: {
      type: String,
      required: true,
      trim: true,
    },

    tabletImageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    mobileImageUrl: {
      type: String,
      trim: true,
      default: "",
    },

    thumbnailUrl: {
      type: String,
      trim: true,
      default: "",
    },

    altText: {
      type: String,
      trim: true,
      default: "",
    },

    // --------------------
    // CTA Button
    // --------------------
    buttonText: {
      type: String,
      trim: true,
      default: "",
    },

    buttonUrl: {
      type: String,
      trim: true,
      default: "",
    },

    openInNewTab: {
      type: Boolean,
      default: false,
    },

    // --------------------
    // Display Settings
    // --------------------
    bannerPosition: {
      type: String,
      enum: ["Hero", "Top", "Middle", "Bottom", "Sidebar", "Popup"],
      required: true,
    },

    bannerType: {
      type: String,
      enum: [
        "Promotion",
        "Offer",
        "Campaign",
        "Doctor",
        "Lab Test",
        "Medicine",
        "Announcement",
        "Emergency",
        "Information",
      ],
      required: true,
    },

    // --------------------
    // Visibility (store context)
    // --------------------
    showOnHome: { type: Boolean, default: false },
    showOnProducts: { type: Boolean, default: false },
    showOnLabTests: { type: Boolean, default: false },
    showOnConsultDoctor: { type: Boolean, default: false },
    showOnCart: { type: Boolean, default: false },
    showOnCheckout: { type: Boolean, default: false },
    showOnProfile: { type: Boolean, default: false },

    // --------------------
    // Display Schedule
    // --------------------
    startDate: { type: Date },
    endDate: { type: Date },

    // --------------------
    // Display Control
    // --------------------
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },

    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // --------------------
    // Target Audience
    // --------------------
    targetAudience: {
      type: String,
      enum: ["All Users", "Guests", "Customers", "Doctors", "Admins"],
      default: "All Users",
    },

    // --------------------
    // Analytics
    // --------------------
    totalViews: { type: Number, default: 0, min: 0 },
    totalClicks: { type: Number, default: 0, min: 0 },

    // CTR = totalClicks / totalViews
    // Stored for dashboard usage; application can keep it updated.
    ctr: { type: Number, default: 0, min: 0 },

    // --------------------
    // SEO
    // --------------------
    metaTitle: { type: String, trim: true, default: "" },
    metaDescription: { type: String, trim: true, default: "" },
    keywords: { type: String, trim: true, default: "" },

    // --------------------
    // Admin Details
    // --------------------
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    internalNotes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// --------------------
// Indexes (performance)
// --------------------
// Required by spec:
// - Banner Type
// - Banner Position
// - Is Active
// - Start Date
// - End Date
// - Sort Order
bannerSchema.index({ bannerType: 1 });
bannerSchema.index({ bannerPosition: 1 });
bannerSchema.index({ isActive: 1 });
bannerSchema.index({ startDate: 1 });
bannerSchema.index({ endDate: 1 });
bannerSchema.index({ sortOrder: 1 });

// --------------------
// Future-ready hooks/constraints (non-invasive)
// --------------------
// Ensure schedule integrity if both dates are provided.
// (No upload/business logic added; just schema-level guard.)
bannerSchema.pre("validate", function (next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    return next(
      new Error("Invalid schedule: endDate cannot be earlier than startDate")
    );
  }
  next();
});

export const Banner = mongoose.model("Banner", bannerSchema);




