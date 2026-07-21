import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
    {
        medicineName: {
            type: String,
            required: true,
            trim: true,
        },

        strength: {
            type: String,
            trim: true,
        },

        dosage: {
            type: String,
            required: true,
            trim: true,
        },

        morningDose: {
            type: Number,
            default: 0,
            min: 0,
        },

        afternoonDose: {
            type: Number,
            default: 0,
            min: 0,
        },

        nightDose: {
            type: Number,
            default: 0,
            min: 0,
        },

        duration: {
            type: String,
            required: true,
            trim: true,
        },

        instructions: {
            type: String,
            trim: true,
        },

        foodPreference: {
            type: String,
            enum: ["Before Food", "After Food", "Any Time"],
            default: "Any Time",
            trim: true,
        },
    },
    { _id: false }
);

const investigationSchema = new mongoose.Schema(
    {
        bloodTest: {
            type: String,
            trim: true,
        },

        urineTest: {
            type: String,
            trim: true,
        },

        xRay: {
            type: String,
            trim: true,
        },

        mri: {
            type: String,
            trim: true,
        },

        ctScan: {
            type: String,
            trim: true,
        },

        otherInvestigations: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const fileUrlSchema = new mongoose.Schema(
    {
        url: {
            type: String,
            required: true,
            trim: true,
        },

        publicId: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const prescriptionSchema = new mongoose.Schema(
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

        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            required: true,
            index: true,
        },

        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
            index: true,
        },

        prescriptionNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        generatedDate: {
            type: Date,
            required: true,
            default: Date.now,
        },

        chiefComplaint: {
            type: String,
            required: true,
            trim: true,
        },

        diagnosis: {
            type: String,
            required: true,
            trim: true,
        },

        clinicalNotes: {
            type: String,
            trim: true,
        },

        advice: {
            type: String,
            trim: true,
        },

        medicines: {
            type: [medicineSchema],
            default: [],
            validate: {
                validator: (values) => Array.isArray(values),
                message: "Medicines must be an array",
            },
        },

        investigations: {
            type: investigationSchema,
            default: undefined,
        },

        followUpRequired: {
            type: Boolean,
            default: false,
        },

        followUpDate: {
            type: Date,
        },

        prescriptionPdfUrl: {
            type: String,
            trim: true,
        },

        doctorSignatureUrl: {
            type: String,
            trim: true,
        },

        uploadedMedicalReports: {
            type: [fileUrlSchema],
            default: [],
        },

        status: {
            type: String,
            enum: ["Draft", "Generated", "Completed", "Cancelled"],
            default: "Generated",
            required: true,
            trim: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Search-friendly indexes for patient history, prescription management, and admin analytics.
prescriptionSchema.index({ generatedDate: 1 });

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
