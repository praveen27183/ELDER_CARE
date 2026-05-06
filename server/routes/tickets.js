import express from "express";
import Ticket from "../models/Ticket.js";

const router = express.Router();

/**
 * @route   GET /api/tickets
 */
router.get("/", async (req, res) => {
    try {
        const tickets = await Ticket.find().sort({ createdAt: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @route   PATCH /api/tickets/:id/resolve
 */
router.patch("/:id/resolve", async (req, res) => {
    try {
        const ticket = await Ticket.findByIdAndUpdate(
            req.params.id,
            { status: "Resolved" },
            { new: true }
        );
        res.json(ticket);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
