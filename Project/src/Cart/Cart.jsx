import { useEffect, useMemo, useRef, useState } from "react";
import { useCartContext } from "./CartContext";
import { useNavigate } from "react-router-dom";

// Keep existing UI exactly as-is; this file only becomes dynamic.
// Cart pricing is calculated from CartContext items.

const COUPONS = { KENT10: 10, HEALTH20: 20, FIRSTMED: 15 };

function Stars({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${
            i <= Math.floor(rating)
              ? "text-amber-400"
              : i === Math.ceil(rating) && rating % 1 >= 0.5
                ? "text-amber-300"
                : "text-slate-200"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

function QtyBox({ qty, onInc, onDec }) {
  return (
    <div className="flex items-center rounded-xl border border-emerald-200 overflow-hidden select-none">
      <button
        onClick={onDec}
        className="w-8 h-8 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 transition-colors text-lg font-bold"
      >
        −
      </button>
      <span className="w-9 h-8 flex items-center justify-center text-sm font-bold text-slate-800 border-x border-emerald-200 tabular-nums">
        {qty}
      </span>
      <button
        onClick={onInc}
        className="w-8 h-8 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 transition-colors text-lg font-bold"
      >
        +
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-24 h-24 bg-slate-100 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2.5 pt-1">
          <div className="h-3 bg-slate-100 rounded w-1/4" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
          <div className="flex gap-3 pt-2">
            <div className="h-8 w-24 bg-slate-100 rounded-xl" />
            <div className="h-8 w-20 bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Cart() {
  const cart = useCartContext();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState("");
  const [applied, setApplied] = useState(null);
  const [couponMsg, setCouponMsg] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(true);
  const [pincode, setPincode] = useState("400001");
  const [addrOpen, setAddrOpen] = useState(false);
  const sliderRef = useRef(null);

  // This cart implementation becomes fully dynamic from CartContext.
  const items = cart?.items || [];
  const savedItems = cart?.savedItems || [];

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const active = items;
  const inStock = useMemo(() => active.filter((it) => it.inStock !== false), [active]);
  const outStock = useMemo(() => active.filter((it) => it.inStock === false), [active]);

  const mrpTotal = inStock.reduce((s, it) => s + Number(it.mrp || 0) * Number(it.qty || 1), 0);
  const discTotal = inStock.reduce(
    (s, it) => s + (Number(it.mrp || 0) - Number(it.price || 0)) * Number(it.qty || 1),
    0
  );

  const sub = mrpTotal - discTotal;
  const couponSave = applied ? Math.round((sub * applied.pct) / 100) : 0;
  const delivery = sub > 499 ? 0 : 49;
  const platform = 5;
  const grand = sub - couponSave + delivery + platform;
  const totalSave = discTotal + couponSave + (delivery === 0 ? 49 : 0);

  const empty = active.length === 0;

  const updateQty = (id, delta) => {
    const item = items.find((x) => String(x.id) === String(id));
    if (!item) return;
    const current = Number(item.qty || 1);
    const maxQty = Math.max(1, Number(item.stock || 15));
    const next = Math.max(1, Math.min(maxQty, current + delta));
    cart.setQty(String(id), next);
  };

  const removeItem = (id) => {
    cart.removeFromCart(String(id));
  };

  const applyCoupon = () => {
    const c = couponInput.trim().toUpperCase();
    if (COUPONS[c]) {
      setApplied({ code: c, pct: COUPONS[c] });
      setCouponMsg({ type: "ok", text: `${COUPONS[c]}% discount applied!` });
    } else {
      setCouponMsg({
        type: "err",
        text: "Invalid code. Try KENT10, HEALTH20, or FIRSTMED.",
      });
      setApplied(null);
    }
  };

  const clearCart = () => {
    cart.clearCart();
    setCouponInput("");
    setApplied(null);
    setCouponMsg({ type: "", text: "" });
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display&display=swap');
        *{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;}
        .serif{font-family:'DM Serif Display',serif;}
        ::-webkit-scrollbar{display:none;}
        .card{transition:box-shadow .22s ease,transform .22s ease;}
        .card:hover{box-shadow:0 6px 28px -6px rgba(16,163,74,.13);transform:translateY(-1px);}
        .fin{animation:fadeIn .35s ease;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
        .shine{position:relative;overflow:hidden;}
        .shine::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.22) 50%,transparent 60%);transform:translateX(-100%);transition:transform .5s ease;}
        .shine:hover::after{transform:translateX(100%);}
      `}</style>

      {/* BREADCRUMB */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-xs text-slate-400">
        <span className="hover:text-slate-600 cursor-pointer transition-colors">Home</span>
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-slate-700 font-semibold">Shopping Cart</span>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-baseline gap-3 mb-5">
          <h1 className="serif text-2xl text-slate-900">Your Cart</h1>
          {!empty && (
            <span className="text-sm text-slate-400 font-medium">
              {active.length} item{active.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {empty ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <div
              className="w-36 h-36 rounded-full flex items-center justify-center mb-6 shadow-inner"
              style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)" }}
            >
              <svg
                className="w-20 h-20 text-emerald-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={1.2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h2 className="serif text-3xl text-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-slate-400 text-sm mb-8 max-w-xs leading-relaxed">
              Add medicines and health products to place your order.
            </p>
            <button
              onClick={() => navigate("/Products")}
              className="shine px-10 py-3.5 text-white font-bold rounded-2xl text-sm shadow-lg hover:shadow-xl transition-all"
              style={{ background: "linear-gradient(135deg,#16a34a,#059669)" }}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* LEFT */}
            <div className="lg:col-span-8 space-y-4">
              {/* Delivery address bar */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => setAddrOpen(!addrOpen)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4.5 h-4.5 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">Delivering to Mumbai — {pincode}</p>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">
                          HOME
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">Raj Narayan, 12 Marine Drive, Mumbai, Maharashtra</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-emerald-600">Change</span>
                    <svg
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${addrOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                {addrOpen && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4 fin">
                    <div className="flex gap-2">
                      <input
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="Enter 6-digit pincode"
                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all font-mono tracking-widest"
                      />
                      <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors">
                        Check
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* In-stock items */}
              {inStock.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-slate-700">
                      {inStock.length} item{inStock.length !== 1 ? "s" : ""} available for delivery
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs text-emerald-600 font-medium">All in stock</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {loading ? (
                      [1, 2, 3].map((n) => <Skeleton key={n} />)
                    ) : (
                      inStock.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-slate-200 overflow-hidden card fin shadow-sm"
                        >
                          {Number(item.discount) >= 15 && (
                            <div className="bg-gradient-to-r from-emerald-50 to-transparent px-5 py-2 border-b border-emerald-100 flex items-center gap-2">
                              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                />
                              </svg>
                              <span className="text-[11px] font-bold text-emerald-700">{item.discount}% discount applied on this item</span>
                            </div>
                          )}
                          <div className="flex gap-4 p-5">
                            <div className="flex-shrink-0 flex flex-col items-center gap-2">
                              <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-20 h-20 object-contain mix-blend-multiply"
                                  loading="lazy"
                                />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                                  <h3 className="font-bold text-slate-900 text-[15px] leading-snug mt-0.5">{item.name}</h3>
                                  <p className="text-xs text-slate-400 mt-0.5 font-medium">{item.manufacturer}</p>
                                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.composition}</p>
                                  <p className="text-[11px] text-slate-400 mt-0.5">{item.packInfo}</p>
                                </div>
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="flex-shrink-0 p-2 rounded-xl text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all"
                                  aria-label="Remove"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>

                              {/* Price & Qty */}
                              <div className="flex items-end justify-between mt-4 flex-wrap gap-3">
                                <div>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-[22px] font-black text-slate-900 leading-none">
                                      ₹{(Number(item.price || 0) * Number(item.qty || 1)).toFixed(0)}
                                    </span>
                                    <span className="text-sm text-slate-400 line-through font-medium">
                                      ₹{(Number(item.mrp || 0) * Number(item.qty || 1)).toFixed(0)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                                    Save ₹{((Number(item.mrp || 0) - Number(item.price || 0)) * Number(item.qty || 1)).toFixed(0)} on this item
                                  </p>
                                </div>

                                <QtyBox
                                  qty={Number(item.qty || 1)}
                                  onInc={() => updateQty(item.id, 1)}
                                  onDec={() => updateQty(item.id, -1)}
                                />
                              </div>

                              {/* Footer row */}
                              <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-slate-100 flex-wrap gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                  </svg>
                                  <span className="text-[11px] text-slate-500 font-medium">{item.deliveryLabel}</span>
                                  {item.deliveryFree && (
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">FREE</span>
                                  )}
                                </div>

                                <button
                                  onClick={() => cart.addToSaved(item)}
                                  className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                                >
                                  Save for later
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Out of stock */}
              {outStock.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-red-500 mb-2.5 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    Not deliverable to this pincode
                  </p>
                  {outStock.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 opacity-55 shadow-sm">
                      <div className="flex gap-4 items-center">
                        <div className="w-20 h-20 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-16 h-16 object-contain grayscale opacity-60" loading="lazy" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{item.category}</p>
                          <h3 className="font-bold text-slate-700 text-sm mt-0.5">{item.name}</h3>
                          <p className="text-xs text-slate-400">{item.composition}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">Out of Stock</span>
                            <button onClick={() => removeItem(item.id)} className="text-[11px] text-slate-400 hover:text-red-500 font-semibold transition-colors">
                              Remove
                            </button>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg font-black text-slate-600">₹{Number(item.price || 0)}</p>
                          <p className="text-xs text-slate-400 line-through">₹{Number(item.mrp || 0)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {savedItems.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800 text-base">Saved for later</h3>
                    <span className="text-xs text-slate-400 font-medium">{savedItems.length} item{savedItems.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="space-y-3">
                    {savedItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3">
                        <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover bg-slate-50" loading="lazy" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                          <p className="text-xs text-slate-400">₹{Number(item.price || 0).toFixed(0)}</p>
                        </div>
                        <button onClick={() => cart.moveSavedToCart(item.id)} className="text-xs font-semibold text-emerald-600 hover:underline">
                          Move to cart
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Summary */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-[72px] space-y-4">
                {!empty && (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                      <h3 className="font-bold text-slate-800 text-base">Price Details</h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {inStock.length} item{inStock.length !== 1 ? "s" : ""} · {inStock.reduce((s, i) => s + Number(i.qty || 1), 0)} quantity
                      </p>
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

                      {applied && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500 flex items-center gap-1.5">
                            Coupon Discount
                            <span className="text-[9px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">{applied.code}</span>
                          </span>
                          <span className="font-semibold text-emerald-600">−₹{couponSave.toFixed(0)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Delivery Charges</span>
                        {delivery === 0 ? (
                          <span className="font-semibold text-emerald-600 flex items-center gap-1">
                            <span className="line-through text-slate-400 font-normal text-xs">₹49</span> FREE
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-800">₹{delivery}</span>
                        )}
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 flex items-center gap-1">
                          Platform Fee
                          <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                        <span className="font-semibold text-slate-800">₹{platform}</span>
                      </div>

                      <div className="h-px bg-slate-100" />

                      <div className="flex justify-between items-center">
                        <span className="font-black text-slate-900 text-base">Total Amount</span>
                        <span className="font-black text-2xl text-slate-900">₹{grand.toFixed(0)}</span>
                      </div>
                    </div>

                    <div className="px-5 pb-5 space-y-3">
                      <button
                        onClick={() => navigate("/Cart")}
                        disabled={empty}
                        className="shine w-full py-4 text-white font-black rounded-2xl text-[15px] shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 tracking-wide disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg,#16a34a 0%,#059669 60%,#047857 100%)" }}
                      >
                        <span className="flex items-center justify-center gap-2">
                          Proceed to Checkout
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </button>

                      <div className="flex items-center justify-center gap-1.5">
                        <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <p className="text-[10px] text-slate-400 font-medium">Safe, Secure & 100% Authentic</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Trust */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
                  {[
                    {
                      icon: (
                        <path
                          strokeLinecap="round"
            {!empty && inStock.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-4 py-3 shadow-2xl">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-[11px] text-slate-400 font-medium">Total</p>
                            <p className="text-xl font-black text-slate-900">₹{grand.toFixed(0)}</p>
                        </div>
                        <button className="shine flex-1 max-w-xs py-3.5 text-white font-black rounded-2xl text-sm shadow-lg" style={{ background: "linear-gradient(135deg,#16a34a,#059669)" }}>
                            Proceed to Checkout →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}