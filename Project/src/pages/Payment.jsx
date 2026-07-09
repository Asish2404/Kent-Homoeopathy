import { useEffect, useMemo, useState } from "react";
import { useCartContext } from "../Cart/CartContext";
import { useNavigate } from "react-router-dom";

const PAYMENT_METHODS = [
  "UPI",
  "Google Pay",
  "PhonePe",
  "Paytm",
  "Credit Card",
  "Debit Card",
  "Net Banking",
  "Cash on Delivery",
];

function onlyDigits(s) {
  return String(s).replace(/\D/g, "");
}

function normalizeCardNumber(v) {
  const digits = onlyDigits(v).slice(0, 19);
  // group 4 digits for readability
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatExpiry(v) {
  const digits = onlyDigits(v).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function validateCardNumber(v) {
  const digits = onlyDigits(v);
  return digits.length >= 12;
}

export default function Payment() {
  const cart = useCartContext();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const inStock = useMemo(() => items.filter((it) => it.inStock !== false), [items]);
  const empty = inStock.length === 0;

  const mrpTotal = inStock.reduce((s, it) => s + Number(it.mrp || 0) * Number(it.qty || 1), 0);
  const discTotal = inStock.reduce(
    (s, it) => s + (Number(it.mrp || 0) - Number(it.price || 0)) * Number(it.qty || 1),
    0
  );
  const sub = mrpTotal - discTotal;

  const [appliedPayload] = useState(() => {
    try {
      const raw = localStorage.getItem("kent_checkout");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const [couponApplied] = useState(() => {
    try {
      const raw = localStorage.getItem("kent_coupon");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const couponSave = couponApplied && couponApplied.pct ? Math.round((sub * couponApplied.pct) / 100) : 0;
  const delivery = sub > 499 ? 0 : 49;
  const platform = 5;
  const grand = sub - couponSave + delivery + platform;

  const [method, setMethod] = useState("UPI");
  const [busy, setBusy] = useState(false);

  // UPI
  const [upiId, setUpiId] = useState("");

  // Card
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!appliedPayload) {
      // Still allow payment UI, but guide user back.
    }
  }, [appliedPayload]);

  const validate = () => {
    const e = {};

    const isCod = method === "Cash on Delivery";
    if (!isCod) {
      if (method === "UPI" || method === "Google Pay" || method === "PhonePe" || method === "Paytm") {
        if (!upiId.trim()) e.upiId = "UPI ID is required.";
        else if (!/^[\w.-]{2,}@[\w.-]{2,}$/.test(upiId.trim())) e.upiId = "Enter a valid UPI ID (name@bank).";
      } else {
        // card payment section for Credit/Debit cards
        if (method === "Credit Card" || method === "Debit Card") {
          if (!validateCardNumber(cardNumber)) e.cardNumber = "Enter a valid card number.";
          if (!cardHolderName.trim()) e.cardHolderName = "Card holder name is required.";
          if (!/^\d{2}\/\d{2}$/.test(expiry)) e.expiry = "Expiry must be in MM/YY.";
          if (onlyDigits(cvv).length < 3) e.cvv = "CVV must be 3-4 digits.";
        } else {
          // Net Banking or others: dummy validation
        }
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const persistCouponForTotal = () => {
    // Checkout page currently stores only checkout payload.
    // If coupon was applied, we persist it here from state if possible.
    // For production, you’d store in one place. Here it's a dummy.
    try {
      // no-op
    } catch {
      // ignore
    }
  };

  const onPay = async () => {
    if (empty) {
      navigate("/cart");
      return;
    }

    if (!validate()) return;

    setBusy(true);
    await new Promise((r) => setTimeout(r, 700));

    // Dummy order creation
    let orderId = "DK";
    try {
      const n = Math.floor(100000 + Math.random() * 900000);
      orderId = `DK${n}`;
    } catch {
      // ignore
    }

    const etaDays = 2;
    const d = new Date();
    d.setDate(d.getDate() + etaDays);
    const estimated = d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });

    const order = {
      id: orderId,
      amount: grand,
      method,
      estimatedDelivery: estimated,
      createdAt: Date.now(),
    };

    try {
      localStorage.setItem("kent_order", JSON.stringify(order));
    } catch {
      // ignore
    }

    // Clear cart (typical UX) AFTER order success
    try {
      // we can't rely on cart.clearCart existence from context value? It exists in CartState.
      cart.clearCart?.();
    } catch {
      // ignore
    }

    setBusy(false);
    persistCouponForTotal();
    navigate("/order-success");
  };

  const isCod = method === "Cash on Delivery";
  const showUpi = method === "UPI" || method === "Google Pay" || method === "PhonePe" || method === "Paytm";
  const showCard = method === "Credit Card" || method === "Debit Card";

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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT */}
          <section className="lg:col-span-7 space-y-5">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <h2 className="font-bold text-slate-800 text-base">Payment Methods</h2>
                <p className="text-xs text-slate-400 mt-0.5">One method only · Secure UI (dummy)</p>
              </div>

              <div className="px-5 py-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((m) => {
                    const active = method === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMethod(m)}
                        className={
                          "rounded-2xl border px-4 py-4 text-left transition card focus-visible:outline-emerald-500 " +
                          (active ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50")
                        }
                        aria-pressed={active}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-bold text-slate-800">{m}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {m === "Cash on Delivery" ? "Pay at doorstep" : "Fast & secure"}
                            </p>
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

            {/* Method details */}
            {showUpi ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 text-base">UPI</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Enter your UPI ID</p>
                </div>
                <div className="px-5 py-5">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-800">UPI ID</span>
                    <input
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="name@bank"
                      className={
                        "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 " +
                        (errors.upiId ? "border-red-200 focus:ring-red-100" : "border-slate-200")
                      }
                      aria-invalid={!!errors.upiId}
                    />
                    {errors.upiId ? <p className="mt-1 text-xs text-red-600 font-semibold">{errors.upiId}</p> : null}
                  </label>
                </div>
              </div>
            ) : null}

            {showCard ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 text-base">Card Payment</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Enter card details</p>
                </div>
                <div className="px-5 py-5 space-y-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-slate-800">Card Number</span>
                    <input
                      value={cardNumber}
                      onChange={(e) => setCardNumber(normalizeCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      inputMode="numeric"
                      className={
                        "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 " +
                        (errors.cardNumber ? "border-red-200 focus:ring-red-100" : "border-slate-200")
                      }
                      aria-invalid={!!errors.cardNumber}
                    />
                    {errors.cardNumber ? <p className="mt-1 text-xs text-red-600 font-semibold">{errors.cardNumber}</p> : null}
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="block">
                      <span className="text-sm font-semibold text-slate-800">Card Holder Name</span>
                      <input
                        value={cardHolderName}
                        onChange={(e) => setCardHolderName(e.target.value)}
                        placeholder="Asish Kumar"
                        className={
                          "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 " +
                          (errors.cardHolderName ? "border-red-200 focus:ring-red-100" : "border-slate-200")
                        }
                      />
                      {errors.cardHolderName ? <p className="mt-1 text-xs text-red-600 font-semibold">{errors.cardHolderName}</p> : null}
                    </label>

                    <label className="block">
                      <span className="text-sm font-semibold text-slate-800">Expiry Date</span>
                      <input
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        placeholder="MM/YY"
                        inputMode="numeric"
                        className={
                          "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 " +
                          (errors.expiry ? "border-red-200 focus:ring-red-100" : "border-slate-200")
                        }
                      />
                      {errors.expiry ? <p className="mt-1 text-xs text-red-600 font-semibold">{errors.expiry}</p> : null}
                    </label>
                  </div>

                  <label className="block">
                    <span className="text-sm font-semibold text-slate-800">CVV</span>
                    <input
                      value={cvv}
                      onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, 4))}
                      placeholder="123"
                      inputMode="numeric"
                      className={
                        "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 " +
                        (errors.cvv ? "border-red-200 focus:ring-red-100" : "border-slate-200")
                      }
                    />
                    {errors.cvv ? <p className="mt-1 text-xs text-red-600 font-semibold">{errors.cvv}</p> : null}
                  </label>

                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                    <p className="text-xs text-emerald-800 font-semibold">
                      Note: This is a dummy payment UI — no real charge will happen.
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {method === "Net Banking" ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 text-base">Net Banking</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Select your bank (dummy)</p>
                </div>
                <div className="px-5 py-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {["SBI", "HDFC", "ICICI", "Axis"].map((b) => (
                      <div key={b} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                        <p className="text-sm font-bold text-slate-800">{b}</p>
                        <p className="text-xs text-slate-500 mt-1">Demo option</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {isCod ? (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 text-base">Cash on Delivery</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Confirm order without online payment</p>
                </div>
                <div className="px-5 py-5">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m2 0a7 7 0 11-14 0a7 7 0 0114 0Z" />
                      </svg>
                      <div>
                        <p className="text-sm font-bold text-emerald-900">Pay at doorstep</p>
                        <p className="text-xs text-emerald-800 mt-1 font-semibold">
                          Your order will be handed over after verification (dummy flow).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </section>

          {/* RIGHT summary */}
          <aside className="lg:col-span-5">
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

                  <button
                    onClick={onPay}
                    disabled={busy || empty}
                    className="shine w-full py-4 text-white font-black rounded-2xl text-[15px] shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg,#16a34a 0%,#059669 60%,#047857 100%)" }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {busy ? "Processing…" : "Pay Now"}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </button>

                  <p className="text-center text-[10px] text-slate-400 font-medium">
                    Dummy payment · No gateway integration
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 text-base">Need to edit?</h2>
                </div>
                <div className="px-5 py-5">
                  <button
                    onClick={() => navigate("/checkout")}
                    className="btn-outline w-full"
                    style={{ padding: 14, borderRadius: 16 }}
                  >
                    Back to Checkout
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile sticky bar */}
      {!empty ? (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-3 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Payable</p>
              <p className="text-xl font-black text-slate-900">₹{grand.toFixed(0)}</p>
            </div>
            <button
              onClick={onPay}
              disabled={busy}
              className="shine flex-1 max-w-xs py-3.5 text-white font-black rounded-2xl text-sm shadow-lg disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#16a34a,#059669)" }}
            >
              {busy ? "Processing…" : "Pay Now"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

