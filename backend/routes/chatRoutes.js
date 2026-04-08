// backend/routes/chat.js

import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import { updateProgress } from "../utils/progress.js";
import { detectEmotion } from "../utils/emotion.js";
import { detectSeverity } from "../utils/severity.js";
import { buildPersonalityPrompt } from "../utils/personalityEngine.js";
import { updateMemory } from "../utils/memory.js";
import { analyzeThought } from "../utils/cbtEngine.js";
import { detectCrisis, getCrisisResponse } from "../utils/crisis.js";
import ChatSession from "../models/ChatSession.js";

dotenv.config();

const router = express.Router();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function buildPrompt({ therapyMode, modeInstruction, emotion, severity, analysis, memory, recentMemory, personalityPrompt }) {
  return `
You are an advanced AI therapist in a mental wellness app.

${personalityPrompt}

Therapy mode: ${therapyMode}
Mode instruction: ${modeInstruction}

Current emotional context:
- User emotion: ${emotion}
- Severity level: ${severity}
- Cognitive distortion: ${analysis.distortion}
- CBT insight: ${analysis.response}

User long-term concerns:
${memory.problems.join(", ")}

Recent short-term memory:
${recentMemory}

Core response rules:
- Adapt tone by severity:
  - LOW: calm and supportive
  - MEDIUM: deeper empathy, slightly more structured guidance
  - HIGH: extra-safe, grounding-focused, short clear steps
- Keep response concise (4-8 lines max)
- Avoid generic therapist cliches and repetition
- Give one practical next step
- Ask exactly one meaningful follow-up question
`;
}

function getModeInstruction(therapyMode) {
  if (therapyMode === "cbt") {
    return "Use CBT techniques to challenge and reframe negative thoughts logically.";
  }
  if (therapyMode === "motivational") {
    return "Encourage the user, highlight strengths, and inspire confidence.";
  }
  if (therapyMode === "deep") {
    return "Explore emotions deeply and ask reflective, meaningful questions.";
  }
  return "Provide balanced therapeutic support with emotional safety.";
}

router.post("/", async (req, res) => {
  const {
    message,
    userId = "demo-user",
    personalityType = "INFP",
    personality = "",
    therapyMode = "cbt",
    sessionId = "",
    currentMood = 0,
  } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message required" });
  }

  // 🚨 Crisis detection
  const isCrisis = detectCrisis(message);
  if (isCrisis) {
    return res.json({
      reply: getCrisisResponse()
    });
  }

  try {
    const emotion = detectEmotion(message);
    const severity = detectSeverity(message);
    const effectivePersonality = (personality || personalityType || "INFP").toUpperCase();
    const personalityPrompt = buildPersonalityPrompt(effectivePersonality);

    const memory = await updateMemory(userId, message, emotion);
    const recentMemory = memory.messages.slice(-3).join(", ");

    const analysis = analyzeThought(message);

    const modeInstruction = getModeInstruction(therapyMode);
    const moodLine =
      Number(currentMood) >= 1 && Number(currentMood) <= 5
        ? `User self-reported mood today: ${Number(currentMood)}/5 (1=down, 3=peaceful, 5=excited)`
        : "";

    const prompt = buildPrompt({
      therapyMode,
      modeInstruction,
      emotion,
      severity,
      analysis,
      memory,
      recentMemory,
      personalityPrompt: `${personalityPrompt}\n${moodLine ? `\n${moodLine}\n` : ""}`,
    });

    const clientSessionId = sessionId || `session:${Date.now()}`;

    // Persist user message for chat history.
    await ChatSession.findOneAndUpdate(
      { userId: String(userId), clientSessionId: String(clientSessionId) },
      {
        $setOnInsert: {
          userId: String(userId),
          clientSessionId: String(clientSessionId),
          title: "New reflection",
          therapyMode,
          personalityType: effectivePersonality,
        },
        $push: { messages: { role: "user", text: message } },
      },
      { upsert: true, new: true }
    );

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.85,
      top_p: 0.95,
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    await ChatSession.findOneAndUpdate(
      { userId: String(userId), clientSessionId: String(clientSessionId) },
      { $push: { messages: { role: "ai", text: reply } } }
    );

    // 📊 Update progress
    await updateProgress(userId, emotion, severity);

    res.json({
      reply,
      meta: {
        emotion,
        severity,
        personalityType: effectivePersonality,
        sessionId: clientSessionId,
      },
    });

  } catch (error) {
    console.error("Groq Error:", error);

    res.json({
      reply: "I'm here for you. Can you tell me more about what's troubling you?"
    });
  }
});

