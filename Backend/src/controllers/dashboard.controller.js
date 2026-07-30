import { User } from "../models/atanu.user.model.js";
import { Doctor } from "../models/atanu.doctor.model.js";
import { Product } from "../models/atanu.product.model.js";
import { Order } from "../models/atanu.order.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Inventory } from "../models/inventory.model.js";
import { Notification } from "../models/notification.model.js";
import { Payment } from "../models/payment.model.js";
import { Prescription } from "../models/prescription.model.js";
import { MedicalReport } from "../models/medicalReport.model.js";

import { getDateRange, getRangeMatch, parseOptionalObjectId, buildRevenueAggregation } from "../utils/dashboard.utils.js";
import { Appointment as AppointmentModel } from "../models/appointment.model.js";
import { PAYMENT_STATUS } from "../utils/dashboard.utils.js";

import mongoose from "mongoose";

const getAdminCountsBase = async () => {
  const [totalUsers, totalDoctors, totalProducts, totalOrders] = await Promise.all([
    User.countDocuments({}),
    Doctor.countDocuments({}),
    Product.countDocuments({}),
    Order.countDocuments({}),
  ]);

  return { totalUsers, totalDoctors, totalProducts, totalOrders };
};

const getTodayBounds = () => getDateRange({ range: "today" });

const getOrdersStatusCountsToday = async () => {
  const { start, end } = getTodayBounds();

  const [pending, completed, cancelled] = await Promise.all([
    Order.countDocuments({ status: "pending", createdAt: { $gte: start, $lte: end } }),
    Order.countDocuments({ status: "delivered", createdAt: { $gte: start, $lte: end } }),
    Order.countDocuments({ status: "cancelled", createdAt: { $gte: start, $lte: end } }),
  ]);

  // completed orders mapping is project-dependent.
  return {
    pendingOrders: pending,
    completedOrders: completed,
    cancelledOrders: cancelled,
  };
};

const getRevenueToday = async () => {
  const { start, end } = getTodayBounds();

  const pipeline = buildRevenueAggregation({
    match: { createdAt: { $gte: start, $lte: end } },
    successStatuses: PAYMENT_STATUS.SUCCESS,
  });

  const res = await Payment.aggregate(pipeline);
  return res?.[0]?.revenue || 0;
};

const getAppointmentsTodayCounts = async () => {
  const { start, end } = getTodayBounds();

  const [upcoming, completed, cancelled] = await Promise.all([
    AppointmentModel.countDocuments({ status: { $in: ["Pending", "Confirmed"] }, appointmentDate: { $gte: start, $lte: end } }),
    AppointmentModel.countDocuments({ status: "Completed", appointmentDate: { $gte: start, $lte: end } }),
    AppointmentModel.countDocuments({ status: "Cancelled", appointmentDate: { $gte: start, $lte: end } }),
  ]);

  return {
    appointmentsToday: upcoming,
    completedAppointments: completed,
    pendingAppointments: upcoming, // keep label per requirement below
    cancelledAppointments: cancelled,
  };
};

const getInventoryAlerts = async () => {
  const [lowStock, outOfStock, expired] = await Promise.all([
    Inventory.countDocuments({ isDeleted: { $ne: true }, stockStatus: "Low Stock" }),
    Inventory.countDocuments({ isDeleted: { $ne: true }, stockStatus: "Out Of Stock" }),
    Inventory.countDocuments({ isDeleted: { $ne: true }, stockStatus: "Expired" }),
  ]);

  return {
    lowStock,
    outOfStock,
    expired,
  };
};

const getUnreadNotifications = async () => {
  // Admin dashboard wants unread notifications.
  // We interpret as: any notification where status != Read and isRead=false OR isRead=false.
  const unread = await Notification.countDocuments({
    status: { $ne: "Read" },
    isRead: false,
  });

  return unread;
};

