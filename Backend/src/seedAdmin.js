import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { DB_NAME } from "./constants.js";

dotenv.config({
    path: "./.env",
});

const ADMIN_EMAIL = "admin@drkent.com";
const ADMIN_PASSWORD = "Admin@123";
const ADMIN_NAME = "Dr. Kent Admin";

async function seedAdmin() {
    try {
        // Use Atlas URI if available, otherwise use local MongoDB
        const mongoUri =
            process.env.MONGODB_URI ||
            `mongodb://127.0.0.1:27017/${DB_NAME}`;

        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoUri);

        console.log("✅ MongoDB connected successfully.");

        // Make sure this collection name matches your actual users collection
        const collection = mongoose.connection.db.collection("signup");

        // Check if admin already exists
        const existingAdmin = await collection.findOne({
            email: ADMIN_EMAIL,
        });

        if (existingAdmin) {
            console.log("✅ Admin already exists.");
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

        // Admin document
        const adminUser = {
            user_name: ADMIN_NAME,
            email: ADMIN_EMAIL,
            password: hashedPassword,
            phone: "0000000000",
            address: "Admin Office",
            role: "admin",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await collection.insertOne(adminUser);

        console.log("==================================");
        console.log("✅ Admin account created successfully!");
        console.log("Email   :", ADMIN_EMAIL);
        console.log("Password:", ADMIN_PASSWORD);
        console.log("Role    :", "admin");
        console.log("ID      :", result.insertedId);
        console.log("==================================");

    } catch (error) {
        console.error("❌ Error seeding admin:", error);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
    }
}

seedAdmin();