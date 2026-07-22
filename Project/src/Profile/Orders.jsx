import { useMemo } from "react";
import { CheckCircle, Truck, MapPin, ShoppingBag } from "lucide-react";
import EmptyState from "../components/EmptyState";

const STATUS_PROGRESS = {
  Delivered: "100%",
  Shipped: "65%",
  Processing: "30%",
};

const STATUS_STYLE = {
  Delivered: "bg-emerald-100 text-emerald-700",
  Shipped: "bg-blue-100 text-blue-700",
  Processing: "bg-amber-100 text-amber-700",
};

export default function Orders({ orders = [] }) {
  const list = useMemo(() => Array.isArray(orders) ? orders : [], [orders]);

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
        <h2 className="text-xl font-bold text-gray-800">Order Status</h2>
      </div>

      <div className="space-y-4">
        {list.map((o) => (
          <div key={o.id} className="bg-white rounded-3xl shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 border flex items-center justify-center">
                  <CheckCircle size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Order</p>
                  <p className="text-gray-800 font-bold">{o.id}</p>
                  <p className="text-gray-500 text-sm mt-1">{o.name}</p>
                  <p className="text-gray-500 text-sm">{o.brand}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${STATUS_STYLE[o.status] || "bg-gray-100 text-gray-700"}`}>
                    <Truck size={14} className="mr-2" />
                    {o.status}
                  </span>
                </div>

                <div className="min-w-[160px]">
                  <p className="text-xs text-gray-400 uppercase font-semibold">Progress</p>
                  <div className="mt-2">
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{ width: STATUS_PROGRESS[o.status] ? STATUS_PROGRESS[o.status] : "30%" }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{STATUS_PROGRESS[o.status] || "30%"}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Order Date</p>
                  <p className="text-gray-800 font-semibold mt-1">{o.date}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Amount</p>
                  <p className="text-gray-800 font-semibold mt-1">{o.price}</p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end">
              <button
                type="button"
                className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-2xl font-semibold transition"
              >
                Track Order <MapPin size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

