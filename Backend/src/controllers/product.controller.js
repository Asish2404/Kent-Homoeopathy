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
            isKentProduct
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