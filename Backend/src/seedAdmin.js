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
    // Use the same connection string as the main app (database.js)
    // Try local MongoDB first, fallback to MONGODB_URI from .env
    const mongoUri =
        `mongodb://127.0.0.1:27017/${DB_NAME}`;

    console.log("Connecting to MongoDB at:", mongoUri);
    await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully.");

    const db = mongoose.connection.db;
    const collection = db.collection("signup");

    // Check if admin already exists
    const existingAdmin = await collection.findOne({ email: ADMIN_EMAIL });

    if (existingAdmin) {
        console.log(`Admin account ${ADMIN_EMAIL} already exists. Skipping seed.`);
        await mongoose.disconnect();
        process.exit(0);
    }

    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

    // Create admin user
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

    if (result.insertedId) {
        console.log(`Admin account created successfully!`);
        console.log(`Email: ${ADMIN_EMAIL}`);
        console.log(`Password: ${ADMIN_PASSWORD}`);
        console.log(`Role: admin`);
        console.log(`ID: ${result.insertedId}`);
    } else {
        console.error("Failed to create admin account.");
        process.exit(1);
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB. Seed complete.");
    process.exit(0);
}

seedAdmin().catch((err) => {
    console.error("Seed script failed:", err);
    process.exit(1);
});

