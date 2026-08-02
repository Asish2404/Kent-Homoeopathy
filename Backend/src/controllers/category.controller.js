import { Category } from "../models/atanu.category.model.js";

// Create Category
export const createCategory = async (req, res) => {
    try {

        const { category_name } = req.body;
        const normalizedName = typeof category_name === "string" ? category_name.trim() : "";

        if (!normalizedName) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const existingCategory = await Category.findOne({ category_name: normalizedName });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }

        const category = await Category.create({
            category_name: normalizedName
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const updateCategory = async (req, res) => {
    try {

        const { id } = req.params;
        const { category_name } = req.body;
        const normalizedName = typeof category_name === "string" ? category_name.trim() : "";

        if (!normalizedName) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const existingCategory = await Category.findOne({
            category_name: normalizedName,
            _id: { $ne: id }
        });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }

        const category = await Category.findByIdAndUpdate(
            id,
            { category_name: normalizedName },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const deleteCategory = async (req, res) => {
    try {

        const { id } = req.params;

        const category = await Category.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

export const getAllCategories = async (req, res) => {
    try {

        const categories = await Category.find();

        res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};