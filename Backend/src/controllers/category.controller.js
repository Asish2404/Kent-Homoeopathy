import { Category } from "../models/atanu.category.model.js";

// Create Category
export const createCategory = async (req, res) => {
    try {

        const { category_name } = req.body;

        if (!category_name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const existingCategory = await Category.findOne({ category_name });

        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category already exists"
            });
        }

        const category = await Category.create({
            category_name
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

export const updateCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { category_name } = req.body;

        if (!category_name) {
            return res.status(400).json({
                success: false,
                message: "Category name is required"
            });
        }

        const existingCategory = await Category.findOne({ category_name, _id: { $ne: categoryId } });
        if (existingCategory) {
            return res.status(409).json({
                success: false,
                message: "Category name already exists"
            });
        }

        const category = await Category.findByIdAndUpdate(
            categoryId,
            { category_name },
            { new: true }
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
        const { categoryId } = req.params;

        const category = await Category.findByIdAndDelete(categoryId);

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
