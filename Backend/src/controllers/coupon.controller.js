import mongoose from "mongoose";

import { Coupon } from "../models/coupon.model.js";
import { CouponUsage } from "../models/couponUsage.model.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const toObjectIds = (arr) => {
  if (!arr) return [];
  if (!Array.isArray(arr)) return [];
  return arr
    .map((v) => (typeof v === "string" ? v.trim() : v))
    .filter(Boolean)
    .filter((id) => isValidObjectId(id));
};

const toUpperTrim = (s) => (typeof s === "string" ? s.trim().toUpperCase() : "");

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const ensureDateOrder = (startDate, expiryDate) => {
  if (!startDate || !expiryDate) return "startDate and expiryDate are required";
  const s = new Date(startDate);
  const e = new Date(expiryDate);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) {
    return "Invalid coupon dates";
  }
  if (!(e > s)) return "expiryDate must be greater than startDate";
  return null;
};

const computeDiscountAmount = ({ coupon, cartAmount }) => {
  const amount = Number(cartAmount) || 0;

  if (coupon.discountType === "Free Shipping") {
    // Convention: discountAmount equals shipping charge.
    // Shipping calculation happens elsewhere; we return 0 here and let frontend/backend integrate.
    return 0;
  }

  if (coupon.discountType === "Flat") {
    return Math.min(Number(coupon.discountValue) || 0, amount);
  }

  // Percentage
  const pct = Number(coupon.discountValue) || 0;
  const raw = (amount * pct) / 100;
  const max = Number(coupon.maximumDiscountAmount) || 0;
  return max > 0 ? Math.min(raw, max) : raw;
};

const applyStatusFromDates = (coupon) => {
  const now = Date.now();
  const expiry = coupon.expiryDate ? new Date(coupon.expiryDate).getTime() : null;
  if (expiry !== null && expiry < now) return "Expired";
  return coupon.status;
};

const validateApplicability = async ({ coupon, productIds = [], categoryIds = [], excludedProductIds = [], excludedCategoryIds = [] }) => {
  const applicableCategoryIds = (coupon.applicableCategories || []).map(String);
  const applicableProductIds = (coupon.applicableProducts || []).map(String);

  const productIdStrings = productIds.map(String);
  const categoryIdStrings = categoryIds.map(String);

  // Excluded products/categories: if present in cart -> invalid
  const excludedProducts = (coupon.excludedProducts || []).map(String);
  const excludedCategories = (coupon.excludedCategories || []).map(String);

  if (excludedProducts.length > 0 && excludedProducts.some((id) => productIdStrings.includes(id))) {
    return "Coupon is not applicable for one or more products";
  }

  if (excludedCategories.length > 0 && excludedCategories.some((id) => categoryIdStrings.includes(id))) {
    return "Coupon is not applicable for one or more categories";
  }

  // If both applicableCategories and applicableProducts are empty, assume it applies to all.
  const hasCategoryRule = applicableCategoryIds.length > 0;
  const hasProductRule = applicableProductIds.length > 0;

  if (!hasCategoryRule && !hasProductRule) return null;

  // Otherwise, at least one applicable condition must match.
  const categoryMatches = hasCategoryRule ? applicableCategoryIds.some((id) => categoryIdStrings.includes(id)) : false;
  const productMatches = hasProductRule ? applicableProductIds.some((id) => productIdStrings.includes(id)) : false;

  if (!categoryMatches && !productMatches) {
    return "Coupon is not applicable for the selected products/categories";
  }

  return null;
};

const getPagination = (query) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const normalizeSort = (query) => {
  const sortBy = (query.sortBy || "createdAt").toString();
  const sortOrderRaw = (query.sortOrder || "desc").toString().toLowerCase();
  const sortOrder = sortOrderRaw === "asc" ? 1 : -1;
  return { sortBy, sortOrder };
};

