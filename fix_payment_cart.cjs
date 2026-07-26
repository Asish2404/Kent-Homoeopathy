const fs = require('fs');
const path = 'c:/Users/Asish/OneDrive/Desktop/Kent web/Project/src/pages/Payment.jsx';
let c = fs.readFileSync(path, 'utf8');

// 1. Add import for STORAGE_KEY from cartUtils
// Find the import section
const importSection = `import { useEffect, useMemo, useState, useCallback } from "react";
import { useCartContext } from "../Cart/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";`;

const newImport = `import { useEffect, useMemo, useState, useCallback } from "react";
import { useCartContext } from "../Cart/CartContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { STORAGE_KEY } from "../Cart/cartUtils";`;

c = c.replace(importSection, newImport);

// 2. Update the non-Razorpay order handler to clear cart and save order data
const oldOrderHandler = `        const { data } = await api.post("/orders/place", payload);
        localStorage.removeItem("kent_cart");
        localStorage.removeItem("kent_checkout");
        localStorage.removeItem("kent_coupon");
        navigate("/order-success", { state: { orderId: data.order?._id || data._id }, replace: true });`;

const newOrderHandler = `        const { data } = await api.post("/orders/place", payload);
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
        navigate("/order-success", { replace: true, state: { orderId: data.order?._id || data._id } });`;

if (c.includes(oldOrderHandler)) {
  c = c.replace(oldOrderHandler, newOrderHandler);
  console.log('Updated non-Razorpay order handler');
} else {
  console.log('Could not find non-Razorpay order handler pattern');
}

// 3. Update Razorpay verify handler to also clear cart
const oldRazorpayHandler = `            try {
              await api.post("/payment/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                checkoutPayload: checkout,
              });
              navigate("/order-success", { replace: true });`;

const newRazorpayHandler = `            try {
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
              // Signal Profile page to refresh
              localStorage.setItem("kent_order_placed", "true");
              localStorage.setItem("kent_last_order_id", "");
              navigate("/order-success", { replace: true });`;

if (c.includes(oldRazorpayHandler)) {
  c = c.replace(oldRazorpayHandler, newRazorpayHandler);
  console.log('Updated Razorpay handler');
} else {
  console.log('Could not find Razorpay handler pattern - trying with different spacing...');
  // Try with different whitespace
  const altPattern = `              await api.post("/payment/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                checkoutPayload: checkout,
              });
              navigate("/order-success", { replace: true });`;
  if (c.includes(altPattern)) {
    const altReplace = `              const verifyRes = await api.post("/payment/verify", {
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
              if (verifyRes.data && verifyRes.data.order) {
                localStorage.setItem("kent_order", JSON.stringify(verifyRes.data.order));
              }
              localStorage.setItem("kent_order_placed", "true");
              localStorage.setItem("kent_last_order_id", "");
              navigate("/order-success", { replace: true });`;
    c = c.replace(altPattern, altReplace);
    console.log('Updated Razorpay handler (alt pattern)');
  }
}

fs.writeFileSync(path, c, 'utf8');
console.log('Payment.jsx update complete');
