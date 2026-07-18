import mongoose from "mongoose";

// Settings model
// - Stores global website configuration for brand, payments, shipping,
//   consultation, notifications/email preferences, SEO, and system toggles.
// - Intentionally schema-only (no business logic, controllers, routes, or integrations).

const { Schema } = mongoose;

const settingsSchema = new Schema(
  {
    // --------------------
    // Website
    // --------------------
    websiteName: { type: String, trim: true, default: "" },
    companyName: { type: String, trim: true, default: "" },
    tagline: { type: String, trim: true, default: "" },

    companyEmail: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address`,
      },
    },

    supportEmail: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address`,
      },
    },

    companyPhone: { type: String, trim: true, default: "" },
    supportPhone: { type: String, trim: true, default: "" },

    address: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
    postalCode: { type: String, trim: true, default: "" },

    // --------------------
    // Branding
    // --------------------
    logoUrl: { type: String, trim: true, default: "" },
    faviconUrl: { type: String, trim: true, default: "" },
    primaryColor: { type: String, trim: true, default: "" },
    secondaryColor: { type: String, trim: true, default: "" },

    // --------------------
    // Social links
    // --------------------
    facebook: { type: String, trim: true, default: "" },
    instagram: { type: String, trim: true, default: "" },
    linkedIn: { type: String, trim: true, default: "" },
    youtube: { type: String, trim: true, default: "" },
    twitterX: { type: String, trim: true, default: "" },

    // --------------------
    // Payments
    // --------------------
    enableCOD: { type: Boolean, default: false },
    enableOnlinePayment: { type: Boolean, default: true },
    defaultCurrency: { type: String, trim: true, default: "USD" },

    taxPercentage: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: "taxPercentage must be a positive number",
      },
    },

    // --------------------
    // Shipping
    // --------------------
    enableShipping: { type: Boolean, default: true },

    freeShippingLimit: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: "freeShippingLimit must be a positive number",
      },
    },

    defaultShippingCharge: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: "defaultShippingCharge must be a positive number",
      },
    },

    // --------------------
    // Consultation
    // --------------------
    enableDoctorConsultation: { type: Boolean, default: true },
    enableOnlineConsultation: { type: Boolean, default: true },
    enableOfflineConsultation: { type: Boolean, default: false },

    defaultConsultationFee: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          return v >= 0;
        },
        message: "defaultConsultationFee must be a positive number",
      },
    },

    // --------------------
    // SEO
    // --------------------
    metaTitle: { type: String, trim: true, default: "" },
    metaDescription: { type: String, trim: true, default: "" },
    metaKeywords: { type: String, trim: true, default: "" },

    googleAnalyticsId: { type: String, trim: true, default: "" },
    googleTagManagerId: { type: String, trim: true, default: "" },

    // --------------------
    // Email settings
    // --------------------
    supportEmailForEmail: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address`,
      },
    },

    noReplyEmail: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address`,
      },
    },

    // --------------------
    // System settings
    // --------------------
    maintenanceMode: { type: Boolean, default: false },
    registrationEnabled: { type: Boolean, default: true },
    loginEnabled: { type: Boolean, default: true },

    // --------------------
    // Admin preferences (future-ready placeholders)
    // --------------------
    // Keeping as flags/strings so admin dashboard can extend without schema migration.
    adminTheme: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// --------------------
// Indexes
// --------------------
settingsSchema.index({ maintenanceMode: 1 });
settingsSchema.index({ registrationEnabled: 1 });
settingsSchema.index({ loginEnabled: 1 });


export const Settings = mongoose.model("Settings", settingsSchema);

