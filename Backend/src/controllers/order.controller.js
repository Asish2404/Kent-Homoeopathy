import { Cart } from "../models/atanu.cart.model.js";
import { Order } from "../models/atanu.order.model.js";
import { Product } from "../models/atanu.product.model.js";
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

    if (isProductInactive(item.product)) {
        return "Product is inactive";
    }

    if (Number(item.product.stock) < quantity) {
        return "Product out of stock";
    }

    return null;
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

        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        if (!Array.isArray(cart.items) || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            });
        }

        for (const item of cart.items) {
            const validationError = validateCartItem(item);

            if (validationError) {
                const statusCode = validationError === "Product out of stock" ? 409 : 400;

                return res.status(statusCode).json({
                    success: false,
                    message: validationError,
                });
            }
        }

        const orderItems = buildOrderItems(cart.items);
        const totals = calculateOrderTotals(cart.items);
        const orderNumber = await generateOrderNumber();
        const orderedDate = new Date();
        const shippingAddress = resolveShippingAddress(req.body);
        const paymentMethod = req.body.paymentMethod || "Cash On Delivery";
        const paymentStatus = req.body.paymentStatus || "Pending";
        const orderStatus = req.body.orderStatus || "Pending";

        const stockResult = await updateProductStock(cart.items);

        if (!stockResult.success) {
            return res.status(409).json({
                success: false,
                message: "Product out of stock",
            });
        }

        const orderDocument = {
            user: userId,
            customer: userId,
            products: orderItems,
            orderItems,
            shippingAddress,
            address: shippingAddress,
            paymentMethod,
            paymentStatus,
            subtotal: totals.subtotal,
            discount: totals.discount,
            deliveryCharge: totals.deliveryCharge,
            tax: totals.tax,
            grandTotal: totals.grandTotal,
            orderNumber,
            orderStatus,
            status: "pending",
            orderedDate,
            orderPrice: totals.grandTotal,
            createdAt: orderedDate,
            updatedAt: orderedDate,
        };

        const insertedOrder = await Order.collection.insertOne(orderDocument);

        try {
            await clearCart(userId);
        } catch (cartError) {
            await Order.collection.deleteOne({ _id: insertedOrder.insertedId });

            for (const item of cart.items) {
                await Product.updateOne(
                    { _id: item.product._id },
                    { $inc: { stock: Number(item.quantity) || 0 } }
                );
            }

            throw cartError;
        }

        const placedOrder = {
            _id: insertedOrder.insertedId,
            ...orderDocument,
        };

        return res.status(201).json({
            success: true,
            message: "Order placed successfully",
            order: placedOrder,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Database error",
        });
    }
};
