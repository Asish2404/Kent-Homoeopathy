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




const app = express();


app.use(
    cors({
        origin: "http://localhost:5173",
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
export default app;


