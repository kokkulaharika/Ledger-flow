import mongoose from "mongoose";
import Sale from "../models/sales.js";
import Product from "../models/product.js";


// creating sales with transaction
export const createSale = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { customerName, products } = req.body;

    if (!customerName || !products || products.length === 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Customer name and products are required.",
      });
    }

    let totalAmount = 0;
    const saleProducts = [];

    for (const item of products) {
      // Find product belonging to logged-in user
      const product = await Product.findOne({
        _id: item.product,
        createdBy: req.user._id,
      }).session(session);

      if (!product) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      // Check stock
      if (product.quantity < item.quantity) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`,
        });
      }

      const subtotal = product.price * item.quantity;

      totalAmount += subtotal;

      saleProducts.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });

      // Reduce inventory inside transaction
      product.quantity -= item.quantity;

      await product.save({ session });
    }

    // Create sale inside the same transaction
    const sale = await Sale.create(
      [
        {
          customerName,
          products: saleProducts,
          totalAmount,
          createdBy: req.user._id,
        },
      ],
      { session }
    );

    // Commit transaction
    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Sale created successfully.",
      sale: sale[0],
    });
  } catch (error) {
    // Rollback all changes
    await session.abortTransaction();

    return res.status(500).json({
      success: false,
      message: "Failed to create sale. Transaction rolled back.",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};


export const getAllSales = async (req, res) => {
  try {
    // Fetch only sales belonging to logged-in user
    const sales = await Sale.find({
      createdBy: req.user._id,
    })
      .populate("products.product", "name sku")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sales.length,
      sales,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sales.",
      error: error.message,
    });
  }
};


// Get sale by ID
export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find sale only if it belongs to logged-in user
    const sale = await Sale.findOne({
      _id: id,
      createdBy: req.user._id,
    }).populate("products.product", "name sku");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found.",
      });
    }

    return res.status(200).json({
      success: true,
      sale,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch sale.",
      error: error.message,
    });
  }
};