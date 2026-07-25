import express from "express";
import { universalSearch } from "../controllers/search.controller.js";

const router = express.Router();

router.get("/", universalSearch);

export default router;