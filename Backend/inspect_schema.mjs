import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import mongoose from "mongoose";

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

// Check all collections and sample a few docs to understand schema
const collections = await db.listCollections().toArray();
for (const c of collections) {
  const sample = await db.collection(c.name).findOne({});
  if (sample) {
    console.log(`\n=== ${c.name} ===`);
    console.log("Keys:", Object.keys(sample).join(", "));
  }
}
await mongoose.disconnect();
