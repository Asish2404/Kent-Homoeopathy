/**
 * =====================================================================
 *  Dr. Kent Homeopathy — Safe MongoDB Catalog Seeder
 * =====================================================================
 *  Purpose:
 *    Import the generated catalog JSON files (categories, products,
 *    doctors, lab tests) into the MongoDB database WITHOUT disrupting
 *    any existing data.
 *
 *  Requirements honoured:
 *    - Uses insertMany() for bulk import.
 *    - Preserves the original `_id` values from the JSON files
 *      (cast to ObjectId with the SAME hex value) so existing
 *      /products/:id routing keeps working.
 *    - Does NOT generate new ObjectIds.
 *    - Skips documents that already exist (based on `_id`, and for
 *      doctors also by `doctor_name` to avoid name duplicates).
 *    - Never deletes existing admin-created documents.
 *    - Merges the catalog with the existing collections.
 *    - Imports in dependency order: categories -> products -> doctors -> lab tests.
 *    - After import, verifies:
 *        * counts per collection
 *        * every product `category` reference resolves to a real Category
 *        * Product.findById() returns a document for every product
 *
 *  Idempotent: safe to run multiple times — duplicate documents are skipped.
 *
 *  Usage:
 *    node Backend/seedMongoCatalog.js
 * =====================================================================
 */

import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { Product } from "./src/models/atanu.product.model.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "..", "Project", "src", "data");

const readJSON = (file) =>
  JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));

/** Convert a 24-char hex string into a real MongoDB ObjectId (same value). */
const toObjectId = (v) => {
  if (v === undefined || v === null || v === "") return v;
  const s = String(v);
  if (/^[0-9a-fA-F]{24}$/.test(s)) {
    return new mongoose.Types.ObjectId(s);
  }
  return v;
};

/** Convert ISO date strings into Date objects for cleanliness. */
const convertDates = (doc) => {
  if (typeof doc.createdAt === "string") doc.createdAt = new Date(doc.createdAt);
  if (typeof doc.updatedAt === "string") doc.updatedAt = new Date(doc.updatedAt);
  return doc;
};

/** Chunk an array to keep insertMany() batch sizes reasonable. */
const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

/**
 * Import a list of docs with insertMany(), honouring pre-existing _ids.
 * Returns { inserted, skipped }.
 */
