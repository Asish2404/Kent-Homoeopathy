const base = "http://localhost:4000/api";

// 1. Login as admin
async function login() {
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "admin@drkent.com", password: "Admin@123" }),
  });
  const data = await res.json();
  console.log("LOGIN STATUS:", res.status);
  console.log("LOGIN MSG:", data.message);
  console.log("TOKEN PRESENT:", !!data.token);
  console.log("ROLE:", data.user?.role);
  console.log("USER KEYS:", Object.keys(data.user || {}).join(", "));
  return data.token;
}

// 2. Create category
async function createCategory(token) {
  const res = await fetch(`${base}/category`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ category_name: "Test Vitamins" }),
  });
  const data = await res.json();
  console.log("CATEGORY STATUS:", res.status);
  console.log("CATEGORY:", data.category?._id, data.message);
  return data.category?._id;
}

// 3. Create product
async function createProduct(token, catId) {
  const res = await fetch(`${base}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      product_name: "Test Product A",
      product_image: "https://example.com/a.jpg",
      brand: "Dr. Kent",
      short_description: "Short desc",
      detailed_description: "Detailed desc",
      quantity: 1,
      pack: "10x10",
      mrp_price: 200,
      discount_price: 150,
      stock: 10,
      category: catId,
    }),
  });
  const data = await res.json();
  console.log("PRODUCT STATUS:", res.status);
  console.log("PRODUCT:", data.product?._id, data.message);
  return data.product?._id;
}

// 4. Get all products
async function getProducts() {
  const res = await fetch(`${base}/products`);
  const data = await res.json();
  console.log("GET PRODUCTS STATUS:", res.status);
  console.log("COUNT:", data.count);
  console.log("FIRST:", data.products?.[0]?.product_name, "CAT:", data.products?.[0]?.category?.category_name);
}

const token = await login();
if (token) {
  const catId = await createCategory(token);
  if (catId) {
    await createProduct(token, catId);
  }
  await getProducts();
}
