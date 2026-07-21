import React, { useMemo, useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { formatCurrency } from "../utils/formatters";
import { getProducts } from "../services/admin.service";

const statusVariant = (status) => {
  const s = String(status).toLowerCase();
  if (s === "in stock" || s === "available") return "success";
  if (s === "low stock") return "warning";
  if (s === "out of stock") return "danger";
  return "neutral";
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getProducts();
      setProducts(res.products || []);
    } catch (err) {
      console.error("Products load error:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const name = (p.product_name || p.name || "").toLowerCase();
      const cat = p.category?.category_name || p.category || "";
      const catStr = typeof cat === "string" ? cat.toLowerCase() : "";
      const id = (p._id || "").toLowerCase();
      const matchesQuery = !q || name.includes(q) || catStr.includes(q) || id.includes(q);
      const stockStatus = String(p.stockStatus || p.status || "In Stock");
      const matchesStatus = status === "All" ? true : stockStatus === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status, products]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Product Management</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Products</div>
          <div className="mt-1 text-sm text-neutral-500">Browse and manage product catalog.</div>
        </div>
        <button className="btn-primary" onClick={() => {}}>
          Add Product
        </button>
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full sm:w-80"
              placeholder="Search products..."
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none"
            >
              <option>All</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>

          <div className="text-sm text-neutral-500">
            Showing <span className="font-extrabold text-neutral-900">{filtered.length}</span> items
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-neutral-500 font-semibold">Loading products...</div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-600 font-extrabold mb-2">Error</div>
              <div className="text-neutral-500 text-sm mb-3">{error}</div>
              <button className="btn-primary" onClick={loadProducts}>Retry</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="text-left text-xs text-neutral-500">
                  <tr>
                    <th className="font-bold py-3">Product</th>
                    <th className="font-bold py-3">Category</th>
                    <th className="font-bold py-3">Price</th>
                    <th className="font-bold py-3">Discount</th>
                    <th className="font-bold py-3">Stock</th>
                    <th className="font-bold py-3">Status</th>
                    <th className="font-bold py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filtered.map((p) => {
                    const name = p.product_name || p.name || "Unknown";
                    const category = p.category?.category_name || p.category || "N/A";
                    const price = p.discount_price || p.mrp_price || p.price || 0;
                    const mrp = p.mrp_price || p.price || 0;
                    const discount = mrp > 0 ? Math.round((1 - price / mrp) * 100) : 0;
                    const stock = p.stock || p.currentStock || p.availableStock || 0;
                    const stockStatus = p.stockStatus || p.status || "In Stock";
                    const image = p.product_image || "/src/assets/Product_image.png";

                    return (
                      <tr key={p._id} className="border-t border-neutral-200">
                        <td className="py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={image}
                              alt={name}
                              className="w-12 h-12 rounded-2xl object-cover border border-neutral-200"
                            />
                            <div className="min-w-0">
                              <div className="font-extrabold text-neutral-900 truncate">{name}</div>
                              <div className="text-xs text-neutral-500">{p._id?.slice(-8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-neutral-700">{category}</td>
                        <td className="py-3 font-extrabold text-neutral-900">{formatCurrency(price)}</td>
                        <td className="py-3 text-neutral-700">{discount}%</td>
                        <td className="py-3 font-extrabold text-neutral-900">{stock}</td>
                        <td className="py-3">
                          <Badge variant={statusVariant(stockStatus)}>{stockStatus}</Badge>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <button className="btn-outline px-3 py-2" onClick={() => {}}>Edit</button>
                            <button className="btn-outline px-3 py-2" onClick={() => {}}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td colSpan={7} className="py-10">
                        <EmptyState title="No matching products" description="Try adjusting your search or filter." />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Products;

