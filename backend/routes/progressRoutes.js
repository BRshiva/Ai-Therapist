import express from "express";
import { getProgress } from "../utils/progress.js";

const router = express.Router();

router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const progress = await getProgress(userId);
    res.json(progress);
  } catch (err) {
    console.error("Get progress error:", err);
    res.status(500).json({ error: "Failed to load progress" });
  }
});

export default router;