async function importCollection(collection, docs, existingIds, opts = {}) {
  const { dedupeFields = [] } = opts;
  let inserted = 0;
  let skipped = 0;

  if (dedupeFields.length > 0) {
    // For collections where we also need to avoid duplicate human-readable
    // keys (e.g. doctor_name), query the DB once and build the skip set.
    const selector = { $or: dedupeFields.map((f) => ({ [f]: { $exists: true } })) };
    const existing = await collection.find(selector, { projection: { _id: 1 } }).toArray();
    // Dedupe by _id is handled by existingIds; field-level dedupe handled below.
  }

  // Build the list of NEW documents.
  const toInsert = [];
  for (const doc of docs) {
    const hex = String(doc._id);
    if (existingIds.has(hex)) {
      skipped++;
      continue;
    }
    toInsert.push(doc);
  }

  // insertMany() in ordered batches; ignore duplicate-key collisions so an
  // unexpected race (another process inserting simultaneously) never fails.
  for (const batch of chunk(toInsert, 500)) {
    try {
      const res = await collection.insertMany(batch, { ordered: false });
      inserted += res.insertedCount;
    } catch (err) {
      if (err.name === "MongoBulkWriteError" && err.code === 11000) {
        const insertedCount = err.result?.insertedCount ?? err.insertedDocs?.length ?? 0;
        inserted += insertedCount;
        skipped += batch.length - insertedCount;
      } else {
        throw err;
      }
    }
  }

  return { inserted, skipped };
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("✗ MONGODB_URI not found in Backend/.env — aborting.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log("✅ Connected to MongoDB\n");

  // Tally for the final report.
  const report = {
    categories: { inserted: 0, skipped: 0 },
    products: { inserted: 0, skipped: 0 },
    doctors: { inserted: 0, skipped: 0 },
    labtests: { inserted: 0, skipped: 0 },
  };

  // =================================================================
  // 1. CATEGORIES
  // =================================================================
  const categoriesJSON = readJSON("categories.json");
  const catColl = db.collection("categories");
  const existingCatIds = new Set(
    (await catColl.find({}, { projection: { _id: 1 } }).toArray()).map((d) =>
      d._id.toString()
    )
  );
  console.log(
    `CATEGORIES: ${categoriesJSON.length} in JSON | ${existingCatIds.size} already in DB`
  );

  const catDocs = categoriesJSON.map((doc) =>
    convertDates({ ...doc, _id: toObjectId(doc._id) })
  );
  report.categories = await importCollection(catColl, catDocs, existingCatIds);
  console.log(
    `  ➕ Inserted: ${report.categories.inserted} | ⏭ Skipped: ${report.categories.skipped}\n`
  );

  // =================================================================
  // 2. PRODUCTS
  // =================================================================
  const productsJSON = readJSON("products.json");
  const prodColl = db.collection("products");
  const existingProdIds = new Set(
    (await prodColl.find({}, { projection: { _id: 1 } }).toArray()).map((d) =>
      d._id.toString()
    )
  );
  console.log(
    `PRODUCTS: ${productsJSON.length} in JSON | ${existingProdIds.size} already in DB (admin-created docs preserved)`
  );

  const prodDocs = productsJSON.map((doc) =>
    convertDates({
      ...doc,
      _id: toObjectId(doc._id),
      category: toObjectId(doc.category),
    })
  );
  report.products = await importCollection(prodColl, prodDocs, existingProdIds);
  console.log(
    `  ➕ Inserted: ${report.products.inserted} | ⏭ Skipped: ${report.products.skipped}\n`
  );

  // =================================================================
  // 3. DOCTORS (dedupe by _id AND doctor_name to avoid name dupes)
  // =================================================================
  const doctorsJSON = readJSON("doctors.json");
  const docColl = db.collection("doctors");
  const existingDoctors = await docColl
    .find({}, { projection: { _id: 1, doctor_name: 1 } })
    .toArray();
  const existingDocIds = new Set(existingDoctors.map((d) => d._id.toString()));
  const existingDocNames = new Set(
    existingDoctors.map((d) => String(d.doctor_name || "").trim().toLowerCase())
  );
  console.log(
    `DOCTORS: ${doctorsJSON.length} in JSON | ${existingDocIds.size} already in DB`
  );

  let docInserted = 0;
  let docSkipped = 0;
  const docToInsert = [];
  for (const doctor of doctorsJSON) {
    const nameKey = String(doctor.doctor_name || "").trim().toLowerCase();
    const hex = String(doctor._id);
    if (existingDocIds.has(hex) || existingDocNames.has(nameKey)) {
      docSkipped++;
      continue;
    }
    const newDoc = convertDates({ ...doctor, _id: toObjectId(doctor._id) });
    docToInsert.push(newDoc);
    existingDocNames.add(nameKey); // prevent dupes inside the JSON list itself
  }
  for (const batch of chunk(docToInsert, 500)) {
    try {
      const res = await docColl.insertMany(batch, { ordered: false });
      docInserted += res.insertedCount;
    } catch (err) {
      if (err.name === "MongoBulkWriteError" && err.code === 11000) {
        docInserted += err.result?.insertedCount ?? err.insertedDocs?.length ?? 0;
        docSkipped += batch.length - (err.result?.insertedCount ?? err.insertedDocs?.length ?? 0);
      } else {
        throw err;
      }
    }
  }
  report.doctors = { inserted: docInserted, skipped: docSkipped };
  console.log(
    `  ➕ Inserted: ${report.doctors.inserted} | ⏭ Skipped: ${report.doctors.skipped}\n`
  );

  // =================================================================
  // 4. LAB TESTS (individual tests + health packages)
  // =================================================================
  const labJSON = readJSON("labtests.json");
  const labColl = db.collection("labtests");
  const existingLabIds = new Set(
    (await labColl.find({}, { projection: { _id: 1 } }).toArray()).map((d) =>
      d._id.toString()
    )
  );
  const labTests = [...(labJSON.lab_tests || []), ...(labJSON.packages || [])];
  console.log(
    `LAB TESTS: ${labTests.length} in JSON | ${existingLabIds.size} already in DB`
  );

  const labDocs = labTests.map((doc) =>
    convertDates({ ...doc, _id: toObjectId(doc._id) })
  );
  report.labtests = await importCollection(labColl, labDocs, existingLabIds);
  console.log(
    `  ➕ Inserted: ${report.labtests.inserted} | ⏭ Skipped: ${report.labtests.skipped}\n`
  );

  // =================================================================
  // VERIFICATION
  // =================================================================
  console.log("=============== VERIFICATION ===============");

  const catCount = await catColl.countDocuments();
  const prodCount = await prodColl.countDocuments();
  const docCount = await docColl.countDocuments();
  const labCount = await labColl.countDocuments();

  console.log(`Categories : ${catCount}`);
  console.log(`Products   : ${prodCount}`);
  console.log(`Doctors    : ${docCount}`);
  console.log(`Lab tests  : ${labCount}`);

  // --- Every product category reference must resolve ---
  const prods = await prodColl
    .find({}, { projection: { _id: 1, product_name: 1, category: 1 } })
    .toArray();
  let invalidRefs = 0;
  for (const p of prods) {
    if (!p.category) continue;
    const cat = await catColl.findOne({ _id: p.category });
    if (!cat) {
      invalidRefs++;
      if (invalidRefs <= 5) {
        console.log(
          `  ⚠️ Product "${p.product_name}" has invalid category ref: ${p.category}`
        );
      }
    }
  }
  console.log(
    invalidRefs === 0
      ? "✅ All product category references are valid."
      : `⚠️  ${invalidRefs} product(s) have invalid category references.`
  );

  // --- Product.findById() must return a document for every product ---
  let byIdOk = 0;
  let byIdFail = 0;
  for (const p of prods) {
    try {
      const found = await Product.findById(p._id).populate("category");
      if (found) {
        byIdOk++;
        if (byIdOk <= 3) {
          console.log(
            `  🆔 findById OK: ${found.product_name} (${found._id}) -> category: ${
              found.category?.category_name || "(populate failed)"
            }`
          );
        }
      } else {
        byIdFail++;
      }
    } catch (err) {
      byIdFail++;
      console.log(`  ✗ findById error for ${p._id}: ${err.message}`);
    }
  }
  console.log(
    byIdFail === 0
      ? `✅ Product.findById() works for ALL ${byIdOk} products.`
      : `⚠️  Product.findById() failed for ${byIdFail}/${byIdOk + byIdFail} products.`
  );

  // --- GET /products equivalent (find + populate) ---
  const listed = await Product.find().populate("category");
  console.log(`✅ GET /products equivalent returns ${listed.length} populated products.`);

  // =================================================================
  // FINAL REPORT
  // =================================================================
  console.log("\n=============== IMPORT REPORT ===============");
  console.log(`Categories : ${catCount} total | inserted: ${report.categories.inserted} | skipped: ${report.categories.skipped}`);
  console.log(`Products   : ${prodCount} total | inserted: ${report.products.inserted} | skipped: ${report.products.skipped}`);
  console.log(`Doctors    : ${docCount} total | inserted: ${report.doctors.inserted} | skipped: ${report.doctors.skipped}`);
  console.log(`Lab tests  : ${labCount} total | inserted: ${report.labtests.inserted} | skipped: ${report.labtests.skipped}`);
  console.log("============================================");

  await mongoose.disconnect();
  console.log("\n✅ Seeder finished. MongoDB disconnected.");

  const totalNew =
    report.categories.inserted +
    report.products.inserted +
    report.doctors.inserted +
    report.labtests.inserted;
  if (totalNew === 0) {
    console.log("ℹ️  Nothing new to import — catalog is already in sync.");
  }
}

main().catch((err) => {
  console.error("✗ Seeder failed:", err);
  process.exit(1);
});

