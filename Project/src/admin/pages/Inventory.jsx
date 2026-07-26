import { useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { getInventory, exportInventory } from "../services/admin.service";

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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { page, limit: 20 };
      if (search.trim()) params.q = search.trim();
      if (statusFilter !== "All") params.status = statusFilter;

      const res = await getInventory(params);
      setInventory(res.inventories || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalCount(res.pagination?.totalCount || 0);
    } catch (err) {
      console.error("Inventory load error:", err);
      setError("Failed to load inventory. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const summary = {
    currentStock: inventory.reduce((sum, item) => sum + (item.currentStock || item.availableStock || 0), 0),
    lowStock: inventory.filter((i) => String(i.stockStatus).toLowerCase() === "low stock").length,
    outOfStock: inventory.filter((i) => String(i.stockStatus).toLowerCase() === "out of stock").length,
  };

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
            onChange={(e) => { if (e.target.value) { exportInventory(e.target.value); e.target.value = ""; } }}
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
          <div className="text-3xl font-extrabold text-neutral-900 mt-1">{totalCount}</div>
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
                    <th className="font-bold py-3">On Hand</th>
                    <th className="font-bold py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {inventory.map((item) => {
                    const name = item.productDoc?.product_name || item.productName || `Item ${item._id?.slice(-6)}`;
                    const onHand = item.availableStock ?? item.currentStock ?? 0;
                    const status = item.stockStatus || "In Stock";

                    return (
                      <tr key={item._id} className="border-t border-neutral-200">
                        <td className="py-3">
                          <div className="font-extrabold text-neutral-900">{name}</div>
                          <div className="text-xs text-neutral-500">{item.batchNumber || ""}</div>
                        </td>
                        <td className="py-3 font-extrabold text-neutral-900">{onHand}</td>
                        <td className="py-3">
                          <Badge variant={statusVariant(status)}>{status}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {inventory.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-10">
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

