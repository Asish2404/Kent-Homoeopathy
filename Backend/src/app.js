import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import addressRoutes from "./routes/address.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import prescriptionRoutes from "./routes/prescription.routes.js";
import medicalReportRoutes from "./routes/medicalReport.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import searchRoutes from "./routes/search.routes.js";
import exportRoutes from "./routes/export.routes.js";
import bannerRoutes from "./routes/banner.routes.js";
import homepageRoutes from "./routes/homepage.routes.js";




const app = express();




const configuredOrigins = (process.env.FRONTEND_URL || "")
    .split(",")
    .map((url) => url.trim().replace(/\/+$/, ""))
    .filter(Boolean);

const isProduction = process.env.NODE_ENV === "production";

if (isProduction && configuredOrigins.length === 0) {
    console.warn("⚠️  WARNING: FRONTEND_URL is not configured! All cross-origin browser requests will be blocked in production.");
}

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no Origin (same-origin / server-to-server / curl / uptime monitors).
            if (!origin) {
                return callback(null, true);
            }

            const normalizedOrigin = origin.replace(/\/+$/, "");

            // 1. Allow explicitly configured frontend domains
            if (configuredOrigins.includes(normalizedOrigin)) {
                return callback(null, true);
            }

            // 2. In non-production environments, allow localhost dev servers
            const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
            if (!isProduction && isLocalhost) {
                return callback(null, true);
            }

            // 3. Strict rejection: never allow arbitrary origins in production
            return callback(null, false);
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
    })
);

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend Running");
});

app.get("/api/test", (req, res) => {
    res.json({
        message: "Frontend Connected Successfully"
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/medical-reports", medicalReportRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/homepage", homepageRoutes);

export default app;




















