import { Cart } from "../models/atanu.cart.model.js";
import { Product } from "../models/atanu.product.model.js";
import {
    calculateCartTotals,
    calculateDeliveryCharge,
    calculateDiscount,
    calculateGrandTotal,
} from "../utils/cart.utils.js";

export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const userId = req.user._id;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Check if user already has a cart
        let cart = await Cart.findOne({ user: userId });

        // If not, create a new cart
        if (!cart) {
            cart = new Cart({
                user: userId,
                items: [],
            });
        }

        // Check if product already exists in cart
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        // If product exists, increase quantity
        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
            });
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

export const getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const totals = calculateCartTotals(cart.items);

        res.status(200).json({
            success: true,
            cart,
            totals,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user._id;

        const parsedQuantity = Number(quantity);

        if (!productId || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity",
            });
        }

        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const item = cart.items.find((cartItem) => cartItem.product.toString() === productId);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        item.quantity = parsedQuantity;
        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

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

        const initialItemCount = cart.items.length;
        cart.items = cart.items.filter((item) => item.product.toString() !== productId);

        if (cart.items.length === initialItemCount) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: "Cart item removed successfully",
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } },
            { new: true }
        );

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const checkout = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const items = cart.items || [];
        const subtotal = calculateCartTotals(items).subtotal;
        const discount = calculateDiscount(items);
        const deliveryCharge = calculateDeliveryCharge({ subtotal });
        const grandTotal = calculateGrandTotal({ subtotal, discount, deliveryCharge });

        res.status(200).json({
            success: true,
            message: "Checkout details fetched successfully",
            cart,
            pricing: {
                subtotal,
                discount,
                deliveryCharge,
                grandTotal,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};