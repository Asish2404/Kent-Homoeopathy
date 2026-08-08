import mongoose from "mongoose";

/**
 * Simplified admin product schema.
 *
 * Each variant holds its own pricing, discount, stock, potency and size.
 * The selling_price is auto-calculated from mrp_price and discount_percent.
 */
const variantSchema = new mongoose.Schema(
    {
        size: { type: String, default: "" },
        potency: { type: String, default: "" },
        mrp_price: { type: Number, default: 0 },
        discount_percent: { type: Number, default: 0 },
        selling_price: { type: Number, default: 0 },
        min_order_qty: { type: Number, default: 1 },
        stock: { type: Number, default: 0 },
        expiry_date: { type: String, default: "" },
        rating: { type: Number, default: 0, min: 0, max: 5 },
        review_count: { type: Number, default: 0, min: 0 },
        out_of_stock: { type: Boolean, default: false },
        not_available: { type: Boolean, default: false },
    },
    { _id: true }
);

const specificationSchema = new mongoose.Schema(
    {
        label: { type: String, default: "" },
        value: { type: String, default: "" },
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        product_name: { type: String, required: true },
        product_image: { type: String, required: true },
        images: { type: [String], default: [] },
        brand: { type: String, required: true },
        short_description: { type: String, required: true },
        detailed_description: { type: String, required: true },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        medicine_type: { type: String, default: "" },

        mrp_price: { type: Number, default: 0 },
        discount_price: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
        variants: [variantSchema],

        featured: { type: Boolean, default: false },
        new_arrival: { type: Boolean, default: false },
        trending: { type: Boolean, default: false },
        best_seller: { type: Boolean, default: false },
        top_pick: { type: Boolean, default: false },

        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        totalReviews: { type: Number, default: 0, min: 0 },
        specifications: { type: [specificationSchema], default: [] },
    },
    { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
