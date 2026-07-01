import jwt from "jsonwebtoken";
import { User } from "../models/atanu.user.model.js";

export const verifyJWT = async (req, res, next) => {
    try {
        const token = req.header("Authorization");

        if (!token) {
            return res.status(401).json({
                message: "Access Denied. No Token Provided."
            });
        }

        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await User.findById(decodedToken.id);

        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or Expired Token"
        });
    }
};