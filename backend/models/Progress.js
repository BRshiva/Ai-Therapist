// backend/models/Progress.js

import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  // Timestamped emotion/severity history for charts.
  // (We keep the older arrays for backward compatibility.)
  entries: [
    {
      emotion: { type: String, default: "neutral" },
      severity: { type: String, default: "low" },
      recordedAt: { type: Date, default: Date.now },
    },
  ],
  emotions: [String],
  severity: [String],
}, { timestamps: true });

export default mongoose.model("Progress", progressSchema);