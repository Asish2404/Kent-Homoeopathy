import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;
const collections = await db.listCollections().toArray();
console.log("=== COLLECTIONS ===");
for (const c of collections) {
  const count = await db.collection(c.name).countDocuments();
  console.log(`${c.name}: ${count} docs`);
}
await mongoose.disconnect();