const getCouponOutput = (coupon) => {
  // Expose both requested keys and existing schema keys.
  return {
    _id: coupon._id,
    couponCode: coupon.couponCode,
    title: coupon.couponName,
    couponName: coupon.couponName,
    description: coupon.description,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    maximumDiscount: coupon.maximumDiscountAmount,
    minimumOrderValue: coupon.minimumOrderValue,
    usageLimit: coupon.totalUsageLimit,
    usagePerUser: coupon.usagePerUser,
    usedCount: coupon.currentUsageCount,
    validFrom: coupon.startDate,
    validUntil: coupon.expiryDate,
    applicableCategories: coupon.applicableCategories,
    applicableProducts: coupon.applicableProducts,
    excludedProducts: coupon.excludedProducts,
    status: coupon.status,
    startDate: coupon.startDate,
    expiryDate: coupon.expiryDate,
    createdAt: coupon.createdAt,
    updatedAt: coupon.updatedAt,
  };
};

export const createCoupon = async (req, res) => {
  try {
    const {
      couponCode,
      title,
      couponName,
      description,
      discountType,
      discountValue,
      maximumDiscount,
      maximumDiscountAmount,
      minimumOrderValue,
      usageLimit,
      totalUsageLimit,
      usagePerUser,
      startDate,
      validFrom,
      expiryDate,
      validUntil,
      applicableCategories,
      applicableProducts,
      excludedProducts,
      applicableUsers,
      excludedCategories,
      status,
    } = req.body;

    const code = toUpperTrim(couponCode);
    if (!code) return res.status(400).json({ success: false, message: "couponCode is required" });

    const name = (title || couponName || "").toString().trim();
    if (!name) return res.status(400).json({ success: false, message: "title/couponName is required" });

    const dt = (discountType || "").toString().trim();
    if (!dt) return res.status(400).json({ success: false, message: "discountType is required" });

    const dv = toNumber(discountValue);
    if (dv === null) return res.status(400).json({ success: false, message: "discountValue must be a positive number" });

    const maxDisc = toNumber(maximumDiscountAmount ?? maximumDiscount ?? 0);
    const minOrder = toNumber(minimumOrderValue ?? 0);
    if (maxDisc === null || maxDisc < 0) return res.status(400).json({ success: false, message: "Maximum Discount must be a non-negative number" });
    if (minOrder === null || minOrder < 0) return res.status(400).json({ success: false, message: "Minimum Order Value must be a non-negative number" });

    const sDate = startDate ?? validFrom;
    const eDate = expiryDate ?? validUntil;
    const dateErr = ensureDateOrder(sDate, eDate);
    if (dateErr) return res.status(400).json({ success: false, message: dateErr });

    const totalLimit = toNumber(totalUsageLimit ?? usageLimit ?? 0);
    const perUser = toNumber(usagePerUser ?? 1);
    if (totalLimit === null || totalLimit < 0) return res.status(400).json({ success: false, message: "usageLimit must be a non-negative number" });
    if (perUser === null || perUser < 1) return res.status(400).json({ success: false, message: "usagePerUser must be at least 1" });

    const existing = await Coupon.findOne({ couponCode: code });
    if (existing) return res.status(409).json({ success: false, message: "Duplicate couponCode" });

    const categories = toObjectIds(applicableCategories);
    const products = toObjectIds(applicableProducts);
    const excludedProd = toObjectIds(excludedProducts);
    const excludedCats = toObjectIds(excludedCategories);

    const coupon = await Coupon.create({
      couponCode: code,
      couponName: name,
      description: description ?? "",
      discountType: dt,
      discountValue: dv,
      maximumDiscountAmount: maxDisc,
      minimumOrderValue: minOrder,
      startDate: new Date(sDate),
      expiryDate: new Date(eDate),
      totalUsageLimit: totalLimit,
      usagePerUser: perUser,
      applicableCategories: categories,
      applicableProducts: products,
      excludedProducts: excludedProd,
      excludedCategories: excludedCats,
      applicableUsers: toObjectIds(applicableUsers),
      status: status ?? "Active",
      createdBy: req.user?._id || null,
      updatedBy: req.user?._id || null,
    });

    return res.status(201).json({ success: true, message: "Coupon created successfully", coupon: getCouponOutput(coupon) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Failed to create coupon" });
  }
};

export const getCoupons = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { sortBy, sortOrder } = normalizeSort(req.query);

    const q = {};

    const search = (req.query.q || "").toString().trim();
    const couponCode = (req.query.couponCode || "").toString().trim();
    const title = (req.query.title || "").toString().trim();

    const status = (req.query.status || "").toString().trim();
    const discountType = (req.query.discountType || "").toString().trim();

    if (search) {
      const rx = new RegExp(search, "i");
      q.$or = [{ couponCode: rx }, { couponName: rx }];
    }

    if (couponCode) q.couponCode = toUpperTrim(couponCode);
    if (title) q.couponName = new RegExp(title, "i");
    if (status) q.status = status;
    if (discountType) q.discountType = discountType;

    const [coupons, totalCount] = await Promise.all([
      Coupon.find(q).sort({ [sortBy]: sortOrder }).skip(skip).limit(limit),
      Coupon.countDocuments(q),
    ]);

    return res.status(200).json({
      success: true,
      coupons: coupons.map(getCouponOutput),
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Failed to fetch coupons" });
  }
};

export const getCouponById = async (req, res) => {
  try {
    const { couponId } = req.params;
    if (!isValidObjectId(couponId)) return res.status(400).json({ success: false, message: "Invalid couponId" });

    const coupon = await Coupon.findById(couponId);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    return res.status(200).json({ success: true, coupon: getCouponOutput(coupon) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Failed to fetch coupon" });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    if (!isValidObjectId(couponId)) return res.status(400).json({ success: false, message: "Invalid couponId" });

    const coupon = await Coupon.findById(couponId);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    const {
      couponCode,
      title,
      couponName,
      description,
      discountType,
      discountValue,
      maximumDiscount,
      maximumDiscountAmount,
      minimumOrderValue,
      usageLimit,
      totalUsageLimit,
      usagePerUser,
      startDate,
      validFrom,
      expiryDate,
      validUntil,
      applicableCategories,
      applicableProducts,
      excludedProducts,
      excludedCategories,
      applicableUsers,
      status,
      internalNotes,
    } = req.body;

    if (couponCode !== undefined) {
      const code = toUpperTrim(couponCode);
      if (!code) return res.status(400).json({ success: false, message: "couponCode is required" });
      if (code !== coupon.couponCode) {
        const dup = await Coupon.findOne({ couponCode: code, _id: { $ne: couponId } });
        if (dup) return res.status(409).json({ success: false, message: "Duplicate couponCode" });
        coupon.couponCode = code;
      }
    }

    if (title !== undefined || couponName !== undefined) {
      const name = (title ?? couponName ?? "").toString().trim();
      if (!name) return res.status(400).json({ success: false, message: "title/couponName is required" });
      coupon.couponName = name;
    }

    if (description !== undefined) coupon.description = description;

    if (discountType !== undefined) coupon.discountType = discountType;

    if (discountValue !== undefined) {
      const dv = toNumber(discountValue);
      if (dv === null || dv < 0) return res.status(400).json({ success: false, message: "discountValue must be a non-negative number" });
      coupon.discountValue = dv;
    }

    if (maximumDiscount !== undefined || maximumDiscountAmount !== undefined) {
      const md = toNumber(maximumDiscountAmount ?? maximumDiscount ?? 0);
      if (md === null || md < 0) return res.status(400).json({ success: false, message: "Maximum Discount must be a non-negative number" });
      coupon.maximumDiscountAmount = md;
    }

    if (minimumOrderValue !== undefined) {
      const mo = toNumber(minimumOrderValue);
      if (mo === null || mo < 0) return res.status(400).json({ success: false, message: "minimumOrderValue must be a non-negative number" });
      coupon.minimumOrderValue = mo;
    }

    const nextStart = startDate ?? validFrom;
    const nextExpiry = expiryDate ?? validUntil;
    if (nextStart !== undefined || nextExpiry !== undefined) {
      const dateErr = ensureDateOrder(nextStart ?? coupon.startDate, nextExpiry ?? coupon.expiryDate);
      if (dateErr) return res.status(400).json({ success: false, message: dateErr });
      coupon.startDate = new Date(nextStart ?? coupon.startDate);
      coupon.expiryDate = new Date(nextExpiry ?? coupon.expiryDate);
    }

    if (usageLimit !== undefined || totalUsageLimit !== undefined) {
      const ul = toNumber(totalUsageLimit ?? usageLimit ?? 0);
      if (ul === null || ul < 0) return res.status(400).json({ success: false, message: "usageLimit must be non-negative" });
      coupon.totalUsageLimit = ul;
    }

    if (usagePerUser !== undefined) {
      const up = toNumber(usagePerUser);
      if (up === null || up < 1) return res.status(400).json({ success: false, message: "usagePerUser must be at least 1" });
      coupon.usagePerUser = up;
    }

    if (applicableCategories !== undefined) coupon.applicableCategories = toObjectIds(applicableCategories);
    if (applicableProducts !== undefined) coupon.applicableProducts = toObjectIds(applicableProducts);
    if (excludedProducts !== undefined) coupon.excludedProducts = toObjectIds(excludedProducts);
    if (excludedCategories !== undefined) coupon.excludedCategories = toObjectIds(excludedCategories);
    if (applicableUsers !== undefined) coupon.applicableUsers = toObjectIds(applicableUsers);

    if (status !== undefined) coupon.status = status;
    if (internalNotes !== undefined) coupon.internalNotes = internalNotes;

    coupon.updatedBy = req.user?._id || null;

    await coupon.save();

    return res.status(200).json({ success: true, message: "Coupon updated successfully", coupon: getCouponOutput(coupon) });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Failed to update coupon" });
  }
};

export const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;
    if (!isValidObjectId(couponId)) return res.status(400).json({ success: false, message: "Invalid couponId" });

    const coupon = await Coupon.findById(couponId);
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    coupon.status = "Inactive";
    coupon.updatedBy = req.user?._id || null;
    await coupon.save();

    return res.status(200).json({ success: true, message: "Coupon deleted (soft) successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Failed to delete coupon" });
  }
};

export const validateCoupon = async (req, res) => {
  try {
    const {
      couponCode,
      cartAmount,
      productIds,
      categoryIds,
    } = req.body;

    const code = toUpperTrim(couponCode);
    if (!code) return res.status(400).json({ success: false, message: "couponCode is required" });

    const amount = toNumber(cartAmount);
    if (amount === null || amount < 0) return res.status(400).json({ success: false, message: "cartAmount must be a positive number" });

    const pIds = toObjectIds(productIds);
    const cIds = toObjectIds(categoryIds);

    const coupon = await Coupon.findOne({ couponCode: code });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    const effectiveStatus = applyStatusFromDates(coupon);

    if (effectiveStatus !== "Active") {
      return res.status(400).json({ success: false, message: `Coupon is ${effectiveStatus}` });
    }

    if (Number(coupon.totalUsageLimit) > 0 && Number(coupon.currentUsageCount) >= Number(coupon.totalUsageLimit)) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }

    if (amount < Number(coupon.minimumOrderValue) || Number(coupon.minimumOrderValue) > amount) {
      return res.status(400).json({ success: false, message: "Minimum order value not satisfied" });
    }

    const applicabilityErr = await validateApplicability({
      coupon,
      productIds: pIds,
      categoryIds: cIds,
    });

    if (applicabilityErr) {
      return res.status(400).json({ success: false, message: applicabilityErr });
    }

    const discountAmount = computeDiscountAmount({ coupon, cartAmount: amount });

    // Final payable: cartAmount - discount.
    // Free Shipping handled separately by frontend; discountAmount returns 0 for that type.
    const finalPayableAmount = Math.max(0, amount - discountAmount);

    return res.status(200).json({
      success: true,
      message: "Coupon validated successfully",
      coupon: getCouponOutput(coupon),
      discountAmount,
      finalPayableAmount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Failed to validate coupon" });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Invalid user" });

    const {
      couponCode,
      cartAmount,
      productIds,
      categoryIds,
    } = req.body;

    const code = toUpperTrim(couponCode);
    if (!code) return res.status(400).json({ success: false, message: "couponCode is required" });

    const amount = toNumber(cartAmount);
    if (amount === null || amount < 0) return res.status(400).json({ success: false, message: "cartAmount must be a positive number" });

    const coupon = await Coupon.findOne({ couponCode: code });
    if (!coupon) return res.status(404).json({ success: false, message: "Coupon not found" });

    const effectiveStatus = applyStatusFromDates(coupon);
    if (effectiveStatus !== "Active") return res.status(400).json({ success: false, message: `Coupon is ${effectiveStatus}` });

    const pIds = toObjectIds(productIds);
    const cIds = toObjectIds(categoryIds);

    // Reuse validation logic.
    const applicabilityErr = await validateApplicability({ coupon, productIds: pIds, categoryIds: cIds });
    if (applicabilityErr) return res.status(400).json({ success: false, message: applicabilityErr });

    if (amount < Number(coupon.minimumOrderValue)) {
      return res.status(400).json({ success: false, message: "Minimum order value not satisfied" });
    }

    // Enforce total usage limit based on Applied records first.
    const appliedCount = await CouponUsage.countDocuments({ coupon: coupon._id, status: "Applied" });
    const totalLimit = Number(coupon.totalUsageLimit) || 0;
    if (totalLimit > 0 && appliedCount >= totalLimit) {
      return res.status(400).json({ success: false, message: "Coupon usage limit reached" });
    }

    // Enforce per-user limit based on Applied records.
    const perUserLimit = Number(coupon.usagePerUser) || 1;
    const userAppliedCount = await CouponUsage.countDocuments({ coupon: coupon._id, user: userId, status: "Applied" });
    if (userAppliedCount >= perUserLimit) {
      return res.status(400).json({ success: false, message: "Coupon usage per user limit reached" });
    }

    // Compute discount for response (and store on reservation record).
    const discountAmount = computeDiscountAmount({ coupon, cartAmount: amount });
    const finalPayableAmount = Math.max(0, amount - discountAmount);

    const reservationTimeoutMinutes = Number(process.env.COUPON_RESERVATION_TIMEOUT_MINUTES || 15);
    const expiresAt = new Date(Date.now() + reservationTimeoutMinutes * 60 * 1000);

    // Create a reservation record.
    const usage = await CouponUsage.create({
      coupon: coupon._id,
      user: userId,
      status: "Reserved",
      reservationId: new mongoose.Types.ObjectId().toString(),
      discountAmount,
      reservedAt: new Date(),
      expiresAt,
      appliedAt: null,
      order: null,
    });

    return res.status(200).json({
      success: true,
      message: "Coupon reserved successfully",
      coupon: getCouponOutput(coupon),
      reservation: {
        reservationId: usage.reservationId,
        expiresAt: usage.expiresAt,
      },
      discountAmount,
      finalPayableAmount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Failed to apply coupon" });
  }
};

export const removeCoupon = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Invalid user" });

    const { couponCode, reservationId } = req.body;
    const code = couponCode ? toUpperTrim(couponCode) : null;

    const query = {
      user: userId,
      status: "Reserved",
    };

    if (reservationId) query.reservationId = reservationId.toString();

    if (code) {
      const coupon = await Coupon.findOne({ couponCode: code });
      if (coupon) query.coupon = coupon._id;
    }

    const usage = await CouponUsage.findOne(query).sort({ reservedAt: -1 });
    if (!usage) return res.status(404).json({ success: false, message: "No active coupon reservation found" });

    usage.status = "Cancelled";
    usage.cancelledAt = new Date();
    await usage.save();

    return res.status(200).json({ success: true, message: "Coupon reservation removed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Failed to remove coupon" });
  }
};

