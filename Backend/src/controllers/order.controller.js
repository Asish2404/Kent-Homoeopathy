import mongoose from "mongoose";
import { Cart } from "../models/atanu.cart.model.js";
import { Order } from "../models/atanu.order.model.js";
import { Product } from "../models/atanu.product.model.js";
import { COD_CHARGE, FREE_DELIVERY_THRESHOLD, KENT_SHIPPING_DISCOUNT, STANDARD_DELIVERY_CHARGE } from "../constants.js";
import {
    buildOrderItems,
    calculateOrderTotals,
    clearCart,
    generateOrderNumber,
    isProductInactive,
    updateProductStock,
} from "../utils/order.utils.js";

const resolveShippingAddress = (body) => {
    if (body.shippingAddress && typeof body.shippingAddress === "object") {
        return body.shippingAddress;
    }

    const {
        fullName,
        phone,
        email,
        house,
        street,
        landmark,
        city,
        state,
        pincode,
        slot,
    } = body;

    return {
        fullName,
        phone,
        email,
        house,
        street,
        landmark,
        city,
        state,
        pincode,
        slot,
    };
};

const validateCartItem = (item) => {
    const quantity = Number(item.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return "Invalid quantity";
    }

    if (!item.product) {
        return "Product deleted";
    }

    const productId = item.product._id;

    // Skip stock/inactive validation for items without a valid MongoDB ObjectId
    // e.g., static catalog products with numeric IDs (401, 402) or bundle items
    if (!productId || !mongoose.Types.ObjectId.isValid(String(productId))) {
        return null;
    }

    if (isProductInactive(item.product)) {
        return "Product is inactive";
    }

    if (Number(item.product.stock) < quantity) {
        return "Product out of stock";
    }

    return null;
};

const getPagination = (query) => {
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

const ensureValidShippingAddress = (shippingAddress) => {
    if (!shippingAddress || typeof shippingAddress !== "object") return false;

    const required = ["fullName", "phone", "email", "house", "street", "city", "state", "pincode"];

    return required.every((k) => {
        const v = shippingAddress[k];
        return typeof v === "string" ? v.trim().length > 0 : v !== undefined && v !== null;
    });
};

const getMyOrders = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { page, limit } = getPagination(req.query);

        const query = { user: userId };

        const [orders, totalCount] = await Promise.all([
            Order.find(query)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate("orderItems.productId", "product_name product_image brand slug mrp_price discount_price"),
            Order.countDocuments(query),
        ]);

        return res.status(200).json({
            success: true,
            orders,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Database error",
        });
    }
};

const getOrderById = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId, user: userId })
            .populate("user")
            .populate("customer")
            .populate("orderItems.productId")
            .populate("products.productId");

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        return res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Database error",
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const userId = req.user?._id;
        const { orderId } = req.params;

        const order = await Order.findOne({ _id: orderId, user: userId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        if (order.status === "cancelled" || order.orderStatus === "cancelled") {
            return res.status(409).json({
                success: false,
                message: "Duplicate cancellation",
            });
        }

        const currentStatus = order.status || order.orderStatus;
        const cancellableStatuses = ["pending", "confirmed"];

        if (!cancellableStatuses.includes(currentStatus)) {
            return res.status(400).json({
                success: false,
                message: "Order cannot be cancelled",
            });
        }

        const restoreItems = order.orderItems?.length ? order.orderItems : order.products;
        if (!Array.isArray(restoreItems) || restoreItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Order items missing",
            });
        }

        // Restore stock
        for (const item of restoreItems) {
            const qty = Number(item.quantity) || 0;
            if (!qty || !item.productId) continue;
            await Product.updateOne(
                { _id: item.productId },
                { $inc: { stock: qty } }
            );
        }

        order.status = "cancelled";
        order.orderStatus = "cancelled";
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Database error",
        });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { orderStatus } = req.body;

        const allowed = [
            "pending",
            "confirmed",
            "processing",
            "packed",
            "shipped",
            "delivered",
            "cancelled",
        ];

        if (!allowed.includes(orderStatus)) {
            return res.status(400).json({
                success: false,
                message: "Invalid order status",
            });
        }

        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
            });
        }

        order.orderStatus = orderStatus;
        order.status = orderStatus === "pending" ? "pending" : orderStatus;

        if (orderStatus === "cancelled") {
            order.status = "cancelled";
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order status updated",
            order,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Database error",
        });
    }
};

const getAdminOrders = async (req, res) => {
    try {
        const { page, limit, skip } = (() => {
            const { page, limit, skip } = getPagination(req.query);
            return { page, limit, skip };
        })();

        const q = (req.query.q || "").toString().trim();
        const status = (req.query.status || "").toString().trim();

        const sortBy = (req.query.sortBy || "createdAt").toString();
        const sortOrder = (req.query.sortOrder || "desc").toString().toLowerCase() === "asc" ? 1 : -1;

        const filter = {};
        if (q) {
            filter.$or = [
                { orderNumber: new RegExp(q, "i") },
                { "shippingAddress.fullName": new RegExp(q, "i") },
            ];
        }
        if (status) {
            filter.status = status;
        }

        const [orders, totalCount] = await Promise.all([
            Order.find(filter)
                .sort({ [sortBy]: sortOrder })
                .skip(skip)
                .limit(limit)
                .populate("user")
                .populate("customer"),
            Order.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            orders,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Database error",
        });
    }
};