router.post("/stream", async (req, res) => {
  const {
    message,
    userId = "demo-user",
    personalityType = "INFP",
    personality = "",
    therapyMode = "cbt",
    sessionId = "",
    currentMood = 0,
  } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message required" });
  }

  const isCrisis = detectCrisis(message);
  if (isCrisis) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();
    res.write(`data: ${JSON.stringify({ type: "chunk", content: getCrisisResponse() })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    return res.end();
  }

  let isClientClosed = false;
  req.on("close", () => {
    isClientClosed = true;
  });

  const clientSessionId = sessionId || `session:${Date.now()}`;

  try {
    const emotion = detectEmotion(message);
    const severity = detectSeverity(message);
    const effectivePersonality = (personality || personalityType || "INFP").toUpperCase();
    const personalityPrompt = buildPersonalityPrompt(effectivePersonality);
    const memory = await updateMemory(userId, message, emotion);
    const recentMemory = memory.messages.slice(-3).join(", ");
    const analysis = analyzeThought(message);
    const modeInstruction = getModeInstruction(therapyMode);
    const moodLine =
      Number(currentMood) >= 1 && Number(currentMood) <= 5
        ? `User self-reported mood today: ${Number(currentMood)}/5 (1=down, 3=peaceful, 5=excited)`
        : "";
    const prompt = buildPrompt({
      therapyMode,
      modeInstruction,
      emotion,
      severity,
      analysis,
      memory,
      recentMemory,
      personalityPrompt: `${personalityPrompt}\n${moodLine ? `\n${moodLine}\n` : ""}`,
    });

    // Persist user message as soon as possible (before streaming finishes).
    // If the session doesn't exist yet, create it.
    await ChatSession.findOneAndUpdate(
      { userId: String(userId), clientSessionId: String(clientSessionId) },
      {
        $setOnInsert: {
          userId: String(userId),
          clientSessionId: String(clientSessionId),
          title: "New reflection",
          therapyMode,
          personalityType: effectivePersonality,
        },
        $push: { messages: { role: "user", text: message } },
      },
      { upsert: true, new: true }
    );

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders?.();

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      temperature: 0.85,
      top_p: 0.95,
      stream: true,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message },
      ],
    });

    let fullReply = "";

    for await (const chunk of completion) {
      if (isClientClosed) break;
      const token = chunk?.choices?.[0]?.delta?.content || "";
      if (!token) continue;
      fullReply += token;
      res.write(`data: ${JSON.stringify({ type: "chunk", content: token })}\n\n`);
    }

    if (!isClientClosed) {
      await ChatSession.findOneAndUpdate(
        { userId: String(userId), clientSessionId: String(clientSessionId) },
        {
          $push: { messages: { role: "ai", text: fullReply } },
        }
      );

      await updateProgress(userId, emotion, severity);
      res.write(
        `data: ${JSON.stringify({
          type: "done",
          meta: { emotion, severity, personalityType: effectivePersonality },
          reply: fullReply,
          sessionId: clientSessionId,
        })}\n\n`
      );
    }

    res.end();
  } catch (error) {
    console.error("Groq Stream Error:", error);
    res.write(`data: ${JSON.stringify({
      type: "error",
      message: "I'm here for you. Can you tell me more about what's troubling you?"
    })}\n\n`);
    res.end();
  }
});

router.get("/sessions", async (req, res) => {
  try {
    const { userId = "" } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const sessions = await ChatSession.find({ userId: String(userId) })
      .sort({ updatedAt: -1 })
      .select("clientSessionId title updatedAt therapyMode personalityType messages")
      .lean();

    res.json({
      sessions: sessions.map((s) => ({
        id: s.clientSessionId,
        title: s.title,
        updatedAt: s.updatedAt,
        messages: s.messages?.map((m) => ({ role: m.role, text: m.text })) || [],
      })),
    });
  } catch (err) {
    console.error("Fetch sessions error:", err);
    res.status(500).json({ error: "Failed to load sessions" });
  }
});

router.put("/sessions/rename", async (req, res) => {
  try {
    const { userId = "", sessionId = "", title = "" } = req.body;
    if (!userId || !sessionId || !title) {
      return res.status(400).json({ error: "userId, sessionId, title are required" });
    }

    const updated = await ChatSession.findOneAndUpdate(
      { userId: String(userId), clientSessionId: String(sessionId) },
      { title: String(title) },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Session not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("Rename session error:", err);
    res.status(500).json({ error: "Failed to rename session" });
  }
});

router.delete("/sessions/:sessionId", async (req, res) => {
  try {
    const { userId = "" } = req.query;
    const { sessionId = "" } = req.params;
    if (!userId || !sessionId) {
      return res.status(400).json({ error: "userId query param and sessionId are required" });
    }

    const result = await ChatSession.deleteOne({
      userId: String(userId),
      clientSessionId: String(sessionId),
    });

    res.json({ ok: result.deletedCount > 0 });
  } catch (err) {
    console.error("Delete session error:", err);
    res.status(500).json({ error: "Failed to delete session" });
  }
});

export default router;