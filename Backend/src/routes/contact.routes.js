import express from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

import {
    createContact,
    getContacts,
    updateContact,
    deleteContact,
} from "../controllers/contact.controller.js";

const router = express.Router();

// Public: submit a contact / support inquiry (guest or logged-in user).
router.post("/", createContact);

// Admin-only management endpoints.
router.get("/", verifyJWT, isAdmin, getContacts);
router.patch("/:contactId", verifyJWT, isAdmin, updateContact);
router.delete("/:contactId", verifyJWT, isAdmin, deleteContact);

export default router;
