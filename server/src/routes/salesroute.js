import express from "express";
import {
    createSale,
    getAllSales,
    getSaleById } from "../controllers/salecontroller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createSale);

router.get("/", authMiddleware, getAllSales);

router.get("/:id", authMiddleware, getSaleById);

export default router;