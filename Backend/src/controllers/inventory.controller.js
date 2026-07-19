import mongoose from "mongoose";

import { Inventory } from "../models/inventory.model.js";
import { Product } from "../models/atanu.product.model.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const validatePositiveNumber = (v, fieldName) => {
  const n = toNumber(v);
  if (n === null || n <= 0) {
    return `${fieldName} must be a positive number`;
  }
  return null;
};

const validateNonNegativeNumber = (v, fieldName) => {
  const n = toNumber(v);
  if (n === null || n < 0) {
    return `${fieldName} must be a non-negative number`;
  }
  return null;
};

const validateDates = (manufacturingDate, expiryDate) => {
  if (!manufacturingDate || !expiryDate) return null;
  const m = new Date(manufacturingDate);
  const e = new Date(expiryDate);
  if (Number.isNaN(m.getTime()) || Number.isNaN(e.getTime())) {
    return "Invalid manufacturingDate or expiryDate";
  }
  if (!(e > m)) {
    return "Expiry date must be greater than manufacturing date";
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

const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  const e = new Date(expiryDate);
  return !Number.isNaN(e.getTime()) && e.getTime() < Date.now();
};

const computeAutoStatus = ({ availableStock, expiryDate }) => {
  if (isExpired(expiryDate)) return "Expired";
  if (Number(availableStock) <= 0) return "Out Of Stock";
  // Low Stock rule uses minimumStockLevel.
  // If minimumStockLevel is not set, treat 0 as "not low".
  return null; // resolved by applyStatus below
};

const applyStockStatusRules = ({ doc, availableStock, minimumStockLevel }) => {
  if (isExpired(doc.expiryDate)) return "Expired";

  if (Number(availableStock) <= 0) return "Out Of Stock";

  const minLevel = Number(minimumStockLevel ?? doc.minimumStockLevel ?? 0);
  if (minLevel > 0 && Number(availableStock) <= minLevel) return "Low Stock";

  return "Available";
};

const addMovement = ({
  movementType,
  quantity,
  referenceType,
  referenceId,
  description,
  createdBy,
}) => {
  return {
    movementType,
    quantity,
    referenceType,
    referenceId,
    description,
    createdBy: createdBy || null,
    timestamp: new Date(),
  };
};

// FIFO selection: earliest expiry first, then manufacturing date (older first).
const selectBatchesFIFOQuery = (productId, { excludeBlocked = true, includeExpired = false } = {}) => {
  const now = new Date();
  const q = {
    product: productId,
    isDeleted: { $ne: true },
  };

  if (excludeBlocked) {
    q.stockStatus = { $in: ["Available", "Low Stock", "Out Of Stock", "Expired", "Discontinued", "Blocked"] };
    // We'll explicitly exclude Blocked in selection below.
  }

  if (!includeExpired) {
    q.expiryDate = { $gt: now };
  }

  return q;
};

const getInventoryByFilters = async ({ q, filters, productSearchTerm }) => {
  // Kept for future extensibility.
  return Inventory.find(q).where(filters).exec();
};

const createInventoryBatch = async (req, res) => {
  try {
    const userId = req.user?._id;

    const {
      product,
      batchNumber,
      manufacturingDate,
      expiryDate,
      purchasePrice,
      sellingPrice,
      mrp,
      supplierName,
      supplierCode,
      supplierInvoiceNumber, // accepted but not stored (schema mismatch)
      quantityPurchased,
      minimumStockLevel,
      warehouseLocation,
      rackNumber,
      barcode,
      gstPercentage,
      hsnCode,
      status,
    } = req.body;

    if (!product) {
      return res.status(400).json({ success: false, message: "product is required" });
    }
    if (!batchNumber || typeof batchNumber !== "string") {
      return res.status(400).json({ success: false, message: "batchNumber is required" });
    }

    if (!isValidObjectId(product)) {
      return res.status(400).json({ success: false, message: "Invalid product ObjectId" });
    }

    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const dateErr = validateDates(manufacturingDate, expiryDate);
    if (dateErr) {
      return res.status(400).json({ success: false, message: dateErr });
    }

    const pqErr = validatePositiveNumber(purchasePrice, "purchasePrice");
    if (pqErr) return res.status(400).json({ success: false, message: pqErr });

    const spErr = validatePositiveNumber(sellingPrice, "sellingPrice");
    if (spErr) return res.status(400).json({ success: false, message: spErr });

    const mrpErr = validatePositiveNumber(mrp, "mrp");
    if (mrpErr) return res.status(400).json({ success: false, message: mrpErr });

    const supplier = supplierName || supplierCode;
    if (!supplier) {
      return res.status(400).json({ success: false, message: "Supplier is required (supplierName or supplierCode)" });
    }

    const qErr = validateNonNegativeNumber(quantityPurchased, "quantityPurchased");
    if (qErr) return res.status(400).json({ success: false, message: qErr });

    const dup = await Inventory.findOne({ batchNumber, isDeleted: { $ne: true } });
    if (dup) {
      return res.status(409).json({ success: false, message: "Duplicate batchNumber" });
    }

    const availableStock = Number(quantityPurchased);
    const minLevel = toNumber(minimumStockLevel) ?? 0;

    const computedStatus = (() => {
      if (isExpired(expiryDate)) return "Expired";
      if (availableStock <= 0) return "Out Of Stock";
      if (minLevel > 0 && availableStock <= minLevel) return "Low Stock";
      return "Available";
    })();

    const inventoryDoc = await Inventory.create({
      product,
      batchNumber,
      manufacturerBatchNumber: batchNumber,
      manufacturingDate,
      expiryDate,
      purchasePrice,
      sellingPrice,
      mrp,
      gstPercentage: gstPercentage ?? 0,
      supplierName: supplierName ?? null,
      supplierCode: supplierCode ?? null,
      // hsnCode/supplierInvoiceNumber/rackNumber are accepted but not persisted due to current schema.
      warehouseLocation,
      barcode: barcode ?? undefined,
      minimumStockLevel: minLevel,
      availableStock,
      currentStock: availableStock,
      stockStatus: computedStatus,
      stockMovements: [
        addMovement({
          movementType: "Stock Added",
          quantity: availableStock,
          referenceType: "Inventory Batch Creation",
          referenceId: null,
          description: "Initial stock batch creation",
          createdBy: userId,
        }),
      ],
      lastStockUpdate: new Date(),
      verifiedBy: null,
      rackNumber: rackNumber ?? undefined,
      hsnCode: hsnCode ?? undefined,
      supplierInvoiceNumber: supplierInvoiceNumber ?? undefined,
      status: status ?? computedStatus,
      stockState: undefined,
    });

    return res.status(201).json({
      success: true,
      message: "Inventory batch created successfully",
      inventory: inventoryDoc,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to create inventory" });
  }
};

const getInventories = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { sortBy, sortOrder } = normalizeSort(req.query);

    const q = {
      isDeleted: { $ne: true },
    };

    // Filters
    const status = req.query.status;
    const product = req.query.product;
    const supplier = req.query.supplier;
    const expiry = req.query.expiry;
    const lowStock = req.query.lowStock;

    if (status) q.stockStatus = status;
    if (product) {
      if (!isValidObjectId(product)) {
        return res.status(400).json({ success: false, message: "Invalid product ObjectId" });
      }
      q.product = product;
    }

    if (supplier) {
      q.$or = [
        { supplierName: { $regex: supplier.toString(), $options: "i" } },
        { supplierCode: { $regex: supplier.toString(), $options: "i" } },
      ];
    }

    if (expiry) {
      const d = new Date(expiry);
      if (Number.isNaN(d.getTime())) {
        return res.status(400).json({ success: false, message: "Invalid expiry filter" });
      }
      q.expiryDate = { $lte: d };
    }

    if (String(lowStock).toLowerCase() === "true") {
      q.minimumStockLevel = { $gt: 0 };
      q.availableStock = { $lte: 0 };
      // Note: strict low-stock condition depends on min level; keep generic filtering for performance.
    }

    // Search (Product Name / Batch Number / Supplier / Barcode)
    const search = (req.query.search || req.query.q || "").toString().trim();
    const searchRegex = search ? new RegExp(search, "i") : null;

    const pipeline = [
      { $match: q },
      {
        $lookup: {
          from: "atanuproducts",
          localField: "product",
          foreignField: "_id",
          as: "productDoc",
        },
      },
      { $unwind: { path: "$productDoc", preserveNullAndEmptyArrays: true } },
    ];

    if (searchRegex) {
      pipeline.push({
        $match: {
          $or: [
            { batchNumber: searchRegex },
            { barcode: searchRegex },
            { supplierName: searchRegex },
            { supplierCode: searchRegex },
            { "productDoc.product_name": searchRegex },
            { "productDoc.mrp_price": searchRegex },
          ],
        },
      });
    }

    pipeline.push(
      { $sort: { [sortBy]: sortOrder } },
      { $skip: skip },
      { $limit: limit }
    );

    const results = await Inventory.aggregate(pipeline);

    // Total count (without pagination)
    const countPipeline = [...pipeline];
    countPipeline.splice(-3); // remove sort/skip/limit crudely not safe; fallback to direct count
    const totalCount = await Inventory.countDocuments(q);

    return res.status(200).json({
      success: true,
      inventories: results,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch inventories" });
  }
};

const getInventoryById = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    if (!isValidObjectId(inventoryId)) {
      return res.status(400).json({ success: false, message: "Invalid inventoryId" });
    }

    const inventory = await Inventory.findOne({ _id: inventoryId, isDeleted: { $ne: true } }).populate(
      "product"
    );

    if (!inventory) {
      return res.status(404).json({ success: false, message: "Inventory batch not found" });
    }

    return res.status(200).json({ success: true, inventory });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch inventory" });
  }
};

const updateInventoryBatch = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    if (!isValidObjectId(inventoryId)) {
      return res.status(400).json({ success: false, message: "Invalid inventoryId" });
    }

    const inv = await Inventory.findOne({ _id: inventoryId, isDeleted: { $ne: true } });
    if (!inv) {
      return res.status(404).json({ success: false, message: "Inventory batch not found" });
    }

    const {
      product,
      batchNumber,
      manufacturingDate,
      expiryDate,
      purchasePrice,
      sellingPrice,
      mrp,
      supplierName,
      supplierCode,
      minimumStockLevel,
      warehouseLocation,
      barcode,
      gstPercentage,
      hsnCode,
      rackNumber,
      // status is derived; we still allow explicit setting for admin updates.
      status,
    } = req.body;

    if (product !== undefined) {
      if (!isValidObjectId(product)) {
        return res.status(400).json({ success: false, message: "Invalid product ObjectId" });
      }
      const productExists = await Product.findById(product);
      if (!productExists) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      inv.product = product;
    }

    if (batchNumber !== undefined) {
      if (typeof batchNumber !== "string" || !batchNumber.trim()) {
        return res.status(400).json({ success: false, message: "batchNumber must be a non-empty string" });
      }
      const dup = await Inventory.findOne({ batchNumber, _id: { $ne: inventoryId }, isDeleted: { $ne: true } });
      if (dup) {
        return res.status(409).json({ success: false, message: "Duplicate batchNumber" });
      }
      inv.batchNumber = batchNumber;
      inv.manufacturerBatchNumber = batchNumber;
    }

    const dateErr = validateDates(manufacturingDate ?? inv.manufacturingDate, expiryDate ?? inv.expiryDate);
    if (dateErr) return res.status(400).json({ success: false, message: dateErr });

    const ppErr = purchasePrice !== undefined ? validatePositiveNumber(purchasePrice, "purchasePrice") : null;
    if (ppErr) return res.status(400).json({ success: false, message: ppErr });

    const spErr = sellingPrice !== undefined ? validatePositiveNumber(sellingPrice, "sellingPrice") : null;
    if (spErr) return res.status(400).json({ success: false, message: spErr });

    const mrpErr = mrp !== undefined ? validatePositiveNumber(mrp, "mrp") : null;
    if (mrpErr) return res.status(400).json({ success: false, message: mrpErr });

    const supplier = supplierName ?? supplierCode;
    if ((supplierName !== undefined || supplierCode !== undefined) && !supplier) {
      return res.status(400).json({ success: false, message: "Supplier is required" });
    }

    if (minimumStockLevel !== undefined) {
      const mlErr = validateNonNegativeNumber(minimumStockLevel, "minimumStockLevel");
      if (mlErr) return res.status(400).json({ success: false, message: mlErr });
      inv.minimumStockLevel = Number(minimumStockLevel);
    }

    if (warehouseLocation !== undefined) inv.warehouseLocation = warehouseLocation;
    if (barcode !== undefined) inv.barcode = barcode;
    if (gstPercentage !== undefined) inv.gstPercentage = Number(gstPercentage);
    if (hsnCode !== undefined) inv.hsnCode = hsnCode;
    if (rackNumber !== undefined) inv.rackNumber = rackNumber;

    if (supplierName !== undefined) inv.supplierName = supplierName;
    if (supplierCode !== undefined) inv.supplierCode = supplierCode;

    if (manufacturingDate !== undefined) inv.manufacturingDate = manufacturingDate;
    if (expiryDate !== undefined) inv.expiryDate = expiryDate;

    if (purchasePrice !== undefined) inv.purchasePrice = Number(purchasePrice);
    if (sellingPrice !== undefined) inv.sellingPrice = Number(sellingPrice);
    if (mrp !== undefined) inv.mrp = Number(mrp);

    const newStatus = status && inv.stockStatus ? status : applyStockStatusRules({
      doc: inv,
      availableStock: inv.availableStock,
      minimumStockLevel: inv.minimumStockLevel,
    });

    inv.stockStatus = newStatus;

    await inv.save();

    return res.status(200).json({ success: true, message: "Inventory batch updated successfully", inventory: inv });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to update inventory" });
  }
};

