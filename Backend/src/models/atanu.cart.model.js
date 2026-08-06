import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },

    quantity: {
        type: Number,
        default: 1,
        min: 1,
    },

    // ===== Variant-based cart support =====
    variant_id: { type: String, default: "" },        // variant _id (string)
    variant_index: { type: Number, default: null },    // index into product.variants
    selected_size: { type: String, default: "" },      // Size / Pack Size
    selected_potency: { type: String, default: "" },   // Potency
    selling_price: { type: Number, default: 0 },       // Selling price of selected variant
    mrp_price: { type: Number, default: 0 },           // MRP of selected variant
});

const cartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        items: [cartItemSchema],
    },
    {
        timestamps: true,
    }
);

export const Cart = mongoose.model("Cart", cartSchema);