import { Product } from "../models/atanu.product.model.js";


export const getAllProducts = async (req, res) => {
    try {

        const products = await Product.find().populate("category");

        res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
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

        const {
            product_name,
            product_image,
            brand,
            short_description,
            detailed_description,
            quantity,
            pack,
            mrp_price,
            discount_price,
            stock,
            category,
            // New optional fields
            variants,
            benefits,
            ingredients,
            usage,
            dosage,
            latin_name,
            extra_images,
            rating,
            review_count,
            side_effects,
            precautions,
            storage_instructions,
            manufacturer_info,
            country_of_origin,
            shelf_life,
            suitable_age_group,
prescription_required,
            potency,
            faq,
            isKentProduct,
            // ===== Advanced Premium Product Fields =====
            medicine_type,
            sku,
            barcode,
            hsn_code,
            tags,
            net_quantity,
            weight,
            composition,
            gst,
            gst_included,
            profit_margin,
            potencies,
            how_it_works,
            uses,
            warnings,
            contraindications,
            drug_interactions,
            expiry,
            license_number,
            pack_contents,
            min_stock,
            max_stock,
            low_stock_alert,
            out_of_stock,
            availability,
            warehouse,
            thumbnail_images,
            gallery_images,
            zoom_image,
            seo_title,
            seo_description,
            seo_keywords,
            slug,
            canonical_url,
            og_image,
            featured,
            best_seller,
            trending,
            recommended,
            new_arrival,
            home_page,
            hide_product,
            draft,
            sold_count
        } = req.body;

        // Validation
        if (
            !product_name ||
            !product_image ||
            !brand ||
            !short_description ||
            !detailed_description ||
            !mrp_price ||
            !discount_price ||
            !category
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields are mandatory"
            });
        }

        // Create Product
        const productData = {
            product_name,
            product_image,
            brand,
            short_description,
            detailed_description,
            quantity,
            pack,
            mrp_price,
            discount_price,
            stock,
            category,
            isKentProduct: isKentProduct || false,
        };

        // Only add optional fields if they are provided
        if (variants !== undefined) productData.variants = variants;
        if (benefits !== undefined) productData.benefits = benefits;
        if (ingredients !== undefined) productData.ingredients = ingredients;
        if (usage !== undefined) productData.usage = usage;
        if (dosage !== undefined) productData.dosage = dosage;
        if (latin_name !== undefined) productData.latin_name = latin_name;
        if (extra_images !== undefined) productData.extra_images = extra_images;
        if (rating !== undefined) productData.rating = rating;
        if (review_count !== undefined) productData.review_count = review_count;
        if (side_effects !== undefined) productData.side_effects = side_effects;
        if (precautions !== undefined) productData.precautions = precautions;
        if (storage_instructions !== undefined) productData.storage_instructions = storage_instructions;
        if (manufacturer_info !== undefined) productData.manufacturer_info = manufacturer_info;
        if (country_of_origin !== undefined) productData.country_of_origin = country_of_origin;
        if (shelf_life !== undefined) productData.shelf_life = shelf_life;
        if (suitable_age_group !== undefined) productData.suitable_age_group = suitable_age_group;
        if (prescription_required !== undefined) productData.prescription_required = prescription_required;
if (potency !== undefined) productData.potency = potency;
        if (faq !== undefined) productData.faq = faq;

        // ===== Advanced Premium Product Fields =====
        if (medicine_type !== undefined) productData.medicine_type = medicine_type;
        if (sku !== undefined) productData.sku = sku;
        if (barcode !== undefined) productData.barcode = barcode;
        if (hsn_code !== undefined) productData.hsn_code = hsn_code;
        if (tags !== undefined) productData.tags = tags;
        if (net_quantity !== undefined) productData.net_quantity = net_quantity;
        if (weight !== undefined) productData.weight = weight;
        if (composition !== undefined) productData.composition = composition;
        if (gst !== undefined) productData.gst = gst;
        if (gst_included !== undefined) productData.gst_included = gst_included;
        if (profit_margin !== undefined) productData.profit_margin = profit_margin;
        if (potencies !== undefined) productData.potencies = potencies;
        if (how_it_works !== undefined) productData.how_it_works = how_it_works;
        if (uses !== undefined) productData.uses = uses;
        if (warnings !== undefined) productData.warnings = warnings;
        if (contraindications !== undefined) productData.contraindications = contraindications;
        if (drug_interactions !== undefined) productData.drug_interactions = drug_interactions;
        if (expiry !== undefined) productData.expiry = expiry;
        if (license_number !== undefined) productData.license_number = license_number;
        if (pack_contents !== undefined) productData.pack_contents = pack_contents;
        if (min_stock !== undefined) productData.min_stock = min_stock;
        if (max_stock !== undefined) productData.max_stock = max_stock;
        if (low_stock_alert !== undefined) productData.low_stock_alert = low_stock_alert;
        if (out_of_stock !== undefined) productData.out_of_stock = out_of_stock;
        if (availability !== undefined) productData.availability = availability;
        if (warehouse !== undefined) productData.warehouse = warehouse;
        if (thumbnail_images !== undefined) productData.thumbnail_images = thumbnail_images;
        if (gallery_images !== undefined) productData.gallery_images = gallery_images;
        if (zoom_image !== undefined) productData.zoom_image = zoom_image;
        if (seo_title !== undefined) productData.seo_title = seo_title;
        if (seo_description !== undefined) productData.seo_description = seo_description;
        if (seo_keywords !== undefined) productData.seo_keywords = seo_keywords;
        if (slug !== undefined) productData.slug = slug;
        if (canonical_url !== undefined) productData.canonical_url = canonical_url;
        if (og_image !== undefined) productData.og_image = og_image;
        if (featured !== undefined) productData.featured = featured;
        if (best_seller !== undefined) productData.best_seller = best_seller;
        if (trending !== undefined) productData.trending = trending;
        if (recommended !== undefined) productData.recommended = recommended;
        if (new_arrival !== undefined) productData.new_arrival = new_arrival;
        if (home_page !== undefined) productData.home_page = home_page;
        if (hide_product !== undefined) productData.hide_product = hide_product;
        if (draft !== undefined) productData.draft = draft;
        if (sold_count !== undefined) productData.sold_count = sold_count;

        const product = await Product.create(productData);

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

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            req.body,
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