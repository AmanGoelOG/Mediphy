
const mongoose = require("mongoose");
require("dotenv").config();

const User = require("./models/User");

const createAdmin = async () => {
  try {
    if (!process.env.ADMIN_EMAIL) {
      throw new Error("Please provide ADMIN_EMAIL in your .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const email = process.env.ADMIN_EMAIL.trim().toLowerCase();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.role === "admin") {
        console.log("This account is already an Admin.");
      } else {
        existingUser.role = "admin";
        await existingUser.save();

        console.log("Existing account successfully promoted to Admin!");
      }

      console.log("Admin Email:", existingUser.email);
      console.log("Admin Role:", existingUser.role);

      return;
    }

    if (!process.env.ADMIN_NAME || !process.env.ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_NAME and ADMIN_PASSWORD are required to create a new Admin."
      );
    }

    const admin = await User.create({
      name: process.env.ADMIN_NAME.trim(),
      email,
      password: process.env.ADMIN_PASSWORD,
      role: "admin"
    });

    console.log("Admin account created successfully!");
    console.log("Admin Email:", admin.email);
    console.log("Admin Role:", admin.role);

  } catch (error) {
    console.error("Admin Setup Failed:", error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
