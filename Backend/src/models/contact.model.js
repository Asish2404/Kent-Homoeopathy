import mongoose from "mongoose";

// Contact & Support model
// - Stores customer inquiries, support tickets, complaints, feedback, and business enquiries.
// - Designed to be compatible with an optional User reference (guest-friendly).
// - Supports assignment and resolution workflow (admin/support team).

const { Schema } = mongoose;

const contactSchema = new Schema(
  {
    // --------------------
    // Customer Details
    // --------------------
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          // RFC-like simplified email pattern
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address`,
      },
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      trim: true,
      default: "",
    },

    // Optional relationship for authenticated users.
    // Guests can still create contacts without a user.
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // --------------------
    // Contact Details
    // --------------------
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    attachmentUrl: {
      type: String,
      trim: true,
      default: "",
    },

    // --------------------
    // Inquiry Type
    // --------------------
    inquiryType: {
      type: String,
      required: true,
      enum: [
        "General Inquiry",
        "Support",
        "Medicine",
        "Doctor Consultation",
        "Appointment Inquiry",
        "Lab Test Inquiry",
        "Complaint",
        "Feedback",
        "Business Partnership",
        "Other",
      ],
    },

    // --------------------
    // Priority & Status
    // --------------------
    priority: {
      type: String,
      required: true,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    status: {
      type: String,
      required: true,
      enum: ["Open", "In Progress", "Resolved", "Closed", "Rejected"],
      default: "Open",
    },

    // --------------------
    // Assignment
    // --------------------
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    assignedDate: {
      type: Date,
      default: null,
    },

    // --------------------
    // Resolution
    // --------------------
    resolutionNotes: {
      type: String,
      trim: true,
      default: "",
    },

    resolvedDate: {
      type: Date,
      default: null,
    },

    closedDate: {
      type: Date,
      default: null,
    },

    // --------------------
    // Admin Notes
    // --------------------
    internalNotes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// --------------------
// Indexes (performance)
// --------------------
// Required by spec:
// - Email
// - Phone Number
// - Inquiry Type
// - Priority
// - Status
// - Created At (timestamps already creates createdAt, we still add an index)
contactSchema.index({ email: 1 });
contactSchema.index({ phoneNumber: 1 });
contactSchema.index({ inquiryType: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ createdAt: -1 });

// --------------------
// Cross-field safety constraints (schema-only)
// --------------------
// Ensure resolution lifecycle is logically consistent when dates are set.
contactSchema.pre("validate", function (next) {
  if (this.assignedDate && this.createdAt && this.assignedDate < this.createdAt) {
    return next(
      new Error("Invalid assignment: assignedDate cannot be earlier than createdAt")
    );
  }

  if (this.resolvedDate && this.closedDate && this.closedDate < this.resolvedDate) {
    return next(
      new Error("Invalid resolution: closedDate cannot be earlier than resolvedDate")
    );
  }

  next();
});

export const Contact = mongoose.model("Contact", contactSchema);

