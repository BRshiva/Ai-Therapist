import mongoose from "mongoose";

const chatMessageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "ai"],
      required: true,
    },
    text: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const chatSessionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    clientSessionId: { type: String, required: true, index: true },
    title: { type: String, default: "New reflection" },
    therapyMode: { type: String, default: "cbt" },
    personalityType: { type: String, default: "INFP" },
    messages: [chatMessageSchema],
  },
  { timestamps: true }
);

chatSessionSchema.index({ userId: 1, clientSessionId: 1 }, { unique: true });

export default mongoose.model("ChatSession", chatSessionSchema);

