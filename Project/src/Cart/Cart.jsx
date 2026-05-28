import { useState, useEffect, useRef } from "react";

const CART_DATA = [
    { id: 1, name: "Dolo 650 Tablet", manufacturer: "Micro Labs Ltd", composition: "Paracetamol (650mg)", packInfo: "Strip of 15 tablets", image: "https://onemg.gumlet.io/l_watermark_346,w_120,h_120/a_ignore,w_120,h_120,c_fit,q_auto,f_auto/35d7e0c1-2498-4e98-9be8-0a8d3dda1a86.jpg", price: 30, mrp: 38, qty: 2, rx: false, inStock: true, deliveryLabel: "Get it by Tomorrow, 10 Jun", deliveryFree: true, substitutesCount: 12, discount: 21, category: "Fever & Pain" },
    { id: 2, name: "Augmentin 625 Duo Tablet", manufacturer: "GlaxoSmithKline Pharma", composition: "Amoxycillin (500mg) + Clavulanic Acid (125mg)", packInfo: "Strip of 10 tablets", image: "https://onemg.gumlet.io/l_watermark_346,w_120,h_120/a_ignore,w_120,h_120,c_fit,q_auto,f_auto/1671699373.jpg", price: 234, mrp: 261, qty: 1, rx: true, inStock: true, deliveryLabel: "Get it by Today, 9 Jun", deliveryFree: true, substitutesCount: 8, discount: 10, category: "Antibiotic" },
    { id: 3, name: "Shelcal 500 Tablet", manufacturer: "Torrent Pharmaceuticals Ltd", composition: "Calcium Carbonate (1250mg) + Vitamin D3 (250IU)", packInfo: "Strip of 15 tablets", image: "https://onemg.gumlet.io/l_watermark_346,w_120,h_120/a_ignore,w_120,h_120,c_fit,q_auto,f_auto/8a90e3f2-22d1-44cf-aa2f-3cd43f32d8ed.jpg", price: 148, mrp: 175, qty: 1, rx: false, inStock: true, deliveryLabel: "Get it by Tomorrow, 10 Jun", deliveryFree: true, substitutesCount: 6, discount: 15, category: "Bone & Joint" },
    { id: 4, name: "Jardiance 10mg Tablet", manufacturer: "Boehringer Ingelheim", composition: "Empagliflozin (10mg)", packInfo: "Strip of 10 tablets", image: "https://onemg.gumlet.io/l_watermark_346,w_120,h_120/a_ignore,w_120,h_120,c_fit,q_auto,f_auto/1671699373.jpg", price: 589, mrp: 656, qty: 1, rx: true, inStock: false, deliveryLabel: "Out of Stock", deliveryFree: false, substitutesCount: 4, discount: 10, category: "Diabetes" },
];

const RECOMMENDED = [
    { id: 101, name: "Limcee 500mg Chewable", manufacturer: "Abbott", image: "https://onemg.gumlet.io/l_watermark_346,w_120,h_120/a_ignore,w_120,h_120,c_fit,q_auto,f_auto/bcacb4f8-b8c6-4538-b1a8-e11ecb4d0cf9.jpg", price: 29, mrp: 34, rating: 4.7, ratingCount: "14.2K" },
    { id: 102, name: "Evion 400mg Vitamin E", manufacturer: "Merck", image: "https://onemg.gumlet.io/l_watermark_346,w_120,h_120/a_ignore,w_120,h_120,c_fit,q_auto,f_auto/1671699373.jpg", price: 78, mrp: 98, rating: 4.5, ratingCount: "8.4K" },
    { id: 103, name: "Volini 30g Pain Gel", manufacturer: "Sanofi India", image: "https://onemg.gumlet.io/l_watermark_346,w_120,h_120/a_ignore,w_120,h_120,c_fit,q_auto,f_auto/35d7e0c1-2498-4e98-9be8-0a8d3dda1a86.jpg", price: 115, mrp: 145, rating: 4.6, ratingCount: "22.1K" },
    { id: 104, name: "Zincovit Tablet", manufacturer: "Apex Laboratories", image: "https://onemg.gumlet.io/l_watermark_346,w_120,h_120/a_ignore,w_120,h_120,c_fit,q_auto,f_auto/8a90e3f2-22d1-44cf-aa2f-3cd43f32d8ed.jpg", price: 149, mrp: 165, rating: 4.4, ratingCount: "5.6K" },
    { id: 105, name: "Becosules Capsule", manufacturer: "Pfizer Ltd", image: "https://onemg.gumlet.io/l_watermark_346,w_120,h_120/a_ignore,w_120,h_120,c_fit,q_auto,f_auto/bcacb4f8-b8c6-4538-b1a8-e11ecb4d0cf9.jpg", price: 158, mrp: 190, rating: 4.8, ratingCount: "31.7K" },
];

