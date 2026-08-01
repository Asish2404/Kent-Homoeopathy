import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
    {
        size: { type: String, required: true },
        unit: { type: String, default: "ml" },
        mrp_price: { type: Number, required: true },
        discount_price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
    },
    { _id: false }
);

const faqSchema = new mongoose.Schema(
    {
        question: { type: String },
        answer: { type: String },
    },
    { _id: false }
);

const productSchema = new mongoose.Schema(
    {
        product_name: { type: String, required: true },
        product_image: { type: String, required: true },
        brand: { type: String, required: true },
        short_description: { type: String, required: true },
        detailed_description: { type: String, required: true },
        quantity: { type: Number },
        pack: { type: String },
        mrp_price: { type: Number, required: true },
        discount_price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
        isKentProduct: { type: Boolean, default: false },

        // New optional fields for premium product experience
        variants: [variantSchema],
        benefits: [String],
        ingredients: [String],
        usage: [String],
        dosage: { type: String },
        latin_name: { type: String },
        extra_images: [String],
        rating: { type: Number, default: 0, min: 0, max: 5 },
        review_count: { type: Number, default: 0, min: 0 },
        side_effects: [String],
        precautions: [String],
        storage_instructions: { type: String },
        manufacturer_info: { type: String },
        country_of_origin: { type: String },
        shelf_life: { type: String },
        suitable_age_group: { type: String },
        prescription_required: { type: Boolean, default: false },
        potency: { type: String },
        faq: [faqSchema],
    },
    { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
