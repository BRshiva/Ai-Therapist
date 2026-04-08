import express from "express";
import JournalEntry from "../models/JournalEntry.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { text, userId } = req.body;
  const safeUserId = userId || "demo-user";

  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: "text is required" });
  }

  JournalEntry.create({
    userId: safeUserId,
    text: String(text).trim(),
  })
    .then((entry) => {
      res.json({ message: "Saved", entry });
    })
    .catch((err) => {
      console.error("Journal create error:", err);
      res.status(500).json({ error: "Failed to save entry" });
    });
});

router.get("/:userId", (req, res) => {
  const { userId } = req.params;

  JournalEntry.find({ userId: String(userId) })
    .sort({ createdAt: -1 })
    .lean()
    .then((entries) => res.json(entries))
    .catch((err) => {
      console.error("Journal fetch error:", err);
      res.status(500).json({ error: "Failed to load entries" });
    });
});

export default router;