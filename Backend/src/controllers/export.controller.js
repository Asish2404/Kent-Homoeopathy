import XLSX from "xlsx";
import mongoose from "mongoose";

import { Product } from "../models/atanu.product.model.js";
import { Order } from "../models/atanu.order.model.js";
import { User } from "../models/atanu.user.model.js";
import { Inventory } from "../models/inventory.model.js";
import { Coupon } from "../models/coupon.model.js";

const toBuffer = (workbook) => XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

const sendXLSX = (res, workbook, filename) => {
  const buffer = toBuffer(workbook);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}.xlsx"`);
  return res.status(200).send(buffer);
};

const sendCSV = (res, rows, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}.csv"`);
  return res.status(200).send(csv);
};

const getExportFormat = (req) => {
  const format = (req.query.format || "csv").toString().toLowerCase();
  return format === "xlsx" ? "xlsx" : "csv";
};

const buildWorkbook = (sheetName, rows) => {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return wb;
};

// ─── Products Export ────────────────────────────────────────────────
export const exportProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category").lean();
    const rows = products.map((p) => ({
      ID: p._id?.toString() || "",
      Name: p.product_name || "",
      Brand: p.brand || "",
      Category: p.category?.category_name || "",
MRP: p.mrp_price || 0,
      DiscountPrice: p.discount_price || 0,
      Stock: p.stock ?? 0,
      AverageRating: p.averageRating || 0,
      TotalReviews: p.totalReviews || 0,
      Description: p.short_description || "",
      CreatedAt: p.createdAt ? new Date(p.createdAt).toISOString() : "",
    }));

    const format = getExportFormat(req);
    const filename = `products_export_${Date.now()}`;

    if (format === "xlsx") {
      return sendXLSX(res, buildWorkbook("Products", rows), filename);
    }
    return sendCSV(res, rows, filename);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Export failed" });
  }
};

// ─── Orders Export ──────────────────────────────────────────────────
export const exportOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("user").populate("customer").lean();
    const rows = orders.map((o) => ({
      OrderNumber: o.orderNumber || "",
      Customer: o.shippingAddress?.fullName || o.customer?.user_name || "",
      Email: o.shippingAddress?.email || "",
      Phone: o.shippingAddress?.phone || "",
      Status: o.status || o.orderStatus || "",
      PaymentMethod: o.paymentMethod || "",
      PaymentStatus: o.paymentStatus || "",
      Subtotal: o.subtotal || 0,
      Discount: o.discount || 0,
      DeliveryCharge: o.deliveryCharge || 0,
      Tax: o.tax || 0,
      GrandTotal: o.grandTotal || o.orderPrice || 0,
      Address: `${o.shippingAddress?.house || ""}, ${o.shippingAddress?.street || ""}, ${o.shippingAddress?.city || ""}, ${o.shippingAddress?.state || ""} - ${o.shippingAddress?.pincode || ""}`,
      Items: Array.isArray(o.orderItems) ? o.orderItems.length : 0,
      CreatedAt: o.createdAt ? new Date(o.createdAt).toISOString() : "",
    }));

    const format = getExportFormat(req);
    const filename = `orders_export_${Date.now()}`;

    if (format === "xlsx") {
      return sendXLSX(res, buildWorkbook("Orders", rows), filename);
    }
    return sendCSV(res, rows, filename);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Export failed" });
  }
};

// ─── Customers Export ───────────────────────────────────────────────
export const exportCustomers = async (req, res) => {
  try {
    const users = await User.find().lean();
    const rows = users.map((u) => ({
      ID: u._id?.toString() || "",
      Name: u.user_name || u.name || "",
      Email: u.email || "",
      Phone: u.phone || "",
      Role: u.role || "user",
      Orders: u.ordersCount ?? u.totalOrders ?? 0,
      CreatedAt: u.createdAt ? new Date(u.createdAt).toISOString() : "",
    }));

    const format = getExportFormat(req);
    const filename = `customers_export_${Date.now()}`;

    if (format === "xlsx") {
      return sendXLSX(res, buildWorkbook("Customers", rows), filename);
    }
    return sendCSV(res, rows, filename);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Export failed" });
  }
};

