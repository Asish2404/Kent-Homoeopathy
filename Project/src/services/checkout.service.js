import api from "./api";

// ========================
// CART
// ========================

export const getCart = async () => {
  const { data } = await api.get("/cart");
  return data;
};

// ========================
// ADDRESS
// ========================

export const createAddress = async (addressData) => {
  const { data } = await api.post("/address", addressData);
  return data;
};

export const getAddresses = async () => {
  const { data } = await api.get("/address");
  return data;
};

// ========================
// COUPONS
// ========================

export const validateCoupon = async ({ couponCode, cartAmount, productIds, categoryIds }) => {
  const { data } = await api.post("/coupons/validate", {
    couponCode,
    cartAmount,
    productIds,
    categoryIds,
  });
  return data;
};

export const applyCoupon = async ({ couponCode, cartAmount, productIds, categoryIds }) => {
  const { data } = await api.post("/coupons/apply", {
    couponCode,
    cartAmount,
    productIds,
    categoryIds,
  });
  return data;
};

export const removeCoupon = async ({ couponCode, reservationId }) => {
  const { data } = await api.post("/coupons/remove", {
    couponCode,
    reservationId,
  });
  return data;
};

// ========================
// SEARCH
// ========================

export const universalSearch = async (q) => {
  const { data } = await api.get("/search", { params: { q } });
  return data;
};

// ========================
// DOCTORS
// ========================

export const getDoctors = async (params = {}) => {
  const { data } = await api.get("/doctor", { params });
  return data;
};

export const getDoctorById = async (doctorId) => {
  const { data } = await api.get(`/doctor/${doctorId}`);
  return data;
};

// ========================
// ORDERS
// ========================

export const placeOrder = async (orderData) => {
  const { data } = await api.post("/orders/place", orderData);
  return data;
};

// ========================
// PAYMENT
// ========================

export const createRazorpayOrder = async ({ amount, currency, paymentFor, referenceId }) => {
  const { data } = await api.post("/payment/create-order", {
    amount,
    currency,
    paymentFor,
    referenceId,
  });
  return data;
};

export const verifyPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const { data } = await api.post("/payment/verify", {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
  return data;
};

