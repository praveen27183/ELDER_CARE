import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, phone, age, address } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      phone,
      age,
      address,
    });

    await user.save();

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`🔐 Login attempt for: ${email}`);

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log(`❌ User not found: ${email}`);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get user profile
 */
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 */
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.phone = req.body.phone || user.phone;
      
      // Role-specific fields
      if (user.role === "elder") {
        user.bloodGroup = req.body.bloodGroup || user.bloodGroup;
        user.familyContact = req.body.familyContact || user.familyContact;
      } else if (user.role === "volunteer") {
        if (req.body.skills) {
          user.skills = req.body.skills;
        }
      }

      const updatedUser = await user.save();

      res.json({
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          role: updatedUser.role,
          bloodGroup: updatedUser.bloodGroup,
          familyContact: updatedUser.familyContact,
          skills: updatedUser.skills
        }
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
