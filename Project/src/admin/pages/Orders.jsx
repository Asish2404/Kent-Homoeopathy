import React, { useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getOrders, exportOrders } from "../services/admin.service";

const statusVariant = (status) => {
  if (status === "Delivered" || status === "delivered") return "success";
  if (status === "Pending" || status === "pending" || status === "confirmed") return "warning";
  if (status === "Cancelled" || status === "cancelled") return "danger";
  return "neutral";
};

const statusOptions = [
  "All",
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      if (query.trim()) params.q = query.trim();
      if (statusFilter !== "All") params.status = statusFilter;

      const res = await getOrders(params);
      setOrders(res.orders || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalCount(res.pagination?.totalCount || 0);
    } catch (err) {
      console.error("Orders load error:", err);
      setError("Failed to load orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, query, statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Reset to page 1 when filters change
  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Order Operations</div>
          <div className="mt-2 text-3xl font-extrabold text-neutral-900">Orders</div>
          <div className="mt-1 text-sm text-neutral-500">Track, filter and review order status.</div>
        </div>
        <select
          onChange={(e) => { if (e.target.value) { exportOrders(e.target.value); e.target.value = ""; } }}
          className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none text-sm bg-white cursor-pointer"
          defaultValue=""
        >
          <option value="" disabled>Export</option>
          <option value="csv">CSV</option>
          <option value="xlsx">Excel (.xlsx)</option>
        </select>
      </div>

      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              value={query}
              onChange={handleSearch}
              className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none w-full sm:w-80"
              placeholder="Search orders by ID or customer..."
            />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="border border-neutral-200 rounded-2xl px-4 py-3 outline-none"
            >
              {statusOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div className="text-sm text-neutral-500">
            Showing <span className="font-extrabold text-neutral-900">{orders.length}</span> of{" "}
            <span className="font-extrabold text-neutral-900">{totalCount}</span> orders
          </div>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-neutral-500 font-semibold">Loading orders...</div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-600 font-extrabold mb-2">Error</div>
              <div className="text-neutral-500 text-sm mb-3">{error}</div>
              <button className="btn-primary" onClick={loadOrders}>Retry</button>
            </div>
          ) : orders.length === 0 ? (
            <EmptyState title="No orders found" description="Try adjusting your search or filters." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="text-left text-xs text-neutral-500">
                    <tr>
                      <th className="font-bold py-3">Order</th>
                      <th className="font-bold py-3">Customer</th>
                      <th className="font-bold py-3">Date</th>
                      <th className="font-bold py-3">Status</th>
                      <th className="font-bold py-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {orders.map((o) => (
                      <tr key={o._id} className="border-t border-neutral-200">
                        <td className="py-3 font-extrabold text-neutral-900">
                          {o.orderNumber || o._id?.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-3 text-neutral-700">
                          {o.shippingAddress?.fullName || o.customer?.user_name || "N/A"}
                        </td>
                        <td className="py-3 text-neutral-500">{formatDate(o.createdAt)}</td>
                        <td className="py-3">
                          <Badge variant={statusVariant(o.status || o.orderStatus)}>
                            {o.status || o.orderStatus || "pending"}
                          </Badge>
                        </td>
                        <td className="py-3 font-extrabold text-brand-700">
                          {formatCurrency(o.grandTotal || o.orderPrice || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-neutral-200">
                  <div className="text-sm text-neutral-500">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn-outline px-3 py-2"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                    <button
                      className="btn-outline px-3 py-2"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Orders;

