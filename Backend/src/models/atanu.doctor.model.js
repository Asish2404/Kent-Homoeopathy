import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
    {
        doctor_name: {
            type: String,
            required: true,
            trim: true
        },

        specialization: {
            type: String,
            required: true
        },

        qualification: {
            type: String,
            required: true
        },

        experience: {
            type: Number,
            required: true
        },

        hospital: {
            type: String,
            required: true
        },

        consultation_fee: {
            type: Number,
            required: true
        },

        available_days: {
            type: String,
            required: true
        },

        available_time: {
            type: String,
            required: true
        },

        image: {
            type: String,
            required: true
        },

        about: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

export const Doctor = mongoose.model(
    "Doctor",
    doctorSchema
);