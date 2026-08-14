import mongoose from "mongoose";
import { Product } from "../models/atanu.product.model.js";
import { Category } from "../models/atanu.category.model.js";
import { HomepageSection } from "../models/homepageSection.model.js";

// Map product section flags to the corresponding homepage section keys.
const FLAG_TO_SECTION = {
    featured: "featured",
    new_arrival: "new_arrivals",
    trending: "trending",
    best_seller: "best_sellers",
    top_pick: "top_picks",
};

/**
 * Keep the HomepageSection collection in sync with the product's section
 * flags. This makes the Homepage Management panel the single source of
 * truth: whenever flags change during create/update, the section membership
 * documents are created/removed accordingly.
 */
const syncHomepageSections = async (productId, flags) => {
    if (!productId) return;
    const productObjectId =
        typeof productId === "string" ? new mongoose.Types.ObjectId(productId) : productId;

    const operations = [];
    for (const [flag, section] of Object.entries(FLAG_TO_SECTION)) {
        const enabled = Boolean(flags?.[flag]);
        if (enabled) {
            const existing = await HomepageSection.findOne({
                section,
                product: productObjectId,
            });
            if (!existing) {
                const maxOrder = await HomepageSection.findOne({ section })
                    .sort({ order: -1 })
                    .select("order");
                const nextOrder = (maxOrder?.order ?? -1) + 1;
                operations.push(
                    HomepageSection.create({
                        section,
                        product: productObjectId,
                        order: nextOrder,
                    })
                );
            }
        } else {
            operations.push(
                HomepageSection.deleteOne({
                    section,
                    product: productObjectId,
                })
            );
        }
    }

    await Promise.all(operations);
};

/**
 * Normalize an incoming variants array: compute selling_price for every
 * variant and provide sensible defaults for all supported fields.
 */
const normalizeVariants = (variants) => {
    if (!Array.isArray(variants)) return variants;
    return variants
        .filter((v) => v && (v.size || v.potency))
        .map((v) => {
            const mrp = Number(v?.mrp_price) || 0;
            const discount = Math.max(0, Math.min(100, Number(v?.discount_percent) || 0));
            return {
                size: v?.size || "",
                potency: v?.potency || "",
                mrp_price: mrp,
                discount_percent: discount,
                selling_price: Math.max(0, mrp - (mrp * discount) / 100),
                min_order_qty: Math.max(1, Number(v?.min_order_qty) || 1),
                stock: Number(v?.stock) || 0,
                expiry_date: v?.expiry_date || "",
                rating: Number(v?.rating) || 0,
                review_count: Number(v?.review_count) || 0,
                out_of_stock: Boolean(v?.out_of_stock),
                not_available: Boolean(v?.not_available),
            };
        });
};

const normalizeImages = (value) => {
    if (!Array.isArray(value)) return value;
    return value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean);
};

const normalizeSpecifications = (value) => {
    if (!Array.isArray(value)) return value;
    return value
        .map((s) =>
            s && typeof s === "object"
                ? { label: String(s.label || "").trim(), value: String(s.value || "").trim() }
                : null
        )
        .filter((s) => s && (s.label || s.value));
};

const normalizeProductPayload = (body = {}) => {
    const payload = {};
    const allowedFields = [
        "product_name",
        "product_image",
        "images",
        "brand",
        "short_description",
        "detailed_description",
        "category",
        "medicine_type",
        "mrp_price",
        "discount_price",
        "stock",
        "variants",
        "featured",
        "new_arrival",
        "trending",
        "best_seller",
        "top_pick",
        "averageRating",
        "totalReviews",
        "specifications",
    ];

    for (const [key, value] of Object.entries(body)) {
        if (allowedFields.includes(key)) payload[key] = value;
    }

    if (payload.product_image !== undefined && typeof payload.product_image === "string") {
        payload.product_image = payload.product_image.trim();
    }

    if (payload.images !== undefined) {
        payload.images = normalizeImages(payload.images);
    }

    // The first image automatically becomes the primary product image.
    if (Array.isArray(payload.images) && payload.images.length > 0) {
        payload.product_image = payload.images[0];
    }

    if (payload.specifications !== undefined) {
        payload.specifications = normalizeSpecifications(payload.specifications);
    }

    if (payload.variants !== undefined) {
        payload.variants = normalizeVariants(payload.variants);
    }

    if (payload.variants && payload.variants.length > 0) {
        const firstVariant = payload.variants[0];
        const firstMrp = Number(firstVariant?.mrp_price) || 0;
        const firstSellingPrice = Number(firstVariant?.selling_price) || 0;
        const firstStock = Number(firstVariant?.stock) || 0;

        if (payload.mrp_price === undefined) payload.mrp_price = firstMrp;
        if (payload.discount_price === undefined) payload.discount_price = firstSellingPrice;
        if (payload.stock === undefined) payload.stock = firstStock;
    }

    return payload;
};


