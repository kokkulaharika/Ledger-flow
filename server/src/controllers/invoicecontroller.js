import Invoice from "../models/invoice.js";
import Customer from "../models/customer.js";
import Product from "../models/product.js";

// Create invoice
export const createInvoice = async (req, res) => {
  try {
    const invoiceData = {
      ...req.body,
      createdBy: req.user._id,
    };
    // Make sure customer belongs to logged-in user
    const customer = await Customer.findOne({
      _id: req.body.customer,
      createdBy: req.user._id,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Make sure all products belong to logged-in user
    for (const item of req.body.items) {
      const product = await Product.findOne({
        _id: item.product,
        createdBy: req.user._id,
      });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }
    }

    const invoice = await Invoice.create(invoiceData);

    res.status(201).json({
      success: true,
      message: "Invoice created successfully",
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

 // Record payment for an invoice
export const recordPayment = async (req, res) => {
  try {
    const { amount, paymentMethod } = req.body;

    // Validate payment amount
    if (amount === undefined || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than 0",
      });
    }

    // Find invoice belonging to logged-in user
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // Calculate remaining amount
    const remainingAmount = invoice.grandTotal - invoice.paidAmount;

    // Prevent overpayment
    if (amount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment cannot exceed remaining amount of ${remainingAmount}`,
      });
    }

    // Update paid amount
    invoice.paidAmount += amount;

    // Update payment method
    if (paymentMethod !== undefined) {
      invoice.paymentMethod = paymentMethod;
    }

    // Automatically update payment status
    if (invoice.paidAmount === 0) {
      invoice.paymentStatus = "Pending";
    } else if (invoice.paidAmount < invoice.grandTotal) {
      invoice.paymentStatus = "Partially Paid";
    } else {
      invoice.paymentStatus = "Paid";
    }

    await invoice.save();

    return res.status(200).json({
      success: true,
      message: "Payment recorded successfully",
      invoice,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};




// Get all invoices
export const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({
      createdBy: req.user._id,
    })
      .populate("customer")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get invoice by ID
export const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    })
      .populate("customer")
      .populate("items.product");

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update invoice
export const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      {
        _id: req.params.id,
        createdBy: req.user._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice updated successfully",
      invoice,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete invoice
export const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Invoice deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};