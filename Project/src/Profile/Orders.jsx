import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Truck, MapPin, ShoppingBag, RefreshCw, AlertCircle } from "lucide-react";
import EmptyState from "../components/EmptyState";
import { OrderCardSkeleton } from "../components/LoadingSkeleton";
import {
  STATUS_PROGRESS,
  STATUS_STYLE,
  STATUS_ICON_COLOR,
  getStatusDisplay,
} from "./ProfileUtils";

function formatDate(dateStr) {
  if (!dateStr) return "—";
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
  if (isNaN(num)) return "—";
  return `₹${num.toFixed(num % 1 === 0 ? 0 : 2)}`;
}

function getProductList(order) {
  const items = order.orderItems || order.products || [];
  if (!Array.isArray(items) || items.length === 0) {
    return [{ name: "Product", brand: "", image: "", qty: 1 }];
  }
  return items.map((item) => {
    const product = item.productId || {};
    return {
      name: item.productName || product.product_name || "Product",
      brand: product.brand || "",
      image: item.productImage || product.product_image || "",
      qty: item.quantity || 1,
    };
  });
}

function getOrderStatus(order) {
  const status = order.orderStatus || order.status || "Pending";
  return getStatusDisplay(status);
}

export default function Orders({ orders = [], loading = false, error = null, onRetry = null }) {
  const navigate = useNavigate();
  const list = useMemo(() => (Array.isArray(orders) ? orders : []), [orders]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Order Status</h2>
        </div>
        <div className="space-y-4">
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Order Status</h2>
        </div>
        <div className="bg-white rounded-3xl shadow-md p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">Failed to Load Orders</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            {error || "Something went wrong while fetching your orders. Please try again."}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold transition"
            >
              <RefreshCw size={16} />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (!list.length) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No orders yet"
        description="Browse our products and place your first order."
        actionLabel="Continue Shopping"
        action={() => (window.location.href = "/Products")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">My Orders</h2>
        <span className="text-sm text-gray-500 font-medium">{list.length} order{list.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="space-y-4">
        {list.map((o) => {
          const statusDisplay = getOrderStatus(o);
          const progress = STATUS_PROGRESS[statusDisplay] || "30%";
          const statusStyle = STATUS_STYLE[statusDisplay] || "bg-gray-100 text-gray-700";
          const iconColor = STATUS_ICON_COLOR[statusDisplay] || "text-gray-600";
          const productList = getProductList(o);
          const firstProduct = productList[0];
          const extraCount = productList.length - 1;

          return (
            <div key={o._id || o.orderNumber} className="bg-white rounded-3xl shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 border flex items-center justify-center overflow-hidden flex-shrink-0">
                    {firstProduct.image ? (
                      <img
                        src={firstProduct.image}
                        alt={firstProduct.name}
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    ) : (
                      <CheckCircle size={20} className={iconColor} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 uppercase font-semibold">
                      Order {o.orderNumber ? `#${o.orderNumber}` : ""}
                    </p>
                    <p className="text-gray-800 font-bold truncate">{firstProduct.name}</p>
                    {firstProduct.brand && (
                      <p className="text-gray-500 text-sm">{firstProduct.brand}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-0.5">Qty: {firstProduct.qty}</p>
                    {extraCount > 0 && (
                      <p className="text-emerald-600 text-xs font-semibold mt-0.5">
                        +{extraCount} more item{extraCount > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-wrap">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Status</p>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold mt-1 ${statusStyle}`}
                    >
                      <Truck size={14} className="mr-1.5" />
                      {statusDisplay}
                    </span>
                  </div>

                  <div className="min-w-[140px]">
                    <p className="text-xs text-gray-400 uppercase font-semibold">Progress</p>
                    <div className="mt-2">
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: progress }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{progress}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Order Date</p>
                    <p className="text-gray-800 font-semibold mt-1 text-sm whitespace-nowrap">
                      {formatDate(o.createdAt || o.orderedDate || o.date)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400 uppercase font-semibold">Amount</p>
                    <p className="text-gray-800 font-bold mt-1">
                      {formatPrice(o.grandTotal || o.orderPrice || o.price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                {o.paymentMethod && (
                  <span className="inline-flex items-center gap-1 text-gray-500">
                    <span className="font-semibold text-gray-600">Payment:</span> {o.paymentMethod}
                  </span>
                )}
                {o.paymentStatus && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      o.paymentStatus === "Paid" || o.paymentStatus === "Completed"
                        ? "bg-emerald-100 text-emerald-700"
                        : o.paymentStatus === "Failed"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {getStatusDisplay(o.paymentStatus)}
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/orders/${o._id}`)}
                  className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-2xl font-semibold transition"
                >
                  Track Order <MapPin size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

