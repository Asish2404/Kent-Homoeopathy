import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
            index: true,
        },

        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            default: null,
            index: true,
        },

        prescription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Prescription",
            default: null,
        },

        patientName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
        },

        phoneNumber: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{10}$/, "Phone number must contain exactly 10 digits"],
        },

        age: {
            type: Number,
            required: true,
            min: [0, "Age must be a positive number"],
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"],
            required: true,
            trim: true,
        },

        consultationType: {
            type: String,
            enum: ["Online", "Offline", "Video"],
            default: "Offline",
            required: true,
            trim: true,
        },

        appointmentNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        appointmentDate: {
            type: Date,
            required: true,
        },

        appointmentTime: {
            type: String,
            required: true,
            trim: true,
            match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Appointment time must be in HH:MM format"],
        },

        duration: {
            type: Number,
            required: true,
            min: [1, "Duration must be at least 1 minute"],
        },

        reasonForVisit: {
            type: String,
            required: true,
            trim: true,
        },

        symptoms: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            enum: ["Pending", "Confirmed", "Completed", "Cancelled", "No Show", "Rescheduled"],
            default: "Pending",
            required: true,
            trim: true,
            index: true,
        },

        consultationFee: {
            type: Number,
            required: true,
            min: [0.01, "Consultation fee must be greater than zero"],
        },

        paymentRequired: {
            type: Boolean,
            default: true,
        },

        paymentStatus: {
            type: String,
            enum: ["Pending", "Paid", "Failed", "Refunded", "Not Required"],
            default: "Pending",
            trim: true,
        },

        meetingLink: {
            type: String,
            trim: true,
        },

        meetingId: {
            type: String,
            trim: true,
        },

        meetingPassword: {
            type: String,
            trim: true,
        },

        patientNotes: {
            type: String,
            trim: true,
        },

        doctorNotes: {
            type: String,
            trim: true,
        },

        followUpRequired: {
            type: Boolean,
            default: false,
        },

        followUpDate: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Search-friendly indexes for doctor schedules, patient history, and appointment lifecycle queries.
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ doctor: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ appointmentNumber: 1 });

export const Appointment = mongoose.model("Appointment", appointmentSchema);
