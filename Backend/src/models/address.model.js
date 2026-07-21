import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        phoneNumber: {
            type: String,
            required: true,
            trim: true,
            match: [/^\d{10}$/, "Phone number must contain exactly 10 digits"],
        },

        alternatePhoneNumber: {
            type: String,
            trim: true,
            match: [/^\d{10}$/, "Alternate phone number must contain exactly 10 digits"],
        },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email address"],
        },

        addressLine1: {
            type: String,
            required: true,
            trim: true,
        },

        addressLine2: {
            type: String,
            trim: true,
        },

        landmark: {
            type: String,
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
            index: true,
        },

        district: {
            type: String,
            required: true,
            trim: true,
            uppercase: true,
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
            index: true,
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

        addressType: {
            type: String,
            enum: ["Home", "Office", "Other"],
            default: "Home",
        },

        isDefault: {
            type: Boolean,
            default: false,
            index: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);


export const Address = mongoose.model("Address", addressSchema);
