import express from "express";

import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  recordPayment,
} from "../controllers/invoicecontroller.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create invoice
router.post("/", authMiddleware, createInvoice);

// Record payment
router.post("/:id/payment", authMiddleware, recordPayment);

// Get all invoices
router.get("/", authMiddleware, getInvoices);

// Get invoice by ID
router.get("/:id", authMiddleware, getInvoiceById);

// Update invoice
router.put("/:id", authMiddleware, updateInvoice);

// Delete invoice
router.delete("/:id", authMiddleware, deleteInvoice);

export default router;