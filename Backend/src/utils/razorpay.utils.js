import crypto from "crypto";

export const verifyRazorpaySignature = ({
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    keySecret,
}) => {
    if (!keySecret) {
        throw new Error("Missing RAZORPAY_KEY_SECRET");
    }

    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(`${razorpayOrderId}|${razorpayPaymentId}`);
    const expectedSignature = hmac.digest("hex");

    // Use timingSafeEqual for safer comparison
    const a = Buffer.from(expectedSignature, "utf8");
    const b = Buffer.from(razorpaySignature, "utf8");

    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
};

