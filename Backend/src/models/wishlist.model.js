import mongoose from "mongoose";

const wishlistItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },

        addedDate: {
            type: Date,
            default: Date.now,
        },

        priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
            trim: true,
        },
    },
    { _id: false }
);

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },

        wishlistName: {
            type: String,
            default: "My Wishlist",
            trim: true,
        },

        visibility: {
            type: String,
            enum: ["Private", "Public"],
            default: "Private",
            required: true,
            trim: true,
            index: true,
        },

        products: {
            type: [wishlistItemSchema],
            default: [],
            validate: {
                validator: function (values) {
                    if (!Array.isArray(values)) {
                        return false;
                    }

                    const productIds = values.map((item) => item.product?.toString());
                    return new Set(productIds).size === productIds.length;
                },
                message: "Wishlist cannot contain duplicate products",
            },
        },

        active: {
            type: Boolean,
            default: true,
        },

        totalProducts: {
            type: Number,
            default: 0,
            min: [0, "Total products cannot be negative"],
        },
    },
    {
        timestamps: true,
    }
);

// Lookup indexes for wishlist retrieval, sharing, and analytics.
wishlistSchema.index({ user: 1 }, { unique: true });
wishlistSchema.index({ "products.product": 1 });
wishlistSchema.index({ visibility: 1 });

export const Wishlist = mongoose.model("Wishlist", wishlistSchema);
