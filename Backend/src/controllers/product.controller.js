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
            category
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
        const product = await Product.create({
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
            category
        });

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