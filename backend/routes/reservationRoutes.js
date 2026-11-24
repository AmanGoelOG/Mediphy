
const express = require("express");
const mongoose = require("mongoose");

const Reservation = require("../models/Reservation");
const Inventory = require("../models/Inventory");

const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE RESERVATION
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { medicineId, pharmacyId, quantity } = req.body;

    if (!medicineId || !pharmacyId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Medicine, pharmacy and quantity are required"
      });
    }

    if (
      !mongoose.isValidObjectId(medicineId) ||
      !mongoose.isValidObjectId(pharmacyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid medicine or pharmacy ID"
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive whole number"
      });
    }

    const inventory = await Inventory.findOne({
      medicineId,
      pharmacyId
    });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Medicine is not listed at this pharmacy"
      });
    }

    if (inventory.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient listed quantity"
      });
    }

    const reservation = await Reservation.create({
      userId: req.user._id,
      medicineId,
      pharmacyId,
      quantity,
      unitPrice: inventory.price
    });

    const populatedReservation = await Reservation.findById(
      reservation._id
    )
      .populate("medicineId")
      .populate("pharmacyId");

    res.status(201).json({
      success: true,
      message: "Reservation request submitted successfully",
      reservation: populatedReservation
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create reservation",
      error: error.message
    });
  }
});

// GET LOGGED-IN USER'S RESERVATIONS
router.get("/my-reservations", authMiddleware, async (req, res) => {
  try {
    const reservations = await Reservation.find({
      userId: req.user._id
    })
      .populate("medicineId")
      .populate("pharmacyId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      reservations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch reservations",
      error: error.message
    });
  }
});

// GET ONE RESERVATION
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate("medicineId")
      .populate("pharmacyId");

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }

    res.status(200).json({
      success: true,
      reservation
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid reservation ID"
    });
  }
});

// CANCEL RESERVATION
router.patch("/:id/cancel", authMiddleware, async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found"
      });
    }

    if (reservation.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending reservations can be cancelled"
      });
    }

    reservation.status = "Cancelled";
    await reservation.save();

    res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
      reservation
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to cancel reservation",
      error: error.message
    });
  }
});

module.exports = router;
