import express from "express";
import dotenv from "dotenv";
import Groq from "groq-sdk";

import { detectEmotion } from "../utils/emotion.js";
import { detectSeverity } from "../utils/severity.js";
import { getPersonalityStyle } from "../utils/personalityEngine.js";
import { updateMemory } from "../utils/memory.js";
import { analyzeThought } from "../utils/cbtEngine.js";

dotenv.config();

const router = express.Router();

// 🔑 Groq setup
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// 💬 CHAT ROUTE
router.post("/", async (req, res) => {
  const {
    message,
    userId = "demo-user",
    personalityType = "INFP",
    therapyMode = "cbt"
  } = req.body;

  // 🛑 Validate input
  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message required" });
  }

  try {
    // 🧠 Emotion
    const emotion = detectEmotion(message);

    // 🧠 Severity
    const severity = detectSeverity(message);

    // 🧠 Personality
    const personalityStyle = getPersonalityStyle(personalityType);

    // 🧠 Memory
    const memory = await updateMemory(userId, message, emotion);
    const recentMemory = memory.messages.slice(-3).join(", ");

    // 🧠 CBT Analysis
    const analysis = analyzeThought(message);

    // 🧠 Therapy Mode Logic
    let modeInstruction = "";

    if (therapyMode === "cbt") {
      modeInstruction = "Use CBT techniques to challenge and reframe negative thoughts logically.";
    } else if (therapyMode === "motivational") {
      modeInstruction = "Encourage the user, highlight strengths, and inspire confidence.";
    } else if (therapyMode === "deep") {
      modeInstruction = "Explore emotions deeply and ask reflective, meaningful questions.";
    }

    // 🧠 FINAL PROMPT
    const prompt = `
You are an advanced AI therapist.

Personality style: ${personalityStyle}

Therapy mode: ${therapyMode}
Instruction: ${modeInstruction}

User emotion: ${emotion}
Severity level: ${severity}

Detected cognitive distortion: ${analysis.distortion}
Therapist insight: ${analysis.response}

User past concerns:
${memory.problems.join(", ")}

Recent conversation:
${recentMemory}

User message: ${message}

Instructions:
- Adapt tone based on severity:
  - LOW → normal support
  - MEDIUM → deeper empathy
  - HIGH → very careful, grounding, supportive
- Be natural and human-like
- Help reframe negative thinking
- Ask ONE meaningful follow-up question
`;

    // 🤖 GROQ AI CALL (FIXED MODEL)
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
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

    res.json({ reply });

  } catch (error) {
    console.error("🔥 Groq Error:", error);

    res.json({
      reply: "I'm here for you. Can you tell me more about what's troubling you?"
    });
  }
});

export default router;