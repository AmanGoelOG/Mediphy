
const express = require("express");
const Pharmacy = require("../models/Pharmacy");

const router = express.Router();

// GET ALL PHARMACIES / SEARCH PHARMACIES
router.get("/", async (req, res) => {
  try {
    const { search, city } = req.query;

    const filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: "i"
      };
    }

    if (city) {
      filter.city = {
        $regex: city,
        $options: "i"
      };
    }

    const pharmacies = await Pharmacy.find(filter).sort({
      name: 1
    });

    res.status(200).json({
      success: true,
      count: pharmacies.length,
      pharmacies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch pharmacies",
      error: error.message
    });
  }
});

// GET PHARMACY BY ID
router.get("/:id", async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy not found"
      });
    }

    res.status(200).json({
      success: true,
      pharmacy
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid pharmacy ID"
    });
  }
});

// ADD PHARMACY
router.post("/", async (req, res) => {
  try {
    const {
      name,
      address,
      city,
      phone,
      latitude,
      longitude,
      openingHours
    } = req.body;

    if (!name || !address) {
      return res.status(400).json({
        success: false,
        message: "Pharmacy name and address are required"
      });
    }

    const pharmacy = await Pharmacy.create({
      name,
      address,
      city,
      phone,
      latitude,
      longitude,
      openingHours
    });

    res.status(201).json({
      success: true,
      message: "Pharmacy added successfully",
      pharmacy
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add pharmacy",
      error: error.message
    });
  }
});

module.exports = router;
