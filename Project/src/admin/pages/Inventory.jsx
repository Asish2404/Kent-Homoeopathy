import { useMemo, useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getProducts, exportProducts } from "../services/admin.service";
import { formatCurrency } from "../utils/formatters";

const statusVariant = (status) => {
  const s = String(status).toLowerCase();
  if (s === "in stock" || s === "available") return "success";
  if (s === "low stock") return "warning";
  if (s === "out of stock" || s === "out of stock" || s === "expired") return "danger";
  return "neutral";
};

const InventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await getProducts();
      setInventory(Array.isArray(res.products) ? res.products : []);
    } catch (err) {
      console.error("Inventory load error:", err);
      setError("Failed to load product stock. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInventory();
  }, [loadInventory]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const normalizedInventory = useMemo(() => {
    const q = search.trim().toLowerCase();
    return inventory
      .map((item) => {
        const productStock = Number(item.stock ?? item.currentStock ?? item.availableStock ?? 0);
        const status = productStock <= 0 ? "Out Of Stock" : productStock <= 5 ? "Low Stock" : "In Stock";
        const category = item.category?.category_name || item.categoryTitle || item.category || "Products";
        return { ...item, productStock, status, category };
      })
      .filter((item) => {
        const name = (item.product_name || item.name || "").toLowerCase();
        const category = String(item.category || "").toLowerCase();
        const brand = String(item.brand || "").toLowerCase();
        const matchesQuery = !q || name.includes(q) || category.includes(q) || brand.includes(q);
        const matchesStatus = statusFilter === "All" ? true : item.status === statusFilter;
        return matchesQuery && matchesStatus;
      });
  }, [inventory, search, statusFilter]);

  const summary = useMemo(() => {
    return normalizedInventory.reduce(
      (acc, item) => {
        acc.currentStock += item.productStock;
        if (item.status === "Low Stock") acc.lowStock += 1;
        if (item.status === "Out Of Stock") acc.outOfStock += 1;
        return acc;
      },
      { currentStock: 0, lowStock: 0, outOfStock: 0 }
    );
  }, [normalizedInventory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Stock & Availability</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Inventory</div>
          <div className="mt-1 text-sm text-neutral-500">Live stock breakdown from database.</div>
        </div>
        <div className="flex gap-2">
          <select
            onChange={(e) => { if (e.target.value) { exportProducts(e.target.value); e.target.value = ""; } }}
            className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none text-sm bg-white cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Export</option>
            <option value="csv">CSV</option>
            <option value="xlsx">Excel (.xlsx)</option>
          </select>
          <button className="btn-primary" type="button">Reorder</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="text-neutral-500 text-sm font-semibold">Current Stock</div>
          <div className="text-3xl font-extrabold text-neutral-900 mt-1">{summary.currentStock}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-500 text-sm font-semibold">Low Stock</div>
              <div className="text-3xl font-extrabold text-neutral-900 mt-1">{summary.lowStock}</div>
            </div>
            <Badge variant="warning">Needs</Badge>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-neutral-500 text-sm font-semibold">Out of Stock</div>
              <div className="text-3xl font-extrabold text-neutral-900 mt-1">{summary.outOfStock}</div>
            </div>
            <Badge variant="danger">Restock</Badge>
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-neutral-500 text-sm font-semibold">Total Items</div>
          <div className="text-3xl font-extrabold text-neutral-900 mt-1">{normalizedInventory.length}</div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              value={search}
              onChange={handleSearchChange}
              className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full sm:w-80"
              placeholder="Search by product, batch or supplier..."
            />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none"
            >
              <option>All</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out Of Stock</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-neutral-500 font-semibold">Loading inventory...</div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-600 font-extrabold mb-2">Error</div>
              <div className="text-neutral-500 text-sm mb-3">{error}</div>
              <button className="btn-primary" onClick={loadInventory}>Retry</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="text-left text-xs text-neutral-500">
                  <tr>
                    <th className="font-bold py-3">Product</th>
                    <th className="font-bold py-3">Category</th>
                    <th className="font-bold py-3">On Hand</th>
                    <th className="font-bold py-3">Price</th>
                    <th className="font-bold py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {normalizedInventory.map((item) => {
                    const name = item.product_name || item.productName || item.name || `Item ${item._id?.slice(-6)}`;
                    const onHand = item.productStock;
                    const price = Number(item.discount_price ?? item.price ?? 0);

                    return (
                      <tr key={item._id} className="border-t border-neutral-200">
                        <td className="py-3">
                          <div className="font-extrabold text-neutral-900">{name}</div>
                          <div className="text-xs text-neutral-500">{item.brand || item.slug || ""}</div>
                        </td>
                        <td className="py-3 text-sm text-neutral-700">{item.category}</td>
                        <td className="py-3 font-extrabold text-neutral-900">{onHand}</td>
                        <td className="py-3 text-sm text-neutral-700">{formatCurrency(price)}</td>
                        <td className="py-3">
                          <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {normalizedInventory.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-10">
                        <EmptyState title="No inventory items found" />
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

export default InventoryPage;

