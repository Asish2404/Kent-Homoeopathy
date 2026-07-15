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




