import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    // Free-form past user messages used for long-term context.
    messages: { type: [String], default: [] },
    // A lightweight "problem" list derived from emotional signals.
    problems: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("Memory", memorySchema);

