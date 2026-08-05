import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
    {
        size: { type: String, required: true },
        unit: { type: String, default: "ml" },
        net_quantity: { type: String, default: "" },
        mrp_price: { type: Number, required: true },
        discount_price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
        sku: { type: String, default: "" },
        barcode: { type: String, default: "" },
        weight: { type: String, default: "" },
        status: { type: String, default: "active" },
    },
    { _id: false }
);

const potencySchema = new mongoose.Schema(
    {
        value: { type: String, required: true },
        mrp_price: { type: Number, default: 0 },
        discount_price: { type: Number, default: 0 },
        stock: { type: Number, default: 0 },
        sku: { type: String, default: "" },
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

        // ===== Advanced Premium Product Fields (all optional) =====
        // Basic
        medicine_type: { type: String, default: "" },
        sku: { type: String, default: "" },
        barcode: { type: String, default: "" },
        hsn_code: { type: String, default: "" },
        tags: [String],
        net_quantity: { type: String, default: "" },
        weight: { type: String, default: "" },
        composition: [String],

        // Pricing
        gst: { type: Number, default: 0 },
        gst_included: { type: Boolean, default: true },
        profit_margin: { type: Number, default: 0 },

        // Potencies
        potencies: [potencySchema],

        // Detailed info
        how_it_works: [String],
        uses: [String],
        warnings: [String],
        contraindications: [String],
        drug_interactions: [String],
        expiry: { type: String, default: "" },
        license_number: { type: String, default: "" },
        pack_contents: { type: String, default: "" },

        // Inventory
        min_stock: { type: Number, default: 0 },
        max_stock: { type: Number, default: 0 },
        low_stock_alert: { type: Number, default: 0 },
        out_of_stock: { type: Boolean, default: false },
        availability: { type: String, default: "in_stock" },
        warehouse: { type: String, default: "" },

        // Images
        thumbnail_images: [String],
        gallery_images: [String],
        zoom_image: { type: String, default: "" },

        // SEO
        seo_title: { type: String, default: "" },
        seo_description: { type: String, default: "" },
        seo_keywords: { type: String, default: "" },
        slug: { type: String, default: "" },
        canonical_url: { type: String, default: "" },
        og_image: { type: String, default: "" },

        // Status / Flags
        featured: { type: Boolean, default: false },
        best_seller: { type: Boolean, default: false },
        trending: { type: Boolean, default: false },
        recommended: { type: Boolean, default: false },
        new_arrival: { type: Boolean, default: false },
        home_page: { type: Boolean, default: false },
        hide_product: { type: Boolean, default: false },
        draft: { type: Boolean, default: false },

        // Meta
        sold_count: { type: Number, default: 0 },
    },
    { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
