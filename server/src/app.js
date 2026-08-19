import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import saleRoutes from "./routes/salesroute.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import purchaseRoutes from "./routes/purchaseRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get("/", (req, res) => {
  res.send("LedgerFlow Billing & Inventory SaaS API is running...");
});

// Authentication Routes
app.use("/api/auth", authRoutes);

// Product Routes
app.use("/api/products", productRoutes);

// sales routes
app.use("/api/sales", saleRoutes);

// suppliers routes
app.use("/api/suppliers", supplierRoutes);

// purchases routes
app.use("/api/purchases", purchaseRoutes);

// customer routes
app.use("/api/customers", customerRoutes);

// Invoice routes
app.use("/api/invoices", invoiceRoutes);

// business expenses routes
app.use("/api/expenses", expenseRoutes);

// Financial business Report Routes
// Handles Profit & Loss and other financial analysis APIs
app.use("/api/reports", reportRoutes);

// Dashboard & Analytics Routes
// Provides an overall business summary for the dashboard
app.use("/api/dashboard", dashboardRoutes);

// Handle Invalid Routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

export default app;