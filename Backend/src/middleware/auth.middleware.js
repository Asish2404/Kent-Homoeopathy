import jwt from "jsonwebtoken";
import { User } from "../models/atanu.user.model.js";

export const verifyJWT = async (req, res, next) => {
    try {
        const authHeader = req.header("Authorization");

        if (!authHeader) {
            return res.status(401).json({
                message: "Access Denied. No Token Provided."
            });
        }

        // Extract token from "Bearer <token>" or accept raw token
        let token = authHeader;
        if (authHeader.startsWith("Bearer ")) {
            token = authHeader.slice(7).trim();
        }

        if (!token) {
            return res.status(401).json({
                message: "Access Denied. Invalid Token Format."
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
