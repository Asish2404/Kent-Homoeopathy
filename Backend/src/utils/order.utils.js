import mongoose from "mongoose";
import { Cart } from "../models/atanu.cart.model.js";
import { Order } from "../models/atanu.order.model.js";
import { Product } from "../models/atanu.product.model.js";

import {
    calculateDeliveryCharge,
    calculateDiscount,
    calculateGrandTotal,
    calculateSubtotal,
} from "./cart.utils.js";

export const generateOrderNumber = async (referenceDate = new Date()) => {
    const datePart = `${referenceDate.getFullYear()}${String(referenceDate.getMonth() + 1).padStart(2, "0")}${String(referenceDate.getDate()).padStart(2, "0")}`;
    const orderNumberPrefix = `ORD-${datePart}`;

    const latestOrder = await Order.collection
        .find({ orderNumber: new RegExp(`^${orderNumberPrefix}`) })
        .sort({ orderNumber: -1 })
        .limit(1)
        .toArray();

    const latestOrderNumber = latestOrder[0]?.orderNumber;
    const currentSequence = latestOrderNumber
        ? Number(latestOrderNumber.slice(-4)) || 0
        : 0;

    return `${orderNumberPrefix}${String(currentSequence + 1).padStart(4, "0")}`;
};

export const calculateOrderTotals = (cartItems) => {
    const subtotal = calculateSubtotal(cartItems);
    const discount = calculateDiscount(cartItems);
    const deliveryCharge = calculateDeliveryCharge({ subtotal });
    const tax = 0;
    const grandTotal = calculateGrandTotal({
        subtotal,
        discount,
        deliveryCharge,
    }) + tax;

    return {
        subtotal,
        discount,
        deliveryCharge,
        tax,
        grandTotal,
    };
};

export const isProductInactive = (product) => {
    return Boolean(
        product?.isActive === false ||
        product?.active === false ||
        product?.status === "inactive" ||
        product?.status === "archived" ||
        product?.deleted === true
    );
};

export const buildOrderItems = (cartItems) => {
    return cartItems.map((item) => ({
        productId: item.product._id,
        quantity: Number(item.quantity) || 0,
        productName: item.product.product_name,
        productImage: item.product.product_image,
        mrpPrice: item.product.mrp_price,
        discountPrice: item.product.discount_price,
    }));
};

export const updateProductStock = async (cartItems) => {
    const stockAdjustments = [];

    for (const item of cartItems) {
        const quantity = Number(item.quantity) || 0;
        const productId = item.product?._id;

        // Skip stock deduction for items without a valid MongoDB ObjectId
        // (e.g., static catalog products with numeric IDs like 401, 402, or bundle items)
        if (!productId || !mongoose.Types.ObjectId.isValid(String(productId))) {
            stockAdjustments.push({
                productId,
                quantity,
                skipped: true,
            });
            continue;
        }

        const updatedProduct = await Product.findOneAndUpdate(
            {
                _id: productId,
                stock: { $gte: quantity },
            },
            {
                $inc: { stock: -quantity },
            },
            {
                new: true,
            }
        );

        if (!updatedProduct) {
            for (const appliedItem of stockAdjustments.reverse()) {
                if (appliedItem.skipped) continue;
                await Product.updateOne(
                    { _id: appliedItem.productId },
                    { $inc: { stock: appliedItem.quantity } }
                );
            }

            return {
                success: false,
                failedProductId: productId,
            };
        }

        stockAdjustments.push({
            productId,
            quantity,
            skipped: false,
        });
    }

    return {
        success: true,
        stockAdjustments,
    };
};

export const clearCart = async (userId) => {
    await Cart.updateOne(
        { user: userId },
        {
            $set: { items: [] },
        }
    );
};
