import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";

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

export default app;