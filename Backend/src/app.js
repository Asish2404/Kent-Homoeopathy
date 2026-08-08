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




app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests with no Origin (same-origin / server-to-server / curl).
            if (!origin) {
                return callback(null, true);
            }

            // Allow all localhost dev-server origins (5173, 5174, 4173, etc.).
            const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

            // Allow any production origin served over HTTPS.
            const isHttps = /^https:\/\//.test(origin);

            if (isLocalhost || isHttps) {
                return callback(null, true);
            }

            return callback(null, false);
        },
        credentials: true
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




















