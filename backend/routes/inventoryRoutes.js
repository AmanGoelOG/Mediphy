
const express = require("express");
const Inventory = require("../models/Inventory");

const router = express.Router();

// GET ALL INVENTORY
router.get("/", async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate("medicineId")
      .populate("pharmacyId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: inventory.length,
      inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      error: error.message
    });
  }
});

// GET INVENTORY FOR A PARTICULAR MEDICINE
router.get("/medicine/:medicineId", async (req, res) => {
  try {
    const inventory = await Inventory.find({
      medicineId: req.params.medicineId
    })
      .populate("medicineId")
      .populate("pharmacyId")
      .sort({ price: 1 });

    res.status(200).json({
      success: true,
      count: inventory.length,
      inventory
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid medicine ID",
      error: error.message
    });
  }
});

// ADD INVENTORY
router.post("/", async (req, res) => {
  try {
    const { medicineId, pharmacyId, price, quantity } = req.body;

    if (
      !medicineId ||
      !pharmacyId ||
      price === undefined ||
      quantity === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All inventory fields are required"
      });
    }

    if (
      !Number.isFinite(price) ||
      !Number.isInteger(quantity) ||
      price < 0 ||
      quantity < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid price and whole-number quantity"
      });
    }

    const existingInventory = await Inventory.findOne({
      medicineId,
      pharmacyId
    });

    if (existingInventory) {
      return res.status(409).json({
        success: false,
        message: "Inventory already exists for this medicine and pharmacy"
      });
    }

    const inventory = await Inventory.create({
      medicineId,
      pharmacyId,
      price,
      quantity
    });

    res.status(201).json({
      success: true,
      message: "Inventory added successfully",
      inventory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add inventory",
      error: error.message
    });
  }
});

// UPDATE INVENTORY PRICE AND QUANTITY
router.patch("/:id", async (req, res) => {
  try {
    const { price, quantity } = req.body;

    if (price === undefined && quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide price or quantity to update"
      });
    }

    if (
      (price !== undefined &&
        (!Number.isFinite(price) || price < 0)) ||
      (quantity !== undefined &&
        (!Number.isInteger(quantity) || quantity < 0))
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid price and whole-number quantity"
      });
    }

    const updates = {};

    if (price !== undefined) updates.price = price;
    if (quantity !== undefined) updates.quantity = quantity;

    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,
        runValidators: true
      }
    );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      inventory
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update inventory",
      error: error.message
    });
  }
});

module.exports = router;
