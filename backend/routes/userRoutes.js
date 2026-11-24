
const express = require("express");
const crypto = require("crypto");
const User = require("../models/User");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// USER REGISTRATION
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters."
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists."
      });
    }

    // Public registration always creates a normal user.
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "user"
    });

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed.",
      error: error.message
    });
  }
});

// USER AND ADMIN LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password."
      });
    }

    // Generate a random authentication token.
    const token = crypto.randomBytes(32).toString("hex");

    // Store only the token hash in MongoDB.
    user.authTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Token expires after 7 days.
    user.authTokenExpiresAt = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Login failed.",
      error: error.message
    });
  }
});

// GET LOGGED-IN USER PROFILE
router.get("/profile", authMiddleware, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// LOGOUT
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    req.user.authTokenHash = null;
    req.user.authTokenExpiresAt = null;

    await req.user.save();

    res.status(200).json({
      success: true,
      message: "Logged out successfully."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout failed."
    });
  }
});

module.exports = router;
