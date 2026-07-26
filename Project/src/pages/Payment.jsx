import { useEffect, useMemo, useState, useCallback } from "react";
import { useCartContext } from "../Cart/CartContext";
import { STORAGE_KEY } from "../Cart/cartUtils";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const FREE_DELIVERY_THRESHOLD = 499;
const STANDARD_DELIVERY_CHARGE = 49;
const KENT_SHIPPING_DISCOUNT = 50;
const COD_CHARGE = 50;

const PAYMENT_METHODS = [
  "Razorpay", "UPI", "Google Pay", "PhonePe", "Paytm",
  "Credit Card", "Debit Card", "Net Banking", "Cash on Delivery",
];

function onlyDigits(s) {
  return String(s).replace(/\D/g, "");
}

function normalizeCardNumber(v) {
  const digits = onlyDigits(v).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiry(v) {
  const digits = onlyDigits(v).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
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
  const cartHasKentProduct = useMemo(() => inStock.some((item) => item.isKentProduct), [inStock]);

  const mrpTotal = inStock.reduce((s, it) => s + Number(it.mrp || 0) * Number(it.qty || 1), 0);
  const discTotal = inStock.reduce((s, it) => s + (Number(it.mrp || 0) - Number(it.price || 0)) * Number(it.qty || 1), 0);
  const sub = mrpTotal - discTotal;

  const [method, setMethod] = useState("Razorpay");

  const isRazorpay = method === "Razorpay";
  const isCod = method === "Cash on Delivery";
  const showUpi = method.startsWith("UPI") || ["Google Pay", "PhonePe", "Paytm"].includes(method);
  const showCard = method === "Credit Card" || method === "Debit Card";

  const [appliedPayload] = useState(() => {
    try { const r = localStorage.getItem("kent_checkout"); return r ? JSON.parse(r) : null; } catch { return null; }
  });

  const [couponApplied] = useState(() => {
    try { const r = localStorage.getItem("kent_coupon"); return r ? JSON.parse(r) : null; } catch { return null; }
  });

  const couponSave = couponApplied ? Number(couponApplied.discountAmount) : 0;
  const deliveryBase = sub >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_CHARGE;
  const delivery = Math.max(0, deliveryBase - (cartHasKentProduct ? KENT_SHIPPING_DISCOUNT : 0));
  const platform = 5;
  const codCharge = isCod ? COD_CHARGE : 0;
  const grand = sub - couponSave + delivery + platform + codCharge;

  const [busy, setBusy] = useState(false);
  const [orderError, setOrderError] = useState("");

  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [errors, setErrors] = useState({});

const validateUpi = useCallback(() => {
    const e = {};
    if (showUpi && !upiId.includes("@")) e.upiId = "Enter a valid UPI ID (e.g., name@bank)";
    setErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  }, [showUpi, upiId]);

  const validateCard = useCallback(() => {
    const e = {};
    if (showCard) {
      if (!validateCardNumber(cardNumber)) e.cardNumber = "Enter a valid card number";
      if (!cardHolderName.trim()) e.cardHolderName = "Enter cardholder name";
      if (expiry.length < 5) e.expiry = "Enter a valid expiry";
      if (cvv.length < 3) e.cvv = "Enter a valid CVV";
    }
    setErrors((prev) => ({ ...prev, ...e }));
    return Object.keys(e).length === 0;
  }, [showCard, cardNumber, cardHolderName, expiry, cvv]);

  const onPay = useCallback(async () => {
    setOrderError("");
    setErrors({});

    if (!validateUpi() || !validateCard()) return;

    setBusy(true);

    try {
      const checkout = appliedPayload || (() => {
        try { return JSON.parse(localStorage.getItem("kent_checkout")); } catch { return null; }
      })();
      if (!checkout) {
        setOrderError("Checkout data missing. Please go back to checkout.");
        setBusy(false);
        return;
      }

      if (isRazorpay) {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          setOrderError("Failed to load Razorpay SDK. Please try again.");
          setBusy(false);
          return;
        }

        const { data: order } = await api.post("/payment/create-order", {
          amount: Math.round(grand * 100),
          currency: "INR",
          receipt: `rcpt_${Date.now()}`,
          notes: { checkoutPayload: JSON.stringify(checkout) },
        });

        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
          amount: order.amount,
          currency: order.currency,
          name: "Kent Homoeopharmacy",
          description: "Medicine Order Payment",
          order_id: order.id,
          prefill: {
            name: checkout.shippingAddress?.fullName || "",
            email: checkout.shippingAddress?.email || "",
            contact: checkout.shippingAddress?.phone || "",
          },
          theme: { color: "#16a34a" },
          handler: async function (response) {
            try {
              const verifyRes = await api.post("/payment/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                checkoutPayload: checkout,
              });
              // Clear cart after successful payment
              cart.clearCart();
              localStorage.removeItem("kent_cart");
              try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
              localStorage.removeItem("kent_checkout");
              localStorage.removeItem("kent_coupon");
              // Save order data for OrderSuccess page
              if (verifyRes.data && verifyRes.data.order) {
                localStorage.setItem("kent_order", JSON.stringify(verifyRes.data.order));
              }
              localStorage.setItem("kent_order_placed", "true");
              localStorage.setItem("kent_last_order_id", "");
              navigate("/order-success", { replace: true });
            } catch (err) {
              setOrderError("Payment verification failed. Please contact support.");
            }
          },
          modal: {
            ondismiss: function () { setBusy(false); },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response) {
          setOrderError(response.error?.description || "Payment failed. Please try again.");
          setBusy(false);
        });
        rzp.open();
      } else {
        const payload = {
          ...checkout,
          paymentMethod: method,
          upiId: showUpi ? upiId : undefined,
          cardLast4: showCard ? onlyDigits(cardNumber).slice(-4) : undefined,
          items: cart?.items || [],
          coupon: appliedPayload ? (() => { try { const r = localStorage.getItem("kent_coupon"); return r ? JSON.parse(r) : null; } catch { return null; } })() : null,
        };

        const { data } = await api.post("/orders/place", payload);
        // Clear cart after successful order
        cart.clearCart();
        localStorage.removeItem("kent_cart");
        try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}
        localStorage.removeItem("kent_checkout");
        localStorage.removeItem("kent_coupon");
        // Save order data for OrderSuccess page
        if (data.order) {
          localStorage.setItem("kent_order", JSON.stringify(data.order));
        }
        // Signal Profile page to refresh
        localStorage.setItem("kent_order_placed", "true");
        localStorage.setItem("kent_last_order_id", data.order?._id || data._id || "");
        navigate("/order-success", { replace: true, state: { orderId: data.order?._id || data._id } });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Payment failed. Please try again.";
      setOrderError(msg);
    } finally {
      if (!isRazorpay) setBusy(false);
    }
  }, [appliedPayload, grand, isRazorpay, method, showUpi, showCard, upiId, cardNumber, cardHolderName, expiry, cvv, navigate, validateUpi, validateCard]);

  useEffect(() => {
    document.title = "Payment - Kent Homoeopharmacy";
  }, []);

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

            {/* Payment Methods Selection */}
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
            </div>

            {/* Razorpay */}
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
                </div>
              </div>
            )}

            {/* UPI */}
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
              </div>
            )}

            {/* Credit/Debit Card */}
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
              </div>
            )}

            {/* Net Banking */}
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
              </div>
            )}

            {/* Cash on Delivery */}
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
                  {cartHasKentProduct ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Kent Product Discount</span>
                      <span className="font-semibold text-emerald-600">−₹{KENT_SHIPPING_DISCOUNT}</span>
                    </div>
                  ) : null}
                  {isCod ? (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">COD Charge</span>
                      <span className="font-semibold text-slate-800">₹{COD_CHARGE}</span>
                    </div>
                  ) : null}
                  <div className="h-px bg-slate-100" />
                  <button onClick={onPay} disabled={busy || empty}
                    className="shine w-full py-4 text-white font-black rounded-2xl text-[15px] shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg,#16a34a 0%,#059669 60%,#047857 100%)" }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {busy ? "Processing\u2026" : isRazorpay ? "Pay with Razorpay" : "Place Order"}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>
                  <p className="text-center text-[10px] text-slate-400 font-medium">
                    {isRazorpay ? "Secured by Razorpay" : `${method} \u00B7 Backend integrated`}
                  </p>
                </div>
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
              {busy ? "Processing\u2026" : "Pay Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
