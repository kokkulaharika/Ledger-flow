import express from "express";
import {
  createSupplier,
  getSuppliers,
} from "../controllers/suppliercontroller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createSupplier);
router.get("/", authMiddleware, getSuppliers);

export default router;