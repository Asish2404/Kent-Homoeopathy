import { Cart } from "../models/atanu.cart.model.js";
import { Product } from "../models/atanu.product.model.js";

import {
    calculateCartTotals,
    calculateDeliveryCharge,
    calculateDiscount,
    calculateGrandTotal,
} from "../utils/cart.utils.js";

// Add product to cart
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        const qty = Number(quantity);
        if (!productId || !Number.isFinite(qty) || qty < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity",
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [],
            });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += qty;
        } else {
            cart.items.push({
                product: productId,
                quantity: qty,
            });
        }

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error?.message || "Database error",
        });
    }
};

// Get current cart
export const getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId }).populate(
            "items.product"
        );

        // Preserve existing behavior: if cart doesn't exist or has no items,
        // respond 200 with empty cart + totals.
        if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                items: [],
                totalItems: 0,
                subtotal: 0,
            });
        }

        const { totalItems, subtotal } = calculateCartTotals(cart.items);

        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            items: cart.items,
            totalItems,
            subtotal,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error?.message || "Database error",
        });
    }
};

// Update cart quantity
export const updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;

        const qty = Number(quantity);
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Product ID",
            });
        }

        if (!Number.isFinite(qty) || qty <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid Quantity",
            });
        }

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        const item = cart.items[itemIndex];
        item.quantity = qty;

        const { totalItems, subtotal } = calculateCartTotals(cart.items);

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cart,
            totalItems,
            subtotal,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error?.message || "Database error",
        });
    }
};

// Remove item from cart
export const removeCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        // Keep compatibility with previous mixed behavior by allowing stock
        // validation when a Product doc is available.
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product Not Found",
            });
        }

        const itemIndex = cart.items.findIndex(
            (i) => i.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product Not Found in cart",
            });
        }

        // If quantity exists on cart item, preserve out-of-stock validation.
        const qtyInCart = Number(cart.items[itemIndex]?.quantity) || 0;
        if (typeof product.stock === "number" && product.stock < qtyInCart) {
            return res.status(400).json({
                success: false,
                message: "Out Of Stock",
            });
        }

        cart.items.splice(itemIndex, 1);

        await cart.save();

        const { totalItems, subtotal } = calculateCartTotals(cart.items);

        return res.status(200).json({
            success: true,
            message: "Cart item removed successfully",
            cart,
            totalItems,
            subtotal,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error?.message || "Database error",
        });
    }
};

// Clear entire cart
export const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart Not Found",
            });
        }

        cart.items = [];
        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            totalItems: 0,
            subtotal: 0,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error?.message || "Database error",
        });
    }
};

// Checkout validation + pricing summary
export const checkout = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId }).populate(
            "items.product"
        );

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart Not Found",
            });
        }

        if (!Array.isArray(cart.items) || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty",
            });
        }

        // Validate products still exist + stock
        for (const item of cart.items) {
            const product = item.product;
            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Deleted Product",
                });
            }

            const requestedQty = Number(item.quantity) || 0;
            if (requestedQty <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid Quantity",
                });
            }

            if (typeof product.stock === "number" && product.stock < requestedQty) {
                return res.status(400).json({
                    success: false,
                    message: "Out Of Stock",
                });
            }
        }

        // Preserve pricing behavior present in the corrupted file
        const { totalItems, subtotal } = calculateCartTotals(cart.items);
        const discount = calculateDiscount(cart.items);
        const deliveryCharge = calculateDeliveryCharge({ subtotal });
        const grandTotal = calculateGrandTotal({ subtotal, discount, deliveryCharge });

        return res.status(200).json({
            success: true,
            message: "Checkout validation successful",
            cart: {
                items: cart.items,
                totalItems,
                subtotal,
            },
            pricing: {
                subtotal,
                discount,
                deliveryCharge,
                grandTotal,
            },
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error?.message || "Database error",
        });
    }
};