// ─── Inventory Export ───────────────────────────────────────────────
export const exportInventory = async (req, res) => {
  try {
    const inventories = await Inventory.find({ isDeleted: { $ne: true } })
      .populate("product")
      .lean();

    const rows = inventories.map((inv) => ({
      ID: inv._id?.toString() || "",
      ProductName: inv.product?.product_name || inv.productName || "",
      BatchNumber: inv.batchNumber || "",
      AvailableStock: inv.availableStock ?? inv.currentStock ?? 0,
      MinimumStockLevel: inv.minimumStockLevel ?? 0,
      StockStatus: inv.stockStatus || "",
      PurchasePrice: inv.purchasePrice || 0,
      SellingPrice: inv.sellingPrice || 0,
      MRP: inv.mrp || 0,
      Supplier: inv.supplierName || inv.supplierCode || "",
      ManufacturingDate: inv.manufacturingDate ? new Date(inv.manufacturingDate).toISOString().split("T")[0] : "",
      ExpiryDate: inv.expiryDate ? new Date(inv.expiryDate).toISOString().split("T")[0] : "",
      Warehouse: inv.warehouseLocation || "",
      CreatedAt: inv.createdAt ? new Date(inv.createdAt).toISOString() : "",
    }));

    const format = getExportFormat(req);
    const filename = `inventory_export_${Date.now()}`;

    if (format === "xlsx") {
      return sendXLSX(res, buildWorkbook("Inventory", rows), filename);
    }
    return sendCSV(res, rows, filename);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Export failed" });
  }
};

// ─── Coupons Export ─────────────────────────────────────────────────
export const exportCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().lean();
    const rows = coupons.map((c) => ({
      Code: c.couponCode || "",
      Name: c.couponName || "",
      DiscountType: c.discountType || "",
      DiscountValue: c.discountValue || 0,
      MaxDiscount: c.maximumDiscountAmount || 0,
      MinOrderValue: c.minimumOrderValue || 0,
      UsageLimit: c.totalUsageLimit || 0,
      UsagePerUser: c.usagePerUser || 1,
      UsedCount: c.currentUsageCount || 0,
      Status: c.status || "",
      StartDate: c.startDate ? new Date(c.startDate).toISOString().split("T")[0] : "",
      ExpiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().split("T")[0] : "",
      CreatedAt: c.createdAt ? new Date(c.createdAt).toISOString() : "",
    }));

    const format = getExportFormat(req);
    const filename = `coupons_export_${Date.now()}`;

    if (format === "xlsx") {
      return sendXLSX(res, buildWorkbook("Coupons", rows), filename);
    }
    return sendCSV(res, rows, filename);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Export failed" });
  }
};

// ─── Reports Export ─────────────────────────────────────────────────
export const exportReports = async (req, res) => {
  try {
    const { range } = req.query;
    const match = {};
    if (range === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      match.createdAt = { $gte: start, $lte: end };
    } else if (range === "week") {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 7);
      match.createdAt = { $gte: start, $lte: end };
    } else if (range === "month") {
      const end = new Date();
      const start = new Date(end);
      start.setMonth(start.getMonth() - 1);
      match.createdAt = { $gte: start, $lte: end };
    }

    const dailyAggregation = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          orders: { $sum: 1 },
          revenue: { $sum: "$grandTotal" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          Date: "$_id",
          Orders: 1,
          Revenue: { $round: ["$revenue", 2] },
        },
      },
    ]);

    const statusDistribution = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, Status: "$_id", Count: "$count" } },
    ]);

    const rows = [
      ...dailyAggregation,
      ...(dailyAggregation.length > 0 ? [{ Date: "--- STATUS BREAKDOWN ---", Orders: "", Revenue: "" }] : []),
      ...statusDistribution.map((s) => ({ Date: s.Status, Orders: s.Count, Revenue: "" })),
    ];

    const format = getExportFormat(req);
    const filename = `reports_export_${Date.now()}`;

    if (format === "xlsx") {
      return sendXLSX(res, buildWorkbook("Reports", rows), filename);
    }
    return sendCSV(res, rows, filename);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Export failed" });
  }
};

