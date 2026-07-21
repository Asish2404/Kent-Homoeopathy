import api from "../../services/api";

// ========================
// DASHBOARD OVERVIEW
// ========================

export const getDashboardOverview = async () => {
  const { data } = await api.get("/dashboard/overview");
  return data;
};

export const getRevenueAnalytics = async (params = {}) => {
  const { data } = await api.get("/dashboard/revenue", { params });
  return data;
};

export const getDashboardOrders = async (params = {}) => {
  const { data } = await api.get("/dashboard/orders", { params });
  return data;
};

export const getDashboardPayments = async (params = {}) => {
  const { data } = await api.get("/dashboard/payments", { params });
  return data;
};

export const getDashboardProducts = async (params = {}) => {
  const { data } = await api.get("/dashboard/products", { params });
  return data;
};

export const getDashboardDoctors = async (params = {}) => {
  const { data } = await api.get("/dashboard/doctors", { params });
  return data;
};

export const getDashboardPatients = async (params = {}) => {
  const { data } = await api.get("/dashboard/patients", { params });
  return data;
};

export const getDashboardCustomers = async (params = {}) => {
  const { data } = await api.get("/dashboard/patients", { params });
  return data;
};

export const getDashboardAppointments = async (params = {}) => {
  const { data } = await api.get("/dashboard/appointments", { params });
  return data;
};

export const getDashboardReports = async (params = {}) => {
  const { data } = await api.get("/dashboard/reports", { params });
  return data;
};

export const getDashboardCharts = async (params = {}) => {
  const { data } = await api.get("/dashboard/charts", { params });
  return data;
};

// ========================
// ORDERS (Admin)
// ========================

export const getOrders = async (params = {}) => {
  const { data } = await api.get("/orders/admin/orders", { params });
  return data;
};

// ========================
// PRODUCTS
// ========================

export const getProducts = async (params = {}) => {
  const { data } = await api.get("/products", { params });
  return data;
};

// ========================
// USERS / CUSTOMERS
// ========================

export const getCustomers = async (params = {}) => {
  const { data } = await api.get("/auth/users", { params });
  return data;
};

// ========================
// INVENTORY
// ========================

export const getInventory = async (params = {}) => {
  const { data } = await api.get("/inventory", { params });
  return data;
};

// ========================
// CATEGORIES
// ========================

export const getCategories = async (params = {}) => {
  const { data } = await api.get("/category", { params });
  return data;
};

// ========================
// COUPONS
// ========================

export const getCoupons = async (params = {}) => {
  const { data } = await api.get("/coupons", { params });
  return data;
};

// ========================
// REVIEWS
// ========================

export const getReviews = async (params = {}) => {
  const { data } = await api.get("/reviews", { params });
  return data;
};

// ========================
// DOCTORS
// ========================

export const getDoctorsList = async (params = {}) => {
  const { data } = await api.get("/doctor", { params });
  return data;
};

// ========================
// PAYMENTS (Admin)
// ========================

export const getPayments = async (params = {}) => {
  const { data } = await api.get("/payment/history", { params });
  return data;
};

// ========================
// NOTIFICATIONS
// ========================

export const getNotifications = async (params = {}) => {
  const { data } = await api.get("/notifications", { params });
  return data;
};

