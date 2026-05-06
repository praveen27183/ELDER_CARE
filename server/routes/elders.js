import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/all", async (req, res) => {
    try {
        const elders = await User.find({ role: "elder" });
        res.json(elders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @route   GET /api/elders/profile
 */
router.get("/profile", async (req, res) => {
    try {
        // For now, we'll return the first elder in the DB
        // In production, this would use req.user.id from JWT
        const elder = await User.findOne({ role: "elder" });
        if (!elder) {
            return res.status(404).json({ message: "Elder profile not found" });
        }
        res.json({ elder });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @route   GET /api/elders/bookings
 */
router.get("/bookings", async (req, res) => {
    try {
        // Mocking sample bookings that match the frontend interface
        const bookings = [
            { 
                id: "1", 
                serviceType: "medical", 
                title: "Doctor Appointment Escort", 
                status: "accepted", 
                scheduledDate: new Date(Date.now() + 86400000).toISOString() 
            },
            { 
                id: "2", 
                serviceType: "grocery", 
                title: "Weekly Grocery Run", 
                status: "completed", 
                scheduledDate: new Date(Date.now() - 86400000).toISOString() 
            }
        ];
        res.json({ bookings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @route   GET /api/elders/stats
 */
router.get("/stats", async (req, res) => {
    try {
        res.json({
            totalBookings: 12,
            completedBookings: 8,
            pendingBookings: 4
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @route   PATCH /api/elders/membership
 */
router.patch("/membership", async (req, res) => {
    try {
        const { plan, userId } = req.body;
        
        let durationDays = 0;
        if (plan === 'Monthly') durationDays = 30;
        if (plan === '6 Months') durationDays = 180;

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + durationDays);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                membership: {
                    plan,
                    status: 'active',
                    startDate: new Date(),
                    expiryDate
                }
            },
            { new: true }
        );

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
