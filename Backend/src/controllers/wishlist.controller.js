import mongoose from "mongoose";

import { Wishlist } from "../models/wishlist.model.js";
import { Product } from "../models/atanu.product.model.js";
import { Inventory } from "../models/inventory.model.js";
import { Cart } from "../models/atanu.cart.model.js";

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const toNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const getWishlistForUser = async (userId) => {
  // One wishlist per user
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, products: [] });
  }
  return wishlist;
};

const isProductActive = (product, inventory) => {
  // Business rules from prompt:
  // - Only active products
  // - Cannot add deleted products
  // In this codebase, "deleted" is handled by different collections:
  // - Products are hard-deleted via Product.deleteProduct (no isDeleted field in schema)
  // - Inventory has isDeleted.
  // So:
  // - product must exist (already ensured by Product.findById)
  // - inventory must exist and not be deleted and have availableStock > 0 OR stockStatus not out/expired.
  if (!product) return false;

  if (!inventory) return false;
  if (inventory.isDeleted) return false;

  // Use availableStock rule.
  const available = Number(inventory.availableStock) || 0;
  return available > 0;
};

const buildWishlistResponse = async ({ wishlist, page, limit, sortBy, sortOrder }) => {
  // Populate products for output
  const populated = await Wishlist.findById(wishlist._id).populate({
    path: "products.product",
    model: "Product",
    populate: { path: "category" },
  });

  const items = (populated?.products || []).map((p) => p.toObject());

  // optional server-side sort over wishlist products
  // sortBy supported: product_name, category, brand, addedDate, priority
  const sortKey = sortBy || "addedDate";
  const direction = sortOrder === "asc" ? 1 : -1;

  const getSortVal = (item) => {
    const prod = item.product || {};
    if (sortKey === "product_name") return prod.product_name;
    if (sortKey === "brand") return prod.brand;
    if (sortKey === "category") return prod.category?.category_name || "";
    if (sortKey === "priority") return item.priority;
    if (sortKey === "addedDate") return item.addedDate;
    return item.addedDate;
  };

  items.sort((a, b) => {
    const va = getSortVal(a);
    const vb = getSortVal(b);

    // date
    if (va instanceof Date || vb instanceof Date) {
      return (new Date(va).getTime() - new Date(vb).getTime()) * direction;
    }

    // strings/numbers
    if (typeof va === "string" && typeof vb === "string") {
      return va.localeCompare(vb) * direction;
    }

    return (Number(va) - Number(vb)) * direction;
  });

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  return {
    wishlist: {
      _id: wishlist._id,
      user: wishlist.user,
      wishlistName: wishlist.wishlistName,
      visibility: wishlist.visibility,
      active: wishlist.active,
      totalProducts: wishlist.totalProducts,
      items: paged,
      page,
      limit,
      totalItems,
      totalPages,
    },
    items: paged,
  };
};

