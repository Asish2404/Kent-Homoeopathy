// Verify the products API returns the DB-created product with populated category
const res = await fetch("http://localhost:4000/api/products");
const data = await res.json();
console.log("STATUS:", res.status);
console.log("COUNT:", data.count);
console.log("PRODUCTS:", JSON.stringify(data.products?.map(p => ({
  id: p._id,
  name: p.product_name,
  category: p.category,
  price: p.discount_price,
  mrp: p.mrp_price,
  stock: p.stock
})), null, 2));
