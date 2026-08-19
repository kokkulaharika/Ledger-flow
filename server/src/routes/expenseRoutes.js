import express from "express";

import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expenseController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Expense
router.post("/", authMiddleware, createExpense);

// Get All Expenses
router.get("/", authMiddleware, getExpenses);

// Get Expense By ID
router.get("/:id", authMiddleware, getExpenseById);

// Update Expense
router.put("/:id", authMiddleware, updateExpense);

// Delete Expense
router.delete("/:id", authMiddleware, deleteExpense);

export default router;