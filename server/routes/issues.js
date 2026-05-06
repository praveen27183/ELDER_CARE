import express from "express";
import Issue from "../models/Issue.js";

const router = express.Router();

/**
 * @route   GET /api/issues
 */
router.get("/", async (req, res) => {
    try {
        const issues = await Issue.find().sort({ createdAt: -1 });
        res.json(issues);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @route   PATCH /api/issues/:id/resolve
 */
router.patch("/:id/resolve", async (req, res) => {
    try {
        const issue = await Issue.findByIdAndUpdate(
            req.params.id,
            { status: "Resolved" },
            { new: true }
        );
        res.json(issue);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;
