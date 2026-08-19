import Supplier from "../models/supplier.js";

// Create Supplier
export const createSupplier = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Supplier name and phone are required.",
      });
    }

    const supplier = await Supplier.create({
      name,
      phone,
      email,
      address,

      // Store logged-in user
      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully.",
      supplier,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create supplier.",
      error: error.message,
    });
  }
};

// Get All Suppliers belonging to logged-in user
export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      createdBy: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch suppliers.",
      error: error.message,
    });
  }
};