const pickDashboardFilters = (req) => {
  const { range, startDate, endDate, doctor, product, status, category } = req.query || {};

  return {
    range,
    startDate,
    endDate,
    doctor: parseOptionalObjectId(doctor),
    product: parseOptionalObjectId(product),
    status,
    category,
  };
};

export const getOverview = async (req, res) => {
  try {
    const base = await getAdminCountsBase();

    const [revenueToday, ordersToday, apptToday, inventoryAlerts, unreadNotifications] = await Promise.all([
      getRevenueToday(),
      getOrdersStatusCountsToday(),
      getAppointmentsTodayCounts(),
      getInventoryAlerts(),
      getUnreadNotifications(),
    ]);

    return res.status(200).json({
      success: true,
      ...base,
      totalRevenue: undefined,
      totalOrders: base.totalOrders,
      todaysRevenue: revenueToday,
      pendingOrders: ordersToday.pendingOrders,
      completedOrders: ordersToday.completedOrders,
      cancelledOrders: ordersToday.cancelledOrders,
      appointmentsToday: apptToday.appointmentsToday,
      completedAppointments: apptToday.completedAppointments,
      pendingAppointments: apptToday.pendingAppointments,
      inventoryAlerts,
      unreadNotifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard overview",
    });
  }
};

export const getRevenue = async (req, res) => {
  try {
    const filters = pickDashboardFilters(req);
    const rangeObj = getDateRange({ range: filters.range, startDate: filters.startDate, endDate: filters.endDate });

    const match = getRangeMatch({ dateField: "createdAt", rangeObj });

    const [successRevenue, pendingCount, failedCount, refundedCount] = await Promise.all([
      Payment.aggregate(buildRevenueAggregation({ match, successStatuses: PAYMENT_STATUS.SUCCESS })),
      Payment.countDocuments({ ...match, paymentStatus: { $in: PAYMENT_STATUS.PENDING } }),
      Payment.countDocuments({ ...match, paymentStatus: { $in: PAYMENT_STATUS.FAILED } }),
      Payment.countDocuments({ ...match, paymentStatus: { $in: PAYMENT_STATUS.REFUNDED } }),
    ]);

    return res.status(200).json({
      success: true,
      revenue: successRevenue?.[0]?.revenue || 0,
      pendingCount,
      failedCount,
      refundedCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch revenue" });
  }
};

export const getOrders = async (req, res) => {
  try {
    const rangeObj = getDateRange({ range: req.query.range, startDate: req.query.startDate, endDate: req.query.endDate });
    const match = getRangeMatch({ dateField: "createdAt", rangeObj });

    const dailyOrders = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", count: 1 } },
    ]);

    const monthlyOrders = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, month: "$_id", count: 1 } },
    ]);

    const statusDistributionRaw = await Order.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $project: { _id: 0, status: "$_id", count: 1 } },
    ]);

    const statusDistribution = statusDistributionRaw.reduce((acc, cur) => {
      acc[cur.status] = cur.count;
      return acc;
    }, {});

    return res.status(200).json({ success: true, dailyOrders, monthlyOrders, orderStatusDistribution: statusDistribution });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch orders dashboard" });
  }
};