export const getAllProducts = async (req, res) => {
    try {
        const { section, discount, category, q, query: searchQuery, limit } = req.query;
        const filter = {};

        // Homepage section flags (Featured, New Arrivals, Trending, Best Sellers, Top Picks)
        if (section && typeof section === "string") {
            const normalizedSec = section.trim().toLowerCase().replace(/-/g, "_");
            const flags = {
                featured: "featured",
                new_arrivals: "new_arrival",
                new_arrival: "new_arrival",
                trending: "trending",
                best_sellers: "best_seller",
                best_seller: "best_seller",
                top_picks: "top_pick",
                top_pick: "top_pick",
            };
            const field = flags[normalizedSec];
            if (field) filter[field] = true;
        }

        // Automatic discount collections (20% OFF, 30% OFF, 50% OFF, 70% OFF)
        if (discount && typeof discount === "string") {
            const pct = Number(discount.replace(/[^0-9.]/g, "")) || 0;
            const target = { 20: 20, 30: 30, 50: 50, 70: 70 }[pct];
            if (target) {
                filter.$or = [
                    { "variants.discount_percent": { $gte: target - 5, $lte: target + 5 } },
                    {
                        $expr: {
                            $and: [
                                { $gt: ["$mrp_price", 0] },
                                { $gt: ["$discount_price", 0] },
                                {
                                    $gte: [
                                        {
                                            $multiply: [
                                                {
                                                    $divide: [
                                                        { $subtract: ["$mrp_price", "$discount_price"] },
                                                        "$mrp_price",
                                                    ],
                                                },
                                                100,
                                            ],
                                        },
                                        target - 5,
                                    ],
                                },
                                {
                                    $lte: [
                                        {
                                            $multiply: [
                                                {
                                                    $divide: [
                                                        { $subtract: ["$mrp_price", "$discount_price"] },
                                                        "$mrp_price",
                                                    ],
                                                },
                                                100,
                                            ],
                                        },
                                        target + 5,
                                    ],
                                },
                            ],
                        },
                    },
                ];
            }
        }

        // Category filter: handle ObjectId, slug, or category_name
        if (category && typeof category === "string" && category.trim() !== "" && category.toLowerCase() !== "all") {
            const rawCat = category.trim();
            if (mongoose.Types.ObjectId.isValid(rawCat) && rawCat.length === 24) {
                filter.category = new mongoose.Types.ObjectId(rawCat);
            } else {
                const words = rawCat.replace(/-/g, " ");
                const catDoc = await Category.findOne({
                    $or: [
                        { category_name: new RegExp(`^${rawCat}$`, "i") },
                        { category_name: new RegExp(`^${words}$`, "i") },
                    ],
                });
                if (catDoc) {
                    filter.category = catDoc._id;
                } else {
                    filter.category = null;
                }
            }
        }

        // Search text filter
        const searchTerm = (q || searchQuery || "").trim();
        if (searchTerm) {
            const rx = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
            filter.$and = filter.$and || [];
            filter.$and.push({
                $or: [
                    { product_name: rx },
                    { brand: rx },
                    { short_description: rx },
                    { detailed_description: rx },
                ],
            });
        }

        let queryBuilder = Product.find(filter).populate("category");

        if (limit) {
            const lim = Number(limit);
            if (Number.isFinite(lim) && lim > 0) queryBuilder = queryBuilder.limit(lim);
        }

        const products = await queryBuilder;

        res.status(200).json({
            success: true,
            count: products.length,
            products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


export const getProductById = async (req, res) => {
    try {

        const { id } = req.params;

        const product = await Product.findById(id).populate("category");

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const createProduct = async (req, res) => {
    try {

        const productData = normalizeProductPayload(req.body);

        if (
            !productData.product_name ||
            !productData.product_image ||
            !productData.brand ||
            !productData.short_description ||
            !productData.detailed_description ||
            !productData.category
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory"
            });
        }

const product = await Product.create(productData);

        await syncHomepageSections(product._id, product);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const updateProduct = async (req, res) => {
    try {

        const { id } = req.params;

        const updateData = normalizeProductPayload(req.body);

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        ).populate("category");

if (!updatedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await syncHomepageSections(updatedProduct._id, updatedProduct);

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const deleteProduct = async (req, res) => {
    try {

        const { id } = req.params;

        const deletedProduct = await Product.findByIdAndDelete(id);

if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        await HomepageSection.deleteMany({ product: deletedProduct._id });

        res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};