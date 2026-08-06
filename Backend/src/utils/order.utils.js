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
    return cartItems.map((item) => {
        const variantIndex = item.variant_index !== undefined && item.variant_index !== null
            ? Number(item.variant_index)
            : null;
        const variant = 
            variantIndex !== null &&
            Array.isArray(item.product?.variants) &&
            item.product.variants[variantIndex]
                ? item.product.variants[variantIndex]
                : null;

        const mrpPrice = variant
            ? Number(variant.mrp_price)
            : Number(item.product.mrp_price);
        const sellingPrice =
            (variant ? Number(variant.selling_price) : 0) ||
            Number(item.selling_price) ||
            Number(item.product.discount_price);

        return {
            productId: item.product._id,
            quantity: Number(item.quantity) || 0,
            productName: item.product.product_name,
            productImage: item.product.product_image,
            mrpPrice,
            discountPrice: sellingPrice,
            unitPrice: sellingPrice,
            variant_id: variant?._id ? String(variant._id) : item.variant_id || "",
            variant_index: variantIndex,
            selected_size: variant?.size || item.selected_size || "",
            selected_potency: variant?.potency || item.selected_potency || "",
            selling_price: sellingPrice,
        };
    });
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

const variantIndex =
            item.variant_index !== undefined && item.variant_index !== null
                ? Number(item.variant_index)
                : null;

        let updatedProduct;

        if (variantIndex !== null) {
            // Deduct stock from the specific variant using an atomic update.
            updatedProduct = await Product.findOneAndUpdate(
                {
                    _id: productId,
                    [`variants.${variantIndex}.stock`]: { $gte: quantity },
                },
                {
                    $inc: { [`variants.${variantIndex}.stock`]: -quantity },
                },
                {
                    new: true,
                }
            );
        } else {
            updatedProduct = await Product.findOneAndUpdate(
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
        }

        if (!updatedProduct) {
            for (const appliedItem of stockAdjustments.reverse()) {
                if (appliedItem.skipped) continue;
                if (appliedItem.variantIndex !== null) {
                    await Product.updateOne(
                        { _id: appliedItem.productId },
                        { $inc: { [`variants.${appliedItem.variantIndex}.stock`]: appliedItem.quantity } }
                    );
                } else {
                    await Product.updateOne(
                        { _id: appliedItem.productId },
                        { $inc: { stock: appliedItem.quantity } }
                    );
                }
            }

            return {
                success: false,
                failedProductId: productId,
            };
        }

        stockAdjustments.push({
            productId,
            quantity,
            variantIndex,
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
