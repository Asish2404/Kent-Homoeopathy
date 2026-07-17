import { Cart } from "../models/atanu.cart.model.js";
import { Product } from "../models/atanu.product.model.js";
import {
    calculateDeliveryCharge,
    calculateDiscount,
    calculateGrandTotal,
    calculateSubtotal,
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

        const cart = await Cart.findOne({ user: userId }).populate({
            path: "items.product",
            select: "product_name product_image price stock category",
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            cart,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "productId is required",
            });
        }

        const qty = Number(quantity);
        if (!Number.isFinite(qty) || qty < 1) {
            return res.status(400).json({
                success: false,
                message: "Quantity must be at least 1",
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

        cart.items[itemIndex].quantity = qty;

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cart,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const checkout = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId }).populate({
            path: "items.product",
            select: "product_name product_image mrp_price discount_price stock category",
        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        if (!cart.items || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Your cart is empty",
            });
        }

        // Validate products + stock
        const normalizedItems = [];
        for (const item of cart.items) {
            const product = item.product;

            if (!product) {
                return res.status(404).json({
                    success: false,
                    message: "Product not found",
                });
            }

            const requestedQuantity = Number(item.quantity) || 0;

            // Stock validation
            const availableStock = Number(product.stock) || 0;
            if (requestedQuantity > availableStock) {
                return res.status(400).json({
                    success: false,
                    message: "Insufficient stock",
                    productName: product.product_name,
                    availableStock,
                    requestedQuantity,
                });
            }

            // Use mrp_price as base price; discount_price kept for future coupon/price logic.
            normalizedItems.push({
                ...item.toObject?.() /* mongoose doc */,
                product: {
                    ...product.toObject?.(),
                    price: Number(product.mrp_price) || 0,
                },
            });
        }

        const subtotal = calculateSubtotal(normalizedItems);
        const totalItems = normalizedItems.reduce(
            (sum, item) => sum + (Number(item.quantity) || 0),
            0
        );

        const discount = calculateDiscount();

        // Delivery Charge configurable via env with sensible defaults
        const deliveryCharge = calculateDeliveryCharge({
            subtotal,
            threshold: Number(process.env.DELIVERY_FREE_THRESHOLD ?? 999),
            charge: Number(process.env.DELIVERY_CHARGE ?? 80),
        });

        const grandTotal = calculateGrandTotal({
            subtotal,
            discount,
            deliveryCharge,
        });

        return res.status(200).json({
            success: true,
            message: "Checkout details fetched successfully",
            checkout: {
                items: normalizedItems.map((i) => ({
                    product: {
                        name: i.product.product_name,
                        image: i.product.product_image,
                        price: i.product.price,
                        stock: i.product.stock,
                        category: i.product.category,
                    },
                    quantity: i.quantity,
                })),
                totalItems,
                subtotal,
                discount,
                deliveryCharge,
                grandTotal,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

