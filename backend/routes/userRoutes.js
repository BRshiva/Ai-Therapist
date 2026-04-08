import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Save or get user
router.post("/", async (req, res) => {
  const { firebaseId, name, email, photo, personalityType = "INFP" } = req.body;

  let user = await User.findOne({ firebaseId });

  if (!user) {
    user = await User.create({
      firebaseId,
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
    const { firebaseId, personalityType } = req.body;

    if (!firebaseId || !personalityType) {
      return res.status(400).json({ error: "firebaseId and personalityType are required" });
    }

    const user = await User.findOneAndUpdate(
      { firebaseId },
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