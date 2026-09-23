import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI;
        if (!mongoUri) {
            console.error("❌ FATAL: MONGODB_URI environment variable is not defined!");
            console.error("Please configure MONGODB_URI in your Hostinger Node.js settings or .env file.");
            process.exit(1);
        }

        const connectionInstance = await mongoose.connect(mongoUri);

        console.log(
            `MongoDB Connected Successfully! HOST: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

export default connectDB;