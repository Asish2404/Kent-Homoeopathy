import express from "express";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

import {
  createInventoryBatch,
  getInventories,
  getInventoryById,
  updateInventoryBatch,
  addStock,
  removeStock,
  blockInventory,
  unblockInventory,
  deleteInventory,
} from "../controllers/inventory.controller.js";

const router = express.Router();

router.post("/", verifyJWT, isAdmin, createInventoryBatch);

router.get("/", verifyJWT, isAdmin, getInventories);

router.get("/:inventoryId", verifyJWT, isAdmin, getInventoryById);

router.patch("/:inventoryId", verifyJWT, isAdmin, updateInventoryBatch);

router.patch("/:inventoryId/add-stock", verifyJWT, isAdmin, addStock);

router.patch("/:inventoryId/remove-stock", verifyJWT, isAdmin, removeStock);

router.patch("/:inventoryId/block", verifyJWT, isAdmin, blockInventory);

router.patch("/:inventoryId/unblock", verifyJWT, isAdmin, unblockInventory);

router.delete("/:inventoryId", verifyJWT, isAdmin, deleteInventory);

export default router;

