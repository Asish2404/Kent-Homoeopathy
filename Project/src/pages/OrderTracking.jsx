import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Package, ChevronLeft, CheckCircle, AlertCircle, RefreshCw, MapPin } from "lucide-react";
import api from "../services/api";
import {
  STATUS_PROGRESS,
  STATUS_STYLE,
  getStatusDisplay,
} from "../Profile/ProfileUtils";

function formatDate(dateStr) {
  if (!dateStr) return "\u2014";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatPrice(amount) {
  const num = Number(amount);
  if (isNaN(num)) return "\u2014";
  return "\u20B9" + num.toFixed(num % 1 === 0 ? 0 : 2);
}

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/orders/" + orderId);
      const data = response.data;
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const getItems = () => {
    if (!order) return [];
    return order.orderItems || order.products || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-neutral-200 rounded w-48" />
            <div className="h-64 bg-neutral-200 rounded-3xl" />
            <div className="h-48 bg-neutral-200 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Unable to Load Order</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button onClick={fetchOrder} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold transition">
            <RefreshCw size={16} />
            Retry
          </button>
          <button onClick={() => navigate("/Profile", { state: { tab: "orders" } })} className="inline-flex items-center gap-2 ml-3 border border-gray-200 text-gray-700 px-6 py-3 rounded-2xl font-semibold transition hover:bg-gray-50">
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusDisplay = getStatusDisplay(order.orderStatus || order.status);
  const progress = STATUS_PROGRESS[statusDisplay] || "0%";
  const statusStyle = STATUS_STYLE[statusDisplay] || "bg-gray-100 text-gray-700";
  const items = getItems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <button
          onClick={() => navigate("/Profile", { state: { tab: "orders" } })}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition mb-6"
        >
          <ChevronLeft size={20} />
          <span className="font-semibold">Back to Orders</span>
        </button>

<div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 uppercase font-semibold">Order Number</p>
              <h1 className="text-2xl font-bold text-gray-800 mt-1">{order.orderNumber || "\u2014"}</h1>
            </div>
            <span className={"inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold " + statusStyle}>
              <CheckCircle size={16} className="mr-2" />
              {statusDisplay}
            </span>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-400 uppercase font-semibold">Progress</p>
              <span className="text-xs font-semibold text-gray-600">{progress}</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: progress }} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 uppercase font-semibold">Order Date</p>
              <p className="text-gray-800 font-bold mt-1">{formatDate(order.createdAt || order.orderedDate)}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 uppercase font-semibold">Grand Total</p>
              <p className="text-gray-800 font-bold mt-1">{formatPrice(order.grandTotal || order.orderPrice)}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 uppercase font-semibold">Payment</p>
              <p className="text-gray-800 font-bold mt-1">{order.paymentMethod || "\u2014"}</p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 uppercase font-semibold">Payment Status</p>
              <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-1 " + (order.paymentStatus === "Paid" || order.paymentStatus === "Completed" ? "bg-emerald-100 text-emerald-700" : order.paymentStatus === "Failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700")}>
                {getStatusDisplay(order.paymentStatus || "Pending")}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Order Items</h2>
          <div className="space-y-4">
            {items.map((item, idx) => {
              const product = item.productId || {};
              return (
                <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-white border flex items-center justify-center overflow-hidden flex-shrink-0">
                    {(item.productImage || product.product_image) ? (
                      <img src={item.productImage || product.product_image} alt={item.productName || product.product_name} className="w-full h-full object-contain" loading="lazy" />
                    ) : (
                      <Package size={24} className="text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{item.productName || product.product_name || "Product"}</p>
                    {product.brand && <p className="text-xs text-gray-500">{product.brand}</p>}
                    <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">{formatPrice(item.discountPrice || product.discount_price || 0)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {order.shippingAddress && (
          <div className="bg-white rounded-3xl shadow-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-emerald-600" />
              Shipping Address
            </h2>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-1">
              <p className="font-semibold text-gray-800">{order.shippingAddress.fullName}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
              <p className="text-sm text-gray-600">{order.shippingAddress.house}, {order.shippingAddress.street}</p>
              {order.shippingAddress.landmark && <p className="text-sm text-gray-600">{order.shippingAddress.landmark}</p>}
              <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