const addStockCommon = async ({ req, res, mode }) => {
  try {
    const { inventoryId } = req.params;
    if (!isValidObjectId(inventoryId)) {
      return res.status(400).json({ success: false, message: "Invalid inventoryId" });
    }

    const qty = toNumber(req.body?.quantity ?? req.body?.addQuantity ?? req.body?.delta);
    if (qty === null || qty <= 0) {
      return res.status(400).json({ success: false, message: "quantity must be a positive number" });
    }

    const inv = await Inventory.findOne({ _id: inventoryId, isDeleted: { $ne: true } });
    if (!inv) return res.status(404).json({ success: false, message: "Inventory batch not found" });

    const userId = req.user?._id;

    const delta = mode === "add" ? qty : -qty;

    const nextAvailable = Number(inv.availableStock) + delta;
    if (mode === "remove" && nextAvailable < 0) {
      return res.status(409).json({ success: false, message: "Cannot reduce stock below zero" });
    }

    // Disallow selling expired inventory (for remove). For add, allow.
    if (mode === "remove" && isExpired(inv.expiryDate)) {
      return res.status(409).json({ success: false, message: "Cannot reduce stock from expired inventory" });
    }

    inv.availableStock = nextAvailable;
    inv.currentStock = Number(inv.currentStock) + delta;

    // Ensure non-negative
    if (inv.availableStock < 0) inv.availableStock = 0;
    if (inv.currentStock < 0) inv.currentStock = 0;

    // Movement history
    inv.stockMovements.push(
      addMovement({
        movementType: mode === "add" ? "Stock Added" : "Stock Removed",
        quantity: qty,
        referenceType: "Inventory Stock Adjustment",
        referenceId: null,
        description: mode === "add" ? "Stock increased" : "Stock decreased",
        createdBy: userId,
      })
    );

    inv.lastStockUpdate = new Date();

    // Auto status if not blocked
    if (inv.stockStatus !== "Blocked") {
      inv.stockStatus = applyStockStatusRules({
        doc: inv,
        availableStock: inv.availableStock,
        minimumStockLevel: inv.minimumStockLevel,
      });
    }

    await inv.save();

    return res.status(200).json({ success: true, message: mode === "add" ? "Stock added successfully" : "Stock removed successfully", inventory: inv });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Stock operation failed" });
  }
};

