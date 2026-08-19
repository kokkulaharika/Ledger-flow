import Sale from "../models/sales.js";
import Expense from "../models/expense.js";
import Purchase from "../models/purchase.js";
import Customer from "../models/customer.js";
import Product from "../models/product.js";

// Get Dashboard Business Summary
export const getDashboard = async (req, res) => {
  try {
    // Get start and end dates from query parameters
    const { startDate, endDate } = req.query;

    // Logged-in user's ID
    const userId = req.user._id;

    // User-specific filters
    const saleFilter = {
      createdBy: userId,
    };

    const expenseFilter = {
      createdBy: userId,
    };

    const purchaseFilter = {
      createdBy: userId,
    };

    const customerFilter = {
      createdBy: userId,
    };

    const productFilter = {
      createdBy: userId,
    };

    // Apply start date
    if (startDate) {
      const start = new Date(startDate);

      saleFilter.createdAt = {
        ...saleFilter.createdAt,
        $gte: start,
      };

      expenseFilter.date = {
        ...expenseFilter.date,
        $gte: start,
      };

      purchaseFilter.createdAt = {
        ...purchaseFilter.createdAt,
        $gte: start,
      };
    }

    // Apply end date
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      saleFilter.createdAt = {
        ...saleFilter.createdAt,
        $lte: end,
      };

      expenseFilter.date = {
        ...expenseFilter.date,
        $lte: end,
      };

      purchaseFilter.createdAt = {
        ...purchaseFilter.createdAt,
        $lte: end,
      };
    }

    // Get user's sales
    const sales = await Sale.find(saleFilter).populate("products.product");

    // Get user's expenses
    const expenses = await Expense.find(expenseFilter);

    // Get user's purchases
    const purchases = await Purchase.find(purchaseFilter);

    // Get user's customers and products
    const totalCustomers = await Customer.countDocuments(customerFilter);
    const totalProducts = await Product.countDocuments(productFilter);

    // Calculate total revenue and product cost
    let totalRevenue = 0;
    let totalCost = 0;

    sales.forEach((sale) => {
      // Add sale amount to total revenue
      totalRevenue += sale.totalAmount;

      // Calculate cost of products sold
      sale.products.forEach((item) => {
        if (item.product) {
          totalCost += item.product.costPrice * item.quantity;
        }
      });
    });

    // Calculate total expenses
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    // Calculate total purchases
    const totalPurchases = purchases.reduce(
      (sum, purchase) => sum + purchase.totalAmount,
      0
    );

    // Calculate gross profit
    const grossProfit = totalRevenue - totalCost;

    // Calculate final profit/loss
    const netResult = grossProfit - totalExpenses;

    const profit = netResult > 0 ? netResult : 0;
    const loss = netResult < 0 ? Math.abs(netResult) : 0;

    // Count user's low-stock products
    const lowStockProducts = await Product.countDocuments({
      ...productFilter,
      $expr: {
        $lte: ["$quantity", "$lowStockThreshold"],
      },
    });

    // Send dashboard response
    res.status(200).json({
      success: true,
      dashboard: {
        totalSales: sales.length,
        totalRevenue,
        totalCost,
        grossProfit,
        totalPurchases,
        totalExpenses,
        profit,
        loss,
        totalCustomers,
        totalProducts,
        lowStockProducts,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};