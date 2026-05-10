import mongoose from "mongoose";

const AppointmentBookingSchema = new mongoose.Schema(
    {
        user_name: { type:mongoose.Schema.Types.ObjectId, ref: "User", required: true, required: true },
        email: { type:mongoose.Schema.Types.ObjectId, ref: "User", required: true, lowercase: true },
        phone: { type:mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        address: { type:mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        doctor_name: { type: String},
        appointment_date: { type: Date, required: true },
        appointment_time: { type: String, required: true },
        status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
        mode: { type: String, enum: ["in-person", "online"], required: true },
        cause_visit: { type: String, required: true},
        test_records: { type: String },
        age: { type: Number, required: true },
        gender: { type:String, enum:["male", "female", "other"], required: true },
    }, 
    { timestamps: true }
);

export const AppointmentBooking = mongoose.model("AppointmentBooking", AppointmentBookingSchema);