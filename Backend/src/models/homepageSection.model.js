import mongoose from "mongoose";

/**
 * Homepage section membership with explicit ordering.
 *
 * Each document represents a product assigned to a named homepage section.
 * The `order` field drives drag-and-drop reordering in the Homepage
 * Management panel while keeping the section flags on the Product document
 * synchronized (the section flags remain the single source of truth for
 * the public homepage queries).
 */
const homepageSectionSchema = new mongoose.Schema(
    {
        section: {
            type: String,
            required: true,
            index: true,
            enum: [
                "featured",
                "new_arrivals",
                "trending",
                "best_sellers",
                "top_picks",
                "discount_20",
                "discount_30",
                "discount_50",
                "discount_70",
            ],
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

homepageSectionSchema.index({ section: 1, order: 1 });
homepageSectionSchema.index({ section: 1, product: 1 }, { unique: true });

export const HomepageSection =
    mongoose.models.HomepageSection ||
    mongoose.model("HomepageSection", homepageSectionSchema);
