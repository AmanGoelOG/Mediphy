
const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      trim: true,
      default: "General"
    },
    description: {
      type: String,
      default: ""
    },
    manufacturer: {
      type: String,
      default: ""
    },
    image: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Medicine", medicineSchema);
