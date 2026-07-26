const fs = require('fs');

// Fix OrderSuccess.jsx - rewrite entirely
const successContent = `import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function OrderSuccess() {
  const navigate = useNavigate();

  const order = useMemo(() => {
    try {
      const raw = localStorage.getItem("kent_order");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Signal Profile page to refresh orders when user visits it
  useEffect(() => {
    localStorage.setItem("kent_order_placed", "true");
  }, []);

  // Use real order data from backend response
  const orderNumber = order?.orderNumber || order?.id || "ORD-000000";
  const orderAmount = order?.grandTotal || order?.orderPrice || 0;
  const paymentMethod = order?.paymentMethod || "";
  const paymentStatus = order?.paymentStatus || "";
  const shippingAddr = order?.shippingAddress || null;
  const eta = order?.estimatedDelivery || "";

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <style>{\`
        @keyframes popIn{0%{transform:scale(.7);opacity:0}60%{transform:scale(1.07);opacity:1}100%{transform:scale(1);opacity:1}}
        .pop{animation:popIn .55s ease both}
        .glow{filter: drop-shadow(0 10px 18px rgba(22,163,74,.25))}
      \`}</style>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 sm:px-10 py-10 sm:py-12">
            <div className="flex flex-col items-center text-center">
              <div className="pop glow w-24 h-24 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center relative">
                <svg
                  className="w-12 h-12 text-emerald-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>

              <h1 className="serif text-3xl sm:text-4xl font-black text-slate-900 mt-6">
                Order Placed Successfully
              </h1>

              <p className="text-slate-500 mt-3 max-w-xl text-sm sm:text-base">
                Thank you! Your medicine order is confirmed. We are processing it for dispatch.
              </p>

              <div className="mt-7 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left">
                  <p className="text-xs text-slate-400">Order Number</p>
                  <p className="font-black text-slate-900 text-lg mt-1">{orderNumber}</p>
                  {paymentMethod && <p className="text-xs text-slate-500 mt-1">Payment: {paymentMethod}</p>}
                  {paymentStatus && (
                    <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-1 " + (paymentStatus === "Paid" || paymentStatus === "Completed" ? "bg-emerald-100 text-emerald-700" : paymentStatus === "Failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700")}>
                      {paymentStatus}
                    </span>
                  )}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left">
                  <p className="text-xs text-slate-400">Amount Paid</p>
                  <p className="font-black text-slate-900 text-lg mt-1">&#8377;{Number(orderAmount).toFixed(0)}</p>
                  <p className="text-xs text-slate-500 mt-1">{eta || "Estimated delivery: 2-3 days"}</p>
                </div>

              {shippingAddr && (
                <div className="mt-4 w-full max-w-2xl bg-slate-50 rounded-2xl border border-slate-200 px-5 py-4 text-left">
                  <p className="text-xs text-slate-400 font-semibold mb-1">Delivery Address</p>
                  <p className="font-semibold text-slate-900 text-sm">{shippingAddr.fullName}</p>
                  <p className="text-xs text-slate-600">{shippingAddr.house}, {shippingAddr.street}</p>
                  <p className="text-xs text-slate-600">{shippingAddr.city}, {shippingAddr.state} - {shippingAddr.pincode}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{shippingAddr.phone}</p>
                </div>
              )}

              <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
                <button
                  onClick={() => navigate("/")}
                  className="shine w-full sm:w-auto flex-1 py-4 text-white font-black rounded-2xl text-[15px] shadow-lg hover:shadow-xl active:scale-[0.99] transition-all"
                  style={{ background: "linear-gradient(135deg,#16a34a 0%,#059669 60%,#047857 100%)" }}
                >
                  Continue Shopping
                </button>

                <button
                  onClick={() => navigate("/Profile", { state: { tab: "orders" } })}
                  className="btn-outline w-full sm:w-auto sm:flex-none"
                  style={{ padding: "14px 18px" }}
                >
                  View My Orders
                </button>
              </div>
<p className="mt-4 text-[10px] text-slate-400">
                {tick < 3 ? "" : ""}
                Secure flow
              </p>
            </div>
        </div>
      </main>
    </div>
  );
}
`;

fs.writeFileSync('c:/Users/Asish/OneDrive/Desktop/Kent web/Project/src/pages/OrderSuccess.jsx', successContent, 'utf8');
console.log('OrderSuccess.jsx rewritten successfully');

// Fix OrderTracking.jsx - fix the corrupt className
let tracking = fs.readFileSync('c:/Users/Asish/OneDrive/Desktop/Kent web/Project/src/pages/OrderTracking.jsx', 'utf8');
// Fix the corrupted span: "mt-1 p">" should be "mt-1 " + (...paymentStatus...
tracking = tracking.replace(
  'mt-1 p"> + (order.paymentStatus',
  'mt-1 " + (order.paymentStatus'
);
fs.writeFileSync('c:/Users/Asish/OneDrive/Desktop/Kent web/Project/src/pages/OrderTracking.jsx', tracking, 'utf8');
console.log('OrderTracking.jsx fixed');