export const getPayments = async (req, res) => {
  try {
    const rangeObj = getDateRange({ range: req.query.range, startDate: req.query.startDate, endDate: req.query.endDate });
    const match = getRangeMatch({ dateField: "createdAt", rangeObj });

    const [success, failed, refunded, pending, revenue] = await Promise.all([
      Payment.countDocuments({ ...match, paymentStatus: { $in: PAYMENT_STATUS.SUCCESS } }),
      Payment.countDocuments({ ...match, paymentStatus: { $in: PAYMENT_STATUS.FAILED } }),
      Payment.countDocuments({ ...match, paymentStatus: { $in: PAYMENT_STATUS.REFUNDED } }),
      Payment.countDocuments({ ...match, paymentStatus: { $in: PAYMENT_STATUS.PENDING } }),
      Payment.aggregate(buildRevenueAggregation({ match, successStatuses: PAYMENT_STATUS.SUCCESS })),
    ]);

    return res.status(200).json({
      success: true,
      paymentSuccess: success,
      paymentFailed: failed,
      refunded,
      pending,
      revenue: revenue?.[0]?.revenue || 0,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch payments dashboard" });
  }
};

export const getProducts = async (req, res) => {
  try {
    // Top selling: by orderItems.productId quantity
    // Low/out-of-stock/expired: derived from Inventory stockStatus
    const [topSelling, lowStock, outOfStock, expiredInventory] = await Promise.all([
      Order.aggregate([
        {
          $unwind: {
            path: "$orderItems",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $match: {
            "orderItems.productId": { $ne: null },
          },
        },
        {
          $group: {
            _id: "$orderItems.productId",
            totalQty: { $sum: "$orderItems.quantity" },
            totalRevenue: { $sum: "$orderItems.subtotal" },
          },
        },
        { $sort: { totalQty: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: "atanuproducts",
            localField: "_id",
            foreignField: "_id",
            as: "productDoc",
          },
        },
        { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            productId: "$_id",
            productName: "$productDoc.product_name",
            productImage: "$productDoc.product_image",
            totalQty: 1,
            totalRevenue: 1,
          },
        },
      ]),
      Inventory.countDocuments({ isDeleted: { $ne: true }, stockStatus: "Low Stock" }),
      Inventory.countDocuments({ isDeleted: { $ne: true }, stockStatus: "Out Of Stock" }),
      Inventory.countDocuments({ isDeleted: { $ne: true }, stockStatus: "Expired" }),
    ]);

    return res.status(200).json({ success: true, topSellingProducts: topSelling, lowStockProducts: lowStock, outOfStockProducts: outOfStock, expiredInventory });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch products dashboard" });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const rangeObj = getDateRange({ range: req.query.range, startDate: req.query.startDate, endDate: req.query.endDate });
    const matchAppt = getRangeMatch({ dateField: "appointmentDate", rangeObj });

    const topDoctors = await Appointment.aggregate([
      { $match: matchAppt },
      { $group: { _id: "$doctor", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctorDoc",
        },
      },
      { $unwind: { path: "$doctorDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          doctorId: "$_id",
          doctorName: "$doctorDoc.fullName",
          specialization: "$doctorDoc.specialization",
          consultations: "$count",
        },
      },
    ]);

    const mostConsultations = topDoctors;

    const avgRatingAgg = await Doctor.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$averageRating" },
        },
      },
      { $project: { _id: 0, averageRating: 1 } },
    ]);

    const averageRating = avgRatingAgg?.[0]?.averageRating || 0;

    return res.status(200).json({ success: true, topDoctors, mostConsultations, averageRating });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch doctors dashboard" });
  }
};

