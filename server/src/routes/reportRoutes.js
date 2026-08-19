import express from "express";

import {
  getProfitLoss,
} from "../controllers/reportcontroller.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Profit & Loss Report
router.get("/profit-loss", authMiddleware, getProfitLoss);

export default router;