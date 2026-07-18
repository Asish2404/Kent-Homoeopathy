import Razorpay from "razorpay";

import mongoose from "mongoose";

import { Payment } from "../models/payment.model.js";
import { validatePaymentForReference, updatePaymentSuccessForReference } from "../utils/payment.utils.js";
import { verifyRazorpaySignature } from "../utils/razorpay.utils.js";


const getRazorpayClient = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error("Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
    }

    return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const getPagination = (query) => {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

const createRazorpayOrder = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Invalid user" });
        }

        const {
            amount,
            currency,
            paymentFor,
            referenceId,
        } = req.body || {};

        const numericAmount = Number(amount);
        const safeCurrency = (currency || "INR").toString().toUpperCase().trim();

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ success: false, message: "Amount must be greater than 0" });
        }

        if (!paymentFor || !referenceId) {
            return res.status(400).json({ success: false, message: "paymentFor and referenceId are required" });
        }

        const validated = await validatePaymentForReference({ paymentFor, referenceId });
        if (!validated.valid) {
            return res.status(404).json({ success: false, message: validated.message });
        }

        const razorpay = getRazorpayClient();

        const options = {
            amount: Math.round(numericAmount * 100),
            currency: safeCurrency,
            receipt: `rcpt_${userId}_${Date.now()}`,
            payment_capture: 1,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Store pending payment
        const paymentDoc = await Payment.create({
            user: userId,
            // keep both refs in schema for flexibility
            order: paymentFor === "ORDER" ? referenceId : null,
            appointment:
                paymentFor === "APPOINTMENT" ? referenceId : null,

            paymentType: paymentFor === "ORDER" ? "Medicine Purchase" : "Doctor Consultation",
            paymentMethod: "Online Payment",
            paymentGateway: "Razorpay",
            paymentStatus: "Pending",

            amount: numericAmount,
            currency: safeCurrency,

            gatewayOrderId: razorpayOrder.id,
            // other signature/payment ids are set on verify
            customerName: req.user?.name || "Customer",
            customerEmail: req.user?.email || "",
            customerPhone: req.user?.phone || "",
        });

        return res.status(201).json({
            success: true,
            orderId: razorpayOrder.id,
            amount: paymentDoc.amount,
            currency: paymentDoc.currency,
            key: process.env.RAZORPAY_KEY_ID,
            paymentId: paymentDoc._id,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create Razorpay order",
        });
    }
};

const verifyRazorpay = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Invalid user" });
        }

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body || {};

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: "Missing required Razorpay fields" });
        }

        const signatureValid = verifyRazorpaySignature({
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            keySecret: process.env.RAZORPAY_KEY_SECRET,
        });

        if (!signatureValid) {
            return res.status(400).json({ success: false, message: "Invalid Razorpay signature" });
        }

        const payment = await Payment.findOne({
            user: userId,
            gatewayOrderId: razorpay_order_id,
            paymentGateway: "Razorpay",
        });

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment record not found" });
        }

        // Prevent duplicate verification
        if (payment.paymentStatus === "Paid") {
            return res.status(200).json({ success: true, message: "Payment already verified", payment });
        }

        // Determine reference type and update target
        const referenceType = payment.order ? "ORDER" : payment.appointment ? "APPOINTMENT" : null;

        const updated = await updatePaymentSuccessForReference({
            payment,
            razorpayPaymentId: razorpay_payment_id,
            razorpayOrderId: razorpay_order_id,
            razorpaySignature: razorpay_signature,
            referenceType,
        });

        return res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            payment: updated,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to verify Razorpay payment",
        });
    }
};

const getPaymentHistory = async (req, res) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(401).json({ success: false, message: "Invalid user" });
        }

        const { page, limit, skip } = getPagination(req.query);

        const query = { user: userId };

        const [payments, totalCount] = await Promise.all([
            Payment.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Payment.countDocuments(query),
        ]);

        return res.status(200).json({
            success: true,
            payments,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch payment history",
        });
    }
};

const getPaymentById = async (req, res) => {
    try {
        const { paymentId } = req.params;

        if (!mongoose.isValidObjectId(paymentId)) {
            return res.status(400).json({ success: false, message: "Invalid paymentId" });
        }


        const userId = req.user?._id;
        const isAdminUser = req.user?.role === "admin";

        const paymentQuery = isAdminUser ? { _id: paymentId } : { _id: paymentId, user: userId };

        const payment = await Payment.findOne(paymentQuery);

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        return res.status(200).json({ success: true, payment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Failed to fetch payment" });
    }
};

const refundPayment = async (req, res) => {
    try {
        const { paymentId, refundAmount, refundReason } = req.body || {};

        if (!mongoose.isValidObjectId(paymentId)) {
            return res.status(400).json({ success: false, message: "Invalid paymentId" });
        }


        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        if (payment.paymentGateway !== "Razorpay") {
            return res.status(400).json({ success: false, message: "Refund supported only for Razorpay payments" });
        }

        if (!payment.gatewayPaymentId) {
            return res.status(400).json({ success: false, message: "Payment ID missing for refund" });
        }

        const numericRefundAmount = refundAmount !== undefined ? Number(refundAmount) : payment.amount;

        if (!Number.isFinite(numericRefundAmount) || numericRefundAmount <= 0) {
            return res.status(400).json({ success: false, message: "refundAmount must be > 0" });
        }

        const razorpay = getRazorpayClient();

        const refund = await razorpay.payments.refund(payment.gatewayPaymentId, {
            amount: Math.round(numericRefundAmount * 100),
            speed: "normal",
            notes: refundReason ? { reason: refundReason } : {},
        });

        payment.paymentStatus = "Refunded";
        payment.refund = {
            refundId: refund.id,
            refundAmount: numericRefundAmount,
            refundStatus: refund.status,
            refundDate: new Date(refund.created_at * 1000 || Date.now()),
            refundReason: refundReason || "",
        };

        payment.paymentGateway = payment.paymentGateway;
        await payment.save();

        return res.status(200).json({ success: true, message: "Refund successful", payment });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Refund failed" });
    }
};

export {
    createRazorpayOrder,
    verifyRazorpay,
    getPaymentHistory,
    getPaymentById,
    refundPayment,
};

