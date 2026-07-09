import { useEffect, useMemo, useState } from "react";
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

  const orderId = order?.id || "DK000000";
  const eta = order?.estimatedDelivery || "";

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <style>{`
        @keyframes popIn{0%{transform:scale(.7);opacity:0}60%{transform:scale(1.07);opacity:1}100%{transform:scale(1);opacity:1}}
        .pop{animation:popIn .55s ease both}
        .glow{filter: drop-shadow(0 10px 18px rgba(22,163,74,.25))}
      `}</style>

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
                Thank you! Your medicine order is confirmed. We’re processing it for dispatch.
              </p>

              <div className="mt-7 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left">
                  <p className="text-xs text-slate-400">Order ID</p>
                  <p className="font-black text-slate-900 text-lg mt-1">{orderId}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left">
                  <p className="text-xs text-slate-400">Estimated Delivery</p>
                  <p className="font-black text-slate-900 text-lg mt-1">{eta || "2-3 days"}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-2xl">
                <button
                  onClick={() => navigate("/")}
                  className="shine w-full sm:w-auto flex-1 py-4 text-white font-black rounded-2xl text-[15px] shadow-lg hover:shadow-xl active:scale-[0.99] transition-all"
                  style={{ background: "linear-gradient(135deg,#16a34a 0%,#059669 60%,#047857 100%)" }}
                >
                  Continue Shopping
                </button>

                <button
                  onClick={() => navigate("/Products")}
                  className="btn-outline w-full sm:w-auto sm:flex-none"
                  style={{ padding: "14px 18px" }}
                >
                  View Orders
                </button>
              </div>

              <p className="mt-4 text-[10px] text-slate-400">
                {tick < 3 ? "" : ""}
                Secure & dummy checkout flow — no real payment was processed.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

