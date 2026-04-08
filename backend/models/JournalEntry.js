import mongoose from "mongoose";

const journalEntrySchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    text: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("JournalEntry", journalEntrySchema);

