import mongoose from "mongoose";

const refundSchema = new mongoose.Schema(
    {
        refundId: {
            type: String,
            trim: true,
        },

        refundAmount: {
            type: Number,
            min: 0,
        },

        refundStatus: {
            type: String,
            trim: true,
        },

        refundDate: {
            type: Date,
        },

        refundReason: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const failureSchema = new mongoose.Schema(
    {
        failureCode: {
            type: String,
            trim: true,
        },

        failureReason: {
            type: String,
            trim: true,
        },

        retryCount: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { _id: false }
);

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
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
            ref: "AppointmentBooking",
            default: null,
            index: true,
        },

        paymentType: {
            type: String,
            enum: ["Medicine Purchase", "Doctor Consultation", "Lab Test", "Membership"],
            default: "Medicine Purchase",
            required: true,
            trim: true,
            index: true,
        },

        paymentMethod: {
            type: String,
            enum: ["Cash On Delivery", "Online Payment"],
            default: "Online Payment",
            required: true,
            trim: true,
        },

        paymentGateway: {
            type: String,
            enum: ["None", "Razorpay", "Cashfree", "PhonePe", "PayU", "Stripe", "Manual"],
            default: "None",
            trim: true,
            index: true,
        },

        paymentStatus: {
            type: String,
            enum: [
                "Pending",
                "Created",
                "Authorized",
                "Captured",
                "Paid",
                "Failed",
                "Cancelled",
                "Refunded",
                "Partially Refunded",
            ],
            default: "Pending",
            required: true,
            trim: true,
            index: true,
        },

        amount: {
            type: Number,
            required: true,
            min: [0.01, "Amount must be greater than zero"],
        },

        currency: {
            type: String,
            default: "INR",
            uppercase: true,
            trim: true,
        },

        gatewayOrderId: {
            type: String,
            trim: true,
        },

        gatewayPaymentId: {
            type: String,
            trim: true,
        },

        gatewaySignature: {
            type: String,
            trim: true,
        },

        transactionId: {
            type: String,
            trim: true,
            unique: true,
            sparse: true,
            index: true,
        },

        receiptId: {
            type: String,
            trim: true,
        },

        invoiceNumber: {
            type: String,
            trim: true,
        },

        customerName: {
            type: String,
            required: true,
            trim: true,
        },

        customerEmail: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
        },

        customerPhone: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{10}$/, "Customer phone must contain exactly 10 digits"],
        },

        consultationMode: {
            type: String,
            enum: ["Online Consultation", "Offline Consultation", "Video Consultation", "Telemedicine"],
            trim: true,
        },

        refund: {
            type: refundSchema,
            default: undefined,
        },

        failure: {
            type: failureSchema,
            default: undefined,
        },

        gatewayResponse: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    {
        timestamps: true,
    }
);

// Lookup indexes for transaction history, payment reconciliation, and admin filters.
export const Payment = mongoose.model("Payment", paymentSchema);
