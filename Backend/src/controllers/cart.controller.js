import { Cart } from "../models/atanu.cart.model.js";
import { Product } from "../models/atanu.product.model.js";
import { calculateCartTotals } from "../utils/cart.utils.js";

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

// Get cart for logged-in user
export const getCart = async (req, res) => {
    try {
        // Logged-in user identification (do NOT use body/params)
        const userId = req.user._id;

        // Find the cart and populate product fields selectively
        const cart = await Cart.findOne({ user: userId }).populate({
            path: "items.product",
            select: "product_name product_image price stock category"
        });

        // If user has no cart, return Cart is empty (200, not an error)
        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                cart: {
                    items: [],
                    totalItems: 0,
                    subtotal: 0
                }
            });
        }

        // Populate may still return null products if the product was deleted.
        // We'll compute totals dynamically every time the API is called.
        const { totalItems, subtotal } = calculateCartTotals(
            cart.items || []
        );

        // Build response cart object with computed totals (do not store in MongoDB)
        const cartResponse = {
            items: (cart.items || []).map((item) => ({
                // Keep cart item structure lightweight and frontend-friendly
                product: item.product
                    ? {
                          name: item.product.product_name,
                          image: item.product.product_image,
                          price: item.product.price,
                          stock: item.product.stock,
                          category: item.product.category
                      }
                    : null,
                quantity: item.quantity
            })),
            totalItems,
            subtotal
        };

        return res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            cart: cartResponse,
            totalItems,
            subtotal
        });
    } catch (error) {
        // Handle all possible errors with proper HTTP status codes

        // Invalid user / invalid ObjectId
        if (
            error?.name === "CastError" ||
            error?.name === "MongoServerError"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user"
            });
        }

        // Database errors
        return res.status(500).json({
            success: false,
            message: error.message || "Database error"
        });
    }
};

// ====================== UPDATE CART QUANTITY ======================
// PATCH /api/cart/update (example)
export const updateCartQuantity = async (req, res) => {
    try {
        // Logged-in user identification (do NOT use body/params userId)
        const userId = req.user._id;

        const { productId, quantity } = req.body;

        // ---------------------- VALIDATION ----------------------
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: "ProductId is required"
            });
        }

        if (quantity === undefined || quantity === null) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity"
            });
        }

        // Must be a number (no decimals allowed)
        if (typeof quantity !== "number") {
            // If frontend sends quantity as string, try to convert safely
            const parsedQuantity = Number(quantity);
            if (Number.isNaN(parsedQuantity)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid quantity"
                });
            }
            // Replace with numeric value for further checks
            // (still reject decimals)
            req.body.quantity = parsedQuantity;
        }

        const normalizedQuantity = Number(req.body.quantity);

        if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity"
            });
        }

        if (!Number.isInteger(normalizedQuantity)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity"
            });
        }

        // ---------------------- EXISTING DATA ----------------------
        // Validate cart exists for user
        const cart = await Cart.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found"
            });
        }

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Locate the product inside user's cart (must already exist)
        const itemInCart = cart.items.find(
            (item) => item.product.toString() === productId
        );

        if (!itemInCart) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart"
            });
        }

        // ---------------------- STOCK CHECK ----------------------
        const availableStock = Number(product.stock ?? 0);
        if (normalizedQuantity > availableStock) {
            return res.status(400).json({
                success: false,
                message: "Quantity exceeds stock"
            });
        }

        // ---------------------- UPDATE QUANTITY ----------------------
        itemInCart.quantity = normalizedQuantity;

        await cart.save();

        // ---------------------- POPULATE + TOTALS ----------------------
        const populatedCart = await Cart.findById(cart._id).populate({
            path: "items.product",
            select: "product_name product_image price stock category"
        });

        // Calculate totals dynamically (no DB storage)
        const { totalItems, subtotal } = calculateCartTotals(
            populatedCart?.items || []
        );

        // Keep response cart structure consistent with getCart
        const cartResponse = {
            items: (populatedCart?.items || []).map((item) => ({
                product: item.product
                    ? {
                          name: item.product.product_name,
                          image: item.product.product_image,
                          price: item.product.price,
                          stock: item.product.stock,
                          category: item.product.category
                      }
                    : null,
                quantity: item.quantity
            })),
            totalItems,
            subtotal
        };

        return res.status(200).json({
            success: true,
            message: "Cart quantity updated successfully",
            cart: cartResponse,
            totalItems,
            subtotal
        });
    } catch (error) {
        // Invalid user / invalid ObjectId
        if (
            error?.name === "CastError" ||
            error?.name === "MongoServerError"
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid user"
            });
        }

        // Database errors
        return res.status(500).json({
            success: false,
            message: error.message || "Database error"
        });
    }
};





