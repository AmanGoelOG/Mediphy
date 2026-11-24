
const express = require("express");
const Medicine = require("../models/Medicine");

const router = express.Router();

// GET ALL MEDICINES / SEARCH MEDICINES
router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }

    if (category) {
      filter.category = {
        $regex: `^${category}$`,
        $options: "i"
      };
    }

    const medicines = await Medicine.find(filter).sort({
      name: 1
    });

    res.status(200).json({
      success: true,
      count: medicines.length,
      medicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch medicines",
      error: error.message
    });
  }
});

// GET MEDICINE BY ID
router.get("/:id", async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found"
      });
    }

    res.status(200).json({
      success: true,
      medicine
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid medicine ID"
    });
  }
});

// ADD MEDICINE
router.post("/", async (req, res) => {
  try {
    const { name, category, description, manufacturer, image } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Medicine name is required"
      });
    }

    const medicine = await Medicine.create({
      name,
      category,
      description,
      manufacturer,
      image
    });

    res.status(201).json({
      success: true,
      message: "Medicine added successfully",
      medicine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add medicine",
      error: error.message
    });
  }
});

module.exports = router;
