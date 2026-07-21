import mongoose from "mongoose";

const reportFileSchema = new mongoose.Schema(
    {
        originalFileName: {
            type: String,
            trim: true,
        },

        fileUrl: {
            type: String,
            required: true,
            trim: true,
        },

        thumbnailUrl: {
            type: String,
            trim: true,
        },

        fileSize: {
            type: Number,
            min: 0,
        },

        fileFormat: {
            type: String,
            trim: true,
        },

        publicId: {
            type: String,
            trim: true,
        },
    },
    { _id: false }
);

const medicalReportSchema = new mongoose.Schema(
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
            default: null,
            index: true,
        },

        appointment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Appointment",
            default: null,
            index: true,
        },

        prescription: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Prescription",
            default: null,
            index: true,
        },

        reportNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        reportName: {
            type: String,
            required: true,
            trim: true,
        },

        reportType: {
            type: String,
            enum: [
                "Blood Test",
                "Urine Test",
                "X-Ray",
                "MRI",
                "CT Scan",
                "ECG",
                "Ultrasound",
                "Prescription",
                "Previous Medical Record",
                "Other",
            ],
            required: true,
            trim: true,
            index: true,
        },

        description: {
            type: String,
            trim: true,
        },

        generatedDate: {
            type: Date,
            required: true,
            default: Date.now,
        },

        files: {
            type: [reportFileSchema],
            default: [],
            validate: {
                validator: (values) => Array.isArray(values),
                message: "Files must be an array",
            },
        },

        status: {
            type: String,
            enum: ["Pending Review", "Reviewed", "Approved", "Rejected", "Archived"],
            default: "Pending Review",
            required: true,
            trim: true,
        },

        visibleToDoctor: {
            type: Boolean,
            default: true,
        },

        visibleToPatient: {
            type: Boolean,
            default: true,
        },

        visibleToAdmin: {
            type: Boolean,
            default: true,
        },

        patientNotes: {
            type: String,
            trim: true,
        },

        doctorNotes: {
            type: String,
            trim: true,
        },

        adminNotes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Search-friendly indexes for patient history, clinical review, and admin reporting.
medicalReportSchema.index({ generatedDate: 1 });

export const MedicalReport = mongoose.model("MedicalReport", medicalReportSchema);
