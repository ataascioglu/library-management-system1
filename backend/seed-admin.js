// backend/seed-admin.js
import mongoose from "mongoose";
import User from "./models/User.js";
import { MONGO_URI } from "./config.js";

async function createAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      process.exit(0);
    }

    // Create admin user
    const adminUser = await User.create({
      name: "System Admin",
      email: "admin@library.com",
      password: "admin123", // Change this!
      role: "admin"
    });

    console.log("Admin user created successfully!");
    console.log("Email: admin@library.com");
    console.log("Password: admin123");
    console.log("⚠️  Please change the password after first login!");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
}

createAdmin();