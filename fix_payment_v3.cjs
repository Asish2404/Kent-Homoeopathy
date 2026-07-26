const fs = require('fs');
const path = 'c:/Users/Asish/OneDrive/Desktop/Kent web/Project/src/pages/Payment.jsx';
let c = fs.readFileSync(path, 'utf8');

// CRLF line endings
const EOL = '\r\n';

// 1. Add STORAGE_KEY import
const oldImport = 'import { useCartContext } from "../Cart/CartContext";';
const newImport = 'import { useCartContext } from "../Cart/CartContext";' + EOL + 'import { STORAGE_KEY } from "../Cart/cartUtils";';
c = c.replace(oldImport, newImport);

// 2. Update non-Razorpay handler (around position 7237)
const oldNonRazorpay = 
  'const { data } = await api.post("/orders/place", payload);' + EOL +
  '        localStorage.removeItem("kent_cart");' + EOL +
  '        localStorage.removeItem("kent_checkout");' + EOL +
  '        localStorage.removeItem("kent_coupon");' + EOL +
  '        navigate("/order-success", { state: { orderId: data.order?._id || data._id }, replace: true });';

const newNonRazorpay = 
  'const { data } = await api.post("/orders/place", payload);' + EOL +
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

if (c.includes(oldNonRazorpay)) {
  c = c.replace(oldNonRazorpay, newNonRazorpay);
  console.log('Updated non-Razorpay handler');
} else {
  console.log('FAILED: non-Razorpay pattern not found');
}

// 3. Update Razorpay verify handler
const oldRazorpay =
  '              navigate("/order-success", { replace: true });' + EOL +
  '            } catch (err) {' + EOL +
  '              setOrderError("Payment verification failed. Please contact support.");';

const newRazorpay = 
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

// First replace the verify call to capture the response
const oldVerifyCall = 
  '              await api.post("/payment/verify", {' + EOL +
  '                razorpay_order_id: response.razorpay_order_id,' + EOL +
  '                razorpay_payment_id: response.razorpay_payment_id,' + EOL +
  '                razorpay_signature: response.razorpay_signature,' + EOL +
  '                checkoutPayload: checkout,' + EOL +
  '              });' + EOL +
  '              navigate("/order-success", { replace: true });' + EOL +
  '            } catch (err) {' + EOL +
  '              setOrderError("Payment verification failed. Please contact support.");';

const newVerifyCall = 
  '              const verifyRes = await api.post("/payment/verify", {' + EOL +
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
  '              if (verifyRes.data && verifyRes.data.order) {' + EOL +
  '                localStorage.setItem("kent_order", JSON.stringify(verifyRes.data.order));' + EOL +
  '              }' + EOL +
  '              localStorage.setItem("kent_order_placed", "true");' + EOL +
  '              localStorage.setItem("kent_last_order_id", "");' + EOL +
  '              navigate("/order-success", { replace: true });' + EOL +
  '            } catch (err) {' + EOL +
  '              setOrderError("Payment verification failed. Please contact support.");';

if (c.includes(oldVerifyCall)) {
  c = c.replace(oldVerifyCall, newVerifyCall);
  console.log('Updated Razorpay verify handler');
} else {
  console.log('FAILED: Razorpay pattern not found -
