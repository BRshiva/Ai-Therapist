import express from "express";
import ChatSession from "../models/ChatSession.js";

const router = express.Router();

// Get all sessions for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const sessions = await ChatSession.find({ userId: String(userId) })
      .sort({ updatedAt: -1 })
      .select("clientSessionId title updatedAt therapyMode personalityType messages")
      .lean();

    // Transform to match frontend expectations
    const transformedSessions = sessions.map((s) => ({
      _id: s.clientSessionId,
      sessionName: s.title,
      createdAt: s.updatedAt,
      therapyMode: s.therapyMode,
      personalityType: s.personalityType,
    }));

    res.json(transformedSessions);
  } catch (err) {
    console.error("Fetch sessions error:", err);
    res.status(500).json({ error: "Failed to load sessions" });
  }
});

// Create a new session
router.post("/", async (req, res) => {
  try {
    const { userId, sessionName = "New Session" } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const clientSessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const session = await ChatSession.create({
      userId: String(userId),
      clientSessionId: String(clientSessionId),
      title: sessionName,
      therapyMode: "cbt",
      personalityType: "INFP",
    });

    // Transform to match frontend expectations
    const transformedSession = {
      _id: session.clientSessionId,
      sessionName: session.title,
      createdAt: session.updatedAt,
      therapyMode: session.therapyMode,
      personalityType: session.personalityType,
    };

    res.status(201).json(transformedSession);
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

// Rename a session
router.put("/:sessionId/rename", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { sessionName } = req.body;
    
    if (!sessionId || !sessionName) {
      return res.status(400).json({ error: "sessionId and sessionName are required" });
    }

    const updated = await ChatSession.findOneAndUpdate(
      { clientSessionId: String(sessionId) },
      { title: String(sessionName) },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Session not found" });

    // Transform to match frontend expectations
    const transformedSession = {
      _id: updated.clientSessionId,
      sessionName: updated.title,
      createdAt: updated.updatedAt,
      therapyMode: updated.therapyMode,
      personalityType: updated.personalityType,
    };

    res.json(transformedSession);
  } catch (err) {
    console.error("Rename session error:", err);
    res.status(500).json({ error: "Failed to rename session" });
  }
});

// Delete a session
router.delete("/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const result = await ChatSession.deleteOne({
      clientSessionId: String(sessionId),
    });

    res.json({ ok: result.deletedCount > 0 });
  } catch (err) {
    console.error("Delete session error:", err);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

export default router;