export { getMyOrders, getOrderById, cancelOrder, updateOrderStatus, getAdminOrders };

const buildCartItemsFromBody = (bodyItems) => {
    if (!Array.isArray(bodyItems) || bodyItems.length === 0) return null;
    return bodyItems.map((item) => ({
        product: {
            _id: item.id || item.productId,
            product_name: item.name || "",
            product_image: item.image || "",
            mrp_price: Number(item.mrp || 0),
            discount_price: Number(item.price || 0),
            stock: Number(item.stock || 15),
            isKentProduct: Boolean(item.isKentProduct),
        },
        quantity: Number(item.qty || 1),
    }));
};

const placeOrderWithItems = async (items, userId, shippingAddress, paymentMethod, paymentStatus, orderStatus, couponDiscount) => {
    const orderItems = buildOrderItems(items);
    const totals = calculateOrderTotals(items);
    const orderNumber = await generateOrderNumber();
    const orderedDate = new Date();

    const hasKentProduct = items.some((item) => Boolean(item.product?.isKentProduct));
    const deliveryBase = totals.subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_CHARGE;
    const deliveryCharge = Math.max(0, deliveryBase - (hasKentProduct ? KENT_SHIPPING_DISCOUNT : 0));
    const codCharge = paymentMethod === "Cash on Delivery" ? COD_CHARGE : 0;
    const couponSave = Number(couponDiscount) || 0;
    const grandTotal = Math.max(0, totals.subtotal - totals.discount - couponSave + deliveryCharge + totals.tax + codCharge);

    const stockResult = await updateProductStock(items);
    if (!stockResult.success) {
        throw new Error("Product out of stock");
    }

    const orderDocument = {
        user: userId,
        customer: userId,
        products: orderItems,
        orderItems,
        shippingAddress,
        address: shippingAddress,
        paymentMethod: paymentMethod || "Cash On Delivery",
        paymentStatus: paymentStatus || "Pending",
        subtotal: totals.subtotal,
        discount: totals.discount + couponSave,
        deliveryCharge,
        tax: totals.tax,
        grandTotal,
        orderNumber,
        orderStatus: orderStatus || "Pending",
        status: "pending",
        orderedDate,
        orderPrice: grandTotal,
        createdAt: orderedDate,
        updatedAt: orderedDate,
    };

    const insertedOrder = await Order.collection.insertOne(orderDocument);

    try {
        await clearCart(userId);
    } catch (cartError) {
        await Order.collection.deleteOne({ _id: insertedOrder.insertedId });
        for (const item of items) {
            await Product.updateOne(
                { _id: item.product._id },
                { $inc: { stock: Number(item.quantity) || 0 } }
            );
        }
        throw cartError;
    }

    return {
        _id: insertedOrder.insertedId,
        ...orderDocument,
    };
};

export const placeOrder = async (req, res) => {
    try {
        const userId = req.user?._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid user",
            });
        }

        // Try loading the user's MongoDB cart first
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        let itemsSource;
        let cartSource = "mongodb";

        if (cart && Array.isArray(cart.items) && cart.items.length > 0) {
            itemsSource = cart.items;
        } else {
            // Fallback to items from request body (sent from frontend localStorage cart)
            const bodyItems = req.body.items || req.body.cartItems;
            const built = buildCartItemsFromBody(bodyItems);
            if (!built) {
                return res.status(400).json({
                    success: false,
                    message: "Your cart is empty. Please add items before placing an order.",
                });
            }
            itemsSource = built;
            cartSource = "body";
        }

        // Validate items
        for (const item of itemsSource) {
            const validationError = validateCartItem(item);
            if (validationError) {
                const statusCode = validationError === "Product out of stock" ? 409 : 400;
                return res.status(statusCode).json({
                    success: false,
                    message: validationError,
                });
            }
        }

        const shippingAddress = resolveShippingAddress(req.body);
        if (!ensureValidShippingAddress(shippingAddress)) {
            return res.status(400).json({
                success: false,
                message: "Invalid address",
            });
        }

        const paymentMethod = req.body.paymentMethod || "Cash On Delivery";
        const paymentStatus = req.body.paymentStatus || "Pending";
        const orderStatus = req.body.orderStatus || "Pending";
        const couponDiscount = req.body.coupon?.discountAmount || 0;

        const placedOrder = await placeOrderWithItems(
            itemsSource,
            userId,
            shippingAddress,
            paymentMethod,
            paymentStatus,
            orderStatus,
            couponDiscount
        );

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: placedOrder,
            cartSource,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Database error",
        });
    }
};
