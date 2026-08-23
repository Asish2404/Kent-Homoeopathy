import React, { useState, useEffect, useCallback } from "react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/ui/EmptyState";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getOrders, updateOrderStatus, exportOrders } from "../services/admin.service";

const statusVariant = (status) => {
  const s = String(status).toLowerCase();
  if (s === "delivered") return "success";
  if (["pending", "confirmed", "processing", "packed"].includes(s)) return "warning";
  if (s === "shipped" || s === "out for delivery") return "neutral";
  if (s === "cancelled") return "danger";
  return "neutral";
};

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out for delivery",
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

  // Status updating & Detail modal state
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit: 15,
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

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setFeedback(null);

      await updateOrderStatus(orderId, newStatus);

      setFeedback({
        type: "success",
        message: `Order #${orderId.slice(-8).toUpperCase()} updated to "${newStatus.toUpperCase()}"`,
      });

      // Update local state immediately
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus: newStatus, status: newStatus } : o))
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update order status:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to update order status.",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <div className="section-eyebrow">Order Fulfillment</div>
          <div className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-neutral-900">Orders Management</div>
          <div className="mt-1 text-xs sm:text-sm text-neutral-500">
            Real-time customer orders and dynamic order status updates.
          </div>
        </div>
        <div className="flex gap-2">
          <select
            onChange={(e) => {
              if (e.target.value) {
                exportOrders(e.target.value);
                e.target.value = "";
              }
            }}
            className="border border-neutral-200 rounded-xl px-3 py-2 text-xs sm:text-sm bg-white cursor-pointer"
            defaultValue=""
          >
            <option value="" disabled>Export</option>
            <option value="csv">Export CSV</option>
            <option value="xlsx">Export Excel (.xlsx)</option>
          </select>
          <button onClick={loadOrders} className="btn-outline text-xs sm:text-sm py-2 px-3" type="button">
            Refresh
          </button>
        </div>
      </div>

      {/* Feedback banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-sm font-semibold flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-xs underline ml-4">Dismiss</button>
        </div>
      )}

      {/* Main Card */}
      <Card className="p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between mb-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              value={query}
              onChange={handleSearch}
              className="border border-neutral-200 rounded-xl px-3.5 py-2.5 outline-none w-full sm:w-80 text-sm"
              placeholder="Search by order ID, customer name, email..."
            />
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="border border-neutral-200 rounded-xl px-3.5 py-2.5 outline-none text-sm bg-white capitalize"
            >
              <option value="All">All Statuses</option>
              {ORDER_STATUSES.map((opt) => (
                <option key={opt} value={opt} className="capitalize">{opt}</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-neutral-500">
            Showing <span className="font-bold text-neutral-900">{orders.length}</span> of{" "}
            <span className="font-bold text-neutral-900">{totalCount}</span> total orders
          </div>
        </div>

        <div>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-[var(--brand-600)] border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-neutral-500 text-sm font-semibold">Loading orders...</div>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <div className="text-red-600 font-extrabold mb-1">Error</div>
              <div className="text-neutral-500 text-sm mb-3">{error}</div>
              <button className="btn-primary py-2 px-4 text-xs" onClick={loadOrders}>Retry</button>
            </div>
          ) : orders.length === 0 ? (
            <EmptyState title="No orders found" description="Try adjusting your search or filters." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="text-left text-xs text-neutral-500 border-b border-neutral-200">
                    <tr>
                      <th className="font-bold py-3 px-2">Order #</th>
                      <th className="font-bold py-3 px-2">Customer & Contact</th>
                      <th className="font-bold py-3 px-2">Items</th>
                      <th className="font-bold py-3 px-2">Date</th>
                      <th className="font-bold py-3 px-2">Amount</th>
                      <th className="font-bold py-3 px-2">Dynamic Status</th>
                      <th className="font-bold py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm divide-y divide-neutral-100">
                    {orders.map((o) => {
                      const currentStatus = (o.orderStatus || o.status || "pending").toLowerCase();
                      const isUpdating = updatingOrderId === o._id;
                      const customerName =
                        o.shippingAddress?.fullName ||
                        o.customer?.user_name ||
                        o.user?.user_name ||
                        "Customer";
                      const customerPhone = o.shippingAddress?.phone || o.user?.phone || "";
                      const itemsCount = Array.isArray(o.orderItems) ? o.orderItems.length : 1;

                      return (
                        <tr key={o._id} className="hover:bg-neutral-50/70 transition">
                          <td className="py-3 px-2 font-mono font-bold text-neutral-900 text-xs">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(o)}
                              className="text-[var(--brand-700)] hover:underline"
                            >
                              {o.orderNumber || `#${o._id?.slice(-8).toUpperCase()}`}
                            </button>
                          </td>
                          <td className="py-3 px-2">
                            <div className="font-semibold text-neutral-900 text-xs">{customerName}</div>
                            {customerPhone && <div className="text-[11px] text-neutral-400">{customerPhone}</div>}
                          </td>
                          <td className="py-3 px-2 text-xs text-neutral-600">
                            {itemsCount} {itemsCount === 1 ? "item" : "items"}
                          </td>
                          <td className="py-3 px-2 text-xs text-neutral-500">{formatDate(o.createdAt)}</td>
                          <td className="py-3 px-2 font-extrabold text-neutral-900 text-xs">
                            {formatCurrency(o.grandTotal || o.orderPrice || 0)}
                          </td>
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <select
                                value={currentStatus}
                                disabled={isUpdating}
                                onChange={(e) => handleStatusUpdate(o._id, e.target.value)}
                                className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border outline-none cursor-pointer capitalize ${
                                  currentStatus === "delivered"
                                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                    : currentStatus === "cancelled"
                                    ? "bg-rose-50 text-rose-800 border-rose-200"
                                    : "bg-white text-neutral-800 border-neutral-300 focus:border-[var(--brand-600)]"
                                }`}
                              >
                                {ORDER_STATUSES.map((st) => (
                                  <option key={st} value={st} className="capitalize bg-white text-neutral-900">
                                    {st}
                                  </option>
                                ))}
                              </select>
                              {isUpdating && (
                                <div className="w-3.5 h-3.5 border-2 border-[var(--brand-600)] border-t-transparent rounded-full animate-spin" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(o)}
                              className="btn-outline py-1 px-2.5 text-xs font-semibold"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-neutral-200">
                  <div className="text-xs text-neutral-500">
                    Page {page} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="btn-outline py-1.5 px-3 text-xs"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </button>
                    <button
                      className="btn-outline py-1.5 px-3 text-xs"
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-200 sticky top-0 bg-white">
              <div>
                <div className="text-base font-extrabold text-neutral-900">
                  Order {selectedOrder.orderNumber || `#${selectedOrder._id?.slice(-8).toUpperCase()}`}
                </div>
                <div className="text-xs text-neutral-500">Placed on {formatDate(selectedOrder.createdAt)}</div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-neutral-400 hover:text-neutral-700 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="p-5 space-y-5 text-sm">
              {/* Dynamic Status Bar */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-neutral-500 uppercase">Current Status</div>
                  <Badge variant={statusVariant(selectedOrder.orderStatus || selectedOrder.status)}>
                    {selectedOrder.orderStatus || selectedOrder.status || "pending"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-700">Change Status:</span>
                  <select
                    value={(selectedOrder.orderStatus || selectedOrder.status || "pending").toLowerCase()}
                    onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                    className="border border-neutral-300 rounded-xl px-3 py-1.5 text-xs font-bold bg-white outline-none capitalize"
                  >
                    {ORDER_STATUSES.map((st) => (
                      <option key={st} value={st} className="capitalize">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer & Shipping Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-neutral-200">
                  <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Customer Info</div>
                  <div className="font-bold text-neutral-900">
                    {selectedOrder.shippingAddress?.fullName || selectedOrder.customer?.user_name || "Customer"}
                  </div>
                  <div className="text-xs text-neutral-600">{selectedOrder.customer?.email || selectedOrder.user?.email || "No email"}</div>
                  <div className="text-xs text-neutral-600">{selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || "No phone"}</div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-neutral-200">
                  <div className="text-xs font-bold text-neutral-500 uppercase mb-1">Delivery Address</div>
                  <div className="text-xs text-neutral-700 leading-relaxed">
                    {selectedOrder.shippingAddress?.street || selectedOrder.shippingAddress?.addressLine1 || ""}<br />
                    {selectedOrder.shippingAddress?.city && `${selectedOrder.shippingAddress.city}, `}
                    {selectedOrder.shippingAddress?.state && `${selectedOrder.shippingAddress.state} `}
                    {selectedOrder.shippingAddress?.postalCode || selectedOrder.shippingAddress?.pincode || ""}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <div className="text-xs font-bold text-neutral-500 uppercase mb-2">Order Items</div>
                <div className="border border-neutral-200 rounded-2xl divide-y divide-neutral-100 overflow-hidden">
                  {(selectedOrder.orderItems || []).map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-bold text-neutral-900">{item.product_name || item.product?.product_name || "Product"}</div>
                        <div className="text-neutral-500">
                          Pack: {item.selected_size || item.size || "Standard"}
                          {item.selected_potency ? ` · Potency: ${item.selected_potency}` : ""}
                          {" · "}Qty: {item.quantity}
                        </div>
                      </div>
                      <div className="font-bold text-neutral-900">
                        {formatCurrency((item.selling_price || item.price || 0) * (item.quantity || 1))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="bg-neutral-50 p-4 rounded-2xl border border-neutral-200 flex justify-between items-center">
                <div className="text-xs text-neutral-500">
                  Payment Method: <span className="font-bold text-neutral-800 uppercase">{selectedOrder.paymentMethod || "COD"}</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neutral-500">Grand Total</div>
                  <div className="text-lg font-extrabold text-[var(--brand-700)]">
                    {formatCurrency(selectedOrder.grandTotal || selectedOrder.orderPrice || 0)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
