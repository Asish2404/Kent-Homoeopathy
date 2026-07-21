const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "src", "pages", "Payment.jsx");

const content = `import { useEffect, useMemo, useState, useCallback } from "react";
import { useCartContext } from "../Cart/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const PAYMENT_METHODS = [
  "Razorpay", "UPI", "Google Pay", "PhonePe", "Paytm",
  "Credit Card", "Debit Card", "Net Banking", "Cash on Delivery",
];

function onlyDigits(s) {
  return String(s).replace(/\\D/g, "");
}

function normalizeCardNumber(v) {
  const digits = onlyDigits(v).slice(0, 19);
  return digits.replace(/(\\d{4})(?=\\d)/g, "$1 ").trim();
}

function formatExpiry(v) {
  const digits = onlyDigits(v).slice(0, 4);
  if (digits.length <= 2) return digits;
  return \`\${digits.slice(0, 2)}/\${digits.slice(2)}\`;
}

function validateCardNumber(v) {
  return onlyDigits(v).length >= 12;
}

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => { console.error("Failed to load Razorpay SDK"); resolve(false); };
    document.body.appendChild(s);
  });
}

export default function Payment() {
  const cart = useCartContext();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const inStock = useMemo(() => items.filter((it) => it.inStock !== false), [items]);
  const empty = inStock.length === 0;

  const mrpTotal = inStock.reduce((s, it) => s + Number(it.mrp || 0) * Number(it.qty || 1), 0);
  const discTotal = inStock.reduce((s, it) => s + (Number(it.mrp || 0) - Number(it.price || 0)) * Number(it.qty || 1), 0);
  const sub = mrpTotal - discTotal;

  const [appliedPayload] = useState(() => {
    try { const r = localStorage.getItem("kent_checkout"); return r ? JSON.parse(r) : null; } catch { return null; }
  });

  const [couponApplied] = useState(() => {
    try { const r = localStorage.getItem("kent_coupon"); return r ? JSON.parse(r) : null; } catch { return null; }
  });

  const couponSave = couponApplied ? Number(couponApplied.discountAmount) : 0;
  const delivery = sub > 499 ? 0 : 49;
  const platform = 5;
  const grand = sub - couponSave + delivery + platform;

  const [method, setMethod] = useState("Razorpay");
  const [busy, setBusy] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => { loadRazorpayScript(); }, []);

  const validate = () => {
    const e = {};
    const isCod = method === "Cash on Delivery";
    if (!isCod && method !== "Razorpay") {
      if (["UPI", "Google Pay", "PhonePe", "Paytm"].includes(method)) {
        if (!upiId.trim()) e.upiId = "UPI ID is required.";
        else if (!/^[\\w.-]{2,}@[\\w.-]{2,}$/.test(upiId.trim())) e.upiId = "Enter a valid UPI ID (name@bank).";
      } else if (["Credit Card", "Debit Card"].includes(method)) {
        if (!validateCardNumber(cardNumber)) e.cardNumber = "Enter a valid card number.";
        if (!cardHolderName.trim()) e.cardHolderName = "Card holder name is required.";
        if (!/^\\d{2}\\/\\d{2}$/.test(expiry)) e.expiry = "Expiry must be in MM/YY.";
        if (onlyDigits(cvv).length < 3) e.cvv = "CVV must be 3-4 digits.";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const placeOrderOnBackend = useCallback(async () => {
    if (!appliedPayload) throw new Error("Checkout information missing. Please go back to checkout.");
    const { data } = await api.post("/orders/place", {
      shippingAddress: appliedPayload,
      paymentMethod: method,
      paymentStatus: "Pending",
      orderStatus: "pending",
    });
    return data;
  }, [appliedPayload, method]);

  const handleRazorpayPayment = useCallback(async (orderData) => {
    const orderId = orderData.order?._id || orderData.order?.id;
    const { data: rzpData } = await api.post("/payment/create-order", {
      amount: grand, currency: "INR", paymentFor: "ORDER", referenceId: orderId,
    });
    if (!rzpData.success) throw new Error(rzpData.message || "Failed to create Razorpay order");

    return new Promise((resolve, reject) => {
      const rzp = new window.Razorpay({
        key: rzpData.key,
        amount: rzpData.amount * 100,
        currency: rzpData.currency || "INR",
        name: "Dr. Kent Homoeopharmacy",
        description: "Medicine Order Payment",
        order_id: rzpData.orderId,
        prefill: { name: appliedPayload?.fullName || "", email: appliedPayload?.email || "", contact: appliedPayload?.phone || "" },
        theme: { color: "#16a34a" },
        handler: async function (response) {
          try {
            await api.post("/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            resolve(response);
          } catch (err) {
            reject(new Error("Payment verification failed: " + (err.response?.data?.message || err.message)));
          }
        },
        modal: { ondismiss: function () { reject(new Error("Payment cancelled by user")); } },
      });
      rzp.open();
    });
  }, [grand, appliedPayload]);

  const onPay = async () => {
    if (empty) { navigate("/cart"); return; }
    if (!validate()) return;
    setBusy(true);
    setOrderError("");

    try {
      const orderData = await placeOrderOnBackend();
      const orderId = orderData.order?._id || orderData.order?.id;

      if (method === "Razorpay") {
        await handleRazorpayPayment(orderData);
      } else if (method === "Cash on Delivery") {
        await api.patch(\`/orders/\${orderId}/status\`, { orderStatus: "confirmed" });
      } else {
        await new Promise((r) => setTimeout(r, 700));
        await api.patch(\`/orders/\${orderId}/status\`, { orderStatus: "confirmed" });
      }

      const orderNumber = orderData.order?.orderNumber || \`DK\${Math.floor(100000 + Math.random() * 900000)}\`;
      const estimated = new Date();
      estimated.setDate(estimated.getDate() + 3);
      localStorage.setItem("kent_order", JSON.stringify({
        id: orderNumber, orderId, amount: grand, method,
        estimatedDelivery: estimated.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" }),
        createdAt: Date.now(),
      }));

      try { cart.clearCart?.(); } catch { /* ignore */ }
      navigate("/order-success");
    } catch (err) {
      setOrderError(err.response?.data?.message || err.message || "Payment failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const isCod = method === "Cash on Delivery";
  const isRazorpay = method === "Razorpay";
  const showUpi = ["UPI", "Google Pay", "PhonePe", "Paytm"].includes(method);
  const showCard = ["Credit Card", "Debit Card"].includes(method);

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-xs text-slate-400">
        <span className="hover:text-slate-600 cursor-pointer transition-colors" role="link" tabIndex={0} onClick={() => navigate("/")}>Home</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-700 font-semibold">Payment</span>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-28">
        <div className="flex items-baseline justify-between gap-3 mb-6 flex-wrap">
          <h1 className="serif text-2xl text-slate-900">Payment</h1>
          <p className="text-xs text-slate-400 font-medium">Choose a payment method</p>
        </div>

        {orderError && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 px-5 py-4">
            <p className="text-sm font-semibold text-red-700">{orderError}</p>
            <button className="text-xs text-red-600 underline mt-1" onClick={() => setOrderError("")}>Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT */}
          <section className="lg:col-span-7 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <h2 className="font-bold text-slate-800 text-base">Payment Methods</h2>
                <p className="text-xs text-slate-400 mt-0.5">Select your preferred method</p>
              </div>
              <div className="px-5 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((m) => {
                    const active = method === m;
                    return (
                      <button key={m} type="button" onClick={() => setMethod(m)}
                        className={"rounded-2xl border px-4 py-4 text-left transition card focus-visible:outline-emerald-500 " + (active ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50")}
                        aria-pressed={active}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{m}</p>
                            <p className="text-xs text-slate-500 mt-1">{m === "Cash on Delivery" ? "Pay at doorstep" : m === "Razorpay" ? "Cards, UPI, NetBanking" : "Fast & secure"}</p>
                          </div>
                          {active ? (
                            <svg className="w-5 h-5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : (
                            <span className="w-5 h-5 rounded-full border border-slate-200" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
            </div>

            {isRazorpay && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 text-base">Razorpay</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Pay via Credit/Debit Card, UPI, Net Banking, Wallet</p>
                </div>
                <div className="px-5 py-5">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-bold text-emerald-900">Secure Payment Gateway</p>
                        <p className="text-xs text-emerald-800 mt-1 font-semibold">You will be redirected to Razorpay checkout to complete payment securely.</p>
                      </div>
                  </div>
              </div>
            )}

            {showUpi && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 text-base">UPI</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Enter your UPI ID</p>
                </div>
                <div className="px-5 py-5">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-800">UPI ID</span>
                    <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@bank"
                      className={"mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 " + (errors.upiId ? "border-red-200 focus:ring-red-100" : "border-slate-200")}
                    />
                    {errors.upiId && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.upiId}</p>}
                  </label>
                </div>
            )}

            {showCard && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 text-base">Card Payment</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Enter card details</p>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-800">Card Number</span>
                    <input value={cardNumber} onChange={(e) => setCardNumber(normalizeCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" inputMode="numeric"
                      className={"mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 " + (errors.cardNumber ? "border-red-200 focus:ring-red-100" : "border-slate-200")}
                    />
                    {errors.cardNumber && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.cardNumber}</p>}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-800">Card Holder Name</span>
                      <input value={cardHolderName} onChange={(e) => setCardHolderName(e.target.value)} placeholder="John Doe"
                        className={"mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 " + (errors.cardHolderName ? "border-red-200 focus:ring-red-100" : "border-slate-200")}
                      />
                      {errors.cardHolderName && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.cardHolderName}</p>}
                    </label>
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-800">Expiry Date</span>
                      <input value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} placeholder="MM/YY" inputMode="numeric"
                        className={"mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 " + (errors.expiry ? "border-red-200 focus:ring-red-100" : "border-slate-200")}
                      />
                      {errors.expiry && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.expiry}</p>}
                    </label>
                  </div>
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-800">CVV</span>
                    <input value={cvv} onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, 4))} placeholder="123" inputMode="numeric"
                      className={"mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 " + (errors.cvv ? "border-red-200 focus:ring-red-100" : "border-slate-200")}
                    />
                    {errors.cvv && <p className="mt-1 text-xs text-red-600 font-semibold">{errors.cvv}</p>}
                  </label>
                </div>
            )}

            {method === "Net Banking" && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 text-base">Net Banking</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Select your bank</p>
                </div>
                <div className="px-5 py-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["SBI", "HDFC", "ICICI", "Axis"].map((b) => (
                      <div key={b} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <p className="text-sm font-bold text-slate-800">{b}</p>
                        <p className="text-xs text-slate-500 mt-1">Available</p>
                      </div>
                    ))}
                  </div>
              </div>
            )}

            {isCod && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 text-base">Cash on Delivery</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Pay when you receive</p>
                </div>
                <div className="px-5 py-5">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m2 0a7 7 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm font-bold text-emerald-900">Pay at doorstep</p>
                        <p className="text-xs text-emerald-800 mt-1 font-semibold">Your order will be placed and you can pay in cash when it arrives.</p>
                      </div>
                  </div>
              </div>
            )}
          </section>

          {/* RIGHT summary */}
          <aside className="lg:col-span-5 space-y-5">
            <div className="lg:sticky lg:top-[72px] space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 text-base">Payment Summary</h2>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Total Amount</span>
                    <span className="font-black text-slate-900">₹{grand.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Payment Method</span>
                    <span className="font-semibold text-slate-800">{method}</span>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <button onClick={onPay} disabled={busy || empty}
                    className="shine w-full py-4 text-white font-black rounded-2xl text-[15px] shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg,#16a34a 0%,#059669 60%,#047857 100%)" }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {busy ? "Processing\\u2026" : isRazorpay ? "Pay with Razorpay" : "Place Order"}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                  <p className="text-center text-[10px] text-slate-400 font-medium">
                    {isRazorpay ? "Secured by Razorpay" : \`\${method} \\u00B7 Backend integrated\`}
                  </p>
                </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 text-base">Need to edit?</h2>
                </div>
                <div className="px-5 py-5">
                  <button onClick={() => navigate("/checkout")}
                    className="btn-outline w-full" style={{ padding: 14, borderRadius: 16 }}>
                    Back to Checkout
                  </button>
                </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile sticky bar */}
      {!empty && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-3 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Payable</p>
              <p className="text-xl font-black text-slate-900">₹{grand.toFixed(0)}</p>
            </div>
            <button onClick={onPay} disabled={busy}
              className="shine flex-1 max-w-xs py-3.5 text-white font-black rounded-2xl text-sm shadow-lg disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#16a34a,#059669)" }}
            >
              {busy ? "Processing\\u2026" : "Pay Now"}
            </button>
          </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync(filePath, content + "\r\n", "utf8");
console.log("Payment.jsx has been rewritten successfully!");
