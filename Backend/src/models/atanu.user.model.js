import mongoose from "mongoose";
import { time } from "node:console";

const userSchema = new mongoose.Schema(
    {
        user_name:
        {
            type: String,
            required: true
        },
        email: { type: String, required: true, lowercase: true, unique: true },
        password: { type: String, required: true },
        confirm_password: { type: String, required: true },
        phone: { type: Number, required: true },
        address: { type: String, required: true },
    },
    { timestamps: true })

export const User = mongoose.model("User", userSchema)