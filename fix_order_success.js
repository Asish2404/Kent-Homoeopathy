const fs = require('fs');
const path = 'c:/Users/Asish/OneDrive/Desktop/Kent web/Project/src/pages/OrderSuccess.jsx';
let c = fs.readFileSync(path, 'utf8');
const EOL = '\r\n';

// Update the OrderSuccess to use real data from kent_order
// Replace the orderId and eta with real data from localStorage

const oldDataSection = '  const order = useMemo(() => {' + EOL +
  '    try {' + EOL +
  '      const raw = localStorage.getItem("kent_order");' + EOL +
  '      return raw ? JSON.parse(raw) : null;' + EOL +
  '    } catch {' + EOL +
  '      return null;' + EOL +
  '    }' + EOL +
  '  }, []);' + EOL +
  '' + EOL +
  '  const [tick, setTick] = useState(0);' + EOL +
  '  useEffect(() => {' + EOL +
  '    const id = setInterval(() => setTick((t) => t + 1), 1000);' + EOL +
  '    return () => clearInterval(id);' + EOL +
  '  }, []);' + EOL +
  '' + EOL +
  '  // Signal Profile page to refresh orders when user visits it' + EOL +
  '  useEffect(() => {' + EOL +
  '    localStorage.setItem("kent_order_placed", "true");' + EOL +
  '  }, []);' + EOL +
  '' + EOL +
  '  const orderId = order?.id || "DK000000";' + EOL +
  '  const eta = order?.estimatedDelivery || "";';

const newDataSection = '  const order = useMemo(() => {' + EOL +
  '    try {' + EOL +
  '      const raw = localStorage.getItem("kent_order");' + EOL +
  '      return raw ? JSON.parse(raw) : null;' + EOL +
  '    } catch {' + EOL +
  '      return null;' + EOL +
  '    }' + EOL +
  '  }, []);' + EOL +
  '' + EOL +
  '  const [tick, setTick] = useState(0);' + EOL +
  '  useEffect(() => {' + EOL +
  '    const id = setInterval(() => setTick((t) => t + 1), 1000);' + EOL +
  '    return () => clearInterval(id);' + EOL +
  '  }, []);' + EOL +
  '' + EOL +
  '  // Signal Profile page to refresh orders when user visits it' + EOL +
  '  useEffect(() => {' + EOL +
  '    localStorage.setItem("kent_order_placed", "true");' + EOL +
  '  }, []);' + EOL +
  '' + EOL +
  '  // Use real order data from backend response' + EOL +
  '  const orderNumber = order?.orderNumber || order?.id || "ORD-000000";' + EOL +
  '  const orderDate = order?.createdAt || order?.orderedDate || "";' + EOL +
  '  const orderAmount = order?.grandTotal || order?.orderPrice || 0;' + EOL +
  '  const paymentMethod = order?.paymentMethod || "";' + EOL +
  '  const paymentStatus = order?.paymentStatus || "";' + EOL +
  '  const shippingAddr = order?.shippingAddress || null;' + EOL +
  '  const eta = order?.estimatedDelivery || "";' + EOL +
  '  const orderItems = order?.orderItems || order?.products || [];';

if (c.includes(oldDataSection)) {
  c = c.replace(oldDataSection, newDataSection);
  console.log('✓ Order data section updated');
} else {
  console.log('✗ Order data section not found');
}

// Update the display section to show real data
const oldDisplay = '              <div className="mt-7 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">' + EOL +
  '                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left">' + EOL +
  '                  <p className="text-xs text-slate-400">Order ID</p>' + EOL +
  '                  <p className="font-black text-slate-900 text-lg mt-1">{orderId}</p>' + EOL +
  '                </div>' + EOL +
  '                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left">' + EOL +
  '                  <p className="text-xs text-slate-400">Estimated Delivery</p>' + EOL +
  '                  <p className="font-black text-slate-900 text-lg mt-1">{eta || "2-3 days"}</p>' + EOL +
  '                </div>' + EOL +
  '              </div>';

const newDisplay = '              <div className="mt-7 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">' + EOL +
  '                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left">' + EOL +
  '                  <p className="text-xs text-slate-400">Order Number</p>' + EOL +
  '                  <p className="font-black text-slate-900 text-lg mt-1">{orderNumber}</p>' + EOL +
  '                  {paymentMethod && <p className="text-xs text-slate-500 mt-1">Payment: {paymentMethod}</p>}' + EOL +
  '                  {paymentStatus && (' + EOL +
  '                    <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold mt-1 " + (paymentStatus === "Paid" || paymentStatus === "Completed" ? "bg-emerald-100 text-emerald-700" : paymentStatus === "Failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700")}>' + EOL +
  '                      {paymentStatus}' + EOL +
  '                    </span>' + EOL +
  '                  )}' + EOL +
  '                </div>' + EOL +
  '                <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left">' + EOL +
  '                  <p className="text-xs text-slate-400">Amount Paid</p>' + EOL +
  '                  <p className="font-black text-slate-900 text-lg mt-1">₹{Number(orderAmount).toFixed(0)}</p>' + EOL +
  '                  <p className="text-xs text-slate-500 mt-1">{eta || "Estimated delivery: 2-3 days"}</p>' + EOL +
  '                </div>' + EOL +
  '              </div>' + EOL +
  '              {shippingAddr && (' + EOL +
  '                <div className="mt-4 w-full max-w-2xl bg-slate-50 rounded-2xl border border-slate-200 px-5 py-4 text-left">' + EOL +
  '                  <p className="text-xs text-slate-400 font-semibold mb-1">Delivery Address</p>' + EOL +
  '                  <p className="font-semibold text-slate-900 text-sm">{shippingAddr.fullName}</p>' + EOL +
  '                  <p className="text-xs text-slate-600">{shippingAddr.house}, {shippingAddr.street}</p>' + EOL +
  '                  <p className="text-xs text-slate-600">{shippingAddr.city}, {shippingAddr.state} - {shippingAddr.pincode}</p>' + EOL +
  '                  <p className="text-xs text-slate-500 mt-0.5">{shippingAddr.phone}</p>' + EOL +
  '                </div>' + EOL +
  '              )}';

if (c.includes(oldDisplay)) {
  c = c.replace(oldDisplay, newDisplay);
  console.log('✓ Order info display updated');
} else {
  console.log('✗ Order info display not found');
}

// Update View Orders button to go to Profile
const oldViewOrders = '                <button' + EOL +
  '                  onClick={() => navigate("/Products")}' + EOL +
  '                  className="btn-outline w-full sm:w-auto sm:flex-none"' + EOL +
  '                  style={{ padding: "14px 18px" }}' + EOL +
  '                >' + EOL +
  '                  View Orders' + EOL +
  '                </button>';

const newViewOrders = '                <button' + EOL +
  '                  onClick={() => navigate("/Profile", { state: { tab: "orders" } })}' + EOL +
  '                  className="btn-outline w-full sm:w-auto sm:flex-none"' + EOL +
  '                  style={{ padding: "14px 18px" }}' + EOL +
  '                >' + EOL +
  '                  View My Orders' + EOL +
  '                </button>';

if (c.includes(oldViewOrders)) {
  c = c.replace(oldViewOrders, newViewOrders);
  console.log('✓ View Orders button updated');
} else {
  console.log('✗ View Orders button not found');
}

fs.writeFileSync(path, c, 'utf8');
console.log('✅ OrderSuccess.jsx update complete');
