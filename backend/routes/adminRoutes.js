
const express = require("express");

const User = require("../models/User");
const Medicine = require("../models/Medicine");
const Pharmacy = require("../models/Pharmacy");
const Inventory = require("../models/Inventory");
const Reservation = require("../models/Reservation");

const {
  authMiddleware,
  adminMiddleware
} = require("../middleware/authMiddleware");

const router = express.Router();

// Every route in this file requires Admin access.
router.use(authMiddleware, adminMiddleware);

// =====================================
// 1. ADMIN DASHBOARD STATISTICS
// =====================================

router.get("/dashboard", async (req, res) => {
  try {
    const [
      totalUsers,
      totalMedicines,
      totalPharmacies,
      totalInventory,
      totalReservations,
      pendingReservations
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      Medicine.countDocuments(),
      Pharmacy.countDocuments(),
      Inventory.countDocuments(),
      Reservation.countDocuments(),
      Reservation.countDocuments({ status: "Pending" })
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        totalUsers,
        totalMedicines,
        totalPharmacies,
        totalInventory,
        totalReservations,
        pendingReservations
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load dashboard statistics."
    });
  }
});

// =====================================
// 2. MEDICINE MANAGEMENT
// =====================================

// Get all medicines
router.get("/medicines", async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      medicines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch medicines."
    });
  }
});

// Add medicine
router.post("/medicines", async (req, res) => {
  try {
    const { name, category, description, manufacturer, image } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Medicine name and category are required."
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
      message: "Medicine added successfully.",
      medicine
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to add medicine."
    });
  }
});

// Update medicine
router.put("/medicines/:id", async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Medicine updated successfully.",
      medicine
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to update medicine."
    });
  }
});

// Delete medicine
router.delete("/medicines/:id", async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found."
      });
    }

    await Inventory.deleteMany({ medicineId: medicine._id });
    await Medicine.findByIdAndDelete(medicine._id);

    res.status(200).json({
      success: true,
      message: "Medicine and its inventory records deleted."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete medicine."
    });
  }
});

// =====================================
// 3. PHARMACY MANAGEMENT
// =====================================

// Get all pharmacies
router.get("/pharmacies", async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      pharmacies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch pharmacies."
    });
  }
});

// Add pharmacy
router.post("/pharmacies", async (req, res) => {
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

    if (!name || !address || !city) {
      return res.status(400).json({
        success: false,
        message: "Pharmacy name, address and city are required."
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
      message: "Pharmacy added successfully.",
      pharmacy
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to add pharmacy."
    });
  }
});

// Update pharmacy
router.put("/pharmacies/:id", async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Pharmacy updated successfully.",
      pharmacy
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to update pharmacy."
    });
  }
});

// Delete pharmacy
router.delete("/pharmacies/:id", async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);

    if (!pharmacy) {
      return res.status(404).json({
        success: false,
        message: "Pharmacy not found."
      });
    }

    await Inventory.deleteMany({ pharmacyId: pharmacy._id });
    await Pharmacy.findByIdAndDelete(pharmacy._id);

    res.status(200).json({
      success: true,
      message: "Pharmacy and its inventory records deleted."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete pharmacy."
    });
  }
});

// =====================================
// 4. INVENTORY MANAGEMENT
// =====================================

// Get all inventory records
router.get("/inventory", async (req, res) => {
  try {
    const inventory = await Inventory.find()
      .populate("medicineId", "name category")
      .populate("pharmacyId", "name address city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      inventory
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch inventory."
    });
  }
});

// Add inventory record
router.post("/inventory", async (req, res) => {
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
        message: "Medicine, pharmacy, price and quantity are required."
      });
    }

    if (Number(price) < 0 || Number(quantity) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price and quantity cannot be negative."
      });
    }

    const medicine = await Medicine.findById(medicineId);
    const pharmacy = await Pharmacy.findById(pharmacyId);

    if (!medicine || !pharmacy) {
      return res.status(404).json({
        success: false,
        message: "Medicine or pharmacy not found."
      });
    }

    const existingRecord = await Inventory.findOne({
      medicineId,
      pharmacyId
    });

    if (existingRecord) {
      return res.status(409).json({
        success: false,
        message: "This medicine already has an inventory record for this pharmacy. Update the existing record instead."
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
      message: "Inventory record added successfully.",
      inventory
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to add inventory record."
    });
  }
});

// Update inventory price and quantity
router.put("/inventory/:id", async (req, res) => {
  try {
    const { price, quantity } = req.body;

    if (price === undefined || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Price and quantity are required."
      });
    }

    if (Number(price) < 0 || Number(quantity) < 0) {
      return res.status(400).json({
        success: false,
        message: "Price and quantity cannot be negative."
      });
    }

    const inventory = await Inventory.findByIdAndUpdate(
      req.params.id,
      {
        price,
        quantity
      },
      {
        new: true,
        runValidators: true
      }
    )
      .populate("medicineId", "name")
      .populate("pharmacyId", "name");

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Inventory updated successfully.",
      inventory
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to update inventory."
    });
  }
});

// Delete inventory record
router.delete("/inventory/:id", async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory record not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Inventory record deleted successfully."
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to delete inventory record."
    });
  }
});

// =====================================
// 5. RESERVATION MANAGEMENT
// =====================================

// Get all reservations
router.get("/reservations", async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("userId", "name email")
      .populate("medicineId", "name category")
      .populate("pharmacyId", "name address city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reservations
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch reservations."
    });
  }
});

// Update reservation status
router.patch("/reservations/:id/status", async (req, res) => {
  try {
    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Ready for Pickup",
      "Collected",
      "Cancelled"
    ];

    const { status } = req.body;

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reservation status."
      });
    }

    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Reservation status updated successfully.",
      reservation
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Unable to update reservation status."
    });
  }
});

// =====================================
// 6. USER MANAGEMENT
// =====================================

// View all registered users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select("name email role createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch users."
    });
  }
});

module.exports = router;
