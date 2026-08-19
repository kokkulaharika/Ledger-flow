import express from "express";

import {
  registerUser,
  loginUser,
  getProfile,
  ownerDashboard,
} from "../controllers/authcontroller.js";

import authMiddleware from "../middleware/authMiddleware.js";
import authorizeRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get profile
router.get("/profile", authMiddleware, getProfile);

// Owner dashboard
router.get(
  "/owner-dashboard",
  authMiddleware,
  authorizeRoles("owner"),
  ownerDashboard
);

export default router;