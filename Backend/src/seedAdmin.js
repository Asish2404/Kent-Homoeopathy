import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { DB_NAME } from "./constants.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from Backend/.env
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const sanitizeMessage = (message) => {
    if (!message) return "";
    let str = String(message);
    if (process.env.MONGODB_URI) {
        str = str.split(process.env.MONGODB_URI).join("[REDACTED_URI]");
    }
    return str.replace(/mongodb(\+srv)?:\/\/[^@]+@/g, "mongodb$1://***:***@");
};

async function seedAdmin() {
    try {
        const mongoUri =
            process.env.MONGODB_URI ||
            `mongodb://127.0.0.1:27017/${DB_NAME}`;

        console.log("Connecting to MongoDB...");
        await mongoose.connect(mongoUri);

        console.log("MongoDB connected successfully");

        const collection = mongoose.connection.db.collection("signup");

        const adminEmail = (process.env.ADMIN_EMAIL || "admin@drkent.com").trim().toLowerCase();
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminName = process.env.ADMIN_NAME || "Dr. Kent Admin";

        const existingAdmin = await collection.findOne({
            email: adminEmail,
        });

        if (existingAdmin) {
            const updateFields = { role: "admin" };
            if (adminPassword) {
                updateFields.password = await bcrypt.hash(adminPassword, 10);
            }
            await collection.updateOne(
                { email: adminEmail },
                { $set: updateFields }
            );
            console.log("Existing admin updated successfully");
            return;
        }

        if (!adminPassword) {
            throw new Error("ADMIN_PASSWORD environment variable is required to create a new admin account.");
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        const adminUser = {
            user_name: adminName,
            email: adminEmail,
            password: hashedPassword,
            phone: process.env.ADMIN_PHONE || "0000000000",
            address: process.env.ADMIN_ADDRESS || "Admin Office",
            role: "admin",
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await collection.insertOne(adminUser);

        console.log("==================================");
        console.log("Admin account created successfully");
        console.log("Email   :", adminEmail);
        console.log("Role    :", "admin");
        console.log("ID      :", result.insertedId);
        console.log("==================================");

    } catch (error) {
        console.error("Error seeding admin:", sanitizeMessage(error.message));
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
            console.log("MongoDB disconnected");
        }
    }
}

seedAdmin();