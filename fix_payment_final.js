const fs = require('fs');
const path = 'c:/Users/Asish/OneDrive/Desktop/Kent web/Project/src/pages/Payment.jsx';
let c = fs.readFileSync(path, 'utf8');
const EOL = '\r\n';

// 1. Add STORAGE_KEY import
const oldImport = 'import { useCartContext } from "../Cart/CartContext";' + EOL + 'import { useNavigate } from "react-router-dom";' + EOL + 'import api from "../services/api";';
const newImport = 'import { useCartContext } from "../Cart/CartContext";' + EOL + 'import { STORAGE_KEY } from "../Cart/cartUtils";' + EOL + 'import { useNavigate } from "react-router-dom";' + EOL + 'import api from "../services/api";';
if (c.includes(oldImport)) {
  c = c.replace(oldImport, newImport);
  console.log('✓ Import added');
} else {
  console.log('✗ Import pattern not found');
}

// 2. Update non-Razorpay handler
const oldNonR = 'const { data } = await api.post("/orders/place", payload);' + EOL +
  '        localStorage.removeItem("kent_cart");' + EOL +
  '        localStorage.removeItem("kent_checkout");' + EOL +
  '        localStorage.removeItem("kent_coupon");' + EOL +
  '        navigate("/order-success", { state: { orderId: data.order?._id || data._id }, replace: true });';

const newNonR = 'const { data } = await api.post("/orders/place", payload);' + EOL +
  '        // Clear cart after successful order' + EOL +
  '        cart.clearCart();' + EOL +
  '        localStorage.removeItem("kent_cart");' + EOL +
  '        try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}' + EOL +
  '        localStorage.removeItem("kent_checkout");' + EOL +
  '        localStorage.removeItem("kent_coupon");' + EOL +
  '        // Save order data for OrderSuccess page' + EOL +
  '        if (data.order) {' + EOL +
  '          localStorage.setItem("kent_order", JSON.stringify(data.order));' + EOL +
  '        }' + EOL +
  '        // Signal Profile page to refresh' + EOL +
  '        localStorage.setItem("kent_order_placed", "true");' + EOL +
  '        localStorage.setItem("kent_last_order_id", data.order?._id || data._id || "");' + EOL +
  '        navigate("/order-success", { replace: true, state: { orderId: data.order?._id || data._id } });';

if (c.includes(oldNonR)) {
  c = c.replace(oldNonR, newNonR);
  console.log('✓ Non-Razorpay handler updated');
} else {
  console.log('✗ Non-Razorpay pattern not found');
}

// 3. Update Razorpay handler
const oldRazorpay = '              await api.post("/payment/verify", {' + EOL +
  '                razorpay_order_id: response.razorpay_order_id,' + EOL +
  '                razorpay_payment_id: response.razorpay_payment_id,' + EOL +
  '                razorpay_signature: response.razorpay_signature,' + EOL +
  '                checkoutPayload: checkout,' + EOL +
  '              });' + EOL +
  '              navigate("/order-success", { replace: true });' + EOL +
  '            } catch (err) {' + EOL +
  '              setOrderError("Payment verification failed. Please contact support.");';

const newRazorpay = '              const verifyRes = await api.post("/payment/verify", {' + EOL +
  '                razorpay_order_id: response.razorpay_order_id,' + EOL +
  '                razorpay_payment_id: response.razorpay_payment_id,' + EOL +
  '                razorpay_signature: response.razorpay_signature,' + EOL +
  '                checkoutPayload: checkout,' + EOL +
  '              });' + EOL +
  '              // Clear cart after successful payment' + EOL +
  '              cart.clearCart();' + EOL +
  '              localStorage.removeItem("kent_cart");' + EOL +
  '              try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}' + EOL +
  '              localStorage.removeItem("kent_checkout");' + EOL +
  '              localStorage.removeItem("kent_coupon");' + EOL +
  '              // Save order data for OrderSuccess page' + EOL +
  '              if (verifyRes.data && verifyRes.data.order) {' + EOL +
  '                localStorage.setItem("kent_order", JSON.stringify(verifyRes.data.order));' + EOL +
  '              }' + EOL +
  '              localStorage.setItem("kent_order_placed", "true");' + EOL +
  '              localStorage.setItem("kent_last_order_id", "");' + EOL +
  '              navigate("/order-success", { replace: true });' + EOL +
  '            } catch (err) {' + EOL +
  '              setOrderError("Payment verification failed. Please contact support.");';

if (c.includes(oldRazorpay)) {
  c = c.replace(oldRazorpay, newRazorpay);
  console.log('✓ Razorpay handler updated');
} else {
  console.log('✗ Razorpay pattern not found - trying alt...');
  // Try without capturing verifyRes
  const altOld = '              await api.post("/payment/verify", {' + EOL +
    '                razorpay_order_id: response.razorpay_order_id,' + EOL +
    '                razorpay_payment_id: response.razorpay_payment_id,' + EOL +
    '                razorpay_signature: response.razorpay_signature,' + EOL +
    '                checkoutPayload: checkout,' + EOL +
    '              });' + EOL +
    '              navigate("/order-success", { replace: true });';
  if (c.includes(altOld)) {
    const altNew = '              await api.post("/payment/verify", {' + EOL +
      '                razorpay_order_id: response.razorpay_order_id,' + EOL +
      '                razorpay_payment_id: response.razorpay_payment_id,' + EOL +
      '                razorpay_signature: response.razorpay_signature,' + EOL +
      '                checkoutPayload: checkout,' + EOL +
      '              });' + EOL +
      '              cart.clearCart();' + EOL +
      '              localStorage.removeItem("kent_cart");' + EOL +
      '              try { localStorage.removeItem(STORAGE_KEY); } catch(e) {}' + EOL +
      '              localStorage.removeItem("kent_checkout");' + EOL +
      '              localStorage.removeItem("kent_coupon");' + EOL +
      '              localStorage.setItem("kent_order_placed", "true");' + EOL +
      '              navigate("/order-success", { replace: true });';
    c = c.replace(altOld, altNew);
    console.log('✓ Razorpay handler updated (alt)');
  }
}

fs.writeFileSync(path, c, 'utf8');
console.log('✅ Payment.jsx update complete');
