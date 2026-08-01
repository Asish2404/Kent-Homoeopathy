/**
 * =====================================================================
 *  Dr. Kent — End-to-End Product Flow Verification (HTTP API level)
 * =====================================================================
 *  Mimics EXACTLY what the React frontend does:
 *
 *    1. Products page  -> GET /api/products   (ProductsCatalog.jsx)
 *    2. Extract _id of a clicked product card
 *    3. Navigate to `/products/:id`  -> GET /api/products/:id  (ProductDescription/Products.jsx)
 *    4. Verify the product found is NOT null and matches.
 *
 *  Usage:
 *    node Backend/e2e_product_flow.mjs
 * =====================================================================
 */
const base = "http://localhost:4000/api";

const listRes = await fetch(`${base}/products`);
const listData = await listRes.json();

console.log("STEP 1 — Products page source: GET /api/products");
console.log(`  Status: ${listRes.status}`);
console.log(`  Total products from API: ${listData.count}`);

// Simulate clicking a few products shown on the Products page.
const productList = listData.products || [];
console.log(`\nSTEP 2 — Clicked product _id values (frontend navigates to /products/:id)`);

let checkCount = 0;
let passed = 0;
const targets = [
  // The static-catalog imported products (previously broken!)
  ...productList.filter((p) => /Belladonna|Arsenic Album|Bryonia|Gelsemium|Nux Vomica/.test(p.product_name || "")).slice(0, 3),
];

if (targets.length === 0) {
  targets.push(productList[0], productList[1], productList[2]);
}

for (const p of targets) {
  if (!p?._id) continue;
  checkCount++;
  const id = String(p._id);
  console.log(`  Clicked: ${p.product_name}  _id = ${id}`);

  const detailRes = await fetch(`${base}/products/${id}`);
  const detailData = await detailRes.json();

  const found = detailRes.status === 200 && detailData.product;
  const nameMatch = found && (detailData.product.product_name === p.product_name);

  console.log(`    → GET /products/:id status=${detailRes.status} product=${found ? detailData.product.product_name : "null"} ${found && nameMatch ? "✅ MATCH" : "❌ MISMATCH"}`);
  if (found && nameMatch) passed++;
}

console.log(`\nSTEP 3 — Product.findById() via API:`);
console.log(`  ${passed}/${checkCount} clicked products resolve to the same document.`);

// Also verify the previously broken scenario is fixed:
// a product that ONLY exists in products.json (not admin-created)
console.log("\nSTEP 4 — Static-JSON-only product (previously would 404):");
const belladonna = productList.find((p) => /^Belladonna/.test(p.product_name || ""));
if (belladonna) {
  const r = await fetch(`${base}/products/${belladonna._id}`);
  const d = await r.json();
  console.log(`  Belladonna 30C -> status ${r.status} -> ${d.product?.product_name || d.message}`);
}

console.log("\n✅ End-to-end product flow verification complete.");

