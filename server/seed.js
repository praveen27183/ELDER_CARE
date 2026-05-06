// seed.js

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });
import dns from "dns";

// Change DNS
dns.setServers(["1.1.1.1", "8.8.8.8"]);

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// Example Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
});

const User = mongoose.model("User", userSchema);

// Seed Data
const seedData = async () => {
  try {
    await User.deleteMany();

    await User.insertMany([
      {
        name: "Praveen Raj",
        email: "praveen@gmail.com",
        age: 22,
      },
      {
        name: "Kishore",
        email: "kishore@gmail.com",
        age: 23,
      },
      {
        name: "Rahul",
        email: "rahul@gmail.com",
        age: 24,
      },
    ]);

    console.log("✅ Data Seeded Successfully");
    process.exit();
  } catch (error) {
    console.log("❌ Seed Error:", error);
    process.exit(1);
  }
};

seedData();