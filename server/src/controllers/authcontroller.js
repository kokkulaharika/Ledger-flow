import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      businessName,
      businessType,
      email,
      password,
    } = req.body;

    // Check if all required fields are provided
    if (
      !fullName ||
      !businessName ||
      !businessType ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      businessName,
      businessType,
      email,
      password,
    });

    // Generate JWT
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        businessName: user.businessName,
        businessType: user.businessType,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user (include password because select: false)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        businessName: user.businessName,
        businessType: user.businessType,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const ownerDashboard = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the owner dashboard",
    user: req.user,
  });
};


// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const {
      fullName,
      businessName,
      businessType,
      email,
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check if email is already used by another user
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered with another account.",
        });
      }

      user.email = email.toLowerCase();
    }

    if (fullName) {
      user.fullName = fullName;
    }

    if (businessName) {
      user.businessName = businessName;
    }

    if (businessType) {
      user.businessType = businessType;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedUser._id,
        fullName: updatedUser.fullName,
        businessName: updatedUser.businessName,
        businessType: updatedUser.businessType,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all password fields.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password.",
      });
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};