export const addProductToWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const inventory = await Inventory.findOne({
      product: productId,
      isDeleted: { $ne: true },
    });

    if (!isProductActive(product, inventory)) {
      return res.status(400).json({
        success: false,
        message: "Product is not available",
      });
    }

    const wishlist = await getWishlistForUser(userId);

    const alreadyExists = (wishlist.products || []).some(
      (p) => p.product?.toString() === productId
    );

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
        wishlist,
      });
    }

    wishlist.products.push({ product: productId, priority: "Medium" });
    wishlist.totalProducts = wishlist.products.length;
    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
      wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Database error",
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const page = toNumber(req.query.page) || 1;
    const limit = toNumber(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "addedDate";
    const sortOrderRaw = (req.query.sortOrder || "desc").toString().toLowerCase();
    const sortOrder = sortOrderRaw === "asc" ? "asc" : "desc";

    const search = (req.query.search || req.query.q || "").toString().trim();

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(200).json({
        success: true,
        message: "Wishlist is empty",
        items: [],
        totalItems: 0,
        page,
        limit,
      });
    }

    // No search: use populate then paginate
    if (!search) {
      const { items, wishlist: respWishlist } = await buildWishlistResponse({
        wishlist,
        page,
        limit,
        sortBy,
        sortOrder,
      });

      return res.status(200).json({
        success: true,
        message: "Wishlist fetched successfully",
        ...respWishlist,
        items,
      });
    }

    // Search: filter wishlist products by product_name / brand / category
    const wishlistProductIds = (wishlist.products || []).map((p) => p.product);

    const products = await Product.find({
      _id: { $in: wishlistProductIds },
    })
      .populate("category")
      .where({});

    const lower = search.toLowerCase();
    const matchedIds = products
      .filter((p) => {
        const categoryName = p.category?.category_name || "";
        return (
          p.product_name?.toLowerCase().includes(lower) ||
          p.brand?.toLowerCase().includes(lower) ||
          categoryName.toLowerCase().includes(lower)
        );
      })
      .map((p) => p._id.toString());

    // Build a temporary sorted list of wishlist items
    const filteredWishlist = await Wishlist.findById(wishlist._id).populate({
      path: "products.product",
      model: "Product",
      populate: { path: "category" },
    });

    const filteredItems = (filteredWishlist?.products || []).filter((it) =>
      matchedIds.includes(it.product?._id?.toString())
    );

    // manual pagination
    const itemsAs = filteredItems.map((x) => x.toObject());
    const totalItems = itemsAs.length;
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const start = (page - 1) * limit;
    const paged = itemsAs.slice(start, start + limit);

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      wishlist: {
        _id: wishlist._id,
        user: wishlist.user,
        wishlistName: wishlist.wishlistName,
        visibility: wishlist.visibility,
        active: wishlist.active,
        totalProducts: wishlist.totalProducts,
        items: paged,
        page,
        limit,
        totalItems,
        totalPages,
      },
      items: paged,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Database error",
    });
  }
};

export const checkWishlistProduct = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid productId" });
    }

    const wishlist = await Wishlist.findOne({ user: userId }, { "products.product": 1 });
    const exists = Boolean(
      wishlist?.products?.some((p) => p.product?.toString() === productId)
    );

    return res.status(200).json({ success: true, exists });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Database error" });
  }
};

export const removeProductFromWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid productId" });
    }

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    const before = wishlist.products.length;
    wishlist.products = (wishlist.products || []).filter(
      (p) => p.product?.toString() !== productId
    );
    wishlist.totalProducts = wishlist.products.length;

    if (wishlist.products.length === before) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
      wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Database error",
    });
  }
};

export const clearWishlist = async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    wishlist.products = [];
    wishlist.totalProducts = 0;
    await wishlist.save();

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Database error",
    });
  }
};

export const moveWishlistItemToCart = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { productId } = req.params;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!productId || !isValidObjectId(productId)) {
      return res.status(400).json({ success: false, message: "Invalid productId" });
    }

    // Validate wishlist exists & item exists
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    const itemExistsInWishlist = (wishlist.products || []).some(
      (p) => p.product?.toString() === productId
    );

    if (!itemExistsInWishlist) {
      return res.status(404).json({ success: false, message: "Item not in wishlist" });
    }

    // Validate product and inventory availability
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const inventory = await Inventory.findOne({
      product: productId,
      isDeleted: { $ne: true },
    });

    if (!isProductActive(product, inventory)) {
      return res.status(400).json({ success: false, message: "Product is not available" });
    }

    // Load/create cart
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    const cartItemIndex = (cart.items || []).findIndex(
      (i) => i.product?.toString() === productId
    );

    // Must not duplicate an existing cart item.
    // If it already exists, we only remove from wishlist and return cart.
    if (cartItemIndex === -1) {
      cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save();

    // Remove from wishlist
    wishlist.products = (wishlist.products || []).filter(
      (p) => p.product?.toString() !== productId
    );
    wishlist.totalProducts = wishlist.products.length;
    await wishlist.save();

    const populatedCart = await Cart.findOne({ user: userId }).populate("items.product");

    return res.status(200).json({
      success: true,
      message: "Moved to cart successfully",
      cart: populatedCart,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error?.message || "Database error" });
  }
};

