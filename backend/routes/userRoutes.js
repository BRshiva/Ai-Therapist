import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Save or get user
router.post("/", async (req, res) => {
  // Support both userId and firebaseId for backward compatibility
  const { userId, firebaseId, name, email, photo, personalityType = "INFP" } = req.body;
  const effectiveUserId = userId || firebaseId;

  if (!effectiveUserId) {
    return res.status(400).json({ error: "userId or firebaseId is required" });
  }

  let user = await User.findOne({ userId: effectiveUserId });

  if (!user) {
    user = await User.create({
      userId: effectiveUserId,
      name,
      email,
      photo,
      personalityType,
    });
  }

  res.json(user);
});

router.put("/personality", async (req, res) => {
  try {
    const { userId, personalityType } = req.body;

    if (!userId || !personalityType) {
      return res.status(400).json({ error: "userId and personalityType are required" });
    }

    const user = await User.findOneAndUpdate(
      { userId },
      { personalityType: String(personalityType).toUpperCase() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Failed to update personality:", error);
    res.status(500).json({ error: "Failed to update personality" });
  }
});

export default router;