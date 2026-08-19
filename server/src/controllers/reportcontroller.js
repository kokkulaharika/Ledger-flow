import Sale from "../models/sales.js";
import Expense from "../models/expense.js";

// Get Profit & Loss Report
export const getProfitLoss = async (req, res) => {
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
    }

    // Get only logged-in user's sales
    const sales = await Sale.find(saleFilter).populate("products.product");

    // Get only logged-in user's expenses
    const expenses = await Expense.find(expenseFilter);

    // Calculate revenue and product cost
    let totalRevenue = 0;
    let totalCost = 0;

    sales.forEach((sale) => {
      totalRevenue += sale.totalAmount;

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

    // Calculate gross profit
    const grossProfit = totalRevenue - totalCost;

    // Calculate final profit/loss
    const netResult = grossProfit - totalExpenses;

    const profit = netResult > 0 ? netResult : 0;
    const loss = netResult < 0 ? Math.abs(netResult) : 0;

    // Send response
    res.status(200).json({
      success: true,
      report: {
        totalRevenue,
        totalCost,
        grossProfit,
        totalExpenses,
        profit,
        loss,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};