import Memory from "../models/Memory.js";

const MAX_MESSAGES = 60;
const MAX_PROBLEMS = 30;

export async function getMemory(userId) {
  const safeUserId = String(userId || "demo-user");
  let doc = await Memory.findOne({ userId: safeUserId });

  if (!doc) {
    doc = await Memory.create({
      userId: safeUserId,
      messages: [],
      problems: [],
    });
  }

  return doc;
}

export async function updateMemory(userId, message, emotion) {
  const memory = await getMemory(userId);

  memory.messages.push(message);
  if (emotion === "sad" || emotion === "anxious") {
    memory.problems.push(message);
  }

  // Keep document size manageable.
  if (memory.messages.length > MAX_MESSAGES) {
    memory.messages = memory.messages.slice(-MAX_MESSAGES);
  }
  if (memory.problems.length > MAX_PROBLEMS) {
    memory.problems = memory.problems.slice(-MAX_PROBLEMS);
  }

  await memory.save();
  return memory;
}