import express from "express";
import {
    createSale,
    getAllSales,
    getSaleById,
    updateSale,
    deleteSale,
} from "../controllers/salecontroller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createSale);

router.get("/", authMiddleware, getAllSales);

router.get("/:id", authMiddleware, getSaleById);

router.put("/:id", authMiddleware, updateSale);
router.delete("/:id", authMiddleware, deleteSale);

export default router;