import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Product } from "./src/models/atanu.product.model.js";
import { HomepageSection } from "./src/models/homepageSection.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rawProducts = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "..", "Project", "src", "data", "products.json"), "utf8")
);

await mongoose.connect(process.env.MONGODB_URI);
console.log("Connected to MongoDB");

for (let idx = 0; idx < rawProducts.length; idx++) {
  const raw = rawProducts[idx];
  const isBestSeller = Boolean(raw.bestSeller || raw.best_seller || (raw.tags && raw.tags.includes("best-seller")));
  const isNewArrival = Boolean(raw.newArrival || raw.new_arrival || (raw.tags && raw.tags.includes("new-arrival")));
  const isTrending = Boolean(raw.trending || (raw.tags && (raw.tags.includes("trending") || raw.tags.includes("ayurvedic"))));
  const isTopPick = Boolean(raw.top_pick || raw.topPick || (raw.tags && raw.tags.includes("top-pick")) || idx % 4 === 0);
  const isFeatured = Boolean(raw.featured || (raw.tags && raw.tags.includes("featured")));

  await Product.updateOne(
    { _id: new mongoose.Types.ObjectId(raw._id) },
    {
      $set: {
        best_seller: isBestSeller,
        new_arrival: isNewArrival,
        trending: isTrending,
        top_pick: isTopPick,
        featured: isFeatured,
      },
    }
  );
}

// Clear and rebuild HomepageSection based on flags
await HomepageSection.deleteMany({});
const allProds = await Product.find({});
const FLAG_TO_SEC = {
  featured: "featured",
  new_arrival: "new_arrivals",
  trending: "trending",
  best_seller: "best_sellers",
  top_pick: "top_picks",
};

for (const [flag, sec] of Object.entries(FLAG_TO_SEC)) {
  const matching = allProds.filter((p) => Boolean(p[flag]));
  for (let i = 0; i < matching.length; i++) {
    await HomepageSection.create({
      section: sec,
      product: matching[i]._id,
      order: i,
    });
  }
}

const counts = {
  featured: await Product.countDocuments({ featured: true }),
  best_seller: await Product.countDocuments({ best_seller: true }),
  trending: await Product.countDocuments({ trending: true }),
  new_arrival: await Product.countDocuments({ new_arrival: true }),
  top_pick: await Product.countDocuments({ top_pick: true }),
  homepageSections: await HomepageSection.countDocuments(),
};
console.log("Sync Complete:", counts);

await mongoose.disconnect();