const COUPONS = { KENT10: 10, HEALTH20: 20, FIRSTMED: 15 };

function Stars({ rating }) {
    return (
        <span className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <svg key={i} className={`w-3 h-3 ${i <= Math.floor(rating) ? "text-amber-400" : i === Math.ceil(rating) && rating % 1 >= 0.5 ? "text-amber-300" : "text-slate-200"}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </span>
    );
}

function QtyBox({ qty, onInc, onDec }) {
    return (
        <div className="flex items-center rounded-xl border border-emerald-200 overflow-hidden select-none">
            <button onClick={onDec} className="w-8 h-8 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 transition-colors text-lg font-bold">−</button>
            <span className="w-9 h-8 flex items-center justify-center text-sm font-bold text-slate-800 border-x border-emerald-200 tabular-nums">{qty}</span>
            <button onClick={onInc} className="w-8 h-8 flex items-center justify-center text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100 transition-colors text-lg font-bold">+</button>
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
                    <div className="flex gap-3 pt-2"><div className="h-8 w-24 bg-slate-100 rounded-xl" /><div className="h-8 w-20 bg-slate-100 rounded-xl" /></div>
                </div>
            </div>
        </div>
    );
}

export default function Cart() {
    const [items, setItems] = useState(CART_DATA.map(d => ({ ...d, removing: false })));
    const [couponInput, setCouponInput] = useState("");
    const [applied, setApplied] = useState(null);
    const [couponMsg, setCouponMsg] = useState({ type: "", text: "" });
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState([]);
    const [pincode, setPincode] = useState("400001");
    const [addrOpen, setAddrOpen] = useState(false);
    const sliderRef = useRef(null);

    useEffect(() => { setTimeout(() => setLoading(false), 1600); }, []);

    const updateQty = (id, d) => setItems(p => p.map(it => it.id === id ? { ...it, qty: Math.max(1, Math.min(15, it.qty + d)) } : it));
    const removeItem = (id) => {
        setItems(p => p.map(it => it.id === id ? { ...it, removing: true } : it));
        setTimeout(() => setItems(p => p.filter(it => it.id !== id)), 380);
    };
    const saveItem = (id) => {
        const f = items.find(it => it.id === id);
        if (f) { setSaved(p => [...p, f]); removeItem(id); }
    };
    const moveToCart = (id) => {
        const f = saved.find(it => it.id === id);
        if (f) { setItems(p => [...p, { ...f, removing: false }]); setSaved(p => p.filter(it => it.id !== id)); }
    };
    const applyCoupon = () => {
        const c = couponInput.trim().toUpperCase();
        if (COUPONS[c]) { setApplied({ code: c, pct: COUPONS[c] }); setCouponMsg({ type: "ok", text: `${COUPONS[c]}% discount applied!` }); }
        else { setCouponMsg({ type: "err", text: "Invalid code. Try KENT10, HEALTH20, or FIRSTMED." }); setApplied(null); }
    };

    const active = items.filter(it => !it.removing);
    const inStock = active.filter(it => it.inStock);
    const outStock = active.filter(it => !it.inStock);
    const mrpTotal = inStock.reduce((s, it) => s + it.mrp * it.qty, 0);
    const discTotal = inStock.reduce((s, it) => s + (it.mrp - it.price) * it.qty, 0);
    const sub = mrpTotal - discTotal;
    const couponSave = applied ? Math.round(sub * applied.pct / 100) : 0;
    const delivery = sub > 499 ? 0 : 49;
    const platform = 5;
    const grand = sub - couponSave + delivery + platform;
    const totalSave = discTotal + couponSave + (delivery === 0 ? 49 : 0);
    const empty = active.length === 0 && saved.length === 0;

    return (
        <div className="min-h-screen bg-[#f7f8fa]">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Serif+Display&display=swap');
        *{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;}
        .serif{font-family:'DM Serif Display',serif;}
        ::-webkit-scrollbar{display:none;}
        .card{transition:box-shadow .22s ease,transform .22s ease;}
        .card:hover{box-shadow:0 6px 28px -6px rgba(16,163,74,.13);transform:translateY(-1px);}
        .out{animation:slideOut .36s cubic-bezier(.4,0,1,1) forwards;}
        @keyframes slideOut{to{opacity:0;transform:translateX(-16px) scaleY(.92);}}
        .fin{animation:fadeIn .35s ease;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
        .shine{position:relative;overflow:hidden;}
        .shine::after{content:'';position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.22) 50%,transparent 60%);transform:translateX(-100%);transition:transform .5s ease;}
        .shine:hover::after{transform:translateX(100%);}
      `}</style>

            {/* HEADER */}
            {/* <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md" style={{ background: "linear-gradient(135deg,#16a34a,#059669)" }}>
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                        </div>
                        <span className="serif text-xl text-slate-900">kent<span className="text-emerald-600">.</span></span>
                        <span className="hidden sm:block text-xs text-slate-300 font-medium">|</span>
                        <span className="hidden sm:block text-xs text-slate-400 font-medium">Healthcare & Pharmacy</span>
                    </div>
                    <div className="flex-1 max-w-xs sm:max-w-sm hidden sm:block">
                        <div className="flex items-center bg-slate-100 rounded-xl px-3.5 py-2.5 gap-2">
                            <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            <span className="text-sm text-slate-400">Search medicines, health products...</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="hidden sm:flex items-center gap-1.5 text-sm text-slate-500 hover:text-emerald-600 transition-colors font-medium">
                            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            Account
                        </button>
                        <div className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 transition-colors text-white text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            Cart {active.length > 0 && <span className="bg-white text-emerald-700 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">{active.length}</span>}
                        </div>
                    </div>
                </div>
            </header> */}

            {/* BREADCRUMB */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-xs text-slate-400">
                <span className="hover:text-slate-600 cursor-pointer transition-colors">Home</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <span className="text-slate-700 font-semibold">Shopping Cart</span>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
                <div className="flex items-baseline gap-3 mb-5">
                    <h1 className="serif text-2xl text-slate-900">Your Cart</h1>
                    {!empty && <span className="text-sm text-slate-400 font-medium">{active.length} item{active.length !== 1 ? "s" : ""}</span>}
                </div>

                {empty ? (
                    <div className="flex flex-col items-center justify-center py-28 text-center">
                        <div className="w-36 h-36 rounded-full flex items-center justify-center mb-6 shadow-inner" style={{ background: "linear-gradient(135deg,#f0fdf4,#dcfce7)" }}>
                            <svg className="w-20 h-20 text-emerald-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <h2 className="serif text-3xl text-slate-800 mb-2">Your cart feels lonely</h2>
                        <p className="text-slate-400 text-sm mb-8 max-w-xs leading-relaxed">Add medicines and health products to place your order.</p>
                        <button onClick={() => setItems(CART_DATA.map(d => ({ ...d, removing: false })))} className="shine px-10 py-3.5 text-white font-bold rounded-2xl text-sm shadow-lg hover:shadow-xl transition-all" style={{ background: "linear-gradient(135deg,#16a34a,#059669)" }}>
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                        {/* LEFT */}
                        <div className="lg:col-span-8 space-y-4">

                            {/* Delivery address bar */}
                            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                <button onClick={() => setAddrOpen(!addrOpen)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors text-left">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <svg className="w-4.5 h-4.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-slate-800">Delivering to Mumbai — {pincode}</p>
                                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full">HOME</span>
                                            </div>
                                            <p className="text-xs text-slate-400 mt-0.5">Raj Narayan, 12 Marine Drive, Mumbai, Maharashtra</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-emerald-600">Change</span>
                                        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${addrOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </button>
                                {addrOpen && (
                                    <div className="px-5 pb-5 border-t border-slate-100 pt-4 fin">
                                        <div className="flex gap-2">
                                            <input value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="Enter 6-digit pincode" className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all font-mono tracking-widest" />
                                            <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition-colors">Check</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* In-stock items */}
                            {inStock.length > 0 && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-bold text-slate-700">{inStock.length} item{inStock.length !== 1 ? "s" : ""} available for delivery</p>
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs text-emerald-600 font-medium">All in stock</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {loading ? [1, 2, 3].map(n => <Skeleton key={n} />) : inStock.map((item, idx) => (
                                            <div key={item.id} className={`bg-white rounded-2xl border border-slate-200 overflow-hidden card fin shadow-sm ${item.removing ? "out" : ""}`} style={{ animationDelay: `${idx * 60}ms` }}>
                                                {item.discount >= 15 && (
                                                    <div className="bg-gradient-to-r from-emerald-50 to-transparent px-5 py-2 border-b border-emerald-100 flex items-center gap-2">
                                                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                                        <span className="text-[11px] font-bold text-emerald-700">{item.discount}% discount applied on this item</span>
                                                    </div>
                                                )}
                                                <div className="flex gap-4 p-5">
                                                    {/* Image */}
                                                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                                                        <div className="w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
                                                            <img src={item.image} alt={item.name} className="w-20 h-20 object-contain mix-blend-multiply" onError={e => { e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center text-2xl font-black text-slate-200">Rx</div>`; }} />
                                                        </div>
                                                        {item.rx && (
                                                            <div className="flex items-center gap-1 bg-orange-50 border border-orange-200 rounded-lg px-2 py-1">
                                                                <svg className="w-2.5 h-2.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                                                <span className="text-[9px] font-bold text-orange-600 uppercase tracking-wide">Rx Reqd</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="min-w-0 flex-1">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                                                                <h3 className="font-bold text-slate-900 text-[15px] leading-snug mt-0.5">{item.name}</h3>
                                                                <p className="text-xs text-slate-400 mt-0.5 font-medium">{item.manufacturer}</p>
                                                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.composition}</p>
                                                                <p className="text-[11px] text-slate-400 mt-0.5">{item.packInfo}</p>
                                                            </div>
                                                            <button onClick={() => removeItem(item.id)} className="flex-shrink-0 p-2 rounded-xl text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                            </button>
                                                        </div>
                                                        {/* Price & Qty */}
                                                        <div className="flex items-end justify-between mt-4 flex-wrap gap-3">
                                                            <div>
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-[22px] font-black text-slate-900 leading-none">₹{(item.price * item.qty).toFixed(0)}</span>
                                                                    <span className="text-sm text-slate-400 line-through font-medium">₹{(item.mrp * item.qty).toFixed(0)}</span>
                                                                </div>
                                                                <p className="text-[11px] text-emerald-600 font-semibold mt-1">Save ₹{((item.mrp - item.price) * item.qty).toFixed(0)} on this item</p>
                                                            </div>
                                                            <QtyBox qty={item.qty} onInc={() => updateQty(item.id, 1)} onDec={() => updateQty(item.id, -1)} />
                                                        </div>
                                                        {/* Footer row */}
                                                        <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-slate-100 flex-wrap gap-2">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                                                <span className="text-[11px] text-slate-500 font-medium">{item.deliveryLabel}</span>
                                                                {item.deliveryFree && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">FREE</span>}
                                                            </div>
                                                            <button onClick={() => saveItem(item.id)} className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                                                                Save for later
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                {/* Substitute notice */}
                                                {item.substitutesCount > 0 && (
                                                    <div className="mx-5 mb-4 bg-sky-50 border border-sky-100 rounded-xl px-4 py-2.5 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="w-3.5 h-3.5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            <p className="text-[11px] text-sky-700 font-medium">{item.substitutesCount} cheaper alternatives available for this medicine</p>
                                                        </div>
                                                        <button className="text-[11px] font-bold text-sky-600 hover:underline whitespace-nowrap">View →</button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Out of stock */}
                            {outStock.length > 0 && (
                                <div>
                                    <p className="text-sm font-bold text-red-500 mb-2.5 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        Not deliverable to this pincode
                                    </p>
                                    {outStock.map(item => (
                                        <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 opacity-55 shadow-sm">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-20 h-20 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    <img src={item.image} alt={item.name} className="w-16 h-16 object-contain grayscale opacity-60" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{item.category}</p>
                                                    <h3 className="font-bold text-slate-700 text-sm mt-0.5">{item.name}</h3>
                                                    <p className="text-xs text-slate-400">{item.composition}</p>
                                                    <div className="flex items-center gap-3 mt-2">
                                                        <span className="text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">Out of Stock</span>
                                                        <button onClick={() => removeItem(item.id)} className="text-[11px] text-slate-400 hover:text-red-500 font-semibold transition-colors">Remove</button>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className="text-lg font-black text-slate-600">₹{item.price}</p>
                                                    <p className="text-xs text-slate-400 line-through">₹{item.mrp}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Saved for later */}
                            {saved.length > 0 && (
                                <div>
                                    <p className="text-sm font-bold text-slate-600 mb-3">Saved for later ({saved.length})</p>
                                    <div className="space-y-3">
                                        {saved.map(item => (
                                            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4 items-center fin shadow-sm">
                                                <div className="w-16 h-16 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    <img src={item.image} alt={item.name} className="w-14 h-14 object-contain mix-blend-multiply" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                                                    <p className="text-xs text-slate-400">{item.packInfo}</p>
                                                    <div className="flex items-baseline gap-2 mt-1">
                                                        <span className="text-base font-black text-slate-900">₹{item.price}</span>
                                                        <span className="text-xs text-slate-400 line-through">₹{item.mrp}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1.5 flex-shrink-0">
                                                    <button onClick={() => moveToCart(item.id)} className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors">Move to Cart</button>
                                                    <button onClick={() => setSaved(p => p.filter(i => i.id !== item.id))} className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-semibold rounded-xl transition-colors">Remove</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Coupon */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                    </div>
                                    <h3 className="font-bold text-slate-800">Coupons & Offers</h3>
                                </div>
                                {applied ? (
                                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3.5">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-emerald-800">{applied.code}</p>
                                                <p className="text-xs text-emerald-600">{applied.pct}% off applied · Saving ₹{couponSave.toFixed(0)}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => { setApplied(null); setCouponInput(""); setCouponMsg({ type: "", text: "" }); }} className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-all">Remove</button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex gap-2">
                                            <input value={couponInput} onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponMsg({ type: "", text: "" }); }} onKeyDown={e => e.key === "Enter" && applyCoupon()} placeholder="Enter coupon code" className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono tracking-widest uppercase outline-none focus:ring-2 focus:ring-emerald-300 focus:border-transparent transition-all placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-slate-400" />
                                            <button onClick={applyCoupon} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-colors shadow-sm">Apply</button>
                                        </div>
                                        {couponMsg.text && <p className={`text-xs mt-2 font-medium ${couponMsg.type === "ok" ? "text-emerald-600" : "text-red-500"}`}>{couponMsg.text}</p>}
                                        <div className="mt-3.5">
                                            <p className="text-[11px] text-slate-400 font-medium mb-2">Available coupons:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(COUPONS).map(([code, pct]) => (
                                                    <button key={code} onClick={() => { setCouponInput(code); setCouponMsg({ type: "", text: "" }); }} className="flex items-center gap-1.5 border border-dashed border-emerald-300 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                                        {code} — {pct}% off
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Recommended slider */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-bold text-slate-800">Customers Also Bought</h3>
                                    <div className="flex gap-1">
                                        <button onClick={() => sliderRef.current?.scrollBy({ left: -200, behavior: "smooth" })} className="w-7 h-7 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-all">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button onClick={() => sliderRef.current?.scrollBy({ left: 200, behavior: "smooth" })} className="w-7 h-7 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-all">
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                </div>
                                <div ref={sliderRef} className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                                    {RECOMMENDED.map(r => (
                                        <div key={r.id} className="flex-shrink-0 w-40 bg-white rounded-2xl border border-slate-200 p-3.5 card shadow-sm cursor-pointer">
                                            <div className="w-full h-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-100 overflow-hidden flex items-center justify-center mb-3">
                                                <img src={r.image} alt={r.name} className="w-16 h-16 object-contain mix-blend-multiply" />
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{r.manufacturer}</p>
                                            <p className="text-xs font-bold text-slate-800 mt-0.5 mb-1.5 leading-tight line-clamp-2">{r.name}</p>
                                            <div className="flex items-center gap-1 mb-2">
                                                <Stars rating={r.rating} />
                                                <span className="text-[10px] text-slate-400">{r.ratingCount}</span>
                                            </div>
                                            <div className="flex items-baseline gap-1.5 mb-2.5">
                                                <span className="text-sm font-black text-slate-900">₹{r.price}</span>
                                                <span className="text-[11px] text-slate-400 line-through">₹{r.mrp}</span>
                                            </div>
                                            <button className="w-full py-1.5 border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-600 hover:text-white text-[11px] font-bold rounded-xl transition-all duration-200">
                                                Add
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — Summary */}
                        <div className="lg:col-span-4">
                            <div className="lg:sticky lg:top-[72px] space-y-4">
                                {inStock.length > 0 && (
                                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                                            <h3 className="font-bold text-slate-800 text-base">Price Details</h3>
                                            <p className="text-xs text-slate-400 mt-0.5">{inStock.length} item{inStock.length !== 1 ? "s" : ""} · {inStock.reduce((s, i) => s + i.qty, 0)} quantity</p>
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
                                                    <span className="font-semibold text-emerald-600 flex items-center gap-1"><span className="line-through text-slate-400 font-normal text-xs">₹49</span> FREE</span>
                                                ) : (
                                                    <span className="font-semibold text-slate-800">₹{delivery}</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500 flex items-center gap-1">
                                                    Platform Fee
                                                    <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </span>
                                                <span className="font-semibold text-slate-800">₹{platform}</span>
                                            </div>
                                            <div className="h-px bg-slate-100" />
                                            <div className="flex justify-between items-center">
                                                <span className="font-black text-slate-900 text-base">Total Amount</span>
                                                <span className="font-black text-2xl text-slate-900">₹{grand.toFixed(0)}</span>
                                            </div>
                                        </div>
                                        {totalSave > 0 && (
                                            <div className="mx-5 mb-4 flex items-center gap-2.5 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl px-4 py-3">
                                                <svg className="w-4 h-4 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                <p className="text-xs font-bold text-emerald-700">You're saving <span className="text-emerald-800">₹{totalSave.toFixed(0)}</span> on this order!</p>
                                            </div>
                                        )}
                                        <div className="px-5 pb-5 space-y-3">
                                            <button className="shine w-full py-4 text-white font-black rounded-2xl text-[15px] shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 tracking-wide" style={{ background: "linear-gradient(135deg,#16a34a 0%,#059669 60%,#047857 100%)" }}>
                                                <span className="flex items-center justify-center gap-2">
                                                    Proceed to Checkout
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                                </span>
                                            </button>
                                            <div className="flex items-center justify-center gap-1.5">
                                                <svg className="w-3 h-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                <p className="text-[10px] text-slate-400 font-medium">Safe, Secure & 100% Authentic</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Trust */}
                                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm divide-y divide-slate-100">
                                    {[
                                        { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />, label: "100% Genuine Medicines", sub: "Sourced from licensed pharmacies" },
                                        { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />, label: "Secure Payments", sub: "256-bit SSL encrypted checkout" },
                                        { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />, label: "Express Delivery", sub: "Delivered to your doorstep fast" },
                                        { icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />, label: "24/7 Pharmacist Support", sub: "Talk to our licensed pharmacists" },
                                    ].map((b, i) => (
                                        <div key={i} className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <div className="w-9 h-9 bg-emerald-50 group-hover:bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                                                <svg className="w-4.5 h-4.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">{b.icon}</svg>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800">{b.label}</p>
                                                <p className="text-[10px] text-slate-400 mt-0.5">{b.sub}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Payments */}
                                <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4 shadow-sm">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">We Accept</p>
                                    <div className="flex flex-wrap gap-2">
                                        {["UPI", "Visa", "Mastercard", "Rupay", "NetBanking", "Paytm", "Cash on Delivery"].map(p => (
                                            <span key={p} className="text-[10px] font-semibold bg-slate-50 border border-slate-200 text-slate-500 px-2.5 py-1.5 rounded-xl hover:border-slate-300 transition-colors cursor-pointer">{p}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

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