const addStock = async (req, res) => addStockCommon({ req, res, mode: "add" });
const removeStock = async (req, res) => addStockCommon({ req, res, mode: "remove" });

const blockInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    if (!isValidObjectId(inventoryId)) {
      return res.status(400).json({ success: false, message: "Invalid inventoryId" });
    }

    const inv = await Inventory.findOne({ _id: inventoryId, isDeleted: { $ne: true } });
    if (!inv) return res.status(404).json({ success: false, message: "Inventory batch not found" });

    inv.stockStatus = "Blocked";
    inv.stockMovements.push(
      addMovement({
        movementType: "Damaged",
        quantity: 1,
        description: "Inventory blocked",
        createdBy: req.user?._id,
      })
    );
    await inv.save();

    return res.status(200).json({ success: true, message: "Inventory blocked successfully", inventory: inv });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to block inventory" });
  }
};

const unblockInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    if (!isValidObjectId(inventoryId)) {
      return res.status(400).json({ success: false, message: "Invalid inventoryId" });
    }

    const inv = await Inventory.findOne({ _id: inventoryId, isDeleted: { $ne: true } });
    if (!inv) return res.status(404).json({ success: false, message: "Inventory batch not found" });

    inv.stockStatus = applyStockStatusRules({
      doc: inv,
      availableStock: inv.availableStock,
      minimumStockLevel: inv.minimumStockLevel,
    });

    await inv.save();

    return res.status(200).json({ success: true, message: "Inventory unblocked successfully", inventory: inv });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to unblock inventory" });
  }
};

