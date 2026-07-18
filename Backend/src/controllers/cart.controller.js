import { Cart } from "../models/atanu.cart.model.js";
import { Product } from "../models/atanu.product.model.js";
import { calculateCartTotals } from "../utils/cart.utils.js";

// Add to Cart
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        const userId = req.user._id;

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
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

        return res.status(200).json({
            success: true,
            message: "Product added to cart",
            cart,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Remove Cart Item
// DELETE /api/cart/:productId
export const removeCartItem = async (req, res) => {
    try {
        // Auth: use logged-in user from middleware only
        const userId = req.user._id;

        const { productId } = req.params;

        // 1) Find logged-in user's cart
        const cart = await Cart.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        // 2) Search the requested product inside cart
        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        // 3) Remove only that product (do NOT delete the cart)
        cart.items.splice(itemIndex, 1);

        // 4) Recalculate totals using existing helper function
        const { totalItems, subtotal } = calculateCartTotals(cart.items);

        await cart.save();

        return res.status(200).json({
            success: true,
            message: "Item removed from cart successfully",
            cart,
            totalItems,
            subtotal,
        });
    } catch (error) {
        // Invalid product id/user id and any DB errors
        const message = error?.message || "Database error";
        return res.status(400).json({
            success: false,
            message,
        });
    }
};

// Get Cart
export const getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        // Populate product info (optional but future-ready)
        const cart = await Cart.findOne({ user: userId }).populate("items.product");

        if (!cart) {
            // Per requirements: return 200 and indicate empty cart.
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                items: [],
                totalItems: 0,
                subtotal: 0,
            });
        }

        if (!Array.isArray(cart.items) || cart.items.length === 0) {
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

// Update Cart Quantity
// PATCH /api/cart/quantity
export const updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;

        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Product ID",
            });
        }

        const qty = Number(quantity);
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

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product Not Found",
            });
        }

        const item = cart.items.find((i) => i.product.toString() === productId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Product Not Found in cart",
            });
        }

        if (typeof product.stock === "number" && product.stock < qty) {
            return res.status(400).json({
                success: false,
                message: "Out Of Stock",
            });
        }

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

// Clear Cart
// DELETE /api/cart/
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

// Checkout Validation (pre-checkout)
// POST /api/cart/checkout
export const checkout = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await Cart.findOne({ user: userId }).populate("items.product");

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

        const { totalItems, subtotal } = calculateCartTotals(cart.items);

        return res.status(200).json({
            success: true,
            message: "Checkout validation successful",
            cart: {
                items: cart.items,
                totalItems,
                subtotal,
            },
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error?.message || "Database error",
        });
    }
};


