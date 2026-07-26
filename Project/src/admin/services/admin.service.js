import api from "../../services/api";

// ========================
// EXPORT FUNCTIONS
// ========================

const downloadFile = (data, filename, type) => {
  const blob = new Blob([data], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const exportProducts = async (format = "csv") => {
  const { data } = await api.get("/export/products", {
    params: { format },
    responseType: "blob",
  });
  downloadFile(data, `products_export_${Date.now()}.${format}`, format === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv");
};

export const exportOrders = async (format = "csv") => {
  const { data } = await api.get("/export/orders", {
    params: { format },
    responseType: "blob",
  });
  downloadFile(data, `orders_export_${Date.now()}.${format}`, format === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv");
};

export const exportCustomers = async (format = "csv") => {
  const { data } = await api.get("/export/customers", {
    params: { format },
    responseType: "blob",
  });
  downloadFile(data, `customers_export_${Date.now()}.${format}`, format === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv");
};

export const exportInventory = async (format = "csv") => {
  const { data } = await api.get("/export/inventory", {
    params: { format },
    responseType: "blob",
  });
  downloadFile(data, `inventory_export_${Date.now()}.${format}`, format === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv");
};

export const exportCoupons = async (format = "csv") => {
  const { data } = await api.get("/export/coupons", {
    params: { format },
    responseType: "blob",
  });
  downloadFile(data, `coupons_export_${Date.now()}.${format}`, format === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv");
};

export const exportReports = async (format = "csv") => {
  const { data } = await api.get("/export/reports", {
    params: { format },
    responseType: "blob",
  });
  downloadFile(data, `reports_export_${Date.now()}.${format}`, format === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv");
};

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

export const createProduct = async (productData) => {
  const { data } = await api.post("/products", productData);
  return data;
};

export const updateProduct = async (productId, productData) => {
  const { data } = await api.patch(`/products/${productId}`, productData);
  return data;
};

export const deleteProduct = async (productId) => {
  const { data } = await api.delete(`/products/${productId}`);
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

export const createCoupon = async (couponData) => {
  const { data } = await api.post("/coupons", couponData);
  return data;
};

export const updateCoupon = async (couponId, couponData) => {
  const { data } = await api.patch(`/coupons/${couponId}`, couponData);
  return data;
};

export const deleteCoupon = async (couponId) => {
  const { data } = await api.delete(`/coupons/${couponId}`);
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

