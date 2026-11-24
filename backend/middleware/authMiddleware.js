
const crypto = require("crypto");
const User = require("../models/User");

// Verify authentication token
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Please log in to continue."
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token."
      });
    }

    // Hash the token before checking MongoDB
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      authTokenHash: tokenHash,
      authTokenExpiresAt: { $gt: new Date() }
    }).select("+authTokenHash +authTokenExpiresAt");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid. Please log in again."
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("Authentication Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Authentication failed."
    });
  }
};

// Allow only Admin users
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required."
    });
  }

  next();
};

module.exports = {
  authMiddleware,
  adminMiddleware
};
