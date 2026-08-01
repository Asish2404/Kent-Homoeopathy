import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/atanu.user.model.js";

// ====================== REGISTER ======================

export const registerUser = async (req, res) => {
    try {

        const {
            user_name,
            email,
            password,
            phone,
            address
        } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already exists"
            });
        }

        // Create user
        const user = await User.create({
            user_name,
            email,
            password,
            phone,
            address
        });

        res.status(201).json({
            message: "User Created",
            user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

// ====================== LOGIN ======================

export const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Compare password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        // Generate JWT Token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Strip password from response
        const { password: _, ...userWithoutPassword } = user.toObject();

        res.status(200).json({
            message: "Login Successful",
            token,
            user: userWithoutPassword
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

// ====================== PROFILE ======================

export const getProfile = async (req, res) => {

    res.status(200).json({
        message: "Profile fetched successfully",
        user: req.user
    });

};

// ====================== ADMIN GET ALL USERS ======================

export const getAllUsers = async (req, res) => {
    try {
        const page = Math.max(1, Number(req.query.page) || 1);
        const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const search = (req.query.search || req.query.q || "").toString().trim();

        const filter = {};
        if (search) {
            const regex = new RegExp(search, "i");
            filter.$or = [
                { user_name: regex },
                { email: regex },
                { phone: regex },
            ];
        }

        const [users, totalCount] = await Promise.all([
            User.find(filter)
                .select("-password")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filter),
        ]);

        return res.status(200).json({
            success: true,
            users,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                totalCount,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch users",
        });
    }
};
