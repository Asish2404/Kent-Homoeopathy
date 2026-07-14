import React, { useMemo, useState } from "react";
import { productsData } from "../data/productsData";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { formatCurrency } from "../utils/formatters";

const statusVariant = (status) => {
  if (status === "In Stock") return "success";
  if (status === "Low Stock") return "warning";
  if (status === "Out of Stock") return "danger";
  return "neutral";
};

const Products = () => {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return productsData.products.filter((p) => {
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q);
      const matchesStatus = status === "All" ? true : p.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [query, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Product Management</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Products</div>
          <div className="mt-1 text-sm text-neutral-500">Add, edit, delete (UI mock) with mock dataset.</div>
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

        <div className="mt-4 overflow-x-auto">
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
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-neutral-200">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-2xl object-cover border border-neutral-200"
                      />
                      <div className="min-w-0">
                        <div className="font-extrabold text-neutral-900 truncate">{p.name}</div>
                        <div className="text-xs text-neutral-500">{p.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-neutral-700">{p.category}</td>
                  <td className="py-3 font-extrabold text-neutral-900">{formatCurrency(p.price)}</td>
                  <td className="py-3 text-neutral-700">{p.discount}%</td>
                  <td className="py-3 font-extrabold text-neutral-900">{p.stock}</td>
                  <td className="py-3">
                    <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button className="btn-outline px-3 py-2" onClick={() => {}}>Edit</button>
                      <button className="btn-outline px-3 py-2" onClick={() => {}}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10">
                    <div className="text-center text-neutral-500 font-extrabold">No matching products</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Products;

