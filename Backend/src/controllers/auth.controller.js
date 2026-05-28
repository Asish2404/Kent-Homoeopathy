import bcrypt from "bcryptjs";
import { User } from "../models/atanu.user.model.js";

export const registerUser = async (req, res) => {

    try {

        const {
            user_name,
            email,
            password,
            phone,
            address
        } = req.body;

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

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        )
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        res.status(200).json({
            message: "Login Succesful",
            user
        })
    } catch (error) {
        res.staus(500).json({
            message: error.message
        });
    }
};