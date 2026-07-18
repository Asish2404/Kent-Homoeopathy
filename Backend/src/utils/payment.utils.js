import mongoose from "mongoose";

import { Order } from "../models/atanu.order.model.js";
import { AppointmentBooking } from "../models/atanu.appointmentbooking.model.js";
import { Appointment } from "../models/appointment.model.js";

export const validatePaymentForReference = async ({ paymentFor, referenceId }) => {
    if (!mongoose.isValidObjectId(referenceId)) {
        return { valid: false, message: "Invalid referenceId" };
    }

    if (paymentFor === "ORDER") {
        const order = await Order.findById(referenceId);
        if (!order) return { valid: false, message: "Order reference not found" };
        return { valid: true, referenceType: "ORDER" };
    }

    if (paymentFor === "APPOINTMENT") {
        // Appointments are stored in AppointmentBooking in this codebase, but payment.model references AppointmentBooking.
        const apptBooking = await AppointmentBooking.findById(referenceId);
        if (apptBooking) return { valid: true, referenceType: "APPOINTMENT" };

        // Fallback to support Appointment model if used elsewhere.
        const appt = await Appointment.findById(referenceId);
        if (appt) return { valid: true, referenceType: "APPOINTMENT" };

        return { valid: false, message: "Appointment reference not found" };
    }

    return { valid: false, message: "Invalid paymentFor value" };
};

export const updatePaymentSuccessForReference = async ({
    payment,
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
    referenceType,
}) => {
    // Update Payment first
    payment.gatewayPaymentId = razorpayPaymentId;
    payment.gatewayOrderId = razorpayOrderId;
    payment.gatewaySignature = razorpaySignature;
    payment.paymentStatus = "Paid";
    payment.paymentMethod = "Online Payment";

    if (!payment.paymentGateway) payment.paymentGateway = "Razorpay";

    // Update reference target status
    if (referenceType === "ORDER" && payment.order) {
        await Order.updateOne(
            { _id: payment.order },
            { $set: { paymentStatus: "Paid" } }
        );
    }

    if (referenceType === "APPOINTMENT" && payment.appointment) {
        // Primary: AppointmentBooking
        const updated = await AppointmentBooking.updateOne(
            { _id: payment.appointment },
            { $set: { paymentStatus: "Paid" } }
        );

        // Fallback if not present in AppointmentBooking
        if (updated.matchedCount === 0) {
            await Appointment.updateOne(
                { _id: payment.appointment },
                { $set: { paymentStatus: "Paid" } }
            );
        }
    }

    await payment.save();
    return payment;
};