export const getPatients = async (req, res) => {
  try {
    const rangeObj = getDateRange({ range: req.query.range, startDate: req.query.startDate, endDate: req.query.endDate });
    const matchUsers = getRangeMatch({ dateField: "createdAt", rangeObj });

    const [newPatients, returningPatients, appointments] = await Promise.all([
      User.countDocuments(matchUsers),
      // Returning patients = users who had at least 2 appointments total.
      Appointment.aggregate([
        {
          $group: {
            _id: "$patient",
            total: { $sum: 1 },
          },
        },
        { $match: { total: { $gte: 2 } } },
        { $count: "count" },
      ]),
      Appointment.countDocuments({ appointmentDate: { $gte: rangeObj.start, $lte: rangeObj.end } }),
    ]);

    return res.status(200).json({
      success: true,
      newPatients,
      returningPatients: returningPatients?.[0]?.count || 0,
      appointments,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch patients dashboard" });
  }
};

export const getAppointments = async (req, res) => {
  try {
    const rangeObj = getDateRange({ range: req.query.range, startDate: req.query.startDate, endDate: req.query.endDate });
    const match = getRangeMatch({ dateField: "appointmentDate", rangeObj });

    const upcoming = await Appointment.countDocuments({ ...match, status: { $in: ["Pending", "Confirmed"] } });
    const completed = await Appointment.countDocuments({ ...match, status: "Completed" });
    const cancelled = await Appointment.countDocuments({ ...match, status: "Cancelled" });

    const doctorWiseDistribution = await Appointment.aggregate([
      { $match: match },
      { $group: { _id: "$doctor", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "_id",
          as: "doctorDoc",
        },
      },
      { $unwind: { path: "$doctorDoc", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          doctorId: "$_id",
          doctorName: "$doctorDoc.fullName",
          count: 1,
        },
      },
    ]);

    return res.status(200).json({ success: true, upcoming, completed, cancelled, doctorWiseDistribution });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch appointments dashboard" });
  }
};

export const getReports = async (req, res) => {
  try {
    const prescriptionCount = await Prescription.countDocuments({});
    const medicalReportCount = await MedicalReport.countDocuments({});

    return res.status(200).json({ success: true, prescriptionCount, medicalReportCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch reports dashboard" });
  }
};

export const getCharts = async (req, res) => {
  try {
    const rangeObj = getDateRange({ range: req.query.range, startDate: req.query.startDate, endDate: req.query.endDate });
    const matchRevenue = getRangeMatch({ dateField: "createdAt", rangeObj });
    const matchOrders = getRangeMatch({ dateField: "createdAt", rangeObj });
    const matchAppointments = getRangeMatch({ dateField: "appointmentDate", rangeObj });
    const matchPayments = matchRevenue;
    const matchUsers = getRangeMatch({ dateField: "createdAt", rangeObj });

    // Choose bucket based on range granularity.
    const bucketUnit = (rangeObj.end - rangeObj.start) / (1000 * 60 * 60 * 24) > 31 ? "month" : "day";

    const revenueSeries = await Payment.aggregate([
      { $match: { ...matchRevenue, paymentStatus: { $in: PAYMENT_STATUS.SUCCESS } } },
      {
        $group: {
          _id: { $dateToString: { format: bucketUnit === "day" ? "%Y-%m-%d" : "%Y-%m", date: "$createdAt" } },
          value: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, key: "$_id", value: 1 } },
    ]);

    const ordersSeries = await Order.aggregate([
      { $match: matchOrders },
      {
        $group: {
          _id: { $dateToString: { format: bucketUnit === "day" ? "%Y-%m-%d" : "%Y-%m", date: "$createdAt" } },
          value: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, key: "$_id", value: 1 } },
    ]);

    const appointmentsSeries = await Appointment.aggregate([
      { $match: matchAppointments },
      {
        $group: {
          _id: { $dateToString: { format: bucketUnit === "day" ? "%Y-%m-%d" : "%Y-%m", date: "$appointmentDate" } },
          value: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, key: "$_id", value: 1 } },
    ]);

    const paymentsSeries = await Payment.aggregate([
      { $match: matchPayments },
      {
        $group: {
          _id: { $dateToString: { format: bucketUnit === "day" ? "%Y-%m-%d" : "%Y-%m", date: "$createdAt" } },
          value: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, key: "$_id", value: 1 } },
    ]);

    const usersSeries = await User.aggregate([
      { $match: matchUsers },
      {
        $group: {
          _id: { $dateToString: { format: bucketUnit === "day" ? "%Y-%m-%d" : "%Y-%m", date: "$createdAt" } },
          value: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, key: "$_id", value: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      charts: {
        revenue: revenueSeries,
        orders: ordersSeries,
        appointments: appointmentsSeries,
        payments: paymentsSeries,
        users: usersSeries,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch charts" });
  }
};

