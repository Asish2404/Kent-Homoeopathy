import { useMemo, useState, useCallback } from "react";
import { useCartContext } from "../Cart/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const FREE_DELIVERY_THRESHOLD = 499;
const STANDARD_DELIVERY_CHARGE = 49;
const KENT_SHIPPING_DISCOUNT = 50;

const DELIVERY_SLOTS = [
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

function formatPhone(input) {
  const digits = String(input).replace(/\D/g, "").slice(0, 10);
  return digits;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
}

function InputField({
  label,
  value,
  onChange,
  name,
  placeholder,
  type = "text",
  error,
  inputMode,
  autoComplete,
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
      </div>
      <input
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className={
          "mt-2 w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 " +
          (error ? "border-red-200 focus:ring-red-100" : "border-slate-200")
        }
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-err` : undefined}
      />
      {error ? (
        <p id={`${name}-err`} className="mt-1 text-xs text-red-600 font-semibold">
          {error}
        </p>
      ) : null}
    </label>
  );
}

export default function Checkout() {
  const cart = useCartContext();
  const navigate = useNavigate();

  const items = cart?.items || [];
  const inStock = useMemo(() => items.filter((it) => it.inStock !== false), [items]);
  const empty = inStock.length === 0;
  const cartHasKentProduct = useMemo(() => inStock.some((item) => item.isKentProduct), [inStock]);

  const mrpTotal = inStock.reduce((s, it) => s + Number(it.mrp || 0) * Number(it.qty || 1), 0);
  const discTotal = inStock.reduce(
    (s, it) => s + (Number(it.mrp || 0) - Number(it.price || 0)) * Number(it.qty || 1),
    0
  );

  const sub = mrpTotal - discTotal;

  const [slot, setSlot] = useState("morning");

  const [couponInput, setCouponInput] = useState("");
  const [applied, setApplied] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const couponSave = applied ? Number(applied.discountAmount) : 0;

  const deliveryBase = sub >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_CHARGE;
  const delivery = Math.max(0, deliveryBase - (cartHasKentProduct ? KENT_SHIPPING_DISCOUNT : 0));
  const platform = 5;
  const grand = sub - couponSave + delivery + platform;

  const [couponMsg, setCouponMsg] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    house: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (key) => (val) => setForm((p) => ({ ...p, [key]: val }));

  const applyCouponBackend = useCallback(async () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponMsg({ type: "err", text: "Please enter a coupon code." });
      return;
    }

    setCouponLoading(true);
    setCouponMsg({ type: "", text: "" });

    try {
      const res = await api.post("/coupons/validate", {
        couponCode: code,
        cartAmount: sub,
      });

      if (res.data?.success) {
        setApplied({
          code: res.data.coupon.couponCode,
          discountAmount: res.data.discountAmount,
          finalPayable: res.data.finalPayableAmount,
        });
        setCouponMsg({
          type: "ok",
          text: `₹${res.data.discountAmount} discount applied!`,
        });
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Invalid coupon code.";
      setApplied(null);
      setCouponMsg({ type: "err", text: msg });
    } finally {
      setCouponLoading(false);
    }
  }, [couponInput, sub]);

  const removeCouponBackend = useCallback(async () => {
    if (!applied) return;
    setCouponLoading(true);
    try {
      await api.post("/coupons/remove", { couponCode: applied.code });
    } catch {
      // ignore
    }
    setApplied(null);
    setCouponMsg({ type: "", text: "" });
    setCouponLoading(false);
  }, [applied]);

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!phoneDigits || phoneDigits.length !== 10) e.phone = "Phone number must be 10 digits.";

    if (!validateEmail(form.email)) e.email = "Enter a valid email address.";

    if (!form.house.trim()) e.house = "House/Flat number is required.";
    if (!form.street.trim()) e.street = "Street is required.";
    if (!form.city.trim()) e.city = "City is required.";
    if (!form.state.trim()) e.state = "State is required.";

    const pin = form.pincode.replace(/\D/g, "");
    if (!pin || pin.length !== 6) e.pincode = "Pincode must be 6 digits.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onProceed = async () => {
    if (empty) {
      navigate("/Cart");
      return;
    }
    if (!validate()) {
      return;
    }

    setSubmitting(true);

    const shippingAddress = {
      fullName: form.fullName.trim(),
      phone: form.phone.replace(/\D/g, ""),
      email: form.email.trim(),
      house: form.house.trim(),
      street: form.street.trim(),
      landmark: form.landmark.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.replace(/\D/g, ""),
      slot,
    };

    try {
      localStorage.setItem("kent_checkout", JSON.stringify(shippingAddress));
      if (applied) {
        localStorage.setItem("kent_coupon", JSON.stringify({
          code: applied.code,
          discountAmount: applied.discountAmount,
        }));
      }
    } catch {
      // ignore
    }

    setSubmitting(false);
    navigate("/payment");
  };

  const orderSummary = (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="font-bold text-slate-800 text-base">Order Summary</h3>
          <p className="text-xs text-slate-400 mt-0.5">Review items before payment</p>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-[320px] overflow-auto">
          {inStock.map((it) => (
            <div key={it.id} className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden">
                <img src={it.image} alt={it.name} className="w-10 h-10 object-contain" loading="lazy" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{it.name}</p>
                    <p className="text-xs text-slate-400">Qty: {it.qty || 1}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">₹{(Number(it.price || 0)).toFixed(0)}</p>
                    <p className="text-[11px] text-slate-400">Unit</p>
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-xs text-emerald-700 font-semibold">Total</span>
                  <span className="text-xs font-bold text-slate-900 tabular-nums">
                    ₹{(Number(it.price || 0) * Number(it.qty || 1)).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="font-bold text-slate-800 text-base">Price Details</h3>
        </div>
        <div className="px-5 py-4 space-y-3.5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Total MRP (incl. taxes)</span>
            <span className="font-semibold text-slate-800">₹{mrpTotal.toFixed(0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Discount on MRP</span>
            <span className="font-semibold text-emerald-600">−₹{discTotal.toFixed(0)}</span>
          </div>

          {applied ? (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Coupon ({applied.code})</span>
              <span className="font-semibold text-emerald-600">−₹{Number(applied.discountAmount).toFixed(0)}</span>
            </div>
          ) : null}

          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Delivery Charges</span>
            {delivery === 0 ? (
              <span className="font-semibold text-emerald-600 flex items-center gap-2">
                <span className="line-through text-slate-400 font-normal text-xs">₹{deliveryBase}</span> FREE
              </span>
            ) : (
              <span className="font-semibold text-slate-800">₹{delivery}</span>
            )}
          </div>

          {cartHasKentProduct ? (
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Kent Product Discount</span>
              <span className="font-semibold text-emerald-600">−₹{KENT_SHIPPING_DISCOUNT}</span>
            </div>
          ) : null}

          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Platform Fee</span>
            <span className="font-semibold text-slate-800">₹{platform}</span>
          </div>

          <div className="h-px bg-slate-100" />

          <div className="flex justify-between items-center">
            <span className="font-black text-slate-900 text-base">Grand Total</span>
            <span className="font-black text-2xl text-slate-900">₹{grand.toFixed(0)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <h3 className="font-bold text-slate-800 text-base">Coupon</h3>
          <p className="text-xs text-slate-400 mt-0.5">Apply to get instant savings</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              placeholder="Enter coupon code"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
              aria-label="Coupon code"
            />
            {applied ? (
              <button
                onClick={removeCouponBackend}
                disabled={couponLoading}
                className="px-5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={applyCouponBackend}
                disabled={couponLoading || !couponInput.trim()}
                className="px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-colors disabled:opacity-50"
              >
                {couponLoading ? "..." : "Apply"}
              </button>
            )}
          </div>
          {couponMsg.text ? (
            <p
              className={
                "text-xs font-semibold " +
                (couponMsg.type === "ok" ? "text-emerald-700" : "text-red-600")
              }
              role="status"
            >
              {couponMsg.text}
            </p>
          ) : null}
          {applied && (
            <p className="text-xs text-emerald-700 font-semibold">
              Coupon applied! Discount: ₹{Number(applied.discountAmount).toFixed(0)}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <style>{`
        .page-enter{animation:fade-up .45s ease both;}
        @keyframes fade-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-xs text-slate-400">
        <span className="hover:text-slate-600 cursor-pointer transition-colors" role="link" tabIndex={0} onClick={() => navigate("/")}>Home</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-700 font-semibold">Checkout</span>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="page-enter">
          <div className="flex items-baseline justify-between gap-3 mb-6 flex-wrap">
            <h1 className="serif text-2xl text-slate-900">Checkout</h1>
            <p className="text-xs text-slate-400 font-medium">Secure checkout for your medicines</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT */}
            <section className="lg:col-span-7 space-y-5">
              {/* Delivery Address */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 text-base">Delivery Address</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Where should we deliver your order?</p>
                </div>

                <div className="px-5 py-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="Full Name"
                      name="fullName"
                      value={form.fullName}
                      onChange={setField("fullName")}
                      placeholder="e.g., Raj Narayan"
                      error={errors.fullName}
                      autoComplete="name"
                    />
                    <InputField
                      label="Phone Number"
                      name="phone"
                      value={form.phone}
                      onChange={(v) => setField("phone")(formatPhone(v))}
                      placeholder="10-digit mobile"
                      type="tel"
                      inputMode="tel"
                      error={errors.phone}
                      autoComplete="tel"
                    />
                  </div>

                  <InputField
                    label="Email Address"
                    name="email"
                    value={form.email}
                    onChange={setField("email")}
                    placeholder="name@example.com"
                    type="email"
                    inputMode="email"
                    error={errors.email}
                    autoComplete="email"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="House / Flat Number"
                      name="house"
                      value={form.house}
                      onChange={setField("house")}
                      placeholder="Flat 12B"
                      error={errors.house}
                      autoComplete="address-line1"
                    />
                    <InputField
                      label="Street"
                      name="street"
                      value={form.street}
                      onChange={setField("street")}
                      placeholder="Street / Area"
                      error={errors.street}
                      autoComplete="address-line2"
                    />
                  </div>

                  <InputField
                    label="Landmark (Optional)"
                    name="landmark"
                    value={form.landmark}
                    onChange={setField("landmark")}
                    placeholder="Near Metro / Building name"
                    error={errors.landmark}
                    autoComplete="off"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                      label="City"
                      name="city"
                      value={form.city}
                      onChange={setField("city")}
                      placeholder="Mumbai"
                      error={errors.city}
                      autoComplete="address-level2"
                    />
                    <InputField
                      label="State"
                      name="state"
                      value={form.state}
                      onChange={setField("state")}
                      placeholder="Maharashtra"
                      error={errors.state}
                      autoComplete="address-level1"
                    />
                  </div>

                  <InputField
                    label="Pincode"
                    name="pincode"
                    value={form.pincode}
                    onChange={(v) => setField("pincode")(String(v).replace(/\D/g, "").slice(0, 6))}
                    placeholder="6-digit pincode"
                    error={errors.pincode}
                    inputMode="numeric"
                    autoComplete="postal-code"
                  />

                  {empty ? (
                    <p className="text-sm font-semibold text-red-600">Your cart is empty. Add items to continue.</p>
                  ) : null}
                </div>
              </div>

              {/* Delivery Slot */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h2 className="font-bold text-slate-800 text-base">Delivery Slot</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Choose your preferred time</p>
                </div>

                <div className="px-5 py-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {DELIVERY_SLOTS.map((s) => {
                      const active = slot === s.id;
                      return (
                        <button
                          type="button"
                          key={s.id}
                          onClick={() => setSlot(s.id)}
                          className={
                            "rounded-2xl border px-4 py-4 text-left transition card focus-visible:outline-emerald-500 " +
                            (active
                              ? "border-emerald-300 bg-emerald-50"
                              : "border-slate-200 bg-white hover:bg-slate-50")
                          }
                          aria-pressed={active}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-bold text-slate-800">{s.label}</p>
                              <p className="text-xs text-slate-500 mt-1">"Fresh" delivery window</p>
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
            </section>

            {/* RIGHT */}
            <aside className="lg:col-span-5">
              <div className="lg:sticky lg:top-[72px] space-y-5">
                {orderSummary}

                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <div className="px-5 py-5">
                    <button
                      onClick={onProceed}
                      disabled={empty || submitting}
                      className="shine w-full py-4 text-white font-black rounded-2xl text-[15px] shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg,#16a34a 0%,#059669 60%,#047857 100%)" }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {submitting ? "Processing…" : "Proceed to Payment"}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </button>

                    <p className="mt-3 text-center text-[10px] text-slate-400 font-medium">
                      Secure checkout · Backend integrated
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      {/* Mobile sticky */}
      {!empty ? (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-3 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] text-slate-400 font-medium">Total</p>
              <p className="text-xl font-black text-slate-900">₹{grand.toFixed(0)}</p>
            </div>
            <button
              onClick={onProceed}
              disabled={submitting}
              className="shine flex-1 max-w-xs py-3.5 text-white font-black rounded-2xl text-sm shadow-lg disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#16a34a,#059669)" }}
            >
              {submitting ? "Processing…" : "Proceed →"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

