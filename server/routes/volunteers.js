import express from "express";
import Volunteer from "../models/Volunteer.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * @route   GET /api/volunteers
 */
router.get("/", async (req, res) => {
    try {
        const volunteers = await Volunteer.find().sort({ createdAt: -1 });
        res.json(volunteers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @route   GET /api/volunteers/by-email/:email
 */
router.get("/by-email/:email", async (req, res) => {
    try {
        const volunteer = await Volunteer.findOne({ email: req.params.email });
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
        res.json(volunteer);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @route   POST /api/volunteers
 */
router.post("/", async (req, res) => {
    try {
        const volunteer = new Volunteer(req.body);
        const savedVolunteer = await volunteer.save();
        res.status(201).json(savedVolunteer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @route   PATCH /api/volunteers/:id/update-request
 * @desc    Submit a profile update request
 */
router.patch("/:id/update-request", async (req, res) => {
    try {
        const volunteer = await Volunteer.findByIdAndUpdate(
            req.params.id,
            { pendingUpdate: req.body },
            { new: true }
        );
        res.json(volunteer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @route   PATCH /api/volunteers/:id/approve-update
 * @desc    Approve and apply profile updates
 */
router.patch("/:id/approve-update", async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.params.id);
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });

        const updates = volunteer.pendingUpdate;
        if (!updates) return res.status(400).json({ message: "No pending updates found" });

        // Apply updates to Volunteer model
        Object.assign(volunteer, updates);
        volunteer.pendingUpdate = null;
        await volunteer.save();

        // Sync with User model if applicable (finding by email)
        const user = await User.findOne({ email: volunteer.email });
        if (user) {
            if (updates.name) {
                const names = updates.name.split(' ');
                user.firstName = names[0];
                user.lastName = names.slice(1).join(' ');
            }
            if (updates.phone) user.phone = updates.phone;
            if (updates.location) {
                if (!user.address) user.address = {};
                user.address.city = updates.location;
            }
            // Add other field syncs if needed
            await user.save();
        }

        res.json(volunteer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @route   PATCH /api/volunteers/:id/reject-update
 * @desc    Reject and clear profile updates
 */
router.patch("/:id/reject-update", async (req, res) => {
    try {
        const volunteer = await Volunteer.findByIdAndUpdate(
            req.params.id,
            { pendingUpdate: null },
            { new: true }
        );
        res.json(volunteer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * @route   PATCH /api/volunteers/:id
 */
router.patch("/:id", async (req, res) => {
    try {
        const volunteer = await Volunteer.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json(volunteer);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
