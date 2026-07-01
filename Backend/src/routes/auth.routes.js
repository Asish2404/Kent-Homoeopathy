import express from "express";
import {
    registerUser,
    loginUser,
    getProfile
} from "../controllers/auth.controller.js";

import { verifyJWT } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", registerUser);

router.post("/login", loginUser);

router.get(
    "/profile",
    verifyJWT,
    getProfile
);

export default router;