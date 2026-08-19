import express from "express";

import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customercontroller.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create customer
router.post("/", authMiddleware, createCustomer);

// Get all customers
router.get("/", authMiddleware, getCustomers);

// Get customer by ID
router.get("/:id", authMiddleware, getCustomerById);

// Update customer
router.put("/:id", authMiddleware, updateCustomer);

// Delete customer
router.delete("/:id", authMiddleware, deleteCustomer);

export default router;