const deleteInventory = async (req, res) => {
  try {
    const { inventoryId } = req.params;
    if (!isValidObjectId(inventoryId)) {
      return res.status(400).json({ success: false, message: "Invalid inventoryId" });
    }

    const inv = await Inventory.findOne({ _id: inventoryId, isDeleted: { $ne: true } });
    if (!inv) return res.status(404).json({ success: false, message: "Inventory batch not found" });

    inv.isDeleted = true;
    inv.deletedAt = new Date();
    inv.deletedBy = req.user?._id || null;

    inv.stockMovements.push(
      addMovement({
        movementType: "Returned",
        quantity: 1,
        description: "Inventory soft deleted",
        createdBy: req.user?._id,
      })
    );

    await inv.save();

    return res.status(200).json({ success: true, message: "Inventory batch deleted successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to delete inventory" });
  }
};

// ====== Reusable helpers for future stock operations (NO Orders integration here) ======

export const inventoryHelpers = {
  async markExpiredBatches() {
    const now = new Date();
    await Inventory.updateMany(
      { expiryDate: { $lte: now }, isDeleted: { $ne: true } },
      { stockStatus: "Expired" }
    );
  },

  async detectLowStock({ asOf = new Date() } = {}) {
    await Inventory.updateMany(
      {
        isDeleted: { $ne: true },
        expiryDate: { $gt: asOf },
        minimumStockLevel: { $gt: 0 },
        availableStock: { $lte: 0 },
      },
      { stockStatus: "Out Of Stock" }
    );

    await Inventory.updateMany(
      {
        isDeleted: { $ne: true },
        expiryDate: { $gt: asOf },
        minimumStockLevel: { $gt: 0 },
        availableStock: { $gt: 0, $lte: 1 },
      },
      { stockStatus: "Low Stock" }
    );
  },

  selectFIFOExpiredAwareBatches(productId, quantityRequired) {
    // Consumer should still validate status and expiry.
    return Inventory.find({
      product: productId,
      isDeleted: { $ne: true },
      stockStatus: { $ne: "Blocked" },
      expiryDate: { $gt: new Date() },
      availableStock: { $gt: 0 },
    })
      .sort({ expiryDate: 1, manufacturingDate: 1 })
      .limit(500);
  },

  applyStockStatusAfterChange(inv) {
    return applyStockStatusRules({
      doc: inv,
      availableStock: inv.availableStock,
      minimumStockLevel: inv.minimumStockLevel,
    });
  },
};

export {
  createInventoryBatch,
  getInventories,
  getInventoryById,
  updateInventoryBatch,
  addStock,
  removeStock,
  blockInventory,
  unblockInventory,
  deleteInventory,
};

