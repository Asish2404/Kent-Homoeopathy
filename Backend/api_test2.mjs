const base = "http://localhost:4000/api";

// 1. GET single product
async function getProduct(id) {
  const res = await fetch(`${base}/products/${id}`);
  const data = await res.json();
  console.log("GET /products/:id STATUS:", res.status);
  console.log("PRODUCT:", data.product?.product_name, "| MRP:", data.product?.mrp_price, "| PRICE:", data.product?.discount_price);
  return data;
}

// 2. GET invalid product id (should be 404)
async function getInvalidProduct() {
  const res = await fetch(`${base}/products/000000000000000000000000`);
  console.log("GET INVALID PRODUCT STATUS:", res.status);
  const data = await res.json();
  console.log("INVALID MSG:", data.message || data.success);
}

// 3. Invalid login (wrong password)
async function invalidLogin() {
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@drkent.com", password: "WrongPass" }),
  });
  console.log("INVALID LOGIN STATUS:", res.status);
  console.log("INVALID LOGIN MSG:", (await res.json()).message);
}

// 4. Invalid login (nonexistent user)
async function noUser() {
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ghost@drkent.com", password: "whatever" }),
  });
  console.log("NO USER STATUS:", res.status);
  console.log("NO USER MSG:", (await res.json()).message);
}

// 5. Protected route without token
async function noToken() {
  const res = await fetch(`${base}/auth/profile`);
  console.log("PROFILE NO TOKEN STATUS:", res.status);
  console.log("PROFILE NO TOKEN MSG:", (await res.json()).message);
}

const listRes = await fetch(`${base}/products`);
const list = await listRes.json();
const id = list.products?.[0]?._id;
if (id) await getProduct(id);
await getInvalidProduct();
await invalidLogin();
await noUser();
await noToken();
