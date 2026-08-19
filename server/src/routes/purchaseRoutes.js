import express from "express";
import {
  createPurchase,
  getPurchases,
  updatePurchase,
  deletePurchase
} from "../controllers/purchasecontroller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createPurchase);

router.get("/", authMiddleware, getPurchases);

router.put("/:id", authMiddleware, updatePurchase);

router.delete("/:id", authMiddleware, deletePurchase);

export default router;