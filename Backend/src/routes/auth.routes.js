import express from "express";
import {
    registerUser,
    loginUser,
    getProfile,
    getAllUsers
} from "../controllers/auth.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

router.post("/signup", registerUser);

router.post("/login", loginUser);

router.get(
    "/profile",
    verifyJWT,
    getProfile
);

router.get(
    "/users",
    verifyJWT,
    isAdmin,
    getAllUsers
);

export default router;
