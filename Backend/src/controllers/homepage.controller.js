import mongoose from "mongoose";

import { HomepageSection } from "../models/homepageSection.model.js";
import { Product } from "../models/atanu.product.model.js";

const VALID_SECTIONS = [
    "featured",
    "new_arrivals",
    "trending",
    "best_sellers",
    "top_picks",
    "discount_20",
    "discount_30",
    "discount_50",
    "discount_70",
];

// Map a homepage section key to the matching product schema flag.
const SECTION_TO_FLAG = {
    featured: "featured",
    new_arrivals: "new_arrival",
    trending: "trending",
    best_sellers: "best_seller",
    top_picks: "top_pick",
};

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const normalizeSection = (value) => String(value || "").trim().toLowerCase();

const validateSection = (section) => {
    if (!VALID_SECTIONS.includes(section)) {
        return { error: `Invalid section. Must be one of: ${VALID_SECTIONS.join(", ")}` };
    }
    return {};
};

const populateSectionProducts = async (section) => {
    const entries = await HomepageSection.find({ section })
        .sort({ order: 1 })
        .populate("product");
    return entries
        .map((entry) => entry.product)
        .filter(Boolean);
};

/**
 * GET /api/homepage/sections
 * Returns all homepage sections with their member products and total counts.
 */
export const getHomepageSections = async (req, res) => {
    try {
        const sections = [];
        for (const section of VALID_SECTIONS) {
            const products = await populateSectionProducts(section);
            sections.push({
                section,
                count: products.length,
                products,
            });
        }

        return res.status(200).json({ success: true, sections });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Server error." });
    }
};

/**
 * GET /api/homepage/sections/:section
 * Returns a single section's products.
 */
export const getHomepageSection = async (req, res) => {
    try {
        const section = normalizeSection(req.params.section);
        const validation = validateSection(section);
        if (validation.error) {
            return res.status(400).json({ success: false, message: validation.error });
        }

        const products = await populateSectionProducts(section);
        return res.status(200).json({ success: true, section, count: products.length, products });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Server error." });
    }
};

/**
 * POST /api/homepage/sections/:section/products
 * Body: { productId }
 * Adds a product to a section. Also flips the corresponding product flag so
 * the public homepage and the Add/Edit Product form stay synchronized.
 */
export const addProductToSection = async (req, res) => {
    try {
        const section = normalizeSection(req.params.section);
        const validation = validateSection(section);
        if (validation.error) {
            return res.status(400).json({ success: false, message: validation.error });
        }

        const { productId } = req.body;
        if (!productId || !isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Valid productId is required." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        const existing = await HomepageSection.findOne({ section, product: productId });
        if (existing) {
            return res.status(409).json({ success: false, message: "Product already in this section." });
        }

        const maxOrder = await HomepageSection.findOne({ section }).sort({ order: -1 }).select("order");
        const nextOrder = (maxOrder?.order ?? -1) + 1;

        await HomepageSection.create({ section, product: productId, order: nextOrder });

        // Keep the product flag synchronized for flag-based sections.
        const flag = SECTION_TO_FLAG[section];
        if (flag) {
            await Product.updateOne({ _id: productId }, { $set: { [flag]: true } });
        }

        const products = await populateSectionProducts(section);
        return res.status(201).json({ success: true, section, count: products.length, products });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Server error." });
    }
};

/**
 * DELETE /api/homepage/sections/:section/products/:productId
 * Removes a product from a section. Also clears the corresponding product flag.
 */
export const removeProductFromSection = async (req, res) => {
    try {
        const section = normalizeSection(req.params.section);
        const validation = validateSection(section);
        if (validation.error) {
            return res.status(400).json({ success: false, message: validation.error });
        }

        const { productId } = req.params;
        if (!isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: "Valid productId is required." });
        }

        const deleted = await HomepageSection.findOneAndDelete({ section, product: productId });
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Product not found in this section." });
        }

        const flag = SECTION_TO_FLAG[section];
        if (flag) {
            await Product.updateOne({ _id: productId }, { $set: { [flag]: false } });
        }

        const products = await populateSectionProducts(section);
        return res.status(200).json({ success: true, section, count: products.length, products });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Server error." });
    }
};

/**
 * PATCH /api/homepage/sections/:section/reorder
 * Body: { productIds: string[] }
 * Reorders the products within a section using the provided ordered list.
 */
export const reorderSection = async (req, res) => {
    try {
        const section = normalizeSection(req.params.section);
        const validation = validateSection(section);
        if (validation.error) {
            return res.status(400).json({ success: false, message: validation.error });
        }

        const { productIds } = req.body;
        if (!Array.isArray(productIds)) {
            return res.status(400).json({ success: false, message: "productIds must be an array." });
        }

        const validIds = productIds.filter((id) => isValidObjectId(id));
        const bulkOps = validIds.map((id, index) => ({
            updateOne: {
                filter: { section, product: id },
                update: { $set: { order: index } },
            },
        }));

        if (bulkOps.length > 0) {
            await HomepageSection.bulkWrite(bulkOps);
        }

        const products = await populateSectionProducts(section);
        return res.status(200).json({ success: true, section, count: products.length, products });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Server error." });
    }
};
