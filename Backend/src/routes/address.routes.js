import express from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    addAddress,
    getMyAddresses,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from "../controllers/address.controller.js";

const router = express.Router();

// Add Address
router.post("/", verifyJWT, addAddress);

// Get all addresses for logged-in user
router.get("/", verifyJWT, getMyAddresses);

// Get single address
router.get("/:addressId", verifyJWT, getAddressById);

// Update address (owner only)
router.patch("/:addressId", verifyJWT, updateAddress);

// Delete address (owner only)
router.delete("/:addressId", verifyJWT, deleteAddress);

// Set default address
router.patch("/:addressId/default", verifyJWT, setDefaultAddress);

export default router;

