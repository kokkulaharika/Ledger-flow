import express from "express";

import {
  getDashboard,
} from "../controllers/dashboardcontroller.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Dashboard Business Summary
// Provides user-specific sales, revenue, purchases,
// expenses, profit/loss, customers, products,
// and low-stock information
router.get("/", authMiddleware, getDashboard);

export default router;