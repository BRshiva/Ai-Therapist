import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { randomUUID } from "crypto";

import userRoutes from "./routes/userRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import journalRoutes from "./routes/journalRoutes.js";
import progressRoutes from "./routes/progressRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";

dotenv.config();

const app = express(); // ✅ MUST BE BEFORE app.use
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS not allowed for this origin"));
  },
}));

// Basic security headers (dependency-free).
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "microphone=(), geolocation=()");
  next();
});

// Correlation ID + simple logging.
app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader("X-Request-Id", req.id);
  console.log(`[${req.id}] ${req.method} ${req.originalUrl}`);
  next();
});

// Very small in-memory rate limiting for non-stream endpoints.
const rateMap = new Map();
const WINDOW_MS = 15 * 60 * 1000; // 15 min
const MAX_REQ = 200; // soft limit per IP per window

app.use((req, res, next) => {
  const originalUrl = req.originalUrl || "";
  if (originalUrl.includes("/api/chat/stream")) return next();

  const key = req.ip || "unknown";
  const now = Date.now();
  const entry = rateMap.get(key);

  if (!entry) {
    rateMap.set(key, { count: 1, start: now });
    return next();
  }

  if (now - entry.start > WINDOW_MS) {
    rateMap.set(key, { count: 1, start: now });
    return next();
  }

  entry.count += 1;
  if (entry.count > MAX_REQ) {
    return res.status(429).json({ error: "Rate limit exceeded. Please try again shortly." });
  }

  rateMap.set(key, entry);
  return next();
});

app.use(express.json());

// ✅ Health check route — fixes "Cannot GET /" on Render
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "AI Therapist API is running 🧠",
    version: "1.0.0",
  });
});

// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/journal", journalRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/sessions", sessionRoutes);

// MongoDB connect — server starts even if DB is temporarily unavailable
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI environment variable is not set!");
  console.error("Please set MONGO_URI in your Render environment variables.");
  console.error("Get a free MongoDB Atlas URI from https://www.mongodb.com/cloud/atlas");
} else {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err.message);
      console.error("The server will continue running but DB operations will fail.");
    });
}

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});