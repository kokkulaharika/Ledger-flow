import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addStock,
  removeStock,
   getLowStockProducts,
} from "../controllers/productcontrollers.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createProduct);

router.get("/", authMiddleware, getProducts);

router.get("/low-stock", authMiddleware, getLowStockProducts);

router.get("/:id", authMiddleware, getProductById);

router.put("/:id", authMiddleware, updateProduct);

router.delete("/:id", authMiddleware, deleteProduct);

router.post("/:id/stock", authMiddleware, addStock);

router.delete("/:id/stock", authMiddleware, removeStock);


export default router;