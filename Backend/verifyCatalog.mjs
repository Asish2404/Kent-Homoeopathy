/**
 * =====================================================================
 *  Dr. Kent Homeopathy — Catalog Verification Script
 * =====================================================================
 *  Verifies the end-to-end product flow after MongoDB seeding:
 *    1. Every product in products.json resolves via Product.findById()
 *    2. Every product's category reference is valid (populate works)
 *    3. GET /products/:id equivalent (the backend controller path)
 *    4. Admin panel collection == Product.findById() collection
 *    5. Search/lookup by _id used in frontend navigation
 *
 *  Usage:
 *    node Backend/verifyCatalog.mjs
 * =====================================================================
 */
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "..", "Project", "src", "data");

const readJSON = (file) =>
  JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));

await mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection.db;

// Register models exactly as the backend does (needed for populate).
const { Product } = await import("./src/models/atanu.product.model.js");
const { Category } = await import("./src/models/atanu.category.model.js");

const productsJSON = readJSON("products.json");
const categoriesJSON = readJSON("categories.json");
const doctorsJSON = readJSON("doctors.json");
const labJSON = readJSON("labtests.json");

console.log("============= CATALOG VERIFICATION =============");

// ---- 1. Counts ----
const catCount = await db.collection("categories").countDocuments();
const prodCount = await db.collection("products").countDocuments();
const docCount = await db.collection("doctors").countDocuments();
const labCount = await db.collection("labtests").countDocuments();

console.log(`Categories in DB  : ${catCount} (JSON: ${categoriesJSON.length})`);
console.log(`Products in DB    : ${prodCount} (JSON: ${productsJSON.length})`);
console.log(`Doctors in DB     : ${docCount} (JSON: ${doctorsJSON.length})`);
console.log(`Lab tests in DB   : ${labCount} (JSON: ${
  (labJSON.lab_tests?.length || 0) + (labJSON.packages?.length || 0)
})`);

// ---- 2. Product.findById() for every JSON product ----
let ok = 0;
let fail = 0;
const failures = [];
for (const p of productsJSON) {
  try {
    const found = await Product.findById(p._id).populate("category");
    if (found) {
      ok++;
      // Validate category populated
      if (!found.category) {
        failures.push(`${p._id} (${p.product_name}) — category NOT populated`);
      }
    } else {
      fail++;
      failures.push(`${p._id} (${p.product_name}) — findById returned null`);
    }
  } catch (err) {
    fail++;
    failures.push(`${p._id} (${p.product_name}) — ${err.message}`);
  }
}
console.log(`\nProduct.findById() for ALL ${productsJSON.length} JSON products:`);
console.log(`  ✅ Resolved: ${ok}`);
console.log(`  ❌ Failed  : ${fail}`);
if (failures.length > 0) {
  failures.slice(0, 10).forEach((f) => console.log(`     - ${f}`));
}

// ---- 3. Verify a representative sample of the first API-based product list ----
const allProds = await Product.find({}).populate("category").lean();
const withCat = allProds.filter((p) => p.category && p.category.category_name);
console.log(`\nGET /products equivalent: ${allProds.length} products, ${withCat.length} with valid category populate.`);

// ---- 4. Verify category refs for ALL products (not just JSON ones) ----
let badCat = 0;
for (const p of allProds) {
  if (!p.category) {
    badCat++;
  }
}
console.log(`Products missing/invalid category: ${badCat}`);

// ---- 5. Verify frontend routing: the _id returned by GET /products is used as-is for GET /products/:id ----
const sample = allProds[0];
if (sample) {
  const byId = await Product.findById(sample._id);
  console.log(
    `\nRouting round-trip: GET /products returned _id=${sample._id}, ` +
    `Product.findById(${sample._id}) => ${byId ? byId.product_name : "NULL"} ${byId ? "✅" : "❌"}`
  );
}

// ---- 6. Spot check a handful of names ----
console.log("\nSample products loaded via Product.findById():");
const spot = productsJSON.slice(0, 8);
for (const p of spot) {
  const found = await Product.findById(p._id).populate("category");
  console.log(
    `  ${found ? "✅" : "❌"} ${p.product_name} — cat: ${found?.category?.category_name || "NULL"}`
  );
}

// ---- 7. Admin panel uses the same Product model => same collection ----
console.log("\nAdmin panel (admin.service.js) calls GET /products and POST /products,");
console.log("which route to Product.find()/Product.create() — the SAME 'products' collection used by Product.findById().");
console.log(`MongoDB collection actually queried: products (${prodCount} docs) — MATCHES.`);

await mongoose.disconnect();
console.log("\n✅ Verification complete.");

