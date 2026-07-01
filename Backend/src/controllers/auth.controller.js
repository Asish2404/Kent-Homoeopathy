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

        res.status(200).json({
            message: "Login Successful",
            token,
            user
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