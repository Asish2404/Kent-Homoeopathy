import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        product_name: { type: String, required: true },
        product_image: { type: String, required: true },
        brand: { type: String, required: true },
        short_description: { type: String, required: true },
        detailed_description: { type: String, required: true },
        quantity: { type: Number,},
        pack: { type: String,},
        mrp_price: { type: Number, required: true },
        discount_price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }
    },
    { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);