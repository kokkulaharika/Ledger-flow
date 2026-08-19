import mongoose from "mongoose";
import Purchase from "../models/purchase.js";
import Product from "../models/product.js";
import Supplier from "../models/supplier.js";

// Create Purchase with transaction
export const createPurchase = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { supplier, products } = req.body;

    if (!supplier || !products || products.length === 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Supplier and products are required.",
      });
    }

    // Check supplier belongs to logged-in user
    const supplierExists = await Supplier.findOne({
      _id: supplier,
      createdBy: req.user._id,
    }).session(session);

    if (!supplierExists) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    let totalAmount = 0;
    const purchaseProducts = [];

    for (const item of products) {
      // Check product belongs to logged-in user
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

      // Validate quantity
      if (!item.quantity || item.quantity <= 0) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Product quantity must be greater than 0.",
        });
      }

      // Validate cost price
      if (item.costPrice === undefined || item.costPrice < 0) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Valid cost price is required.",
        });
      }

      const subtotal = item.costPrice * item.quantity;

      totalAmount += subtotal;

      purchaseProducts.push({
        product: product._id,
        quantity: item.quantity,
        costPrice: item.costPrice,
        subtotal,
      });

      // Increase inventory inside transaction
      product.quantity += item.quantity;

      await product.save({ session });
    }

    // Create purchase inside the same transaction
    const purchase = await Purchase.create(
      [
        {
          supplier,
          products: purchaseProducts,
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
      message: "Purchase created successfully.",
      purchase: purchase[0],
    });
  } catch (error) {
    // Rollback all changes
    await session.abortTransaction();

    return res.status(500).json({
      success: false,
      message: "Failed to create purchase. Transaction rolled back.",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

// Get Purchases belonging to logged-in user
export const getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      createdBy: req.user._id,
    })
      .populate("supplier", "name phone email")
      .populate("products.product", "name sku")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      purchases,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch purchases.",
      error: error.message,
    });
  }
};


// Update Purchase
export const updatePurchase = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const { supplier, products } = req.body;

    if (!supplier || !products || products.length === 0) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Supplier and products are required.",
      });
    }

    // Find purchase belonging to logged-in user
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).session(session);

    if (!purchase) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Purchase not found.",
      });
    }

    // Check supplier belongs to logged-in user
    const supplierExists = await Supplier.findOne({
      _id: supplier,
      createdBy: req.user._id,
    }).session(session);

    if (!supplierExists) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    let totalAmount = 0;
    const updatedProducts = [];

    // Restore old inventory first
    for (const oldItem of purchase.products) {
      const product = await Product.findOne({
        _id: oldItem.product,
        createdBy: req.user._id,
      }).session(session);

      if (!product) {
        throw new Error(`Product not found: ${oldItem.product}`);
      }

      product.quantity -= oldItem.quantity;

      await product.save({ session });
    }

    // Add new inventory
    for (const item of products) {
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

      if (!item.quantity || item.quantity <= 0) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Product quantity must be greater than 0.",
        });
      }

      if (item.costPrice === undefined || item.costPrice < 0) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: "Valid cost price is required.",
        });
      }

      const subtotal = item.costPrice * item.quantity;

      totalAmount += subtotal;

      updatedProducts.push({
        product: product._id,
        quantity: item.quantity,
        costPrice: item.costPrice,
        subtotal,
      });

      product.quantity += item.quantity;

      await product.save({ session });
    }

    // Update purchase
    purchase.supplier = supplier;
    purchase.products = updatedProducts;
    purchase.totalAmount = totalAmount;

    await purchase.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Purchase updated successfully.",
      purchase,
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(500).json({
      success: false,
      message: "Failed to update purchase. Transaction rolled back.",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};


// Delete Purchase
export const deletePurchase = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Find purchase belonging to logged-in user
    const purchase = await Purchase.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).session(session);

    if (!purchase) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Purchase not found.",
      });
    }

    // Remove purchased quantities from inventory
    for (const item of purchase.products) {
      const product = await Product.findOne({
        _id: item.product,
        createdBy: req.user._id,
      }).session(session);

      if (!product) {
        throw new Error(`Product not found: ${item.product}`);
      }

      // Reduce inventory
      product.quantity -= item.quantity;

      // Prevent negative stock
      if (product.quantity < 0) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message: `Cannot delete purchase. Stock for product ${product.name} would become negative.`,
        });
      }

      await product.save({ session });
    }

    // Delete purchase
    await Purchase.deleteOne({
      _id: purchase._id,
    }).session(session);

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: "Purchase deleted successfully.",
    });
  } catch (error) {
    await session.abortTransaction();

    return res.status(500).json({
      success: false,
      message: "Failed to delete purchase. Transaction rolled back.",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};