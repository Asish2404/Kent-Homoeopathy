import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema(
    {
        startTime: {
            type: String,
            required: true,
            trim: true,
            match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must be in HH:MM format"],
        },

        endTime: {
            type: String,
            required: true,
            trim: true,
            match: [/^([01]\d|2[0-3]):[0-5]\d$/, "End time must be in HH:MM format"],
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

const doctorSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
            index: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        gender: {
            type: String,
            enum: ["male", "female", "other"],
            required: true,
            trim: true,
        },

        dateOfBirth: {
            type: Date,
            required: true,
            validate: {
                validator: (value) => value instanceof Date && !Number.isNaN(value.getTime()) && value <= new Date(),
                message: "Date of birth must be a valid date in the past",
            },
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

        profileImage: {
            type: String,
            trim: true,
        },

        registrationNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            uppercase: true,
        },

        qualification: {
            type: String,
            required: true,
            trim: true,
        },

        specialization: {
            type: String,
            required: true,
            trim: true,
        },

        experienceYears: {
            type: Number,
            required: true,
            min: [0, "Experience must be a positive number"],
        },

        hospitalClinicName: {
            type: String,
            required: true,
            trim: true,
        },

        clinicAddress: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            index: true,
        },

        state: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
        },

        postalCode: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{6}$/, "Postal code must contain exactly 6 digits"],
        },

        country: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            default: "INDIA",
        },

        latitude: {
            type: Number,
        },

        longitude: {
            type: Number,
        },

        languagesKnown: {
            type: [String],
            default: [],
            set: (values) => Array.isArray(values) ? values.map((value) => String(value).trim()).filter(Boolean) : [],
        },

        biography: {
            type: String,
            required: true,
            trim: true,
        },

        consultationFee: {
            type: Number,
            required: true,
            min: [0.01, "Consultation fee must be greater than zero"],
        },

        onlineConsultationFee: {
            type: Number,
            min: [0.01, "Online consultation fee must be greater than zero"],
        },

        offlineConsultationFee: {
            type: Number,
            min: [0.01, "Offline consultation fee must be greater than zero"],
        },

        videoConsultationFee: {
            type: Number,
            min: [0.01, "Video consultation fee must be greater than zero"],
        },

        availableDays: {
            type: [String],
            default: [],
            set: (values) => Array.isArray(values) ? values.map((value) => String(value).trim()).filter(Boolean) : [],
        },

        availableTimeSlots: {
            type: [timeSlotSchema],
            default: [],
        },

        slotDuration: {
            type: Number,
            required: true,
            min: [1, "Slot duration must be at least 1 minute"],
        },

        maximumAppointmentsPerDay: {
            type: Number,
            required: true,
            min: [1, "Maximum appointments per day must be at least 1"],
        },

        status: {
            type: String,
            enum: ["Available", "Busy", "On Leave", "Inactive"],
            default: "Available",
            required: true,
            trim: true,
            index: true,
        },

        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },

        totalReviews: {
            type: Number,
            default: 0,
            min: 0,
        },

        totalPatientsTreated: {
            type: Number,
            default: 0,
            min: 0,
        },

        website: {
            type: String,
            trim: true,
        },

        linkedIn: {
            type: String,
            trim: true,
        },

        facebook: {
            type: String,
            trim: true,
        },

        instagram: {
            type: String,
            trim: true,
        },

        medicalRegistrationCertificate: {
            type: fileUrlSchema,
            default: undefined,
        },

        degreeCertificates: {
            type: [fileUrlSchema],
            default: [],
        },

        identityProof: {
            type: fileUrlSchema,
            default: undefined,
        },
    },
    {
        timestamps: true,
    }
);



export const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

